package com.portsight.service;

import com.portsight.dto.request.TransactionRequest;
import com.portsight.dto.response.TransactionResponse;
import com.portsight.entity.Asset;
import com.portsight.entity.Transaction;
import com.portsight.entity.TransactionType;
import com.portsight.entity.User;
import com.portsight.exception.AssetNotFoundException;
import com.portsight.exception.DuplicateTransactionException;
import com.portsight.exception.InsufficientHoldingsException;
import com.portsight.mapper.TransactionMapper;
import com.portsight.repository.AssetRepository;
import com.portsight.repository.TransactionRepository;
import com.portsight.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    public TransactionService(TransactionRepository transactionRepository,
                              AssetRepository assetRepository,
                              UserRepository userRepository,
                              TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
    }

    @Transactional
    public TransactionResponse recordTransaction(Long assetId, String userEmail, TransactionRequest request) {
        User user = getUserByEmail(userEmail);

        // Enforce ownership: asset must belong to a portfolio owned by this user
        Asset asset = assetRepository.findByIdAndPortfolio_User_Id(assetId, user.getId())
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + assetId));

        // 1. Validation for SELL transactions
        if (request.getTransactionType() == TransactionType.SELL) {
            if (request.getQuantity().compareTo(asset.getQuantityHeld()) > 0) {
                throw new InsufficientHoldingsException(
                        "Cannot sell more than current holdings. Currently held: "
                                + asset.getQuantityHeld() + ", requested to sell: " + request.getQuantity()
                );
            }
        }

        // 2. Prevent duplicate submissions
        boolean duplicate = transactionRepository.existsByAssetIdAndTransactionTypeAndQuantityAndPricePerUnitAndTransactionDate(
                asset.getId(),
                request.getTransactionType(),
                request.getQuantity(),
                request.getPricePerUnit(),
                request.getTransactionDate()
        );

        if (duplicate) {
            throw new DuplicateTransactionException("Duplicate transaction submission detected with identical parameters");
        }

        // 3. Save append-only transaction record
        Transaction transaction = transactionMapper.toEntity(request, asset);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 4. Update Asset holdings and weighted average price
        if (request.getTransactionType() == TransactionType.BUY) {
            BigDecimal oldQty = asset.getQuantityHeld();
            BigDecimal oldAvg = asset.getAvgBuyPrice();
            BigDecimal buyQty = request.getQuantity();
            BigDecimal buyPrice = request.getPricePerUnit();

            BigDecimal newQty = oldQty.add(buyQty);
            // newAvg = ((oldQty * oldAvg) + (buyQty * buyPrice)) / newQty
            BigDecimal totalOldCost = oldQty.multiply(oldAvg);
            BigDecimal totalNewCost = buyQty.multiply(buyPrice);
            BigDecimal totalCost = totalOldCost.add(totalNewCost);
            BigDecimal newAvg = totalCost.divide(newQty, 4, RoundingMode.HALF_UP);

            asset.setQuantityHeld(newQty);
            asset.setAvgBuyPrice(newAvg);
        } else {
            // SELL: avgBuyPrice stays identical; reduce quantity held
            BigDecimal newQty = asset.getQuantityHeld().subtract(request.getQuantity());
            asset.setQuantityHeld(newQty);
            if (newQty.compareTo(BigDecimal.ZERO) == 0) {
                asset.setAvgBuyPrice(BigDecimal.ZERO);
            }
        }

        assetRepository.save(asset);

        return transactionMapper.toResponse(savedTransaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsForAsset(Long assetId, String userEmail) {
        User user = getUserByEmail(userEmail);

        // Enforce ownership
        assetRepository.findByIdAndPortfolio_User_Id(assetId, user.getId())
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with id: " + assetId));

        return transactionRepository.findByAssetIdOrderByTransactionDateDesc(assetId)
                .stream()
                .map(transactionMapper::toResponse)
                .toList();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
