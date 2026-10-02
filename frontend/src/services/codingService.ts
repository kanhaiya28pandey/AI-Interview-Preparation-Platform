import api from "@/lib/api";
import { mockCodingProblems, CodingProblem, ExecutionResult } from "@/mocks/codingData";
import { SEED_CODING_PROBLEMS } from "@/mocks/taxonomyCodingSeed";
import { executeJSInSandbox } from "@/lib/jsExecutionEngine";
import { contentManagerService } from "./contentManagerService";

export const codingService = {
  async getProblems(): Promise<CodingProblem[]> {
    const list = [...mockCodingProblems];
    SEED_CODING_PROBLEMS.forEach((sp) => {
      if (!list.some((item) => item.id === sp.id)) {
        list.push(sp);
      }
    });
    try {
      const response = await api.get<CodingProblem[]>("/api/v1/coding/problems");
      if (response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn("Could not fetch problems from backend, using local dataset", err);
    }

    try {
      const published = await contentManagerService.getPublishedContent("CODING_PROBLEM");
      const dynamicProblems: CodingProblem[] = published.map((item) => ({
        id: item.id,
        title: item.title,
        difficulty: (item.difficulty as any) || "Medium",
        category: item.subject,
        acceptance: "76%",
        description: item.contentData?.statement || item.description,
        inputFormat: item.contentData?.inputFormat || "Standard input format",
        outputFormat: item.contentData?.outputFormat || "Standard output format",
        constraints: item.contentData?.constraints ? item.contentData.constraints.split("\n") : ["1 <= N <= 10^5"],
        examples: item.contentData?.testCases
          ? item.contentData.testCases
              .filter((tc: any) => !tc.isHidden)
              .map((tc: any, i: number) => ({
                input: tc.inputStr,
                output: tc.expectedStr,
                explanation: "Automated sample test case",
              }))
          : [],
        starterCode: {
          javascript: item.contentData?.starterCode?.javascript || "function solve() {}",
          python: item.contentData?.starterCode?.python || "# Implementation here\ndef solve(): pass",
          java: item.contentData?.starterCode?.java || "class Solution { public void solve() {} }",
          cpp: item.contentData?.starterCode?.cpp || "void solve() {}",
        },
        fnName: "solve",
        xpReward: 50,
        hints: item.contentData?.hints || ["Analyze time complexity"],
        solution: {
          code: {
            javascript: "function solve() {}",
            python: "def solve(): pass",
            java: "class Solution {}",
            cpp: "void solve() {}",
          },
          explanation: item.contentData?.editorial || "Optimal standard approach",
          timeComplexity: "O(N)",
          spaceComplexity: "O(1)",
        },
        testCases: item.contentData?.testCases
          ? item.contentData.testCases.map((tc: any, idx: number) => ({
              id: idx + 1,
              inputStr: tc.inputStr,
              expectedStr: tc.expectedStr,
              params: [tc.inputStr],
              expectedVal: tc.expectedStr,
            }))
          : [],
      }));

      const seenIds = new Set(list.map((p) => p.id));
      dynamicProblems.forEach((dp) => {
        if (!seenIds.has(dp.id)) {
          list.unshift(dp);
          seenIds.add(dp.id);
        }
      });
    } catch (e) {
      console.warn("Failed to merge published coding problems:", e);
    }

    return list;
  },

  async getProblemById(id: string): Promise<CodingProblem | undefined> {
    try {
      const response = await api.get<CodingProblem>(`/api/v1/coding/problems/${id}`);
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn("Could not fetch problem by id from backend, using local problem", err);
    }
    const problems = await this.getProblems();
    return problems.find((p) => p.id === id);
  },

  async runCode(problemId: string, language: string, code: string): Promise<ExecutionResult> {
    try {
      const response = await api.post<ExecutionResult>("/api/v1/coding/run", {
        problemId,
        language,
        code,
      });
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn("Backend code execution unavailable, falling back to local runner", err);
    }

    const problem = await this.getProblemById(problemId);
    if (!problem) {
      return {
        status: "RUNTIME_ERROR",
        runtimeMs: 0,
        memoryMb: 0,
        passedTests: 0,
        totalTests: 0,
        outputLogs: ["Problem not found"],
        testCaseResults: [],
        isSimulated: true,
      };
    }

    const result = await executeJSInSandbox(code, problem.fnName, problem.testCases);
    return {
      ...result,
      isSimulated: true,
    };
  },

  async submitCode(problemId: string, language: string, code: string): Promise<ExecutionResult> {
    try {
      const response = await api.post<ExecutionResult>("/api/v1/coding/submit", {
        problemId,
        language,
        code,
      });
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn("Backend code submission unavailable, falling back to local runner", err);
    }

    const problem = await this.getProblemById(problemId);
    if (!problem) {
      return {
        status: "RUNTIME_ERROR",
        runtimeMs: 0,
        memoryMb: 0,
        passedTests: 0,
        totalTests: 0,
        outputLogs: ["Problem not found"],
        testCaseResults: [],
        isSimulated: true,
      };
    }

    const result = await executeJSInSandbox(code, problem.fnName, problem.testCases);
    return {
      ...result,
      isSimulated: true,
    };
  },
};
