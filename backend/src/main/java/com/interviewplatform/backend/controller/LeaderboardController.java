package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.LeaderboardUser;
import com.interviewplatform.backend.service.LeaderboardService;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardUser>> getLeaderboard(
            Authentication authentication,
            @RequestParam(defaultValue = "all") String filter
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        List<LeaderboardUser> leaderboard = leaderboardService.getLeaderboard(filter, authEmail);
        return ResponseEntity.ok(leaderboard);
    }
}
