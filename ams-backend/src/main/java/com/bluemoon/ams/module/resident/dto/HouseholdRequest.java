package com.bluemoon.ams.module.resident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class HouseholdRequest {

    @NotBlank(message = "Vui lòng nhập mã hộ gia đình")
    @Size(min = 1, max = 50, message = "Mã hộ gia đình phải từ 1-50 ký tự")
    private String householdCode;

    @NotNull(message = "Mã căn hộ không được để trống")
    private Long apartmentId;
}