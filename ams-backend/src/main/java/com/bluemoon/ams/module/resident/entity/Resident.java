// ams-backend/src/main/java/com/bluemoon/ams/module/resident/entity/Resident.java
package com.bluemoon.ams.module.resident.entity;

import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "residents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"household", "apartment", "approvedByUser"})
@EqualsAndHashCode(exclude = {"household", "apartment", "approvedByUser"})
public class Resident {
    /* Entity đại diện cho dân cư, có thể liên kết với hộ gia đình hoặc căn hộ trực tiếp nếu không có hộ gia đình
    */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    // CCCD hoặc CMND
    @Column(name = "identity_number", unique = true, length = 20)
    private String identityNumber;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_type", length = 20)
    private RelationshipType relationshipType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ResidentStatus status = ResidentStatus.ACTIVE;

    // --- Approval workflow fields ---

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedByUser;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    // --- Relationships ---

    // Dân cư link với hộ gia đình( nếu có) 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id")
    private Household household;

    // Dân cư link với căn hộ khi ko có hộ gia đình
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ResidentStatus.ACTIVE;
        if (approvalStatus == null) approvalStatus = ApprovalStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}