package com.portsight.analytics;

import com.portsight.analytics.costbasis.CostBasisStrategy;
import com.portsight.entity.Asset;
import com.portsight.entity.Transaction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class ProfitEngine {

    private static final int SCALE = 4;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final CostBasisStrategy costBasisStrategy;

    public ProfitEngine(CostBasisStrategy costBasisStrategy) {
        this.costBasisStrategy = costBasisStrategy;
    }

    /**
     * Unrealized P&L on an asset = quantityHeld * (currentPrice - avgBuyPrice)
     */
    public BigDecimal calculateAssetUnrealizedProfit(Asset asset) {
        if (asset.getQuantityHeld() == null || asset.getQuantityHeld().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal priceDiff = asset.getCurrentPrice().subtract(asset.getAvgBuyPrice());
        return asset.getQuantityHeld().multiply(priceDiff).setScale(SCALE, ROUNDING);
    }

    /**
     * Sum of unrealized P&L across all assets in the portfolio
     */
    public BigDecimal calculatePortfolioUnrealizedProfit(List<Asset> assets) {
        if (assets == null || assets.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return assets.stream()
                .map(this::calculateAssetUnrealizedProfit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Realized P&L calculated by delegating to CostBasisStrategy
     */
    public BigDecimal calculateRealizedProfit(List<Transaction> transactions) {
        return costBasisStrategy.calculateRealizedProfit(transactions);
    }

    /**
     * Total Profit = Unrealized Profit + Realized Profit
     */
    public BigDecimal calculateTotalProfit(BigDecimal unrealizedProfit, BigDecimal realizedProfit) {
        BigDecimal unrealized = (unrealizedProfit != null) ? unrealizedProfit : BigDecimal.ZERO;
        BigDecimal realized = (realizedProfit != null) ? realizedProfit : BigDecimal.ZERO;
        return unrealized.add(realized).setScale(SCALE, ROUNDING);
    }
}
