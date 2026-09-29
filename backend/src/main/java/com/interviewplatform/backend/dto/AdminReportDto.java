package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AdminReportDto {
    private List<Map<String, Object>> userGrowth = new ArrayList<>();
    private List<Map<String, Object>> interviewStats = new ArrayList<>();
    private List<Map<String, Object>> difficultyDistribution = new ArrayList<>();

    public AdminReportDto() {
    }

    public AdminReportDto(List<Map<String, Object>> userGrowth,
                          List<Map<String, Object>> interviewStats,
                          List<Map<String, Object>> difficultyDistribution) {
        this.userGrowth = userGrowth;
        this.interviewStats = interviewStats;
        this.difficultyDistribution = difficultyDistribution;
    }

    public List<Map<String, Object>> getUserGrowth() { return userGrowth; }
    public void setUserGrowth(List<Map<String, Object>> userGrowth) { this.userGrowth = userGrowth; }

    public List<Map<String, Object>> getInterviewStats() { return interviewStats; }
    public void setInterviewStats(List<Map<String, Object>> interviewStats) { this.interviewStats = interviewStats; }

    public List<Map<String, Object>> getDifficultyDistribution() { return difficultyDistribution; }
    public void setDifficultyDistribution(List<Map<String, Object>> difficultyDistribution) { this.difficultyDistribution = difficultyDistribution; }
}
