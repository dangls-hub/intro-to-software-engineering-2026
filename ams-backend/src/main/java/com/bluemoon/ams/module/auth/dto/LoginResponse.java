package com.bluemoon.ams.module.auth.dto;

public class LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String message;
    private Long apartmentId;
    private String apartmentCode;

    public LoginResponse() {}

    public LoginResponse(String token, Long userId, String username, String email,
                         String fullName, String role, String message,
                         Long apartmentId, String apartmentCode) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.message = message;
        this.apartmentId = apartmentId;
        this.apartmentCode = apartmentCode;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private Long userId;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String message;
        private Long apartmentId;
        private String apartmentCode;

        public Builder token(String token) { this.token = token; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
        public Builder apartmentCode(String apartmentCode) { this.apartmentCode = apartmentCode; return this; }

        public LoginResponse build() {
            return new LoginResponse(token, userId, username, email, fullName, role, message, apartmentId, apartmentCode);
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getApartmentId() { return apartmentId; }
    public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
    public String getApartmentCode() { return apartmentCode; }
    public void setApartmentCode(String apartmentCode) { this.apartmentCode = apartmentCode; }
}
