package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.interviewplatform.backend.model.TeacherNote;

public class StudentProgressDto {
    private String id;
    private String name;
    private String rollNumber;
    private String email;
    private String avatarUrl;
    private String college;
    private String course;
    private String branch;
    private String year;
    private String verificationStatus; // "VERIFIED" | "PENDING" | "REJECTED" | "UNVERIFIED"
    private int activityScore;
    private String riskLevel; // "Active" | "At Risk" | "Inactive"
    private String riskReason;
    private String joinedDate;
    private String lastActive;
    private int daysInactive;
    private int streakDays;
    private int problemsSolved;
    private int problemsSolvedWithHelp;
    private int problemsAttempted;
    private int interviewsCompleted;
    private int avgInterviewScore;
    private int quizzesTaken;
    private int avgQuizScore;
    private int articlesRead;
    private int resumeAnalyses;
    private int bestAtsScore;
    private int leaderboardRank;

    private List<Map<String, Object>> activityHistory30d = new ArrayList<>();
    private List<Map<String, Object>> topicBreakdown = new ArrayList<>();
    private List<Map<String, Object>> interviewHistory = new ArrayList<>();
    private List<Map<String, Object>> codingHistory = new ArrayList<>();
    private List<Map<String, Object>> quizHistory = new ArrayList<>();
    private List<Map<String, Object>> resumeHistory = new ArrayList<>();
    private List<Map<String, Object>> heatmapData = new ArrayList<>();
    private List<TeacherNote> teacherNotes = new ArrayList<>();

    public StudentProgressDto() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public int getActivityScore() { return activityScore; }
    public void setActivityScore(int activityScore) { this.activityScore = activityScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRiskReason() { return riskReason; }
    public void setRiskReason(String riskReason) { this.riskReason = riskReason; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public String getLastActive() { return lastActive; }
    public void setLastActive(String lastActive) { this.lastActive = lastActive; }

    public int getDaysInactive() { return daysInactive; }
    public void setDaysInactive(int daysInactive) { this.daysInactive = daysInactive; }

    public int getStreakDays() { return streakDays; }
    public void setStreakDays(int streakDays) { this.streakDays = streakDays; }

    public int getProblemsSolved() { return problemsSolved; }
    public void setProblemsSolved(int problemsSolved) { this.problemsSolved = problemsSolved; }

    public int getProblemsSolvedWithHelp() { return problemsSolvedWithHelp; }
    public void setProblemsSolvedWithHelp(int problemsSolvedWithHelp) { this.problemsSolvedWithHelp = problemsSolvedWithHelp; }

    public int getProblemsAttempted() { return problemsAttempted; }
    public void setProblemsAttempted(int problemsAttempted) { this.problemsAttempted = problemsAttempted; }

    public int getInterviewsCompleted() { return interviewsCompleted; }
    public void setInterviewsCompleted(int interviewsCompleted) { this.interviewsCompleted = interviewsCompleted; }

    public int getAvgInterviewScore() { return avgInterviewScore; }
    public void setAvgInterviewScore(int avgInterviewScore) { this.avgInterviewScore = avgInterviewScore; }

    public int getQuizzesTaken() { return quizzesTaken; }
    public void setQuizzesTaken(int quizzesTaken) { this.quizzesTaken = quizzesTaken; }

    public int getAvgQuizScore() { return avgQuizScore; }
    public void setAvgQuizScore(int avgQuizScore) { this.avgQuizScore = avgQuizScore; }

    public int getArticlesRead() { return articlesRead; }
    public void setArticlesRead(int articlesRead) { this.articlesRead = articlesRead; }

    public int getResumeAnalyses() { return resumeAnalyses; }
    public void setResumeAnalyses(int resumeAnalyses) { this.resumeAnalyses = resumeAnalyses; }

    public int getBestAtsScore() { return bestAtsScore; }
    public void setBestAtsScore(int bestAtsScore) { this.bestAtsScore = bestAtsScore; }

    public int getLeaderboardRank() { return leaderboardRank; }
    public void setLeaderboardRank(int leaderboardRank) { this.leaderboardRank = leaderboardRank; }

    public List<Map<String, Object>> getActivityHistory30d() { return activityHistory30d; }
    public void setActivityHistory30d(List<Map<String, Object>> activityHistory30d) { this.activityHistory30d = activityHistory30d; }

    public List<Map<String, Object>> getTopicBreakdown() { return topicBreakdown; }
    public void setTopicBreakdown(List<Map<String, Object>> topicBreakdown) { this.topicBreakdown = topicBreakdown; }

    public List<Map<String, Object>> getInterviewHistory() { return interviewHistory; }
    public void setInterviewHistory(List<Map<String, Object>> interviewHistory) { this.interviewHistory = interviewHistory; }

    public List<Map<String, Object>> getCodingHistory() { return codingHistory; }
    public void setCodingHistory(List<Map<String, Object>> codingHistory) { this.codingHistory = codingHistory; }

    public List<Map<String, Object>> getQuizHistory() { return quizHistory; }
    public void setQuizHistory(List<Map<String, Object>> quizHistory) { this.quizHistory = quizHistory; }

    public List<Map<String, Object>> getResumeHistory() { return resumeHistory; }
    public void setResumeHistory(List<Map<String, Object>> resumeHistory) { this.resumeHistory = resumeHistory; }

    public List<Map<String, Object>> getHeatmapData() { return heatmapData; }
    public void setHeatmapData(List<Map<String, Object>> heatmapData) { this.heatmapData = heatmapData; }

    public List<TeacherNote> getTeacherNotes() { return teacherNotes; }
    public void setTeacherNotes(List<TeacherNote> teacherNotes) { this.teacherNotes = teacherNotes; }
}
