package com.interviewplatform.backend.dto;

public class AdminUserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String joinedDate;
    private String lastActive;
    private int interviewsCompleted;

    public AdminUserDto() {
    }

    public AdminUserDto(String id, String name, String email, String role, String status,
                        String joinedDate, String lastActive, int interviewsCompleted) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.joinedDate = joinedDate;
        this.lastActive = lastActive;
        this.interviewsCompleted = interviewsCompleted;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public String getLastActive() { return lastActive; }
    public void setLastActive(String lastActive) { this.lastActive = lastActive; }

    public int getInterviewsCompleted() { return interviewsCompleted; }
    public void setInterviewsCompleted(int interviewsCompleted) { this.interviewsCompleted = interviewsCompleted; }
}
