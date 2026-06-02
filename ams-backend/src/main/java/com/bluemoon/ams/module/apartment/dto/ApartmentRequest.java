package com.bluemoon.ams.module.apartment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApartmentRequest {
    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber;

    @NotNull(message = "Tầng không được để trống")
    @Positive(message = "Tầng phải lớn hơn 0")
    private Integer floor;

    @NotNull(message = "Diện tích không được để trống")
    @Positive(message = "Diện tích phải lớn hơn 0")
    private Double area;

    private String description;

    private String status;  // AVAILABLE, OCCUPIED, hoặc INACTIVE
}
