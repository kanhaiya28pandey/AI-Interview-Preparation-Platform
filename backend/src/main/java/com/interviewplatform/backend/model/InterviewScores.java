package com.interviewplatform.backend.model;

public class InterviewScores {
    private int technicalAccuracy;
    private int communicationClarity;
    private int problemSolving;
    private int confidence;

    public InterviewScores() {}

    public InterviewScores(int technicalAccuracy, int communicationClarity, int problemSolving, int confidence) {
        this.technicalAccuracy = technicalAccuracy;
        this.communicationClarity = communicationClarity;
        this.problemSolving = problemSolving;
        this.confidence = confidence;
    }

    public int getTechnicalAccuracy() { return technicalAccuracy; }
    public void setTechnicalAccuracy(int technicalAccuracy) { this.technicalAccuracy = technicalAccuracy; }

    public int getCommunicationClarity() { return communicationClarity; }
    public void setCommunicationClarity(int communicationClarity) { this.communicationClarity = communicationClarity; }

    public int getProblemSolving() { return problemSolving; }
    public void setProblemSolving(int problemSolving) { this.problemSolving = problemSolving; }

    public int getConfidence() { return confidence; }
    public void setConfidence(int confidence) { this.confidence = confidence; }
}
