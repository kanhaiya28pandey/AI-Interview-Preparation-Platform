import { mockPracticeTopics, mockPracticeQuestions, PracticeTopic, PracticeQuestion } from "@/mocks/practiceData";
import { SEED_PRACTICE_TOPICS, SEED_PRACTICE_QUESTIONS } from "@/mocks/taxonomyPracticeSeed";
import { contentManagerService } from "./contentManagerService";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const practiceService = {
  async getTopics(): Promise<PracticeTopic[]> {
    await delay(100);
    // Combine base mocks and taxonomy seed tracks
    const seeded: PracticeTopic[] = [...mockPracticeTopics];
    const seenIds = new Set(seeded.map((s) => s.id));

    SEED_PRACTICE_TOPICS.forEach((sp) => {
      if (!seenIds.has(sp.id)) {
        seeded.push(sp);
        seenIds.add(sp.id);
      }
    });

    try {
      const published = await contentManagerService.getPublishedContent("PRACTICE_TOPIC");
      const dynamicTopics: PracticeTopic[] = published.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.subject,
        difficulty: (item.difficulty as any) || "Medium",
        questionsCount: item.contentData?.subTopics?.reduce((acc: number, s: any) => acc + (s.questionCount || 0), 0) || 10,
        completedCount: 0,
        icon: "Layers",
        tags: item.tags || [item.subject],
      }));

      dynamicTopics.forEach((dt) => {
        if (!seenIds.has(dt.id)) {
          seeded.unshift(dt);
          seenIds.add(dt.id);
        }
      });
    } catch (e) {
      console.warn("Failed to merge published practice topics:", e);
    }

    return seeded;
  },

  async getTopicById(id: string): Promise<PracticeTopic | undefined> {
    await delay(100);
    if (id.startsWith("cnt-")) {
      try {
        const item = await contentManagerService.getContentById(id);
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.subject,
          difficulty: (item.difficulty as any) || "Medium",
          questionsCount: item.contentData?.subTopics?.reduce((acc: number, s: any) => acc + (s.questionCount || 0), 0) || 10,
          completedCount: 0,
          icon: "Layers",
          tags: item.tags || [item.subject],
        };
      } catch (e) {
        console.warn("Failed to load dynamic practice topic by id", id);
      }
    }
    const foundMock = mockPracticeTopics.find((t) => t.id === id);
    if (foundMock) return foundMock;
    return SEED_PRACTICE_TOPICS.find((t) => t.id === id);
  },

  async getQuestionsByTopic(topicId: string): Promise<PracticeQuestion[]> {
    await delay(100);
    const mockMatch = mockPracticeQuestions.filter((q) => q.topicId === topicId);
    if (mockMatch.length > 0) return mockMatch;
    return SEED_PRACTICE_QUESTIONS.filter((q) => q.topicId === topicId);
  },
};
