package com.interviewplatform.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.Article;

@Repository
public interface ArticleRepository extends MongoRepository<Article, String> {

    Optional<Article> findBySlug(String slug);

    List<Article> findByCategory(String category);

    List<Article> findAllByOrderByPublishedDateDesc();
}
