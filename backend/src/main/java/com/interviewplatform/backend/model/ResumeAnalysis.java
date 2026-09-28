package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resume_analyses")
public class ResumeAnalysis {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String email;

    private String role;
    private String field;
    private String fileName;
    private String analyzedAt;
    private int atsScore;
    private String verdict;
    private SubScores subScores = new SubScores();
    private List<String> matchedSkills = new ArrayList<>();
    private List<MissingSkillDetail> missingSkills = new ArrayList<>();
    private List<SuggestionDetail> suggestions = new ArrayList<>();
    private List<KeywordDetail> keywords = new ArrayList<>();
    private List<FormattingItem> formattingChecklist = new ArrayList<>();
    private List<SectionAnalysis> sections = new ArrayList<>();
    private List<RoleFitItem> roleFitComparison = new ArrayList<>();
    private List<AnalysisHistoryItem> history = new ArrayList<>();

    public ResumeAnalysis() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(String analyzedAt) { this.analyzedAt = analyzedAt; }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public SubScores getSubScores() { return subScores; }
    public void setSubScores(SubScores subScores) { this.subScores = subScores; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<MissingSkillDetail> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<MissingSkillDetail> missingSkills) { this.missingSkills = missingSkills; }

    public List<SuggestionDetail> getSuggestions() { return suggestions; }
    public void setSuggestions(List<SuggestionDetail> suggestions) { this.suggestions = suggestions; }

    public List<KeywordDetail> getKeywords() { return keywords; }
    public void setKeywords(List<KeywordDetail> keywords) { this.keywords = keywords; }

    public List<FormattingItem> getFormattingChecklist() { return formattingChecklist; }
    public void setFormattingChecklist(List<FormattingItem> formattingChecklist) { this.formattingChecklist = formattingChecklist; }

    public List<SectionAnalysis> getSections() { return sections; }
    public void setSections(List<SectionAnalysis> sections) { this.sections = sections; }

    public List<RoleFitItem> getRoleFitComparison() { return roleFitComparison; }
    public void setRoleFitComparison(List<RoleFitItem> roleFitComparison) { this.roleFitComparison = roleFitComparison; }

    public List<AnalysisHistoryItem> getHistory() { return history; }
    public void setHistory(List<AnalysisHistoryItem> history) { this.history = history; }
}
