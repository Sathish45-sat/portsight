package com.portsight.mapper;

import com.portsight.dto.request.PortfolioRequest;
import com.portsight.dto.response.PortfolioResponse;
import com.portsight.entity.Portfolio;
import com.portsight.entity.User;
import org.springframework.stereotype.Component;

@Component
public class PortfolioMapper {

    public Portfolio toEntity(PortfolioRequest request, User user) {
        return Portfolio.builder()
                .name(request.getName())
                .user(user)
                .build();
    }

    public PortfolioResponse toResponse(Portfolio portfolio) {
        return PortfolioResponse.builder()
                .id(portfolio.getId())
                .name(portfolio.getName())
                .createdAt(portfolio.getCreatedAt())
                .build();
    }
}
