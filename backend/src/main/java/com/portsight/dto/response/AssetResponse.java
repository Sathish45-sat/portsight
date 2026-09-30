package com.portsight.dto.response;

import com.portsight.entity.AssetType;
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
public class AssetResponse {

    private Long id;
    private String symbol;
    private String name;
    private AssetType assetType;
    private BigDecimal currentPrice;
    private BigDecimal avgBuyPrice;
    private BigDecimal quantityHeld;
    private LocalDateTime createdAt;
}
