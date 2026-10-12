package com.interviewplatform.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.CohortAnalyticsDto;
import com.interviewplatform.backend.dto.StudentProgressDto;
import com.interviewplatform.backend.model.TeacherNote;
import com.interviewplatform.backend.service.AdminDashboardService;
import com.interviewplatform.backend.service.StudentProgressService;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentProgressController {

    private final StudentProgressService studentProgressService;
    private final AdminDashboardService adminDashboardService;

    public AdminStudentProgressController(StudentProgressService studentProgressService,
                                         AdminDashboardService adminDashboardService) {
        this.studentProgressService = studentProgressService;
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentProgressDto>> getStudents() {
        return ResponseEntity.ok(studentProgressService.getStudents());
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentProgressDto> getStudentById(@PathVariable String id) {
        return ResponseEntity.ok(studentProgressService.getStudentById(id));
    }

    @PostMapping("/students/{id}/teacher-notes")
    public ResponseEntity<TeacherNote> addTeacherNote(@PathVariable String id,
                                                      @RequestBody Map<String, String> body,
                                                      Authentication authentication) {
        String noteText = body.getOrDefault("noteText", "");
        String authorName = body.getOrDefault("authorName", authentication != null ? authentication.getName() : "Admin Teacher");
        return ResponseEntity.ok(studentProgressService.addTeacherNote(id, noteText, authorName));
    }

    @GetMapping("/cohort-analytics")
    public ResponseEntity<CohortAnalyticsDto> getCohortAnalytics() {
        return ResponseEntity.ok(studentProgressService.getCohortAnalytics());
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Map<String, Object>> deleteStudent(@PathVariable String id) {
        boolean deleted = adminDashboardService.deleteUser(id);
        return ResponseEntity.ok(Map.of(
            "success", deleted,
            "message", deleted ? "Student account permanently deleted" : "Student not found",
            "id", id
        ));
    }
}
