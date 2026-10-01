package com.portsight.mapper;

import com.portsight.dto.request.AssetRequest;
import com.portsight.dto.response.AssetResponse;
import com.portsight.entity.Asset;
import com.portsight.entity.Portfolio;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AssetMapper {

    public Asset toEntity(AssetRequest request, Portfolio portfolio) {
        return Asset.builder()
                .portfolio(portfolio)
                .symbol(request.getSymbol().trim().toUpperCase())
                .name(request.getName().trim())
                .assetType(request.getAssetType())
                .currentPrice(request.getCurrentPrice())
                .avgBuyPrice(BigDecimal.ZERO)
                .quantityHeld(BigDecimal.ZERO)
                .build();
    }

    public AssetResponse toResponse(Asset asset) {
        return AssetResponse.builder()
                .id(asset.getId())
                .symbol(asset.getSymbol())
                .name(asset.getName())
                .assetType(asset.getAssetType())
                .currentPrice(asset.getCurrentPrice())
                .avgBuyPrice(asset.getAvgBuyPrice())
                .quantityHeld(asset.getQuantityHeld())
                .createdAt(asset.getCreatedAt())
                .build();
    }
}
