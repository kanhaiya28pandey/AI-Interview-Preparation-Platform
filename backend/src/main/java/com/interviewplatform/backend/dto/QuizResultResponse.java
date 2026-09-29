package com.interviewplatform.backend.dto;

public class QuizResultResponse {

    private String topicId;
    private int score;
    private int totalQuestions;
    private double percentage;
    private boolean passed;
    private int xpEarned;

    public QuizResultResponse() {}

    public QuizResultResponse(String topicId, int score, int totalQuestions, double percentage, boolean passed, int xpEarned) {
        this.topicId = topicId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.passed = passed;
        this.xpEarned = xpEarned;
    }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; }
}
