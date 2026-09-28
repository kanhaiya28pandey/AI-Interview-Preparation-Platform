package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.PracticeQuestion;

@Repository
public interface PracticeQuestionRepository extends MongoRepository<PracticeQuestion, String> {

    List<PracticeQuestion> findByTopicId(String topicId);
}
