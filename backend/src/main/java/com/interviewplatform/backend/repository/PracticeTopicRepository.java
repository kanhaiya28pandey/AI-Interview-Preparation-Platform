package com.interviewplatform.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.PracticeTopic;

@Repository
public interface PracticeTopicRepository extends MongoRepository<PracticeTopic, String> {
}
