package com.bluemoon.ams.module.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleLoginRequest {
    @NotBlank(message = "Google ID Token không được để trống")
    private String idToken;

    public GoogleLoginRequest() {}
    public GoogleLoginRequest(String idToken) { this.idToken = idToken; }

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
}
