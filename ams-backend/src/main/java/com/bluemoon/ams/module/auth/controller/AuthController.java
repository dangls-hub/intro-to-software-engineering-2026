package com.bluemoon.ams.module.auth.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.auth.dto.*;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.service.AuthService;
import com.bluemoon.ams.common.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    /**
     * API đăng nhập
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    /**
     * API đăng ký tài khoản cư dân
     * POST /api/v1/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký thành công", response));
    }

    /**
     * API quên mật khẩu — tạo reset token
     * POST /api/v1/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String resetToken = authService.forgotPassword(request);
        // Trả về token cho mục đích demo (production sẽ gửi qua email)
        return ResponseEntity.ok(ApiResponse.ok("Mã đặt lại mật khẩu đã được tạo",
                Map.of("resetToken", resetToken,
                       "note", "Trong production, mã này sẽ được gửi qua email. Đây là demo.")));
    }

    /**
     * API đặt lại mật khẩu bằng reset token
     * POST /api/v1/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công", null));
    }

    /**
     * API đổi mật khẩu (cần đăng nhập)
     * POST /api/v1/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody ChangePasswordRequest request) {
        // Lấy username từ JWT token
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new RuntimeException("Vui lòng đăng nhập để đổi mật khẩu");
        }
        String token = authorization.substring(7);
        String username = jwtUtil.extractUsername(token);

        authService.changePassword(username, request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }

    /**
     * API lấy thông tin user hiện tại (cần token)
     * GET /api/v1/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new RuntimeException("Vui lòng đăng nhập");
        }
        String token = authorization.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = authService.getUserByUsername(username);

        Map<String, Object> userData = Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "role", user.getRole().toString()
        );

        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin thành công", userData));
    }
}
