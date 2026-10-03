package com.interviewplatform.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
import com.interviewplatform.backend.dto.ContentBulkActionRequest;
import com.interviewplatform.backend.dto.ContentItemRequest;
import com.interviewplatform.backend.dto.ContentSummaryDto;
import com.interviewplatform.backend.dto.ValidateSolutionRequest;
import com.interviewplatform.backend.model.ContentAuditLog;
import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.service.AdminContentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/admin/content", "/api/v1/admin/content"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {

    private final AdminContentService contentService;

    public AdminContentController(AdminContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping
    public ResponseEntity<List<ContentItem>> listContent(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "updatedAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir
    ) {
        List<ContentItem> items = contentService.getAllContent(type, subject, difficulty, status, search, sortBy, sortDir);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/summary")
    public ResponseEntity<ContentSummaryDto> getSummary() {
        return ResponseEntity.ok(contentService.getSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentItem> getContentById(@PathVariable String id) {
        return ResponseEntity.ok(contentService.getContentById(id));
    }

    @PostMapping
    public ResponseEntity<ContentItem> createContent(
            Authentication auth,
            @Valid @RequestBody ContentItemRequest request
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        ContentItem created = contentService.createContent(request, adminUser);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentItem> updateContent(
            Authentication auth,
            @PathVariable String id,
            @Valid @RequestBody ContentItemRequest request,
            @RequestParam(required = false, defaultValue = "false") boolean forceNewVersion
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        ContentItem updated = contentService.updateContent(id, request, adminUser, forceNewVersion);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteContent(
            Authentication auth,
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "false") boolean force
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        contentService.deleteContent(id, adminUser, force);
        return ResponseEntity.ok(Map.of("success", true, "message", "Content deleted successfully"));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ContentItem> duplicateContent(
            Authentication auth,
            @PathVariable String id
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        ContentItem dup = contentService.duplicateContent(id, adminUser);
        return ResponseEntity.ok(dup);
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<ContentItem> publishContent(
            Authentication auth,
            @PathVariable String id
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        return ResponseEntity.ok(contentService.updateStatus(id, "PUBLISHED", adminUser));
    }

    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<ContentItem> unpublishContent(
            Authentication auth,
            @PathVariable String id
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        return ResponseEntity.ok(contentService.updateStatus(id, "DRAFT", adminUser));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ContentItem> archiveContent(
            Authentication auth,
            @PathVariable String id
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        return ResponseEntity.ok(contentService.updateStatus(id, "ARCHIVED", adminUser));
    }

    @PostMapping("/{id}/restore/{version}")
    public ResponseEntity<ContentItem> restoreVersion(
            Authentication auth,
            @PathVariable String id,
            @PathVariable int version
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        ContentItem restored = contentService.restoreVersion(id, version, adminUser);
        return ResponseEntity.ok(restored);
    }

    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> bulkAction(
            Authentication auth,
            @Valid @RequestBody ContentBulkActionRequest request
    ) {
        String adminUser = auth != null ? auth.getName() : "Admin";
        return ResponseEntity.ok(contentService.executeBulkAction(request, adminUser));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<ContentAuditLog>> getAuditLogs(
            @RequestParam(required = false) String contentId,
            @RequestParam(required = false, defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(contentService.getAuditLogs(contentId, limit));
    }

    @PostMapping("/generate-quiz")
    public ResponseEntity<Map<String, Object>> generateQuizQuestions(
            @Valid @RequestBody AiGenerateQuizRequest request
    ) {
        return ResponseEntity.ok(contentService.generateQuizQuestions(request));
    }

    @PostMapping("/import-quiz-csv")
    public ResponseEntity<Map<String, Object>> importQuizQuestionsCsv(
            @RequestBody Map<String, String> body
    ) {
        String csvContent = body.getOrDefault("csv", "");
        return ResponseEntity.ok(contentService.importQuizQuestionsCsv(csvContent));
    }

    @PostMapping("/generate-interview")
    public ResponseEntity<Map<String, Object>> generateInterviewQuestions(
            @Valid @RequestBody AiGenerateInterviewRequest request
    ) {
        return ResponseEntity.ok(contentService.generateInterviewQuestions(request));
    }

    @PostMapping("/validate-solution")
    public ResponseEntity<Map<String, Object>> validateReferenceSolution(
            @Valid @RequestBody ValidateSolutionRequest request
    ) {
        return ResponseEntity.ok(contentService.validateReferenceSolution(request));
    }

    @GetMapping("/export/{id}")
    public ResponseEntity<ContentItem> exportContentAsJson(@PathVariable String id) {
        ContentItem item = contentService.getContentById(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"content-" + id + ".json\"")
                .body(item);
    }

    @GetMapping("/export-quiz/{id}/csv")
    public ResponseEntity<String> exportQuizCsv(@PathVariable String id) {
        String csv = contentService.exportQuizCsv(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"quiz-questions-" + id + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
