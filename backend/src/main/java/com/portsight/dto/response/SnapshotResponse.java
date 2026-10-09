package com.portsight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SnapshotResponse {

    private Long id;
    private BigDecimal currentValue;
    private BigDecimal totalInvestment;
    private BigDecimal profitLoss;
    private LocalDate snapshotDate;
}
