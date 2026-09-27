import { mockStudentsProgress, StudentProgress, CohortAnalytics, TeacherNote } from "@/mocks/studentProgressData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let studentsList = [...mockStudentsProgress];

// Load local overrides for teacher notes or state
try {
  const savedNotes = localStorage.getItem("admin_teacher_notes_map");
  if (savedNotes) {
    const notesMap: Record<string, TeacherNote[]> = JSON.parse(savedNotes);
    studentsList = studentsList.map((s) => ({
      ...s,
      teacherNotes: notesMap[s.id] || s.teacherNotes || [],
    }));
  }
} catch {
  // ignore
}

export const studentProgressService = {
  async getStudents(): Promise<StudentProgress[]> {
    if (USE_MOCKS) {
      await delay(250);
      return [...studentsList];
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getStudentById(id: string): Promise<StudentProgress | undefined> {
    if (USE_MOCKS) {
      await delay(200);
      return studentsList.find((s) => s.id === id);
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async addTeacherNote(studentId: string, noteText: string, authorName = "Admin Teacher"): Promise<TeacherNote> {
    if (USE_MOCKS) {
      await delay(300);
      const student = studentsList.find((s) => s.id === studentId);
      if (!student) throw new Error("Student not found");

      const newNote: TeacherNote = {
        id: `note-${Date.now()}`,
        author: authorName,
        date: new Date().toISOString().replace("T", " ").slice(0, 16),
        text: noteText,
      };

      const updatedNotes = [newNote, ...student.teacherNotes];
      student.teacherNotes = updatedNotes;

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
    if (USE_MOCKS) {
      await delay(300);

      const total = studentsList.length;
      const avgScore = Math.round(studentsList.reduce((acc, s) => acc + s.activityScore, 0) / (total || 1));
      const verifiedCount = studentsList.filter((s) => s.verificationStatus === "VERIFIED").length;
      const verifiedPct = Math.round((verifiedCount / (total || 1)) * 100);
      const atRiskCount = studentsList.filter((s) => s.riskLevel === "At Risk").length;
      const inactiveCount = studentsList.filter((s) => s.riskLevel === "Inactive").length;

      // Course Averages
      const courseMap: Record<string, { totalScore: number; count: number }> = {};
      studentsList.forEach((s) => {
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
      studentsList.forEach((s) => {
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
      const sortedByRank = [...studentsList].sort((a, b) => b.activityScore - a.activityScore);
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
    }
    throw new Error("Real backend endpoint not implemented");
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
