package com.bluemoon.ams.module.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false)
    private String senderRole; // Tương ứng vai trò: ADMIN, STAFF, RESIDENT

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 20)
    private String type = "TEXT"; // TEXT, IMAGE, VIDEO

    @Column(length = 1000)
    private String mediaUrl;

    // Message Reply Reference
    private Long replyToId;

    @Column(columnDefinition = "TEXT")
    private String replyToContent;

    private String replyToSender;

    @Column(nullable = false)
    @Builder.Default
    private boolean recalled = false;

    @Column(columnDefinition = "TEXT")
    private String hiddenUsernames;

    @Column(nullable = false)
    @Builder.Default
    private boolean pinned = false;
}

