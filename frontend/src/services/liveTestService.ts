export type QuestionType = "MCQ" | "CODING";

export interface LiveTestOption {
  id: string; // "A" | "B" | "C" | "D"
  text: string;
}

export interface LiveTestQuestion {
  id: string;
  type: QuestionType;
  title: string;
  sectionTitle?: string;
  questionText: string;
  marks: number;
  negativeMarks?: number;
  category?: string; // "Aptitude" | "Core Engineering" | "Behavioral" | "Coding"

  // For MCQ questions
  options?: LiveTestOption[];
  correctOptionId?: string; // "A" | "B" | "C" | "D"
  explanation?: string;

  // For Coding questions
  difficulty?: "Easy" | "Medium" | "Hard";
  constraints?: string[];
  starterCode?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
    c?: string;
    sql?: string;
  };
  sampleTestCases?: { input: string; output: string; explanation?: string }[];
  hiddenTestCases?: { input: string; output: string; explanation?: string }[];
  source?: "LEETCODE" | "GFG" | "CODEFORCES" | "CUSTOM";
}

export interface LiveTestSection {
  id: string;
  title: string;
  type: "MCQ" | "CODING" | "MIXED";
  durationMinutes?: number;
  questions: LiveTestQuestion[];
}

export interface LiveTestProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  timeEstimateMins: number;
  description: string;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
    c?: string;
    sql?: string;
  };
  sampleTestCases: { input: string; output: string; explanation?: string }[];
}

export interface LiveTestSubmission {
  id: string;
  testId: string;
  testTitle?: string;
  userId: string;
  studentName: string;
  email: string;
  college: string;
  rollNumber: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank?: number;
  passed: boolean;
  timeTakenSeconds: number;
  submittedAt: string;
  submissionType: "NORMAL" | "AUTO_TAB_SWITCH" | "AUTO_RESIZE" | "AUTO_TIMEOUT";
  tabSwitchCount: number;
  resizeCount: number;
  answers: Record<
    string,
    {
      questionId: string;
      type: QuestionType;
      selectedOptionId?: string; // for MCQ
      code?: string; // for Coding
      language?: string; // for Coding
      passedTestCases?: number;
      totalTestCases?: number;
      isCorrect?: boolean;
      marksEarned: number;
    }
  >;
}

export interface LiveTestContest {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "Scheduled" | "Live" | "Paused" | "Completed" | "Cancelled";
  scheduledStartTime: string; // ISO string
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  allowedLanguages: string[];
  registeredParticipantsCount: number;
  proctoringEnabled: boolean;
  maxTabSwitchesAllowed: number; // default 2 warnings, 3rd triggers auto-submit
  maxWindowResizeAllowed: number; // default 2 warnings, 3rd triggers auto-submit
  broadcasts: { id: string; message: string; timestamp: string }[];
  sections: LiveTestSection[];
  // Backward compatibility alias for legacy components:
  problems: LiveTestProblem[];
}

const STORAGE_KEY = "ai_interview_prep_live_tests_v4";
const SUBMISSIONS_KEY = "ai_interview_prep_live_test_submissions_v4";

// Helper to convert rich sections into legacy flat problems array for backward compatibility
function buildProblemsFromSections(sections: LiveTestSection[]): LiveTestProblem[] {
  const problems: LiveTestProblem[] = [];
  sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      if (q.type === "CODING") {
        problems.push({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty || "Medium",
          points: q.marks,
          timeEstimateMins: 20,
          description: q.questionText,
          constraints: q.constraints || ["1 <= N <= 10^5"],
          starterCode: {
            javascript: q.starterCode?.javascript || "// Solution\nfunction solve(input) {\n  return input;\n}",
            python: q.starterCode?.python || "# Solution\ndef solve(input):\n  return input",
            java: q.starterCode?.java || "class Solution {\n  public static Object solve(Object input) {\n    return input;\n  }\n}",
            cpp: q.starterCode?.cpp || "int solve(int input) {\n  return input;\n}",
          },
          sampleTestCases: q.sampleTestCases || [{ input: "sample", output: "sample" }],
        });
      }
    });
  });
  return problems;
}

const SEED_LIVE_TESTS: LiveTestContest[] = [
  {
    id: "live-test-01",
    title: "National Grand Placement Challenge 2026 (TCS / Infosys / Wipro)",
    category: "Full-Stack + Aptitude + Coding",
    description: "All-in-one national pre-placement benchmark featuring quantitative reasoning, logical deduction, CS fundamentals, and two proctored coding arena challenges. Monitored with tab-switch limits and fullscreen enforcement.",
    status: "Live",
    scheduledStartTime: new Date().toISOString(),
    durationMinutes: 60,
    totalQuestions: 10,
    totalMarks: 100,
    passingMarks: 60,
    allowedLanguages: ["JavaScript", "Python", "Java", "C++", "C"],
    registeredParticipantsCount: 342,
    proctoringEnabled: true,
    maxTabSwitchesAllowed: 3,
    maxWindowResizeAllowed: 3,
    broadcasts: [
      {
        id: "bc-1",
        message: "Contest is LIVE! Section 1 (Aptitude) has no negative marking. Section 3 (Coding) has test cases.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
    sections: [
      {
        id: "sec-aptitude",
        title: "Section 1: Quantitative & Reasoning Aptitude",
        type: "MCQ",
        questions: [
          {
            id: "q-apt-1",
            type: "MCQ",
            title: "Time & Work Calculation",
            sectionTitle: "Quantitative Aptitude",
            questionText: "A can complete a piece of work in 12 days, and B can complete the same work in 18 days. If they work together for 4 days, what fraction of the total work remains unfinished?",
            marks: 5,
            negativeMarks: 1,
            category: "Aptitude",
            options: [
              { id: "A", text: "5/9" },
              { id: "B", text: "4/9" },
              { id: "C", text: "7/18" },
              { id: "D", text: "1/3" },
            ],
            correctOptionId: "B",
            explanation: "A's 1-day work = 1/12, B's 1-day work = 1/18.\nCombined 1-day work = (1/12) + (1/18) = 5/36.\nWork done in 4 days = 4 * (5/36) = 20/36 = 5/9.\nRemaining work = 1 - 5/9 = 4/9.",
          },
          {
            id: "q-apt-2",
            type: "MCQ",
            title: "Probability & Dice",
            sectionTitle: "Quantitative Aptitude",
            questionText: "Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on top is a prime number?",
            marks: 5,
            negativeMarks: 1,
            category: "Aptitude",
            options: [
              { id: "A", text: "7/18" },
              { id: "B", text: "5/12" },
              { id: "C", text: "15/36" },
              { id: "D", text: "1/2" },
            ],
            correctOptionId: "C",
            explanation: "Total outcomes = 36. Prime sums possible are 2, 3, 5, 7, 11.\nSum 2: (1,1) [1]\nSum 3: (1,2),(2,1) [2]\nSum 5: (1,4),(2,3),(3,2),(4,1) [4]\nSum 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) [6]\nSum 11: (5,6),(6,5) [2]\nTotal favorable outcomes = 1+2+4+6+2 = 15.\nProbability = 15/36 = 5/12.",
          },
          {
            id: "q-apt-3",
            type: "MCQ",
            title: "Logical Syllogisms",
            sectionTitle: "Logical Reasoning",
            questionText: "Statements:\n1. All engineers are problem solvers.\n2. Some problem solvers are programmers.\n\nConclusions:\nI. Some engineers are programmers.\nII. Some problem solvers are engineers.",
            marks: 5,
            negativeMarks: 1,
            category: "Aptitude",
            options: [
              { id: "A", text: "Only Conclusion I follows" },
              { id: "B", text: "Only Conclusion II follows" },
              { id: "C", text: "Both I and II follow" },
              { id: "D", text: "Neither follows" },
            ],
            correctOptionId: "B",
            explanation: "All engineers are problem solvers, so the set of engineers is contained within problem solvers. Therefore, some problem solvers are definitely engineers (Conclusion II follows). However, there is no direct link establishing that engineers must be programmers (Conclusion I does not necessarily follow).",
          },
          {
            id: "q-apt-4",
            type: "MCQ",
            title: "Data Interpretation (Percentage Growth)",
            sectionTitle: "Quantitative Aptitude",
            questionText: "A tech startup's revenue grew from $2.4 million in 2024 to $3.6 million in 2025. If operating costs remained constant at $1.2 million, by what percentage did their net profit increase?",
            marks: 5,
            negativeMarks: 1,
            category: "Aptitude",
            options: [
              { id: "A", text: "50%" },
              { id: "B", text: "100%" },
              { id: "C", text: "75%" },
              { id: "D", text: "120%" },
            ],
            correctOptionId: "B",
            explanation: "2024 Net Profit = $2.4M - $1.2M = $1.2M.\n2025 Net Profit = $3.6M - $1.2M = $2.4M.\nProfit increase = $2.4M - $1.2M = $1.2M.\nPercentage increase = ($1.2M / $1.2M) * 100% = 100%.",
          },
          {
            id: "q-apt-5",
            type: "MCQ",
            title: "Speed, Distance & Relative Velocity",
            sectionTitle: "Quantitative Aptitude",
            questionText: "Two trains of lengths 120m and 180m are running on parallel tracks in opposite directions with speeds of 54 km/h and 36 km/h respectively. In how many seconds will they completely cross each other?",
            marks: 5,
            negativeMarks: 1,
            category: "Aptitude",
            options: [
              { id: "A", text: "10 seconds" },
              { id: "B", text: "12 seconds" },
              { id: "C", text: "15 seconds" },
              { id: "D", text: "18 seconds" },
            ],
            correctOptionId: "B",
            explanation: "Total distance to cover = 120m + 180m = 300m.\nRelative speed = 54 + 36 = 90 km/h = 90 * (5/18) = 25 m/s.\nTime taken = 300 / 25 = 12 seconds.",
          },
        ],
      },
      {
        id: "sec-tech",
        title: "Section 2: Core Engineering & CS Fundamentals",
        type: "MCQ",
        questions: [
          {
            id: "q-tech-1",
            type: "MCQ",
            title: "Database Indexing & B-Trees",
            sectionTitle: "Core Engineering",
            questionText: "Why are B+ Trees preferred over Binary Search Trees or B-Trees for database index implementation on disk storage?",
            marks: 5,
            negativeMarks: 1,
            category: "Core Engineering",
            options: [
              { id: "A", text: "All data pointers are stored only in leaf nodes, maximizing branch node fan-out and reducing disk I/O depth" },
              { id: "B", text: "B+ Trees have O(1) worst-case search complexity" },
              { id: "C", text: "B+ Trees consume significantly less main memory than Red-Black trees" },
              { id: "D", text: "B+ Trees automatically eliminate the need for ACID transaction logs" },
            ],
            correctOptionId: "A",
            explanation: "In a B+ Tree, non-leaf nodes contain only keys and child pointers, maximizing node fan-out. This keeps tree height small (typically 3-4 levels for billions of records) and minimizes disk block reads. Linked leaf nodes also enable high-speed range scans.",
          },
          {
            id: "q-tech-2",
            type: "MCQ",
            title: "Operating Systems (Deadlock Conditions)",
            sectionTitle: "Core Engineering",
            questionText: "Which of the following conditions is NOT one of Coffman's four necessary conditions for a deadlock to occur in an operating system?",
            marks: 5,
            negativeMarks: 1,
            category: "Core Engineering",
            options: [
              { id: "A", text: "Mutual Exclusion" },
              { id: "B", text: "Hold and Wait" },
              { id: "C", text: "Preemption Allowed" },
              { id: "D", text: "Circular Wait" },
            ],
            correctOptionId: "C",
            explanation: "The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption (resources cannot be preempted), and 4. Circular Wait. 'Preemption Allowed' actually prevents deadlocks.",
          },
          {
            id: "q-tech-3",
            type: "MCQ",
            title: "Computer Networks (TCP 3-Way Handshake)",
            sectionTitle: "Core Engineering",
            questionText: "During the standard TCP 3-way handshake connection establishment, what flags are set in the second segment sent from the server to the client?",
            marks: 5,
            negativeMarks: 1,
            category: "Core Engineering",
            options: [
              { id: "A", text: "SYN only" },
              { id: "B", text: "ACK only" },
              { id: "C", text: "SYN + ACK" },
              { id: "D", text: "FIN + ACK" },
            ],
            correctOptionId: "C",
            explanation: "Step 1: Client sends SYN. Step 2: Server responds with SYN + ACK (synchronizing its own sequence number while acknowledging the client's). Step 3: Client sends ACK.",
          },
        ],
      },
      {
        id: "sec-coding",
        title: "Section 3: Practical Coding Arena",
        type: "CODING",
        questions: [
          {
            id: "q-code-1",
            type: "CODING",
            title: "Two Sum Target Pair",
            sectionTitle: "Coding Arena",
            difficulty: "Easy",
            marks: 30,
            category: "Coding",
            source: "LEETCODE",
            questionText: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
            constraints: [
              "2 <= nums.length <= 10^4",
              "-10^9 <= nums[i] <= 10^9",
              "-10^9 <= target <= 10^9",
              "Only one valid answer exists.",
            ],
            starterCode: {
              javascript: "function twoSum(nums, target) {\n  // Write your code here\n  \n}",
              python: "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass",
              java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}",
              cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};",
              c: "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    return 0;\n}",
            },
            sampleTestCases: [
              { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9, so return [0, 1]." },
              { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
            ],
            hiddenTestCases: [
              { input: "nums = [3,3], target = 6", output: "[0,1]" },
            ],
          },
          {
            id: "q-code-2",
            type: "CODING",
            title: "Valid Parentheses String",
            sectionTitle: "Coding Arena",
            difficulty: "Medium",
            marks: 30,
            category: "Coding",
            source: "LEETCODE",
            questionText: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
            constraints: [
              "1 <= s.length <= 10^4",
              "s consists of parentheses only '()[]{}'.",
            ],
            starterCode: {
              javascript: "function isValid(s) {\n  // Write your code here\n  \n}",
              python: "def isValid(s: str) -> bool:\n    # Write your code here\n    pass",
              java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        \n    }\n}",
              cpp: "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        \n    }\n};",
              c: "bool isValid(char* s) {\n    // Write your code here\n    return false;\n}",
            },
            sampleTestCases: [
              { input: "s = \"()\"", output: "true" },
              { input: "s = \"()[]{}\"", output: "true" },
              { input: "s = \"(]\"", output: "false" },
            ],
            hiddenTestCases: [
              { input: "s = \"{[]}\"", output: "true" },
            ],
          },
        ],
      },
    ],
    problems: [],
  },
  {
    id: "live-test-02",
    title: "Amazon & Google SDE-1 Speed Sprint #14",
    category: "Data Structures & High Scale Architecture",
    description: "High-concurrency rate limiting, dynamic programming, and sliding window challenges with strict runtime benchmarks.",
    status: "Live",
    scheduledStartTime: new Date().toISOString(),
    durationMinutes: 45,
    totalQuestions: 3,
    totalMarks: 60,
    passingMarks: 40,
    allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
    registeredParticipantsCount: 184,
    proctoringEnabled: true,
    maxTabSwitchesAllowed: 3,
    maxWindowResizeAllowed: 3,
    broadcasts: [],
    sections: [
      {
        id: "sec-sde-code",
        title: "Section 1: Algorithmic DSA Sprint",
        type: "CODING",
        questions: [
          {
            id: "q-sde-1",
            type: "CODING",
            title: "Subarray Sum Equals K",
            difficulty: "Medium",
            marks: 30,
            category: "Coding",
            source: "LEETCODE",
            questionText: "Given an array of integers `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals to `k`.\n\nYour algorithm should run in O(n) time complexity using optimal hash map prefix sums.",
            constraints: [
              "1 <= nums.length <= 2 * 10^4",
              "-1000 <= nums[i] <= 1000",
              "-10^7 <= k <= 10^7",
            ],
            starterCode: {
              javascript: "function subarraySum(nums, k) {\n  // Write your code here\n  \n}",
              python: "def subarraySum(nums: list[int], k: int) -> int:\n    # Write your code here\n    pass",
              java: "class Solution {\n    public int subarraySum(int[] nums, int k) {\n        // Write your code here\n        \n    }\n}",
              cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        // Write your code here\n        \n    }\n};",
            },
            sampleTestCases: [
              { input: "nums = [1,1,1], k = 2", output: "2", explanation: "[1,1] at (0,1) and (1,2) sum to 2." },
              { input: "nums = [1,2,3], k = 3", output: "2" },
            ],
          },
          {
            id: "q-sde-2",
            type: "CODING",
            title: "Token Bucket Rate Limiter",
            difficulty: "Medium",
            marks: 30,
            category: "Coding",
            source: "CUSTOM",
            questionText: "Implement a thread-safe token bucket rate limiter logic that allows or rejects API requests based on capacity and refill rate per second.",
            constraints: ["Max capacity: 1000 tokens", "Refill rate: 100 tokens/sec"],
            starterCode: {
              javascript: "function allowRequest(tokens, capacity, refillRate) {\n  // Write your code here\n  return true;\n}",
              python: "def allowRequest(tokens: int, capacity: int, refillRate: float) -> bool:\n    return True",
              java: "class Solution {\n    public boolean allowRequest(int tokens, int capacity, double refillRate) {\n        return true;\n    }\n}",
              cpp: "bool allowRequest(int tokens, int capacity, double refillRate) {\n    return true;\n}",
            },
            sampleTestCases: [
              { input: "tokens = 1, capacity = 10, refillRate = 2.0", output: "true" },
            ],
          },
        ],
      },
    ],
    problems: [],
  },
  {
    id: "live-test-03",
    title: "Accenture & Capgemini Mega Hiring Test",
    category: "Aptitude + Technical + Coding",
    description: "Multi-round simulated national eligibility test. Fast-paced logical aptitude followed by core coding challenges.",
    status: "Scheduled",
    scheduledStartTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    durationMinutes: 90,
    totalQuestions: 12,
    totalMarks: 120,
    passingMarks: 70,
    allowedLanguages: ["JavaScript", "Python", "Java", "C++", "C"],
    registeredParticipantsCount: 420,
    proctoringEnabled: true,
    maxTabSwitchesAllowed: 3,
    maxWindowResizeAllowed: 3,
    broadcasts: [],
    sections: [
      {
        id: "sec-acc-apt",
        title: "Section 1: Quantitative & Critical Thinking",
        type: "MCQ",
        questions: [
          {
            id: "acc-apt-1",
            type: "MCQ",
            title: "Number Series Pattern",
            questionText: "Find the next number in the sequence: 4, 18, 48, 100, 180, ?",
            marks: 5,
            negativeMarks: 1,
            category: "Aptitude",
            options: [
              { id: "A", text: "254" },
              { id: "B", text: "294" },
              { id: "C", text: "312" },
              { id: "D", text: "280" },
            ],
            correctOptionId: "B",
            explanation: "Pattern: n^3 - n^2:\n2^3 - 2^2 = 8 - 4 = 4\n3^3 - 3^2 = 27 - 9 = 18\n4^3 - 4^2 = 64 - 16 = 48\n5^3 - 5^2 = 125 - 25 = 100\n6^3 - 6^2 = 216 - 36 = 180\n7^3 - 7^2 = 343 - 49 = 294.",
          },
        ],
      },
    ],
    problems: [],
  },
  {
    id: "live-test-04",
    title: "Cognizant GenC Elevate Assessment (Completed)",
    category: "Full Stack & Algorithms",
    description: "Archived campus placement drive. Review your detailed scorecards, percentile breakdown, and explanations for MCQ questions.",
    status: "Completed",
    scheduledStartTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    durationMinutes: 60,
    totalQuestions: 4,
    totalMarks: 50,
    passingMarks: 30,
    allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
    registeredParticipantsCount: 290,
    proctoringEnabled: true,
    maxTabSwitchesAllowed: 3,
    maxWindowResizeAllowed: 3,
    broadcasts: [],
    sections: [
      {
        id: "sec-cogn-apt",
        title: "Section 1: Aptitude Review",
        type: "MCQ",
        questions: [
          {
            id: "cg-1",
            type: "MCQ",
            title: "Profit & Loss Calculation",
            questionText: "A merchant buys a gadget for $400 and sells it at a 25% profit. If customer tax is 10% on the selling price, what is the final price paid by the customer?",
            marks: 10,
            options: [
              { id: "A", text: "$500" },
              { id: "B", text: "$550" },
              { id: "C", text: "$525" },
              { id: "D", text: "$480" },
            ],
            correctOptionId: "B",
            explanation: "Selling price before tax = $400 * 1.25 = $500. Tax = 10% of $500 = $50. Total paid = $500 + $50 = $550.",
          },
          {
            id: "cg-2",
            type: "MCQ",
            title: "Data Structures Complexity",
            questionText: "What is the average time complexity of searching for an element in an unsorted hash table with good hashing?",
            marks: 10,
            options: [
              { id: "A", text: "O(1)" },
              { id: "B", text: "O(log n)" },
              { id: "C", text: "O(n)" },
              { id: "D", text: "O(n log n)" },
            ],
            correctOptionId: "A",
            explanation: "Hash table lookups average O(1) time when key collisions are minimized with a uniform hash distribution.",
          },
        ],
      },
      {
        id: "sec-cogn-code",
        title: "Section 2: Coding Assessment",
        type: "CODING",
        questions: [
          {
            id: "cg-code-1",
            type: "CODING",
            title: "Palindrome Number Checker",
            difficulty: "Easy",
            marks: 30,
            category: "Coding",
            questionText: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
            constraints: ["-2^31 <= x <= 2^31 - 1"],
            starterCode: {
              javascript: "function isPalindrome(x) {\n  return false;\n}",
              python: "def isPalindrome(x: int) -> bool:\n  return False",
              java: "class Solution {\n  public boolean isPalindrome(int x) {\n    return false;\n  }\n}",
              cpp: "bool isPalindrome(int x) {\n  return false;\n}",
            },
            sampleTestCases: [
              { input: "x = 121", output: "true" },
              { input: "x = -121", output: "false" },
            ],
          },
        ],
      },
    ],
    problems: [],
  },
];

// Attach legacy problems array for backward compatibility
SEED_LIVE_TESTS.forEach((t) => {
  t.problems = buildProblemsFromSections(t.sections);
});

// Seed demo submissions for completed test so student can review immediately
const SEED_SUBMISSIONS: LiveTestSubmission[] = [
  {
    id: "sub-seed-01",
    testId: "live-test-04",
    testTitle: "Cognizant GenC Elevate Assessment (Completed)",
    userId: "demo-student-id",
    studentName: "Demo Student",
    email: "student@interviewplatform.com",
    college: "Indian Institute of Technology",
    rollNumber: "CS-2026-042",
    score: 40,
    totalMarks: 50,
    percentage: 80,
    rank: 4,
    passed: true,
    timeTakenSeconds: 2150,
    submittedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    submissionType: "NORMAL",
    tabSwitchCount: 1,
    resizeCount: 0,
    answers: {
      "cg-1": {
        questionId: "cg-1",
        type: "MCQ",
        selectedOptionId: "B",
        isCorrect: true,
        marksEarned: 10,
      },
      "cg-2": {
        questionId: "cg-2",
        type: "MCQ",
        selectedOptionId: "A",
        isCorrect: true,
        marksEarned: 10,
      },
      "cg-code-1": {
        questionId: "cg-code-1",
        type: "CODING",
        code: "class Solution {\n  public boolean isPalindrome(int x) {\n    if (x < 0) return false;\n    int rev = 0, orig = x;\n    while (x > 0) {\n      rev = rev * 10 + (x % 10);\n      x /= 10;\n    }\n    return rev == orig;\n  }\n}",
        language: "java",
        passedTestCases: 2,
        totalTestCases: 2,
        marksEarned: 20,
      },
    },
  },
  {
    id: "sub-seed-02",
    testId: "live-test-04",
    testTitle: "Cognizant GenC Elevate Assessment (Completed)",
    userId: "cand-02",
    studentName: "Priya Sharma",
    email: "priya.s@nitk.ac.in",
    college: "NIT Karnataka",
    rollNumber: "EC-2026-108",
    score: 50,
    totalMarks: 50,
    percentage: 100,
    rank: 1,
    passed: true,
    timeTakenSeconds: 1820,
    submittedAt: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
    submissionType: "NORMAL",
    tabSwitchCount: 0,
    resizeCount: 0,
    answers: {},
  },
  {
    id: "sub-seed-03",
    testId: "live-test-04",
    testTitle: "Cognizant GenC Elevate Assessment (Completed)",
    userId: "cand-03",
    studentName: "Aditya Verma",
    email: "aditya.v@dtu.ac.in",
    college: "Delhi Technological University",
    rollNumber: "IT-2026-089",
    score: 45,
    totalMarks: 50,
    percentage: 90,
    rank: 2,
    passed: true,
    timeTakenSeconds: 1950,
    submittedAt: new Date(Date.now() - 41 * 3600 * 1000).toISOString(),
    submissionType: "NORMAL",
    tabSwitchCount: 0,
    resizeCount: 0,
    answers: {},
  },
  {
    id: "sub-seed-04",
    testId: "live-test-04",
    testTitle: "Cognizant GenC Elevate Assessment (Completed)",
    userId: "cand-04",
    studentName: "Sneha Patel",
    email: "sneha.p@bitts.ac.in",
    college: "BITS Pilani",
    rollNumber: "CS-2026-015",
    score: 42,
    totalMarks: 50,
    percentage: 84,
    rank: 3,
    passed: true,
    timeTakenSeconds: 2010,
    submittedAt: new Date(Date.now() - 41 * 3600 * 1000).toISOString(),
    submissionType: "NORMAL",
    tabSwitchCount: 1,
    resizeCount: 0,
    answers: {},
  },
  {
    id: "sub-seed-05",
    testId: "live-test-01",
    testTitle: "National Grand Placement Challenge 2026",
    userId: "cand-05",
    studentName: "Rohan Gupta",
    email: "rohan.g@iitb.ac.in",
    college: "IIT Bombay",
    rollNumber: "CS-2026-077",
    score: 95,
    totalMarks: 100,
    percentage: 95,
    rank: 1,
    passed: true,
    timeTakenSeconds: 3100,
    submittedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    submissionType: "NORMAL",
    tabSwitchCount: 0,
    resizeCount: 0,
    answers: {},
  },
  {
    id: "sub-seed-06",
    testId: "live-test-01",
    testTitle: "National Grand Placement Challenge 2026",
    userId: "cand-06",
    studentName: "Ananya Iyer",
    email: "ananya.i@iiit.ac.in",
    college: "IIIT Hyderabad",
    rollNumber: "CS-2026-144",
    score: 90,
    totalMarks: 100,
    percentage: 90,
    rank: 2,
    passed: true,
    timeTakenSeconds: 3250,
    submittedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    submissionType: "NORMAL",
    tabSwitchCount: 0,
    resizeCount: 0,
    answers: {},
  },
  {
    id: "sub-seed-07",
    testId: "live-test-01",
    testTitle: "National Grand Placement Challenge 2026",
    userId: "cand-07",
    studentName: "Vikram Malhotra",
    email: "vikram.m@nsut.ac.in",
    college: "NSUT Delhi",
    rollNumber: "CS-2026-210",
    score: 35,
    totalMarks: 100,
    percentage: 35,
    rank: 18,
    passed: false,
    timeTakenSeconds: 1200,
    submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    submissionType: "AUTO_TAB_SWITCH",
    tabSwitchCount: 3,
    resizeCount: 1,
    answers: {},
  },
];

class LiveTestService {
  private getStorage(): LiveTestContest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: LiveTestContest[] = JSON.parse(stored);
        parsed.forEach((t) => {
          if (!t.problems || t.problems.length === 0) {
            t.problems = buildProblemsFromSections(t.sections || []);
          }
        });
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse live tests from storage", e);
    }
    this.saveStorage(SEED_LIVE_TESTS);
    return SEED_LIVE_TESTS;
  }

  private saveStorage(tests: LiveTestContest[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
      window.dispatchEvent(new CustomEvent("live_tests_changed", { detail: tests }));
    } catch (e) {
      console.error("Failed to save live tests", e);
    }
  }

  private getSubmissionsStorage(): LiveTestSubmission[] {
    try {
      const stored = localStorage.getItem(SUBMISSIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse live test submissions", e);
    }
    this.saveSubmissionsStorage(SEED_SUBMISSIONS);
    return SEED_SUBMISSIONS;
  }

  private saveSubmissionsStorage(subs: LiveTestSubmission[]): void {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
      window.dispatchEvent(new CustomEvent("live_test_submissions_changed", { detail: subs }));
    } catch (e) {
      console.error("Failed to save submissions", e);
    }
  }

  public getAllTests(): LiveTestContest[] {
    return this.getStorage();
  }

  public getTestById(id: string): LiveTestContest | undefined {
    return this.getStorage().find((t) => t.id === id);
  }

  public getActiveOrScheduledTests(): LiveTestContest[] {
    return this.getStorage().filter(
      (t) => t.status === "Live" || t.status === "Scheduled" || t.status === "Paused"
    );
  }

  public flattenQuestions(test: LiveTestContest): LiveTestQuestion[] {
    const list: LiveTestQuestion[] = [];
    (test.sections || []).forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        list.push({ ...q, sectionTitle: sec.title });
      });
    });
    return list;
  }

  public updateTestStatus(id: string, status: LiveTestContest["status"]): void {
    const list = this.getStorage().map((t) => (t.id === id ? { ...t, status } : t));
    this.saveStorage(list);
  }

  public registerStudent(testId: string): void {
    const list = this.getStorage().map((t) =>
      t.id === testId ? { ...t, registeredParticipantsCount: (t.registeredParticipantsCount || 0) + 1 } : t
    );
    this.saveStorage(list);
  }

  public addBroadcast(testId: string, message: string): void {
    const newBroadcast = {
      id: `bc-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
    };
    const list = this.getStorage().map((t) =>
      t.id === testId ? { ...t, broadcasts: [newBroadcast, ...(t.broadcasts || [])] } : t
    );
    this.saveStorage(list);
  }

  public createTest(test: Omit<LiveTestContest, "id">): LiveTestContest {
    const newTest: LiveTestContest = {
      ...test,
      id: `live-test-${Date.now()}`,
      problems: buildProblemsFromSections(test.sections || []),
    };
    const list = [newTest, ...this.getStorage()];
    this.saveStorage(list);
    return newTest;
  }

  public updateTest(id: string, partial: Partial<LiveTestContest>): LiveTestContest | undefined {
    const list = this.getStorage().map((t) => {
      if (t.id === id) {
        const updated = { ...t, ...partial };
        if (partial.sections) {
          updated.problems = buildProblemsFromSections(partial.sections);
        }
        return updated;
      }
      return t;
    });
    this.saveStorage(list);
    return list.find((t) => t.id === id);
  }

  public deleteTest(id: string): void {
    const list = this.getStorage().filter((t) => t.id !== id);
    this.saveStorage(list);
  }

  // --- Submissions & Results Management ---
  public saveSubmission(submission: LiveTestSubmission): void {
    const current = this.getSubmissionsStorage();
    // Replace if existing or prepend
    const filtered = current.filter((s) => !(s.testId === submission.testId && (s.userId === submission.userId || s.email === submission.email)));
    const updated = [submission, ...filtered];
    this.saveSubmissionsStorage(updated);
  }

  public getSubmissionsForTest(testId: string): LiveTestSubmission[] {
    return this.getSubmissionsStorage()
      .filter((s) => s.testId === testId)
      .sort((a, b) => b.score - a.score || a.timeTakenSeconds - b.timeTakenSeconds);
  }

  public getStudentSubmission(testId: string, userIdentifier: string): LiveTestSubmission | undefined {
    const subs = this.getSubmissionsForTest(testId);
    return subs.find(
      (s) =>
        s.userId === userIdentifier ||
        s.email?.toLowerCase() === userIdentifier?.toLowerCase() ||
        s.studentName?.toLowerCase() === userIdentifier?.toLowerCase()
    );
  }

  public hasUserAttempted(testId: string, userIdentifier: string): boolean {
    return !!this.getStudentSubmission(testId, userIdentifier);
  }

  public getAllSubmissions(): LiveTestSubmission[] {
    return this.getSubmissionsStorage().sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  // Export questions to JSON
  public exportQuestionsJson(testId: string): void {
    const test = this.getTestById(testId);
    if (!test) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(test, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${test.title.replace(/[^a-z0-9]/gi, "_")}_Questions.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Export results to CSV
  public exportResultsCsv(testId: string): void {
    const test = this.getTestById(testId);
    const submissions = this.getSubmissionsForTest(testId);
    if (!test || submissions.length === 0) {
      alert("No submissions available to export for this test.");
      return;
    }

    const headers = [
      "Rank",
      "Candidate Name",
      "Roll Number",
      "College",
      "Email",
      "Score",
      "Total Marks",
      "Percentage",
      "Status",
      "Time Taken (Secs)",
      "Submission Type",
      "Tab Switch Warnings",
      "Resize Warnings",
      "Submitted At",
    ];

    const rows = submissions.map((s, idx) => [
      idx + 1,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.rollNumber}"`,
      `"${s.college.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      s.score,
      s.totalMarks,
      `${s.percentage.toFixed(1)}%`,
      s.passed ? "PASSED" : "FAILED",
      s.timeTakenSeconds,
      s.submissionType,
      s.tabSwitchCount,
      s.resizeCount,
      `"${new Date(s.submittedAt).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${test.title.replace(/[^a-z0-9]/gi, "_")}_Results_Report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

export const liveTestService = new LiveTestService();
