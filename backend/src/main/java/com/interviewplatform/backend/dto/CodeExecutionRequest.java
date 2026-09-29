package com.interviewplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CodeExecutionRequest {

    @NotBlank(message = "Problem ID is required")
    private String problemId;

    @NotBlank(message = "Programming language is required")
    private String language; // "javascript", "python", "java", "cpp"

    @NotBlank(message = "Code solution is required")
    private String code;

    public CodeExecutionRequest() {}

    public CodeExecutionRequest(String problemId, String language, String code) {
        this.problemId = problemId;
        this.language = language;
        this.code = code;
    }

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
