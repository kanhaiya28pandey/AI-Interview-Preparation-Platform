package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.InterviewRole;
import com.interviewplatform.backend.service.InterviewService;

@RestController
@RequestMapping({"/api/v1/admin/mock-interviews", "/api/admin/mock-interviews"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminInterviewController {

    private final InterviewService interviewService;

    public AdminInterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping
    public ResponseEntity<List<InterviewRole>> getAllMockInterviewTracks() {
        List<InterviewRole> roles = interviewService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @PostMapping
    public ResponseEntity<InterviewRole> saveMockInterviewTrack(@RequestBody InterviewRole role) {
        InterviewRole saved = interviewService.saveRole(role);
        return ResponseEntity.ok(saved);
    }
}
