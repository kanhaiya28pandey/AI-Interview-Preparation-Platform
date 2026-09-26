import { mockPracticeTopics, mockPracticeQuestions, PracticeTopic, PracticeQuestion } from "@/mocks/practiceData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const practiceService = {
  async getTopics(): Promise<PracticeTopic[]> {
    if (USE_MOCKS) {
      await delay(300);
      return [...mockPracticeTopics];
    }
    // Real API call when mock is false
    throw new Error("Real backend endpoint for practice topics not implemented");
  },

  async getTopicById(id: string): Promise<PracticeTopic | undefined> {
    if (USE_MOCKS) {
      await delay(200);
      return mockPracticeTopics.find((t) => t.id === id);
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getQuestionsByTopic(topicId: string): Promise<PracticeQuestion[]> {
    if (USE_MOCKS) {
      await delay(250);
      return mockPracticeQuestions.filter((q) => q.topicId === topicId);
    }
    throw new Error("Real backend endpoint not implemented");
  },
};
