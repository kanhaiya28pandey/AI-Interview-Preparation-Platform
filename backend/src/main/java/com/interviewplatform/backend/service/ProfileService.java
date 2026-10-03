package com.interviewplatform.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.model.SkillItem;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.model.UserProfile;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;

@Service
public class ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public ProfileService(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    public UserProfile getProfileByEmail(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createInitialProfile(user));
    }

    public UserProfile getProfileByUserId(String userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                    return createInitialProfile(user);
                });
    }

    public UserProfile updateProfileByEmail(String email, UserProfile updates) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfile current = userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createInitialProfile(user));

        // Apply fields if present in updates
        if (updates.getName() != null && !updates.getName().isBlank()) {
            current.setName(updates.getName().trim());
            user.setName(updates.getName().trim());
        }
        if (updates.getPreferredName() != null) current.setPreferredName(updates.getPreferredName());
        if (updates.getHeadline() != null) current.setHeadline(updates.getHeadline());
        if (updates.getBio() != null) current.setBio(updates.getBio());
        if (updates.getPhone() != null) current.setPhone(updates.getPhone());
        if (updates.getDateOfBirth() != null) current.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getGender() != null) current.setGender(updates.getGender());
        if (updates.getLocation() != null) current.setLocation(updates.getLocation());
        if (updates.getLanguages() != null) current.setLanguages(updates.getLanguages());

        if (updates.getCollege() != null) current.setCollege(updates.getCollege());
        if (updates.getGraduationYear() != null) current.setGraduationYear(updates.getGraduationYear());
        if (updates.getDegree() != null) current.setDegree(updates.getDegree());

        if (updates.getEducationEntries() != null) current.setEducationEntries(updates.getEducationEntries());
        if (updates.getSchoolEducation() != null) current.setSchoolEducation(updates.getSchoolEducation());

        if (updates.getSkillsList() != null) {
            current.setSkillsList(updates.getSkillsList());
            List<String> flatSkills = updates.getSkillsList().stream()
                    .map(SkillItem::getName)
                    .filter(s -> s != null && !s.isBlank())
                    .toList();
            current.setSkills(flatSkills);
        } else if (updates.getSkills() != null) {
            current.setSkills(updates.getSkills());
        }

        if (updates.getWorkExperience() != null) current.setWorkExperience(updates.getWorkExperience());
        if (updates.getProjects() != null) current.setProjects(updates.getProjects());
        if (updates.getCertifications() != null) current.setCertifications(updates.getCertifications());

        if (updates.getTargetRoles() != null) current.setTargetRoles(updates.getTargetRoles());
        if (updates.getPreferredLocation() != null) current.setPreferredLocation(updates.getPreferredLocation());
        current.setOpenToRelocation(updates.isOpenToRelocation());
        if (updates.getEmploymentType() != null) current.setEmploymentType(updates.getEmploymentType());

        if (updates.getGithubUrl() != null) current.setGithubUrl(updates.getGithubUrl());
        if (updates.getLinkedinUrl() != null) current.setLinkedinUrl(updates.getLinkedinUrl());
        if (updates.getPortfolioUrl() != null) current.setPortfolioUrl(updates.getPortfolioUrl());
        if (updates.getCodingPlatformHandle() != null) current.setCodingPlatformHandle(updates.getCodingPlatformHandle());
        if (updates.getResumeUrl() != null) current.setResumeUrl(updates.getResumeUrl());

        if (updates.getAvatar() != null && !updates.getAvatar().isBlank()) {
            current.setAvatar(updates.getAvatar());
            current.setCustomAvatar(true);
            user.setAvatarUrl(updates.getAvatar());
        }

        if (updates.getPhotoChecklist() != null) current.setPhotoChecklist(updates.getPhotoChecklist());
        if (updates.getVerificationStatus() != null) current.setVerificationStatus(updates.getVerificationStatus());
        if (updates.getVerificationReason() != null) current.setVerificationReason(updates.getVerificationReason());
        if (updates.getVerificationId() != null) current.setVerificationId(updates.getVerificationId());

        current.setUpdatedAt(LocalDateTime.now().toString());

        userRepository.save(user);
        return userProfileRepository.save(current);
    }

    private UserProfile createInitialProfile(User user) {
        UserProfile profile = new UserProfile(user.getId(), user.getName(), user.getEmail());
        profile.setRole(user.getRole() != null ? user.getRole() : "STUDENT");
        profile.setVerificationStatus(user.getVerificationStatus() != null ? user.getVerificationStatus() : "Unverified");
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            profile.setAvatar(user.getAvatarUrl());
        }
        profile.setUpdatedAt(LocalDateTime.now().toString());
        return userProfileRepository.save(profile);
    }
}
