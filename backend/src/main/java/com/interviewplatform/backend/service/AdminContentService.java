package com.interviewplatform.backend.service;

import java.util.List;
import java.util.Map;

import com.interviewplatform.backend.dto.AiGenerateInterviewRequest;
import com.interviewplatform.backend.dto.AiGenerateQuizRequest;
import com.interviewplatform.backend.dto.ContentBulkActionRequest;
import com.interviewplatform.backend.dto.ContentItemRequest;
import com.interviewplatform.backend.dto.ContentSummaryDto;
import com.interviewplatform.backend.dto.ValidateSolutionRequest;
import com.interviewplatform.backend.model.ContentAuditLog;
import com.interviewplatform.backend.model.ContentItem;

public interface AdminContentService {

    List<ContentItem> getAllContent(String type, String subject, String difficulty, String status, String search, String sortBy, String sortDir);

    ContentSummaryDto getSummary();

    ContentItem getContentById(String id);

    ContentItem createContent(ContentItemRequest request, String performedBy);

    ContentItem updateContent(String id, ContentItemRequest request, String performedBy, boolean forceNewVersion);

    void deleteContent(String id, String performedBy, boolean force);

    ContentItem duplicateContent(String id, String performedBy);

    ContentItem updateStatus(String id, String newStatus, String performedBy);

    ContentItem restoreVersion(String id, int versionNumber, String performedBy);

    Map<String, Object> executeBulkAction(ContentBulkActionRequest request, String performedBy);

    List<ContentAuditLog> getAuditLogs(String contentId, int limit);

    Map<String, Object> generateQuizQuestions(AiGenerateQuizRequest request);

    Map<String, Object> importQuizQuestionsCsv(String csvContent);

    Map<String, Object> generateInterviewQuestions(AiGenerateInterviewRequest request);

    Map<String, Object> validateReferenceSolution(ValidateSolutionRequest request);

    String exportQuizCsv(String id);

    List<ContentItem> getPublishedContentForStudents(String type, String subject);

    ContentItem getPublishedContentItemForStudents(String id);
}
