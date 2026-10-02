package com.portsight.repository;

import com.portsight.entity.Transaction;
import com.portsight.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAssetIdOrderByTransactionDateDesc(Long assetId);

    List<Transaction> findByAssetId(Long assetId);

    boolean existsByAssetIdAndTransactionTypeAndQuantityAndPricePerUnitAndTransactionDate(
            Long assetId,
            TransactionType transactionType,
            BigDecimal quantity,
            BigDecimal pricePerUnit,
            LocalDateTime transactionDate
    );
}
