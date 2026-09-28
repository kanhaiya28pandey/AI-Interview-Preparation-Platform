package com.interviewplatform.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.QuizTopic;

@Repository
public interface QuizTopicRepository extends MongoRepository<QuizTopic, String> {
}
