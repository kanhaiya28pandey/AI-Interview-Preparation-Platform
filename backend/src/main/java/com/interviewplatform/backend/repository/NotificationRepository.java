package com.interviewplatform.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.interviewplatform.backend.model.Notification;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByAudienceInOrderByCreatedAtDesc(List<String> audiences);

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdOrAudienceInOrderByCreatedAtDesc(String userId, List<String> audiences);
}
