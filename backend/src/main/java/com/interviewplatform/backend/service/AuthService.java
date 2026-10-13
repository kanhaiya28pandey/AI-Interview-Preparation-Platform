package com.interviewplatform.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.interviewplatform.backend.dto.AuthResponse;
import com.interviewplatform.backend.dto.ForgotPasswordRequest;
import com.interviewplatform.backend.dto.LoginRequest;
import com.interviewplatform.backend.dto.RegisterRequest;
import com.interviewplatform.backend.dto.ResetPasswordRequest;
import com.interviewplatform.backend.dto.UserSummaryResponse;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.model.UserProfile;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.repository.VerificationRepository;
import com.interviewplatform.backend.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final VerificationRepository verificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            VerificationRepository verificationRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.verificationRepository = verificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    public boolean checkEmailExists(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return userRepository.existsByEmail(email.trim().toLowerCase());
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalStateException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("STUDENT");
        user.setVerificationStatus("Pending Verification");
        user.setBlocked(false);

        User savedUser = userRepository.save(user);

        // Automatically initialize UserProfile
        UserProfile profile = new UserProfile(savedUser.getId(), savedUser.getName(), savedUser.getEmail());
        profile.setRole("STUDENT");
        profile.setVerificationStatus("Pending Verification");
        profile.setUpdatedAt(LocalDateTime.now().toString());
        userProfileRepository.save(profile);

        // Automatically create pending verification record for student in admin queue
        if ("STUDENT".equalsIgnoreCase(savedUser.getRole())) {
            try {
                if (!verificationRepository.existsByUserId(savedUser.getId())) {
                    Verification verification = new Verification();
                    verification.setVerificationId("VER-2026-" + (1000 + secureRandom.nextInt(9000)));
                    verification.setUserId(savedUser.getId());
                    verification.setStudentName(savedUser.getName());
                    verification.setEmail(savedUser.getEmail());
                    verification.setStatus("Pending Verification");
                    verification.setSubmittedAt(LocalDateTime.now().toString());
                    verification.setCollegeName("Pending ID upload");
                    verification.setRollNumber("Pending ID upload");
                    verification.setCourseBranch("General");
                    verification.setYearSemester("Year 1");
                    verification.setIdCardFrontUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?w=600");
                    verificationRepository.save(verification);

                    notificationService.notifyAdmins(
                            "verification",
                            "New Student Registration: " + savedUser.getName(),
                            savedUser.getName() + " (" + savedUser.getEmail() + ") registered and is awaiting identity verification.",
                            "/admin/verifications",
                            "warning"
                    );

                    notificationService.notifyUser(
                            savedUser.getId(),
                            "verification",
                            "Registration Received",
                            "Welcome to AI Interview Prep! Your account is pending admin verification. Action tasks will unlock once verified.",
                            "/verify-identity",
                            "info"
                    );
                }
            } catch (Exception ex) {
                // Non-blocking fallback
            }
        }

        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        return new AuthResponse(
                "Registration successful",
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getVerificationStatus(),
                savedUser.getAvatarUrl()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.isBlocked()) {
            throw new IllegalStateException("Your account has been deactivated. Please contact administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new AuthResponse(
                "Login successful",
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getVerificationStatus(),
                user.getAvatarUrl()
        );
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account registered with this email address. Please check your email or create an account."));

        int otpNumber = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(otpNumber);
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

        user.setResetToken(otp);
        user.setResetTokenExpiry(expiryTime);
        userRepository.save(user);

        emailService.sendPasswordResetOtp(normalizedEmail, otp);

        return otp;
    }

    public String resetPassword(ResetPasswordRequest request) {
        String otp = request.getOtp();
        if (otp == null || otp.isBlank()) {
            otp = request.getToken();
        }

        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("6-digit OTP is required");
        }

        final String finalOtp = otp.trim();
        User user;

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                    .filter(u -> finalOtp.equals(u.getResetToken()))
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired 6-digit OTP"));
        } else {
            user = userRepository.findByResetToken(finalOtp)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired 6-digit OTP"));
        }

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired. Please request a new OTP.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        return "Password has been successfully reset. You can now log in.";
    }

    public UserSummaryResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getVerificationStatus()
        );
    }
}