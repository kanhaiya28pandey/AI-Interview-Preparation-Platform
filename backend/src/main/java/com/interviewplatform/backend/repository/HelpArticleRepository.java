package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.HelpArticle;

@Repository
public interface HelpArticleRepository extends MongoRepository<HelpArticle, String> {
    List<HelpArticle> findByCategoryIgnoreCase(String category);
    List<HelpArticle> findAllByOrderByCreatedAtDesc();
}
