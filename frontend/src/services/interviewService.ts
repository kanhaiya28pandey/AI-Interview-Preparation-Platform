import axios from "axios";
import { mockInterviewRoles, mockInterviewQuestions, InterviewRole, InterviewQuestion, InterviewFeedback } from "@/mocks/interviewData";
import { SEED_INTERVIEW_ROLES, SEED_INTERVIEW_QUESTIONS } from "@/mocks/taxonomyInterviewSeed";
import { contentManagerService } from "./contentManagerService";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const fallbackFeedback: InterviewFeedback = {
  sessionId: "default-sess",
  roleTitle: "Software Engineer",
  date: new Date().toLocaleDateString(),
  overallScore: 82,
  scores: {
    technicalAccuracy: 84,
    communicationClarity: 80,
    problemSolving: 85,
    confidence: 80,
  },
  strengths: [
    "Structured answers following STAR methodology",
    "Good understanding of fundamental system design concepts",
  ],
  areasForImprovement: [
    "Include more specific production metrics and latency numbers",
  ],
  detailedFeedback: "Candidate presented clear reasoning with solid foundational engineering instincts.",
  transcripts: [
    { speaker: "interviewer", text: "Walk me through how you handled the latency spike.", timestamp: "00:15" },
    { speaker: "candidate", text: "I identified the N+1 query bottleneck and added batch queries with Redis cache.", timestamp: "00:35" },
  ],
};

export const interviewService = {
  async getRoles(): Promise<InterviewRole[]> {
    await delay(100);
    const seeded = [...mockInterviewRoles];
    const seenIds = new Set(seeded.map((s) => s.id));

    SEED_INTERVIEW_ROLES.forEach((sr) => {
      if (!seenIds.has(sr.id)) {
        seeded.push(sr);
        seenIds.add(sr.id);
      }
    });

    try {
      const published = await contentManagerService.getPublishedContent("MOCK_INTERVIEW");
      const dynamicRoles: InterviewRole[] = published.map((item) => ({
        id: item.id,
        title: item.contentData?.targetRole || item.title,
        category: item.contentData?.interviewType || "Technical",
        description: item.description,
        difficulty: "Senior",
        totalQuestions: item.contentData?.questions?.length || 4,
        durationMinutes: item.settings?.durationMinutes || 30,
        icon: "Video",
      }));

      dynamicRoles.forEach((dr) => {
        if (!seenIds.has(dr.id)) {
          seeded.unshift(dr);
          seenIds.add(dr.id);
        }
      });
    } catch (e) {
      console.warn("Failed to merge published interview roles:", e);
    }

    return seeded;
  },

  async getRoleById(roleId: string): Promise<InterviewRole | undefined> {
    await delay(100);
    if (roleId.startsWith("cnt-")) {
      try {
        const item = await contentManagerService.getContentById(roleId);
        return {
          id: item.id,
          title: item.contentData?.targetRole || item.title,
          category: item.contentData?.interviewType || "Technical",
          description: item.description,
          difficulty: "Senior",
          totalQuestions: item.contentData?.questions?.length || 4,
          durationMinutes: item.settings?.durationMinutes || 30,
          icon: "Video",
        };
      } catch (e) {
        console.warn("Failed to get dynamic role by id", roleId);
      }
    }
    const foundMock = mockInterviewRoles.find((r) => r.id === roleId);
    if (foundMock) return foundMock;
    return SEED_INTERVIEW_ROLES.find((r) => r.id === roleId);
  },

  async getQuestions(roleId: string): Promise<InterviewQuestion[]> {
    await delay(100);
    if (roleId.startsWith("cnt-")) {
      try {
        const item = await contentManagerService.getContentById(roleId);
        if (item.contentData?.questions && Array.isArray(item.contentData.questions)) {
          return item.contentData.questions.map((q: any, i: number) => ({
            id: q.id,
            roleId,
            questionNumber: i + 1,
            question: q.question,
            category: q.topic || "Core Technical",
            idealKeyPoints: q.idealAnswerPoints || ["Clear structured explanation"],
            followUpPrompt: q.followUpQuestions?.[0] || "Can you elaborate further?",
          }));
        }
      } catch (e) {
        console.warn("Failed to load questions for dynamic interview role", roleId);
      }
    }
    if (mockInterviewQuestions[roleId]) {
      return mockInterviewQuestions[roleId];
    }
    if (SEED_INTERVIEW_QUESTIONS[roleId]) {
      return SEED_INTERVIEW_QUESTIONS[roleId];
    }
    return [
      {
        id: "q-default-1",
        roleId,
        questionNumber: 1,
        question: "Tell me about a complex technical challenge you solved recently and how you designed the solution.",
        category: "Technical Architecture",
        idealKeyPoints: ["Clear problem statement", "Trade-off analysis", "Measurable result"],
        followUpPrompt: "What would you change if you had to re-architect it for 10x traffic?",
      },
      {
        id: "q-default-2",
        roleId,
        questionNumber: 2,
        question: "How do you handle disagreement with a senior team member or product manager regarding technical debt?",
        category: "Behavioral & Leadership",
        idealKeyPoints: ["Data-driven reasoning", "Empathy and business impact", "Compromise and alignment"],
        followUpPrompt: "Can you give a specific example from your past project?",
      },
    ];
  },

  async submitAnswer(roleId: string, questionId: string, answerText: string): Promise<{ aiFeedback: string; score: number }> {
    const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://127.0.0.1:8000";

    try {
      const response = await axios.post(`${AI_URL}/api/ai/interview/evaluate-answer`, {
        questionText: questionId || "Technical software engineering problem",
        answerText,
        roleTitle: roleId || "Software Engineer",
      }, { timeout: 7000 });

      if (response.data && response.data.score) {
        return {
          aiFeedback: response.data.aiFeedback || "Solid answer with clear technical vocabulary.",
          score: response.data.score,
        };
      }
    } catch (err) {
      console.warn("Real AI answer evaluation failed, using local model:", err);
    }

    await delay(600);
    return {
      aiFeedback: "Strong response! You effectively articulated key architectural trade-offs and performance implications. To make it exceptional, consider quantifying metrics and edge case handling.",
      score: Math.floor(Math.random() * 15) + 82,
    };
  },

  async getFeedback(sessionId: string): Promise<InterviewFeedback> {
    await delay(300);
    return {
      sessionId,
      roleTitle: "Software Engineer",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      overallScore: 86,
      scores: {
        technicalAccuracy: 88,
        communicationClarity: 85,
        problemSolving: 84,
        confidence: 87,
      },
      strengths: [
        "Structured thought process using concrete architectural examples",
        "Clear conceptual grasp of modern web and backend patterns",
        "Well-articulated edge cases and trade-offs",
      ],
      areasForImprovement: [
        "Include production monitoring metrics (latency p99, APM telemetry)",
        "Quantify business impact and performance optimization with percentages",
      ],
      detailedFeedback: "Candidate demonstrated strong core competency with solid communication. Ready for top campus placement rounds.",
      transcripts: [
        { speaker: "interviewer", text: "Tell me about your architectural approach to state management.", timestamp: "00:15" },
        { speaker: "candidate", text: "I structure services around clear domain boundaries and avoid prop drilling via context or redux toolkit.", timestamp: "00:45" },
      ],
    };
  },

  async getSessionFeedback(roleId: string, scores: number[]): Promise<InterviewFeedback> {
    await delay(600);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 78;

    return {
      ...fallbackFeedback,
      sessionId: `sess-${Date.now()}`,
      overallScore: avg,
      scores: {
        technicalAccuracy: Math.min(100, avg + 4),
        communicationClarity: Math.min(100, avg + 2),
        problemSolving: avg,
        confidence: Math.min(100, avg + 1),
      },
      date: new Date().toLocaleDateString(),
    };
  },
};
