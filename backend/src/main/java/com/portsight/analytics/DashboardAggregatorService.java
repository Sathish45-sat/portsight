package com.portsight.analytics;

import com.portsight.dto.response.AssetAllocationResponse;
import com.portsight.dto.response.AssetPerformanceResponse;
import com.portsight.dto.response.DashboardResponse;
import com.portsight.dto.response.SnapshotResponse;
import com.portsight.entity.Asset;
import com.portsight.entity.Portfolio;
import com.portsight.entity.PortfolioSnapshot;
import com.portsight.entity.Transaction;
import com.portsight.entity.User;
import com.portsight.exception.PortfolioNotOwnedException;
import com.portsight.repository.AssetRepository;
import com.portsight.repository.PortfolioRepository;
import com.portsight.repository.PortfolioSnapshotRepository;
import com.portsight.repository.TransactionRepository;
import com.portsight.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardAggregatorService {

    private final PortfolioRepository portfolioRepository;
    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final PortfolioSnapshotRepository snapshotRepository;
    private final UserRepository userRepository;
    private final ValuationEngine valuationEngine;
    private final ProfitEngine profitEngine;
    private final AllocationEngine allocationEngine;
    private final PerformanceEngine performanceEngine;

    public DashboardAggregatorService(PortfolioRepository portfolioRepository,
                                      AssetRepository assetRepository,
                                      TransactionRepository transactionRepository,
                                      PortfolioSnapshotRepository snapshotRepository,
                                      UserRepository userRepository,
                                      ValuationEngine valuationEngine,
                                      ProfitEngine profitEngine,
                                      AllocationEngine allocationEngine,
                                      PerformanceEngine performanceEngine) {
        this.portfolioRepository = portfolioRepository;
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.snapshotRepository = snapshotRepository;
        this.userRepository = userRepository;
        this.valuationEngine = valuationEngine;
        this.profitEngine = profitEngine;
        this.allocationEngine = allocationEngine;
        this.performanceEngine = performanceEngine;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long portfolioId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new PortfolioNotOwnedException("Portfolio not found with id: " + portfolioId));

        List<Asset> assets = assetRepository.findByPortfolioId(portfolioId);
        List<Transaction> transactions = transactionRepository.findByAssetPortfolioId(portfolioId);

        // 1. Valuation metrics
        BigDecimal totalPortfolioValue = valuationEngine.calculatePortfolioCurrentValue(assets);
        BigDecimal totalInvestment = valuationEngine.calculatePortfolioTotalInvestment(assets);
        BigDecimal totalReturnPercentage = valuationEngine.calculateReturnPercentage(totalPortfolioValue, totalInvestment);

        // 2. Daily Change metrics (wired to snapshot repository)
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Optional<PortfolioSnapshot> yesterdaySnapshot = snapshotRepository.findByPortfolioIdAndSnapshotDate(portfolioId, yesterday);
        BigDecimal yesterdayValue = yesterdaySnapshot.map(PortfolioSnapshot::getCurrentValue).orElse(null);

        BigDecimal dailyChange = valuationEngine.calculateDailyChange(totalPortfolioValue, yesterdayValue);
        BigDecimal dailyChangePercentage = valuationEngine.calculateDailyChangePercentage(totalPortfolioValue, yesterdayValue);

        // 3. Profit metrics
        BigDecimal totalUnrealizedProfit = profitEngine.calculatePortfolioUnrealizedProfit(assets);
        BigDecimal totalRealizedProfit = profitEngine.calculateRealizedProfit(transactions);
        BigDecimal totalProfit = profitEngine.calculateTotalProfit(totalUnrealizedProfit, totalRealizedProfit);

        // 4. Allocation breakdown
        List<AssetAllocationResponse> allocations = allocationEngine.calculateAllocations(assets);

        // 5. Performance highlights
        AssetPerformanceResponse bestPerformer = performanceEngine.findBestPerformer(assets);
        AssetPerformanceResponse worstPerformer = performanceEngine.findWorstPerformer(assets);
        AssetPerformanceResponse largestHolding = performanceEngine.findLargestHolding(assets);

        // 6. Recent Historical Snapshots (for frontend growth chart)
        List<SnapshotResponse> recentSnapshots = snapshotRepository.findByPortfolioIdOrderBySnapshotDateAsc(portfolioId)
                .stream()
                .map(s -> SnapshotResponse.builder()
                        .id(s.getId())
                        .currentValue(s.getCurrentValue())
                        .totalInvestment(s.getTotalInvestment())
                        .profitLoss(s.getProfitLoss())
                        .snapshotDate(s.getSnapshotDate())
                        .build())
                .toList();

        return DashboardResponse.builder()
                .portfolioId(portfolio.getId())
                .portfolioName(portfolio.getName())
                .totalPortfolioValue(totalPortfolioValue)
                .totalInvestment(totalInvestment)
                .totalReturnPercentage(totalReturnPercentage)
                .dailyChange(dailyChange)
                .dailyChangePercentage(dailyChangePercentage)
                .totalUnrealizedProfit(totalUnrealizedProfit)
                .totalRealizedProfit(totalRealizedProfit)
                .totalProfit(totalProfit)
                .allocations(allocations)
                .bestPerformer(bestPerformer)
                .worstPerformer(worstPerformer)
                .largestHolding(largestHolding)
                .recentSnapshots(recentSnapshots)
                .build();
    }
}
