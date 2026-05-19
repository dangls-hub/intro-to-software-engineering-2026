package com.bluemoon.ams.module.auth.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.auth.dto.LoginRequest;
import com.bluemoon.ams.module.auth.dto.LoginResponse;
import com.bluemoon.ams.module.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
     * API lấy thông tin user hiện tại (cần token)
     * GET /api/v1/auth/me
     * Note: Sẽ được hoàn thành khi Spring Security được cấu hình
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok("Chức năng này sẽ được hoàn thành sau khi Spring Security được cấu hình");
    }
}
