import api from "@/lib/api";
import { QuizTopic, QuizQuestion } from "@/mocks/quizData";
import { contentManagerService } from "./contentManagerService";

export const quizService = {
  async getQuizTopics(): Promise<QuizTopic[]> {
    try {
      const res = await api.get<QuizTopic[]>("/api/v1/quiz/topics");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend quiz topics endpoint unavailable, checking content manager:", err);
    }

    try {
      const published = await contentManagerService.getPublishedContent();
      const quizItems = published.filter((i) => i.type === "QUIZ" || i.type === "MOCK_TEST");
      if (quizItems.length > 0) {
        return quizItems.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.type === "MOCK_TEST" ? "Full Mock Test" : item.subject || "Algorithms",
          questionCount: item.contentData?.questions?.length || 5,
          timeLimitMinutes: item.settings?.durationMinutes || 15,
          icon: item.type === "MOCK_TEST" ? "Radio" : "HelpCircle",
        }));
      }
    } catch (e) {
      console.warn("Failed to retrieve fallback quiz topics:", e);
    }

    return [];
  },

  async getQuestionsByTopic(topicId: string): Promise<QuizQuestion[]> {
    try {
      const res = await api.get<QuizQuestion[]>(`/api/v1/quiz/topics/${encodeURIComponent(topicId)}/questions`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend questions endpoint unavailable, querying content manager:", err);
    }

    if (topicId.startsWith("cnt-")) {
      try {
        const item = await contentManagerService.getContentById(topicId);
        if (item.contentData?.questions && Array.isArray(item.contentData.questions)) {
          return item.contentData.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options || [],
            correctIndex: q.correctIndex ?? 0,
            explanation: q.explanation || "No explanation provided.",
          }));
        }
      } catch (e) {
        console.warn("Failed to load questions for content item", topicId, e);
      }
    }

    return [];
  },
};
