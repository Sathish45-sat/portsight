package com.portsight.analytics;

import com.portsight.dto.response.AssetAllocationResponse;
import com.portsight.entity.Asset;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class AllocationEngine {

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final ValuationEngine valuationEngine;

    public AllocationEngine(ValuationEngine valuationEngine) {
        this.valuationEngine = valuationEngine;
    }

    /**
     * Calculates the portfolio allocation percentage for each asset.
     * Formula: (assetMarketValue / totalPortfolioValue) * 100
     */
    public List<AssetAllocationResponse> calculateAllocations(List<Asset> assets) {
        if (assets == null || assets.isEmpty()) {
            return List.of();
        }

        BigDecimal totalPortfolioValue = valuationEngine.calculatePortfolioCurrentValue(assets);

        List<AssetAllocationResponse> allocations = new ArrayList<>();

        for (Asset asset : assets) {
            BigDecimal assetMarketValue = valuationEngine.calculateAssetCurrentValue(asset);

            BigDecimal percentage;
            if (totalPortfolioValue.compareTo(BigDecimal.ZERO) == 0) {
                percentage = BigDecimal.ZERO;
            } else {
                percentage = assetMarketValue.divide(totalPortfolioValue, 4, ROUNDING)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(SCALE, ROUNDING);
            }

            allocations.add(AssetAllocationResponse.builder()
                    .assetId(asset.getId())
                    .symbol(asset.getSymbol())
                    .name(asset.getName())
                    .marketValue(assetMarketValue.setScale(SCALE, ROUNDING))
                    .allocationPercentage(percentage)
                    .build());
        }

        return allocations;
    }
}
