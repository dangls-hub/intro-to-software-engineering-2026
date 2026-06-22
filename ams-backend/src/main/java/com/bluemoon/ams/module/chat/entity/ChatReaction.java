package com.bluemoon.ams.module.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_reactions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"messageId", "username"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long messageId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, length = 10)
    private String emoji;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
