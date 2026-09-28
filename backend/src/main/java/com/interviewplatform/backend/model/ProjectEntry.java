package com.interviewplatform.backend.model;

import java.util.List;

public class ProjectEntry {
    private String id;
    private String title;
    private List<String> techStack;
    private String description;
    private String link;

    public ProjectEntry() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<String> getTechStack() { return techStack; }
    public void setTechStack(List<String> techStack) { this.techStack = techStack; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}
