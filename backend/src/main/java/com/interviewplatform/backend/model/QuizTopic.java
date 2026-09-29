package com.interviewplatform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "quiz_topics")
public class QuizTopic {

    @Id
    private String id;

    private String title;
    private String description;
    private String category;
    private int questionCount;
    private int timeLimitMinutes;
    private String icon;

    public QuizTopic() {}

    public QuizTopic(String id, String title, String description, String category, int questionCount, int timeLimitMinutes, String icon) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.questionCount = questionCount;
        this.timeLimitMinutes = timeLimitMinutes;
        this.icon = icon;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }

    public int getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(int timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
