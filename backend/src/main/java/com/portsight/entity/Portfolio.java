package com.portsight.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@Entity
@Table(name="portfolios")
@Getter
@Setter
@Builder
public class Portfolio {

    public Portfolio() {}

    public Portfolio(Long id, User user, String name, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.createdAt = createdAt;
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id",nullable = false)
    private User user;

    @Column(nullable = false,length = 100)
    private String name;

    @Column(name = "created_at",nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate(){
        this.createdAt=LocalDateTime.now();
    }

}