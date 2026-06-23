package com.bluemoon.ams;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.entity.Role;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.entity.ApartmentStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AmsApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository, 
            ApartmentRepository apartmentRepository, 
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin User
            userRepository.findByUsername("admin").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    userRepository.save(admin);
                },
                () -> {
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setEmail("admin@bluemoon.vn");
                    admin.setFullName("Administrator");
                    admin.setRole(Role.ADMIN);
                    userRepository.save(admin);
                }
            );

            // Seed Staff User
            userRepository.findByUsername("staff").ifPresentOrElse(
                staff -> {
                    staff.setPassword(passwordEncoder.encode("staff123"));
                    userRepository.save(staff);
                },
                () -> {
                    User staff = new User();
                    staff.setUsername("staff");
                    staff.setPassword(passwordEncoder.encode("staff123"));
                    staff.setEmail("staff@bluemoon.vn");
                    staff.setFullName("Nhân viên BQL");
                    staff.setRole(Role.STAFF);
                    userRepository.save(staff);
                }
            );

            // Seed Default Apartments
            if (apartmentRepository.count() == 0) {
                apartmentRepository.save(Apartment.builder()
                        .roomNumber("A101")
                        .floor(1)
                        .area(75.5)
                        .status(ApartmentStatus.AVAILABLE)
                        .description("Căn hộ tầng 1, hướng Đông")
                        .build());
                apartmentRepository.save(Apartment.builder()
                        .roomNumber("A102")
                        .floor(1)
                        .area(90.0)
                        .status(ApartmentStatus.AVAILABLE)
                        .description("Căn hộ tầng 1, hướng Tây")
                        .build());
                apartmentRepository.save(Apartment.builder()
                        .roomNumber("B201")
                        .floor(2)
                        .area(110.0)
                        .status(ApartmentStatus.AVAILABLE)
                        .description("Căn hộ tầng 2, hướng Nam")
                        .build());
            }
        };
    }
}
