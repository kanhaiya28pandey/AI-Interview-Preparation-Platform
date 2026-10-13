package com.interviewplatform.backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
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
import com.interviewplatform.backend.model.ContentAuditLog;
import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.repository.ContentAuditLogRepository;
import com.interviewplatform.backend.repository.ContentItemRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/admin/content", "/api/v1/admin/content", "/api/admin/content"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {

    private final ContentItemRepository contentItemRepository;
    private final ContentAuditLogRepository auditLogRepository;
    private final com.interviewplatform.backend.service.NotificationService notificationService;

    public AdminContentController(ContentItemRepository contentItemRepository, ContentAuditLogRepository auditLogRepository, com.interviewplatform.backend.service.NotificationService notificationService) {
        this.contentItemRepository = contentItemRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationService = notificationService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getContentSummary() {
        List<ContentItem> items = contentItemRepository.findAll();
        if (items.isEmpty()) {
            items = getSeedSampleItems();
            contentItemRepository.saveAll(items);
        }

        int totalItems = items.size();
        int totalPublished = (int) items.stream().filter(i -> isStatus(i.getStatus(), "PUBLISHED")).count();
        int totalDrafts = (int) items.stream().filter(i -> isStatus(i.getStatus(), "DRAFT")).count();
        int totalArchived = (int) items.stream().filter(i -> isStatus(i.getStatus(), "ARCHIVED")).count();

        List<String> types = Arrays.asList(
                "QUIZ", "MOCK_TEST", "CODING_TEST", "CODING_PROBLEM",
                "MOCK_INTERVIEW", "PRACTICE_TOPIC", "ARTICLE",
                "MCQ Quiz", "Mock Test", "Coding Test", "Mock Interview", "Practice Track", "Article"
        );

        Map<String, Map<String, Integer>> statsByType = new HashMap<>();
        for (String t : types) {
            List<ContentItem> matching = items.stream()
                    .filter(i -> i.getType() != null && i.getType().equalsIgnoreCase(t))
                    .toList();

            Map<String, Integer> stat = new HashMap<>();
            stat.put("total", matching.size());
            stat.put("draft", (int) matching.stream().filter(i -> isStatus(i.getStatus(), "DRAFT")).count());
            stat.put("published", (int) matching.stream().filter(i -> isStatus(i.getStatus(), "PUBLISHED")).count());
            stat.put("archived", (int) matching.stream().filter(i -> isStatus(i.getStatus(), "ARCHIVED")).count());
            statsByType.put(t, stat);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalItems", totalItems);
        summary.put("totalPublished", totalPublished);
        summary.put("totalDrafts", totalDrafts);
        summary.put("totalArchived", totalArchived);
        summary.put("statsByType", statsByType);

        return ResponseEntity.ok(summary);
    }

    @GetMapping
    public ResponseEntity<List<ContentItem>> getAllContent(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir
    ) {
        List<ContentItem> items = contentItemRepository.findAll();
        if (items.isEmpty()) {
            items = getSeedSampleItems();
            contentItemRepository.saveAll(items);
        }

        List<ContentItem> filtered = items.stream().filter(i -> {
            if (type != null && !type.equalsIgnoreCase("All") && !type.equalsIgnoreCase("ALL")) {
                if (i.getType() == null || !i.getType().equalsIgnoreCase(type)) return false;
            }
            if (subject != null && !subject.equalsIgnoreCase("All") && !subject.equalsIgnoreCase("ALL")) {
                if (i.getSubject() == null || !i.getSubject().equalsIgnoreCase(subject)) return false;
            }
            if (difficulty != null && !difficulty.equalsIgnoreCase("All") && !difficulty.equalsIgnoreCase("ALL")) {
                if (i.getDifficulty() == null || !i.getDifficulty().equalsIgnoreCase(difficulty)) return false;
            }
            if (status != null && !status.equalsIgnoreCase("All") && !status.equalsIgnoreCase("ALL")) {
                if (!isStatus(i.getStatus(), status)) return false;
            }
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean matchesTitle = i.getTitle() != null && i.getTitle().toLowerCase().contains(q);
                boolean matchesDesc = i.getDescription() != null && i.getDescription().toLowerCase().contains(q);
                boolean matchesSubj = i.getSubject() != null && i.getSubject().toLowerCase().contains(q);
                boolean matchesTags = i.getTags() != null && i.getTags().stream().anyMatch(t -> t.toLowerCase().contains(q));
                if (!matchesTitle && !matchesDesc && !matchesSubj && !matchesTags) return false;
            }
            return true;
        }).sorted((a, b) -> {
            boolean asc = "asc".equalsIgnoreCase(sortDir);
            if ("title".equalsIgnoreCase(sortBy)) {
                return asc ? a.getTitle().compareToIgnoreCase(b.getTitle()) : b.getTitle().compareToIgnoreCase(a.getTitle());
            } else if ("studentAttempts".equalsIgnoreCase(sortBy)) {
                return asc ? Integer.compare(a.getStudentAttemptsCount(), b.getStudentAttemptsCount()) : Integer.compare(b.getStudentAttemptsCount(), a.getStudentAttemptsCount());
            } else {
                String timeA = a.getUpdatedAt() != null ? a.getUpdatedAt() : a.getCreatedAt();
                String timeB = b.getUpdatedAt() != null ? b.getUpdatedAt() : b.getCreatedAt();
                return asc ? (timeA != null ? timeA.compareTo(timeB != null ? timeB : "") : 0) : (timeB != null ? timeB.compareTo(timeA != null ? timeA : "") : 0);
            }
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
        item.setVersion(1);
        if (item.getStatus() == null || item.getStatus().isEmpty()) {
            item.setStatus("Draft");
        }

        ContentItem saved = contentItemRepository.save(item);

        recordAuditLog(saved.getId(), saved.getTitle(), saved.getType(), "CREATE",
                item.getCreatedBy(), "Created content item: " + saved.getTitle());

        if ("Published".equalsIgnoreCase(saved.getStatus())) {
            broadcastPublishedNotification(saved);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateContent(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "false") boolean forceNewVersion,
            @Valid @RequestBody ContentItemDto dto,
            Authentication authentication
    ) {
        ContentItem existing = contentItemRepository.findById(id).orElse(null);
        String adminUser = authentication != null ? authentication.getName() : "Admin";

        if (existing == null) {
            existing = mapDtoToEntity(dto);
            existing.setId(id);
            existing.setCreatedAt(LocalDateTime.now().toString());
            existing.setVersion(1);
        } else {
            if (forceNewVersion) {
                // Snapshot previous version
                Map<String, Object> snapshot = new HashMap<>();
                snapshot.put("version", existing.getVersion());
                snapshot.put("updatedAt", existing.getUpdatedAt());
                snapshot.put("title", existing.getTitle());
                snapshot.put("contentData", existing.getContentData());
                snapshot.put("settings", existing.getSettings());
                snapshot.put("payload", existing.getPayload());

                if (existing.getVersions() == null) existing.setVersions(new ArrayList<>());
                existing.getVersions().add(snapshot);
                existing.setVersion(existing.getVersion() + 1);
            }
            updateEntityFromDto(existing, dto);
        }

        existing.setUpdatedAt(LocalDateTime.now().toString());
        ContentItem updated = contentItemRepository.save(existing);

        recordAuditLog(updated.getId(), updated.getTitle(), updated.getType(), "UPDATE",
                adminUser, "Updated content item (version " + updated.getVersion() + ")");

        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/publish", method = {org.springframework.web.bind.annotation.RequestMethod.PATCH, org.springframework.web.bind.annotation.RequestMethod.POST})
    public ResponseEntity<?> publishContent(@PathVariable String id, Authentication authentication) {
        return setStatus(id, "Published", "PUBLISH", authentication);
    }

    @RequestMapping(value = "/{id}/unpublish", method = {org.springframework.web.bind.annotation.RequestMethod.PATCH, org.springframework.web.bind.annotation.RequestMethod.POST})
    public ResponseEntity<?> unpublishContent(@PathVariable String id, Authentication authentication) {
        return setStatus(id, "Draft", "UNPUBLISH", authentication);
    }

    @RequestMapping(value = "/{id}/archive", method = {org.springframework.web.bind.annotation.RequestMethod.PATCH, org.springframework.web.bind.annotation.RequestMethod.POST})
    public ResponseEntity<?> archiveContent(@PathVariable String id, Authentication authentication) {
        return setStatus(id, "Archived", "ARCHIVE", authentication);
    }

    @PostMapping("/{id}/restore/{version}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> restoreVersion(@PathVariable String id, @PathVariable int version, Authentication authentication) {
        ContentItem item = contentItemRepository.findById(id).orElse(null);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Content item not found: " + id));
        }

        if (item.getVersions() != null) {
            for (Map<String, Object> snap : item.getVersions()) {
                if (snap.containsKey("version") && ((Number) snap.get("version")).intValue() == version) {
                    if (snap.containsKey("title")) item.setTitle((String) snap.get("title"));
                    if (snap.containsKey("contentData")) item.setContentData((Map<String, Object>) snap.get("contentData"));
                    if (snap.containsKey("settings")) item.setSettings((Map<String, Object>) snap.get("settings"));
                    if (snap.containsKey("payload")) item.setPayload((Map<String, Object>) snap.get("payload"));
                    item.setUpdatedAt(LocalDateTime.now().toString());
                    ContentItem saved = contentItemRepository.save(item);

                    recordAuditLog(id, item.getTitle(), item.getType(), "RESTORE",
                            authentication != null ? authentication.getName() : "Admin",
                            "Restored version " + version);

                    return ResponseEntity.ok(saved);
                }
            }
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Version " + version + " not found in version history"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContent(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "false") boolean force,
            Authentication authentication
    ) {
        ContentItem item = contentItemRepository.findById(id).orElse(null);
        if (item != null && item.getStudentAttemptsCount() > 0 && !force) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Cannot permanently delete content with active student attempts (" + item.getStudentAttemptsCount() + " attempts). Consider Archiving instead.",
                    "canArchive", true
            ));
        }
        if (item != null) {
            contentItemRepository.deleteById(id);
            recordAuditLog(id, item.getTitle(), item.getType(), "DELETE",
                    authentication != null ? authentication.getName() : "Admin",
                    "Deleted content item");
        }
        return ResponseEntity.ok(Map.of("message", "Content deleted successfully", "id", id));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicateContent(@PathVariable String id, Authentication authentication) {
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
        copy.setTags(source.getTags());
        copy.setDifficulty(source.getDifficulty());
        copy.setDifficultySplit(source.getDifficultySplit());
        copy.setStatus("Draft");
        copy.setCreatedBy(authentication != null ? authentication.getName() : "Admin");
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
        copy.setVersion(1);
        copy.setSettings(source.getSettings());
        copy.setContentData(source.getContentData());
        copy.setPayload(source.getPayload());

        ContentItem savedCopy = contentItemRepository.save(copy);
        recordAuditLog(savedCopy.getId(), savedCopy.getTitle(), savedCopy.getType(), "DUPLICATE",
                copy.getCreatedBy(), "Duplicated from " + id);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedCopy);
    }

    @PostMapping({"/bulk", "/bulk-status"})
    public ResponseEntity<?> bulkAction(@RequestBody Map<String, Object> body, Authentication authentication) {
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) body.get("ids");
        String action = (String) body.get("action");

        if (ids == null || ids.isEmpty() || action == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid request parameters"));
        }

        int updatedCount = 0;
        List<String> skippedIds = new ArrayList<>();
        String adminUser = authentication != null ? authentication.getName() : "Admin";

        for (String id : ids) {
            ContentItem item = contentItemRepository.findById(id).orElse(null);
            if (item != null) {
                if ("DELETE".equalsIgnoreCase(action)) {
                    if (item.getStudentAttemptsCount() > 0) {
                        skippedIds.add(id);
                    } else {
                        contentItemRepository.deleteById(id);
                        recordAuditLog(id, item.getTitle(), item.getType(), "DELETE", adminUser, "Bulk delete");
                        updatedCount++;
                    }
                } else {
                    if ("PUBLISH".equalsIgnoreCase(action)) item.setStatus("Published");
                    else if ("UNPUBLISH".equalsIgnoreCase(action)) item.setStatus("Draft");
                    else if ("ARCHIVE".equalsIgnoreCase(action)) item.setStatus("Archived");
                    item.setUpdatedAt(LocalDateTime.now().toString());
                    contentItemRepository.save(item);
                    recordAuditLog(id, item.getTitle(), item.getType(), action.toUpperCase(), adminUser, "Bulk " + action);
                    updatedCount++;
                }
            }
        }

        return ResponseEntity.ok(Map.of(
                "action", action,
                "updatedCount", updatedCount,
                "skippedIds", skippedIds,
                "message", "Bulk action " + action + " completed for " + updatedCount + " items."
        ));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<ContentAuditLog>> getAuditLogs(
            @RequestParam(required = false) String contentId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<ContentAuditLog> logs;
        if (contentId != null && !contentId.isBlank()) {
            logs = auditLogRepository.findByContentIdOrderByTimestampDesc(contentId);
        } else {
            logs = auditLogRepository.findAllByOrderByTimestampDesc();
        }
        return ResponseEntity.ok(logs.stream().limit(limit).toList());
    }

    @PostMapping({"/generate-quiz", "/generate-mcq"})
    public ResponseEntity<?> generateQuizQuestions(@RequestBody Map<String, Object> request) {
        String subject = (String) request.getOrDefault("subject", "DSA");
        String topic = (String) request.getOrDefault("topic", "Arrays");
        String difficulty = (String) request.getOrDefault("difficulty", "Medium");
        int count = request.containsKey("questionCount") ? ((Number) request.get("questionCount")).intValue()
                : (request.containsKey("count") ? ((Number) request.get("count")).intValue() : 3);

        List<Map<String, Object>> questions = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", "ai-q-" + System.currentTimeMillis() + "-" + i);
            q.put("question", "In " + subject + " (" + topic + "), what is the fundamental performance implication of solution #" + i + " at " + difficulty + " difficulty?");
            q.put("codeSnippet", i % 2 == 0 ? "public int compute" + topic.replaceAll("\\s+", "") + "(int[] data) {\n    // " + topic + " algorithm\n    return data.length;\n}" : null);
            q.put("options", List.of("O(1) Auxiliary Space", "O(N) Linear Traversal", "O(N log N) Divide and Conquer", "O(2^N) Exponential"));
            q.put("correctIndex", 1);
            q.put("explanation", "Processing " + topic + " elements in standard sequential access requires a linear O(N) pass, maintaining optimal algorithmic complexity.");
            q.put("marks", 2);
            q.put("difficulty", difficulty);
            q.put("topic", topic);
            questions.add(q);
        }

        return ResponseEntity.ok(Map.of(
                "subject", subject,
                "topic", topic,
                "difficulty", difficulty,
                "questions", questions
        ));
    }

    @PostMapping("/import-quiz-csv")
    public ResponseEntity<?> importQuizCsv(@RequestBody Map<String, String> body) {
        String csv = body.getOrDefault("csv", "");
        List<Map<String, Object>> questions = new ArrayList<>();
        String[] lines = csv.split("\n");

        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            String[] cols = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
            if (cols.length >= 6) {
                Map<String, Object> q = new HashMap<>();
                q.put("id", "csv-q-" + i + "-" + UUID.randomUUID().toString().substring(0, 4));
                q.put("question", cols[0].replaceAll("^\"|\"$", "").trim());
                q.put("options", List.of(
                        cols[1].replaceAll("^\"|\"$", "").trim(),
                        cols[2].replaceAll("^\"|\"$", "").trim(),
                        cols[3].replaceAll("^\"|\"$", "").trim(),
                        cols[4].replaceAll("^\"|\"$", "").trim()
                ));
                String correctStr = cols[5].replaceAll("^\"|\"$", "").trim();
                int correctIdx = 0;
                try {
                    correctIdx = Integer.parseInt(correctStr);
                } catch (NumberFormatException e) {
                    if ("B".equalsIgnoreCase(correctStr)) correctIdx = 1;
                    else if ("C".equalsIgnoreCase(correctStr)) correctIdx = 2;
                    else if ("D".equalsIgnoreCase(correctStr)) correctIdx = 3;
                }
                q.put("correctIndex", correctIdx);
                q.put("explanation", cols.length > 6 ? cols[6].replaceAll("^\"|\"$", "").trim() : "Standard syllabus topic question");
                q.put("marks", cols.length > 7 ? Integer.parseInt(cols[7].trim()) : 1);
                q.put("difficulty", cols.length > 8 ? cols[8].trim() : "Medium");
                q.put("topic", cols.length > 9 ? cols[9].trim() : "General");
                questions.add(q);
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "importedCount", questions.size(),
                "questions", questions
        ));
    }

    private ResponseEntity<?> setStatus(String id, String newStatus, String actionName, Authentication authentication) {
        ContentItem item = contentItemRepository.findById(id).orElse(null);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Content item not found: " + id));
        }
        item.setStatus(newStatus);
        item.setUpdatedAt(LocalDateTime.now().toString());
        ContentItem saved = contentItemRepository.save(item);

        recordAuditLog(id, item.getTitle(), item.getType(), actionName,
                authentication != null ? authentication.getName() : "Admin",
                "Changed status to " + newStatus);

        if ("Published".equalsIgnoreCase(newStatus)) {
            broadcastPublishedNotification(saved);
        }

        return ResponseEntity.ok(saved);
    }

    private void broadcastPublishedNotification(ContentItem item) {
        if (item == null || item.getTitle() == null) return;
        try {
            String type = item.getType() != null ? item.getType().toUpperCase() : "GENERAL";
            String notifType = "content";
            String link = "/dashboard";
            String title = "New Content Published: " + item.getTitle();
            String message = item.getDescription() != null && !item.getDescription().isBlank()
                    ? item.getDescription()
                    : "Admin has published a new test / assessment for your practice.";

            if (type.contains("CONTEST") || type.contains("CODING_TEST") || type.contains("CODING_PROBLEM")) {
                notifType = "coding";
                link = "/coding";
                title = "New Coding Contest / Challenge: " + item.getTitle();
                message = "A new live coding benchmark is now open for students. Test your skills now!";
            } else if (type.contains("QUIZ") || type.contains("MOCK_TEST")) {
                notifType = "quiz";
                link = "/quiz";
                title = "New Quiz / Mock Test Available: " + item.getTitle();
                message = "New assessment added to Quiz Arena. Put your skills to the test!";
            } else if (type.contains("INTERVIEW")) {
                notifType = "interview";
                link = "/mock-interview";
                title = "New AI Mock Interview Track: " + item.getTitle();
                message = "Practice role-specific mock questions with our real-time AI evaluator.";
            } else if (type.contains("ARTICLE")) {
                notifType = "content";
                link = "/articles";
                title = "New Preparation Article: " + item.getTitle();
                message = "Read newly released interview preparation insights and guide.";
            }

            notificationService.notifyStudents(notifType, title, message, link, "info");
        } catch (Exception ignored) {
        }
    }

    private void recordAuditLog(String contentId, String title, String type, String action, String user, String details) {
        try {
            ContentAuditLog log = new ContentAuditLog(
                    "log-" + UUID.randomUUID().toString().substring(0, 8),
                    contentId,
                    title,
                    type,
                    action,
                    user,
                    details
            );
            auditLogRepository.save(log);
        } catch (Exception ignored) {
        }
    }

    private boolean isStatus(String actual, String target) {
        if (actual == null) return false;
        return actual.equalsIgnoreCase(target);
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
        item.setTags(dto.getTags());
        item.setDifficulty(dto.getDifficulty());
        item.setDifficultySplit(dto.getDifficultySplit());
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
        item.setSettings(dto.getSettings());
        item.setContentData(dto.getContentData());
        item.setPayload(dto.getPayload());
    }

    private List<ContentItem> getSeedSampleItems() {
        List<ContentItem> list = new ArrayList<>();

        ContentItem c1 = new ContentItem();
        c1.setId("cnt-1");
        c1.setTitle("Full-Stack System Design Challenge");
        c1.setDescription("End-to-end distributed systems architecture quiz & scenario test");
        c1.setType("QUIZ");
        c1.setSubject("System Design");
        c1.setTopics(List.of("Caching", "Load Balancing", "CAP Theorem", "Database Sharding"));
        c1.setTags(List.of("High-Scale", "Architecture", "FAANG"));
        c1.setDifficulty("Hard");
        c1.setStatus("Published");
        c1.setCreatedBy("Lead Architect");
        c1.setCreatedAt("2026-09-15T10:00:00");
        c1.setUpdatedAt("2026-09-20T14:30:00");
        c1.setStudentAttemptsCount(142);
        c1.setQuestionsCount(15);
        c1.setDurationMinutes(45);
        c1.setPassMarkPercent(70);
        c1.setNegativeMarking(true);
        c1.setShuffleOptions(true);
        c1.setShowAnswers(true);
        c1.setVisibility("ALL");
        list.add(c1);

        ContentItem c2 = new ContentItem();
        c2.setId("cnt-2");
        c2.setTitle("Dynamic Programming Master Track");
        c2.setDescription("Core memoization, tabulation, and interval DP problems with automated judge verification");
        c2.setType("CODING_PROBLEM");
        c2.setSubject("DSA");
        c2.setTopics(List.of("Dynamic Programming", "Recursion", "Arrays"));
        c2.setTags(List.of("Algorithms", "LeetCode", "Google"));
        c2.setDifficulty("Medium");
        c2.setStatus("Published");
        c2.setCreatedBy("DSA Lead");
        c2.setCreatedAt("2026-09-18T11:00:00");
        c2.setUpdatedAt("2026-09-22T09:15:00");
        c2.setStudentAttemptsCount(320);
        c2.setQuestionsCount(3);
        c2.setDurationMinutes(60);
        c2.setPassMarkPercent(60);
        c2.setVisibility("ALL");
        list.add(c2);

        ContentItem c3 = new ContentItem();
        c3.setId("cnt-3");
        c3.setTitle("Senior Backend Engineer AI Interview");
        c3.setDescription("Comprehensive behavioral and technical evaluation for microservices engineering");
        c3.setType("MOCK_INTERVIEW");
        c3.setSubject("Web Dev");
        c3.setTopics(List.of("Spring Boot", "Concurrency", "Kafka", "PostgreSQL"));
        c3.setTags(List.of("Backend", "Spring", "Microservices"));
        c3.setDifficulty("Hard");
        c3.setStatus("Draft");
        c3.setCreatedBy("HR Director");
        c3.setCreatedAt("2026-09-25T16:20:00");
        c3.setUpdatedAt("2026-09-28T18:45:00");
        c3.setStudentAttemptsCount(0);
        c3.setQuestionsCount(4);
        c3.setDurationMinutes(40);
        c3.setVisibility("ALL");
        list.add(c3);

        return list;
    }
}
