package com.portsight.exception;

import com.portsight.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 404: Portfolio not owned or does not exist
    @ExceptionHandler(PortfolioNotOwnedException.class)
    public ResponseEntity<ErrorResponse> handlePortfolioNotOwned(PortfolioNotOwnedException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // 409: Explicit check failure when deleting portfolio containing assets
    @ExceptionHandler(PortfolioNotEmptyException.class)
    public ResponseEntity<ErrorResponse> handlePortfolioNotEmpty(PortfolioNotEmptyException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // 409: DB-level foreign key violation fallback safety net
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message("Operation failed due to database integrity constraints (e.g. existing related records or duplicate key)")
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // 401: Invalid credentials on login
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message("Invalid email or password")
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // 401: Missing or invalid token forwarded by JwtAuthenticationEntryPoint
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message("Authentication required: " + ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // 400: Business validation (e.g. duplicate email from AuthService)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // 400: Bean validation (@Valid) failures
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> validationErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Validation failed for one or more fields")
                .path(request.getRequestURI())
                .validationErrors(validationErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // 500: Unexpected fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at [{}]: ", request.getRequestURI(), ex);
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred")
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // 404: Asset not found or not owned
    @ExceptionHandler(AssetNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAssetNotFound(AssetNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // 409: Duplicate symbol within the same portfolio
    @ExceptionHandler(DuplicateAssetException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateAsset(DuplicateAssetException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

}
