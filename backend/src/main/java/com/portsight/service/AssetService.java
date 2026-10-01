package com.portsight.service;

import com.portsight.dto.request.AssetRequest;
import com.portsight.dto.request.PriceUpdateRequest;
import com.portsight.dto.response.AssetResponse;
import com.portsight.entity.Asset;
import com.portsight.entity.Portfolio;
import com.portsight.entity.User;
import com.portsight.exception.AssetNotFoundException;
import com.portsight.exception.DuplicateAssetException;
import com.portsight.exception.PortfolioNotOwnedException;
import com.portsight.mapper.AssetMapper;
import com.portsight.price.PriceProvider;
import com.portsight.repository.AssetRepository;
import com.portsight.repository.PortfolioRepository;
import com.portsight.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final PriceProvider priceProvider;
    private final AssetMapper assetMapper;

    public AssetService(AssetRepository assetRepository,
                        PortfolioRepository portfolioRepository,
                        UserRepository userRepository,
                        PriceProvider priceProvider,
                        AssetMapper assetMapper) {
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.priceProvider = priceProvider;
        this.assetMapper = assetMapper;
    }

    @Transactional
    public AssetResponse create(Long portfolioId, AssetRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Portfolio portfolio = getPortfolioOwnedByUser(portfolioId, user.getId());

        String normalizedSymbol = request.getSymbol().trim().toUpperCase();
        if (assetRepository.existsByPortfolioIdAndSymbol(portfolioId, normalizedSymbol)) {
            throw new DuplicateAssetException(
                    "Asset with symbol '" + normalizedSymbol + "' already exists in this portfolio"
            );
        }

        Asset asset = assetMapper.toEntity(request, portfolio);
        Asset saved = assetRepository.save(asset);

        return assetMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> getAllForPortfolio(Long portfolioId, String userEmail) {
        User user = getUserByEmail(userEmail);
        getPortfolioOwnedByUser(portfolioId, user.getId()); // Enforces ownership

        return assetRepository.findByPortfolioId(portfolioId)
                .stream()
                .map(assetMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AssetResponse getById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);

        Asset asset = assetRepository.findByIdAndPortfolio_User_Id(id, user.getId())
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + id));

        return assetMapper.toResponse(asset);
    }

    @Transactional
    public AssetResponse updatePrice(Long id, PriceUpdateRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        // Verify ownership through user id
        Asset asset = assetRepository.findByIdAndPortfolio_User_Id(id, user.getId())
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + id));

        // Delegate to PriceProvider seam (never touches currentPrice directly)
        priceProvider.updatePrice(id, request.getPrice());

        asset.setCurrentPrice(request.getPrice());
        return assetMapper.toResponse(asset);
    }

    /**
     * Deletes an asset. Note: cascades to all child transactions (ON DELETE CASCADE in schema).
     */
    @Transactional
    public void delete(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);

        Asset asset = assetRepository.findByIdAndPortfolio_User_Id(id, user.getId())
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + id));

        assetRepository.delete(asset);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private Portfolio getPortfolioOwnedByUser(Long portfolioId, Long userId) {
        return portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new PortfolioNotOwnedException("Portfolio not found with id: " + portfolioId));
    }
}
