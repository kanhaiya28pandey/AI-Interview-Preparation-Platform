package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "interview_questions")
public class InterviewQuestion {

    @Id
    private String id;

    @Indexed
    private String roleId;

    private int questionNumber;
    private String question;
    private String category;
    private List<String> idealKeyPoints = new ArrayList<>();
    private String followUpPrompt;

    public InterviewQuestion() {}

    public InterviewQuestion(String id, String roleId, int questionNumber, String question, String category, List<String> idealKeyPoints, String followUpPrompt) {
        this.id = id;
        this.roleId = roleId;
        this.questionNumber = questionNumber;
        this.question = question;
        this.category = category;
        this.idealKeyPoints = idealKeyPoints != null ? idealKeyPoints : new ArrayList<>();
        this.followUpPrompt = followUpPrompt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }

    public int getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getIdealKeyPoints() { return idealKeyPoints; }
    public void setIdealKeyPoints(List<String> idealKeyPoints) { this.idealKeyPoints = idealKeyPoints; }

    public String getFollowUpPrompt() { return followUpPrompt; }
    public void setFollowUpPrompt(String followUpPrompt) { this.followUpPrompt = followUpPrompt; }
}
