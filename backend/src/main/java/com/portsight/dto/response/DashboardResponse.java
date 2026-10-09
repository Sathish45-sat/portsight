package com.portsight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private Long portfolioId;
    private String portfolioName;

    // Valuation Engine metrics
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalInvestment;
    private BigDecimal totalReturnPercentage;

    // Daily Change metrics (relative to yesterday's snapshot)
    private BigDecimal dailyChange;
    private BigDecimal dailyChangePercentage;

    // Profit Engine metrics
    private BigDecimal totalUnrealizedProfit;
    private BigDecimal totalRealizedProfit;
    private BigDecimal totalProfit;

    // Allocation Engine breakdown
    private List<AssetAllocationResponse> allocations;

    // Performance Engine highlights
    private AssetPerformanceResponse bestPerformer;
    private AssetPerformanceResponse worstPerformer;
    private AssetPerformanceResponse largestHolding;

    // Historical trend snapshots (for growth chart)
    private List<SnapshotResponse> recentSnapshots;
}
