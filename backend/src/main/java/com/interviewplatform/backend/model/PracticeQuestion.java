package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "practice_questions")
public class PracticeQuestion {

    @Id
    private String id;

    @Indexed
    private String topicId;

    private String title;
    private String difficulty; // "Easy" | "Medium" | "Hard"
    private String prompt;
    private List<String> keyPoints = new ArrayList<>();
    private String sampleAnswer;

    public PracticeQuestion() {}

    public PracticeQuestion(String id, String topicId, String title, String difficulty, String prompt, List<String> keyPoints, String sampleAnswer) {
        this.id = id;
        this.topicId = topicId;
        this.title = title;
        this.difficulty = difficulty;
        this.prompt = prompt;
        this.keyPoints = keyPoints != null ? keyPoints : new ArrayList<>();
        this.sampleAnswer = sampleAnswer;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public List<String> getKeyPoints() { return keyPoints; }
    public void setKeyPoints(List<String> keyPoints) { this.keyPoints = keyPoints; }

    public String getSampleAnswer() { return sampleAnswer; }
    public void setSampleAnswer(String sampleAnswer) { this.sampleAnswer = sampleAnswer; }
}
