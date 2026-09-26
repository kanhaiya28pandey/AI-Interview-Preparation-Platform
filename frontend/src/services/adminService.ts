import {
  mockAdminUsers,
  mockAdminCodingTests,
  mockAdminMockInterviews,
  mockAdminReports,
  AdminUser,
  AdminCodingTest,
  AdminMockInterviewConfig,
  AdminReportData,
} from "@/mocks/adminData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let usersList = [...mockAdminUsers];
let testsList = [...mockAdminCodingTests];
let interviewsList = [...mockAdminMockInterviews];

export const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    if (USE_MOCKS) {
      await delay(300);
      return [...usersList];
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async toggleBlockUser(userId: string): Promise<AdminUser> {
    if (USE_MOCKS) {
      await delay(250);
      const user = usersList.find((u) => u.id === userId);
      if (user) {
        user.status = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
        return { ...user };
      }
      throw new Error("User not found");
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async deleteUser(userId: string): Promise<boolean> {
    if (USE_MOCKS) {
      await delay(300);
      usersList = usersList.filter((u) => u.id !== userId);
      return true;
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getCodingTests(): Promise<AdminCodingTest[]> {
    if (USE_MOCKS) {
      await delay(300);
      return [...testsList];
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async saveCodingTest(test: Partial<AdminCodingTest>): Promise<AdminCodingTest> {
    if (USE_MOCKS) {
      await delay(350);
      if (test.id) {
        testsList = testsList.map((t) => (t.id === test.id ? { ...t, ...test } as AdminCodingTest : t));
        return testsList.find((t) => t.id === test.id)!;
      } else {
        const newTest: AdminCodingTest = {
          id: `test-${Date.now()}`,
          title: test.title || "Untitled Problem",
          difficulty: test.difficulty || "Easy",
          submissionsCount: 0,
          passRate: "0.0%",
          status: test.status || "ACTIVE",
          createdAt: new Date().toISOString().split("T")[0],
        };
        testsList.push(newTest);
        return newTest;
      }
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getMockInterviews(): Promise<AdminMockInterviewConfig[]> {
    if (USE_MOCKS) {
      await delay(300);
      return [...interviewsList];
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async saveMockInterview(config: Partial<AdminMockInterviewConfig>): Promise<AdminMockInterviewConfig> {
    if (USE_MOCKS) {
      await delay(350);
      if (config.id) {
        interviewsList = interviewsList.map((i) => (i.id === config.id ? { ...i, ...config } as AdminMockInterviewConfig : i));
        return interviewsList.find((i) => i.id === config.id)!;
      } else {
        const newConfig: AdminMockInterviewConfig = {
          id: `int-${Date.now()}`,
          roleTitle: config.roleTitle || "New Role Track",
          category: config.category || "Full Stack",
          questionsCount: config.questionsCount || 4,
          durationMinutes: config.durationMinutes || 25,
          status: config.status || "ACTIVE",
        };
        interviewsList.push(newConfig);
        return newConfig;
      }
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getReports(): Promise<AdminReportData> {
    if (USE_MOCKS) {
      await delay(400);
      return mockAdminReports;
    }
    throw new Error("Real backend endpoint not implemented");
  },
};
