package com.bluemoon.ams.module.chat.repository;

import com.bluemoon.ams.module.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findAllByOrderByTimestampDesc(Pageable pageable);
    List<ChatMessage> findByPinnedTrueOrderByTimestampDesc();
}
