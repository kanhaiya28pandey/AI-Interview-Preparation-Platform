package com.interviewplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ReviewVerificationRequest {

    @NotBlank(message = "Action is required (APPROVE or REJECT)")
    private String action; // "APPROVE" or "REJECT"

    private String rejectionCategory;
    private String rejectionNotes;

    public ReviewVerificationRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getRejectionCategory() { return rejectionCategory; }
    public void setRejectionCategory(String rejectionCategory) { this.rejectionCategory = rejectionCategory; }

    public String getRejectionNotes() { return rejectionNotes; }
    public void setRejectionNotes(String rejectionNotes) { this.rejectionNotes = rejectionNotes; }
}
