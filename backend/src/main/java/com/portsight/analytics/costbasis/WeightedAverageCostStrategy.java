package com.portsight.analytics.costbasis;

import com.portsight.entity.Transaction;
import com.portsight.entity.TransactionType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Component
public class WeightedAverageCostStrategy implements CostBasisStrategy {

    private static final int SCALE = 4;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    @Override
    public BigDecimal calculateRealizedProfit(List<Transaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // 1. Sort transactions chronologically
        List<Transaction> sorted = transactions.stream()
                .sorted(Comparator.comparing(Transaction::getTransactionDate))
                .toList();

        BigDecimal runningQty = BigDecimal.ZERO;
        BigDecimal runningAvgBuyPrice = BigDecimal.ZERO;
        BigDecimal totalRealizedProfit = BigDecimal.ZERO;

        for (Transaction tx : sorted) {
            if (tx.getTransactionType() == TransactionType.BUY) {
                // Recompute weighted average buy price
                BigDecimal newQty = runningQty.add(tx.getQuantity());
                BigDecimal totalCost = (runningQty.multiply(runningAvgBuyPrice))
                        .add(tx.getQuantity().multiply(tx.getPricePerUnit()));

                runningAvgBuyPrice = totalCost.divide(newQty, SCALE, ROUNDING);
                runningQty = newQty;
            } else if (tx.getTransactionType() == TransactionType.SELL) {
                // Realized P&L on this sale = soldQuantity * (sellPrice - runningAvgBuyPriceAtTimeOfSale)
                BigDecimal profitPerUnit = tx.getPricePerUnit().subtract(runningAvgBuyPrice);
                BigDecimal saleProfit = tx.getQuantity().multiply(profitPerUnit);

                totalRealizedProfit = totalRealizedProfit.add(saleProfit);

                // Reduce running quantity held
                runningQty = runningQty.subtract(tx.getQuantity());
                if (runningQty.compareTo(BigDecimal.ZERO) == 0) {
                    runningAvgBuyPrice = BigDecimal.ZERO;
                }
            }
        }

        return totalRealizedProfit.setScale(SCALE, ROUNDING);
    }
}
