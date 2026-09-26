import { mockResumeAnalyses, mockAdminResumeAnalytics, ResumeAnalysisResult, AdminResumeAnalytics } from "@/mocks/resumeAnalysis";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const resumeService = {
  async analyzeResume(
    file: File,
    role: string,
    field: string,
    jobDescription?: string
  ): Promise<ResumeAnalysisResult> {
    if (USE_MOCKS) {
      // Simulate network & AI model processing time
      await delay(2500);

      const baseMock = mockResumeAnalyses[role] || {
        atsScore: 81,
        verdict: `Solid candidate profile for ${role} in ${field || "Tech"}.`,
        subScores: {
          keywordMatch: 82,
          formatting: 88,
          experienceRelevance: 79,
          skillsMatch: 83,
          educationMatch: 85,
          actionVerbUsage: 78,
        },
        matchedSkills: ["Problem Solving", "Git", "Agile", "Team Collaboration"],
        missingSkills: [
          {
            name: `${role} Advanced Toolset`,
            importance: "Critical" as const,
            tooltip: "Essential tool required for role qualification.",
          },
          {
            name: "Cloud Deployment (AWS/Azure)",
            importance: "High" as const,
            tooltip: "Cloud experience is prioritized by recruiters.",
          },
        ],
        suggestions: [
          {
            id: "s_default_1",
            section: "Skills" as const,
            priority: "High" as const,
            text: `Tailor your technical skills specifically for ${role} positions.`,
            whyItMatters: "Role-specific terms boost ATS filter match probability.",
          },
          {
            id: "s_default_2",
            section: "Experience" as const,
            priority: "Medium" as const,
            text: "Quantify your achievements using metrics and percent improvements.",
            whyItMatters: "Numerical proof increases recruiter engagement.",
          },
        ],
        keywords: [
          { keyword: role, present: true, count: 4, importance: "Critical" as const },
          { keyword: field || "Technology", present: true, count: 2, importance: "Recommended" as const },
          { keyword: "CI/CD", present: false, count: 0, importance: "Critical" as const },
        ],
        formattingChecklist: [
          { id: "f1", label: "Single-column ATS readable layout", passed: true, tip: "Parsable text structure." },
          { id: "f2", label: "Standard headers", passed: true, tip: "Standard header regex match." },
          { id: "f3", label: "No tables or graphic elements", passed: true, tip: "No image graphs." },
          { id: "f4", label: "Consistent bullet point structure", passed: true, tip: "Clean bullet points." },
          { id: "f5", label: "ATS-friendly typography", passed: true, tip: "Standard font." },
        ],
        sections: [
          {
            name: "Summary",
            status: "good" as const,
            score: 85,
            extractedContent: "Motivated engineer seeking target role opportunities.",
            suggestions: ["Add specific technology names."],
          },
          {
            name: "Experience",
            status: "needs-improvement" as const,
            score: 75,
            extractedContent: "Worked on software engineering tasks.",
            suggestions: ["Detail project metrics."],
          },
        ],
        roleFitComparison: [
          { roleName: role, score: 81 },
          { roleName: "Software Engineer", score: 75 },
          { roleName: "Systems Analyst", score: 68 },
        ],
        history: [
          { id: "h1", date: "2 days ago", role, score: 72, fileName: file.name },
          { id: "h2", date: "Today", role, score: 81, fileName: file.name },
        ],
      };

      return {
        ...baseMock,
        role,
        field: field || "IT Services",
        fileName: file.name,
        analyzedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }

    throw new Error("Real backend endpoint not implemented yet.");
  },

  async getAdminAnalytics(): Promise<AdminResumeAnalytics> {
    if (USE_MOCKS) {
      await delay(200);
      return mockAdminResumeAnalytics;
    }
    throw new Error("Real backend endpoint /api/v1/admin/resume-analytics not implemented yet.");
  },
};
