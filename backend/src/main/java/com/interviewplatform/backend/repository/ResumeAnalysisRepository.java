package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.ResumeAnalysis;

@Repository
public interface ResumeAnalysisRepository extends MongoRepository<ResumeAnalysis, String> {

    List<ResumeAnalysis> findByUserIdOrderByAnalyzedAtDesc(String userId);

    List<ResumeAnalysis> findByEmailOrderByAnalyzedAtDesc(String email);

    List<ResumeAnalysis> findAllByOrderByAnalyzedAtDesc();

    long countByRole(String role);
}
