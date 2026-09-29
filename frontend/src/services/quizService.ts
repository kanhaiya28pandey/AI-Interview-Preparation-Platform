import { mockQuizTopics, mockQuizQuestions, QuizTopic, QuizQuestion } from "@/mocks/quizData";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const quizService = {
  async getQuizTopics(): Promise<QuizTopic[]> {
    await delay(150);
    return [...mockQuizTopics];
  },

  async getQuestionsByTopic(topicId: string): Promise<QuizQuestion[]> {
    await delay(150);
    return mockQuizQuestions[topicId] || mockQuizQuestions["quiz-js"] || [];
  },
};
