package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.CodeExecutionRequest;
import com.interviewplatform.backend.model.CodingProblem;
import com.interviewplatform.backend.model.ExecutionResult;
import com.interviewplatform.backend.service.CodingJudgeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/coding")
public class CodingController {

    private final CodingJudgeService judgeService;

    public CodingController(CodingJudgeService judgeService) {
        this.judgeService = judgeService;
    }

    @GetMapping("/problems")
    public ResponseEntity<List<CodingProblem>> getProblems() {
        List<CodingProblem> problems = judgeService.getAllProblems();
        return ResponseEntity.ok(problems);
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<CodingProblem> getProblemById(@PathVariable String id) {
        CodingProblem problem = judgeService.getProblemById(id);
        return ResponseEntity.ok(problem);
    }

    @PostMapping("/run")
    public ResponseEntity<ExecutionResult> runCode(
            Authentication authentication,
            @Valid @RequestBody CodeExecutionRequest request
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        ExecutionResult result = judgeService.executeCode(authEmail, request, false);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/submit")
    public ResponseEntity<ExecutionResult> submitCode(
            Authentication authentication,
            @Valid @RequestBody CodeExecutionRequest request
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        ExecutionResult result = judgeService.executeCode(authEmail, request, true);
        return ResponseEntity.ok(result);
    }
}
