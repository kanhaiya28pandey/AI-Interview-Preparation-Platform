package com.interviewplatform.backend.model;

import java.time.Instant;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String userId; // Specific user ID, or "admin_inbox", or "student_broadcast"
    private String audience; // "STUDENT", "ADMIN", "ALL"
    private String type; // "contest", "interview", "coding", "quiz", "resume", "placement", "streak", "profile", "content", "support", "verification", "system"
    private String title;
    private String message;
    private String createdAt; // ISO string
    private boolean read;
    private String link;
    private String priority; // "info", "success", "warning", "danger"
    private Map<String, Object> meta;

    public Notification() {
        this.createdAt = Instant.now().toString();
        this.read = false;
        this.priority = "info";
    }

    public Notification(String id, String userId, String audience, String type, String title, String message, String link, String priority) {
        this.id = id;
        this.userId = userId;
        this.audience = audience != null ? audience : "ALL";
        this.type = type != null ? type : "system";
        this.title = title;
        this.message = message;
        this.createdAt = Instant.now().toString();
        this.read = false;
        this.link = link;
        this.priority = priority != null ? priority : "info";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Map<String, Object> getMeta() { return meta; }
    public void setMeta(Map<String, Object> meta) { this.meta = meta; }
}
