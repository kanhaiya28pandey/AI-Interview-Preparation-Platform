package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.CodingProblem;
import com.interviewplatform.backend.service.CodingJudgeService;

@RestController
@RequestMapping({"/api/v1/admin/coding-tests", "/api/admin/coding-tests"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminCodingController {

    private final CodingJudgeService judgeService;

    public AdminCodingController(CodingJudgeService judgeService) {
        this.judgeService = judgeService;
    }

    @GetMapping
    public ResponseEntity<List<CodingProblem>> getAllCodingTests() {
        List<CodingProblem> problems = judgeService.getAllProblems();
        return ResponseEntity.ok(problems);
    }

    @PostMapping
    public ResponseEntity<CodingProblem> saveCodingTest(@RequestBody CodingProblem problem) {
        CodingProblem saved = judgeService.saveProblem(problem);
        return ResponseEntity.ok(saved);
    }
}
