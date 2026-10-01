package com.portsight.controller;

import com.portsight.dto.request.AssetRequest;
import com.portsight.dto.request.PriceUpdateRequest;
import com.portsight.dto.response.AssetResponse;
import com.portsight.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Assets", description = "Asset management within portfolios")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/api/portfolios/{portfolioId}/assets")
    @Operation(summary = "List all assets in a portfolio")
    public ResponseEntity<List<AssetResponse>> getAllForPortfolio(
            @PathVariable Long portfolioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AssetResponse> assets = assetService.getAllForPortfolio(portfolioId, userDetails.getUsername());
        return ResponseEntity.ok(assets);
    }

    @PostMapping("/api/portfolios/{portfolioId}/assets")
    @Operation(summary = "Add a new asset to a portfolio")
    public ResponseEntity<AssetResponse> create(
            @PathVariable Long portfolioId,
            @Valid @RequestBody AssetRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AssetResponse created = assetService.create(portfolioId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/assets/{id}")
    @Operation(summary = "Get an asset by ID")
    public ResponseEntity<AssetResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        AssetResponse asset = assetService.getById(id, userDetails.getUsername());
        return ResponseEntity.ok(asset);
    }

    @PutMapping("/api/assets/{id}/price")
    @Operation(summary = "Update asset price via PriceProvider seam")
    public ResponseEntity<AssetResponse> updatePrice(
            @PathVariable Long id,
            @Valid @RequestBody PriceUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AssetResponse updated = assetService.updatePrice(id, request, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/assets/{id}")
    @Operation(summary = "Delete an asset", description = "WARNING: Cascades and permanently deletes all associated transaction history.")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        assetService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
