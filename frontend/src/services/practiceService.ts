import { mockPracticeTopics, mockPracticeQuestions, PracticeTopic, PracticeQuestion } from "@/mocks/practiceData";
import { isDemoUser } from "@/lib/userScope";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const practiceService = {
  async getTopics(): Promise<PracticeTopic[]> {
<<<<<<< ours
    await delay(150);
    return [...mockPracticeTopics];
=======
    if (USE_MOCKS) {
      await delay(300);
      if (isDemoUser()) {
        return [...mockPracticeTopics];
      }
      return mockPracticeTopics.map((t) => ({ ...t, completedCount: 0 }));
    }
    // Real API call when mock is false
    throw new Error("Real backend endpoint for practice topics not implemented");
>>>>>>> theirs
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
