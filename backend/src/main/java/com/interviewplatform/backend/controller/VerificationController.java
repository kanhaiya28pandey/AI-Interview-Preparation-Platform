package com.interviewplatform.backend.controller;

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

import com.interviewplatform.backend.dto.VerificationStatusResponse;
import com.interviewplatform.backend.dto.VerificationSubmissionRequest;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.service.FileStorageService;
import com.interviewplatform.backend.service.VerificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/verification", "/api/v1/verifications"})
public class VerificationController {

    private final VerificationService verificationService;
    private final FileStorageService fileStorageService;

    public VerificationController(VerificationService verificationService, FileStorageService fileStorageService) {
        this.verificationService = verificationService;
        this.fileStorageService = fileStorageService;
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

    @PostMapping("/submit")
    public ResponseEntity<Verification> submitVerification(
            Authentication authentication,
            @Valid @RequestBody VerificationSubmissionRequest request
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        Verification saved = verificationService.submitVerification(authEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
