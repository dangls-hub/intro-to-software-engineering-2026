package com.bluemoon.ams.module.resident.dto;

import java.time.LocalDateTime;

public class HouseholdResponse {
    private Long id;
    private String householdCode;
    private Long apartmentId;
    private String roomNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HouseholdResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHouseholdCode() { return householdCode; }
    public void setHouseholdCode(String householdCode) { this.householdCode = householdCode; }
    public Long getApartmentId() { return apartmentId; }
    public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
