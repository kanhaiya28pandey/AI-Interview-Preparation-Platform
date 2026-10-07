package com.interviewplatform.backend.model;

public class TopicConfig {
    private String name;
    private int questionCount;
    private int weightage;

    public TopicConfig() {}

    public TopicConfig(String name, int questionCount, int weightage) {
        this.name = name;
        this.questionCount = questionCount;
        this.weightage = weightage;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }

    public int getWeightage() { return weightage; }
    public void setWeightage(int weightage) { this.weightage = weightage; }
}
