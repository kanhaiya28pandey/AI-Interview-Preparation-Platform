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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let usersList = [...mockAdminUsers];
let testsList = [...mockAdminCodingTests];
let interviewsList = [...mockAdminMockInterviews];

export const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    await delay(150);
    return [...usersList];
  },

  async toggleBlockUser(userId: string): Promise<AdminUser> {
    await delay(150);
    const user = usersList.find((u) => u.id === userId);
    if (user) {
      user.status = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      return { ...user };
    }
    throw new Error("User not found");
  },

  async deleteUser(userId: string): Promise<boolean> {
    await delay(150);
    usersList = usersList.filter((u) => u.id !== userId);
    return true;
  },

  async getCodingTests(): Promise<AdminCodingTest[]> {
    await delay(150);
    return [...testsList];
  },

  async saveCodingTest(test: Partial<AdminCodingTest>): Promise<AdminCodingTest> {
    await delay(200);
    if (test.id) {
      const idx = testsList.findIndex((t) => t.id === test.id);
      if (idx !== -1) {
        testsList[idx] = { ...testsList[idx], ...test } as AdminCodingTest;
        return testsList[idx];
      }
    }
    const newTest: AdminCodingTest = {
      id: `test-${Date.now()}`,
      title: test.title || "New Coding Benchmark",
      difficulty: test.difficulty || "Medium",
      submissionsCount: test.submissionsCount || 0,
      passRate: test.passRate || "0%",
      status: test.status || "ACTIVE",
      createdAt: test.createdAt || new Date().toISOString().split("T")[0],
    };
    testsList.push(newTest);
    return newTest;
  },

  async deleteCodingTest(testId: string): Promise<boolean> {
    await delay(150);
    testsList = testsList.filter((t) => t.id !== testId);
    return true;
  },

  async getMockInterviews(): Promise<AdminMockInterviewConfig[]> {
    await delay(150);
    return [...interviewsList];
  },

  async saveMockInterview(config: Partial<AdminMockInterviewConfig>): Promise<AdminMockInterviewConfig> {
    await delay(200);
    if (config.id) {
      const idx = interviewsList.findIndex((i) => i.id === config.id);
      if (idx !== -1) {
        interviewsList[idx] = { ...interviewsList[idx], ...config } as AdminMockInterviewConfig;
        return interviewsList[idx];
      }
    }
    const newConfig: AdminMockInterviewConfig = {
      id: `interview-${Date.now()}`,
      roleTitle: config.roleTitle || "Software Engineer",
      category: config.category || "Backend",
      questionsCount: config.questionsCount || 4,
      durationMinutes: config.durationMinutes || 25,
      status: config.status || "ACTIVE",
    };
    interviewsList.push(newConfig);
    return newConfig;
  },

  async getReports(): Promise<AdminReportData> {
    await delay(200);
    return mockAdminReports;
  },
};
