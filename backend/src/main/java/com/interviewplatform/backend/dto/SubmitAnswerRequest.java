package com.interviewplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class SubmitAnswerRequest {

    @NotBlank(message = "Role ID is required")
    private String roleId;

    @NotBlank(message = "Question ID is required")
    private String questionId;

    @NotBlank(message = "Answer text is required")
    private String answerText;

    private String sessionId;

    public SubmitAnswerRequest() {}

    public SubmitAnswerRequest(String roleId, String questionId, String answerText) {
        this.roleId = roleId;
        this.questionId = questionId;
        this.answerText = answerText;
    }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}
