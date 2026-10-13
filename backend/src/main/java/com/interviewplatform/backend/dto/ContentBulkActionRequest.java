package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public class ContentBulkActionRequest {

    @NotEmpty(message = "Item IDs cannot be empty")
    private List<String> ids = new ArrayList<>();

    @NotBlank(message = "Action is required (PUBLISH, UNPUBLISH, ARCHIVE, DELETE)")
    private String action;

    public ContentBulkActionRequest() {}

    public List<String> getIds() { return ids; }
    public void setIds(List<String> ids) { this.ids = ids != null ? ids : new ArrayList<>(); }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
