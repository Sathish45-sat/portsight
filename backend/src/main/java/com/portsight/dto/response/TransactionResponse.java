package com.portsight.dto.response;

import com.portsight.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private TransactionType transactionType;
    private BigDecimal quantity;
    private BigDecimal pricePerUnit;
    private LocalDateTime transactionDate;
    private LocalDateTime createdAt;
}
