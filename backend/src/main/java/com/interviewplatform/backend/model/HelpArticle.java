package com.interviewplatform.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "help_articles")
public class HelpArticle {

    @Id
    private String id;

    @Indexed
    private String category;

    private String question;
    private String answer;
    private int helpfulCount = 0;
    private int unhelpfulCount = 0;
    private List<String> tags = new ArrayList<>();
    private String author = "Platform Admin";
    private String createdAt = Instant.now().toString();
    private String updatedAt = Instant.now().toString();

    public HelpArticle() {
    }

    public HelpArticle(String id, String category, String question, String answer, List<String> tags, String author) {
        this.id = id;
        this.category = category;
        this.question = question;
        this.answer = answer;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.author = author != null ? author : "Platform Admin";
        this.createdAt = Instant.now().toString();
        this.updatedAt = Instant.now().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public int getHelpfulCount() { return helpfulCount; }
    public void setHelpfulCount(int helpfulCount) { this.helpfulCount = helpfulCount; }

    public int getUnhelpfulCount() { return unhelpfulCount; }
    public void setUnhelpfulCount(int unhelpfulCount) { this.unhelpfulCount = unhelpfulCount; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
