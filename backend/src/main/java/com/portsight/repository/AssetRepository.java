package com.portsight.repository;

import com.portsight.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByPortfolioId(Long portfolioId);

    Optional<Asset> findByIdAndPortfolioId(Long id, Long portfolioId);

    boolean existsByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    Optional<Asset> findByIdAndPortfolio_User_Id(Long id, Long userId);
}
