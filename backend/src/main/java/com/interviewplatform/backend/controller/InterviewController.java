package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.AnswerEvaluationResponse;
import com.interviewplatform.backend.dto.StartInterviewRequest;
import com.interviewplatform.backend.dto.SubmitAnswerRequest;
import com.interviewplatform.backend.model.InterviewFeedback;
import com.interviewplatform.backend.model.InterviewQuestion;
import com.interviewplatform.backend.model.InterviewRole;
import com.interviewplatform.backend.model.InterviewSession;
import com.interviewplatform.backend.service.InterviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/interview")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping("/roles")
    public ResponseEntity<List<InterviewRole>> getRoles() {
        List<InterviewRole> roles = interviewService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/roles/{roleId}")
    public ResponseEntity<InterviewRole> getRoleById(@PathVariable String roleId) {
        InterviewRole role = interviewService.getRoleById(roleId);
        return ResponseEntity.ok(role);
    }

    @GetMapping("/roles/{roleId}/questions")
    public ResponseEntity<List<InterviewQuestion>> getQuestions(@PathVariable String roleId) {
        List<InterviewQuestion> questions = interviewService.getQuestionsByRoleId(roleId);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/start")
    public ResponseEntity<InterviewSession> startSession(
            Authentication authentication,
            @Valid @RequestBody StartInterviewRequest request
    ) {
        String authEmail = authentication.getName();
        InterviewSession session = interviewService.startSession(authEmail, request.getRoleId());
        return ResponseEntity.ok(session);
    }

    @PostMapping("/submit-answer")
    public ResponseEntity<AnswerEvaluationResponse> submitAnswer(
            Authentication authentication,
            @Valid @RequestBody SubmitAnswerRequest request
    ) {
        String authEmail = authentication.getName();
        AnswerEvaluationResponse evaluation = interviewService.submitAnswer(authEmail, request);
        return ResponseEntity.ok(evaluation);
    }

    @GetMapping("/feedback/{sessionId}")
    public ResponseEntity<InterviewFeedback> getFeedback(@PathVariable String sessionId) {
        InterviewFeedback feedback = interviewService.getFeedback(sessionId);
        return ResponseEntity.ok(feedback);
    }
}
