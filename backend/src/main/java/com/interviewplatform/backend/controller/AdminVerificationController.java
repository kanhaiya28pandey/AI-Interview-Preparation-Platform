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

import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api/v1/admin/verifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationController {

    private final VerificationService verificationService;

    public AdminVerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @GetMapping
    public ResponseEntity<List<Verification>> getAllVerifications(
            @RequestParam(required = false) String status
    ) {
        List<Verification> list = verificationService.getAllSubmissions(status);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{verificationId}/review")
    public ResponseEntity<Verification> reviewVerification(
            @PathVariable String verificationId,
            @Valid @RequestBody ReviewVerificationRequest request
    ) {
        Verification reviewed = verificationService.reviewVerification(verificationId, request);
        return ResponseEntity.ok(reviewed);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRejectedVerification(
            @PathVariable String id,
            Authentication authentication
    ) {
        String adminId = authentication != null ? authentication.getName() : "ADMIN";
        verificationService.deleteRejectedVerification(id, adminId);
        return ResponseEntity.ok(Map.of(
            "message", "Rejected profile successfully deleted",
            "id", id
        ));
    }

    @DeleteMapping("/rejected")
    public ResponseEntity<Map<String, Object>> deleteBulkRejectedVerifications(
            @RequestBody List<String> ids,
            Authentication authentication
    ) {
        String adminId = authentication != null ? authentication.getName() : "ADMIN";
        int count = verificationService.deleteBulkRejectedVerifications(ids, adminId);
        return ResponseEntity.ok(Map.of(
            "message", "Successfully deleted " + count + " rejected profiles",
            "count", count
        ));
    }
}
