package com.bluemoon.ams.module.announcement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @NotBlank(message = "Loại thông báo không được để trống")
    private String type; // ANNOUNCEMENT, EVENT

    private String eventDate; // ISO string or format, can be null
}
