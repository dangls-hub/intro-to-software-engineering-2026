package com.bluemoon.ams.module.notification.service;

import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.notification.dto.NotificationResponse;
import com.bluemoon.ams.module.notification.entity.Notification;
import com.bluemoon.ams.module.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Map<String, Object> getUserNotifications(Long userId, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Notification> notificationPage = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
        
        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        long unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("data", content);
        response.put("unreadCount", unreadCount);
        response.put("currentPage", page);
        response.put("totalItems", notificationPage.getTotalElements());
        response.put("totalPages", notificationPage.getTotalPages());

        return response;
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        // Trong thực tế cần custom query trong Repository để update hiệu quả hơn (updateMany)
        // Đây là cách đơn giản:
        List<Notification> unreadList = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient().getId().equals(userId) && !n.isRead())
                .collect(Collectors.toList());
                
        for (Notification notification : unreadList) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadList);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to access this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to access this notification");
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public void deleteAllNotifications(Long userId) {
        List<Notification> userNotifications = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient().getId().equals(userId))
                .collect(Collectors.toList());
        notificationRepository.deleteAll(userNotifications);
    }

    @Transactional
    public void createAndSendNotification(Long recipientId, Long senderId, String type, String contentStr, String link) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));
                
        User sender = null;
        if (senderId != null) {
            sender = userRepository.findById(senderId).orElse(null);
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .type(type)
                .content(contentStr)
                .link(link)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        // Send via WebSocket to specific user channel (/user/{userId}/queue/notifications)
        NotificationResponse response = mapToResponse(notification);
        messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/notifications",
                response
        );
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientId(n.getRecipient().getId())
                .senderId(n.getSender() != null ? n.getSender().getId() : null)
                .senderName(n.getSender() != null ? n.getSender().getFullName() : null)
                .type(n.getType())
                .content(n.getContent())
                .link(n.getLink())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
