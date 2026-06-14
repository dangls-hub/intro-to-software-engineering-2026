package com.bluemoon.ams.module.resident.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApprovalRequest {
    @NotBlank(message = "Hành động không được để trống (APPROVE hoặc REJECT)")
    private String action; // "APPROVE" hoặc "REJECT"

    private String rejectReason; // Bắt buộc khi action = REJECT
}
