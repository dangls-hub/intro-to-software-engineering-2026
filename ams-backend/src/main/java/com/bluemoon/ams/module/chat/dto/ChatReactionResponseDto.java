package com.bluemoon.ams.module.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatReactionResponseDto {
    private Long messageId;
    private Map<String, List<String>> reactions;
}
