package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.InterviewSession;

@Repository
public interface InterviewSessionRepository extends MongoRepository<InterviewSession, String> {

    List<InterviewSession> findByUserId(String userId);

    List<InterviewSession> findByUserIdOrderByStartedAtDesc(String userId);

    List<InterviewSession> findByEmailOrderByStartedAtDesc(String email);

    long countByStatus(String status);
}
