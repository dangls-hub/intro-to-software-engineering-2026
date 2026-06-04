package com.bluemoon.ams.module.resident.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HouseholdResponse {
    private Long id;
    private String householdCode;
    private Long apartmentId;
    private String roomNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}