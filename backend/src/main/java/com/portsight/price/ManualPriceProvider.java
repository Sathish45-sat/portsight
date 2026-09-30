package com.portsight.price;

import com.portsight.entity.Asset;
import com.portsight.repository.AssetRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class ManualPriceProvider implements PriceProvider {

    private final AssetRepository assetRepository;

    public ManualPriceProvider(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getCurrentPrice(Long assetId) {
        return assetRepository.findById(assetId)
                .map(Asset::getCurrentPrice)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found with id: " + assetId));
    }

    @Override
    @Transactional
    public void updatePrice(Long assetId, BigDecimal newPrice) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found with id: " + assetId));
        asset.setCurrentPrice(newPrice);
        assetRepository.save(asset);
    }
}
