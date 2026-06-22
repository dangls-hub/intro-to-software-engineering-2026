package com.bluemoon.ams.module.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    
    // Emoji Reactions: emoji -> list of usernames
    private Map<String, List<String>> reactions;

    // Message Reply Reference
    private Long replyToId;
    private String replyToContent;
    private String replyToSender;

    @Builder.Default
    private boolean recalled = false;

    private String hiddenUsernames;

    @Builder.Default
    private boolean pinned = false;
}

