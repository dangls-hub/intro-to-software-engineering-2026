package com.bluemoon.ams.module.auth.service;

import com.bluemoon.ams.module.auth.dto.*;
import com.bluemoon.ams.module.auth.entity.Role;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.common.security.JwtUtil;
import com.bluemoon.ams.common.service.EmailService;
import com.bluemoon.ams.common.service.BlueMoonEmailService;
import com.bluemoon.ams.common.service.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.entity.ApprovalStatus;
import com.bluemoon.ams.module.resident.entity.ResidentStatus;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import java.util.Collections;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private ResidentRepository residentRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private BlueMoonEmailService blueMoonEmailService;
    @Autowired
    private OtpService otpService;

    @Value("${app.google.client-id}")
    private String googleClientId;

    /**
     * Gửi mã OTP tới email người dùng (xác thực đăng nhập / giao dịch).
     */
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email này"));
        String code = otpService.generate(email);
        blueMoonEmailService.sendOtpCode(email, user.getFullName(), code, OtpService.EXPIRATION_MINUTES);
        log.info("OTP đã gửi tới {}", email);
    }

    /**
     * Xác thực mã OTP. Trả về true nếu hợp lệ (và xoá mã sau khi dùng).
     */
    public boolean verifyOtp(String email, String code) {
        return otpService.verify(email, code);
    }

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
                Optional<Resident> resident = findMostRelevantResident(user);
                if (resident.isPresent() && resident.get().getApartment() != null) {
                    apartmentId = resident.get().getApartment().getId();
                    apartmentCode = resident.get().getApartment().getRoomNumber();
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
    @Transactional
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
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        // Tạo reset token (UUID ngắn gọn)
        String resetToken = UUID.randomUUID().toString().substring(0, 6).toUpperCase(); // 6 ký tự như OTP
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15)); // Hết hạn sau 15 phút
        userRepository.save(user);

        log.info("Password reset token generated for user: {}", user.getUsername());

        // Gửi email chứa reset token/OTP cho user
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
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
    @Transactional
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
     * Cập nhật hồ sơ cá nhân của người dùng hiện tại.
     */
    @Transactional
    public User updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        String newFullName = request.getFullName().trim();
        String newEmail = request.getEmail().trim();
        String oldFullName = user.getFullName();

        if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        user.setFullName(newFullName);
        user.setEmail(newEmail);

        if (user.getRole() == Role.RESIDENT) {
            List<Resident> linkedResidents = residentRepository.findByUser(user);
            if (linkedResidents.isEmpty() && oldFullName != null) {
                linkedResidents = residentRepository.findByUserIsNullAndFullName(oldFullName);
            }

            linkedResidents.forEach(resident -> {
                resident.setUser(user);
                if (oldFullName != null && !oldFullName.equals(newFullName)) {
                    resident.setFullName(newFullName);
                }
            });
        }

        return userRepository.save(user);
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

    // =========================================================================
    // Google OAuth
    // =========================================================================

    /**
     * Xác thực Google ID Token và trả về JWT của hệ thống.
     * Logic:
     *   1. Verify token với Google (chữ ký + expiry + audience)
     *   2. Tìm user theo google_id  → nếu có, đăng nhập ngay
     *   3. Tìm user theo email       → nếu có, liên kết google_id vào tài khoản cũ
     *   4. Tạo user mới nếu chưa tồn tại
     */
    @Transactional
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        // Bước 1: Verify ID Token với Google
        GoogleIdToken.Payload googlePayload = verifyGoogleToken(request.getIdToken());

        String googleId = googlePayload.getSubject();
        String email    = googlePayload.getEmail();
        String fullName = (String) googlePayload.get("name");
        String picture  = (String) googlePayload.get("picture");

        // Bước 2 & 3 & 4: Tìm hoặc tạo user
        User user = userRepository.findByGoogleId(googleId)
            .orElseGet(() -> userRepository.findByEmail(email)
                .map(existing -> {
                    // Tài khoản email đã tồn tại (LOCAL) → liên kết Google vào
                    existing.setGoogleId(googleId);
                    if (existing.getAvatarUrl() == null) existing.setAvatarUrl(picture);
                    existing.setAuthProvider("GOOGLE");
                    log.info("Linked Google account to existing user: {}", email);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    // Chưa có tài khoản → tạo mới
                    String gmailName = email.contains("@") ? email.substring(0, email.indexOf("@")) : email;
                    String finalUsername = gmailName;
                    int counter = 1;
                    while (userRepository.existsByUsername(finalUsername)) {
                        finalUsername = gmailName + counter;
                        counter++;
                    }

                    User newUser = User.builder()
                        .username(finalUsername)
                        .email(email)
                        .fullName(gmailName)
                        .googleId(googleId)
                        .avatarUrl(picture)
                        .authProvider("GOOGLE")
                        .role(Role.RESIDENT)
                        .build();
                    log.info("New user registered via Google: {}", email);
                    return userRepository.save(newUser);
                })
            );

        // Bước 5: Cấp JWT hệ thống
        // Dùng email làm subject cho user Google (không có username)
        String principal = (user.getUsername() != null) ? user.getUsername() : user.getEmail();
        String token = jwtUtil.generateToken(principal, user.getRole().name());

        // Lấy thông tin căn hộ nếu là RESIDENT
        Long apartmentId = null;
        String apartmentCode = null;
        if (user.getRole() == Role.RESIDENT) {
            Optional<Resident> resident = findMostRelevantResident(user);
            if (resident.isPresent() && resident.get().getApartment() != null) {
                apartmentId = resident.get().getApartment().getId();
                apartmentCode = resident.get().getApartment().getRoomNumber();
            }
        }

        log.info("Successful Google login for: {}", email);

        return LoginResponse.builder()
            .token(token)
            .userId(user.getId())
            .username(principal)
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole().toString())
            .apartmentId(apartmentId)
            .apartmentCode(apartmentCode)
            .message("Đăng nhập bằng Google thành công")
            .build();
    }

    /**
     * Gọi Google API để verify Google ID Token.
     * Thư viện tự động kiểm tra chữ ký, expiry, và audience (client-id).
     */
    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Google ID Token không hợp lệ hoặc đã hết hạn");
            }
            return idToken.getPayload();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            throw new RuntimeException("Xác thực Google thất bại: " + e.getMessage());
        }
    }

    private Optional<Resident> findMostRelevantResident(User user) {
        Optional<Resident> linked = residentRepository.findFirstByUserAndApprovalStatusOrderByCreatedAtDesc(user, ApprovalStatus.PENDING)
                .or(() -> residentRepository.findFirstByUserAndStatusOrderByCreatedAtDesc(user, ResidentStatus.ACTIVE))
                .or(() -> residentRepository.findFirstByUserOrderByCreatedAtDesc(user));
        if (linked.isPresent() || user.getFullName() == null || user.getFullName().isBlank()) {
            return linked;
        }

        Optional<Resident> legacy = residentRepository.findFirstByUserIsNullAndFullNameAndApprovalStatusOrderByCreatedAtDesc(user.getFullName(), ApprovalStatus.PENDING)
                .or(() -> residentRepository.findFirstByUserIsNullAndFullNameAndStatusOrderByCreatedAtDesc(user.getFullName(), ResidentStatus.ACTIVE))
                .or(() -> residentRepository.findFirstByUserIsNullAndFullNameOrderByCreatedAtDesc(user.getFullName()));
        legacy.ifPresent(resident -> resident.setUser(user));
        return legacy;
    }
}
