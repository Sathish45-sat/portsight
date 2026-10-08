package com.portsight.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_snapshots", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"portfolio_id", "snapshot_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "total_investment", nullable = false, precision = 18, scale = 4)
    private BigDecimal totalInvestment;

    @Column(name = "current_value", nullable = false, precision = 18, scale = 4)
    private BigDecimal currentValue;

    @Column(name = "profit_loss", nullable = false, precision = 18, scale = 4)
    private BigDecimal profitLoss;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;
}
