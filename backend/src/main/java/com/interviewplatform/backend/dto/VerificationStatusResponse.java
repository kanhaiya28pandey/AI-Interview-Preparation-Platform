package com.interviewplatform.backend.dto;

import com.interviewplatform.backend.model.Verification;

public class VerificationStatusResponse {

    private String status; // "Verified", "Pending Verification", "Rejected", "Resubmission Required", "Unverified"
    private Verification submission;

    public VerificationStatusResponse() {}

    public VerificationStatusResponse(String status) {
        this.status = status;
    }

    public VerificationStatusResponse(String status, Verification submission) {
        this.status = status;
        this.submission = submission;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Verification getSubmission() { return submission; }
    public void setSubmission(Verification submission) { this.submission = submission; }
}
