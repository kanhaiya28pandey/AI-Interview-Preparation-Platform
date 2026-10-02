package com.interviewplatform.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/readiness", "/api/readiness"})
public class ReadinessController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getReadinessScore(Authentication authentication) {
        String user = authentication != null ? authentication.getName() : "Student";

        Map<String, Object> breakdown = Map.of(
                "resumeAtsScore", 81,
                "codingScore", 88,
                "quizScore", 76,
                "mockInterviewGrade", 84,
                "streakBonus", 10
        );

        List<Map<String, Object>> weeklyTrend = List.of(
                Map.of("week", "W1", "score", 62),
                Map.of("week", "W2", "score", 68),
                Map.of("week", "W3", "score", 74),
                Map.of("week", "W4", "score", 82)
        );

        return ResponseEntity.ok(Map.of(
                "studentEmail", user,
                "overallScore", 82,
                "tier", "Placement Ready",
                "breakdown", breakdown,
                "weeklyTrend", weeklyTrend
        ));
    }
}
