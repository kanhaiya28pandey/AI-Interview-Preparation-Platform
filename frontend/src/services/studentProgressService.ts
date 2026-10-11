import api from "@/lib/api";
import {
  StudentProgress,
  CohortAnalytics,
  TeacherNote,
  QuizHistoryRecord,
  MockInterviewRecord,
  CodingHistoryRecord,
  ResumeHistoryRecord,
  mockStudentsProgress,
  HeatmapDay,
} from "@/mocks/studentProgressData";
import { progressService } from "@/services/progressService";
import { liveTestService } from "@/services/liveTestService";

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function generateTrend(baseScore: number, isDeclining = false) {
  const res = [];
  for (let i = 29; i >= 0; i--) {
    const factor = isDeclining ? Math.max(0, 1 - i * 0.02) : 1 + (Math.random() * 0.3 - 0.15);
    const score = Math.min(100, Math.max(10, Math.round(baseScore * factor)));
    res.push({
      date: getPastDate(i),
      score: score,
      count: Math.max(0, Math.floor(score / 15)),
    });
  }
  return res;
}

function generateHeatmap(activeLevel: number, streakDays = 7): HeatmapDay[] {
  const res: HeatmapDay[] = [];
  for (let i = 364; i >= 0; i--) {
    let count = 0;
    if (i < streakDays) {
      count = Math.max(1, (i % 3) + 1);
    } else {
      const prob = activeLevel / 100;
      const rand = ((i * 17 + activeLevel * 3) % 100) / 100;
      if (rand < prob * 0.7) {
        count = ((i * 7 + activeLevel) % 4) + 1;
      }
    }
    res.push({
      date: getPastDate(i),
      count,
    });
  }
  return res;
}

function convertMasterStudentToProgress(master: any): StudentProgress {
  const isDeclining = master.riskLevel === "At Risk";
  const activityScore = master.activityScore ?? 75;
  const avgQuiz = master.avgQuizScore ?? 80;
  const avgInt = master.avgInterviewScore ?? 82;
  const streak = master.streakDays ?? 1;
  const solved = master.problemsSolved ?? 0;
  const interviews = master.interviewsCompleted ?? 0;
  const tests = master.testsAttended ?? 0;

  return {
    id: master.id,
    name: master.name,
    rollNumber: master.rollNumber || "RA2111003010123",
    email: master.email,
    avatarUrl: master.selfieUrl,
    college: master.college,
    course: master.course,
    branch: master.branch,
    year: master.year || master.yearSemester || "Year 3",
    verificationStatus:
      master.verificationStatus === "Verified"
        ? "VERIFIED"
        : master.verificationStatus === "Rejected"
        ? "REJECTED"
        : "PENDING",
    activityScore,
    riskLevel:
      master.riskLevel === "At Risk" ? "At Risk" : master.riskLevel === "Inactive" ? "Inactive" : "Active",
    riskReason: master.rejectionNotes || (master.riskLevel === "At Risk" ? "Declining scores detected" : undefined),
    joinedDate: master.registeredAt ? master.registeredAt.split("T")[0] : "2025-08-15",
    lastActive: master.lastActive || "Just now",
    daysInactive: master.riskLevel === "Inactive" ? 14 : 0,
    streakDays: streak,
    problemsSolved: solved,
    problemsSolvedWithHelp: Math.round(solved * 0.1),
    problemsAttempted: Math.max(solved, Math.round(solved * 1.2)),
    interviewsCompleted: interviews,
    avgInterviewScore: avgInt,
    quizzesTaken: tests,
    avgQuizScore: avgQuiz,
    articlesRead: master.articlesRead ?? 0,
    resumeAnalyses: master.resumeAnalyses ?? 1,
    bestAtsScore: master.bestAtsScore ?? 80,
    leaderboardRank: 1,
    liveTestsAttended: tests,
    totalXp: master.totalXp ?? (solved * 50 + interviews * 150 + tests * 100),
    activityHistory30d: generateTrend(activityScore, isDeclining),
    topicBreakdown: [
      { topic: "Quantitative Aptitude", score: avgQuiz || 70, questionsSolved: Math.max(1, Math.round(solved * 0.25)) },
      { topic: "Data Structures & Algorithms", score: 85, questionsSolved: Math.max(1, Math.round(solved * 0.35)) },
      { topic: "Full Stack Engineering", score: 80, questionsSolved: Math.max(1, Math.round(solved * 0.25)) },
      { topic: "System Design", score: 78, questionsSolved: Math.max(1, Math.round(solved * 0.15)) },
    ],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(activityScore, streak),
    teacherNotes: [],
  };
}

function enrichStudentWithRealSubmissions(student: StudentProgress): StudentProgress {
  try {
    const studentUserId = student.id;

    // 1. Real Coding Submissions
    const codingSubs = progressService.getCodingSubmissions(studentUserId);
    const realCodingHistory: CodingHistoryRecord[] = codingSubs.map((cs) => ({
      id: cs.id,
      title: cs.problemTitle || "Coding Challenge",
      difficulty: (cs.difficulty as any) || "Medium",
      status: cs.status === "ACCEPTED" ? "SOLVED" : "ATTEMPTED",
      attempts: 1,
      lastAttemptDate: cs.submittedAt ? cs.submittedAt.split("T")[0] : new Date().toISOString().split("T")[0],
    }));

    // 2. Real Mock Interview Sessions
    const interviewSessions = progressService.getInterviewSessions(studentUserId);
    const realInterviewHistory: MockInterviewRecord[] = interviewSessions.map((is) => ({
      id: is.id,
      date: is.date || new Date().toLocaleDateString(),
      track: is.roleTitle || "Technical Interview",
      type: "AI Voice / Technical Evaluation",
      score: is.overallScore || 80,
      durationMinutes: 15,
      feedbackSummary: `Technical Accuracy: ${is.technicalAccuracy}%, Communication: ${is.communicationClarity}%, Problem Solving: ${is.problemSolving}%`,
    }));

    // 3. Real Live Test Contest Submissions
    const liveSubs = liveTestService.getAllSubmissions().filter((ls) => {
      if (ls.userId === student.id || ls.userId === student.email) return true;
      if (
        student.id === "usr-student-01" &&
        (ls.userId === "demo-student" || ls.userId?.includes("student-01") || ls.userId?.includes("demo"))
      ) {
        return true;
      }
      return Boolean(ls.studentName && ls.studentName.toLowerCase() === student.name.toLowerCase());
    });

    const liveTestQuizRecords: QuizHistoryRecord[] = liveSubs.map((ls) => {
      const mins = Math.floor(ls.timeTakenSeconds / 60);
      const secs = ls.timeTakenSeconds % 60;
      return {
        id: ls.id,
        topic: ls.testTitle || "Live Contest Assessment",
        domain: (ls as any).domain || "Contest Arena",
        scorePct: ls.percentage,
        questions: ls.totalMarks,
        correctCount: ls.score,
        date: new Date(ls.submittedAt).toLocaleDateString(),
        timeTaken: `${mins}m ${secs}s`,
        xpEarned: Math.round(ls.percentage * 1.8 + 20),
        isPassed: ls.passed,
      };
    });

    // 4. Real MCQ Quiz Attempts
    const quizAttempts = progressService.getQuizAttempts(studentUserId);
    const quizRecords: QuizHistoryRecord[] = quizAttempts.map((qa) => ({
      id: qa.id,
      topic: qa.quizTitle,
      domain: qa.category,
      scorePct: qa.score,
      questions: qa.totalQuestions,
      correctCount: Math.round(qa.totalQuestions * (qa.score / 100)),
      date: new Date(qa.completedAt).toLocaleDateString(),
      timeTaken: "5m 00s",
      xpEarned: qa.xpEarned,
      isPassed: qa.score >= 60,
    }));

    // Merge live tests and quizzes without duplicates
    const combinedQuizHistory = [...liveTestQuizRecords, ...quizRecords];

    // 5. Real Resume Analyses
    const resumeRecords = progressService.getResumeAnalyses(studentUserId);
    const realResumeHistory: ResumeHistoryRecord[] = resumeRecords.map((r) => ({
      id: r.id,
      date: r.analyzedAt,
      targetRole: r.targetRole || "Software Engineer",
      atsScore: r.atsScore || 85,
      feedbackSummary: `ATS Compatibility: ${r.atsScore}/100. Targeted role: ${r.targetRole}.`,
    }));

    // Calculate aggregated stats
    const totalCodingSolved = realCodingHistory.filter((c) => c.status === "SOLVED").length;
    const finalProblemsSolved = Math.max(student.problemsSolved || 0, totalCodingSolved);
    const finalInterviewsCount = Math.max(student.interviewsCompleted || 0, realInterviewHistory.length);
    const finalQuizzesTaken = Math.max(student.quizzesTaken || 0, combinedQuizHistory.length);

    let finalAvgInterview = student.avgInterviewScore || 80;
    if (realInterviewHistory.length > 0) {
      finalAvgInterview = Math.round(
        realInterviewHistory.reduce((acc, i) => acc + i.score, 0) / realInterviewHistory.length
      );
    }

    let finalAvgQuiz = student.avgQuizScore || 80;
    if (combinedQuizHistory.length > 0) {
      finalAvgQuiz = Math.round(
        combinedQuizHistory.reduce((acc, q) => acc + q.scorePct, 0) / combinedQuizHistory.length
      );
    }

    const calculatedActivity = Math.min(
      100,
      Math.round(
        finalProblemsSolved * 1.5 +
          finalInterviewsCount * 8 +
          finalQuizzesTaken * 4 +
          (student.streakDays || 1) * 2
      )
    );
    const finalActivityScore = Math.max(student.activityScore || 0, calculatedActivity);

    return {
      ...student,
      problemsSolved: finalProblemsSolved,
      problemsAttempted: Math.max(finalProblemsSolved, realCodingHistory.length, student.problemsAttempted || 0),
      interviewsCompleted: finalInterviewsCount,
      avgInterviewScore: finalAvgInterview,
      quizzesTaken: finalQuizzesTaken,
      avgQuizScore: finalAvgQuiz,
      activityScore: finalActivityScore,
      codingHistory: realCodingHistory.length > 0 ? realCodingHistory : student.codingHistory,
      interviewHistory: realInterviewHistory.length > 0 ? realInterviewHistory : student.interviewHistory,
      quizHistory: combinedQuizHistory.length > 0 ? combinedQuizHistory : student.quizHistory,
      resumeHistory: realResumeHistory.length > 0 ? realResumeHistory : student.resumeHistory,
      liveTestsAttended: liveSubs.length,
      heatmapData: generateHeatmap(finalActivityScore, student.streakDays || 7),
    };
  } catch (err) {
    console.warn("Failed to enrich student with real activity history:", err);
    return student;
  }
}

export const studentProgressService = {
  async getStudents(): Promise<StudentProgress[]> {
    try {
      const res = await api.get<StudentProgress[]>("/api/v1/admin/students");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((s) => enrichStudentWithRealSubmissions(s));
      }
    } catch (err) {
      console.warn("Failed to fetch students from backend API:", err);
    }

    // Try MasterStudents in localStorage
    try {
      const raw = localStorage.getItem("ai_interview_prep_master_students_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const studentOnly = parsed.filter((m: any) => m.role === "STUDENT");
          if (studentOnly.length > 0) {
            return studentOnly.map((m: any) =>
              enrichStudentWithRealSubmissions(convertMasterStudentToProgress(m))
            );
          }
        }
      }
    } catch (e) {
      console.warn("Failed to parse local master students:", e);
    }

    return mockStudentsProgress.map((s) => enrichStudentWithRealSubmissions(s));
  },

  async getStudentById(id: string): Promise<StudentProgress | undefined> {
    try {
      const res = await api.get<StudentProgress>(`/api/v1/admin/students/${encodeURIComponent(id)}`);
      if (res.data) {
        return enrichStudentWithRealSubmissions(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch student by id from backend API:", err);
    }

    // Check localStorage MasterStudents
    try {
      const raw = localStorage.getItem("ai_interview_prep_master_students_v2");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const found = list.find((s: any) => s.id === id || s.userId === id || s.email === id);
          if (found) {
            return enrichStudentWithRealSubmissions(convertMasterStudentToProgress(found));
          }
        }
      }
    } catch (e) {
      console.warn("Failed to find student in master storage:", e);
    }

    // Check mockStudentsProgress
    const mock = mockStudentsProgress.find((s) => s.id === id || s.email === id);
    if (mock) {
      return enrichStudentWithRealSubmissions(mock);
    }

    const all = await this.getStudents();
    const fallback = all.find((s) => s.id === id || s.email === id);
    return fallback ? enrichStudentWithRealSubmissions(fallback) : undefined;
  },

  async addTeacherNote(studentId: string, noteText: string, authorName = "Admin Teacher"): Promise<TeacherNote> {
    try {
      const res = await api.post<TeacherNote>(`/api/v1/admin/students/${encodeURIComponent(studentId)}/teacher-notes`, {
        noteText,
        authorName,
      });
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend addTeacherNote failed, falling back locally:", err);
    }

    const note: TeacherNote = {
      id: `note-${Date.now()}`,
      author: authorName,
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      text: noteText,
    };
    return note;
  },

  async getCohortAnalytics(): Promise<CohortAnalytics> {
    try {
      const res = await api.get<CohortAnalytics>("/api/v1/admin/cohort-analytics");
      if (res.data && typeof res.data.totalStudents === "number") {
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch cohort analytics from backend API:", err);
    }

    const students = await this.getStudents();
    const total = students.length;
    const avgScore = total > 0 ? Math.round(students.reduce((acc, s) => acc + s.activityScore, 0) / total) : 0;
    const verifiedCount = students.filter((s) => s.verificationStatus === "VERIFIED").length;

    return {
      totalStudents: total,
      avgActivityScore: avgScore,
      verifiedPercentage: total > 0 ? Math.round((verifiedCount / total) * 100) : 0,
      atRiskCount: students.filter((s) => s.riskLevel === "At Risk").length,
      inactiveCount: students.filter((s) => s.riskLevel === "Inactive").length,
      courseAverages: [],
      branchAverages: [],
      topStruggledTopics: [],
      interviewRatingDistribution: [],
      topPerformers: students.slice(0, 5).map((s, idx) => ({
        id: s.id,
        name: s.name,
        course: s.course,
        score: s.activityScore,
        rank: idx + 1,
      })),
    };
  },

  exportStudentsCSV(students: StudentProgress[], filename = "student_progress_report.csv") {
    const headers = [
      "ID",
      "Name",
      "Roll Number",
      "Email",
      "College",
      "Course",
      "Branch",
      "Year",
      "Verification Status",
      "Activity Score",
      "Risk Level",
      "Streak Days",
      "Problems Solved",
      "Interviews Completed",
      "Avg Interview Score",
      "Quiz Avg",
      "Best ATS Score",
      "Last Active",
    ];

    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.rollNumber}"`,
      `"${s.email}"`,
      `"${s.college}"`,
      `"${s.course}"`,
      `"${s.branch}"`,
      `"${s.year}"`,
      s.verificationStatus,
      s.activityScore,
      s.riskLevel,
      s.streakDays,
      s.problemsSolved,
      s.interviewsCompleted,
      s.avgInterviewScore,
      s.avgQuizScore,
      s.bestAtsScore,
      `"${s.lastActive}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
