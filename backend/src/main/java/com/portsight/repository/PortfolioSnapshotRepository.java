package com.portsight.repository;

import com.portsight.entity.PortfolioSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, Long> {

    Optional<PortfolioSnapshot> findByPortfolioIdAndSnapshotDate(Long portfolioId, LocalDate snapshotDate);

    List<PortfolioSnapshot> findByPortfolioIdOrderBySnapshotDateAsc(Long portfolioId);

    boolean existsByPortfolioIdAndSnapshotDate(Long portfolioId, LocalDate snapshotDate);
}
