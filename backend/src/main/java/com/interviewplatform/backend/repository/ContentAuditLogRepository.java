package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.ContentAuditLog;

@Repository
public interface ContentAuditLogRepository extends MongoRepository<ContentAuditLog, String> {

    List<ContentAuditLog> findAllByOrderByTimestampDesc();

    List<ContentAuditLog> findTop50ByOrderByTimestampDesc();

    List<ContentAuditLog> findByContentIdOrderByTimestampDesc(String contentId);
}
