package com.bluemoon.ams.module.chat.service;

import com.bluemoon.ams.module.chat.dto.ChatMessageDto;
import com.bluemoon.ams.module.chat.entity.ChatMessage;
import com.bluemoon.ams.module.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageDto saveMessage(ChatMessageDto chatMessageDto) {
        ChatMessage message = ChatMessage.builder()
                .content(chatMessageDto.getContent() != null ? chatMessageDto.getContent() : "")
                .senderName(chatMessageDto.getSenderName())
                .senderRole(chatMessageDto.getSenderRole())
                .type(chatMessageDto.getType() != null ? chatMessageDto.getType() : "TEXT")
                .mediaUrl(chatMessageDto.getMediaUrl())
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        chatMessageDto.setId(savedMessage.getId());
        chatMessageDto.setTimestamp(savedMessage.getTimestamp());
        chatMessageDto.setType(savedMessage.getType());
        chatMessageDto.setMediaUrl(savedMessage.getMediaUrl());
        return chatMessageDto;
    }

    public List<ChatMessageDto> getChatHistory(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<ChatMessage> messagePage = chatMessageRepository.findAllByOrderByTimestampDesc(pageable);
        
        List<ChatMessageDto> history = messagePage.getContent().stream()
                .map(msg -> ChatMessageDto.builder()
                        .id(msg.getId())
                        .content(msg.getContent())
                        .senderName(msg.getSenderName())
                        .senderRole(msg.getSenderRole())
                        .type(msg.getType())
                        .mediaUrl(msg.getMediaUrl())
                        .timestamp(msg.getTimestamp())
                        .build())
                .collect(Collectors.toList());
        
        // Reverse so that the oldest is first, newest is last in the UI
        Collections.reverse(history);
        return history;
    }
}
