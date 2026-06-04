package com.bluemoon.ams.module.resident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ResidentRequest {

    @NotBlank(message = "Vui lòng nhập họ tên")
    @Size(max = 200, message = "Họ tên không được vượt quá 200 ký tự")
    private String fullName;

    @Size(max = 20, message = "Số căn cước không được vượt quá 20 ký tự")
    private String identityNumber;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phoneNumber;

    private LocalDate dateOfBirth;

    // Nam / Nữ / Khác
    private String gender;

    // Chủ hộ/ Vợ/ Chồng/ Con cái/ Cha mẹ/ Anh chị em/ Khác
    private String relationshipType;

    // Active/ Inactiva
    private String status;

    private Long householdId;

    // Nếu ko có housholdID thì phải có apartmentID để liên kết với căn hộ
    private Long apartmentId;
}