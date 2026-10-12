package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class ExternalProblemImportRequest {

    private String source; // LEETCODE, CODEFORCES, GEEKSFORGEEKS
    private String slug;
    private String title;
    private String difficulty;
    private String category;
    private List<String> tags = new ArrayList<>();

    public ExternalProblemImportRequest() {}

    public ExternalProblemImportRequest(String source, String slug, String title, String difficulty, String category, List<String> tags) {
        this.source = source;
        this.slug = slug;
        this.title = title;
        this.difficulty = difficulty;
        this.category = category;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }
}
