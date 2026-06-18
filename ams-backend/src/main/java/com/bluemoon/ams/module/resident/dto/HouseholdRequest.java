package com.bluemoon.ams.module.resident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class HouseholdRequest {
    @NotBlank(message = "Vui lòng nhập mã hộ gia đình")
    @Size(min = 1, max = 50, message = "Mã hộ gia đình phải từ 1-50 ký tự")
    private String householdCode;

    @NotNull(message = "Mã căn hộ không được để trống")
    private Long apartmentId;

    public HouseholdRequest() {}
    public HouseholdRequest(String householdCode, Long apartmentId) {
        this.householdCode = householdCode;
        this.apartmentId = apartmentId;
    }

    public String getHouseholdCode() { return householdCode; }
    public void setHouseholdCode(String householdCode) { this.householdCode = householdCode; }
    public Long getApartmentId() { return apartmentId; }
    public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
}
