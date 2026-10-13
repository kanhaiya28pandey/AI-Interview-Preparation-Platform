package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class AiGenerateInterviewRequest {

    @NotBlank(message = "Target role is required")
    private String role;

    @NotBlank(message = "Interview type is required")
    private String interviewType; // Technical, HR, Behavioral, System Design, Mixed

    private List<String> topics = new ArrayList<>();

    private String difficulty = "Medium";

    @Min(value = 1, message = "At least 1 question is required")
    @Max(value = 15, message = "Maximum 15 questions can be generated at once")
    private int questionCount = 5;

    public AiGenerateInterviewRequest() {}

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics != null ? topics : new ArrayList<>(); }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
}
