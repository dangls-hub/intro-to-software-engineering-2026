// ams-backend/src/main/java/com/bluemoon/ams/module/resident/entity/Household.java
package com.bluemoon.ams.module.resident.entity;

import com.bluemoon.ams.module.apartment.entity.Apartment;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "households")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "apartment")
@EqualsAndHashCode(exclude = "apartment")
public class Household {
    /* Entitiy đại diện cho hộ gia đình 
    */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "household_code", unique = true, nullable = false, length = 50)
    private String householdCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}