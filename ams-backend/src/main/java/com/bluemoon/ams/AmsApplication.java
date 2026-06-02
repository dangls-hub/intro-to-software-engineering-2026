package com.bluemoon.ams;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.entity.Role;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AmsApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@bluemoon.vn");
                admin.setFullName("Administrator");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
        };
    }
}
