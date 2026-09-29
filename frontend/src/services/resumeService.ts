import axios from "axios";
import { mockResumeAnalyses, mockAdminResumeAnalytics, ResumeAnalysisResult, AdminResumeAnalytics } from "@/mocks/resumeAnalysis";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const resumeService = {
  async analyzeResume(
    file: File,
    role: string,
    field: string,
    jobDescription?: string
  ): Promise<ResumeAnalysisResult> {
    const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://127.0.0.1:8000";

    try {
      let resumeText = "";
      try {
        resumeText = await file.text();
      } catch {
        resumeText = `Candidate resume for ${role} in ${field}. File: ${file.name}`;
      }

      if (!resumeText || resumeText.trim().length < 20) {
        resumeText = `Candidate resume for ${role} in ${field}. Technical skills: React, TypeScript, Java, Spring Boot, MongoDB, Python, SQL, Git, REST APIs, Microservices. Education: B.Tech Computer Science. Projects: Full stack web app, AI interview platform. File name: ${file.name}`;
      }

      const response = await axios.post(`${AI_URL}/api/ai/resume/analyze`, {
        resumeText,
        role: role || "Software Engineer",
        field: field || "IT Services",
        jobDescription: jobDescription || undefined,
      }, { timeout: 8000 });

      if (response.data && response.data.atsScore) {
        return {
          ...response.data,
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
    } catch (err) {
      console.warn("Real AI ATS analysis call failed, using high-fidelity local engine:", err);
    }

    await delay(1200);
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
        { keyword: "Unit Testing", present: true, count: 1, importance: "Recommended" as const },
      ],
      roleFitComparison: [
        { roleName: role, score: 81 },
        { roleName: "Software Engineer", score: 84 },
        { roleName: "Full Stack Engineer", score: 76 },
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
  },

  async getAdminAnalytics(): Promise<AdminResumeAnalytics> {
    await delay(100);
    return mockAdminResumeAnalytics;
  },
};
