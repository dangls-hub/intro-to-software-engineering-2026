package com.bluemoon.ams.module.report.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung phản ánh không được để trống")
    private String content;

    @NotBlank(message = "Loại phản ánh không được để trống")
    private String type; // REFLECT, REPAIR, COMPLAINT, OTHER
}
