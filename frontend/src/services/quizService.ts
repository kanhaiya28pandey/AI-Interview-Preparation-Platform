import { mockQuizTopics, mockQuizQuestions, QuizTopic, QuizQuestion } from "@/mocks/quizData";
import { SEED_QUIZ_TOPICS, SEED_QUIZ_QUESTIONS } from "@/mocks/taxonomyQuizSeed";
import { contentManagerService } from "./contentManagerService";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const quizService = {
  async getQuizTopics(): Promise<QuizTopic[]> {
    await delay(100);
    const seeded: QuizTopic[] = [...mockQuizTopics];
    const seenIds = new Set(seeded.map((s) => s.id));

    SEED_QUIZ_TOPICS.forEach((sq) => {
      if (!seenIds.has(sq.id)) {
        seeded.push(sq);
        seenIds.add(sq.id);
      }
    });

    try {
      const published = await contentManagerService.getPublishedContent();
      const quizItems = published.filter((i) => i.type === "QUIZ" || i.type === "MOCK_TEST");
      const now = new Date();

      const dynamicTopics: QuizTopic[] = quizItems
        .filter((item) => {
          if (item.settings?.endDate) {
            const end = new Date(item.settings.endDate);
            if (now > end) return false;
          }
          return true;
        })
        .map((item) => {
          const isUpcoming = item.settings?.startDate ? new Date(item.settings.startDate) > now : false;
          const qCount = item.contentData?.questions?.length || (item.contentData?.sections ? 25 : 5);

          return {
            id: item.id,
            title: isUpcoming ? `[Upcoming] ${item.title}` : item.title,
            description: item.description,
            category: item.type === "MOCK_TEST" ? "Full Mock Test" : item.subject || "Algorithms",
            questionCount: qCount,
            timeLimitMinutes: item.settings?.durationMinutes || 15,
            icon: item.type === "MOCK_TEST" ? "Radio" : "HelpCircle",
          };
        });

      dynamicTopics.forEach((dt) => {
        if (!seenIds.has(dt.id)) {
          seeded.unshift(dt);
          seenIds.add(dt.id);
        }
      });
    } catch (e) {
      console.warn("Failed to merge published quiz topics:", e);
    }

    return seeded;
  },

  async getQuestionsByTopic(topicId: string): Promise<QuizQuestion[]> {
    await delay(100);

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

    if (SEED_QUIZ_QUESTIONS[topicId]) {
      return SEED_QUIZ_QUESTIONS[topicId];
    }

    return mockQuizQuestions[topicId] || mockQuizQuestions["quiz-js"] || [];
  },
};
