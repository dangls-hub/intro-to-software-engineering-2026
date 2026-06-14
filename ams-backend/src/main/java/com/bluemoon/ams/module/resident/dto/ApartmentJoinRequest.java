package com.bluemoon.ams.module.resident.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ApartmentJoinRequest {

    @NotNull(message = "Vui lòng chọn căn hộ")
    private Long apartmentId;

    @Size(max = 20, message = "Số căn cước không được vượt quá 20 ký tự")
    private String identityNumber;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phoneNumber;

    private LocalDate dateOfBirth;

    @Size(max = 10, message = "Giới tính không được vượt quá 10 ký tự")
    private String gender;

    private String relationshipType;
}
