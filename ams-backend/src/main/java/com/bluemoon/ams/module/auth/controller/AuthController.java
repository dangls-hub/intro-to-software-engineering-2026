package com.bluemoon.ams.module.auth.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.auth.dto.LoginRequest;
import com.bluemoon.ams.module.auth.dto.LoginResponse;
import com.bluemoon.ams.module.auth.dto.UserInfoResponse;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;

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
     * API lấy thông tin user hiện tại (cần token hợp lệ)
     * GET /api/v1/auth/me
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getCurrentUser() {
        // Lấy authentication từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Không được phép truy cập");
        }

        // Lấy username từ authentication
        String username = authentication.getName();
        
        // Lấy thông tin user từ database
        User user = authService.getUserByUsername(username);

        UserInfoResponse response = UserInfoResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole().toString())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin user thành công", response));
    }
}
