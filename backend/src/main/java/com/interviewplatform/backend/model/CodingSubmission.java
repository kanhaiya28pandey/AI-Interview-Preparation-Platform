package com.interviewplatform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "coding_submissions")
public class CodingSubmission {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String email;

    @Indexed
    private String problemId;

    private String language;
    private String code;
    private String status; // "ACCEPTED", "WRONG_ANSWER", etc.
    private double runtimeMs;
    private int memoryMb;
    private int passedTests;
    private int totalTests;
    private String submittedAt;

    public CodingSubmission() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getRuntimeMs() { return runtimeMs; }
    public void setRuntimeMs(double runtimeMs) { this.runtimeMs = runtimeMs; }

    public int getMemoryMb() { return memoryMb; }
    public void setMemoryMb(int memoryMb) { this.memoryMb = memoryMb; }

    public int getPassedTests() { return passedTests; }
    public void setPassedTests(int passedTests) { this.passedTests = passedTests; }

    public int getTotalTests() { return totalTests; }
    public void setTotalTests(int totalTests) { this.totalTests = totalTests; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
}
