package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.repository.ContentItemRepository;

@RestController
@RequestMapping({"/content", "/api/v1/content", "/api/content"})
public class PublicContentController {

    private final ContentItemRepository contentItemRepository;

    public PublicContentController(ContentItemRepository contentItemRepository) {
        this.contentItemRepository = contentItemRepository;
    }

    @GetMapping("/published")
    public ResponseEntity<List<ContentItem>> getPublishedContent(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String subject
    ) {
        List<ContentItem> items = contentItemRepository.findAll();

        List<ContentItem> published = items.stream()
                .filter(i -> "Published".equalsIgnoreCase(i.getStatus()) || "PUBLISHED".equalsIgnoreCase(i.getStatus()))
                .filter(i -> {
                    if (type != null && !type.equalsIgnoreCase("All") && !type.equalsIgnoreCase("ALL")) {
                        if (i.getType() == null || !i.getType().equalsIgnoreCase(type)) return false;
                    }
                    if (subject != null && !subject.equalsIgnoreCase("All") && !subject.equalsIgnoreCase("ALL")) {
                        if (i.getSubject() == null || !i.getSubject().equalsIgnoreCase(subject)) return false;
                    }
                    return true;
                })
                .toList();

        return ResponseEntity.ok(published);
    }
}
