package com.interviewplatform.backend.model;

public class MissingSkillDetail {
    private String name;
    private String importance; // "Critical" | "High" | "Medium"
    private String tooltip;

    public MissingSkillDetail() {}

    public MissingSkillDetail(String name, String importance, String tooltip) {
        this.name = name;
        this.importance = importance;
        this.tooltip = tooltip;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImportance() { return importance; }
    public void setImportance(String importance) { this.importance = importance; }

    public String getTooltip() { return tooltip; }
    public void setTooltip(String tooltip) { this.tooltip = tooltip; }
}
