package com.interviewplatform.backend.model;

public class ArticleAuthor {
    private String name;
    private String role;
    private String avatar;

    public ArticleAuthor() {}

    public ArticleAuthor(String name, String role, String avatar) {
        this.name = name;
        this.role = role;
        this.avatar = avatar;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
