package com.bluemoon.ams.module.auth.repository;

import com.bluemoon.ams.module.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Tìm user theo username
     */
    Optional<User> findByUsername(String username);

    /**
     * Tìm user theo email
     */
    Optional<User> findByEmail(String email);

    /**
     * Tìm user theo reset token
     */
    Optional<User> findByResetToken(String resetToken);

    /**
     * Kiểm tra xem username có tồn tại không
     */
    boolean existsByUsername(String username);

    /**
     * Kiểm tra xem email có tồn tại không
     */
    boolean existsByEmail(String email);
}
