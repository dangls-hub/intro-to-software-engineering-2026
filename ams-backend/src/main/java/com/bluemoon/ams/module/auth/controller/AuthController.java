package com.bluemoon.ams.module.auth.controller;

import com.bluemoon.ams.module.auth.dto.LoginRequest;
import com.bluemoon.ams.module.auth.dto.LoginResponse;
import com.bluemoon.ams.module.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
     * 
     * Request body:
     * {
     *   "username": "admin",
     *   "password": "password123"
     * }
     * 
     * Response:
     * {
     *   "token": "eyJhbGciOiJIUzI1NiJ9...",
     *   "userId": 1,
     *   "username": "admin",
     *   "role": "ADMIN",
     *   "message": "Đăng nhập thành công"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(null, null, null, null, e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LoginResponse(null, null, null, null, "Lỗi server"));
        }
    }

    /**
     * API lấy thông tin user hiện tại (cần token)
     * GET /api/v1/auth/me
     * Note: Sẽ được hoàn thành khi Spring Security được cấu hình
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok("Chức năng này sẽ được hoàn thành sau khi Spring Security được cấu hình");
    }
}
