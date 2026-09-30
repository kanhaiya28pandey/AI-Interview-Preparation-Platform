import { mockPracticeTopics, mockPracticeQuestions, PracticeTopic, PracticeQuestion } from "@/mocks/practiceData";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const practiceService = {
  async getTopics(): Promise<PracticeTopic[]> {
    await delay(150);
    return [...mockPracticeTopics];
  },

  async getTopicById(id: string): Promise<PracticeTopic | undefined> {
    await delay(100);
    return mockPracticeTopics.find((t) => t.id === id);
  },

  async getQuestionsByTopic(topicId: string): Promise<PracticeQuestion[]> {
    await delay(150);
    return mockPracticeQuestions.filter((q) => q.topicId === topicId);
  },
};
