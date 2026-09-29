package com.interviewplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class VerificationSubmissionRequest {

    private String userId;

    private String studentName;
    private String email;

    @NotBlank(message = "College name is required")
    private String collegeName;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "Course & Branch is required")
    private String courseBranch;

    @NotBlank(message = "Year & Semester is required")
    private String yearSemester;

    @NotBlank(message = "ID card image front URL is required")
    private String idCardFrontUrl;

    private String idCardBackUrl;
    private String selfieUrl;

    public VerificationSubmissionRequest() {}

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
}
