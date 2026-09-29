package com.interviewplatform.backend.dto;

import java.util.HashMap;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;

public class QuizSubmissionRequest {

    @NotBlank(message = "Topic ID is required")
    private String topicId;

    private Map<String, Integer> answers = new HashMap<>(); // questionId -> selectedIndex

    public QuizSubmissionRequest() {}

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public Map<String, Integer> getAnswers() { return answers; }
    public void setAnswers(Map<String, Integer> answers) { this.answers = answers; }
}
