package com.interviewplatform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "verifications")
public class Verification {

    @Id
    private String id;

    @Indexed(unique = true)
    private String verificationId;

    @Indexed
    private String userId;

    private String studentName;

    @Indexed
    private String email;

    private String collegeName;
    private String rollNumber;
    private String courseBranch;
    private String yearSemester;
    private String idCardFrontUrl;
    private String idCardBackUrl;
    private String selfieUrl;

    private String submittedAt;
    private String status = "Pending Verification"; // "Pending Verification", "Verified", "Rejected", "Resubmission Required", "Unverified"
    private String rejectionCategory;
    private String rejectionNotes;
    private String reviewedAt;

    public Verification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVerificationId() { return verificationId; }
    public void setVerificationId(String verificationId) { this.verificationId = verificationId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getCourseBranch() { return courseBranch; }
    public void setCourseBranch(String courseBranch) { this.courseBranch = courseBranch; }

    public String getYearSemester() { return yearSemester; }
    public void setYearSemester(String yearSemester) { this.yearSemester = yearSemester; }

    public String getIdCardFrontUrl() { return idCardFrontUrl; }
    public void setIdCardFrontUrl(String idCardFrontUrl) { this.idCardFrontUrl = idCardFrontUrl; }

    public String getIdCardBackUrl() { return idCardBackUrl; }
    public void setIdCardBackUrl(String idCardBackUrl) { this.idCardBackUrl = idCardBackUrl; }

    public String getSelfieUrl() { return selfieUrl; }
    public void setSelfieUrl(String selfieUrl) { this.selfieUrl = selfieUrl; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionCategory() { return rejectionCategory; }
    public void setRejectionCategory(String rejectionCategory) { this.rejectionCategory = rejectionCategory; }

    public String getRejectionNotes() { return rejectionNotes; }
    public void setRejectionNotes(String rejectionNotes) { this.rejectionNotes = rejectionNotes; }

    public String getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(String reviewedAt) { this.reviewedAt = reviewedAt; }
}
