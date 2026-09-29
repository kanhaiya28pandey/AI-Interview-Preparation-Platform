package com.interviewplatform.backend.model;

public class RoleFitItem {
    private String roleName;
    private int score;

    public RoleFitItem() {}

    public RoleFitItem(String roleName, int score) {
        this.roleName = roleName;
        this.score = score;
    }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}
