package com.portsight.analytics;

import com.portsight.analytics.costbasis.WeightedAverageCostStrategy;
import com.portsight.dto.response.AssetAllocationResponse;
import com.portsight.dto.response.AssetPerformanceResponse;
import com.portsight.entity.Asset;
import com.portsight.entity.Transaction;
import com.portsight.entity.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AnalyticsEngineTest {

    private WeightedAverageCostStrategy costStrategy;
    private ValuationEngine valuationEngine;
    private ProfitEngine profitEngine;
    private AllocationEngine allocationEngine;
    private PerformanceEngine performanceEngine;

    @BeforeEach
    void setUp() {
        costStrategy = new WeightedAverageCostStrategy();
        valuationEngine = new ValuationEngine();
        profitEngine = new ProfitEngine(costStrategy);
        allocationEngine = new AllocationEngine(valuationEngine);
        performanceEngine = new PerformanceEngine(valuationEngine);
    }

    @Test
    @DisplayName("Testing Doc Scenario: BUY 100@100, BUY 50@120 -> avgBuyPrice = 106.67")
    void testWeightedAverageCost_multiBuy() {
        Transaction tx1 = Transaction.builder()
                .transactionType(TransactionType.BUY)
                .quantity(new BigDecimal("100"))
                .pricePerUnit(new BigDecimal("100.00"))
                .transactionDate(LocalDateTime.now().minusDays(3))
                .build();

        Transaction tx2 = Transaction.builder()
                .transactionType(TransactionType.BUY)
                .quantity(new BigDecimal("50"))
                .pricePerUnit(new BigDecimal("120.00"))
                .transactionDate(LocalDateTime.now().minusDays(2))
                .build();

        BigDecimal avgPrice = costStrategy.calculateAverageBuyPrice(List.of(tx1, tx2));
        assertEquals(0, avgPrice.compareTo(new BigDecimal("106.67")), "Expected avgBuyPrice to be 106.67");
    }

    @Test
    @DisplayName("Testing Doc Scenario: SELL 80@130 -> realizedProfit = 1866.40")
    void testWeightedAverageCost_sellRealizedProfit() {
        Transaction tx1 = Transaction.builder()
                .transactionType(TransactionType.BUY)
                .quantity(new BigDecimal("100"))
                .pricePerUnit(new BigDecimal("100.00"))
                .transactionDate(LocalDateTime.now().minusDays(3))
                .build();

        Transaction tx2 = Transaction.builder()
                .transactionType(TransactionType.BUY)
                .quantity(new BigDecimal("50"))
                .pricePerUnit(new BigDecimal("120.00"))
                .transactionDate(LocalDateTime.now().minusDays(2))
                .build();

        Transaction tx3 = Transaction.builder()
                .transactionType(TransactionType.SELL)
                .quantity(new BigDecimal("80"))
                .pricePerUnit(new BigDecimal("130.00"))
                .transactionDate(LocalDateTime.now().minusDays(1))
                .build();

        BigDecimal realizedProfit = costStrategy.calculateRealizedProfit(List.of(tx1, tx2, tx3));
        assertEquals(0, realizedProfit.compareTo(new BigDecimal("1866.40")), "Expected realized profit to be 1866.40");
    }

    @Test
    @DisplayName("Testing Doc Scenario: Current price 150, 70 units remaining -> unrealizedProfit = 3033.10")
    void testUnrealizedProfit() {
        Asset asset = Asset.builder()
                .quantityHeld(new BigDecimal("70"))
                .avgBuyPrice(new BigDecimal("106.67"))
                .currentPrice(new BigDecimal("150.00"))
                .build();

        BigDecimal unrealizedProfit = profitEngine.calculateAssetUnrealizedProfit(asset);
        assertEquals(0, unrealizedProfit.compareTo(new BigDecimal("3033.10")), "Expected unrealized profit to be 3033.10");

        BigDecimal currentValue = valuationEngine.calculateAssetCurrentValue(asset);
        assertEquals(0, currentValue.compareTo(new BigDecimal("10500.00")), "Expected currentValue to be 10500.00");
    }

    @Test
    @DisplayName("AllocationEngine calculates percentage breakdown summing to 100%")
    void testAllocationEngine() {
        Asset asset1 = Asset.builder()
                .id(1L)
                .symbol("AAPL")
                .name("Apple Inc.")
                .quantityHeld(new BigDecimal("10"))
                .currentPrice(new BigDecimal("100.00")) // Value = 1000
                .build();

        Asset asset2 = Asset.builder()
                .id(2L)
                .symbol("GOOGL")
                .name("Alphabet Inc.")
                .quantityHeld(new BigDecimal("10"))
                .currentPrice(new BigDecimal("300.00")) // Value = 3000
                .build();

        List<AssetAllocationResponse> allocations = allocationEngine.calculateAllocations(List.of(asset1, asset2));
        assertEquals(2, allocations.size());

        // Asset1 should be 25%, Asset2 should be 75%
        assertEquals(0, allocations.get(0).getAllocationPercentage().compareTo(new BigDecimal("25.00")));
        assertEquals(0, allocations.get(1).getAllocationPercentage().compareTo(new BigDecimal("75.00")));
    }

    @Test
    @DisplayName("PerformanceEngine identifies best, worst, and largest holdings")
    void testPerformanceEngine() {
        Asset winner = Asset.builder()
                .id(1L)
                .symbol("WIN")
                .name("Winner Corp")
                .quantityHeld(new BigDecimal("10"))
                .avgBuyPrice(new BigDecimal("100.00"))
                .currentPrice(new BigDecimal("200.00")) // +100% return, Value = 2000
                .build();

        Asset loser = Asset.builder()
                .id(2L)
                .symbol("LOSE")
                .name("Loser Corp")
                .quantityHeld(new BigDecimal("50"))
                .avgBuyPrice(new BigDecimal("100.00"))
                .currentPrice(new BigDecimal("80.00")) // -20% return, Value = 4000 (Largest holding)
                .build();

        AssetPerformanceResponse best = performanceEngine.findBestPerformer(List.of(winner, loser));
        AssetPerformanceResponse worst = performanceEngine.findWorstPerformer(List.of(winner, loser));
        AssetPerformanceResponse largest = performanceEngine.findLargestHolding(List.of(winner, loser));

        assertNotNull(best);
        assertEquals("WIN", best.getSymbol());

        assertNotNull(worst);
        assertEquals("LOSE", worst.getSymbol());

        assertNotNull(largest);
        assertEquals("LOSE", largest.getSymbol());
        assertEquals(0, largest.getMarketValue().compareTo(new BigDecimal("4000.00")));
    }
}
