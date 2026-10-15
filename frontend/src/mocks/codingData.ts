export interface TestCase {
  id: number;
  inputStr: string;
  expectedStr: string;
  params: any[];
  expectedVal: any;
}

export interface TestCaseResult {
  id: number;
  inputStr: string;
  expectedStr: string;
  actualStr: string;
  passed: boolean;
  error?: string;
  runtimeMs: number;
  logs?: string[];
}

export interface ProblemSolution {
  code: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  acceptance: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
    c?: string;
    mysql?: string;
    postgresql?: string;
    sql?: string;
  };
  fnName: string;
  xpReward: number;
  testCases: TestCase[];
  hints: string[];
  solution: ProblemSolution;
}

export interface ExecutionResult {
  status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "COMPILE_ERROR" | "RUNTIME_ERROR";
  runtimeMs: number;
  memoryMb: number;
  passedTests: number;
  totalTests: number;
  outputLogs: string[];
  errorMessage?: string;
  errorLineNumber?: number;
  testCaseResults?: TestCaseResult[];
  isSimulated?: boolean;
  hasNestedLoopsAdvisory?: boolean;
}

export const DIFFICULTY_XP = {
  Easy: 50,
  Medium: 100,
  Hard: 200,
};

export const mockCodingProblems: CodingProblem[] = [];
