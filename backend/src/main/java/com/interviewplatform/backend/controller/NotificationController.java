package com.interviewplatform.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.interviewplatform.backend.model.Notification;
import com.interviewplatform.backend.service.NotificationService;

@RestController
@RequestMapping({"/api/v1/notifications", "/api/notifications"})
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private boolean checkIsAdmin(Authentication authentication, String roleParam) {
        if ("ADMIN".equalsIgnoreCase(roleParam)) return true;
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }

    private String resolveUserId(Authentication authentication, String userIdParam) {
        if (userIdParam != null && !userIdParam.isBlank()) return userIdParam;
        if (authentication != null) return authentication.getName();
        return "guest_user";
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            Authentication authentication,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role
    ) {
        String uid = resolveUserId(authentication, userId);
        boolean isAdmin = checkIsAdmin(authentication, role);
        List<Notification> list = notificationService.getNotificationsForUser(uid, isAdmin);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByPath(
            Authentication authentication,
            @PathVariable String userId,
            @RequestParam(required = false) String role
    ) {
        boolean isAdmin = checkIsAdmin(authentication, role);
        List<Notification> list = notificationService.getNotificationsForUser(userId, isAdmin);
        return ResponseEntity.ok(list);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            Authentication authentication,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role
    ) {
        String uid = resolveUserId(authentication, userId);
        boolean isAdmin = checkIsAdmin(authentication, role);
        return notificationService.subscribe(uid, isAdmin);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, Object> body) {
        String userId = (String) body.getOrDefault("userId", "student_broadcast");
        String audience = (String) body.get("audience");

        if ("admin_inbox".equalsIgnoreCase(userId)) {
            audience = "ADMIN";
        } else if ("student_broadcast".equalsIgnoreCase(userId)) {
            audience = "STUDENT_BROADCAST";
        } else if (audience == null || audience.isBlank() || "STUDENT".equalsIgnoreCase(audience)) {
            audience = "USER";
        }

        String type = (String) body.getOrDefault("type", "system");
        String title = (String) body.getOrDefault("title", "New Notification");
        String message = (String) body.getOrDefault("message", "");
        String link = (String) body.getOrDefault("link", null);
        String priority = (String) body.getOrDefault("priority", "info");

        Notification notif = notificationService.createNotification(userId, audience, type, title, message, link, priority);
        return ResponseEntity.ok(notif);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(@PathVariable String id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllRead(
            Authentication authentication,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role
    ) {
        String uid = resolveUserId(authentication, userId);
        boolean isAdmin = checkIsAdmin(authentication, role);
        notificationService.markAllAsRead(uid, isAdmin);
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable String id) {
        boolean deleted = notificationService.deleteNotification(id);
        return ResponseEntity.ok(Map.of("success", deleted));
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAll(
            Authentication authentication,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role
    ) {
        String uid = resolveUserId(authentication, userId);
        boolean isAdmin = checkIsAdmin(authentication, role);
        notificationService.clearAll(uid, isAdmin);
        return ResponseEntity.ok(Map.of("success", true, "message", "Notifications cleared"));
    }
}
