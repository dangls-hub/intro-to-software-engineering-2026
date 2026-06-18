package com.bluemoon.ams.module.report.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public class ReportRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung phản ánh không được để trống")
    private String content;

    @NotBlank(message = "Loại phản ánh không được để trống")
    private String type; // REFLECT, REPAIR, COMPLAINT, OTHER

    public ReportRequest() {}

    public ReportRequest(String title, String content, String type) {
        this.title = title;
        this.content = content;
        this.type = type;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
