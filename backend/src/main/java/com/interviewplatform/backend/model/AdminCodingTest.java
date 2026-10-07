package com.interviewplatform.backend.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "admin_coding_tests")
public class AdminCodingTest {

    @Id
    private String id;
    private String title;
    private String domain;
    private List<TopicConfig> topics = new ArrayList<>();
    private String difficulty = "Medium";
    private int submissionsCount = 0;
    private String passRate = "0%";
    private int durationMinutes = 60;
    private int totalMarks = 100;
    private int passingMarks = 60;
    private String status = "ACTIVE"; // "ACTIVE" | "DRAFT" | "IN_PROGRESS" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED"
    private String createdAt = LocalDate.now().toString();
    private String cancelReason;

    public AdminCodingTest() {}

    public AdminCodingTest(String id, String title, String domain, List<TopicConfig> topics, String difficulty, int submissionsCount, String passRate, String status, String createdAt) {
        this.id = id;
        this.title = title;
        this.domain = domain;
        this.topics = topics != null ? topics : new ArrayList<>();
        this.difficulty = difficulty;
        this.submissionsCount = submissionsCount;
        this.passRate = passRate;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public List<TopicConfig> getTopics() { return topics; }
    public void setTopics(List<TopicConfig> topics) { this.topics = topics != null ? topics : new ArrayList<>(); }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getSubmissionsCount() { return submissionsCount; }
    public void setSubmissionsCount(int submissionsCount) { this.submissionsCount = submissionsCount; }

    public String getPassRate() { return passRate; }
    public void setPassRate(String passRate) { this.passRate = passRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

    public int getPassingMarks() { return passingMarks; }
    public void setPassingMarks(int passingMarks) { this.passingMarks = passingMarks; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
}
