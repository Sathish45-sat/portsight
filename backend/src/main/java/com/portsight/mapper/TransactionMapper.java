package com.portsight.mapper;

import com.portsight.dto.request.TransactionRequest;
import com.portsight.dto.response.TransactionResponse;
import com.portsight.entity.Asset;
import com.portsight.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public Transaction toEntity(TransactionRequest request, Asset asset) {
        return Transaction.builder()
                .asset(asset)
                .transactionType(request.getTransactionType())
                .quantity(request.getQuantity())
                .pricePerUnit(request.getPricePerUnit())
                .transactionDate(request.getTransactionDate())
                .build();
    }

    public TransactionResponse toResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .transactionType(transaction.getTransactionType())
                .quantity(transaction.getQuantity())
                .pricePerUnit(transaction.getPricePerUnit())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
