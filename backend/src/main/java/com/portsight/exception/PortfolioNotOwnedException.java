package com.portsight.exception;

public class PortfolioNotOwnedException extends RuntimeException {
    public PortfolioNotOwnedException(String message) {
        super(message);
    }
}
