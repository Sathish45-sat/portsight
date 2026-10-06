package com.portsight.controller;

import com.portsight.analytics.DashboardAggregatorService;
import com.portsight.dto.response.DashboardResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/dashboard")
@Tag(name = "Dashboard", description = "Aggregated portfolio analytics dashboard")
public class DashboardController {

    private final DashboardAggregatorService dashboardAggregatorService;

    public DashboardController(DashboardAggregatorService dashboardAggregatorService) {
        this.dashboardAggregatorService = dashboardAggregatorService;
    }

    @GetMapping
    @Operation(summary = "Get aggregated analytics dashboard for a portfolio")
    public ResponseEntity<DashboardResponse> getDashboard(
            @PathVariable Long portfolioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        DashboardResponse dashboard = dashboardAggregatorService.getDashboard(portfolioId, userDetails.getUsername());
        return ResponseEntity.ok(dashboard);
    }
}
