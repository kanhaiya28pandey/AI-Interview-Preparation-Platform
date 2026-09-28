package com.interviewplatform.backend.model;

public class LeaderboardUser {
    private int rank;
    private String userId;
    private String name;
    private String avatar;
    private String college;
    private int score;
    private int streakDays;
    private int problemsSolved;
    private int mockInterviewsCount;
    private int avgInterviewScore;
    private String badge; // "Gold" | "Silver" | "Bronze" | "Master" | "Pro"
    private boolean isCurrentUser;

    public LeaderboardUser() {}

    public LeaderboardUser(int rank, String userId, String name, String avatar, String college, int score, int streakDays, int problemsSolved, int mockInterviewsCount, int avgInterviewScore, String badge) {
        this.rank = rank;
        this.userId = userId;
        this.name = name;
        this.avatar = avatar;
        this.college = college;
        this.score = score;
        this.streakDays = streakDays;
        this.problemsSolved = problemsSolved;
        this.mockInterviewsCount = mockInterviewsCount;
        this.avgInterviewScore = avgInterviewScore;
        this.badge = badge;
    }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getStreakDays() { return streakDays; }
    public void setStreakDays(int streakDays) { this.streakDays = streakDays; }

    public int getProblemsSolved() { return problemsSolved; }
    public void setProblemsSolved(int problemsSolved) { this.problemsSolved = problemsSolved; }

    public int getMockInterviewsCount() { return mockInterviewsCount; }
    public void setMockInterviewsCount(int mockInterviewsCount) { this.mockInterviewsCount = mockInterviewsCount; }

    public int getAvgInterviewScore() { return avgInterviewScore; }
    public void setAvgInterviewScore(int avgInterviewScore) { this.avgInterviewScore = avgInterviewScore; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public boolean isCurrentUser() { return isCurrentUser; }
    public void setCurrentUser(boolean currentUser) { isCurrentUser = currentUser; }
}
