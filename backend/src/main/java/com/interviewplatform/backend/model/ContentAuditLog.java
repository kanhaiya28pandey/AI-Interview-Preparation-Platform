package com.interviewplatform.backend.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "content_audit_logs")
public class ContentAuditLog {

    @Id
    private String id;

    private String contentId;
    private String contentTitle;
    private String contentType;
    private String action; // CREATE, UPDATE, PUBLISH, UNPUBLISH, ARCHIVE, DELETE, RESTORE
    private String performedBy;
    private Instant timestamp = Instant.now();
    private String details;

    public ContentAuditLog() {}

    public ContentAuditLog(String contentId, String contentTitle, String contentType, String action, String performedBy, String details) {
        this.contentId = contentId;
        this.contentTitle = contentTitle;
        this.contentType = contentType;
        this.action = action;
        this.performedBy = performedBy;
        this.details = details;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContentId() { return contentId; }
    public void setContentId(String contentId) { this.contentId = contentId; }

    public String getContentTitle() { return contentTitle; }
    public void setContentTitle(String contentTitle) { this.contentTitle = contentTitle; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
