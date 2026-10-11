package com.interviewplatform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "support_tickets")
public class SupportTicket {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String category; // "Bug Report", "Feature Request", "Account Issue", "Feedback", "Other"
    private String subject;
    private String description;
    private String attachmentName;
    private String attachmentDataUrl;

    private String status = "Open"; // "Open", "In Review", "Resolved"
    private String priority = "Medium"; // "Low", "Medium", "High", "Critical"
    private String resolutionNotes;
    private String adminReply;
    private String resolvedAt;
    private String resolvedBy;
    private String createdAt;
    private String userName;
    private String userEmail;

    public SupportTicket() {
    }

    public SupportTicket(String id, String userId, String category, String subject, String description,
                         String attachmentName, String attachmentDataUrl, String status,
                         String createdAt, String userName, String userEmail) {
        this.id = id;
        this.userId = userId;
        this.category = category;
        this.subject = subject;
        this.description = description;
        this.attachmentName = attachmentName;
        this.attachmentDataUrl = attachmentDataUrl;
        this.status = status;
        this.createdAt = createdAt;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public String getAttachmentDataUrl() { return attachmentDataUrl; }
    public void setAttachmentDataUrl(String attachmentDataUrl) { this.attachmentDataUrl = attachmentDataUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public String getAdminReply() { return adminReply; }
    public void setAdminReply(String adminReply) { this.adminReply = adminReply; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
