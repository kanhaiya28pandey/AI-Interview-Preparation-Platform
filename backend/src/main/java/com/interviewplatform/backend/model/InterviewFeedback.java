package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

public class InterviewFeedback {
    private String sessionId;
    private String roleTitle;
    private String date;
    private int overallScore;
    private InterviewScores scores = new InterviewScores();
    private List<String> strengths = new ArrayList<>();
    private List<String> areasForImprovement = new ArrayList<>();
    private String detailedFeedback;
    private List<TranscriptItem> transcripts = new ArrayList<>();

    public InterviewFeedback() {}

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }

    public InterviewScores getScores() { return scores; }
    public void setScores(InterviewScores scores) { this.scores = scores; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getAreasForImprovement() { return areasForImprovement; }
    public void setAreasForImprovement(List<String> areasForImprovement) { this.areasForImprovement = areasForImprovement; }

    public String getDetailedFeedback() { return detailedFeedback; }
    public void setDetailedFeedback(String detailedFeedback) { this.detailedFeedback = detailedFeedback; }

    public List<TranscriptItem> getTranscripts() { return transcripts; }
    public void setTranscripts(List<TranscriptItem> transcripts) { this.transcripts = transcripts; }
}
