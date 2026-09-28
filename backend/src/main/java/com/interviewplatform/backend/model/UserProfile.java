package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_profiles")
public class UserProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Indexed
    private String email;

    private String name;
    private String preferredName;
    private String role = "STUDENT";
    private String avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
    private boolean isCustomAvatar = false;
    private PhotoChecklist photoChecklist = new PhotoChecklist();

    private String headline = "Aspiring Software Engineer";
    private String bio = "Dedicated computer science student passionate about building scalable, resilient software.";
    private String phone = "";
    private String dateOfBirth = "";
    private String gender = "";
    private String location = "";
    private List<String> languages = new ArrayList<>();

    private String college = "";
    private String graduationYear = "";
    private String degree = "";

    private List<EducationEntry> educationEntries = new ArrayList<>();
    private SchoolEducation schoolEducation = new SchoolEducation();
    private List<SkillItem> skillsList = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private List<WorkExperienceEntry> workExperience = new ArrayList<>();
    private List<ProjectEntry> projects = new ArrayList<>();
    private List<CertificationEntry> certifications = new ArrayList<>();

    private List<String> targetRoles = new ArrayList<>();
    private String preferredLocation = "";
    private boolean openToRelocation = true;
    private String employmentType = "Full-Time"; // "Full-Time", "Internship", "Both"

    private String githubUrl = "";
    private String linkedinUrl = "";
    private String portfolioUrl = "";
    private String codingPlatformHandle = "";
    private String resumeUrl = "";

    private boolean onboardingComplete = true;
    private String verificationStatus = "Unverified";
    private String verificationReason = "";
    private String verificationId = "";

    private String updatedAt;
    private UserStats stats = new UserStats();

    public UserProfile() {
    }

    public UserProfile(String userId, String name, String email) {
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPreferredName() { return preferredName; }
    public void setPreferredName(String preferredName) { this.preferredName = preferredName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public boolean isCustomAvatar() { return isCustomAvatar; }
    public void setCustomAvatar(boolean customAvatar) { isCustomAvatar = customAvatar; }

    public PhotoChecklist getPhotoChecklist() { return photoChecklist; }
    public void setPhotoChecklist(PhotoChecklist photoChecklist) { this.photoChecklist = photoChecklist; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getGraduationYear() { return graduationYear; }
    public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public List<EducationEntry> getEducationEntries() { return educationEntries; }
    public void setEducationEntries(List<EducationEntry> educationEntries) { this.educationEntries = educationEntries; }

    public SchoolEducation getSchoolEducation() { return schoolEducation; }
    public void setSchoolEducation(SchoolEducation schoolEducation) { this.schoolEducation = schoolEducation; }

    public List<SkillItem> getSkillsList() { return skillsList; }
    public void setSkillsList(List<SkillItem> skillsList) { this.skillsList = skillsList; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<WorkExperienceEntry> getWorkExperience() { return workExperience; }
    public void setWorkExperience(List<WorkExperienceEntry> workExperience) { this.workExperience = workExperience; }

    public List<ProjectEntry> getProjects() { return projects; }
    public void setProjects(List<ProjectEntry> projects) { this.projects = projects; }

    public List<CertificationEntry> getCertifications() { return certifications; }
    public void setCertifications(List<CertificationEntry> certifications) { this.certifications = certifications; }

    public List<String> getTargetRoles() { return targetRoles; }
    public void setTargetRoles(List<String> targetRoles) { this.targetRoles = targetRoles; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public boolean isOpenToRelocation() { return openToRelocation; }
    public void setOpenToRelocation(boolean openToRelocation) { this.openToRelocation = openToRelocation; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public String getCodingPlatformHandle() { return codingPlatformHandle; }
    public void setCodingPlatformHandle(String codingPlatformHandle) { this.codingPlatformHandle = codingPlatformHandle; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public boolean isOnboardingComplete() { return onboardingComplete; }
    public void setOnboardingComplete(boolean onboardingComplete) { this.onboardingComplete = onboardingComplete; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getVerificationReason() { return verificationReason; }
    public void setVerificationReason(String verificationReason) { this.verificationReason = verificationReason; }

    public String getVerificationId() { return verificationId; }
    public void setVerificationId(String verificationId) { this.verificationId = verificationId; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public UserStats getStats() { return stats; }
    public void setStats(UserStats stats) { this.stats = stats; }
}
