package com.interviewplatform.backend.dto;

public class AnswerEvaluationResponse {

    private String aiFeedback;
    private int score;

    public AnswerEvaluationResponse() {}

    public AnswerEvaluationResponse(String aiFeedback, int score) {
        this.aiFeedback = aiFeedback;
        this.score = score;
    }

    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}
