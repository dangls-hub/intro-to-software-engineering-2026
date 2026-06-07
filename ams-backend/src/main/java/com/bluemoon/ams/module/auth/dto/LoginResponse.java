package com.bluemoon.ams.module.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;              // JWT token (do Đỗ Hải Đăng cung cấp qua JwtUtil)
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String role;               // ADMIN, STAFF hoặc RESIDENT
    private String message;
    private Long apartmentId;
    private String apartmentCode;
}
