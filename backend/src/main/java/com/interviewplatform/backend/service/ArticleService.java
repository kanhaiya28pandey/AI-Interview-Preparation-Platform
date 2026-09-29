package com.interviewplatform.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.model.Article;
import com.interviewplatform.backend.repository.ArticleRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    public List<Article> getArticles() {
        return articleRepository.findAllByOrderByPublishedDateDesc();
    }

    public Article getArticleById(String idOrSlug) {
        return articleRepository.findById(idOrSlug)
                .or(() -> articleRepository.findBySlug(idOrSlug))
                .orElseThrow(() -> new IllegalArgumentException("Article not found with identifier: " + idOrSlug));
    }

    public int likeArticle(String id) {
        Article article = articleRepository.findById(id)
                .or(() -> articleRepository.findBySlug(id))
                .orElseThrow(() -> new IllegalArgumentException("Article not found with identifier: " + id));

        article.setLikesCount(article.getLikesCount() + 1);
        articleRepository.save(article);
        return article.getLikesCount();
    }
}
