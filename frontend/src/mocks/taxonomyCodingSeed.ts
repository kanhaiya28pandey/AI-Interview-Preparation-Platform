import { CodingProblem } from "./codingData";

export interface SeedCodingProblem extends CodingProblem {
  domainSlug: string;
  topicSlug: string;
  source: "local-seed";
}

export const SEED_CODING_PROBLEMS: SeedCodingProblem[] = [
  // 1. Two Pointers / Arrays: Longest Mountain in Array
  {
    id: "seed-code-dsa-mountain",
    title: "Longest Mountain Peak Subarray",
    difficulty: "Medium",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    topicSlug: "arrays",
    acceptance: "68%",
    description: `Given an integer array \`arr\`, find the length of the longest subarray that forms a strict mountain.

A subarray is defined as a mountain if:
1. \`length >= 3\`
2. There exists some index \`i\` (with \`0 < i < length - 1\`) such that:
   \`arr[0] < arr[1] < ... < arr[i]\` AND \`arr[i] > arr[i+1] > ... > arr[length - 1]\`

Return the length of the longest mountain subarray. If no mountain exists, return \`0\`.`,
    inputFormat: "An array of integers `arr`.",
    outputFormat: "A single integer denoting the length of the longest mountain peak.",
    constraints: [
      "1 <= arr.length <= 10^5",
      "0 <= arr[i] <= 10^6",
    ],
    examples: [
      {
        input: "[2, 1, 4, 7, 3, 2, 5]",
        output: "5",
        explanation: "The largest mountain is [1, 4, 7, 3, 2] which has length 5.",
      },
      {
        input: "[2, 2, 2]",
        output: "0",
        explanation: "No strict peak exists in this array.",
      },
    ],
    starterCode: {
      javascript: `function longestMountain(arr) {
  // Your code here
  return 0;
}`,
      python: `def longestMountain(arr):
    # Your code here
    return 0`,
      java: `class Solution {
    public int longestMountain(int[] arr) {
        return 0;
    }
}`,
      cpp: `int longestMountain(vector<int>& arr) {
    return 0;
}`,
    },
    fnName: "longestMountain",
    xpReward: 60,
    hints: [
      "Identify all potential peak indices where arr[i-1] < arr[i] > arr[i+1].",
      "From each peak, expand left and right pointers while the slope decreases.",
      "Track the maximum window length (right - left + 1).",
    ],
    solution: {
      code: {
        javascript: `function longestMountain(arr) {
  const n = arr.length;
  let maxLen = 0;
  for (let i = 1; i < n - 1; i++) {
    if (arr[i] > arr[i - 1] && arr[i] > arr[i + 1]) {
      let l = i - 1;
      let r = i + 1;
      while (l > 0 && arr[l] > arr[l - 1]) l--;
      while (r < n - 1 && arr[r] > arr[r + 1]) r++;
      maxLen = Math.max(maxLen, r - l + 1);
    }
  }
  return maxLen;
}`,
        python: `def longestMountain(arr):
    n = len(arr)
    max_len = 0
    for i in range(1, n - 1):
        if arr[i] > arr[i - 1] and arr[i] > arr[i + 1]:
            l, r = i - 1, i + 1
            while l > 0 and arr[l] > arr[l - 1]:
                l -= 1
            while r < n - 1 and arr[r] > arr[r + 1]:
                r += 1
            max_len = max(max_len, r - l + 1)
    return max_len`,
        java: `class Solution {
    public int longestMountain(int[] arr) {
        int n = arr.length;
        int maxLen = 0;
        for (int i = 1; i < n - 1; i++) {
            if (arr[i] > arr[i - 1] && arr[i] > arr[i + 1]) {
                int l = i - 1;
                int r = i + 1;
                while (l > 0 && arr[l] > arr[l - 1]) l--;
                while (r < n - 1 && arr[r] > arr[r + 1]) r++;
                maxLen = Math.max(maxLen, r - l + 1);
            }
        }
        return maxLen;
    }
}`,
        cpp: `int longestMountain(vector<int>& arr) {
    int n = arr.size();
    int maxLen = 0;
    for (int i = 1; i < n - 1; i++) {
        if (arr[i] > arr[i - 1] && arr[i] > arr[i + 1]) {
            int l = i - 1, r = i + 1;
            while (l > 0 && arr[l] > arr[l - 1]) l--;
            while (r < n - 1 && arr[r] > arr[r + 1]) r++;
            maxLen = max(maxLen, r - l + 1);
        }
    }
    return maxLen;
}`,
      },
      explanation: "Identifying peaks first ensures we only expand when a valid summit is found, guaranteeing O(N) total checks.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    testCases: [
      { id: 1, params: [[2, 1, 4, 7, 3, 2, 5]], inputStr: "[2, 1, 4, 7, 3, 2, 5]", expectedVal: 5, expectedStr: "5" },
      { id: 2, params: [[2, 2, 2]], inputStr: "[2, 2, 2]", expectedVal: 0, expectedStr: "0" },
      { id: 3, params: [[0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0]], inputStr: "[0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0]", expectedVal: 11, expectedStr: "11" },
    ],
    source: "local-seed",
  },

  // 2. Binary Search: Kth Missing Positive Number
  {
    id: "seed-code-dsa-missing",
    title: "K-th Missing Positive in Monotonic Array",
    difficulty: "Easy",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    topicSlug: "binary-search",
    acceptance: "74%",
    description: `Given an array \`arr\` of positive integers sorted in strictly ascending order, and an integer \`k\`.

Find the \`k\`-th positive integer that is missing from this array.

Your algorithm should ideally run in logarithmic time O(log N).`,
    inputFormat: "A sorted integer array `arr` and integer `k`.",
    outputFormat: "The k-th missing positive integer.",
    constraints: [
      "1 <= arr.length <= 10^5",
      "1 <= arr[i] <= 10^6",
      "1 <= k <= 10^6",
    ],
    examples: [
      {
        input: "arr = [2, 3, 4, 7, 11], k = 5",
        output: "9",
        explanation: "The missing positive numbers are [1, 5, 6, 8, 9, 10, ...]. The 5th missing number is 9.",
      },
      {
        input: "arr = [1, 2, 3, 4], k = 2",
        output: "6",
        explanation: "Missing numbers are [5, 6, 7, ...]. The 2nd missing number is 6.",
      },
    ],
    starterCode: {
      javascript: `function findKthPositive(arr, k) {
  // Your code here
  return 0;
}`,
      python: `def findKthPositive(arr, k):
    # Your code here
    return 0`,
      java: `class Solution {
    public int findKthPositive(int[] arr, int k) {
        return 0;
    }
}`,
      cpp: `int findKthPositive(vector<int>& arr, int k) {
    return 0;
}`,
    },
    fnName: "findKthPositive",
    xpReward: 40,
    hints: [
      "At index mid, the number of missing integers before arr[mid] is arr[mid] - (mid + 1).",
      "Use binary search to locate the boundary where missing count is less than k.",
      "The result is left + k.",
    ],
    solution: {
      code: {
        javascript: `function findKthPositive(arr, k) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] - (mid + 1) < k) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return left + k;
}`,
        python: `def findKthPositive(arr, k):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] - (mid + 1) < k:
            left = mid + 1
        else:
            right = mid - 1
    return left + k`,
        java: `class Solution {
    public int findKthPositive(int[] arr, int k) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] - (mid + 1) < k) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return left + k;
    }
}`,
        cpp: `int findKthPositive(vector<int>& arr, int k) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] - (mid + 1) < k) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return left + k;
}`,
      },
      explanation: "Binary search on the count of missing numbers before index mid achieves optimal logarithmic runtime.",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(1)",
    },
    testCases: [
      { id: 1, params: [[2, 3, 4, 7, 11], 5], inputStr: "[2, 3, 4, 7, 11], 5", expectedVal: 9, expectedStr: "9" },
      { id: 2, params: [[1, 2, 3, 4], 2], inputStr: "[1, 2, 3, 4], 2", expectedVal: 6, expectedStr: "6" },
      { id: 3, params: [[5, 6, 7, 8, 9], 3], inputStr: "[5, 6, 7, 8, 9], 3", expectedVal: 3, expectedStr: "3" },
    ],
    source: "local-seed",
  },

  // 3. Dynamic Programming: Minimum Falling Path Sum
  {
    id: "seed-code-dsa-falling-path",
    title: "Minimum Matrix Falling Path",
    difficulty: "Medium",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    topicSlug: "dynamic-programming",
    acceptance: "65%",
    description: `Given an \`n x n\` array of integers \`matrix\`, return the minimum sum of any falling path through \`matrix\`.

A falling path starts at any element in the first row and chooses the element in the next row that is either directly below or diagonally left/right. Specifically, the next element from position \`(row, col)\` will be \`(row + 1, col - 1)\`, \`(row + 1, col)\`, or \`(row + 1, col + 1)\`.`,
    inputFormat: "An n x n 2D array of integers `matrix`.",
    outputFormat: "The minimum integer sum of any valid falling path.",
    constraints: [
      "n == matrix.length == matrix[i].length",
      "1 <= n <= 100",
      "-100 <= matrix[i][j] <= 100",
    ],
    examples: [
      {
        input: "[[2, 1, 3], [6, 5, 4], [7, 8, 9]]",
        output: "13",
        explanation: "The minimum path is 1 -> 5 -> 7 (or 1 -> 4 -> 8), total 13.",
      },
      {
        input: "[[-19, 57], [-40, -5]]",
        output: "-59",
        explanation: "Path is -19 -> -40 = -59.",
      },
    ],
    starterCode: {
      javascript: `function minFallingPathSum(matrix) {
  // Your code here
  return 0;
}`,
      python: `def minFallingPathSum(matrix):
    # Your code here
    return 0`,
      java: `class Solution {
    public int minFallingPathSum(int[][] matrix) {
        return 0;
    }
}`,
      cpp: `int minFallingPathSum(vector<vector<int>>& matrix) {
    return 0;
}`,
    },
    fnName: "minFallingPathSum",
    xpReward: 70,
    hints: [
      "Use bottom-up DP starting from row n-2 up to row 0.",
      "Each cell matrix[r][c] += min(matrix[r+1][c-1], matrix[r+1][c], matrix[r+1][c+1]) with boundary checks.",
      "Answer is the minimum of row 0.",
    ],
    solution: {
      code: {
        javascript: `function minFallingPathSum(matrix) {
  const n = matrix.length;
  const dp = matrix.map((row) => [...row]);
  for (let r = n - 2; r >= 0; r--) {
    for (let c = 0; c < n; c++) {
      let best = dp[r + 1][c];
      if (c > 0) best = Math.min(best, dp[r + 1][c - 1]);
      if (c < n - 1) best = Math.min(best, dp[r + 1][c + 1]);
      dp[r][c] += best;
    }
  }
  return Math.min(...dp[0]);
}`,
        python: `def minFallingPathSum(matrix):
    n = len(matrix)
    dp = [row[:] for row in matrix]
    for r in range(n - 2, -1, -1):
        for c in range(n):
            best = dp[r + 1][c]
            if c > 0:
                best = min(best, dp[r + 1][c - 1])
            if c < n - 1:
                best = min(best, dp[r + 1][c + 1])
            dp[r][c] += best
    return min(dp[0])`,
        java: `class Solution {
    public int minFallingPathSum(int[][] matrix) {
        int n = matrix.length;
        int[][] dp = new int[n][n];
        for (int i = 0; i < n; i++) dp[i] = matrix[i].clone();
        for (int r = n - 2; r >= 0; r--) {
            for (int c = 0; c < n; c++) {
                int best = dp[r + 1][c];
                if (c > 0) best = Math.min(best, dp[r + 1][c - 1]);
                if (c < n - 1) best = Math.min(best, dp[r + 1][c + 1]);
                dp[r][c] += best;
            }
        }
        int ans = Integer.MAX_VALUE;
        for (int val : dp[0]) ans = Math.min(ans, val);
        return ans;
    }
}`,
        cpp: `int minFallingPathSum(vector<vector<int>>& matrix) {
    int n = matrix.size();
    auto dp = matrix;
    for (int r = n - 2; r >= 0; r--) {
        for (int c = 0; c < n; c++) {
            int best = dp[r + 1][c];
            if (c > 0) best = min(best, dp[r + 1][c - 1]);
            if (c < n - 1) best = min(best, dp[r + 1][c + 1]);
            dp[r][c] += best;
        }
    }
    return *min_element(dp[0].begin(), dp[0].end());
}`,
      },
      explanation: "Bottom-up tabulation computes the minimum cost path incrementally, avoiding recursive call overhead.",
      timeComplexity: "O(N^2)",
      spaceComplexity: "O(N^2)",
    },
    testCases: [
      { id: 1, params: [[[2, 1, 3], [6, 5, 4], [7, 8, 9]]], inputStr: "[[2, 1, 3], [6, 5, 4], [7, 8, 9]]", expectedVal: 13, expectedStr: "13" },
      { id: 2, params: [[[-19, 57], [-40, -5]]], inputStr: "[[-19, 57], [-40, -5]]", expectedVal: -59, expectedStr: "-59" },
      { id: 3, params: [[[7]]], inputStr: "[[7]]", expectedVal: 7, expectedStr: "7" },
    ],
    source: "local-seed",
  },
];
