package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

public class AdminResumeAnalytics {
    private double avgAtsScore;
    private String scoreTrend;
    private int totalResumesAnalyzed;
    private List<MissingSkillStat> topMissingSkills = new ArrayList<>();
    private List<RoleDistributionStat> roleDistribution = new ArrayList<>();

    public AdminResumeAnalytics() {}

    public AdminResumeAnalytics(double avgAtsScore, String scoreTrend, int totalResumesAnalyzed, List<MissingSkillStat> topMissingSkills, List<RoleDistributionStat> roleDistribution) {
        this.avgAtsScore = avgAtsScore;
        this.scoreTrend = scoreTrend;
        this.totalResumesAnalyzed = totalResumesAnalyzed;
        this.topMissingSkills = topMissingSkills != null ? topMissingSkills : new ArrayList<>();
        this.roleDistribution = roleDistribution != null ? roleDistribution : new ArrayList<>();
    }

    public double getAvgAtsScore() { return avgAtsScore; }
    public void setAvgAtsScore(double avgAtsScore) { this.avgAtsScore = avgAtsScore; }

    public String getScoreTrend() { return scoreTrend; }
    public void setScoreTrend(String scoreTrend) { this.scoreTrend = scoreTrend; }

    public int getTotalResumesAnalyzed() { return totalResumesAnalyzed; }
    public void setTotalResumesAnalyzed(int totalResumesAnalyzed) { this.totalResumesAnalyzed = totalResumesAnalyzed; }

    public List<MissingSkillStat> getTopMissingSkills() { return topMissingSkills; }
    public void setTopMissingSkills(List<MissingSkillStat> topMissingSkills) { this.topMissingSkills = topMissingSkills; }

    public List<RoleDistributionStat> getRoleDistribution() { return roleDistribution; }
    public void setRoleDistribution(List<RoleDistributionStat> roleDistribution) { this.roleDistribution = roleDistribution; }
}
