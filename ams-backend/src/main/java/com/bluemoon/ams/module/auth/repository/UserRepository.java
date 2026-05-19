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
     * Kiểm tra xem username có tồn tại không
     */
    boolean existsByUsername(String username);
}
