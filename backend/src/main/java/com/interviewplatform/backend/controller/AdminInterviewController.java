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

import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import com.interviewplatform.backend.model.InterviewQuestion;
import com.interviewplatform.backend.service.AiInterviewService;

@RestController
@RequestMapping({"/api/v1/admin/mock-interviews", "/api/admin/mock-interviews"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminInterviewController {

    private final InterviewService interviewService;
    private final AiInterviewService aiInterviewService;

    public AdminInterviewController(InterviewService interviewService, AiInterviewService aiInterviewService) {
        this.interviewService = interviewService;
        this.aiInterviewService = aiInterviewService;
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

    @PutMapping("/{id}")
    public ResponseEntity<InterviewRole> updateMockInterviewTrack(@PathVariable String id, @RequestBody InterviewRole role) {
        role.setId(id);
        InterviewRole updated = interviewService.saveRole(role);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMockInterviewTrack(@PathVariable String id) {
        interviewService.deleteRole(id);
        return ResponseEntity.ok(Map.of("message", "Mock interview track deleted successfully", "id", id));
    }

    public static class QuestionGenerateRequest {
        public String roleTitle;
        public String subject;
        public List<String> topics;
        public String difficulty;
        public Integer count;
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<List<InterviewQuestion>> generateQuestions(@RequestBody QuestionGenerateRequest request) {
        String roleTitle = request.roleTitle != null ? request.roleTitle : "Software Engineer";
        String subject = request.subject != null ? request.subject : "Technical";
        List<String> topics = request.topics != null ? request.topics : List.of();
        String difficulty = request.difficulty != null ? request.difficulty : "Medium";
        int count = request.count != null ? request.count : 5;

        List<InterviewQuestion> questions = aiInterviewService.generateQuestions(roleTitle, subject, topics, difficulty, count);
        return ResponseEntity.ok(questions);
    }
}
