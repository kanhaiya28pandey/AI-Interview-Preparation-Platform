package com.interviewplatform.backend.controller;

import java.util.Collections;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.interviewplatform.backend.dto.AuthResponse;
import com.interviewplatform.backend.dto.ForgotPasswordRequest;
import com.interviewplatform.backend.dto.LoginRequest;
import com.interviewplatform.backend.dto.RegisterRequest;
import com.interviewplatform.backend.dto.ResetPasswordRequest;
import com.interviewplatform.backend.dto.UserSummaryResponse;
import com.interviewplatform.backend.service.AuthService;
import com.interviewplatform.backend.service.FileStorageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
public class AuthController {

    private final AuthService authService;
    private final FileStorageService fileStorageService;

    public AuthController(AuthService authService, FileStorageService fileStorageService) {
        this.authService = authService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestParam String email) {
        boolean exists = authService.checkEmailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> registerMultipart(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "idCard", required = false) MultipartFile idCardFile
    ) {
        RegisterRequest request = new RegisterRequest();
        request.setName(name);
        request.setEmail(email);
        request.setPassword(password);

        AuthResponse response = authService.register(request);

        if (idCardFile != null && !idCardFile.isEmpty()) {
            fileStorageService.storeFile(idCardFile, "verifications");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/upload-id", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadIdCard(
            @RequestParam("file") MultipartFile file
    ) {
        String storedPath = fileStorageService.storeFile(file, "verifications");
        return ResponseEntity.ok(Map.of(
                "fileUrl", storedPath,
                "fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "id_card",
                "message", "ID document uploaded successfully"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of(
                "message", "A 6-digit OTP has been sent to your registered email address.",
                "email", request.getEmail().trim().toLowerCase()
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String response = authService.resetPassword(request);
        return ResponseEntity.ok(Collections.singletonMap("message", response));
    }

    @GetMapping("/me")
    public ResponseEntity<UserSummaryResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        UserSummaryResponse response = authService.getCurrentUser(email);
        return ResponseEntity.ok(response);
    }
}