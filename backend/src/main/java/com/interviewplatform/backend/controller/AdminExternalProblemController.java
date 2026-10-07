package com.interviewplatform.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.ExternalProblemImportRequest;
import com.interviewplatform.backend.dto.ExternalProblemSummary;
import com.interviewplatform.backend.model.CodingProblem;
import com.interviewplatform.backend.service.ExternalProblemFetchService;

@RestController
@RequestMapping({"/api/v1/admin/coding-import", "/api/admin/coding-import"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminExternalProblemController {

    private final ExternalProblemFetchService fetchService;

    public AdminExternalProblemController(ExternalProblemFetchService fetchService) {
        this.fetchService = fetchService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<ExternalProblemSummary>> searchExternalProblems(
            @RequestParam(required = false, defaultValue = "ALL") String source,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false, defaultValue = "20") int limit
    ) {
        List<ExternalProblemSummary> results = fetchService.searchProblems(source, query, domain, difficulty, limit);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/import")
    public ResponseEntity<CodingProblem> importExternalProblem(@RequestBody ExternalProblemImportRequest request) {
        CodingProblem imported = fetchService.importProblem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(imported);
    }

    @GetMapping("/bank")
    public ResponseEntity<List<CodingProblem>> getPlatformProblems() {
        List<CodingProblem> list = fetchService.getPlatformProblems();
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{problemId}")
    public ResponseEntity<Map<String, Object>> deleteProblem(@PathVariable String problemId) {
        fetchService.deleteProblem(problemId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "problemId", problemId,
                "message", "Question removed from student arena and question bank successfully"
        ));
    }
}
