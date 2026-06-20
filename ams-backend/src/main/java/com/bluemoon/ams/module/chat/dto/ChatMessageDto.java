package com.bluemoon.ams.module.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private String content;
    private String senderName;
    private String senderRole;
    private LocalDateTime timestamp;
    private String type = "TEXT";
    private String mediaUrl;
}
