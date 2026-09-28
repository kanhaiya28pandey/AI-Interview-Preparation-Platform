package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "interview_sessions")
public class InterviewSession {

    @Id
    private String id; // e.g. "session-172750..."

    @Indexed
    private String userId;

    @Indexed
    private String email;

    private String roleId;
    private String roleTitle;
    private String startedAt;
    private String completedAt;
    private String status = "IN_PROGRESS"; // "IN_PROGRESS", "COMPLETED"

    private List<QuestionAnswer> answers = new ArrayList<>();
    private InterviewFeedback feedback;

    public InterviewSession() {}

    public InterviewSession(String id, String userId, String email, String roleId, String roleTitle, String startedAt) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.roleId = roleId;
        this.roleTitle = roleTitle;
        this.startedAt = startedAt;
        this.status = "IN_PROGRESS";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }

    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }

    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<QuestionAnswer> getAnswers() { return answers; }
    public void setAnswers(List<QuestionAnswer> answers) { this.answers = answers; }

    public InterviewFeedback getFeedback() { return feedback; }
    public void setFeedback(InterviewFeedback feedback) { this.feedback = feedback; }
}
