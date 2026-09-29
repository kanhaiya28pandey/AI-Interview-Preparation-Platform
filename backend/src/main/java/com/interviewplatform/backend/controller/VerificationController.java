package com.interviewplatform.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.VerificationStatusResponse;
import com.interviewplatform.backend.dto.VerificationSubmissionRequest;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.service.VerificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/verification")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @GetMapping("/status")
    public ResponseEntity<VerificationStatusResponse> getStatus(
            Authentication authentication,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String email
    ) {
        String targetEmail = (email != null && !email.isBlank()) ? email : (authentication != null ? authentication.getName() : null);
        VerificationStatusResponse response = verificationService.getVerificationStatus(targetEmail, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit")
    public ResponseEntity<Verification> submitVerification(
            Authentication authentication,
            @Valid @RequestBody VerificationSubmissionRequest request
    ) {
        String authEmail = authentication.getName();
        Verification saved = verificationService.submitVerification(authEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
