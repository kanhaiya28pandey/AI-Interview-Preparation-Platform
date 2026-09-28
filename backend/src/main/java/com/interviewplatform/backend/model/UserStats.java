package com.interviewplatform.backend.model;

public class UserStats {
    private int totalPracticeSessions = 0;
    private int codingProblemsSolved = 0;
    private int mockInterviewsCompleted = 0;
    private int quizzesCompleted = 0;
    private int overallRating = 85;
    private int currentStreak = 1;
    private int totalXP = 150;

    public UserStats() {}

    public int getTotalPracticeSessions() { return totalPracticeSessions; }
    public void setTotalPracticeSessions(int totalPracticeSessions) { this.totalPracticeSessions = totalPracticeSessions; }

    public int getCodingProblemsSolved() { return codingProblemsSolved; }
    public void setCodingProblemsSolved(int codingProblemsSolved) { this.codingProblemsSolved = codingProblemsSolved; }

    public int getMockInterviewsCompleted() { return mockInterviewsCompleted; }
    public void setMockInterviewsCompleted(int mockInterviewsCompleted) { this.mockInterviewsCompleted = mockInterviewsCompleted; }

    public int getQuizzesCompleted() { return quizzesCompleted; }
    public void setQuizzesCompleted(int quizzesCompleted) { this.quizzesCompleted = quizzesCompleted; }

    public int getOverallRating() { return overallRating; }
    public void setOverallRating(int overallRating) { this.overallRating = overallRating; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getTotalXP() { return totalXP; }
    public void setTotalXP(int totalXP) { this.totalXP = totalXP; }
}
