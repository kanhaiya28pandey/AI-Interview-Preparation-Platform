import api from "@/lib/api";
import axios from "axios";
import { InterviewRole, InterviewQuestion, InterviewFeedback } from "@/mocks/interviewData";
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
    try {
      const res = await api.get<InterviewRole[]>("/api/v1/interview/roles");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend interview roles endpoint unavailable:", err);
    }

    try {
      const published = await contentManagerService.getPublishedContent("MOCK_INTERVIEW");
      if (published.length > 0) {
        return published.map((item) => ({
          id: item.id,
          title: item.contentData?.targetRole || item.title,
          category: item.contentData?.interviewType || "Technical",
          description: item.description,
          difficulty: "Senior",
          totalQuestions: item.contentData?.questions?.length || 4,
          durationMinutes: item.settings?.durationMinutes || 30,
          icon: "Video",
        }));
      }
    } catch (e) {
      console.warn("Failed to retrieve published interview roles:", e);
    }

    return [];
  },

  async getRoleById(roleId: string): Promise<InterviewRole | undefined> {
    try {
      const res = await api.get<InterviewRole>(`/api/v1/interview/roles/${encodeURIComponent(roleId)}`);
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend interview role by id unavailable:", err);
    }

    if (roleId.startsWith("cnt-")) {
      try {
        const item = await contentManagerService.getContentById(roleId);
        if (item) {
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
        }
      } catch (e) {
        console.warn("Failed to get dynamic role by id", roleId);
      }
    }

    const roles = await this.getRoles();
    return roles.find((r) => r.id === roleId);
  },

  async getQuestions(roleId: string): Promise<InterviewQuestion[]> {
    try {
      const res = await api.get<InterviewQuestion[]>(`/api/v1/interview/roles/${encodeURIComponent(roleId)}/questions`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend questions for role unavailable:", err);
    }

    if (roleId.startsWith("cnt-")) {
      try {
        const item = await contentManagerService.getContentById(roleId);
        if (item && item.contentData?.questions && Array.isArray(item.contentData.questions)) {
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
    ];
  },

  async submitAnswer(roleId: string, questionId: string, answerText: string): Promise<{ aiFeedback: string; score: number }> {
    const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://127.0.0.1:8000";

    try {
      const response = await axios.post(`${AI_URL}/api/ai/interview/evaluate-answer`, {
        roleId,
        questionId,
        answerText,
      });

      if (response.data) {
        return {
          aiFeedback: response.data.feedback || "Good response addressing core points.",
          score: response.data.score || 82,
        };
      }
    } catch (err) {
      console.warn("AI service not reachable, falling back to heuristic evaluation", err);
    }

    await delay(800);
    const score = Math.min(95, Math.max(65, Math.round(answerText.length / 5)));
    return {
      aiFeedback:
        "Strong structural clarity. Demonstrates practical engineering reasoning and trade-off awareness.",
      score,
    };
  },

  async getSessionFeedback(sessionId: string): Promise<InterviewFeedback> {
    const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://127.0.0.1:8000";

    try {
      const response = await axios.get(`${AI_URL}/api/ai/interview/feedback/${sessionId}`);
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn("Could not retrieve dynamic feedback from AI service, using structured fallback", err);
    }

    await delay(1200);
    return {
      ...fallbackFeedback,
      sessionId,
      date: new Date().toLocaleDateString(),
    };
  },

  async getFeedback(sessionId: string): Promise<InterviewFeedback> {
    return this.getSessionFeedback(sessionId);
  },
};
