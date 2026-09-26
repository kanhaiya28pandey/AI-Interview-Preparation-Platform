import { mockInterviewRoles, mockInterviewQuestions, InterviewRole, InterviewQuestion, InterviewFeedback } from "@/mocks/interviewData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const interviewService = {
  async getRoles(): Promise<InterviewRole[]> {
    if (USE_MOCKS) {
      await delay(300);
      return [...mockInterviewRoles];
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getRoleById(roleId: string): Promise<InterviewRole | undefined> {
    if (USE_MOCKS) {
      await delay(200);
      return mockInterviewRoles.find((r) => r.id === roleId);
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getQuestions(roleId: string): Promise<InterviewQuestion[]> {
    if (USE_MOCKS) {
      await delay(300);
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
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async submitAnswer(roleId: string, questionId: string, answerText: string): Promise<{ aiFeedback: string; score: number }> {
    if (USE_MOCKS) {
      await delay(800);
      return {
        aiFeedback: "Strong response! You effectively mentioned key architectural trade-offs and performance implications. To make it exceptional, quantify the latency improvement with exact numbers.",
        score: Math.floor(Math.random() * 15) + 82,
      };
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getFeedback(sessionId: string): Promise<InterviewFeedback> {
    if (USE_MOCKS) {
      await delay(400);
      return {
        sessionId,
        roleTitle: "Senior Frontend Engineer (React/TypeScript)",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        overallScore: 89,
        scores: {
          technicalAccuracy: 92,
          communicationClarity: 88,
          problemSolving: 90,
          confidence: 86,
        },
        strengths: [
          "Demonstrated deep understanding of React concurrent rendering and fiber architecture",
          "Articulated complex technical concepts cleanly using precise terminology",
          "Good structured problem solving approach when addressing edge cases",
        ],
        areasForImprovement: [
          "Could elaborate more on automated unit and integration testing strategies",
          "Provide concrete metrics when discussing past project performance optimizations",
        ],
        detailedFeedback: "Overall, your performance was in the top 10% of candidates. You showed strong mastery over core React mechanics, DOM event loops, and TypeScript strict typing.",
        transcripts: [
          { speaker: "interviewer", text: "Welcome! Let's start with React Fiber architecture...", timestamp: "00:15" },
          { speaker: "candidate", text: "React Fiber is a ground-up rewrite of React's reconciliation engine...", timestamp: "00:45" },
          { speaker: "interviewer", text: "Excellent answer. How do you handle microtask queue starvation?", timestamp: "02:10" },
        ],
      };
    }
    throw new Error("Real backend endpoint not implemented");
  },
};
