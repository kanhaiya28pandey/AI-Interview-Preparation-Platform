package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "practice_topics")
public class PracticeTopic {

    @Id
    private String id;

    private String title;
    private String category;
    private String difficulty; // "Easy" | "Medium" | "Hard"
    private String description;
    private int questionsCount;
    private int completedCount;
    private String icon;
    private List<String> tags = new ArrayList<>();

    public PracticeTopic() {}

    public PracticeTopic(String id, String title, String category, String difficulty, String description, int questionsCount, int completedCount, String icon, List<String> tags) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.difficulty = difficulty;
        this.description = description;
        this.questionsCount = questionsCount;
        this.completedCount = completedCount;
        this.icon = icon;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getQuestionsCount() { return questionsCount; }
    public void setQuestionsCount(int questionsCount) { this.questionsCount = questionsCount; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
