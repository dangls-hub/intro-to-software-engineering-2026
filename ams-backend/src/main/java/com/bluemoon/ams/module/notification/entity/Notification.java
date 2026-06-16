package com.bluemoon.ams.module.notification.entity;

import com.bluemoon.ams.module.auth.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(length = 255)
    private String link;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Notification() {}

    public Notification(Long id, User recipient, User sender, String type, String content,
                        String link, Boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.recipient = recipient;
        this.sender = sender;
        this.type = type;
        this.content = content;
        this.link = link;
        this.isRead = isRead != null ? isRead : false;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) this.isRead = false;
    }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private User recipient;
        private User sender;
        private String type;
        private String content;
        private String link;
        private Boolean isRead = false;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder recipient(User recipient) { this.recipient = recipient; return this; }
        public Builder sender(User sender) { this.sender = sender; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder link(String link) { this.link = link; return this; }
        public Builder isRead(Boolean isRead) { this.isRead = isRead; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Notification build() {
            return new Notification(id, recipient, sender, type, content, link, isRead, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public Boolean getIsRead() { return isRead; }
    public boolean isRead() { return Boolean.TRUE.equals(isRead); }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Notification)) return false;
        Notification that = (Notification) o;
        return java.util.Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return java.util.Objects.hash(id); }

    @Override
    public String toString() {
        return "Notification{id=" + id + ", type='" + type + "', isRead=" + isRead + "}";
    }
}
