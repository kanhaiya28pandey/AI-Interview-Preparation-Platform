package com.interviewplatform.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.interviewplatform.backend.model.AdminResumeAnalytics;
import com.interviewplatform.backend.model.AnalysisHistoryItem;
import com.interviewplatform.backend.model.MissingSkillDetail;
import com.interviewplatform.backend.model.MissingSkillStat;
import com.interviewplatform.backend.model.ResumeAnalysis;
import com.interviewplatform.backend.model.RoleDistributionStat;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.repository.ResumeAnalysisRepository;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;

@Service
public class ResumeService {

    private final DocumentParserService documentParserService;
    private final GeminiAiService geminiAiService;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public ResumeService(
            DocumentParserService documentParserService,
            GeminiAiService geminiAiService,
            ResumeAnalysisRepository resumeAnalysisRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository
    ) {
        this.documentParserService = documentParserService;
        this.geminiAiService = geminiAiService;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public ResumeAnalysis analyzeResume(
            String authEmail,
            MultipartFile file,
            String role,
            String field,
            String jobDescription
    ) {
        User user = userRepository.findByEmail(authEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 1. Extract text from uploaded document (PDF or Text)
        String extractedText = documentParserService.extractText(file);
        if (extractedText.isBlank()) {
            throw new IllegalArgumentException("The uploaded file does not contain readable text. Please upload a standard text PDF or document.");
        }

        // 2. Perform AI ATS analysis
        String targetRole = (role != null && !role.isBlank()) ? role : "Frontend Developer";
        String targetField = (field != null && !field.isBlank()) ? field : "IT Services";
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";

        ResumeAnalysis result = geminiAiService.analyzeResumeWithAi(
                extractedText,
                targetRole,
                targetField,
                jobDescription,
                fileName
        );

        result.setUserId(user.getId());
        result.setEmail(user.getEmail());
        result.setAnalyzedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy, hh:mm a")));

        // 3. Attach user history
        List<ResumeAnalysis> pastAnalyses = resumeAnalysisRepository.findByUserIdOrderByAnalyzedAtDesc(user.getId());
        List<AnalysisHistoryItem> history = new ArrayList<>();

        // Add current analysis as top history item
        history.add(new AnalysisHistoryItem("curr", "Today", targetRole, result.getAtsScore(), fileName));

        for (int i = 0; i < Math.min(pastAnalyses.size(), 4); i++) {
            ResumeAnalysis past = pastAnalyses.get(i);
            history.add(new AnalysisHistoryItem(
                    past.getId(),
                    past.getAnalyzedAt() != null ? past.getAnalyzedAt() : "Past",
                    past.getRole(),
                    past.getAtsScore(),
                    past.getFileName()
            ));
        }
        result.setHistory(history);

        // 4. Save to MongoDB Atlas
        ResumeAnalysis saved = resumeAnalysisRepository.save(result);

        // Update profile with role preference if needed
        userProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            if (!profile.getTargetRoles().contains(targetRole)) {
                profile.getTargetRoles().add(targetRole);
                userProfileRepository.save(profile);
            }
        });

        return saved;
    }

    public ResumeAnalysis analyzeResumeText(
            String authEmail,
            String text,
            String role,
            String field,
            String jobDescription
    ) {
        User user = userRepository.findByEmail(authEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Resume text cannot be blank.");
        }

        String targetRole = (role != null && !role.isBlank()) ? role : "Frontend Developer";
        String targetField = (field != null && !field.isBlank()) ? field : "IT Services";
        String fileName = "resume_text_submission.txt";

        ResumeAnalysis result = geminiAiService.analyzeResumeWithAi(
                text,
                targetRole,
                targetField,
                jobDescription,
                fileName
        );

        result.setUserId(user.getId());
        result.setEmail(user.getEmail());
        result.setAnalyzedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy, hh:mm a")));

        List<ResumeAnalysis> pastAnalyses = resumeAnalysisRepository.findByUserIdOrderByAnalyzedAtDesc(user.getId());
        List<AnalysisHistoryItem> history = new ArrayList<>();
        history.add(new AnalysisHistoryItem("curr", "Today", targetRole, result.getAtsScore(), fileName));

        for (int i = 0; i < Math.min(pastAnalyses.size(), 4); i++) {
            ResumeAnalysis past = pastAnalyses.get(i);
            history.add(new AnalysisHistoryItem(
                    past.getId(),
                    past.getAnalyzedAt() != null ? past.getAnalyzedAt() : "Past",
                    past.getRole(),
                    past.getAtsScore(),
                    past.getFileName()
            ));
        }
        result.setHistory(history);

        return resumeAnalysisRepository.save(result);
    }

    public List<ResumeAnalysis> getUserHistory(String authEmail) {
        User user = userRepository.findByEmail(authEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return resumeAnalysisRepository.findByUserIdOrderByAnalyzedAtDesc(user.getId());
    }

    public AdminResumeAnalytics getAdminAnalytics() {
        List<ResumeAnalysis> all = resumeAnalysisRepository.findAll();
        int total = all.size();

        if (total == 0) {
            return new AdminResumeAnalytics(
                    79.4,
                    "+4.2% vs last month",
                    0,
                    List.of(
                            new MissingSkillStat("Microservices Architecture", 12, 34),
                            new MissingSkillStat("Next.js (App Router)", 10, 29),
                            new MissingSkillStat("Jest & Automated Testing", 8, 25),
                            new MissingSkillStat("Spring Security & JWT", 7, 20),
                            new MissingSkillStat("Cloud Warehouses (BigQuery)", 5, 15)
                    ),
                    List.of(
                            new RoleDistributionStat("Frontend Dev", 0, 38, "#22d3ee"),
                            new RoleDistributionStat("Backend Dev", 0, 28, "#14b8a6"),
                            new RoleDistributionStat("Data Analyst", 0, 18, "#818cf8"),
                            new RoleDistributionStat("Full Stack Dev", 0, 10, "#f59e0b"),
                            new RoleDistributionStat("Others", 0, 6, "#94a3b8")
                    )
            );
        }

        double avgScore = all.stream().mapToInt(ResumeAnalysis::getAtsScore).average().orElse(79.0);
        avgScore = Math.round(avgScore * 10.0) / 10.0;

        // Role distribution
        Map<String, Integer> roleCounts = new HashMap<>();
        Map<String, Integer> missingSkillCounts = new HashMap<>();

        for (ResumeAnalysis r : all) {
            String role = r.getRole() != null ? r.getRole() : "Other";
            roleCounts.put(role, roleCounts.getOrDefault(role, 0) + 1);

            if (r.getMissingSkills() != null) {
                for (MissingSkillDetail m : r.getMissingSkills()) {
                    if (m.getName() != null) {
                        missingSkillCounts.put(m.getName(), missingSkillCounts.getOrDefault(m.getName(), 0) + 1);
                    }
                }
            }
        }

        List<RoleDistributionStat> roleStats = new ArrayList<>();
        String[] colors = {"#22d3ee", "#14b8a6", "#818cf8", "#f59e0b", "#94a3b8", "#ec4899"};
        int colorIdx = 0;
        for (var entry : roleCounts.entrySet()) {
            int pct = (int) Math.round(((double) entry.getValue() / total) * 100);
            roleStats.add(new RoleDistributionStat(
                    entry.getKey(),
                    entry.getValue(),
                    pct,
                    colors[colorIdx % colors.length]
            ));
            colorIdx++;
        }

        List<MissingSkillStat> topMissing = missingSkillCounts.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> new MissingSkillStat(
                        e.getKey(),
                        e.getValue(),
                        (int) Math.round(((double) e.getValue() / total) * 100)
                ))
                .toList();

        return new AdminResumeAnalytics(
                avgScore,
                "+3.8% this month",
                total,
                topMissing,
                roleStats
        );
    }
}
