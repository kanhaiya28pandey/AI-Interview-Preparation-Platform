package com.interviewplatform.backend.model;

public class RoleDistributionStat {
    private String role;
    private int count;
    private int percentage;
    private String color;

    public RoleDistributionStat() {}

    public RoleDistributionStat(String role, int count, int percentage, String color) {
        this.role = role;
        this.count = count;
        this.percentage = percentage;
        this.color = color;
    }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public int getPercentage() { return percentage; }
    public void setPercentage(int percentage) { this.percentage = percentage; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
