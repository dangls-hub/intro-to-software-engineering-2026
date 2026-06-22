package com.bluemoon.ams.module.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatReactionDto {
    private Long messageId;
    private String username;
    private String emoji;
}
