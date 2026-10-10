import api from "@/lib/api";
import {
  StudentProgress,
  CohortAnalytics,
  TeacherNote,
  QuizHistoryRecord,
  mockStudentsProgress,
  HeatmapDay,
} from "@/mocks/studentProgressData";

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

function generateHeatmap(activeLevel: number): HeatmapDay[] {
  const res: HeatmapDay[] = [];
  for (let i = 89; i >= 0; i--) {
    const prob = activeLevel / 100;
    const count = Math.random() < prob ? Math.floor(Math.random() * 6) + 1 : 0;
    res.push({
      date: getPastDate(i),
      count: count,
    });
  }
  return res;
}

function convertMasterStudentToProgress(master: any): StudentProgress {
  const isDeclining = master.riskLevel === "At Risk";
  const activityScore = master.activityScore || 85;
  const avgQuiz = master.avgQuizScore || 80;
  const avgInt = master.avgInterviewScore || 82;

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
    streakDays: master.streakDays || 12,
    problemsSolved: master.problemsSolved || 38,
    problemsSolvedWithHelp: Math.round((master.problemsSolved || 38) * 0.1),
    problemsAttempted: Math.round((master.problemsSolved || 38) * 1.2),
    interviewsCompleted: master.interviewsCompleted || 4,
    avgInterviewScore: avgInt,
    quizzesTaken: master.testsAttended || 5,
    avgQuizScore: avgQuiz,
    articlesRead: 8,
    resumeAnalyses: 3,
    bestAtsScore: master.bestAtsScore || 85,
    leaderboardRank: 3,
    activityHistory30d: generateTrend(activityScore, isDeclining),
    topicBreakdown: [
      { topic: "Quantitative Aptitude", score: avgQuiz, questionsSolved: 12 },
      { topic: "Data Structures & Algorithms", score: 85, questionsSolved: 14 },
      { topic: "Full Stack Engineering", score: 80, questionsSolved: 10 },
      { topic: "System Design", score: 78, questionsSolved: 6 },
    ],
    interviewHistory: [
      {
        id: `int-${master.id}-1`,
        date: "2026-10-02",
        track: "Full Stack Engineer Track",
        type: "Technical & Behavioral",
        score: avgInt,
        durationMinutes: 40,
        feedbackSummary: "Solid technical reasoning and strong problem breakdown.",
      },
    ],
    codingHistory: [
      {
        id: `code-${master.id}-1`,
        title: "Two Sum Target Indices",
        difficulty: "Easy",
        status: "SOLVED",
        attempts: 1,
        lastAttemptDate: "2026-10-08",
      },
    ],
    quizHistory: [],
    resumeHistory: [
      {
        id: `res-${master.id}-1`,
        date: "2026-09-28",
        targetRole: "Full Stack Engineer",
        atsScore: master.bestAtsScore || 85,
        feedbackSummary: "Good keyword optimization, project descriptions well articulated.",
      },
    ],
    heatmapData: generateHeatmap(activityScore),
    teacherNotes: [],
  };
}

function enrichStudentWithRealSubmissions(student: StudentProgress): StudentProgress {
  try {
    const rawSubs = localStorage.getItem("ai_interview_prep_student_submissions_v2");
    if (!rawSubs) return student;
    const allSubs: any[] = JSON.parse(rawSubs);
    if (!Array.isArray(allSubs) || allSubs.length === 0) return student;

    // Filter submissions belonging to this student
    const relevantSubs = allSubs.filter((s) => {
      if (s.userId === student.id || s.userId === student.email) return true;
      if (
        student.id === "usr-student-01" &&
        (s.userId === "demo-student" || s.userId?.includes("student-01") || s.userId?.includes("demo"))
      ) {
        return true;
      }
      if (s.userName && s.userName.toLowerCase() === student.name.toLowerCase()) return true;
      return false;
    });

    if (relevantSubs.length === 0) return student;

    const newQuizHistory: QuizHistoryRecord[] = relevantSubs.map((sub) => {
      const mins = Math.floor(sub.timeSpentSeconds / 60);
      const secs = sub.timeSpentSeconds % 60;
      return {
        id: sub.submissionId || `sub-${Date.now()}`,
        topic: sub.testTitle || "Practice Assessment",
        domain: sub.domain,
        scorePct: sub.percentage,
        questions: sub.totalMarks || 10,
        correctCount: sub.score,
        date: new Date(sub.submittedAt).toLocaleDateString(),
        timeTaken: `${mins}m ${secs}s`,
        xpEarned: sub.xpEarned || Math.round(sub.percentage * 0.8 + 15),
        isPassed: sub.isPassed,
      };
    });

    // Merge without duplicate IDs
    const existingIds = new Set(newQuizHistory.map((q) => q.id));
    const mergedHistory = [...newQuizHistory, ...student.quizHistory.filter((q) => !existingIds.has(q.id))];

    const totalQuizzes = mergedHistory.length;
    const avgScore =
      totalQuizzes > 0
        ? Math.round(mergedHistory.reduce((acc, q) => acc + q.scorePct, 0) / totalQuizzes)
        : student.avgQuizScore;

    const totalQuestionsSolved = relevantSubs.reduce((acc, s) => acc + (s.score || 0), 0);

    return {
      ...student,
      quizzesTaken: totalQuizzes,
      avgQuizScore: avgScore,
      problemsSolved: (student.problemsSolved || 0) + totalQuestionsSolved,
      lastActive: "Just now",
      quizHistory: mergedHistory,
    };
  } catch (err) {
    console.warn("Failed to enrich student with submissions:", err);
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
