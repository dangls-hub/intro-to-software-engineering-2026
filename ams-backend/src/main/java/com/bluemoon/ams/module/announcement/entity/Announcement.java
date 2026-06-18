package com.bluemoon.ams.module.announcement.entity;

import com.bluemoon.ams.module.auth.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Builder;

@Entity
@Table(name = "announcements")
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AnnouncementType type = AnnouncementType.ANNOUNCEMENT;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Announcement() {}

    public Announcement(Long id, String title, String content, AnnouncementType type,
                        LocalDateTime eventDate, User postedBy,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.type = type != null ? type : AnnouncementType.ANNOUNCEMENT;
        this.eventDate = eventDate;
        this.postedBy = postedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (type == null) type = AnnouncementType.ANNOUNCEMENT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public AnnouncementType getType() { return type; }
    public void setType(AnnouncementType type) { this.type = type; }
    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    public User getPostedBy() { return postedBy; }
    public void setPostedBy(User postedBy) { this.postedBy = postedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Announcement)) return false;
        Announcement that = (Announcement) o;
        return java.util.Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return java.util.Objects.hash(id); }

    @Override
    public String toString() {
        return "Announcement{id=" + id + ", title='" + title + "', type=" + type + "}";
    }
}
