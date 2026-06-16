package com.bluemoon.ams.module.notification.controller;

import com.bluemoon.ams.module.notification.service.NotificationService;
// import com.bluemoon.ams.common.security.UserDetailsImpl; // Giả định dựa trên cấu trúc Spring Security thông thường
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private final com.bluemoon.ams.module.auth.repository.UserRepository userRepository;

    // Lấy userId thực tế từ username trong JWT
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Unauthorized");
        }
        
        String username = (String) authentication.getPrincipal();
        com.bluemoon.ams.module.auth.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId, page, limit));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        Long userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "All marked as read"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Notification deleted"));
    }

    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllNotifications() {
        Long userId = getCurrentUserId();
        notificationService.deleteAllNotifications(userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications deleted"));
    }
}
