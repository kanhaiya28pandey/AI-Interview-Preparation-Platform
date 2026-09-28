package com.interviewplatform.backend.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.Article;
import com.interviewplatform.backend.service.ArticleService;

@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public ResponseEntity<List<Article>> getArticles() {
        List<Article> articles = articleService.getArticles();
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable String id) {
        Article article = articleService.getArticleById(id);
        return ResponseEntity.ok(article);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Integer>> likeArticle(@PathVariable String id) {
        int likes = articleService.likeArticle(id);
        return ResponseEntity.ok(Collections.singletonMap("likesCount", likes));
    }
}
