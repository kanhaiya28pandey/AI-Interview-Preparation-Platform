package com.interviewplatform.backend.model;

public class SubScores {
    private int keywordMatch;
    private int formatting;
    private int experienceRelevance;
    private int skillsMatch;
    private int educationMatch;
    private int actionVerbUsage;

    public SubScores() {}

    public SubScores(int keywordMatch, int formatting, int experienceRelevance, int skillsMatch, int educationMatch, int actionVerbUsage) {
        this.keywordMatch = keywordMatch;
        this.formatting = formatting;
        this.experienceRelevance = experienceRelevance;
        this.skillsMatch = skillsMatch;
        this.educationMatch = educationMatch;
        this.actionVerbUsage = actionVerbUsage;
    }

    public int getKeywordMatch() { return keywordMatch; }
    public void setKeywordMatch(int keywordMatch) { this.keywordMatch = keywordMatch; }

    public int getFormatting() { return formatting; }
    public void setFormatting(int formatting) { this.formatting = formatting; }

    public int getExperienceRelevance() { return experienceRelevance; }
    public void setExperienceRelevance(int experienceRelevance) { this.experienceRelevance = experienceRelevance; }

    public int getSkillsMatch() { return skillsMatch; }
    public void setSkillsMatch(int skillsMatch) { this.skillsMatch = skillsMatch; }

    public int getEducationMatch() { return educationMatch; }
    public void setEducationMatch(int educationMatch) { this.educationMatch = educationMatch; }

    public int getActionVerbUsage() { return actionVerbUsage; }
    public void setActionVerbUsage(int actionVerbUsage) { this.actionVerbUsage = actionVerbUsage; }
}
