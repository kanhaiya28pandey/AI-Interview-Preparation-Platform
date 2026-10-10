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
  };
  sampleTestCases: { input: string; output: string; explanation?: string }[];
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
  allowedLanguages: string[];
  registeredParticipantsCount: number;
  proctoringEnabled: boolean;
  maxTabSwitchesAllowed: number;
  broadcasts: { id: string; message: string; timestamp: string }[];
  problems: LiveTestProblem[];
}

const STORAGE_KEY = "ai_interview_prep_live_tests_v2";

const SEED_LIVE_TESTS: LiveTestContest[] = [
  {
    id: "live-test-01",
    title: "Java & DSA National Placement Arena #42",
    category: "Data Structures & Algorithms",
    description: "Real-time competitive coding challenge featuring advanced two-pointer, dynamic programming, and graph traversal problems with strict runtime limits and proctored tab-switch monitoring.",
    status: "Live",
    scheduledStartTime: new Date().toISOString(),
    durationMinutes: 45,
    totalQuestions: 2,
    allowedLanguages: ["JavaScript", "Python", "Java", "C++"],
    registeredParticipantsCount: 148,
    proctoringEnabled: true,
    maxTabSwitchesAllowed: 3,
    broadcasts: [
      {
        id: "bc-1",
        message: "Test is officially LIVE! Remember to test edge cases with negative inputs.",
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
    ],
    problems: [
      {
        id: "prob-01",
        title: "Subarray Sum Equals K",
        difficulty: "Medium",
        points: 50,
        timeEstimateMins: 20,
        description: "Given an array of integers `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals to `k`.\n\nYour algorithm should run in O(n) time complexity using optimal hashing.",
        constraints: [
          "1 <= nums.length <= 2 * 10^4",
          "-1000 <= nums[i] <= 1000",
          "-10^7 <= k <= 10^7",
        ],
        starterCode: {
          javascript: "function subarraySum(nums, k) {\n  // Write your solution here\n  let count = 0;\n  let sum = 0;\n  const map = new Map();\n  map.set(0, 1);\n  \n  for (let num of nums) {\n    sum += num;\n    if (map.has(sum - k)) {\n      count += map.get(sum - k);\n    }\n    map.set(sum, (map.get(sum) || 0) + 1);\n  }\n  return count;\n}",
          python: "def subarraySum(nums: list[int], k: int) -> int:\n    # Write your solution here\n    count = 0\n    sum_val = 0\n    seen = {0: 1}\n    for n in nums:\n        sum_val += n\n        if sum_val - k in seen:\n            count += seen[sum_val - k]\n        seen[sum_val] = seen.get(sum_val, 0) + 1\n    return count",
          java: "class Solution {\n    public int subarraySum(int[] nums, int k) {\n        // Write your solution here\n        int count = 0, sum = 0;\n        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();\n        map.put(0, 1);\n        for (int n : nums) {\n            sum += n;\n            if (map.containsKey(sum - k)) count += map.get(sum - k);\n            map.put(sum, map.getOrDefault(sum, 0) + 1);\n        }\n        return count;\n    }\n}",
          cpp: "#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    int subarraySum(std::vector<int>& nums, int k) {\n        // Write your solution here\n        int count = 0, sum = 0;\n        std::unordered_map<int, int> map;\n        map[0] = 1;\n        for (int n : nums) {\n            sum += n;\n            if (map.count(sum - k)) count += map[sum - k];\n            map[sum]++;\n        }\n        return count;\n    }\n};",
        },
        sampleTestCases: [
          { input: "nums = [1,1,1], k = 2", output: "2", explanation: "Subarrays [1,1] at index (0,1) and (1,2) sum to 2." },
          { input: "nums = [1,2,3], k = 3", output: "2", explanation: "Subarrays [1,2] and [3] sum to 3." },
        ],
      },
      {
        id: "prob-02",
        title: "Minimum Window Substring",
        difficulty: "Hard",
        points: 100,
        timeEstimateMins: 25,
        description: "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
        constraints: [
          "m == s.length, n == t.length",
          "1 <= m, n <= 10^5",
          "s and t consist of uppercase and lowercase English letters.",
        ],
        starterCode: {
          javascript: "function minWindow(s, t) {\n  // Write your solution here\n  if (!s || !t) return \"\";\n  // Complete sliding window logic\n  return \"\";\n}",
          python: "def minWindow(s: str, t: str) -> str:\n    # Complete sliding window logic\n    return \"\"",
          java: "class Solution {\n    public String minWindow(String s, String t) {\n        // Complete sliding window logic\n        return \"\";\n    }\n}",
          cpp: "#include <string>\n\nclass Solution {\npublic:\n    std::string minWindow(std::string s, std::string t) {\n        // Complete sliding window logic\n        return \"\";\n    }\n};",
        },
        sampleTestCases: [
          { input: "s = \"ADOBECODEBANC\", t = \"ABC\"", output: "\"BANC\"", explanation: "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from string t." },
          { input: "s = \"a\", t = \"a\"", output: "\"a\"" },
        ],
      },
    ],
  },
  {
    id: "live-test-02",
    title: "Fullstack System Architecture Speed Contest #18",
    category: "System Design & Architecture",
    description: "High-concurrency caching, distributed rate limiting algorithms, and asynchronous event queue handling for modern web engineering candidates.",
    status: "Scheduled",
    scheduledStartTime: new Date(Date.now() + 18 * 3600 * 1000).toISOString(), // 18 hrs later
    durationMinutes: 60,
    totalQuestions: 3,
    allowedLanguages: ["JavaScript", "Python", "Java", "Go"],
    registeredParticipantsCount: 89,
    proctoringEnabled: true,
    maxTabSwitchesAllowed: 3,
    broadcasts: [],
    problems: [
      {
        id: "prob-sys-01",
        title: "Token Bucket Rate Limiter",
        difficulty: "Medium",
        points: 75,
        timeEstimateMins: 30,
        description: "Implement a thread-safe in-memory token bucket rate limiter with burst capability.",
        constraints: ["Max capacity: 1000 tokens", "Refill rate: 100 tokens/sec"],
        starterCode: {
          javascript: "class TokenBucketRateLimiter {\n  constructor(capacity, refillRatePerSec) {\n    this.capacity = capacity;\n    this.refillRate = refillRatePerSec;\n    this.tokens = capacity;\n    this.lastRefill = Date.now();\n  }\n\n  allowRequest(tokensRequired = 1) {\n    // Refill tokens and check capacity\n    return true;\n  }\n}",
          python: "class TokenBucketRateLimiter:\n    def __init__(self, capacity: int, refill_rate: float):\n        self.capacity = capacity\n        self.refill_rate = refill_rate\n\n    def allow_request(self, tokens: int = 1) -> bool:\n        return True",
          java: "public class TokenBucketRateLimiter {\n    public boolean allowRequest(int tokens) {\n        return true;\n    }\n}",
          cpp: "class TokenBucketRateLimiter {\npublic:\n    bool allowRequest(int tokens) {\n        return true;\n    }\n};",
        },
        sampleTestCases: [
          { input: "capacity = 10, refillRate = 2/sec, request 5 tokens", output: "true" },
        ],
      },
    ],
  },
];

class LiveTestService {
  private getStorage(): LiveTestContest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse live tests from storage", e);
    }
    // Seed default tests if not present
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

  public getAllTests(): LiveTestContest[] {
    return this.getStorage();
  }

  public getTestById(id: string): LiveTestContest | undefined {
    return this.getStorage().find((t) => t.id === id);
  }

  public getActiveOrScheduledTests(): LiveTestContest[] {
    return this.getStorage().filter((t) => t.status === "Live" || t.status === "Scheduled" || t.status === "Paused");
  }

  public updateTestStatus(id: string, status: LiveTestContest["status"]): void {
    const list = this.getStorage().map((t) => (t.id === id ? { ...t, status } : t));
    this.saveStorage(list);
  }

  public registerStudent(testId: string): void {
    const list = this.getStorage().map((t) =>
      t.id === testId ? { ...t, registeredParticipantsCount: t.registeredParticipantsCount + 1 } : t
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
      t.id === testId ? { ...t, broadcasts: [newBroadcast, ...t.broadcasts] } : t
    );
    this.saveStorage(list);
  }

  public createTest(test: Omit<LiveTestContest, "id">): LiveTestContest {
    const newTest: LiveTestContest = {
      ...test,
      id: `live-test-${Date.now()}`,
    };
    const list = [newTest, ...this.getStorage()];
    this.saveStorage(list);
    return newTest;
  }

  public deleteTest(id: string): void {
    const list = this.getStorage().filter((t) => t.id !== id);
    this.saveStorage(list);
  }
}

export const liveTestService = new LiveTestService();
