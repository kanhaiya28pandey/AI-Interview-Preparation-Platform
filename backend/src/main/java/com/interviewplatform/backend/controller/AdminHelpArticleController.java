package com.interviewplatform.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.HelpArticle;
import com.interviewplatform.backend.service.HelpArticleService;

@RestController
@RequestMapping({"/api/v1/admin/help/articles", "/api/admin/help/articles"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminHelpArticleController {

    private final HelpArticleService helpArticleService;

    public AdminHelpArticleController(HelpArticleService helpArticleService) {
        this.helpArticleService = helpArticleService;
    }

    @PostMapping
    public ResponseEntity<HelpArticle> createArticle(@RequestBody HelpArticle article) {
        return ResponseEntity.ok(helpArticleService.createArticle(article));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HelpArticle> updateArticle(@PathVariable String id, @RequestBody HelpArticle article) {
        return ResponseEntity.ok(helpArticleService.updateArticle(id, article));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteArticle(@PathVariable String id) {
        helpArticleService.deleteArticle(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Help article deleted successfully"));
    }
}
