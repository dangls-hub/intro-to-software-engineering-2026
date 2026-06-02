package com.bluemoon.ams.module.auth.controller;

import com.bluemoon.ams.module.auth.dto.LoginRequest;
import com.bluemoon.ams.module.auth.dto.LoginResponse;
import com.bluemoon.ams.module.auth.entity.Role;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.service.AuthService;
import com.bluemoon.ams.common.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests cho AuthController
 * Test các luồng: login, getCurrentUser
 */
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private LoginRequest loginRequest;
    private LoginResponse loginResponse;
    private User testUser;

    @BeforeEach
    public void setUp() {
        // Chuẩn bị test data
        testUser = User.builder()
                .id(1L)
                .username("admin")
                .password("hashedPassword123")
                .role(Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        loginRequest = LoginRequest.builder()
                .username("admin")
                .password("password123")
                .build();

        loginResponse = LoginResponse.builder()
                .token("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .userId(1L)
                .username("admin")
                .role("ADMIN")
                .message("Đăng nhập thành công")
                .build();
    }

    /**
     * Test login thành công
     */
    @Test
    public void testLogin_Success() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value(notNullValue()))
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    /**
     * Test login với username không tồn tại
     */
    @Test
    public void testLogin_UserNotFound() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new com.bluemoon.ams.common.exception.ResourceNotFoundException("Người dùng không tồn tại"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Người dùng không tồn tại"));
    }

    /**
     * Test login với mật khẩu sai
     */
    @Test
    public void testLogin_InvalidPassword() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Mật khẩu không đúng"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Tên đăng nhập hoặc mật khẩu không chính xác."));
    }

    /**
     * Test login với username trống
     */
    @Test
    public void testLogin_EmptyUsername() throws Exception {
        // Arrange
        LoginRequest invalidRequest = LoginRequest.builder()
                .username("")
                .password("password123")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Test getCurrentUser thành công
     */
    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testGetCurrentUser_Success() throws Exception {
        // Arrange
        when(authService.getUserByUsername("admin")).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    /**
     * Test getCurrentUser mà không có token
     */
    @Test
    public void testGetCurrentUser_NoToken() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/auth/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test getCurrentUser với token không hợp lệ
     */
    @Test
    public void testGetCurrentUser_InvalidToken() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer invalidtoken")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test getCurrentUser với username không tồn tại
     */
    @Test
    @WithMockUser(username = "nonexistent", roles = {"ADMIN"})
    public void testGetCurrentUser_UserNotFound() throws Exception {
        // Arrange
        when(authService.getUserByUsername("nonexistent"))
                .thenThrow(new com.bluemoon.ams.common.exception.ResourceNotFoundException("Người dùng không tồn tại"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
