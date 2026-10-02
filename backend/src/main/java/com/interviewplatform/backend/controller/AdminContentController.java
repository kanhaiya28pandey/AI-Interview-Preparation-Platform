package com.interviewplatform.backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.ContentItemDto;
import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.repository.ContentItemRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/admin/content", "/api/admin/content"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {

    private final ContentItemRepository contentItemRepository;

    public AdminContentController(ContentItemRepository contentItemRepository) {
        this.contentItemRepository = contentItemRepository;
    }

    @GetMapping
    public ResponseEntity<List<ContentItem>> getAllContent(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status
    ) {
        List<ContentItem> items = contentItemRepository.findAll();
        if (items.isEmpty()) {
            items = getSeedSampleItems();
        }

        List<ContentItem> filtered = items.stream().filter(i -> {
            if (type != null && !type.equalsIgnoreCase("All") && !i.getType().equalsIgnoreCase(type)) return false;
            if (subject != null && !subject.equalsIgnoreCase("All") && !i.getSubject().equalsIgnoreCase(subject)) return false;
            if (difficulty != null && !difficulty.equalsIgnoreCase("All") && !i.getDifficulty().equalsIgnoreCase(difficulty)) return false;
            if (status != null && !status.equalsIgnoreCase("All") && !i.getStatus().equalsIgnoreCase(status)) return false;
            return true;
        }).toList();

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getContentById(@PathVariable String id) {
        return contentItemRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Content item not found with ID: " + id)));
    }

    @PostMapping
    public ResponseEntity<?> createContent(@Valid @RequestBody ContentItemDto dto, Authentication authentication) {
        ContentItem item = mapDtoToEntity(dto);
        if (item.getId() == null || item.getId().isEmpty()) {
            item.setId("cnt-" + UUID.randomUUID().toString().substring(0, 8));
        }
        item.setCreatedAt(LocalDateTime.now().toString());
        item.setUpdatedAt(LocalDateTime.now().toString());
        item.setCreatedBy(authentication != null ? authentication.getName() : "Admin");
        if (item.getStatus() == null || item.getStatus().isEmpty()) {
            item.setStatus("Draft");
        }

        ContentItem saved = contentItemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateContent(@PathVariable String id, @Valid @RequestBody ContentItemDto dto) {
        ContentItem existing = contentItemRepository.findById(id).orElse(null);
        if (existing == null) {
            existing = mapDtoToEntity(dto);
            existing.setId(id);
        } else {
            updateEntityFromDto(existing, dto);
        }
        existing.setUpdatedAt(LocalDateTime.now().toString());
        ContentItem updated = contentItemRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContent(@PathVariable String id) {
        ContentItem item = contentItemRepository.findById(id).orElse(null);
        if (item != null && item.getStudentAttemptsCount() > 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Cannot permanently delete content with active student attempts (" + item.getStudentAttemptsCount() + " attempts). Consider Archiving instead.",
                    "canArchive", true
            ));
        }
        contentItemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Content deleted successfully", "id", id));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicateContent(@PathVariable String id) {
        ContentItem source = contentItemRepository.findById(id).orElse(null);
        if (source == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Source content not found: " + id));
        }

        ContentItem copy = new ContentItem();
        copy.setId("cnt-" + UUID.randomUUID().toString().substring(0, 8));
        copy.setTitle(source.getTitle() + " (Copy)");
        copy.setDescription(source.getDescription());
        copy.setType(source.getType());
        copy.setSubject(source.getSubject());
        copy.setTopics(source.getTopics());
        copy.setDifficulty(source.getDifficulty());
        copy.setStatus("Draft");
        copy.setCreatedBy(source.getCreatedBy());
        copy.setCreatedAt(LocalDateTime.now().toString());
        copy.setUpdatedAt(LocalDateTime.now().toString());
        copy.setStudentAttemptsCount(0);
        copy.setQuestionsCount(source.getQuestionsCount());
        copy.setDurationMinutes(source.getDurationMinutes());
        copy.setPassMarkPercent(source.getPassMarkPercent());
        copy.setNegativeMarking(source.isNegativeMarking());
        copy.setShuffleOptions(source.isShuffleOptions());
        copy.setShowAnswers(source.isShowAnswers());
        copy.setScheduleStart(source.getScheduleStart());
        copy.setScheduleEnd(source.getScheduleEnd());
        copy.setVisibility(source.getVisibility());
        copy.setPayload(source.getPayload());

        ContentItem savedCopy = contentItemRepository.save(copy);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCopy);
    }

    @PostMapping("/bulk-status")
    public ResponseEntity<?> bulkUpdateStatus(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) body.get("ids");
        String action = (String) body.get("action"); // PUBLISH, UNPUBLISH, ARCHIVE, DELETE

        if (ids == null || ids.isEmpty() || action == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid request params"));
        }

        int updatedCount = 0;
        List<String> skippedIds = new ArrayList<>();

        for (String id : ids) {
            ContentItem item = contentItemRepository.findById(id).orElse(null);
            if (item != null) {
                if ("DELETE".equalsIgnoreCase(action)) {
                    if (item.getStudentAttemptsCount() > 0) {
                        skippedIds.add(id);
                    } else {
                        contentItemRepository.deleteById(id);
                        updatedCount++;
                    }
                } else {
                    if ("PUBLISH".equalsIgnoreCase(action)) item.setStatus("Published");
                    else if ("UNPUBLISH".equalsIgnoreCase(action)) item.setStatus("Draft");
                    else if ("ARCHIVE".equalsIgnoreCase(action)) item.setStatus("Archived");
                    item.setUpdatedAt(LocalDateTime.now().toString());
                    contentItemRepository.save(item);
                    updatedCount++;
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("action", action);
        response.put("updatedCount", updatedCount);
        response.put("skippedIds", skippedIds);
        response.put("message", "Bulk action " + action + " completed for " + updatedCount + " items.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-mcq")
    public ResponseEntity<?> generateMcqQuestions(@RequestBody Map<String, Object> request) {
        String subject = (String) request.getOrDefault("subject", "DSA");
        String topic = (String) request.getOrDefault("topic", "Arrays");
        String difficulty = (String) request.getOrDefault("difficulty", "Medium");
        int count = request.containsKey("count") ? ((Number) request.get("count")).intValue() : 3;

        List<Map<String, Object>> questions = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", "gen-q-" + i + "-" + UUID.randomUUID().toString().substring(0, 4));
            q.put("questionText", "What is the optimal time complexity to solve " + topic + " (" + difficulty + " Level) challenge #" + i + "?");
            q.put("codeSnippet", i % 2 == 0 ? "public void solve(int[] arr) {\n  // " + topic + " implementation\n}" : "");
            q.put("options", List.of("O(N)", "O(N log N)", "O(N^2)", "O(1)"));
            q.put("correctOptionIndex", 0);
            q.put("explanation", "The optimal approach utilizes two-pointers or hashing to process " + topic + " elements in a single pass O(N) time complexity.");
            questions.add(q);
        }

        return ResponseEntity.ok(Map.of(
                "subject", subject,
                "topic", topic,
                "difficulty", difficulty,
                "questions", questions
        ));
    }

    private ContentItem mapDtoToEntity(ContentItemDto dto) {
        ContentItem item = new ContentItem();
        updateEntityFromDto(item, dto);
        return item;
    }

    private void updateEntityFromDto(ContentItem item, ContentItemDto dto) {
        if (dto.getId() != null) item.setId(dto.getId());
        item.setTitle(dto.getTitle());
        item.setDescription(dto.getDescription());
        item.setType(dto.getType());
        item.setSubject(dto.getSubject());
        item.setTopics(dto.getTopics());
        item.setDifficulty(dto.getDifficulty());
        item.setStatus(dto.getStatus());
        item.setCreatedBy(dto.getCreatedBy());
        item.setStudentAttemptsCount(dto.getStudentAttemptsCount());
        item.setQuestionsCount(dto.getQuestionsCount());
        item.setDurationMinutes(dto.getDurationMinutes());
        item.setPassMarkPercent(dto.getPassMarkPercent());
        item.setNegativeMarking(dto.isNegativeMarking());
        item.setShuffleOptions(dto.isShuffleOptions());
        item.setShowAnswers(dto.isShowAnswers());
        item.setScheduleStart(dto.getScheduleStart());
        item.setScheduleEnd(dto.getScheduleEnd());
        item.setVisibility(dto.getVisibility());
        item.setPayload(dto.getPayload());
    }

    private List<ContentItem> getSeedSampleItems() {
        List<ContentItem> list = new ArrayList<>();

        ContentItem c1 = new ContentItem();
        c1.setId("cnt-1");
        c1.setTitle("Data Structures & Algorithms Master Quiz");
        c1.setDescription("Comprehensive MCQ test covering Arrays, Linked Lists, Trees & Dynamic Programming.");
        c1.setType("MCQ Quiz");
        c1.setSubject("DSA");
        c1.setTopics(List.of("Arrays", "Trees", "DP"));
        c1.setDifficulty("Medium");
        c1.setStatus("Published");
        c1.setCreatedBy("Admin");
        c1.setCreatedAt("2026-09-15T10:00:00");
        c1.setUpdatedAt("2026-09-20T14:30:00");
        c1.setStudentAttemptsCount(142);
        c1.setQuestionsCount(15);
        c1.setDurationMinutes(30);
        c1.setPassMarkPercent(70);
        c1.setNegativeMarking(true);
        c1.setShuffleOptions(true);
        c1.setShowAnswers(true);
        c1.setVisibility("All");
        list.add(c1);

        ContentItem c2 = new ContentItem();
        c2.setId("cnt-2");
        c2.setTitle("Full-Stack Assessment Mock Test 2026");
        c2.setDescription("Combined 60-min test with 10 React/Java MCQs and 2 Coding Problems.");
        c2.setType("Mock Test");
        c2.setSubject("Web Dev");
        c2.setTopics(List.of("React.js", "Java", "SQL"));
        c2.setDifficulty("Mixed");
        c2.setStatus("Published");
        c2.setCreatedBy("Admin");
        c2.setCreatedAt("2026-09-18T11:00:00");
        c2.setUpdatedAt("2026-09-22T09:15:00");
        c2.setStudentAttemptsCount(88);
        c2.setQuestionsCount(12);
        c2.setDurationMinutes(60);
        c2.setPassMarkPercent(75);
        c2.setVisibility("All");
        list.add(c2);

        ContentItem c3 = new ContentItem();
        c3.setId("cnt-3");
        c3.setTitle("System Design & Microservices Round");
        c3.setDescription("AI-guided template simulating technical architecture interview.");
        c3.setType("Mock Interview");
        c3.setSubject("System Design");
        c3.setTopics(List.of("Load Balancers", "Caching", "Sharding"));
        c3.setDifficulty("Hard");
        c3.setStatus("Draft");
        c3.setCreatedBy("Admin");
        c3.setCreatedAt("2026-09-25T16:20:00");
        c3.setUpdatedAt("2026-09-28T18:45:00");
        c3.setStudentAttemptsCount(0);
        c3.setQuestionsCount(4);
        c3.setDurationMinutes(45);
        c3.setVisibility("Batch 2026");
        list.add(c3);

        return list;
    }
}
