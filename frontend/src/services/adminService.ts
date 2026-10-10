import api from "@/lib/api";
import {
  AdminUser,
  AdminCodingTest,
  AdminMockInterviewConfig,
  AdminReportData,
} from "@/mocks/adminData";
import { RICH_PROBLEM_CATALOG, RichProblemDefinition } from "@/mocks/richProblemBank";

export const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    try {
      const res = await api.get("/api/v1/admin/users");
      if (Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch users from backend:", err);
    }
    return [];
  },

  async toggleBlockUser(userId: string): Promise<AdminUser> {
    const res = await api.patch(`/api/v1/admin/users/${userId}/toggle-block`);
    return res.data;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const res = await api.delete(`/api/v1/admin/users/${userId}`);
    return res.data?.success ?? true;
  },

  async getCodingTests(): Promise<AdminCodingTest[]> {
    try {
      const res = await api.get("/api/v1/admin/coding-tests");
      if (Array.isArray(res.data)) {
        return res.data.map((p: any) => ({
          id: p.id || `test-${Math.random()}`,
          title: p.title || "Untitled Coding Benchmark",
          domain: p.category || "Algorithms",
          topics: [{ name: p.category || "General", questionCount: 1, weightage: 100 }],
          difficulty: p.difficulty || "Medium",
          submissionsCount: p.submissionsCount || 0,
          passRate: p.acceptance || p.passRate || "70%",
          status: p.status || "ACTIVE",
          createdAt: p.createdAt || new Date().toISOString().split("T")[0],
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch coding tests from backend:", err);
    }
    return [];
  },

  async saveCodingTest(test: Partial<AdminCodingTest>): Promise<AdminCodingTest> {
    const res = await api.post("/api/v1/admin/coding-tests", test);
    return res.data;
  },

  async deleteCodingTest(testId: string): Promise<boolean> {
    await api.delete(`/api/v1/admin/coding-tests/${testId}`);
    return true;
  },

  async getMockInterviews(): Promise<AdminMockInterviewConfig[]> {
    try {
      const res = await api.get("/api/v1/admin/mock-interviews");
      if (Array.isArray(res.data)) {
        return res.data.map((r: any) => ({
          id: r.id || `interview-${Math.random()}`,
          roleTitle: r.roleTitle || r.title || "Software Engineer",
          domain: r.domain || r.category || "Frontend",
          topics: r.topics || [{ name: "Core Competency", questionCount: r.totalQuestions || 3, weightage: 100 }],
          category: r.category || "General",
          questionsCount: r.questionsCount || r.totalQuestions || 4,
          durationMinutes: r.durationMinutes || 25,
          status: r.status || "ACTIVE",
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch mock interviews from backend:", err);
    }
    return [];
  },

  async saveMockInterview(config: Partial<AdminMockInterviewConfig>): Promise<AdminMockInterviewConfig> {
    const res = await api.post("/api/v1/admin/mock-interviews", config);
    return res.data;
  },

  async getReports(): Promise<AdminReportData> {
    try {
      const res = await api.get("/api/v1/admin/reports");
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch admin reports from backend:", err);
    }
    return {
      userGrowth: [],
      interviewStats: [],
      difficultyDistribution: [],
    };
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
      // Backend not running, use rich catalog fallback
    }

    // Convert rich problem catalog into ExternalProblemSummary items
    const catalogSummaries: ExternalProblemSummary[] = RICH_PROBLEM_CATALOG.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      source: p.source,
      difficulty: p.difficulty,
      category: p.category,
      topicTags: p.tags || [],
      acceptance: p.acceptance,
      isPaidOnly: false,
      externalUrl:
        p.source === "LEETCODE" || p.source === "SQL_DATABASE"
          ? `https://leetcode.com/problems/${p.slug}/`
          : p.source === "GEEKSFORGEEKS"
          ? `https://practice.geeksforgeeks.org/problems/${p.slug}`
          : `https://codeforces.com/problemset/problem/${p.slug}`,
    }));

    return catalogSummaries.filter((p) => {
      if (params.source && params.source !== "ALL") {
        if (params.source === "DATABASE_SQL") {
          if (p.source !== "SQL_DATABASE") return false;
        } else if (p.source !== params.source) {
          return false;
        }
      }
      if (params.difficulty && params.difficulty !== "ALL" && p.difficulty !== params.difficulty) return false;
      if (params.query && !p.title.toLowerCase().includes(params.query.toLowerCase()) && !p.category.toLowerCase().includes(params.query.toLowerCase())) return false;
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
      // Backend import endpoint unavailable, registering locally
    }

    // Look up rich structured definition if available in catalog
    const richMatch = RICH_PROBLEM_CATALOG.find(
      (p) =>
        p.slug === request.slug ||
        p.id === request.slug ||
        p.title.toLowerCase() === request.title?.toLowerCase()
    );

    let demoSaved: any;

    if (richMatch) {
      demoSaved = {
        ...richMatch,
        id: richMatch.id || request.slug,
        title: richMatch.title,
        problemNumber: richMatch.problemNumber,
        category: richMatch.category,
        difficulty: richMatch.difficulty,
        acceptance: richMatch.acceptance,
        description: richMatch.description,
        inputFormat: richMatch.inputFormat,
        outputFormat: richMatch.outputFormat,
        constraints: richMatch.constraints,
        examples: richMatch.examples,
        hints: richMatch.hints,
        testCases: richMatch.testCases,
        starterCode: richMatch.starterCode,
        solution: richMatch.solution,
        fnName: richMatch.fnName,
        xpReward: richMatch.xpReward,
        type: richMatch.type || (richMatch.category.includes("SQL") ? "SQL" : "CODING"),
        tags: richMatch.tags,
      };
    } else {
      const isSql =
        request.category?.toLowerCase().includes("sql") ||
        request.category?.toLowerCase().includes("database");

      demoSaved = {
        id: request.slug || `prob-${Date.now()}`,
        title: request.title || "Custom Problem",
        difficulty: request.difficulty || "Medium",
        category: request.category || (isSql ? "Database & SQL" : "Algorithms"),
        acceptance: "72%",
        description: request.description || `Problem statement for ${request.title}.`,
        inputFormat: "Standard inputs",
        outputFormat: "Standard output format",
        constraints: ["1 <= N <= 10^5", "Expected Time: O(N)"],
        examples: [{ input: "Sample input", output: "Sample output", explanation: "Sample case." }],
        hints: ["Think about optimal time complexity."],
        testCases: [{ id: 1, inputStr: "Sample input", expectedStr: "Sample output", params: [1], expectedVal: "Sample output" }],
        starterCode: isSql
          ? {
              mysql: "-- Write your MySQL query below\nSELECT ...\nFROM ...;",
              postgresql: "-- Write your PostgreSQL query below\nSELECT ...\nFROM ...;",
              sql: "-- Write your standard SQL query below\nSELECT ...\nFROM ...;",
            }
          : {
              javascript: `function solve(input) {\n  // Write solution here\n  return input;\n}`,
              python: `def solve(input):\n    # Write solution here\n    pass`,
              java: `class Solution {\n    public Object solve(Object input) {\n        return null;\n    }\n}`,
              cpp: `int solve(int input) {\n    return 0;\n}`,
              c: `#include <stdio.h>\nint solve(int input) {\n    return 0;\n}`,
            },
        fnName: "solve",
        xpReward: request.difficulty === "Hard" ? 200 : request.difficulty === "Medium" ? 100 : 50,
        type: isSql ? "SQL" : "CODING",
        tags: request.topicTags || request.tags || [],
      };
    }

    try {
      const stored = JSON.parse(localStorage.getItem("demo_imported_coding_problems") || "[]");
      const existingIdx = stored.findIndex((p: any) => p.id === demoSaved.id);
      if (existingIdx >= 0) {
        stored[existingIdx] = demoSaved;
      } else {
        stored.push(demoSaved);
      }
      localStorage.setItem("demo_imported_coding_problems", JSON.stringify(stored));

      const deletedIds = JSON.parse(localStorage.getItem("demo_deleted_coding_problem_ids") || "[]");
      const filteredDeleted = deletedIds.filter((id: string) => id !== demoSaved.id);
      localStorage.setItem("demo_deleted_coding_problem_ids", JSON.stringify(filteredDeleted));
    } catch {}

    return demoSaved;
  },

  async getPlatformCodingProblems(): Promise<any[]> {
    try {
      const res = await api.get("/api/v1/admin/coding-import/bank");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn("Backend question bank query error:", e);
    }

    const localSaved = JSON.parse(localStorage.getItem("demo_imported_coding_problems") || "[]");
    return localSaved;
  },

  async deletePlatformCodingProblem(problemId: string): Promise<boolean> {
    try {
      await api.delete(`/api/v1/admin/coding-import/${problemId}`);
    } catch (e) {
      console.warn("Backend delete unavailable:", e);
    }

    try {
      const stored = JSON.parse(localStorage.getItem("demo_imported_coding_problems") || "[]");
      const filtered = stored.filter((p: any) => p.id !== problemId);
      localStorage.setItem("demo_imported_coding_problems", JSON.stringify(filtered));

      const deletedIds = JSON.parse(localStorage.getItem("demo_deleted_coding_problem_ids") || "[]");
      if (!deletedIds.includes(problemId)) {
        deletedIds.push(problemId);
        localStorage.setItem("demo_deleted_coding_problem_ids", JSON.stringify(deletedIds));
      }
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
  topicTags?: string[];
  tags?: string[];
  description?: string;
}

const FALLBACK_EXTERNAL_PROBLEMS: ExternalProblemSummary[] = [
  {
    id: "lc-1",
    title: "Two Sum",
    slug: "two-sum",
    source: "LEETCODE",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    topicTags: ["Array", "Hash Table"],
    acceptance: "49.2%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/two-sum/",
  },
  {
    id: "lc-2",
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    source: "LEETCODE",
    difficulty: "Medium",
    category: "Linked List",
    topicTags: ["Linked List", "Math", "Recursion"],
    acceptance: "40.1%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/add-two-numbers/",
  },
  {
    id: "lc-3",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    source: "LEETCODE",
    difficulty: "Medium",
    category: "Strings & Sliding Window",
    topicTags: ["Hash Table", "String", "Sliding Window"],
    acceptance: "33.8%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
  },
  {
    id: "lc-20",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    source: "LEETCODE",
    difficulty: "Easy",
    category: "Stack",
    topicTags: ["String", "Stack"],
    acceptance: "40.3%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/valid-parentheses/",
  },
  {
    id: "lc-206",
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    source: "LEETCODE",
    difficulty: "Easy",
    category: "Linked List",
    topicTags: ["Linked List", "Recursion"],
    acceptance: "73.4%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/reverse-linked-list/",
  },
  {
    id: "lc-53",
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    source: "LEETCODE",
    difficulty: "Medium",
    category: "Dynamic Programming",
    topicTags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    acceptance: "50.1%",
    isPaidOnly: false,
    externalUrl: "https://leetcode.com/problems/maximum-subarray/",
  },
  {
    id: "gfg-1",
    title: "Subarray with Given Sum",
    slug: "subarray-with-given-sum",
    source: "GEEKSFORGEEKS",
    difficulty: "Medium",
    category: "Arrays & Sliding Window",
    topicTags: ["Arrays", "Sliding Window", "Prefix Sum"],
    acceptance: "45.0%",
    isPaidOnly: false,
    externalUrl: "https://practice.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1",
  },
  {
    id: "gfg-2",
    title: "Detect Loop in Linked List",
    slug: "detect-loop-in-linked-list",
    source: "GEEKSFORGEEKS",
    difficulty: "Easy",
    category: "Linked List",
    topicTags: ["Linked List", "Two Pointers"],
    acceptance: "58.2%",
    isPaidOnly: false,
    externalUrl: "https://practice.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
  },
  {
    id: "cf-1",
    title: "Watermelon",
    slug: "watermelon",
    source: "CODEFORCES",
    difficulty: "Easy",
    category: "Math & Logic",
    topicTags: ["brute force", "math"],
    acceptance: "82.1%",
    isPaidOnly: false,
    externalUrl: "https://codeforces.com/problemset/problem/4/A",
  },
  {
    id: "cf-71A",
    title: "Way Too Long Words",
    slug: "way-too-long-words",
    source: "CODEFORCES",
    difficulty: "Easy",
    category: "Strings",
    topicTags: ["strings"],
    acceptance: "88.4%",
    isPaidOnly: false,
    externalUrl: "https://codeforces.com/problemset/problem/71/A",
  },
];
