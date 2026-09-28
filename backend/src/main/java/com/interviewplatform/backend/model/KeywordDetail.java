package com.interviewplatform.backend.model;

public class KeywordDetail {
    private String keyword;
    private boolean present;
    private int count;
    private String importance; // "Critical" | "Recommended" | "Bonus"

    public KeywordDetail() {}

    public KeywordDetail(String keyword, boolean present, int count, String importance) {
        this.keyword = keyword;
        this.present = present;
        this.count = count;
        this.importance = importance;
    }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public boolean isPresent() { return present; }
    public void setPresent(boolean present) { this.present = present; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public String getImportance() { return importance; }
    public void setImportance(String importance) { this.importance = importance; }
}
