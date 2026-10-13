import api from "@/lib/api";
import {
  ContentItem,
  contentManagerService,
  StudentTestSubmission,
} from "./contentManagerService";

export const practiceService = {
  // 1. Get all published practice tests and modules
  async getPracticeTests(domainSlug?: string): Promise<ContentItem[]> {
    const allTests = await contentManagerService.listContent({
      status: "PUBLISHED",
      subject: domainSlug && domainSlug !== "ALL" ? domainSlug : undefined,
    });
    return allTests;
  },

  // 2. Get test by ID
  async getTestById(id: string): Promise<ContentItem | undefined> {
    return contentManagerService.getContentById(id);
  },

  // 3. Submit student attempt with timer and answers
  async submitTestAttempt(submission: {
    testId: string;
    userId: string;
    userName?: string;
    timeSpentSeconds: number;
    answers: Record<string, number | string>;
  }): Promise<StudentTestSubmission> {
    return contentManagerService.submitStudentTest(submission);
  },

  // 4. Retrieve student submissions
  getStudentSubmissions(userId?: string): StudentTestSubmission[] {
    return contentManagerService.getStudentSubmissions(userId);
  },

  // 5. Retrieve submission for a specific test
  getSubmissionForTest(userId: string, testId: string): StudentTestSubmission | undefined {
    return contentManagerService.getSubmissionForTest(userId, testId);
  },

  // Backward compatibility methods for old topics modal
  async getTopics(): Promise<any[]> {
    const tests = await this.getPracticeTests();
    return tests.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.subject,
      difficulty: t.difficulty,
      questionsCount: t.questionsCount || t.contentData?.questions?.length || 5,
      completedCount: t.studentAttempts || 0,
      icon: "Layers",
      tags: t.tags,
    }));
  },

  async getQuestionsByTopic(topicId: string): Promise<any[]> {
    const test = await this.getTestById(topicId);
    return test?.contentData?.questions || [];
  },
};
