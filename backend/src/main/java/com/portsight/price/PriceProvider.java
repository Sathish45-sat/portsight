package com.portsight.price;

import java.math.BigDecimal;

public interface PriceProvider {
    BigDecimal getCurrentPrice(Long assetId);
    void updatePrice(Long assetId, BigDecimal newPrice);
}
