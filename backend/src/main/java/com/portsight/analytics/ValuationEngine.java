package com.portsight.analytics;

import com.portsight.entity.Asset;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class ValuationEngine {

    private static final int SCALE = 4;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    /**
     * Current market value of a single asset = quantityHeld * currentPrice
     */
    public BigDecimal calculateAssetCurrentValue(Asset asset) {
        if (asset.getQuantityHeld() == null || asset.getCurrentPrice() == null) {
            return BigDecimal.ZERO;
        }
        return asset.getQuantityHeld().multiply(asset.getCurrentPrice()).setScale(SCALE, ROUNDING);
    }

    /**
     * Cost basis of a single asset = quantityHeld * avgBuyPrice
     */
    public BigDecimal calculateAssetTotalInvestment(Asset asset) {
        if (asset.getQuantityHeld() == null || asset.getAvgBuyPrice() == null) {
            return BigDecimal.ZERO;
        }
        return asset.getQuantityHeld().multiply(asset.getAvgBuyPrice()).setScale(SCALE, ROUNDING);
    }

    /**
     * Total market value of the entire portfolio
     */
    public BigDecimal calculatePortfolioCurrentValue(List<Asset> assets) {
        if (assets == null || assets.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return assets.stream()
                .map(this::calculateAssetCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Total invested capital currently active in the portfolio
     */
    public BigDecimal calculatePortfolioTotalInvestment(List<Asset> assets) {
        if (assets == null || assets.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return assets.stream()
                .map(this::calculateAssetTotalInvestment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Return % = ((currentValue - totalInvestment) / totalInvestment) * 100
     * Protected against division-by-zero when totalInvestment is 0.
     */
    public BigDecimal calculateReturnPercentage(BigDecimal currentValue, BigDecimal totalInvestment) {
        if (totalInvestment == null || totalInvestment.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal profit = currentValue.subtract(totalInvestment);
        return profit.divide(totalInvestment, SCALE, ROUNDING)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, ROUNDING); // Formatted to 2 decimals e.g. 15.25%
    }
}
