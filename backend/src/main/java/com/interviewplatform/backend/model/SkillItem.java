package com.interviewplatform.backend.model;

public class SkillItem {
    private String name;
    private String category; // "Technical", "Tools", "Soft Skills"
    private String proficiency; // "Beginner", "Intermediate", "Advanced", "Expert"

    public SkillItem() {}

    public SkillItem(String name, String category, String proficiency) {
        this.name = name;
        this.category = category;
        this.proficiency = proficiency;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getProficiency() { return proficiency; }
    public void setProficiency(String proficiency) { this.proficiency = proficiency; }
}
