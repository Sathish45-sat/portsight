package com.portsight.controller;

import com.portsight.dto.request.PortfolioRequest;
import com.portsight.dto.response.PortfolioResponse;
import com.portsight.service.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioResponse>> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        List<PortfolioResponse> portfolios = portfolioService.getAll(userDetails.getUsername());
        return ResponseEntity.ok(portfolios);
    }

    @PostMapping
    public ResponseEntity<PortfolioResponse> create(@Valid @RequestBody PortfolioRequest request,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        PortfolioResponse created = portfolioService.create(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioResponse> getById(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        PortfolioResponse portfolio = portfolioService.getById(id, userDetails.getUsername());
        return ResponseEntity.ok(portfolio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortfolioResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody PortfolioRequest request,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        PortfolioResponse updated = portfolioService.update(id, request, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        portfolioService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
