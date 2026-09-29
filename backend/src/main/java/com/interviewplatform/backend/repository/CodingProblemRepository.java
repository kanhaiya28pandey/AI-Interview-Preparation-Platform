package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.CodingProblem;

@Repository
public interface CodingProblemRepository extends MongoRepository<CodingProblem, String> {

    List<CodingProblem> findByStatus(String status);

    List<CodingProblem> findByDifficulty(String difficulty);
}
