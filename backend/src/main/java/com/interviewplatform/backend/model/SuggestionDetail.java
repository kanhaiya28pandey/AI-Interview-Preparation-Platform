package com.interviewplatform.backend.model;

public class SuggestionDetail {
    private String id;
    private String section; // "Summary" | "Experience" | "Skills" | "Projects" | "Education"
    private String priority; // "High" | "Medium" | "Low"
    private String text;
    private String whyItMatters;

    public SuggestionDetail() {}

    public SuggestionDetail(String id, String section, String priority, String text, String whyItMatters) {
        this.id = id;
        this.section = section;
        this.priority = priority;
        this.text = text;
        this.whyItMatters = whyItMatters;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getWhyItMatters() { return whyItMatters; }
    public void setWhyItMatters(String whyItMatters) { this.whyItMatters = whyItMatters; }
}
