package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.service.AdminContentService;

@RestController
@RequestMapping({"/api/v1/content", "/api/content", "/content"})
public class StudentContentController {

    private final AdminContentService contentService;

    public StudentContentController(AdminContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("/published")
    public ResponseEntity<List<ContentItem>> getPublishedContent(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String subject
    ) {
        List<ContentItem> items = contentService.getPublishedContentForStudents(type, subject);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/published/{id}")
    public ResponseEntity<ContentItem> getPublishedContentById(@PathVariable String id) {
        ContentItem item = contentService.getPublishedContentItemForStudents(id);
        return ResponseEntity.ok(item);
    }
}
