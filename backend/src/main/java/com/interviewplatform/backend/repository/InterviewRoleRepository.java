package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.InterviewRole;

@Repository
public interface InterviewRoleRepository extends MongoRepository<InterviewRole, String> {

    List<InterviewRole> findByStatus(String status);
}
