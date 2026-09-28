package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.InterviewQuestion;

@Repository
public interface InterviewQuestionRepository extends MongoRepository<InterviewQuestion, String> {

    List<InterviewQuestion> findByRoleIdOrderByQuestionNumberAsc(String roleId);

    long countByRoleId(String roleId);
}
