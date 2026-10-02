package com.interviewplatform.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class SessionManagementController {

    // MCQ Quiz & Mock Interview sessions ALLOW cancellation
    @PostMapping({"/quiz/sessions/{sessionId}/cancel", "/interview/sessions/{sessionId}/cancel", "/mock-interview/sessions/{sessionId}/cancel"})
    public ResponseEntity<Map<String, Object>> cancelPracticeSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(Map.of(
                "sessionId", sessionId,
                "status", "CANCELLED",
                "message", "Practice session successfully cancelled. Progress was discarded without affecting scores or stats."
        ));
    }

    // Live assignments and coding tests REJECT cancellation requests with 400 Bad Request
    @PostMapping({"/coding-tests/sessions/{sessionId}/cancel", "/assignments/sessions/{sessionId}/cancel"})
    public ResponseEntity<Map<String, Object>> rejectTestCancel(@PathVariable String sessionId) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "sessionId", sessionId,
                "error", "CANCELLATION_FORBIDDEN",
                "message", "Cancellation is strictly forbidden for live coding tests and assignments. You must submit your work."
        ));
    }
}
