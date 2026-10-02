package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.ContentItem;

@Repository
public interface ContentItemRepository extends MongoRepository<ContentItem, String> {
    List<ContentItem> findByType(String type);
    List<ContentItem> findByStatus(String status);
    List<ContentItem> findBySubject(String subject);
}
