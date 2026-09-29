package com.portsight.repository;

import com.portsight.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface PortfolioRepository  extends JpaRepository<Portfolio,Long> {
    List<Portfolio> findByUserId(Long userId);
    Optional<Portfolio> findByIdAndUserId(Long id,Long userId);

    @Query(value = "SELECT COUNT(*) > 0 FROM assets WHERE portfolio_id = :portfolioId", nativeQuery = true)
    boolean hasAssets(@Param("portfolioId") Long portfolioId);

}
