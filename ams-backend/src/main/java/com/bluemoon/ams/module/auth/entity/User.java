package com.bluemoon.ams.module.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // nullable = true vì user đăng nhập bằng Google không có username
    @Column(unique = true, length = 100)
    private String username;

    // nullable = true vì user Google không có password
    @Column
    private String password;  // Lưu dưới dạng hash (BCrypt) — null với user Google

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "full_name", length = 200)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "reset_token", length = 64)
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== Google OAuth fields =====

    /** Google subject ID (sub) — định danh duy nhất từ Google */
    @Column(name = "google_id", unique = true, length = 50)
    private String googleId;

    /** URL ảnh đại diện từ Google */
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    /** Nhà cung cấp xác thực: LOCAL hoặc GOOGLE */
    @Column(name = "auth_provider", length = 20)
    private String authProvider;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // Đảm bảo authProvider luôn có giá trị trước khi lưu
        if (this.authProvider == null) this.authProvider = "LOCAL";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /* 
    public String getUsername() {
        return username;
    }
    */


}
