package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.CodingSubmission;

@Repository
public interface CodingSubmissionRepository extends MongoRepository<CodingSubmission, String> {

    List<CodingSubmission> findByUserIdOrderBySubmittedAtDesc(String userId);

    List<CodingSubmission> findByProblemIdOrderBySubmittedAtDesc(String problemId);

    long countByUserIdAndStatus(String userId, String status);
}
