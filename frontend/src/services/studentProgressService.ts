import api from "@/lib/api";
import { StudentProgress, CohortAnalytics, TeacherNote } from "@/mocks/studentProgressData";

export const studentProgressService = {
  async getStudents(): Promise<StudentProgress[]> {
    try {
      const res = await api.get<StudentProgress[]>("/api/v1/admin/students");
      if (Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch students from backend API:", err);
    }
    return [];
  },

  async getStudentById(id: string): Promise<StudentProgress | undefined> {
    try {
      const res = await api.get<StudentProgress>(`/api/v1/admin/students/${encodeURIComponent(id)}`);
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch student by id from backend API:", err);
    }
    const all = await this.getStudents();
    return all.find((s) => s.id === id);
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
