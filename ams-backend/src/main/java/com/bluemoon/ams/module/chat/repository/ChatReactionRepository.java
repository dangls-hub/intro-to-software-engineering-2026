package com.bluemoon.ams.module.chat.repository;

import com.bluemoon.ams.module.chat.entity.ChatReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatReactionRepository extends JpaRepository<ChatReaction, Long> {
    List<ChatReaction> findByMessageId(Long messageId);
    Optional<ChatReaction> findByMessageIdAndUsername(Long messageId, String username);
    List<ChatReaction> findByMessageIdIn(List<Long> messageIds);
    void deleteByMessageId(Long messageId);
}
