package com.bluemoon.ams.module.auth.service;

import com.bluemoon.ams.module.auth.dto.LoginRequest;
import com.bluemoon.ams.module.auth.dto.LoginResponse;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
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
    
    // JwtUtil sẽ được tạo bởi Đỗ Hải Đăng trong common/security/JwtUtil.java
    // AuthService sẽ gọi nó để tạo token

    /**
     * Xác thực user và trả JWT token
     * Note: Logic tạo JWT token sẽ được hoàn thành khi JwtUtil sẵn sàng
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

            // TODO: Tạo JWT token (sẽ được implement khi JwtUtil sẵn sàng)
            // String token = jwtUtil.generateToken(user);

            return LoginResponse.builder()
                    .token(null)  // Sẽ được set khi JwtUtil sẵn sàng
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
}
