import { mockStudentsProgress, StudentProgress, CohortAnalytics, TeacherNote } from "@/mocks/studentProgressData";
import { isMockMode } from "@/lib/dataMode";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getMasterStudents = (): StudentProgress[] => {
  let masterList: StudentProgress[] = [];
  try {
    const raw = localStorage.getItem("ai_interview_prep_master_students_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = isMockMode()
          ? parsed
          : parsed.filter(
              (m: any) =>
                !m.id?.startsWith("usr-student-") &&
                !m.userId?.startsWith("usr-student-") &&
                !m.id?.startsWith("demo-") &&
                !m.userId?.startsWith("demo-")
            );

        masterList = filtered.map((m: any) => ({
          id: m.id || m.userId,
          name: m.name,
          rollNumber: m.rollNumber || "",
          email: m.email,
          college: m.college || "",
          course: m.course || "B.Tech",
          branch: m.branch || "CSE",
          year: m.year || "1st Year",
          verificationStatus: (m.verificationStatus === "Verified"
            ? "VERIFIED"
            : m.verificationStatus === "Rejected"
            ? "REJECTED"
            : "PENDING") as "VERIFIED" | "PENDING" | "REJECTED" | "UNVERIFIED",
          activityScore: m.activityScore || 0,
          riskLevel: (m.riskLevel === "At Risk"
            ? "At Risk"
            : m.riskLevel === "Inactive"
            ? "Inactive"
            : "Active") as "Active" | "At Risk" | "Inactive",
          streakDays: m.streakDays || 0,
          problemsSolved: m.problemsSolved || 0,
          problemsSolvedWithHelp: 0,
          problemsAttempted: m.problemsSolved || 0,
          interviewsCompleted: m.interviewsCompleted || 0,
          avgInterviewScore: m.avgInterviewScore || 0,
          quizzesTaken: 0,
          avgQuizScore: m.avgQuizScore || 0,
          articlesRead: 0,
          resumeAnalyses: 0,
          bestAtsScore: m.bestAtsScore || 0,
          leaderboardRank: 0,
          joinedDate: m.registeredAt || new Date().toISOString(),
          lastActive: m.lastActive || "Just Registered",
          daysInactive: 0,
          activityHistory30d: [],
          topicBreakdown: [],
          interviewHistory: [],
          codingHistory: [],
          quizHistory: [],
          resumeHistory: [],
          heatmapData: [],
          teacherNotes: [],
        }));
      }
    }
  } catch {
    // ignore
  }

  const baseList = isMockMode() ? [...mockStudentsProgress] : [];
  const seenIds = new Set(baseList.map((s) => s.id));
  masterList.forEach((m) => {
    if (!seenIds.has(m.id)) {
      baseList.push(m);
      seenIds.add(m.id);
    }
  });
  return baseList;
};

export const studentProgressService = {
  async getStudents(): Promise<StudentProgress[]> {
    await delay(150);
    const all = getMasterStudents();
    try {
      const savedNotes = localStorage.getItem("admin_teacher_notes_map");
      if (savedNotes) {
        const notesMap: Record<string, TeacherNote[]> = JSON.parse(savedNotes);
        return all.map((s) => ({
          ...s,
          teacherNotes: notesMap[s.id] || s.teacherNotes || [],
        }));
      }
    } catch {
      // ignore
    }
    return all;
  },

  async getStudentById(id: string): Promise<StudentProgress | undefined> {
    await delay(100);
    const all = await this.getStudents();
    return all.find((s) => s.id === id);
  },

  async addTeacherNote(studentId: string, noteText: string, authorName = "Admin Teacher"): Promise<TeacherNote> {
    if (isMockMode()) {
      await delay(300);
      const allStudents = await this.getStudents();
      const student = allStudents.find((s) => s.id === studentId);
      if (!student) throw new Error("Student not found");

      const newNote: TeacherNote = {
        id: `note-${Date.now()}`,
        author: authorName,
        date: new Date().toISOString().replace("T", " ").slice(0, 16),
        text: noteText,
      };

      const updatedNotes = [newNote, ...(student.teacherNotes || [])];

      // Save to localStorage map
      try {
        const currentMapStr = localStorage.getItem("admin_teacher_notes_map") || "{}";
        const currentMap = JSON.parse(currentMapStr);
        currentMap[studentId] = updatedNotes;
        localStorage.setItem("admin_teacher_notes_map", JSON.stringify(currentMap));
      } catch {
        // ignore
      }

      return newNote;
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getCohortAnalytics(): Promise<CohortAnalytics> {
    await delay(200);
    const allStudents = await this.getStudents();
    const total = allStudents.length;
    const avgScore = Math.round(allStudents.reduce((acc, s) => acc + s.activityScore, 0) / (total || 1));
    const verifiedCount = allStudents.filter((s) => s.verificationStatus === "VERIFIED").length;
    const verifiedPct = Math.round((verifiedCount / (total || 1)) * 100);
    const atRiskCount = allStudents.filter((s) => s.riskLevel === "At Risk").length;
    const inactiveCount = allStudents.filter((s) => s.riskLevel === "Inactive").length;

    // Course Averages
    const courseMap: Record<string, { totalScore: number; count: number }> = {};
    allStudents.forEach((s) => {
      if (!courseMap[s.course]) courseMap[s.course] = { totalScore: 0, count: 0 };
      courseMap[s.course].totalScore += s.activityScore;
      courseMap[s.course].count += 1;
    });
    const courseAverages = Object.keys(courseMap).map((course) => ({
      course: course,
      avgScore: Math.round(courseMap[course].totalScore / courseMap[course].count),
      studentCount: courseMap[course].count,
    }));

    // Branch Averages
    const branchMap: Record<string, { totalScore: number; count: number }> = {};
    allStudents.forEach((s) => {
      if (!branchMap[s.branch]) branchMap[s.branch] = { totalScore: 0, count: 0 };
      branchMap[s.branch].totalScore += s.activityScore;
      branchMap[s.branch].count += 1;
    });
    const branchAverages = Object.keys(branchMap).map((branch) => ({
      branch: branch,
      avgScore: Math.round(branchMap[branch].totalScore / branchMap[branch].count),
      studentCount: branchMap[branch].count,
    }));

    // Top Struggled Topics
    const topStruggledTopics = [
      { topic: "Dynamic Programming", strugglePct: 64, studentCount: 14 },
      { topic: "Graphs & Trees", strugglePct: 52, studentCount: 12 },
      { topic: "System Design & Caching", strugglePct: 45, studentCount: 10 },
      { topic: "Database Sharding & SQL", strugglePct: 38, studentCount: 8 },
      { topic: "Behavioral STAR Stories", strugglePct: 22, studentCount: 5 },
    ];

    // Interview Rating Distribution
    const interviewRatingDistribution = [
      { range: "90-100% (Exceptional)", count: 4 },
      { range: "80-89% (Strong)", count: 7 },
      { range: "70-79% (Average)", count: 3 },
      { range: "< 70% (Needs Improvement)", count: 2 },
    ];

    // Top Performers
    const sortedByRank = [...allStudents].sort((a, b) => b.activityScore - a.activityScore);
    const topPerformers = sortedByRank.slice(0, 5).map((s, idx) => ({
      id: s.id,
      name: s.name,
      course: `${s.course} (${s.branch.split(" ")[0]})`,
      score: s.activityScore,
      rank: idx + 1,
    }));

    return {
      totalStudents: total,
      avgActivityScore: avgScore,
      verifiedPercentage: verifiedPct,
      atRiskCount: atRiskCount,
      inactiveCount: inactiveCount,
      courseAverages,
      branchAverages,
      topStruggledTopics,
      interviewRatingDistribution,
      topPerformers,
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
