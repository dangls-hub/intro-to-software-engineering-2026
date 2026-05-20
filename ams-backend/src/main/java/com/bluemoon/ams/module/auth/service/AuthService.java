package com.bluemoon.ams.module.auth.service;

import com.bluemoon.ams.module.auth.dto.LoginRequest;
import com.bluemoon.ams.module.auth.dto.LoginResponse;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.common.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Xác thực user và trả JWT token
     */
    public LoginResponse login(LoginRequest request) {
        try {
            // Tìm user theo username
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            // Kiểm tra mật khẩu
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Mật khẩu không đúng");
            }

            // Tạo JWT token
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

            return LoginResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .role(user.getRole().toString())
                    .message("Đăng nhập thành công")
                    .build();
        } catch (RuntimeException e) {
            log.error("Login error: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Load UserDetails từ username (dùng cho Spring Security)
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
    }

    /**
     * Lấy thông tin user theo ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
    }
}
