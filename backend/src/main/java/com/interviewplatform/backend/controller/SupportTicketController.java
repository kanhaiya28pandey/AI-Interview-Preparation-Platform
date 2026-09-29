package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.CreateTicketRequest;
import com.interviewplatform.backend.model.SupportTicket;
import com.interviewplatform.backend.service.SupportTicketService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/support/tickets")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getTickets(Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : null;
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(supportTicketService.getTicketsForUser(userId, isAdmin));
    }

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@Valid @RequestBody CreateTicketRequest request,
                                                      Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(supportTicketService.createTicket(userId, request));
    }
}
