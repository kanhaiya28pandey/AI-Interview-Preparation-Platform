package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

public class JdMatchDetail {

    private boolean jobDescriptionProvided = false;
    private int matchScore = 0;
    private List<String> matchingKeywords = new ArrayList<>();
    private List<String> missingKeywords = new ArrayList<>();
    private String experienceMatch = "Not evaluated";
    private String roleAlignment = "Not evaluated";
    private List<String> recommendations = new ArrayList<>();

    public JdMatchDetail() {}

    public JdMatchDetail(
            boolean jobDescriptionProvided,
            int matchScore,
            List<String> matchingKeywords,
            List<String> missingKeywords,
            String experienceMatch,
            String roleAlignment,
            List<String> recommendations
    ) {
        this.jobDescriptionProvided = jobDescriptionProvided;
        this.matchScore = matchScore;
        this.matchingKeywords = matchingKeywords != null ? matchingKeywords : new ArrayList<>();
        this.missingKeywords = missingKeywords != null ? missingKeywords : new ArrayList<>();
        this.experienceMatch = experienceMatch;
        this.roleAlignment = roleAlignment;
        this.recommendations = recommendations != null ? recommendations : new ArrayList<>();
    }

    public boolean isJobDescriptionProvided() {
        return jobDescriptionProvided;
    }

    public void setJobDescriptionProvided(boolean jobDescriptionProvided) {
        this.jobDescriptionProvided = jobDescriptionProvided;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public List<String> getMatchingKeywords() {
        return matchingKeywords;
    }

    public void setMatchingKeywords(List<String> matchingKeywords) {
        this.matchingKeywords = matchingKeywords != null ? matchingKeywords : new ArrayList<>();
    }

    public List<String> getMissingKeywords() {
        return missingKeywords;
    }

    public void setMissingKeywords(List<String> missingKeywords) {
        this.missingKeywords = missingKeywords != null ? missingKeywords : new ArrayList<>();
    }

    public String getExperienceMatch() {
        return experienceMatch;
    }

    public void setExperienceMatch(String experienceMatch) {
        this.experienceMatch = experienceMatch;
    }

    public String getRoleAlignment() {
        return roleAlignment;
    }

    public void setRoleAlignment(String roleAlignment) {
        this.roleAlignment = roleAlignment;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations != null ? recommendations : new ArrayList<>();
    }
}
