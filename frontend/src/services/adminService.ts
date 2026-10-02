import api, { isDemoSession } from "@/lib/api";
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
    if (isDemoSession()) {
      await delay(150);
      return [...usersList];
    }
    const res = await api.get("/api/v1/admin/users");
    return res.data;
  },

  async toggleBlockUser(userId: string): Promise<AdminUser> {
    if (isDemoSession()) {
      await delay(150);
      const user = usersList.find((u) => u.id === userId);
      if (user) {
        user.status = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
        return { ...user };
      }
      throw new Error("User not found");
    }
    const res = await api.patch(`/api/v1/admin/users/${userId}/toggle-block`);
    return res.data;
  },

  async deleteUser(userId: string): Promise<boolean> {
    if (isDemoSession()) {
      await delay(150);
      usersList = usersList.filter((u) => u.id !== userId);
      return true;
    }
    const res = await api.delete(`/api/v1/admin/users/${userId}`);
    return res.data?.success ?? true;
  },

  async getCodingTests(): Promise<AdminCodingTest[]> {
    if (isDemoSession()) {
      await delay(150);
      return [...testsList];
    }
    const res = await api.get("/api/v1/admin/coding-tests");
    if (Array.isArray(res.data)) {
      return res.data.map((p: any) => ({
        id: p.id || `test-${Math.random()}`,
        title: p.title || "Untitled Coding Benchmark",
        domain: p.category || "Java",
        topics: p.topics || [{ name: p.category || "General", questionCount: 1, weightage: 100 }],
        difficulty: p.difficulty || "Medium",
        submissionsCount: p.submissionsCount || 0,
        passRate: p.acceptance || p.passRate || "0%",
        status: p.status || "ACTIVE",
        createdAt: p.createdAt || new Date().toISOString().split("T")[0],
      }));
    }
    return [];
  },

  async saveCodingTest(test: Partial<AdminCodingTest>): Promise<AdminCodingTest> {
    if (isDemoSession()) {
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
        domain: test.domain || "Java",
        topics: test.topics || [{ name: "General Fundamentals", questionCount: 2, weightage: 100 }],
        difficulty: test.difficulty || "Medium",
        submissionsCount: test.submissionsCount || 0,
        passRate: test.passRate || "0%",
        status: test.status || "ACTIVE",
        createdAt: test.createdAt || new Date().toISOString().split("T")[0],
      };
      testsList.push(newTest);
      return newTest;
    }
    const res = await api.post("/api/v1/admin/coding-tests", test);
    return res.data;
  },

  async deleteCodingTest(testId: string): Promise<boolean> {
    if (isDemoSession()) {
      await delay(150);
      testsList = testsList.filter((t) => t.id !== testId);
      return true;
    }
    await api.delete(`/api/v1/admin/coding-tests/${testId}`);
    return true;
  },

  async getMockInterviews(): Promise<AdminMockInterviewConfig[]> {
    if (isDemoSession()) {
      await delay(150);
      return [...interviewsList];
    }
    const res = await api.get("/api/v1/admin/mock-interviews");
    if (Array.isArray(res.data)) {
      return res.data.map((r: any) => ({
        id: r.id || `interview-${Math.random()}`,
        roleTitle: r.roleTitle || r.title || "Software Engineer",
        domain: r.domain || r.category || "Frontend",
        topics: r.topics || [{ name: "Core Skills", questionCount: 2, weightage: 100 }],
        category: r.category || "General",
        questionsCount: r.questionsCount || 4,
        durationMinutes: r.durationMinutes || 25,
        status: r.status || "ACTIVE",
      }));
    }
    return [];
  },

  async saveMockInterview(config: Partial<AdminMockInterviewConfig>): Promise<AdminMockInterviewConfig> {
    if (isDemoSession()) {
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
        domain: config.domain || config.category || "Frontend",
        topics: config.topics || [{ name: "Core Skills", questionCount: 2, weightage: 100 }],
        category: config.category || "Backend",
        questionsCount: config.questionsCount || 4,
        durationMinutes: config.durationMinutes || 25,
        status: config.status || "ACTIVE",
      };
      interviewsList.push(newConfig);
      return newConfig;
    }
    const res = await api.post("/api/v1/admin/mock-interviews", config);
    return res.data;
  },

  async getReports(): Promise<AdminReportData> {
    if (isDemoSession()) {
      await delay(200);
      return mockAdminReports;
    }
    const res = await api.get("/api/v1/admin/reports");
    return res.data;
  },
};
