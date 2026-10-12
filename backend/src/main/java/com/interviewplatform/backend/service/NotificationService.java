package com.interviewplatform.backend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.interviewplatform.backend.model.Notification;
import com.interviewplatform.backend.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private static class ClientSubscription {
        final String userId;
        final boolean isAdmin;
        final SseEmitter emitter;

        ClientSubscription(String userId, boolean isAdmin, SseEmitter emitter) {
            this.userId = userId;
            this.isAdmin = isAdmin;
            this.emitter = emitter;
        }
    }

    private final List<ClientSubscription> activeSubscriptions = new CopyOnWriteArrayList<>();

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public SseEmitter subscribe(String userId, boolean isAdmin) {
        // 10 minutes timeout for SSE stream
        SseEmitter emitter = new SseEmitter(600_000L);
        ClientSubscription sub = new ClientSubscription(userId, isAdmin, emitter);
        activeSubscriptions.add(sub);

        emitter.onCompletion(() -> activeSubscriptions.remove(sub));
        emitter.onTimeout(() -> {
            emitter.complete();
            activeSubscriptions.remove(sub);
        });
        emitter.onError(e -> {
            emitter.complete();
            activeSubscriptions.remove(sub);
        });

        // Send an initial heartbeat/connection event
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Connected to Real-time Notification Stream"));
        } catch (IOException e) {
            activeSubscriptions.remove(sub);
        }

        return emitter;
    }

    public Notification createNotification(String userId, String audience, String type, String title, String message, String link, String priority) {
        String id = "notif_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 5);
        Notification notif = new Notification(id, userId, audience, type, title, message, link, priority);
        Notification saved = notificationRepository.save(notif);

        // Broadcast in real-time over SSE
        broadcast(saved);
        return saved;
    }

    public Notification notifyStudents(String type, String title, String message, String link, String priority) {
        return createNotification("student_broadcast", "STUDENT_BROADCAST", type, title, message, link, priority);
    }

    public Notification notifyAdmins(String type, String title, String message, String link, String priority) {
        return createNotification("admin_inbox", "ADMIN", type, title, message, link, priority);
    }

    public Notification notifyUser(String userId, String type, String title, String message, String link, String priority) {
        return createNotification(userId, "USER", type, title, message, link, priority);
    }

    private void broadcast(Notification notif) {
        List<ClientSubscription> deadSubs = new ArrayList<>();
        String notifAudience = notif.getAudience() != null ? notif.getAudience().trim() : "USER";
        String notifUserId = notif.getUserId() != null ? notif.getUserId().trim() : "";

        for (ClientSubscription sub : activeSubscriptions) {
            boolean shouldReceive = false;
            String subUserId = sub.userId != null ? sub.userId.trim() : "";

            if ("ALL".equalsIgnoreCase(notifAudience)) {
                shouldReceive = true;
            } else if ("ADMIN".equalsIgnoreCase(notifAudience) || "admin_inbox".equalsIgnoreCase(notifUserId)) {
                // Admin notifications: only delivered to admins
                if (sub.isAdmin) {
                    shouldReceive = true;
                }
            } else if ("STUDENT_BROADCAST".equalsIgnoreCase(notifAudience) 
                    || "student_broadcast".equalsIgnoreCase(notifUserId) 
                    || ("STUDENT".equalsIgnoreCase(notifAudience) && "student_broadcast".equalsIgnoreCase(notifUserId))) {
                // Student broadcasts: delivered to non-admin students
                if (!sub.isAdmin) {
                    shouldReceive = true;
                }
            } else {
                // Individual user-targeted notification: ONLY if subscriber's userId matches notif's userId!
                if (!subUserId.isEmpty() && !notifUserId.isEmpty() && subUserId.equalsIgnoreCase(notifUserId)) {
                    shouldReceive = true;
                }
            }

            if (shouldReceive) {
                try {
                    sub.emitter.send(SseEmitter.event()
                            .name("NOTIFICATION")
                            .data(notif));
                } catch (Exception e) {
                    deadSubs.add(sub);
                }
            }
        }

        activeSubscriptions.removeAll(deadSubs);
    }

    public List<Notification> getNotificationsForUser(String userId, boolean isAdmin) {
        List<Notification> all = notificationRepository.findAllByOrderByCreatedAtDesc();
        List<Notification> result = new ArrayList<>();
        String normalizedUid = userId != null ? userId.trim() : "";

        for (Notification n : all) {
            String notifUserId = n.getUserId() != null ? n.getUserId().trim() : "";
            String aud = n.getAudience() != null ? n.getAudience().trim() : "USER";

            if ("ALL".equalsIgnoreCase(aud)) {
                result.add(n);
            } else if (isAdmin) {
                // Admin sees:
                // 1. All admin operations / alerts ("ADMIN", "admin_inbox")
                // 2. Notifications targeted directly to this admin's personal userId
                if ("ADMIN".equalsIgnoreCase(aud) 
                        || "admin_inbox".equalsIgnoreCase(notifUserId)
                        || (!normalizedUid.isEmpty() && normalizedUid.equalsIgnoreCase(notifUserId))) {
                    result.add(n);
                }
            } else {
                // Student sees:
                // 1. Broadcasts intended for all students ("STUDENT_BROADCAST" or "student_broadcast")
                // 2. Personal notifications where notifUserId strictly equals this student's userId
                // They MUST NEVER see notifications belonging to other students!
                if ("STUDENT_BROADCAST".equalsIgnoreCase(aud) 
                        || "student_broadcast".equalsIgnoreCase(notifUserId)
                        || ("STUDENT".equalsIgnoreCase(aud) && "student_broadcast".equalsIgnoreCase(notifUserId))) {
                    result.add(n);
                } else if (!normalizedUid.isEmpty() && normalizedUid.equalsIgnoreCase(notifUserId)) {
                    result.add(n);
                }
            }
        }

        return result;
    }

    public Notification markAsRead(String id) {
        return notificationRepository.findById(id).map(n -> {
            n.setRead(true);
            return notificationRepository.save(n);
        }).orElse(null);
    }

    public void markAllAsRead(String userId, boolean isAdmin) {
        List<Notification> list = getNotificationsForUser(userId, isAdmin);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }

    public boolean deleteNotification(String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public void clearAll(String userId, boolean isAdmin) {
        List<Notification> list = getNotificationsForUser(userId, isAdmin);
        notificationRepository.deleteAll(list);
    }
}
