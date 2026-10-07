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

  async searchExternalProblems(params: {
    source?: string;
    query?: string;
    domain?: string;
    difficulty?: string;
    limit?: number;
  }): Promise<ExternalProblemSummary[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.source) searchParams.append("source", params.source);
      if (params.query) searchParams.append("query", params.query);
      if (params.domain) searchParams.append("domain", params.domain);
      if (params.difficulty) searchParams.append("difficulty", params.difficulty);
      if (params.limit) searchParams.append("limit", String(params.limit));

      const res = await api.get<ExternalProblemSummary[]>(`/api/v1/admin/coding-import/search?${searchParams.toString()}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn("Backend external problem query unavailable, using resilient fallback catalog:", e);
    }

    return FALLBACK_EXTERNAL_PROBLEMS.filter((p) => {
      if (params.source && params.source !== "ALL" && p.source !== params.source) return false;
      if (params.difficulty && params.difficulty !== "ALL" && p.difficulty !== params.difficulty) return false;
      if (params.query && !p.title.toLowerCase().includes(params.query.toLowerCase())) return false;
      if (params.domain && params.domain !== "ALL") {
        const domainLower = params.domain.toLowerCase();
        const catMatch = p.category.toLowerCase().includes(domainLower);
        const tagMatch = p.topicTags.some((t) => t.toLowerCase().includes(domainLower));
        if (!catMatch && !tagMatch) return false;
      }
      return true;
    });
  },

  async importExternalProblem(request: ExternalProblemImportRequest): Promise<any> {
    try {
      const res = await api.post("/api/v1/admin/coding-import/import", request);
      if (res.data) return res.data;
    } catch (e) {
      console.warn("Backend import endpoint unavailable, registering locally:", e);
    }

    const demoSaved = {
      id: request.slug || `prob-${Date.now()}`,
      title: request.title || "Imported Coding Challenge",
      difficulty: request.difficulty || "Medium",
      category: request.category || "Algorithms",
      acceptance: "75%",
      description: `Optimal algorithmic problem solving for ${request.title || "challenge"}.`,
      starterCode: {
        javascript: `// Solve ${request.title}\nfunction solve(input) {\n  return input;\n}`,
        python: `# Solve ${request.title}\ndef solve(input):\n  return input`,
        java: `class Solution {\n  public Object solve(Object input) { return input; }\n}`,
        cpp: `int solve(int input) { return input; }`,
      },
      testCases: [{ id: 1, inputStr: "1", expectedStr: "1" }],
    };

    try {
      const stored = JSON.parse(localStorage.getItem("demo_imported_coding_problems") || "[]");
      if (!stored.some((p: any) => p.id === demoSaved.id)) {
        stored.push(demoSaved);
        localStorage.setItem("demo_imported_coding_problems", JSON.stringify(stored));
      }
    } catch {}

    return demoSaved;
  },

  async getPlatformCodingProblems(): Promise<any[]> {
    let list: any[] = [];
    try {
      const res = await api.get("/api/v1/admin/coding-import/bank");
      if (Array.isArray(res.data) && res.data.length > 0) {
        list = [...res.data];
      }
    } catch (e) {
      console.warn("Backend question bank unavailable, loading local catalog:", e);
    }

    try {
      const stored = JSON.parse(localStorage.getItem("demo_imported_coding_problems") || "[]");
      stored.forEach((item: any) => {
        if (!list.some((p) => p.id === item.id)) {
          list.push(item);
        }
      });
    } catch {}

    return list;
  },

  async deletePlatformCodingProblem(problemId: string): Promise<boolean> {
    try {
      await api.delete(`/api/v1/admin/coding-import/${problemId}`);
    } catch (e) {
      console.warn("Backend delete unavailable, removing locally:", e);
    }

    try {
      const stored = JSON.parse(localStorage.getItem("demo_imported_coding_problems") || "[]");
      const filtered = stored.filter((p: any) => p.id !== problemId);
      localStorage.setItem("demo_imported_coding_problems", JSON.stringify(filtered));
    } catch {}

    return true;
  },
};

export interface ExternalProblemSummary {
  id: string;
  title: string;
  slug: string;
  source: "LEETCODE" | "CODEFORCES" | "GEEKSFORGEEKS" | string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  category: string;
  topicTags: string[];
  acceptance: string;
  isPaidOnly: boolean;
  externalUrl?: string;
  isAlreadyImported?: boolean;
}

export interface ExternalProblemImportRequest {
  source: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  tags?: string[];
}

const FALLBACK_EXTERNAL_PROBLEMS: ExternalProblemSummary[] = [
  {
    id: "lc-1",
    title: "1. Two Sum",
    slug: "two-sum",
    source: "LEETCODE",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    topicTags: ["Array", "Hash Table"],
    acceptance: "51.8%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/two-sum/",
  },
  {
    id: "lc-2",
    title: "2. Add Two Numbers",
    slug: "add-two-numbers",
    source: "LEETCODE",
    difficulty: "Medium",
    category: "Linked List",
    topicTags: ["Linked List", "Math", "Recursion"],
    acceptance: "42.4%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/add-two-numbers/",
  },
  {
    id: "lc-3",
    title: "3. Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    source: "LEETCODE",
    difficulty: "Medium",
    category: "Sliding Window",
    topicTags: ["Hash Table", "String", "Sliding Window"],
    acceptance: "34.8%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
  },
  {
    id: "lc-100",
    title: "100. Same Tree",
    slug: "same-tree",
    source: "LEETCODE",
    difficulty: "Easy",
    category: "Trees",
    topicTags: ["Tree", "Depth-First Search", "Binary Tree"],
    acceptance: "61.2%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/same-tree/",
  },
  {
    id: "lc-175",
    title: "175. Combine Two Tables",
    slug: "combine-two-tables",
    source: "LEETCODE",
    difficulty: "Easy",
    category: "Database",
    topicTags: ["Database", "SQL", "Join"],
    acceptance: "74.8%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/combine-two-tables/",
  },
  {
    id: "lc-176",
    title: "176. Second Highest Salary",
    slug: "second-highest-salary",
    source: "LEETCODE",
    difficulty: "Medium",
    category: "Database",
    topicTags: ["Database", "SQL"],
    acceptance: "39.6%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/second-highest-salary/",
  },
  {
    id: "gfg-subarray-sum",
    title: "Subarray with Given Sum",
    slug: "subarray-with-given-sum",
    source: "GEEKSFORGEEKS",
    difficulty: "Medium",
    category: "Two Pointers",
    topicTags: ["Arrays", "Sliding Window"],
    acceptance: "78.4%",
    isPaidOnly: false,
    externalUrl: "https://www.geeksforgeeks.org/problems/subarray-with-given-sum/1",
  },
  {
    id: "gfg-missing-number",
    title: "Missing Number in Array",
    slug: "missing-number-in-array",
    source: "GEEKSFORGEEKS",
    difficulty: "Easy",
    category: "Arrays",
    topicTags: ["Arrays", "Math"],
    acceptance: "82.1%",
    isPaidOnly: false,
    externalUrl: "https://www.geeksforgeeks.org/problems/missing-number-in-array1416/1",
  },
  {
    id: "gfg-kadane-algo",
    title: "Kadane's Algorithm (Max Subarray)",
    slug: "kadanes-algorithm",
    source: "GEEKSFORGEEKS",
    difficulty: "Medium",
    category: "Dynamic Programming",
    topicTags: ["DP", "Arrays"],
    acceptance: "68.2%",
    isPaidOnly: false,
    externalUrl: "https://www.geeksforgeeks.org/problems/kadanes-algorithm/1",
  },
  {
    id: "cf-158A",
    title: "158A - Next Round",
    slug: "158/A",
    source: "CODEFORCES",
    difficulty: "Easy",
    category: "Algorithms",
    topicTags: ["implementation", "special problem"],
    acceptance: "Rating 800",
    isPaidOnly: false,
    externalUrl: "https://codeforces.com/problemset/problem/158/A",
  },
];
