package com.portsight.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@Entity
@Table(name="users")
@Getter
@Setter
@Builder
public class User {

    public User() {}

    public User(Long id, String email, String passwordHash, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String email;

    @Column(name="password_hash",nullable = false)
    private String passwordHash;

    @Column(name = "created_at",nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate(){
        this.createdAt=LocalDateTime.now();
    }

}
