package com.interviewplatform.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.HelpArticle;
import com.interviewplatform.backend.service.HelpArticleService;

@RestController
@RequestMapping({"/api/v1/help/articles", "/api/help/articles"})
public class HelpArticleController {

    private final HelpArticleService helpArticleService;

    public HelpArticleController(HelpArticleService helpArticleService) {
        this.helpArticleService = helpArticleService;
    }

    @GetMapping
    public ResponseEntity<List<HelpArticle>> getArticles(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(helpArticleService.getArticlesByCategory(category));
        }
        return ResponseEntity.ok(helpArticleService.getAllArticles());
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<HelpArticle> voteArticle(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        boolean isHelpful = body != null && Boolean.TRUE.equals(body.get("isHelpful"));
        return ResponseEntity.ok(helpArticleService.voteArticle(id, isHelpful));
    }
}
