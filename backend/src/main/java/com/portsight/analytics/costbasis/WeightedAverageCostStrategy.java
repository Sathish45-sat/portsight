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

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    @Override
    public BigDecimal calculateAverageBuyPrice(List<Transaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<Transaction> sorted = transactions.stream()
                .sorted(Comparator.comparing(Transaction::getTransactionDate))
                .toList();

        BigDecimal runningQty = BigDecimal.ZERO;
        BigDecimal runningAvgBuyPrice = BigDecimal.ZERO;

        for (Transaction tx : sorted) {
            if (tx.getTransactionType() == TransactionType.BUY) {
                BigDecimal newQty = runningQty.add(tx.getQuantity());
                BigDecimal totalCost = (runningQty.multiply(runningAvgBuyPrice))
                        .add(tx.getQuantity().multiply(tx.getPricePerUnit()));

                runningAvgBuyPrice = totalCost.divide(newQty, SCALE, ROUNDING);
                runningQty = newQty;
            } else if (tx.getTransactionType() == TransactionType.SELL) {
                runningQty = runningQty.subtract(tx.getQuantity());
                if (runningQty.compareTo(BigDecimal.ZERO) == 0) {
                    runningAvgBuyPrice = BigDecimal.ZERO;
                }
            }
        }

        return runningAvgBuyPrice.setScale(SCALE, ROUNDING);
    }

    @Override
    public BigDecimal calculateRealizedProfit(List<Transaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<Transaction> sorted = transactions.stream()
                .sorted(Comparator.comparing(Transaction::getTransactionDate))
                .toList();

        BigDecimal runningQty = BigDecimal.ZERO;
        BigDecimal runningAvgBuyPrice = BigDecimal.ZERO;
        BigDecimal totalRealizedProfit = BigDecimal.ZERO;

        for (Transaction tx : sorted) {
            if (tx.getTransactionType() == TransactionType.BUY) {
                BigDecimal newQty = runningQty.add(tx.getQuantity());
                BigDecimal totalCost = (runningQty.multiply(runningAvgBuyPrice))
                        .add(tx.getQuantity().multiply(tx.getPricePerUnit()));

                runningAvgBuyPrice = totalCost.divide(newQty, SCALE, ROUNDING);
                runningQty = newQty;
            } else if (tx.getTransactionType() == TransactionType.SELL) {
                BigDecimal profitPerUnit = tx.getPricePerUnit().subtract(runningAvgBuyPrice);
                BigDecimal saleProfit = tx.getQuantity().multiply(profitPerUnit);

                totalRealizedProfit = totalRealizedProfit.add(saleProfit);

                runningQty = runningQty.subtract(tx.getQuantity());
                if (runningQty.compareTo(BigDecimal.ZERO) == 0) {
                    runningAvgBuyPrice = BigDecimal.ZERO;
                }
            }
        }

        return totalRealizedProfit.setScale(SCALE, ROUNDING);
    }
}
