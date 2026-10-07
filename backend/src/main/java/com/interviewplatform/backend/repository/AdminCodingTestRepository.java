package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.AdminCodingTest;

@Repository
public interface AdminCodingTestRepository extends MongoRepository<AdminCodingTest, String> {
    List<AdminCodingTest> findByStatus(String status);
    List<AdminCodingTest> findByDomain(String domain);
}
