package com.interviewplatform.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.SupportTicket;
import com.interviewplatform.backend.service.SupportTicketService;

@RestController
@RequestMapping("/api/v1/admin/support/tickets")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupportTicketController {

    private final SupportTicketService supportTicketService;
    private final com.interviewplatform.backend.service.NotificationService notificationService;

    public AdminSupportTicketController(SupportTicketService supportTicketService, com.interviewplatform.backend.service.NotificationService notificationService) {
        this.supportTicketService = supportTicketService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportTicketService.getTicketsForUser(null, true));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SupportTicket> updateStatus(@PathVariable String id,
                                                      @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "Open");
        String resolutionNotes = body.get("resolutionNotes");
        String adminReply = body.get("adminReply");
        String priority = body.get("priority");
        String resolvedBy = body.getOrDefault("resolvedBy", "Admin Team");

        SupportTicket updated = supportTicketService.updateTicketDetails(id, status, resolutionNotes, adminReply, resolvedBy, priority);
        if (updated != null && updated.getUserId() != null) {
            try {
                String message = "Your support query is now marked as '" + status + "'.";
                if (adminReply != null && !adminReply.isBlank()) {
                    message = "Admin Reply: " + adminReply;
                } else if (resolutionNotes != null && !resolutionNotes.isBlank()) {
                    message = "Resolution Note: " + resolutionNotes;
                }
                notificationService.notifyUser(
                        updated.getUserId(),
                        "support",
                        "Support Ticket " + status + ": " + updated.getSubject(),
                        message,
                        "/help",
                        "Resolved".equalsIgnoreCase(status) ? "success" : "info"
                );
            } catch (Exception ignored) {
            }
        }
        return ResponseEntity.ok(updated);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTicket(@PathVariable String id) {
        supportTicketService.deleteTicket(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket deleted successfully"));
    }
}
