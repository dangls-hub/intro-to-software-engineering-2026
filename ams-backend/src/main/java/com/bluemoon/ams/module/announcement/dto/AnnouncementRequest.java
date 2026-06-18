package com.bluemoon.ams.module.announcement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public class AnnouncementRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @NotBlank(message = "Loại thông báo không được để trống")
    private String type;

    private String eventDate;

    public AnnouncementRequest() {}
    public AnnouncementRequest(String title, String content, String type, String eventDate) {
        this.title = title;
        this.content = content;
        this.type = type;
        this.eventDate = eventDate;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
}
