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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.entity.ResidentStatus;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final ResidentRepository residentRepository;

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
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Vui lòng đăng nhập để đổi mật khẩu");
        }
        String username = authentication.getName();
        authService.changePassword(username, request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
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

        Long apartmentId = null;
        String apartmentCode = null;
        if (user.getRole() == com.bluemoon.ams.module.auth.entity.Role.RESIDENT) {
            List<Resident> residents = residentRepository.findByFullName(user.getFullName());
            if (residents != null && !residents.isEmpty()) {
                Resident r = residents.stream()
                        .filter(res -> res.getStatus() == ResidentStatus.ACTIVE)
                        .findFirst()
                        .orElse(residents.get(0));
                if (r.getApartment() != null) {
                    apartmentId = r.getApartment().getId();
                    apartmentCode = r.getApartment().getRoomNumber();
                }
            }
        }

        UserInfoResponse response = UserInfoResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName() != null ? user.getFullName() : "")
                .role(user.getRole().toString())
                .apartmentId(apartmentId)
                .apartmentCode(apartmentCode)
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin user thành công", response));
    }
}
