package com.interviewplatform.backend.service;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.interviewplatform.backend.dto.AuthResponse;
import com.interviewplatform.backend.dto.ForgotPasswordRequest;
import com.interviewplatform.backend.dto.LoginRequest;
import com.interviewplatform.backend.dto.RegisterRequest;
import com.interviewplatform.backend.dto.ResetPasswordRequest;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.repository.UserRepository;
import com.interviewplatform.backend.security.JwtService;
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
}

    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // Create new user
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Hash password before storing
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Normal registration creates a student account
        user.setRole("STUDENT");

        // Save to MongoDB
        User savedUser = userRepository.save(user);

        // Never return the password
        return new AuthResponse(
        "Registration successful",
        null,
        savedUser.getId(),
        savedUser.getName(),
        savedUser.getEmail(),
        savedUser.getRole()
        );
    }
    public AuthResponse login(LoginRequest request) {

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        // Verify password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT
        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );

        // Login successful
        return new AuthResponse(
                "Login successful",
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
    public String forgotPassword(ForgotPasswordRequest request) {

    // Find user by email
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() ->
                    new RuntimeException("User not found with this email")
            );

    // Generate a unique reset token
    String resetToken = UUID.randomUUID().toString();

    // Token expires after 15 minutes
    LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

    // Store token and expiry in MongoDB
    user.setResetToken(resetToken);
    user.setResetTokenExpiry(expiryTime);

    userRepository.save(user);

    // For development/testing only
    return resetToken;
}
    public String resetPassword(ResetPasswordRequest request) {

        // Find user using reset token
        User user = userRepository.findAll()
                .stream()
                .filter(u -> request.getToken().equals(u.getResetToken()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Invalid reset token")
                );

        // Check whether token has expired
        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {

            throw new RuntimeException("Reset token has expired");
        }

        // Hash the new password
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        // Remove reset token after successful password reset
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        // Save updated user
        userRepository.save(user);

        return "Password reset successful";
    }
}