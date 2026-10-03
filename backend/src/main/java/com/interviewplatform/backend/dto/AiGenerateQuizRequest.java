package com.interviewplatform.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class AiGenerateQuizRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Topic is required")
    private String topic;

    private String difficulty = "Medium";

    @Min(value = 1, message = "At least 1 question is required")
    @Max(value = 20, message = "Maximum 20 questions can be generated at once")
    private int questionCount = 5;

    public AiGenerateQuizRequest() {}

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
}
