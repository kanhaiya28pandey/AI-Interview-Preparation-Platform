package com.interviewplatform.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.dto.CreateTicketRequest;
import com.interviewplatform.backend.model.SupportTicket;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.repository.SupportTicketRepository;
import com.interviewplatform.backend.repository.UserRepository;

@Service
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    public SupportTicketService(SupportTicketRepository supportTicketRepository, UserRepository userRepository) {
        this.supportTicketRepository = supportTicketRepository;
        this.userRepository = userRepository;
    }

    public List<SupportTicket> getTicketsForUser(String userId, boolean isAdmin) {
        if (isAdmin) {
            return supportTicketRepository.findAllByOrderByCreatedAtDesc();
        }
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public SupportTicket createTicket(String userId, CreateTicketRequest req) {
        String userName = "Student User";
        String userEmail = "student@srmist.edu.in";

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                userName = user.getName() != null ? user.getName() : userName;
                userEmail = user.getEmail() != null ? user.getEmail() : userEmail;
            }
        }

        int ticketNumber = ThreadLocalRandom.current().nextInt(1000, 10000);
        String ticketId = "TCK-2026-" + ticketNumber;

        SupportTicket ticket = new SupportTicket();
        ticket.setId(ticketId);
        ticket.setUserId(userId);
        ticket.setCategory(req.getCategory());
        ticket.setSubject(req.getSubject());
        ticket.setDescription(req.getDescription());
        ticket.setAttachmentName(req.getAttachmentName());
        ticket.setAttachmentDataUrl(req.getAttachmentDataUrl());
        ticket.setStatus("Open");
        ticket.setCreatedAt(Instant.now().toString());
        ticket.setUserName(userName);
        ticket.setUserEmail(userEmail);

        return supportTicketRepository.save(ticket);
    }

    public SupportTicket updateTicketStatus(String ticketId, String status) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with id: " + ticketId));
        ticket.setStatus(status);
        return supportTicketRepository.save(ticket);
    }
}
