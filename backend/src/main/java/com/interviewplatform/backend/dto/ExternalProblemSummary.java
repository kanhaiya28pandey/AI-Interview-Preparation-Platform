package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class ExternalProblemSummary {

    private String id;
    private String title;
    private String slug;
    private String source; // LEETCODE, CODEFORCES, GEEKSFORGEEKS
    private String difficulty; // Easy, Medium, Hard
    private String category;
    private List<String> topicTags = new ArrayList<>();
    private String acceptance = "N/A";
    private boolean isPaidOnly = false;
    private String externalUrl;
    private boolean isAlreadyImported = false;

    public ExternalProblemSummary() {}

    public ExternalProblemSummary(String id, String title, String slug, String source, String difficulty, String category, List<String> topicTags, String acceptance, boolean isPaidOnly, String externalUrl) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.source = source;
        this.difficulty = difficulty;
        this.category = category;
        this.topicTags = topicTags != null ? topicTags : new ArrayList<>();
        this.acceptance = acceptance;
        this.isPaidOnly = isPaidOnly;
        this.externalUrl = externalUrl;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getTopicTags() { return topicTags; }
    public void setTopicTags(List<String> topicTags) { this.topicTags = topicTags != null ? topicTags : new ArrayList<>(); }

    public String getAcceptance() { return acceptance; }
    public void setAcceptance(String acceptance) { this.acceptance = acceptance; }

    public boolean isPaidOnly() { return isPaidOnly; }
    public void setPaidOnly(boolean paidOnly) { isPaidOnly = paidOnly; }

    public String getExternalUrl() { return externalUrl; }
    public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }

    public boolean isAlreadyImported() { return isAlreadyImported; }
    public void setAlreadyImported(boolean alreadyImported) { isAlreadyImported = alreadyImported; }
}
