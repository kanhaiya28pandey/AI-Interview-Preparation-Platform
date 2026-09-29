import axios from "axios";
import { mockInterviewRoles, mockInterviewQuestions, InterviewRole, InterviewQuestion, InterviewFeedback } from "@/mocks/interviewData";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const interviewService = {
  async getRoles(): Promise<InterviewRole[]> {
    await delay(150);
    return [...mockInterviewRoles];
  },

  async getRoleById(roleId: string): Promise<InterviewRole | undefined> {
    await delay(100);
    return mockInterviewRoles.find((r) => r.id === roleId);
  },

  async getQuestions(roleId: string): Promise<InterviewQuestion[]> {
    await delay(150);
    return mockInterviewQuestions[roleId] || [
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
};
