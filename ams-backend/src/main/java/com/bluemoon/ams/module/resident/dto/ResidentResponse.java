package com.bluemoon.ams.module.resident.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ResidentResponse {
    private Long id;
    private String fullName;
    private String identityNumber;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String relationshipType;
    private String status;
    private Long householdId;
    private String householdCode;
    private Long apartmentId;
    private String roomNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Approval workflow fields
    private String approvalStatus;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectReason;
}