package com.portsight.analytics.costbasis;

import com.portsight.entity.Transaction;

import java.math.BigDecimal;
import java.util.List;

public interface CostBasisStrategy {
    /**
     * Calculates total realized profit across historical SELL transactions.
     *
     * @param transactions Historical transactions for an asset
     * @return Total realized profit (positive for gain, negative for loss)
     */
    BigDecimal calculateRealizedProfit(List<Transaction> transactions);
}
