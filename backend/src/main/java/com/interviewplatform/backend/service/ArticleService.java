package com.interviewplatform.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.model.Article;
import com.interviewplatform.backend.model.ArticleAuthor;
import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.repository.ArticleRepository;
import com.interviewplatform.backend.repository.ContentItemRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ContentItemRepository contentItemRepository;

    public ArticleService(ArticleRepository articleRepository, ContentItemRepository contentItemRepository) {
        this.articleRepository = articleRepository;
        this.contentItemRepository = contentItemRepository;
    }

    public List<Article> getArticles() {
        List<Article> list = new ArrayList<>(articleRepository.findAllByOrderByPublishedDateDesc());

        // Merge published articles from Content Manager
        List<ContentItem> dynamicItems = contentItemRepository.findAll();
        for (ContentItem item : dynamicItems) {
            if (isArticleType(item.getType()) && isPublished(item.getStatus())) {
                boolean exists = list.stream().anyMatch(a -> a.getId().equals(item.getId()));
                if (!exists) {
                    list.add(0, mapContentItemToArticle(item));
                }
            }
        }
        return list;
    }

    public Article getArticleById(String idOrSlug) {
        return articleRepository.findById(idOrSlug)
                .or(() -> articleRepository.findBySlug(idOrSlug))
                .or(() -> contentItemRepository.findById(idOrSlug).map(this::mapContentItemToArticle))
                .orElseThrow(() -> new IllegalArgumentException("Article not found with identifier: " + idOrSlug));
    }

    public int likeArticle(String id) {
        Article article = articleRepository.findById(id)
                .or(() -> articleRepository.findBySlug(id))
                .orElse(null);

        if (article != null) {
            article.setLikesCount(article.getLikesCount() + 1);
            articleRepository.save(article);
            return article.getLikesCount();
        }

        // If it's a dynamic item, increment student attempts / likes
        ContentItem item = contentItemRepository.findById(id).orElse(null);
        if (item != null) {
            item.setStudentAttemptsCount(item.getStudentAttemptsCount() + 1);
            contentItemRepository.save(item);
            return item.getStudentAttemptsCount();
        }

        throw new IllegalArgumentException("Article not found with identifier: " + id);
    }

    private boolean isArticleType(String type) {
        if (type == null) return false;
        return type.equalsIgnoreCase("ARTICLE") || type.equalsIgnoreCase("Article");
    }

    private boolean isPublished(String status) {
        if (status == null) return false;
        return status.equalsIgnoreCase("Published") || status.equalsIgnoreCase("PUBLISHED");
    }

    private Article mapContentItemToArticle(ContentItem item) {
        Article a = new Article();
        a.setId(item.getId());
        a.setTitle(item.getTitle());
        a.setSlug(item.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        a.setSummary(item.getDescription());
        String md = "";
        if (item.getContentData() != null && item.getContentData().containsKey("markdown")) {
            md = String.valueOf(item.getContentData().get("markdown"));
        } else if (item.getPayload() != null && item.getPayload().containsKey("articleMarkdown")) {
            md = String.valueOf(item.getPayload().get("articleMarkdown"));
        } else {
            md = "# " + item.getTitle() + "\n\n" + item.getDescription();
        }
        a.setContent(md);
        a.setCategory(item.getSubject() != null ? item.getSubject() : "Career & Technical");
        a.setAuthor(new ArticleAuthor(
                item.getCreatedBy() != null ? item.getCreatedBy() : "Platform Editorial",
                "Senior Staff Engineer",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        ));
        a.setReadTimeMinutes(item.getDurationMinutes() > 0 ? item.getDurationMinutes() : 8);
        a.setPublishedDate(item.getCreatedAt() != null ? item.getCreatedAt().substring(0, Math.min(10, item.getCreatedAt().length())) : "2026-09-20");
        a.setTags(item.getTags() != null ? item.getTags() : List.of("Technical", "Architecture"));
        a.setViewsCount(item.getStudentAttemptsCount() > 0 ? item.getStudentAttemptsCount() : 120);
        a.setLikesCount(35);
        a.setFeatured(true);
        return a;
    }
}
