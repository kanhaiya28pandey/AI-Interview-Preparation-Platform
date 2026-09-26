import { mockQuizTopics, mockQuizQuestions, QuizTopic, QuizQuestion } from "@/mocks/quizData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const quizService = {
  async getQuizTopics(): Promise<QuizTopic[]> {
    if (USE_MOCKS) {
      await delay(300);
      return [...mockQuizTopics];
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getQuestionsByTopic(topicId: string): Promise<QuizQuestion[]> {
    if (USE_MOCKS) {
      await delay(300);
      return mockQuizQuestions[topicId] || mockQuizQuestions["quiz-js"];
    }
    throw new Error("Real backend endpoint not implemented");
  },
};
