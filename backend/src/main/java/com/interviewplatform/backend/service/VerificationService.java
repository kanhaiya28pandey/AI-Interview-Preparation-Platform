package com.interviewplatform.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.dto.ReviewVerificationRequest;
import com.interviewplatform.backend.dto.VerificationStatusResponse;
import com.interviewplatform.backend.dto.VerificationSubmissionRequest;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.model.UserProfile;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;
import com.interviewplatform.backend.repository.VerificationRepository;

@Service
public class VerificationService {

    private final VerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final Random random = new Random();

    public VerificationService(
            VerificationRepository verificationRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository
    ) {
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public VerificationStatusResponse getVerificationStatus(String email, String userId) {
        // Try to find recent submission by userId or email
        Optional<Verification> submissionOpt = Optional.empty();

        if (userId != null && !userId.isBlank()) {
            submissionOpt = verificationRepository.findTopByUserIdOrderBySubmittedAtDesc(userId);
        }
        if (submissionOpt.isEmpty() && email != null && !email.isBlank()) {
            submissionOpt = verificationRepository.findTopByEmailOrderBySubmittedAtDesc(email.trim().toLowerCase());
        }

        if (submissionOpt.isPresent()) {
            Verification sub = submissionOpt.get();
            return new VerificationStatusResponse(sub.getStatus(), sub);
        }

        // Fallback to User document status if no submission record
        if (email != null && !email.isBlank()) {
            Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
            if (userOpt.isPresent()) {
                String status = userOpt.get().getVerificationStatus();
                return new VerificationStatusResponse(status != null ? status : "Unverified");
            }
        }

        return new VerificationStatusResponse("Unverified");
    }

    public Verification submitVerification(String authEmail, VerificationSubmissionRequest request) {
        User user = userRepository.findByEmail(authEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        int randomNum = 1000 + random.nextInt(9000);
        String verificationId = "VER-2026-" + randomNum;

        Verification verification = new Verification();
        verification.setVerificationId(verificationId);
        verification.setUserId(user.getId());
        String studentName = (request.getStudentName() != null && !request.getStudentName().isBlank())
                ? request.getStudentName().trim() : (user.getName() != null ? user.getName() : "Student Candidate");
        String email = (request.getEmail() != null && !request.getEmail().isBlank())
                ? request.getEmail().trim().toLowerCase() : user.getEmail();

        verification.setStudentName(studentName);
        verification.setEmail(email);
        verification.setCollegeName(request.getCollegeName().trim());
        verification.setRollNumber(request.getRollNumber().trim());
        verification.setCourseBranch(request.getCourseBranch().trim());
        verification.setYearSemester(request.getYearSemester().trim());
        verification.setIdCardFrontUrl(request.getIdCardFrontUrl());
        verification.setIdCardBackUrl(request.getIdCardBackUrl());
        verification.setSelfieUrl(request.getSelfieUrl());
        verification.setSubmittedAt(LocalDateTime.now().toString());
        verification.setStatus("Pending Verification");

        Verification savedVerification = verificationRepository.save(verification);

        // Sync status to User
        user.setVerificationStatus("Pending Verification");
        userRepository.save(user);

        // Sync status to UserProfile
        userProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            profile.setVerificationStatus("Pending Verification");
            profile.setVerificationId(verificationId);
            profile.setCollege(request.getCollegeName());
            profile.setUpdatedAt(LocalDateTime.now().toString());
            userProfileRepository.save(profile);
        });

        return savedVerification;
    }

    public List<Verification> getAllSubmissions(String statusFilter) {
        if (statusFilter != null && !statusFilter.isBlank() && !statusFilter.equalsIgnoreCase("ALL")) {
            return verificationRepository.findByStatusOrderBySubmittedAtDesc(statusFilter);
        }
        return verificationRepository.findAllByOrderBySubmittedAtDesc();
    }

    public Verification reviewVerification(String verificationId, ReviewVerificationRequest request) {
        Verification verification = verificationRepository.findByVerificationId(verificationId)
                .orElseThrow(() -> new IllegalArgumentException("Verification request not found with id: " + verificationId));

        String newStatus;
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            newStatus = "Verified";
            verification.setRejectionCategory(null);
            verification.setRejectionNotes(null);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            newStatus = "Rejected";
            verification.setRejectionCategory(request.getRejectionCategory() != null ? request.getRejectionCategory() : "Details do not match ID card");
            verification.setRejectionNotes(request.getRejectionNotes() != null ? request.getRejectionNotes() : "Please upload a clear, legible college ID card.");
        } else {
            throw new IllegalArgumentException("Invalid action: must be APPROVE or REJECT");
        }

        verification.setStatus(newStatus);
        verification.setReviewedAt(LocalDateTime.now().toString());

        Verification updated = verificationRepository.save(verification);

        // Sync back to User
        if (verification.getUserId() != null) {
            userRepository.findById(verification.getUserId()).ifPresent(u -> {
                u.setVerificationStatus(newStatus);
                userRepository.save(u);
            });

            // Sync back to UserProfile
            userProfileRepository.findByUserId(verification.getUserId()).ifPresent(profile -> {
                profile.setVerificationStatus(newStatus);
                profile.setVerificationReason(updated.getRejectionNotes());
                profile.setUpdatedAt(LocalDateTime.now().toString());
                userProfileRepository.save(profile);
            });
        }

        return updated;
    }
}
