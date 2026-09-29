package com.interviewplatform.backend.model;

public class AnalysisHistoryItem {
    private String id;
    private String date;
    private String role;
    private int score;
    private String fileName;

    public AnalysisHistoryItem() {}

    public AnalysisHistoryItem(String id, String date, String role, int score, String fileName) {
        this.id = id;
        this.date = date;
        this.role = role;
        this.score = score;
        this.fileName = fileName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}
