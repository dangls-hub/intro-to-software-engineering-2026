package com.bluemoon.ams.module.announcement.dto;

public class AnnouncementResponse {
    private Long id;
    private String title;
    private String content;
    private String type;
    private String eventDate;
    private Long postedById;
    private String postedByName;
    private String createdAt;
    private String updatedAt;

    public AnnouncementResponse() {}

    public AnnouncementResponse(Long id, String title, String content, String type,
                                String eventDate, Long postedById, String postedByName,
                                String createdAt, String updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.type = type;
        this.eventDate = eventDate;
        this.postedById = postedById;
        this.postedByName = postedByName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    public Long getPostedById() { return postedById; }
    public void setPostedById(Long postedById) { this.postedById = postedById; }
    public String getPostedByName() { return postedByName; }
    public void setPostedByName(String postedByName) { this.postedByName = postedByName; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
