package com.portsight.service;

import com.portsight.dto.request.PortfolioRequest;
import com.portsight.dto.response.PortfolioResponse;
import com.portsight.entity.Portfolio;
import com.portsight.entity.User;
import com.portsight.exception.PortfolioNotEmptyException;
import com.portsight.exception.PortfolioNotOwnedException;
import com.portsight.mapper.PortfolioMapper;
import com.portsight.repository.PortfolioRepository;
import com.portsight.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final PortfolioMapper portfolioMapper;

    public PortfolioService(PortfolioRepository portfolioRepository,
                            UserRepository userRepository,
                            PortfolioMapper portfolioMapper) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.portfolioMapper = portfolioMapper;
    }

    @Transactional
    public PortfolioResponse create(PortfolioRequest request,String userEmail){
        User user=getUserByEmail(userEmail);

        Portfolio portfolio=portfolioMapper.toEntity(request,user);
        Portfolio saved=portfolioRepository.save(portfolio);

        return portfolioMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PortfolioResponse> getAll(String userEmail){
        User user = getUserByEmail(userEmail);

        return portfolioRepository.findByUserId(user.getId())
                .stream()
                .map(portfolioMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new PortfolioNotOwnedException("Portfolio not found with id: " + id));
        return portfolioMapper.toResponse(portfolio);
    }

    @Transactional
    public PortfolioResponse update(Long id, PortfolioRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new PortfolioNotOwnedException("Portfolio not found with id: " + id));
        portfolio.setName(request.getName());
        Portfolio updated = portfolioRepository.save(portfolio);
        return portfolioMapper.toResponse(updated);
    }

    @Transactional
    public void delete(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);

        Portfolio portfolio = portfolioRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new PortfolioNotOwnedException("Portfolio not found with id: " + id));

        if (portfolioRepository.hasAssets(id)) {
            throw new PortfolioNotEmptyException("Cannot delete portfolio: delete its assets first");
        }

        portfolioRepository.delete(portfolio);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
