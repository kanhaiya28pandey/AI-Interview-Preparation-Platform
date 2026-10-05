package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "content_items")
public class ContentItem {

    @Id
    private String id;
    private String title;
    private String description;
    private String type; // MCQ Quiz, Mock Test, Coding Test, Mock Interview, Practice Track, Article, QUIZ, MOCK_TEST, etc.
    private String subject;
    private List<String> topics = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private String difficulty; // Easy, Medium, Hard, Mixed
    private Map<String, Integer> difficultySplit = new HashMap<>();
    private String status = "Draft"; // Draft, Published, Archived, DRAFT, PUBLISHED, ARCHIVED
    private String createdBy;
    private String createdAt;
    private String updatedAt;
    private int studentAttemptsCount = 0;
    private int studentAttempts = 0;
    private int questionsCount = 0;
    private int durationMinutes = 30;
    private int passMarkPercent = 60;
    private boolean negativeMarking = false;
    private boolean shuffleOptions = true;
    private boolean showAnswers = true;
    private String scheduleStart;
    private String scheduleEnd;
    private String visibility = "ALL";
    private int version = 1;
    private List<Map<String, Object>> versions = new ArrayList<>();
    private Map<String, Object> settings = new HashMap<>();
    private Map<String, Object> contentData = new HashMap<>();
    private Map<String, Object> payload = new HashMap<>();

    public ContentItem() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public List<String> getTopics() {
        return topics;
    }

    public void setTopics(List<String> topics) {
        this.topics = topics != null ? topics : new ArrayList<>();
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Map<String, Integer> getDifficultySplit() {
        return difficultySplit;
    }

    public void setDifficultySplit(Map<String, Integer> difficultySplit) {
        this.difficultySplit = difficultySplit != null ? difficultySplit : new HashMap<>();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getStudentAttemptsCount() {
        return studentAttemptsCount > 0 ? studentAttemptsCount : studentAttempts;
    }

    public void setStudentAttemptsCount(int studentAttemptsCount) {
        this.studentAttemptsCount = studentAttemptsCount;
        this.studentAttempts = studentAttemptsCount;
    }

    public int getStudentAttempts() {
        return studentAttemptsCount > 0 ? studentAttemptsCount : studentAttempts;
    }

    public void setStudentAttempts(int studentAttempts) {
        this.studentAttempts = studentAttempts;
        this.studentAttemptsCount = studentAttempts;
    }

    public int getQuestionsCount() {
        return questionsCount;
    }

    public void setQuestionsCount(int questionsCount) {
        this.questionsCount = questionsCount;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public int getPassMarkPercent() {
        return passMarkPercent;
    }

    public void setPassMarkPercent(int passMarkPercent) {
        this.passMarkPercent = passMarkPercent;
    }

    public boolean isNegativeMarking() {
        return negativeMarking;
    }

    public void setNegativeMarking(boolean negativeMarking) {
        this.negativeMarking = negativeMarking;
    }

    public boolean isShuffleOptions() {
        return shuffleOptions;
    }

    public void setShuffleOptions(boolean shuffleOptions) {
        this.shuffleOptions = shuffleOptions;
    }

    public boolean isShowAnswers() {
        return showAnswers;
    }

    public void setShowAnswers(boolean showAnswers) {
        this.showAnswers = showAnswers;
    }

    public String getScheduleStart() {
        return scheduleStart;
    }

    public void setScheduleStart(String scheduleStart) {
        this.scheduleStart = scheduleStart;
    }

    public String getScheduleEnd() {
        return scheduleEnd;
    }

    public void setScheduleEnd(String scheduleEnd) {
        this.scheduleEnd = scheduleEnd;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public List<Map<String, Object>> getVersions() {
        return versions;
    }

    public void setVersions(List<Map<String, Object>> versions) {
        this.versions = versions != null ? versions : new ArrayList<>();
    }

    public Map<String, Object> getSettings() {
        return settings;
    }

    public void setSettings(Map<String, Object> settings) {
        this.settings = settings != null ? settings : new HashMap<>();
    }

    public Map<String, Object> getContentData() {
        return contentData;
    }

    public void setContentData(Map<String, Object> contentData) {
        this.contentData = contentData != null ? contentData : new HashMap<>();
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload != null ? payload : new HashMap<>();
    }
}
