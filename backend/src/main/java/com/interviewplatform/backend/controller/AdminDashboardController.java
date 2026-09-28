package com.interviewplatform.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.AdminReportDto;
import com.interviewplatform.backend.dto.AdminUserDto;
import com.interviewplatform.backend.service.AdminDashboardService;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getUsers() {
        return ResponseEntity.ok(adminDashboardService.getUsers());
    }

    @PatchMapping("/users/{userId}/toggle-block")
    public ResponseEntity<AdminUserDto> toggleBlockUser(@PathVariable String userId) {
        return ResponseEntity.ok(adminDashboardService.toggleBlockUser(userId));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        boolean deleted = adminDashboardService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("success", deleted, "message", deleted ? "User deleted" : "User not found"));
    }

    @GetMapping("/reports")
    public ResponseEntity<AdminReportDto> getReports() {
        return ResponseEntity.ok(adminDashboardService.getReports());
    }
}
