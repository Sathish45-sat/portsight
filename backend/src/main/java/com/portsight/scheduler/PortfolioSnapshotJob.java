package com.portsight.scheduler;

import com.portsight.analytics.ProfitEngine;
import com.portsight.analytics.ValuationEngine;
import com.portsight.entity.Asset;
import com.portsight.entity.Portfolio;
import com.portsight.entity.PortfolioSnapshot;
import com.portsight.entity.Transaction;
import com.portsight.repository.AssetRepository;
import com.portsight.repository.PortfolioRepository;
import com.portsight.repository.PortfolioSnapshotRepository;
import com.portsight.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class PortfolioSnapshotJob {

    private static final Logger log = LoggerFactory.getLogger(PortfolioSnapshotJob.class);

    private final PortfolioRepository portfolioRepository;
    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final PortfolioSnapshotRepository snapshotRepository;
    private final ValuationEngine valuationEngine;
    private final ProfitEngine profitEngine;

    public PortfolioSnapshotJob(PortfolioRepository portfolioRepository,
                                AssetRepository assetRepository,
                                TransactionRepository transactionRepository,
                                PortfolioSnapshotRepository snapshotRepository,
                                ValuationEngine valuationEngine,
                                ProfitEngine profitEngine) {
        this.portfolioRepository = portfolioRepository;
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.snapshotRepository = snapshotRepository;
        this.valuationEngine = valuationEngine;
        this.profitEngine = profitEngine;
    }

    /**
     * Runs every midnight (00:00:00) server time.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailySnapshots() {
        LocalDate today = LocalDate.now();
        log.info("Starting daily portfolio snapshot generation for date: {}", today);
        generateSnapshotsForDate(today);
        log.info("Completed daily portfolio snapshot generation.");
    }

    /**
     * Generates snapshots for all portfolios for a given date.
     * Can also be called on-demand (e.g. in tests or manual triggers).
     */
    @Transactional
    public void generateSnapshotsForDate(LocalDate date) {
        List<Portfolio> portfolios = portfolioRepository.findAll();

        for (Portfolio portfolio : portfolios) {
            try {
                // 1. Skip if already exists for this date
                if (snapshotRepository.existsByPortfolioIdAndSnapshotDate(portfolio.getId(), date)) {
                    log.debug("Snapshot already exists for portfolio ID {} on date {}", portfolio.getId(), date);
                    continue;
                }

                // 2. Fetch assets and transactions
                List<Asset> assets = assetRepository.findByPortfolioId(portfolio.getId());
                List<Transaction> transactions = transactionRepository.findByAssetPortfolioId(portfolio.getId());

                // 3. Compute metrics via Engines
                BigDecimal currentValue = valuationEngine.calculatePortfolioCurrentValue(assets);
                BigDecimal totalInvestment = valuationEngine.calculatePortfolioTotalInvestment(assets);

                BigDecimal unrealizedProfit = profitEngine.calculatePortfolioUnrealizedProfit(assets);
                BigDecimal realizedProfit = profitEngine.calculateRealizedProfit(transactions);
                BigDecimal totalProfitLoss = profitEngine.calculateTotalProfit(unrealizedProfit, realizedProfit);

                // 4. Save snapshot record
                PortfolioSnapshot snapshot = PortfolioSnapshot.builder()
                        .portfolio(portfolio)
                        .currentValue(currentValue)
                        .totalInvestment(totalInvestment)
                        .profitLoss(totalProfitLoss)
                        .snapshotDate(date)
                        .build();

                snapshotRepository.save(snapshot);
                log.info("Created snapshot for portfolio '{}' (ID: {}) on {}", portfolio.getName(), portfolio.getId(), date);
            } catch (Exception e) {
                log.error("Failed to generate snapshot for portfolio ID {}: {}", portfolio.getId(), e.getMessage(), e);
            }
        }
    }
}
