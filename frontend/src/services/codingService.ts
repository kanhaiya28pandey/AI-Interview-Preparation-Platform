import { mockCodingProblems, CodingProblem, ExecutionResult } from "@/mocks/codingData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const codingService = {
  async getProblems(): Promise<CodingProblem[]> {
    if (USE_MOCKS) {
      await delay(300);
      return [...mockCodingProblems];
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getProblemById(id: string): Promise<CodingProblem | undefined> {
    if (USE_MOCKS) {
      await delay(200);
      return mockCodingProblems.find((p) => p.id === id);
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async runCode(problemId: string, language: string, code: string): Promise<ExecutionResult> {
    if (USE_MOCKS) {
      await delay(600);
      return {
        status: "ACCEPTED",
        runtimeMs: Math.floor(Math.random() * 45) + 15,
        memoryMb: Math.floor(Math.random() * 8) + 38,
        passedTests: 3,
        totalTests: 3,
        outputLogs: [
          `Running test case 1... Passed`,
          `Running test case 2... Passed`,
          `Running test case 3... Passed`,
          `Execution Finished successfully.`,
        ],
      };
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async submitCode(problemId: string, language: string, code: string): Promise<ExecutionResult> {
    if (USE_MOCKS) {
      await delay(900);
      return {
        status: "ACCEPTED",
        runtimeMs: Math.floor(Math.random() * 30) + 20,
        memoryMb: Math.floor(Math.random() * 5) + 40,
        passedTests: 15,
        totalTests: 15,
        outputLogs: [
          `Accepted! All 15 automated test cases passed.`,
          `Performance: Faster than 94.2% of submissions in ${language.toUpperCase()}.`,
        ],
      };
    }
    throw new Error("Real backend endpoint not implemented");
  },
};
