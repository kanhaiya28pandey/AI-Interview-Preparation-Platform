package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.QuizQuestion;

@Repository
public interface QuizQuestionRepository extends MongoRepository<QuizQuestion, String> {

    List<QuizQuestion> findByTopicId(String topicId);
}
