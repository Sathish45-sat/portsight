package com.portsight.exception;

public class PortfolioNotEmptyException extends RuntimeException {
    public PortfolioNotEmptyException(String message) {
        super(message);
    }
}
