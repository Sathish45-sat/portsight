package com.portsight.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"portfolio_id", "symbol"})
})
@Getter
@Setter
@Builder
public class Asset {

    public Asset() {}

    public Asset(Long id, Portfolio portfolio, String symbol, String name, AssetType assetType, BigDecimal currentPrice, BigDecimal avgBuyPrice, BigDecimal quantityHeld, LocalDateTime createdAt, Long version) {
        this.id = id;
        this.portfolio = portfolio;
        this.symbol = symbol;
        this.name = name;
        this.assetType = assetType;
        this.currentPrice = currentPrice;
        this.avgBuyPrice = avgBuyPrice != null ? avgBuyPrice : BigDecimal.ZERO;
        this.quantityHeld = quantityHeld != null ? quantityHeld : BigDecimal.ZERO;
        this.createdAt = createdAt;
        this.version = version;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 20)
    private AssetType assetType;

    @Column(name = "current_price", nullable = false, precision = 18, scale = 4)
    private BigDecimal currentPrice;

    @Builder.Default
    @Column(name = "avg_buy_price", nullable = false, precision = 18, scale = 4)
    private BigDecimal avgBuyPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "quantity_held", nullable = false, precision = 18, scale = 6)
    private BigDecimal quantityHeld = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.avgBuyPrice == null) {
            this.avgBuyPrice = BigDecimal.ZERO;
        }
        if (this.quantityHeld == null) {
            this.quantityHeld = BigDecimal.ZERO;
        }
    }
}
