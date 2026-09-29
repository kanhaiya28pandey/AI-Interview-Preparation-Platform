package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CohortAnalyticsDto {
    private int totalStudents;
    private int avgActivityScore;
    private int verifiedPercentage;
    private int atRiskCount;
    private int inactiveCount;

    private List<Map<String, Object>> courseAverages = new ArrayList<>();
    private List<Map<String, Object>> branchAverages = new ArrayList<>();
    private List<Map<String, Object>> topStruggledTopics = new ArrayList<>();
    private List<Map<String, Object>> interviewRatingDistribution = new ArrayList<>();
    private List<Map<String, Object>> topPerformers = new ArrayList<>();

    public CohortAnalyticsDto() {
    }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public int getAvgActivityScore() { return avgActivityScore; }
    public void setAvgActivityScore(int avgActivityScore) { this.avgActivityScore = avgActivityScore; }

    public int getVerifiedPercentage() { return verifiedPercentage; }
    public void setVerifiedPercentage(int verifiedPercentage) { this.verifiedPercentage = verifiedPercentage; }

    public int getAtRiskCount() { return atRiskCount; }
    public void setAtRiskCount(int atRiskCount) { this.atRiskCount = atRiskCount; }

    public int getInactiveCount() { return inactiveCount; }
    public void setInactiveCount(int inactiveCount) { this.inactiveCount = inactiveCount; }

    public List<Map<String, Object>> getCourseAverages() { return courseAverages; }
    public void setCourseAverages(List<Map<String, Object>> courseAverages) { this.courseAverages = courseAverages; }

    public List<Map<String, Object>> getBranchAverages() { return branchAverages; }
    public void setBranchAverages(List<Map<String, Object>> branchAverages) { this.branchAverages = branchAverages; }

    public List<Map<String, Object>> getTopStruggledTopics() { return topStruggledTopics; }
    public void setTopStruggledTopics(List<Map<String, Object>> topStruggledTopics) { this.topStruggledTopics = topStruggledTopics; }

    public List<Map<String, Object>> getInterviewRatingDistribution() { return interviewRatingDistribution; }
    public void setInterviewRatingDistribution(List<Map<String, Object>> interviewRatingDistribution) { this.interviewRatingDistribution = interviewRatingDistribution; }

    public List<Map<String, Object>> getTopPerformers() { return topPerformers; }
    public void setTopPerformers(List<Map<String, Object>> topPerformers) { this.topPerformers = topPerformers; }
}
