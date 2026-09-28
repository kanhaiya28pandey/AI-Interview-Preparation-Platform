package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.interviewplatform.backend.model.AdminResumeAnalytics;
import com.interviewplatform.backend.model.ResumeAnalysis;
import com.interviewplatform.backend.service.ResumeService;

@RestController
@RequestMapping("/api/v1")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping(value = "/resume/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeAnalysis> analyzeResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "role", defaultValue = "Frontend Developer") String role,
            @RequestParam(value = "field", defaultValue = "IT Services") String field,
            @RequestParam(value = "jobDescription", required = false) String jobDescription
    ) {
        String authEmail = authentication.getName();
        ResumeAnalysis result = resumeService.analyzeResume(authEmail, file, role, field, jobDescription);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/resume/history")
    public ResponseEntity<List<ResumeAnalysis>> getResumeHistory(Authentication authentication) {
        String authEmail = authentication.getName();
        List<ResumeAnalysis> history = resumeService.getUserHistory(authEmail);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/admin/resume-analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminResumeAnalytics> getAdminResumeAnalytics() {
        AdminResumeAnalytics analytics = resumeService.getAdminAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
