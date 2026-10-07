package com.interviewplatform.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.AdminCodingTest;
import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.repository.AdminCodingTestRepository;
import com.interviewplatform.backend.repository.ContentItemRepository;

@RestController
@RequestMapping({"/api/v1/admin/coding-tests", "/api/admin/coding-tests"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminCodingTestController {

    private final AdminCodingTestRepository codingTestRepository;
    private final ContentItemRepository contentItemRepository;

    public AdminCodingTestController(AdminCodingTestRepository codingTestRepository, ContentItemRepository contentItemRepository) {
        this.codingTestRepository = codingTestRepository;
        this.contentItemRepository = contentItemRepository;
    }

    @GetMapping
    public ResponseEntity<List<AdminCodingTest>> getCodingTests() {
        List<AdminCodingTest> list = codingTestRepository.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminCodingTest> getCodingTestById(@PathVariable String id) {
        return codingTestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AdminCodingTest> saveCodingTest(@RequestBody AdminCodingTest test) {
        if (test.getId() == null || test.getId().isBlank()) {
            test.setId("test-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (test.getCreatedAt() == null || test.getCreatedAt().isBlank()) {
            test.setCreatedAt(LocalDate.now().toString());
        }
        if (test.getStatus() == null || test.getStatus().isBlank()) {
            test.setStatus("ACTIVE");
        }
        AdminCodingTest saved = codingTestRepository.save(test);

        // Also register/sync in ContentItem so students can discover it via Content Manager / Coding Arena
        try {
            ContentItem item = contentItemRepository.findById(saved.getId()).orElse(new ContentItem());
            item.setId(saved.getId());
            item.setTitle(saved.getTitle());
            item.setType("CODING_TEST");
            item.setSubject(saved.getDomain() != null ? saved.getDomain() : "Core Algorithms");
            item.setDifficulty(saved.getDifficulty() != null ? saved.getDifficulty() : "Medium");
            item.setStatus("ACTIVE".equalsIgnoreCase(saved.getStatus()) || "LIVE".equalsIgnoreCase(saved.getStatus()) ? "Published" : "Draft");
            item.setDescription("Coding benchmark test covering: " + (saved.getTopics() != null && !saved.getTopics().isEmpty() ? saved.getTopics().get(0).getName() : saved.getTitle()));
            item.setQuestionsCount(saved.getTopics() != null ? saved.getTopics().stream().mapToInt(t -> t.getQuestionCount()).sum() : 2);
            item.setCreatedBy("ADMIN");
            item.setUpdatedAt(LocalDate.now().toString());
            contentItemRepository.save(item);
        } catch (Exception ignored) {}

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminCodingTest> updateCodingTest(@PathVariable String id, @RequestBody AdminCodingTest test) {
        test.setId(id);
        AdminCodingTest updated = codingTestRepository.save(test);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCodingTest(@PathVariable String id) {
        codingTestRepository.deleteById(id);
        try {
            contentItemRepository.deleteById(id);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(Map.of("success", true, "id", id, "message", "Coding test deleted successfully"));
    }
}
