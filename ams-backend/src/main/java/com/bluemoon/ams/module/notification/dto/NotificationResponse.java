package com.bluemoon.ams.module.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private Long recipientId;
    private Long senderId;
    private String senderName;
    private String type;
    private String content;
    private String link;
    private boolean isRead;
    private LocalDateTime createdAt;
}
