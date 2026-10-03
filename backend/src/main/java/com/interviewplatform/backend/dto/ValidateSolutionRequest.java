package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;

public class ValidateSolutionRequest {

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Reference solution code is required")
    private String sourceCode;

    private List<Map<String, Object>> testCases = new ArrayList<>();

    public ValidateSolutionRequest() {}

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public List<Map<String, Object>> getTestCases() { return testCases; }
    public void setTestCases(List<Map<String, Object>> testCases) { this.testCases = testCases != null ? testCases : new ArrayList<>(); }
}
