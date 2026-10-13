package com.interviewplatform.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.AiGenerateInterviewRequest;
import com.interviewplatform.backend.dto.AiGenerateQuizRequest;
import com.interviewplatform.backend.dto.ContentItemRequest;
import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.service.AdminContentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/admin/content", "/api/v1/admin/content"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminDedicatedContentController {

    private final AdminContentService contentService;

    public AdminDedicatedContentController(AdminContentService contentService) {
        this.contentService = contentService;
    }

    // --- Task 3: Quizzes ---
    @PostMapping("/quizzes")
    public ResponseEntity<ContentItem> createQuiz(Authentication auth, @Valid @RequestBody ContentItemRequest req) {
        req.setType("QUIZ");
        return ResponseEntity.ok(contentService.createContent(req, auth != null ? auth.getName() : "Admin"));
    }

    @PutMapping("/quizzes/{id}")
    public ResponseEntity<ContentItem> updateQuiz(Authentication auth, @PathVariable String id, @Valid @RequestBody ContentItemRequest req) {
        req.setType("QUIZ");
        return ResponseEntity.ok(contentService.updateContent(id, req, auth != null ? auth.getName() : "Admin", false));
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<Map<String, Object>> deleteQuiz(Authentication auth, @PathVariable String id, @RequestParam(required = false, defaultValue = "false") boolean force) {
        contentService.deleteContent(id, auth != null ? auth.getName() : "Admin", force);
        return ResponseEntity.ok(Map.of("success", true, "message", "Quiz deleted"));
    }

    @PostMapping("/quizzes/import")
    public ResponseEntity<Map<String, Object>> importQuizCsv(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(contentService.importQuizQuestionsCsv(body.getOrDefault("csv", "")));
    }

    @PostMapping("/quizzes/generate")
    public ResponseEntity<Map<String, Object>> generateQuizQuestions(@Valid @RequestBody AiGenerateQuizRequest req) {
        return ResponseEntity.ok(contentService.generateQuizQuestions(req));
    }

    // --- Task 4: Mock Tests ---
    @PostMapping("/mock-tests")
    public ResponseEntity<ContentItem> createMockTest(Authentication auth, @Valid @RequestBody ContentItemRequest req) {
        req.setType("MOCK_TEST");
        return ResponseEntity.ok(contentService.createContent(req, auth != null ? auth.getName() : "Admin"));
    }

    @PutMapping("/mock-tests/{id}")
    public ResponseEntity<ContentItem> updateMockTest(Authentication auth, @PathVariable String id, @Valid @RequestBody ContentItemRequest req) {
        req.setType("MOCK_TEST");
        return ResponseEntity.ok(contentService.updateContent(id, req, auth != null ? auth.getName() : "Admin", false));
    }

    @DeleteMapping("/mock-tests/{id}")
    public ResponseEntity<Map<String, Object>> deleteMockTest(Authentication auth, @PathVariable String id, @RequestParam(required = false, defaultValue = "false") boolean force) {
        contentService.deleteContent(id, auth != null ? auth.getName() : "Admin", force);
        return ResponseEntity.ok(Map.of("success", true, "message", "Mock test deleted"));
    }

    @PatchMapping("/mock-tests/{id}/publish")
    public ResponseEntity<ContentItem> publishMockTest(Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(contentService.updateStatus(id, "PUBLISHED", auth != null ? auth.getName() : "Admin"));
    }

    @PatchMapping("/mock-tests/{id}/unpublish")
    public ResponseEntity<ContentItem> unpublishMockTest(Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(contentService.updateStatus(id, "DRAFT", auth != null ? auth.getName() : "Admin"));
    }

    // --- Task 5: Coding Problems & Coding Tests ---
    @PostMapping("/coding-problems")
    public ResponseEntity<ContentItem> createCodingProblem(Authentication auth, @Valid @RequestBody ContentItemRequest req) {
        req.setType("CODING_PROBLEM");
        return ResponseEntity.ok(contentService.createContent(req, auth != null ? auth.getName() : "Admin"));
    }

    @PutMapping("/coding-problems/{id}")
    public ResponseEntity<ContentItem> updateCodingProblem(Authentication auth, @PathVariable String id, @Valid @RequestBody ContentItemRequest req) {
        req.setType("CODING_PROBLEM");
        return ResponseEntity.ok(contentService.updateContent(id, req, auth != null ? auth.getName() : "Admin", false));
    }

    @DeleteMapping("/coding-problems/{id}")
    public ResponseEntity<Map<String, Object>> deleteCodingProblem(Authentication auth, @PathVariable String id, @RequestParam(required = false, defaultValue = "false") boolean force) {
        contentService.deleteContent(id, auth != null ? auth.getName() : "Admin", force);
        return ResponseEntity.ok(Map.of("success", true, "message", "Coding problem deleted"));
    }

    @PostMapping("/coding-tests")
    public ResponseEntity<ContentItem> createCodingTest(Authentication auth, @Valid @RequestBody ContentItemRequest req) {
        req.setType("CODING_TEST");
        return ResponseEntity.ok(contentService.createContent(req, auth != null ? auth.getName() : "Admin"));
    }

    @PutMapping("/coding-tests/{id}")
    public ResponseEntity<ContentItem> updateCodingTest(Authentication auth, @PathVariable String id, @Valid @RequestBody ContentItemRequest req) {
        req.setType("CODING_TEST");
        return ResponseEntity.ok(contentService.updateContent(id, req, auth != null ? auth.getName() : "Admin", false));
    }

    @DeleteMapping("/coding-tests/{id}")
    public ResponseEntity<Map<String, Object>> deleteCodingTest(Authentication auth, @PathVariable String id, @RequestParam(required = false, defaultValue = "false") boolean force) {
        contentService.deleteContent(id, auth != null ? auth.getName() : "Admin", force);
        return ResponseEntity.ok(Map.of("success", true, "message", "Coding test deleted"));
    }

    // --- Task 6: Mock Interviews ---
    @PostMapping("/mock-interviews")
    public ResponseEntity<ContentItem> createMockInterview(Authentication auth, @Valid @RequestBody ContentItemRequest req) {
        req.setType("MOCK_INTERVIEW");
        return ResponseEntity.ok(contentService.createContent(req, auth != null ? auth.getName() : "Admin"));
    }

    @PutMapping("/mock-interviews/{id}")
    public ResponseEntity<ContentItem> updateMockInterview(Authentication auth, @PathVariable String id, @Valid @RequestBody ContentItemRequest req) {
        req.setType("MOCK_INTERVIEW");
        return ResponseEntity.ok(contentService.updateContent(id, req, auth != null ? auth.getName() : "Admin", false));
    }

    @DeleteMapping("/mock-interviews/{id}")
    public ResponseEntity<Map<String, Object>> deleteMockInterview(Authentication auth, @PathVariable String id, @RequestParam(required = false, defaultValue = "false") boolean force) {
        contentService.deleteContent(id, auth != null ? auth.getName() : "Admin", force);
        return ResponseEntity.ok(Map.of("success", true, "message", "Mock interview deleted"));
    }

    @PostMapping("/mock-interviews/generate-questions")
    public ResponseEntity<Map<String, Object>> generateInterviewQuestions(@Valid @RequestBody AiGenerateInterviewRequest req) {
        return ResponseEntity.ok(contentService.generateInterviewQuestions(req));
    }

    // --- Task 7: Practice Topics & Articles ---
    @PostMapping("/practice-topics")
    public ResponseEntity<ContentItem> createPracticeTopic(Authentication auth, @Valid @RequestBody ContentItemRequest req) {
        req.setType("PRACTICE_TOPIC");
        return ResponseEntity.ok(contentService.createContent(req, auth != null ? auth.getName() : "Admin"));
    }

    @PutMapping("/practice-topics/{id}")
    public ResponseEntity<ContentItem> updatePracticeTopic(Authentication auth, @PathVariable String id, @Valid @RequestBody ContentItemRequest req) {
        req.setType("PRACTICE_TOPIC");
        return ResponseEntity.ok(contentService.updateContent(id, req, auth != null ? auth.getName() : "Admin", false));
    }

    @DeleteMapping("/practice-topics/{id}")
    public ResponseEntity<Map<String, Object>> deletePracticeTopic(Authentication auth, @PathVariable String id, @RequestParam(required = false, defaultValue = "false") boolean force) {
        contentService.deleteContent(id, auth != null ? auth.getName() : "Admin", force);
        return ResponseEntity.ok(Map.of("success", true, "message", "Practice topic deleted"));
    }

    @PostMapping("/articles")
    public ResponseEntity<ContentItem> createArticle(Authentication auth, @Valid @RequestBody ContentItemRequest req) {
        req.setType("ARTICLE");
        return ResponseEntity.ok(contentService.createContent(req, auth != null ? auth.getName() : "Admin"));
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<ContentItem> updateArticle(Authentication auth, @PathVariable String id, @Valid @RequestBody ContentItemRequest req) {
        req.setType("ARTICLE");
        return ResponseEntity.ok(contentService.updateContent(id, req, auth != null ? auth.getName() : "Admin", false));
    }

    @DeleteMapping("/articles/{id}")
    public ResponseEntity<Map<String, Object>> deleteArticle(Authentication auth, @PathVariable String id, @RequestParam(required = false, defaultValue = "false") boolean force) {
        contentService.deleteContent(id, auth != null ? auth.getName() : "Admin", force);
        return ResponseEntity.ok(Map.of("success", true, "message", "Article deleted"));
    }
}
