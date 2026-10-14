package com.interviewplatform.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.dto.ReviewVerificationRequest;
import com.interviewplatform.backend.dto.VerificationStatusResponse;
import com.interviewplatform.backend.dto.VerificationSubmissionRequest;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;
import com.interviewplatform.backend.repository.VerificationRepository;

@Service
public class VerificationService {

    private final VerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final EmailService emailService;
    private final Random random = new Random();

    public VerificationService(
            VerificationRepository verificationRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            EmailService emailService
    ) {
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.emailService = emailService;
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
        User user = null;
        if (authEmail != null && !authEmail.isBlank()) {
            user = userRepository.findByEmail(authEmail.trim().toLowerCase()).orElse(null);
        }
        if (user == null && request.getUserId() != null && !request.getUserId().isBlank()) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (user == null && request.getEmail() != null && !request.getEmail().isBlank()) {
            user = userRepository.findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);
        }

        String userId = user != null ? user.getId() : (request.getUserId() != null ? request.getUserId() : "usr-" + UUID.randomUUID().toString().substring(0, 8));
        String studentName = (request.getStudentName() != null && !request.getStudentName().isBlank())
                ? request.getStudentName().trim() : (user != null && user.getName() != null ? user.getName() : "Student Candidate");
        String email = (request.getEmail() != null && !request.getEmail().isBlank())
                ? request.getEmail().trim().toLowerCase() : (user != null ? user.getEmail() : "student@example.com");

        Verification verification = null;
        if (userId != null && !userId.isBlank()) {
            verification = verificationRepository.findTopByUserIdOrderBySubmittedAtDesc(userId).orElse(null);
        }
        if (verification == null && email != null && !email.isBlank()) {
            verification = verificationRepository.findTopByEmailOrderBySubmittedAtDesc(email).orElse(null);
        }

        if (verification == null) {
            verification = new Verification();
            int randomNum = 1000 + random.nextInt(9000);
            verification.setVerificationId("VER-2026-" + randomNum);
            verification.setUserId(userId);
        }

        verification.setStudentName(studentName);
        verification.setEmail(email);
        if (request.getCollegeName() != null && !request.getCollegeName().isBlank()) {
            verification.setCollegeName(request.getCollegeName().trim());
        }
        if (request.getRollNumber() != null && !request.getRollNumber().isBlank()) {
            verification.setRollNumber(request.getRollNumber().trim());
        }
        if (request.getCourseBranch() != null && !request.getCourseBranch().isBlank()) {
            verification.setCourseBranch(request.getCourseBranch().trim());
        }
        if (request.getYearSemester() != null && !request.getYearSemester().isBlank()) {
            verification.setYearSemester(request.getYearSemester().trim());
        }
        if (request.getIdCardFrontUrl() != null && !request.getIdCardFrontUrl().isBlank()) {
            verification.setIdCardFrontUrl(request.getIdCardFrontUrl());
        }
        if (request.getIdCardBackUrl() != null) {
            verification.setIdCardBackUrl(request.getIdCardBackUrl());
        }
        if (request.getSelfieUrl() != null && !request.getSelfieUrl().isBlank()) {
            verification.setSelfieUrl(request.getSelfieUrl());
        }
        verification.setSubmittedAt(LocalDateTime.now().toString());
        verification.setStatus("Pending Verification");

        Verification savedVerification = verificationRepository.save(verification);
        String verificationId = savedVerification.getVerificationId();

        // Sync status to User
        if (user != null) {
            user.setVerificationStatus("Pending Verification");
            userRepository.save(user);

            // Sync status to UserProfile
            userProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                profile.setVerificationStatus("Pending Verification");
                profile.setVerificationId(verificationId);
                if (request.getCollegeName() != null) profile.setCollege(request.getCollegeName());
                profile.setUpdatedAt(LocalDateTime.now().toString());
                userProfileRepository.save(profile);
            });
        }

        // Clean up any stale duplicate records for this student
        try {
            final String finalId = savedVerification.getId();
            final String finalUserId = userId;
            final String finalEmail = email;
            List<Verification> stale = verificationRepository.findAll().stream()
                    .filter(v -> v.getId() != null && !v.getId().equals(finalId) &&
                            ((finalUserId != null && finalUserId.equalsIgnoreCase(v.getUserId())) ||
                             (finalEmail != null && finalEmail.equalsIgnoreCase(v.getEmail()))))
                    .toList();
            if (!stale.isEmpty()) {
                verificationRepository.deleteAll(stale);
            }
        } catch (Exception ignored) {}

        return savedVerification;
    }

    public List<Verification> getAllSubmissions(String statusFilter) {
        List<Verification> list;
        if (statusFilter != null && !statusFilter.isBlank() && !statusFilter.equalsIgnoreCase("ALL")) {
            list = verificationRepository.findByStatusOrderBySubmittedAtDesc(statusFilter);
        } else {
            list = verificationRepository.findAllByOrderBySubmittedAtDesc();
        }

        // Deduplicate records per student: keep the one with an uploaded ID card, or newest submittedAt
        java.util.Map<String, Verification> map = new java.util.LinkedHashMap<>();
        for (Verification v : list) {
            String key = (v.getUserId() != null && !v.getUserId().isBlank())
                    ? v.getUserId().trim().toLowerCase()
                    : (v.getEmail() != null ? v.getEmail().trim().toLowerCase() : v.getId());
            if (key == null) continue;

            if (!map.containsKey(key)) {
                map.put(key, v);
            } else {
                Verification existing = map.get(key);
                boolean existingHasCard = existing.getIdCardFrontUrl() != null && !existing.getIdCardFrontUrl().isBlank();
                boolean currentHasCard = v.getIdCardFrontUrl() != null && !v.getIdCardFrontUrl().isBlank();
                boolean existingIsPendingUpload = "Pending ID upload".equalsIgnoreCase(existing.getCollegeName());
                boolean currentIsPendingUpload = "Pending ID upload".equalsIgnoreCase(v.getCollegeName());

                if (!existingHasCard && currentHasCard) {
                    map.put(key, v);
                } else if (existingIsPendingUpload && !currentIsPendingUpload) {
                    map.put(key, v);
                }
            }
        }
        return new java.util.ArrayList<>(map.values());
    }

    public Verification reviewVerification(String verificationId, ReviewVerificationRequest request) {
        Verification verification = verificationRepository.findByVerificationId(verificationId)
                .or(() -> verificationRepository.findById(verificationId))
                .or(() -> verificationRepository.findTopByUserIdOrderBySubmittedAtDesc(verificationId))
                .or(() -> verificationRepository.findTopByEmailOrderBySubmittedAtDesc(verificationId.trim().toLowerCase()))
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

        // Sync back to User and trigger notification email
        String studentEmail = verification.getEmail();
        String studentName = verification.getStudentName();

        if (verification.getUserId() != null) {
            final String selfie = verification.getSelfieUrl();
            final String idPhoto = verification.getIdCardFrontUrl();
            final String photoToApply = (selfie != null && !selfie.isBlank()) ? selfie : idPhoto;

            userRepository.findById(verification.getUserId()).ifPresent(u -> {
                u.setVerificationStatus(newStatus);
                if ("Verified".equalsIgnoreCase(newStatus) && photoToApply != null && !photoToApply.isBlank()) {
                    u.setAvatarUrl(photoToApply);
                }
                userRepository.save(u);
            });

            // Sync back to UserProfile
            userProfileRepository.findByUserId(verification.getUserId()).ifPresent(profile -> {
                profile.setVerificationStatus(newStatus);
                profile.setVerificationReason(updated.getRejectionNotes());
                if ("Verified".equalsIgnoreCase(newStatus) && photoToApply != null && !photoToApply.isBlank()) {
                    profile.setAvatar(photoToApply);
                    profile.setCustomAvatar(true);
                }
                profile.setUpdatedAt(LocalDateTime.now().toString());
                userProfileRepository.save(profile);
            });
        }

        // Send email update to student
        if (studentEmail != null && !studentEmail.isBlank()) {
            emailService.sendVerificationStatusEmail(studentEmail, studentName, newStatus, updated.getRejectionNotes());
        }

        return updated;
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(VerificationService.class);

    public void deleteRejectedVerification(String id, String adminId) {
        Verification verification = verificationRepository.findById(id)
                .or(() -> verificationRepository.findByVerificationId(id))
                .or(() -> verificationRepository.findTopByUserIdOrderBySubmittedAtDesc(id))
                .or(() -> verificationRepository.findTopByEmailOrderBySubmittedAtDesc(id.trim().toLowerCase()))
                .orElse(null);

        String userId = verification != null ? verification.getUserId() : id;
        String email = verification != null ? verification.getEmail() : null;

        // If not found in verification, try finding user to get their details
        if (email == null) {
            Optional<User> uOpt = userRepository.findById(id).or(() -> userRepository.findByEmail(id.trim().toLowerCase()));
            if (uOpt.isPresent()) {
                userId = uOpt.get().getId();
                email = uOpt.get().getEmail();
            }
        }

        // Delete verification record(s)
        if (verification != null) {
            verificationRepository.delete(verification);
        }
        if (userId != null && !userId.isBlank()) {
            verificationRepository.deleteByUserId(userId);
        }
        if (email != null && !email.isBlank()) {
            verificationRepository.deleteByEmail(email.trim().toLowerCase());
        }

        // Permanently delete user document from users collection (so email can register cleanly again)
        if (userId != null && !userId.isBlank()) {
            userRepository.findById(userId).ifPresent(u -> {
                if (!"ADMIN".equalsIgnoreCase(u.getRole())) {
                    userRepository.delete(u);
                }
            });
            userProfileRepository.deleteByUserId(userId);
        }
        if (email != null && !email.isBlank()) {
            userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(u -> {
                if (!"ADMIN".equalsIgnoreCase(u.getRole())) {
                    userRepository.delete(u);
                }
            });
            userProfileRepository.deleteByEmail(email.trim().toLowerCase());
        }

        logger.info("AUDIT LOG: Admin [{}] permanently deleted REJECTED verification record [{}] and user [{}] ({}) at [{}]",
                adminId, id, userId, email, LocalDateTime.now());
    }

    public int deleteBulkRejectedVerifications(List<String> ids, String adminId) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("No verification IDs provided for bulk deletion");
        }
        int count = 0;
        for (String id : ids) {
            deleteRejectedVerification(id, adminId);
            count++;
        }
        return count;
    }
}
