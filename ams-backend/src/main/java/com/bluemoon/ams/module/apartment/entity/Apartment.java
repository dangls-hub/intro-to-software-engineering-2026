package com.bluemoon.ams.module.apartment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "apartments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Apartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String roomNumber;  // Số phòng: A101, A102, B201, etc.

    @Column(nullable = false)
    private Integer floor;      // Tầng

    @Column(nullable = false)
    private Double area;        // Diện tích (m²)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApartmentStatus status;  // ACTIVE, INACTIVE

    @Column(length = 255)
    private String description; // Mô tả

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
