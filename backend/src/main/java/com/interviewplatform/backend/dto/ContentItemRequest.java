package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;

public class ContentItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Content type is required")
    private String type; // QUIZ, MOCK_TEST, CODING_TEST, CODING_PROBLEM, MOCK_INTERVIEW, PRACTICE_TOPIC, ARTICLE

    @NotBlank(message = "Subject/Domain is required")
    private String subject;

    private List<String> topics = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private String difficulty = "Medium";
    private Map<String, Integer> difficultySplit = new HashMap<>();
    private String status = "DRAFT";

    private Map<String, Object> settings = new HashMap<>();
    private Map<String, Object> contentData = new HashMap<>();

    public ContentItemRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics != null ? topics : new ArrayList<>(); }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Map<String, Integer> getDifficultySplit() { return difficultySplit; }
    public void setDifficultySplit(Map<String, Integer> difficultySplit) { this.difficultySplit = difficultySplit != null ? difficultySplit : new HashMap<>(); }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Map<String, Object> getSettings() { return settings; }
    public void setSettings(Map<String, Object> settings) { this.settings = settings != null ? settings : new HashMap<>(); }

    public Map<String, Object> getContentData() { return contentData; }
    public void setContentData(Map<String, Object> contentData) { this.contentData = contentData != null ? contentData : new HashMap<>(); }
}
