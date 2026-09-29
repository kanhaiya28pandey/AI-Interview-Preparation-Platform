package com.interviewplatform.backend.model;

public class QuestionAnswer {
    private String questionId;
    private String questionText;
    private String answerText;
    private int score;
    private String aiFeedback;

    public QuestionAnswer() {}

    public QuestionAnswer(String questionId, String questionText, String answerText, int score, String aiFeedback) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.answerText = answerText;
        this.score = score;
        this.aiFeedback = aiFeedback;
    }

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }
}
