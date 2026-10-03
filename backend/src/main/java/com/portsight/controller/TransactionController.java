package com.portsight.controller;

import com.portsight.dto.request.TransactionRequest;
import com.portsight.dto.response.TransactionResponse;
import com.portsight.service.TransactionService;
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
@RequestMapping("/api/assets/{assetId}/transactions")
@Tag(name = "Transactions", description = "Append-only transaction ledger for assets")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "Get transaction history for an asset")
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @PathVariable Long assetId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TransactionResponse> transactions = transactionService.getTransactionsForAsset(assetId, userDetails.getUsername());
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    @Operation(summary = "Record a BUY or SELL transaction", description = "Updates asset quantity held and weighted average buy price automatically")
    public ResponseEntity<TransactionResponse> recordTransaction(
            @PathVariable Long assetId,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TransactionResponse response = transactionService.recordTransaction(assetId, userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
