package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.ReviewVerificationRequest;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.service.VerificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/admin/verifications", "/api/admin/verifications", "/admin/verifications"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationController {

    private final VerificationService verificationService;
    private final com.interviewplatform.backend.service.NotificationService notificationService;

    public AdminVerificationController(VerificationService verificationService, com.interviewplatform.backend.service.NotificationService notificationService) {
        this.verificationService = verificationService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Verification>> getAllVerifications(
            @RequestParam(required = false) String status
    ) {
        List<Verification> list = verificationService.getAllSubmissions(status);
        return ResponseEntity.ok(list);
    }

    @PostMapping({"/{verificationId}/review", "/student/{userId}/review"})
    public ResponseEntity<Verification> reviewVerification(
            @PathVariable(required = false) String verificationId,
            @PathVariable(required = false) String userId,
            @Valid @RequestBody ReviewVerificationRequest request
    ) {
        String targetId = (verificationId != null && !verificationId.isBlank()) ? verificationId : userId;
        Verification reviewed = verificationService.reviewVerification(targetId, request);
        if (reviewed != null && reviewed.getUserId() != null) {
            try {
                boolean isVerified = "Verified".equalsIgnoreCase(reviewed.getStatus());
                notificationService.notifyUser(
                        reviewed.getUserId(),
                        "verification",
                        "Identity Verification " + reviewed.getStatus(),
                        isVerified
                                ? "Congratulations! Your college ID has been verified. All pro features and verified placement tracks are now unlocked."
                                : "Your verification could not be approved. Reason: " + (request.getRejectionNotes() != null ? request.getRejectionNotes() : "Document details mismatch") + ". Please re-upload your ID.",
                        "/verify-identity",
                        isVerified ? "success" : "danger"
                );
            } catch (Exception ignored) {
            }
        }
        return ResponseEntity.ok(reviewed);
    }
}
