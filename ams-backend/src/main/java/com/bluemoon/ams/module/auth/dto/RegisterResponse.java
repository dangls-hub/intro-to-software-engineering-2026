package com.bluemoon.ams.module.auth.dto;

public class RegisterResponse {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String message;

    public RegisterResponse() {}

    public RegisterResponse(Long userId, String username, String email,
                            String fullName, String role, String message) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.message = message;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long userId;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String message;

        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder message(String message) { this.message = message; return this; }

        public RegisterResponse build() {
            return new RegisterResponse(userId, username, email, fullName, role, message);
        }
    }

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
}
