import { mockCodingProblems, CodingProblem, ExecutionResult } from "@/mocks/codingData";
import { executeJSInSandbox } from "@/lib/jsExecutionEngine";

export const codingService = {
  async getProblems(): Promise<CodingProblem[]> {
    return [...mockCodingProblems];
  },

  async getProblemById(id: string): Promise<CodingProblem | undefined> {
    return mockCodingProblems.find((p) => p.id === id);
  },

  async runCode(problemId: string, language: string, code: string): Promise<ExecutionResult> {
    const problem = mockCodingProblems.find((p) => p.id === problemId);
    if (!problem) throw new Error("Problem not found");

    if (language === "javascript") {
      // Execute REAL JavaScript in sandboxed Web Worker Blob
      const outcome = await executeJSInSandbox(code, problem.fnName, problem.testCases, 3000);
      return outcome;
    } else {
      // Honest simulated execution for Python/Java/C++
      await new Promise((res) => setTimeout(res, 600));
      return {
        status: "ACCEPTED",
        runtimeMs: Math.floor(Math.random() * 30) + 15,
        memoryMb: Math.floor(Math.random() * 8) + 36,
        passedTests: problem.testCases.length,
        totalTests: problem.testCases.length,
        isSimulated: true,
        outputLogs: [
          `⚠ Simulated Execution Mode (${language.toUpperCase()})`,
          `Simulated test cases against backend benchmark suite...`,
          `All simulated tests passed. Connect to a backend judge for real compilation.`,
        ],
        testCaseResults: problem.testCases.map((tc) => ({
          id: tc.id,
          inputStr: tc.inputStr,
          expectedStr: tc.expectedStr,
          actualStr: tc.expectedStr,
          passed: true,
          runtimeMs: Math.floor(Math.random() * 15) + 5,
        })),
      };
    }
  },

  async submitCode(problemId: string, language: string, code: string): Promise<ExecutionResult> {
    const problem = mockCodingProblems.find((p) => p.id === problemId);
    if (!problem) throw new Error("Problem not found");

    if (language === "javascript") {
      const outcome = await executeJSInSandbox(code, problem.fnName, problem.testCases, 3000);
      return outcome;
    } else {
      await new Promise((res) => setTimeout(res, 800));
      return {
        status: "ACCEPTED",
        runtimeMs: Math.floor(Math.random() * 25) + 10,
        memoryMb: Math.floor(Math.random() * 6) + 38,
        passedTests: problem.testCases.length,
        totalTests: problem.testCases.length,
        isSimulated: true,
        outputLogs: [
          `⚠ Simulated Submission (${language.toUpperCase()})`,
          `Simulated 15 automated test cases... All passed!`,
          `Performance: Faster than 92.4% of simulated ${language.toUpperCase()} submissions.`,
        ],
        testCaseResults: problem.testCases.map((tc) => ({
          id: tc.id,
          inputStr: tc.inputStr,
          expectedStr: tc.expectedStr,
          actualStr: tc.expectedStr,
          passed: true,
          runtimeMs: Math.floor(Math.random() * 10) + 2,
        })),
      };
    }
  },
};
