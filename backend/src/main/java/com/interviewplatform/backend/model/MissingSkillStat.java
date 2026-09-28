package com.interviewplatform.backend.model;

public class MissingSkillStat {
    private String name;
    private int count;
    private int percentage;

    public MissingSkillStat() {}

    public MissingSkillStat(String name, int count, int percentage) {
        this.name = name;
        this.count = count;
        this.percentage = percentage;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public int getPercentage() { return percentage; }
    public void setPercentage(int percentage) { this.percentage = percentage; }
}
