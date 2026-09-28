package com.interviewplatform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "interview_roles")
public class InterviewRole {

    @Id
    private String id;

    private String title;
    private String category;
    private String difficulty; // "Junior" | "Mid-Level" | "Senior" | "Lead"
    private int durationMinutes;
    private String description;
    private String icon;
    private int totalQuestions;
    private String status = "ACTIVE"; // "ACTIVE" | "INACTIVE"

    public InterviewRole() {}

    public InterviewRole(String id, String title, String category, String difficulty, int durationMinutes, String description, String icon, int totalQuestions) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.difficulty = difficulty;
        this.durationMinutes = durationMinutes;
        this.description = description;
        this.icon = icon;
        this.totalQuestions = totalQuestions;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
