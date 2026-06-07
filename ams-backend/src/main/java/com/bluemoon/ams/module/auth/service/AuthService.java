package com.bluemoon.ams.module.auth.service;

import com.bluemoon.ams.module.auth.dto.*;
import com.bluemoon.ams.module.auth.entity.Role;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.common.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.entity.ResidentStatus;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ResidentRepository residentRepository;

    /**
     * Xác thực user và trả JWT token
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        try {
            // Tìm user theo username
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> {
                        log.warn("Login attempt with non-existent username: {}", request.getUsername());
                        return new ResourceNotFoundException("Người dùng không tồn tại");
                    });

            // Kiểm tra mật khẩu
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Failed login attempt for user: {}", request.getUsername());
                throw new BadCredentialsException("Mật khẩu không đúng");
            }

            // Tạo JWT token
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            log.info("Successful login for user: {}", request.getUsername());

            Long apartmentId = null;
            String apartmentCode = null;
            if (user.getRole() == Role.RESIDENT) {
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

            return LoginResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().toString())
                    .apartmentId(apartmentId)
                    .apartmentCode(apartmentCode)
                    .message("Đăng nhập thành công")
                    .build();
        } catch (RuntimeException e) {
            log.error("Login error: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Đăng ký tài khoản cư dân mới
     */
    public RegisterResponse register(RegisterRequest request) {
        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã được sử dụng");
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Tạo user mới với role RESIDENT
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.RESIDENT)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New resident registered: {}", savedUser.getUsername());

        return RegisterResponse.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().toString())
                .message("Đăng ký thành công")
                .build();
    }

    /**
     * Yêu cầu đặt lại mật khẩu — tạo reset token
     * Trong môi trường production sẽ gửi email, ở đây trả token trực tiếp để demo
     */
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        // Tạo reset token (UUID ngắn gọn)
        String resetToken = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30)); // Hết hạn sau 30 phút
        userRepository.save(user);

        log.info("Password reset token generated for user: {}", user.getUsername());

        // Trong production: gửi email chứa reset token
        // Ở đây trả về token trực tiếp cho mục đích demo
        return resetToken;
    }

    /**
     * Đặt lại mật khẩu bằng reset token
     */
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));

        // Kiểm tra token hết hạn
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.");
        }

        // Đặt lại mật khẩu
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        log.info("Password reset successful for user: {}", user.getUsername());
    }

    /**
     * Đổi mật khẩu (user đã đăng nhập)
     */
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        // Đặt mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getUsername());
    }

    /**
     * Load UserDetails từ username (dùng cho Spring Security)
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
    }

    /**
     * Lấy thông tin user theo ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
    }
}
