import api from "@/lib/api";
import { PracticeTopic, PracticeQuestion } from "@/mocks/practiceData";
import { contentManagerService } from "./contentManagerService";
import { progressService } from "./progressService";

const getCurrentUserId = (): string | null => {
  try {
    const raw = localStorage.getItem("ai_interview_prep_user");
    if (raw) {
      const u = JSON.parse(raw);
      return u.userId || null;
    }
  } catch {
    // ignore
  }
  return null;
};

export const practiceService = {
  async getTopics(userId?: string | null): Promise<PracticeTopic[]> {
    const activeUserId = userId !== undefined ? userId : getCurrentUserId();

    try {
      const res = await api.get<PracticeTopic[]>("/api/v1/practice/topics");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((t) => {
          const completed = progressService.getCompletedQuestionsForTopic(activeUserId, t.id);
          return {
            ...t,
            completedCount: completed.length,
          };
        });
      }
    } catch (err) {
      console.warn("Backend practice topics endpoint unavailable:", err);
    }

    try {
      const published = await contentManagerService.getPublishedContent("PRACTICE_TOPIC");
      if (published.length > 0) {
        return published.map((item) => ({
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
      }
    } catch (e) {
      console.warn("Failed to retrieve published practice topics:", e);
    }

    return [];
  },

  async getTopicById(id: string): Promise<PracticeTopic | undefined> {
    try {
      const res = await api.get<PracticeTopic>(`/api/v1/practice/topics/${encodeURIComponent(id)}`);
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend practice topic by id unavailable:", err);
    }

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

    const topics = await this.getTopics();
    return topics.find((t) => t.id === id);
  },

  async getQuestionsByTopic(topicId: string): Promise<PracticeQuestion[]> {
    try {
      const res = await api.get<PracticeQuestion[]>(`/api/v1/practice/topics/${encodeURIComponent(topicId)}/questions`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend questions for topic unavailable:", err);
    }

    return [];
  },
};
