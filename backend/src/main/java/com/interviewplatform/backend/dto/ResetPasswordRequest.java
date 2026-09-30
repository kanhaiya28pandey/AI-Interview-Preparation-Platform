package com.interviewplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    private String token;
    private String otp;
    private String email;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;

    public ResetPasswordRequest() {
    }

    public String getToken() {
        if (token != null && !token.isBlank()) {
            return token.trim();
        }
        return otp != null ? otp.trim() : null;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getOtp() {
        if (otp != null && !otp.isBlank()) {
            return otp.trim();
        }
        return token != null ? token.trim() : null;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getEmail() {
        return email != null ? email.trim().toLowerCase() : null;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}