package com.portsight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetHoldingResponse {

    private Long assetId;
    private String symbol;
    private String name;
    private BigDecimal quantity;
    private BigDecimal avgCost;
    private BigDecimal currentPrice;
    private BigDecimal marketValue;
    private BigDecimal unrealizedProfit;
    private BigDecimal returnPercentage;
}
