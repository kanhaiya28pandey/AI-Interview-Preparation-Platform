package com.interviewplatform.backend.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.model.HelpArticle;
import com.interviewplatform.backend.repository.HelpArticleRepository;

import jakarta.annotation.PostConstruct;

@Service
public class HelpArticleService {

    private final HelpArticleRepository helpArticleRepository;

    public HelpArticleService(HelpArticleRepository helpArticleRepository) {
        this.helpArticleRepository = helpArticleRepository;
    }

    @PostConstruct
    public void seedInitialArticlesIfEmpty() {
        if (helpArticleRepository.count() == 0) {
            List<HelpArticle> initial = Arrays.asList(
                new HelpArticle(
                    "faq-gs-1",
                    "Getting Started",
                    "How do I complete my student profile to reach 100%?",
                    "To reach 100% completion, complete all 5 profile weighting criteria: upload a custom profile photo (20%), enter your headline and bio (20%), add degree and school records (20%), add at least 3 skills and 1 project (20%), and set target placement roles + LinkedIn URL (20%). Use the interactive Resume Wizard at /onboarding for a step-by-step walkthrough.",
                    Arrays.asList("profile", "completion", "onboarding", "wizard"),
                    "Platform Admin"
                ),
                new HelpArticle(
                    "faq-gs-2",
                    "Getting Started",
                    "What is the recommended daily practice schedule for placement prep?",
                    "We recommend solving 2 algorithm benchmarks in the Coding Arena, taking 1 MCQ quiz, and completing at least 1 AI Mock Interview round every 2 days to maintain your daily streak and top 5% campus standing.",
                    Arrays.asList("schedule", "streak", "practice", "routine"),
                    "Platform Admin"
                ),
                new HelpArticle(
                    "faq-ap-1",
                    "Account & Profile",
                    "Why is my profile completion percentage not updating after editing?",
                    "Make sure you click 'Save Changes' at the top-right of each edit section in /profile. The progress ring updates dynamically upon save. If it doesn't change, verify that required fields like Bio (min 15 chars) or Skills (min 3 tags) meet minimum criteria.",
                    Arrays.asList("profile", "save", "completion", "edit"),
                    "Platform Admin"
                ),
                new HelpArticle(
                    "faq-ap-2",
                    "Account & Profile",
                    "How does the Public Recruiter View work?",
                    "Clicking 'Public Recruiter View' on /profile opens a verified candidate preview modal simulating what hiring managers and campus recruiters see when reviewing your profile, certifications, and benchmark ratings.",
                    Arrays.asList("recruiter", "preview", "public profile", "verification"),
                    "Platform Admin"
                ),
                new HelpArticle(
                    "faq-pc-1",
                    "Practice & Coding",
                    "How are coding benchmarks executed and scored in Coding Arena?",
                    "Code is compiled and verified against multiple visible test cases and hidden edge test cases in a sandboxed runtime. Points are awarded based on correctness, time complexity, and memory efficiency.",
                    Arrays.asList("coding", "judge", "runtime", "tests"),
                    "Platform Admin"
                ),
                new HelpArticle(
                    "faq-mi-1",
                    "Mock Interviews",
                    "How does the Voice Mock Interview AI evaluate answers?",
                    "The voice recording is transcribed and processed using real-time generative speech AI. The model assesses relevance, STAR structure, technical terminology, conciseness, and depth of explanation.",
                    Arrays.asList("interview", "voice", "ai", "evaluation"),
                    "Platform Admin"
                ),
                new HelpArticle(
                    "faq-lt-1",
                    "Live Tests",
                    "What are the anti-cheating restrictions during live campus tests?",
                    "Live tests enforce full-screen mode and tab switching restrictions. If you switch tabs or minimize the window, you receive up to 2 warnings; on the 3rd infraction, your contest is automatically submitted.",
                    Arrays.asList("live tests", "anti-cheating", "tab switch", "proctoring"),
                    "Platform Admin"
                )
            );
            helpArticleRepository.saveAll(initial);
        }
    }

    public List<HelpArticle> getAllArticles() {
        return helpArticleRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<HelpArticle> getArticlesByCategory(String category) {
        if (category == null || category.equalsIgnoreCase("all")) {
            return getAllArticles();
        }
        return helpArticleRepository.findByCategoryIgnoreCase(category);
    }

    public HelpArticle createArticle(HelpArticle article) {
        if (article.getId() == null || article.getId().isBlank()) {
            article.setId("art-" + UUID.randomUUID().toString().substring(0, 8));
        }
        article.setCreatedAt(Instant.now().toString());
        article.setUpdatedAt(Instant.now().toString());
        return helpArticleRepository.save(article);
    }

    public HelpArticle updateArticle(String id, HelpArticle updates) {
        HelpArticle existing = helpArticleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));

        if (updates.getQuestion() != null && !updates.getQuestion().isBlank()) {
            existing.setQuestion(updates.getQuestion().trim());
        }
        if (updates.getAnswer() != null && !updates.getAnswer().isBlank()) {
            existing.setAnswer(updates.getAnswer().trim());
        }
        if (updates.getCategory() != null && !updates.getCategory().isBlank()) {
            existing.setCategory(updates.getCategory().trim());
        }
        if (updates.getTags() != null) {
            existing.setTags(updates.getTags());
        }
        if (updates.getAuthor() != null && !updates.getAuthor().isBlank()) {
            existing.setAuthor(updates.getAuthor().trim());
        }
        existing.setUpdatedAt(Instant.now().toString());
        return helpArticleRepository.save(existing);
    }

    public void deleteArticle(String id) {
        helpArticleRepository.deleteById(id);
    }

    public HelpArticle voteArticle(String id, boolean isHelpful) {
        HelpArticle article = helpArticleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));
        if (isHelpful) {
            article.setHelpfulCount(article.getHelpfulCount() + 1);
        } else {
            article.setUnhelpfulCount(article.getUnhelpfulCount() + 1);
        }
        return helpArticleRepository.save(article);
    }
}
