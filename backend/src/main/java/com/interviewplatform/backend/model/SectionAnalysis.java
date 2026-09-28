package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

public class SectionAnalysis {
    private String name; // "Summary", "Experience", "Skills", "Projects", "Education"
    private String status; // "good", "needs-improvement", "missing"
    private int score;
    private String extractedContent;
    private List<String> suggestions = new ArrayList<>();

    public SectionAnalysis() {}

    public SectionAnalysis(String name, String status, int score, String extractedContent, List<String> suggestions) {
        this.name = name;
        this.status = status;
        this.score = score;
        this.extractedContent = extractedContent;
        this.suggestions = suggestions != null ? suggestions : new ArrayList<>();
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getExtractedContent() { return extractedContent; }
    public void setExtractedContent(String extractedContent) { this.extractedContent = extractedContent; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
}
