import api from "@/lib/api";
import { mockCodingProblems, CodingProblem, ExecutionResult } from "@/mocks/codingData";
import { SEED_CODING_PROBLEMS } from "@/mocks/taxonomyCodingSeed";
import { executeJSInSandbox } from "@/lib/jsExecutionEngine";
import { contentManagerService } from "./contentManagerService";

export const codingService = {
  async getProblems(): Promise<CodingProblem[]> {
    const list: CodingProblem[] = [];
    const seenIds = new Set<string>();

    const addProblem = (p: CodingProblem, prepend: boolean = false) => {
      if (!p || !p.id || seenIds.has(p.id)) return;
      seenIds.add(p.id);
      const safeProblem: CodingProblem = {
        ...p,
        starterCode: {
          javascript: p.starterCode?.javascript || "// Write your solution here\nfunction solve(input) {\n  return input;\n}",
          python: p.starterCode?.python || "# Write your solution here\ndef solve(input):\n  return input\n",
          java: p.starterCode?.java || "class Solution {\n  public static Object solve(Object input) {\n    return input;\n  }\n}",
          cpp: p.starterCode?.cpp || "#include <iostream>\nusing namespace std;\n\nint solve(int input) {\n  return input;\n}",
        },
      };
      if (prepend) {
        list.unshift(safeProblem);
      } else {
        list.push(safeProblem);
      }
    };

    // 1. Merge dynamic published coding tests and problems from Content Manager
    try {
      const [publishedProblems, publishedTests] = await Promise.allSettled([
        contentManagerService.getPublishedContent("CODING_PROBLEM"),
        contentManagerService.getPublishedContent("CODING_TEST"),
      ]);

      const published = [
        ...(publishedProblems.status === "fulfilled" ? publishedProblems.value : []),
        ...(publishedTests.status === "fulfilled" ? publishedTests.value : []),
      ];

      published.forEach((item) => {
        addProblem(
          {
            id: item.id,
            title: item.title,
            difficulty: (item.difficulty as any) || "Medium",
            category: item.subject || "Algorithms",
            acceptance: "76%",
            description: item.contentData?.statement || item.description || "Coding challenge problem statement",
            inputFormat: item.contentData?.inputFormat || "Standard input format",
            outputFormat: item.contentData?.outputFormat || "Standard output format",
            constraints: item.contentData?.constraints ? item.contentData.constraints.split("\n") : ["1 <= N <= 10^5"],
            examples: item.contentData?.testCases
              ? item.contentData.testCases
                  .filter((tc: any) => !tc.isHidden)
                  .map((tc: any) => ({
                    input: tc.inputStr,
                    output: tc.expectedStr,
                    explanation: "Automated sample test case",
                  }))
              : [{ input: "Sample input", output: "Sample output" }],
            starterCode: {
              javascript: item.contentData?.starterCode?.javascript || "// Write your solution here\nfunction solve(input) {\n  return input;\n}",
              python: item.contentData?.starterCode?.python || "# Write your solution here\ndef solve(input):\n  return input\n",
              java: item.contentData?.starterCode?.java || "class Solution {\n  public static Object solve(Object input) {\n    return input;\n  }\n}",
              cpp: item.contentData?.starterCode?.cpp || "int solve(int input) {\n  return input;\n}",
            },
            fnName: "solve",
            xpReward: 50,
            hints: item.contentData?.hints || ["Analyze time complexity", "Consider edge cases"],
            solution: {
              code: {
                javascript: "function solve(input) { return input; }",
                python: "def solve(input):\n  return input",
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
              : [{ id: 1, inputStr: "1", expectedStr: "1", params: [1], expectedVal: 1 }],
          },
          true
        );
      });
    } catch (e) {
      console.warn("Failed to fetch published coding problems:", e);
    }

    // 2. Fetch problems from backend API
    try {
      const response = await api.get<CodingProblem[]>("/api/v1/coding/problems");
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((p) => addProblem(p));
      }
    } catch (err) {
      console.warn("Could not fetch problems from backend, using local dataset", err);
    }

    // 3. Fallback only if no problems could be fetched from backend or content manager
    if (list.length === 0) {
      mockCodingProblems.forEach((mp) => addProblem(mp));
      SEED_CODING_PROBLEMS.forEach((sp) => addProblem(sp));
    }

    return list;
  },

  async getProblemById(id: string): Promise<CodingProblem | undefined> {
    try {
      const response = await api.get<CodingProblem>(`/api/v1/coding/problems/${id}`);
      if (response.data) {
        const p = response.data;
        return {
          ...p,
          starterCode: {
            javascript: p.starterCode?.javascript || "// Write your solution here\nfunction solve(input) {\n  return input;\n}",
            python: p.starterCode?.python || "# Write your solution here\ndef solve(input):\n  return input\n",
            java: p.starterCode?.java || "class Solution {\n  public static Object solve(Object input) {\n    return input;\n  }\n}",
            cpp: p.starterCode?.cpp || "#include <iostream>\nusing namespace std;\n\nint solve(int input) {\n  return input;\n}",
          },
        };
      }
    } catch (err) {
      console.warn("Could not fetch problem by id from backend, searching unified problem list", err);
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
