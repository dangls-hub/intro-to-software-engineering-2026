package com.bluemoon.ams.module.report.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReportRequest {

    @NotBlank(message = "Trạng thái phê duyệt không được để trống")
    private String status; // PENDING, IN_PROGRESS, RESOLVED, REJECTED

    private String resolveNote;
}
