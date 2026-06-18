package com.bluemoon.ams.module.chat.controller;

import com.bluemoon.ams.module.chat.dto.ChatMessageDto;
import com.bluemoon.ams.module.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // Receive message from client via WebSocket
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessageDto sendMessage(@Payload ChatMessageDto chatMessageDto) {
        // Save to database and return the saved message (with ID and timestamp) to broadcast to all clients
        return chatService.saveMessage(chatMessageDto);
    }

    // REST endpoint to load chat history
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(@RequestParam(defaultValue = "50") int limit) {
        List<ChatMessageDto> history = chatService.getChatHistory(limit);
        return ResponseEntity.ok(history);
    }
}
