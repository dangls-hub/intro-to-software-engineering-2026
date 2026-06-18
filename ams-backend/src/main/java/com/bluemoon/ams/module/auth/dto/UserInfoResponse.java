package com.bluemoon.ams.module.auth.dto;

public class UserInfoResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Long apartmentId;
    private String apartmentCode;

    public UserInfoResponse() {}

    public UserInfoResponse(Long id, String username, String email, String fullName,
                            String role, Long apartmentId, String apartmentCode) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.apartmentId = apartmentId;
        this.apartmentCode = apartmentCode;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private Long apartmentId;
        private String apartmentCode;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
        public Builder apartmentCode(String apartmentCode) { this.apartmentCode = apartmentCode; return this; }

        public UserInfoResponse build() {
            return new UserInfoResponse(id, username, email, fullName, role, apartmentId, apartmentCode);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getApartmentId() { return apartmentId; }
    public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
    public String getApartmentCode() { return apartmentCode; }
    public void setApartmentCode(String apartmentCode) { this.apartmentCode = apartmentCode; }
}
