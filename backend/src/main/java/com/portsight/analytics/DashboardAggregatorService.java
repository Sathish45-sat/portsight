package com.portsight.analytics;

import com.portsight.dto.response.AssetAllocationResponse;
import com.portsight.dto.response.AssetPerformanceResponse;
import com.portsight.dto.response.DashboardResponse;
import com.portsight.entity.Asset;
import com.portsight.entity.Portfolio;
import com.portsight.entity.Transaction;
import com.portsight.entity.User;
import com.portsight.exception.PortfolioNotOwnedException;
import com.portsight.repository.AssetRepository;
import com.portsight.repository.PortfolioRepository;
import com.portsight.repository.TransactionRepository;
import com.portsight.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardAggregatorService {

    private final PortfolioRepository portfolioRepository;
    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ValuationEngine valuationEngine;
    private final ProfitEngine profitEngine;
    private final AllocationEngine allocationEngine;
    private final PerformanceEngine performanceEngine;

    public DashboardAggregatorService(PortfolioRepository portfolioRepository,
                                      AssetRepository assetRepository,
                                      TransactionRepository transactionRepository,
                                      UserRepository userRepository,
                                      ValuationEngine valuationEngine,
                                      ProfitEngine profitEngine,
                                      AllocationEngine allocationEngine,
                                      PerformanceEngine performanceEngine) {
        this.portfolioRepository = portfolioRepository;
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
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

        // 2. Profit metrics
        BigDecimal totalUnrealizedProfit = profitEngine.calculatePortfolioUnrealizedProfit(assets);
        BigDecimal totalRealizedProfit = profitEngine.calculateRealizedProfit(transactions);
        BigDecimal totalProfit = profitEngine.calculateTotalProfit(totalUnrealizedProfit, totalRealizedProfit);

        // 3. Allocation breakdown
        List<AssetAllocationResponse> allocations = allocationEngine.calculateAllocations(assets);

        // 4. Performance highlights
        AssetPerformanceResponse bestPerformer = performanceEngine.findBestPerformer(assets);
        AssetPerformanceResponse worstPerformer = performanceEngine.findWorstPerformer(assets);
        AssetPerformanceResponse largestHolding = performanceEngine.findLargestHolding(assets);

        return DashboardResponse.builder()
                .portfolioId(portfolio.getId())
                .portfolioName(portfolio.getName())
                .totalPortfolioValue(totalPortfolioValue)
                .totalInvestment(totalInvestment)
                .totalReturnPercentage(totalReturnPercentage)
                .totalUnrealizedProfit(totalUnrealizedProfit)
                .totalRealizedProfit(totalRealizedProfit)
                .totalProfit(totalProfit)
                .allocations(allocations)
                .bestPerformer(bestPerformer)
                .worstPerformer(worstPerformer)
                .largestHolding(largestHolding)
                .build();
    }
}
