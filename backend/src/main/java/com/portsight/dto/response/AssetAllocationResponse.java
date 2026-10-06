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
public class AssetAllocationResponse {

    private Long assetId;
    private String symbol;
    private String name;
    private BigDecimal marketValue;
    private BigDecimal allocationPercentage;
}
