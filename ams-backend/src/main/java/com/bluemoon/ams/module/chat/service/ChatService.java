package com.bluemoon.ams.module.chat.service;

import com.bluemoon.ams.module.chat.dto.ChatMessageDto;
import com.bluemoon.ams.module.chat.dto.ChatReactionDto;
import com.bluemoon.ams.module.chat.dto.ChatReactionResponseDto;
import com.bluemoon.ams.module.chat.entity.ChatMessage;
import com.bluemoon.ams.module.chat.entity.ChatReaction;
import com.bluemoon.ams.module.chat.repository.ChatMessageRepository;
import com.bluemoon.ams.module.chat.repository.ChatReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatReactionRepository chatReactionRepository;

    @Transactional
    public ChatMessageDto saveMessage(ChatMessageDto chatMessageDto) {
        ChatMessage message = ChatMessage.builder()
                .content(chatMessageDto.getContent() != null ? chatMessageDto.getContent() : "")
                .senderName(chatMessageDto.getSenderName())
                .senderRole(chatMessageDto.getSenderRole())
                .type(chatMessageDto.getType() != null ? chatMessageDto.getType() : "TEXT")
                .mediaUrl(chatMessageDto.getMediaUrl())
                .timestamp(LocalDateTime.now())
                .replyToId(chatMessageDto.getReplyToId())
                .replyToContent(chatMessageDto.getReplyToContent())
                .replyToSender(chatMessageDto.getReplyToSender())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        chatMessageDto.setId(savedMessage.getId());
        chatMessageDto.setTimestamp(savedMessage.getTimestamp());
        chatMessageDto.setType(savedMessage.getType());
        chatMessageDto.setMediaUrl(savedMessage.getMediaUrl());
        chatMessageDto.setReplyToId(savedMessage.getReplyToId());
        chatMessageDto.setReplyToContent(savedMessage.getReplyToContent());
        chatMessageDto.setReplyToSender(savedMessage.getReplyToSender());
        chatMessageDto.setReactions(new HashMap<>());
        return chatMessageDto;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<ChatMessage> messagePage = chatMessageRepository.findAllByOrderByTimestampDesc(pageable);
        
        List<ChatMessage> messages = messagePage.getContent();
        List<Long> messageIds = messages.stream().map(ChatMessage::getId).collect(Collectors.toList());
        
        // Batch load all reactions for messages in this page to avoid N+1 query problem
        Map<Long, Map<String, List<String>>> messageReactionsMap = new HashMap<>();
        if (!messageIds.isEmpty()) {
            List<ChatReaction> allReactions = chatReactionRepository.findByMessageIdIn(messageIds);
            messageReactionsMap = allReactions.stream()
                    .collect(Collectors.groupingBy(
                            ChatReaction::getMessageId,
                            Collectors.groupingBy(
                                    ChatReaction::getEmoji,
                                    Collectors.mapping(ChatReaction::getUsername, Collectors.toList())
                            )
                    ));
        }
        
        Map<Long, Map<String, List<String>>> finalReactionsMap = messageReactionsMap;
        
        List<ChatMessageDto> history = messages.stream()
                .map(msg -> ChatMessageDto.builder()
                        .id(msg.getId())
                        .content(msg.getContent())
                        .senderName(msg.getSenderName())
                        .senderRole(msg.getSenderRole())
                        .type(msg.getType())
                        .mediaUrl(msg.getMediaUrl())
                        .timestamp(msg.getTimestamp())
                        .replyToId(msg.getReplyToId())
                        .replyToContent(msg.getReplyToContent())
                        .replyToSender(msg.getReplyToSender())
                        .reactions(finalReactionsMap.getOrDefault(msg.getId(), new HashMap<>()))
                        .build())
                .collect(Collectors.toList());
        
        // Reverse so that the oldest is first, newest is last in the UI
        Collections.reverse(history);
        return history;
    }

    @Transactional
    public ChatReactionResponseDto addReaction(ChatReactionDto dto) {
        Optional<ChatReaction> existingOpt = chatReactionRepository
                .findByMessageIdAndUsername(dto.getMessageId(), dto.getUsername());
        
        if (existingOpt.isPresent()) {
            ChatReaction existing = existingOpt.get();
            // If same emoji, toggle off
            if (existing.getEmoji().equals(dto.getEmoji())) {
                chatReactionRepository.delete(existing);
            } else {
                // Change emoji
                existing.setEmoji(dto.getEmoji());
                existing.setTimestamp(LocalDateTime.now());
                chatReactionRepository.save(existing);
            }
        } else {
            // New reaction
            ChatReaction newReaction = ChatReaction.builder()
                    .messageId(dto.getMessageId())
                    .username(dto.getUsername())
                    .emoji(dto.getEmoji())
                    .timestamp(LocalDateTime.now())
                    .build();
            chatReactionRepository.save(newReaction);
        }
        
        return ChatReactionResponseDto.builder()
                .messageId(dto.getMessageId())
                .reactions(getReactionsMap(dto.getMessageId()))
                .build();
    }

    private Map<String, List<String>> getReactionsMap(Long messageId) {
        List<ChatReaction> reactions = chatReactionRepository.findByMessageId(messageId);
        return reactions.stream()
                .collect(Collectors.groupingBy(
                        ChatReaction::getEmoji,
                        Collectors.mapping(ChatReaction::getUsername, Collectors.toList())
                ));
    }
}
