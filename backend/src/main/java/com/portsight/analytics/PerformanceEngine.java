package com.portsight.analytics;

import com.portsight.dto.response.AssetPerformanceResponse;
import com.portsight.entity.Asset;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Component
public class PerformanceEngine {

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final ValuationEngine valuationEngine;

    public PerformanceEngine(ValuationEngine valuationEngine) {
        this.valuationEngine = valuationEngine;
    }

    /**
     * Finds the asset with the highest unrealized return percentage.
     */
    public AssetPerformanceResponse findBestPerformer(List<Asset> assets) {
        if (assets == null || assets.isEmpty()) {
            return null;
        }

        return assets.stream()
                .filter(a -> a.getQuantityHeld() != null && a.getQuantityHeld().compareTo(BigDecimal.ZERO) > 0)
                .max(Comparator.comparing(this::calculateUnrealizedReturnPercentage))
                .map(this::toPerformanceResponse)
                .orElse(null);
    }

    /**
     * Finds the asset with the lowest unrealized return percentage.
     */
    public AssetPerformanceResponse findWorstPerformer(List<Asset> assets) {
        if (assets == null || assets.isEmpty()) {
            return null;
        }

        return assets.stream()
                .filter(a -> a.getQuantityHeld() != null && a.getQuantityHeld().compareTo(BigDecimal.ZERO) > 0)
                .min(Comparator.comparing(this::calculateUnrealizedReturnPercentage))
                .map(this::toPerformanceResponse)
                .orElse(null);
    }

    /**
     * Finds the asset with the largest market value (current value).
     */
    public AssetPerformanceResponse findLargestHolding(List<Asset> assets) {
        if (assets == null || assets.isEmpty()) {
            return null;
        }

        return assets.stream()
                .filter(a -> a.getQuantityHeld() != null && a.getQuantityHeld().compareTo(BigDecimal.ZERO) > 0)
                .max(Comparator.comparing(valuationEngine::calculateAssetCurrentValue))
                .map(this::toPerformanceResponse)
                .orElse(null);
    }

    private BigDecimal calculateUnrealizedReturnPercentage(Asset asset) {
        if (asset.getAvgBuyPrice() == null || asset.getAvgBuyPrice().compareTo(BigDecimal.ZERO) == 0
                || asset.getCurrentPrice() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal diff = asset.getCurrentPrice().subtract(asset.getAvgBuyPrice());
        return diff.divide(asset.getAvgBuyPrice(), 4, ROUNDING)
                .multiply(BigDecimal.valueOf(100))
                .setScale(SCALE, ROUNDING);
    }

    private AssetPerformanceResponse toPerformanceResponse(Asset asset) {
        BigDecimal marketValue = valuationEngine.calculateAssetCurrentValue(asset);
        BigDecimal returnPercentage = calculateUnrealizedReturnPercentage(asset);

        return AssetPerformanceResponse.builder()
                .assetId(asset.getId())
                .symbol(asset.getSymbol())
                .name(asset.getName())
                .marketValue(marketValue.setScale(SCALE, ROUNDING))
                .returnPercentage(returnPercentage)
                .build();
    }
}
