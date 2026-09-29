package com.interviewplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class StartInterviewRequest {

    @NotBlank(message = "Role ID is required")
    private String roleId;

    public StartInterviewRequest() {}

    public StartInterviewRequest(String roleId) {
        this.roleId = roleId;
    }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }
}
