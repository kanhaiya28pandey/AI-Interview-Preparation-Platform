package com.interviewplatform.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.Verification;

@Repository
public interface VerificationRepository extends MongoRepository<Verification, String> {

    Optional<Verification> findByVerificationId(String verificationId);

    Optional<Verification> findTopByUserIdOrderBySubmittedAtDesc(String userId);

    Optional<Verification> findTopByEmailOrderBySubmittedAtDesc(String email);

    List<Verification> findByUserId(String userId);

    List<Verification> findAllByOrderBySubmittedAtDesc();

    List<Verification> findByStatusOrderBySubmittedAtDesc(String status);
}
