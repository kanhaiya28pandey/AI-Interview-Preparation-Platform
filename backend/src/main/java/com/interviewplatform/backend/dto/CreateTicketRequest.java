package com.interviewplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateTicketRequest {

    @NotBlank(message = "Category is required")
    private String category; // "Bug Report" | "Feature Request" | "Account Issue" | "Feedback" | "Other"

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    private String attachmentName;
    private String attachmentDataUrl;

    public CreateTicketRequest() {
    }

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
}
