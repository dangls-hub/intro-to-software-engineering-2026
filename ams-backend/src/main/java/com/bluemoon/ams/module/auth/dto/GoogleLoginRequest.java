package com.bluemoon.ams.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body cho endpoint POST /api/v1/auth/google
 * Frontend gửi Google ID Token (JWT) nhận được từ Google lên đây.
 */
@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Google ID Token không được để trống")
    private String idToken;
}
