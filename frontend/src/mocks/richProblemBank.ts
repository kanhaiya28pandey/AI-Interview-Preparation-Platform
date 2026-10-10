import { CodingProblem } from "./codingData";

export interface RichProblemDefinition extends CodingProblem {
  source: "LEETCODE" | "GEEKSFORGEEKS" | "CODEFORCES" | "SQL_DATABASE";
  problemNumber?: number;
  slug: string;
  tags: string[];
  type?: "CODING" | "SQL";
}

export const RICH_PROBLEM_CATALOG: RichProblemDefinition[] = [
  // =========================================================================
  // 1. LEETCODE ALGORITHMIC PROBLEMS
  // =========================================================================
  {
    id: "two-sum",
    slug: "two-sum",
    problemNumber: 1,
    title: "1. Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    tags: ["Array", "Hash Table", "Two Pointers"],
    source: "LEETCODE",
    type: "CODING",
    acceptance: "52.4%",
    xpReward: 50,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    inputFormat: "nums = [2, 7, 11, 15], target = 9",
    outputFormat: "[0, 1]",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] == 6, return [1, 2].",
      },
      {
        input: "nums = [3, 3], target = 6",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] == 6, return [0, 1].",
      },
    ],
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be O(N²). Can we do better?",
      "Can we use extra space? Think of a Hash Map / Dictionary.",
      "As you iterate through the array, check if `target - nums[i]` exists in the Hash Map. If it does, you've found your pair!",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution below
  
}
`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution below
        pass
`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution below
        return new int[]{};
    }
}
`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution below
        return {};
    }
};
`,
      c: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution below
    *returnSize = 0;
    return NULL;
}
`,
    },
    fnName: "twoSum",
    solution: {
      code: {
        javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}`,
        python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (map.find(diff) != map.end()) {
                return {map[diff], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
      },
      explanation: "Iterate through the array once while caching previous values and their indices in a Hash Map. For each element, lookup the complement in O(1) time.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
    },
    testCases: [
      { id: 1, inputStr: "nums = [2, 7, 11, 15], target = 9", expectedStr: "[0, 1]", params: [[2, 7, 11, 15], 9], expectedVal: [0, 1] },
      { id: 2, inputStr: "nums = [3, 2, 4], target = 6", expectedStr: "[1, 2]", params: [[3, 2, 4], 6], expectedVal: [1, 2] },
      { id: 3, inputStr: "nums = [3, 3], target = 6", expectedStr: "[0, 1]", params: [[3, 3], 6], expectedVal: [0, 1] },
    ],
  },

  {
    id: "longest-substring",
    slug: "longest-substring-without-repeating-characters",
    problemNumber: 3,
    title: "3. Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Strings & Sliding Window",
    tags: ["Hash Table", "String", "Sliding Window"],
    source: "LEETCODE",
    type: "CODING",
    acceptance: "34.5%",
    xpReward: 100,
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    inputFormat: `s = "abcabcbb"`,
    outputFormat: "3",
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    examples: [
      { input: `s = "abcabcbb"`, output: "3", explanation: `The answer is "abc", with the length of 3.` },
      { input: `s = "bbbbb"`, output: "1", explanation: `The answer is "b", with the length of 1.` },
      { input: `s = "pwwkew"`, output: "3", explanation: `The answer is "wke", with the length of 3.` },
    ],
    hints: [
      "Use a sliding window with two pointers `left` and `right`.",
      "Store characters in a Set or Hash Map to track whether the current window contains duplicates.",
      "When a duplicate is encountered, advance `left` and remove characters until the duplicate is evicted.",
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your solution below
  
}
`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your solution below
        pass
`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution below
        return 0;
    }
}
`,
      cpp: `#include <string>
#include <unordered_set>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your solution below
        return 0;
    }
};
`,
      c: `#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    // Write your solution below
    return 0;
}
`,
    },
    fnName: "lengthOfLongestSubstring",
    solution: {
      code: {
        javascript: `function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_set = set()
        l = 0
        res = 0
        for r in range(len(s)):
            while s[r] in char_set:
                char_set.remove(s[l])
                l += 1
            char_set.add(s[r])
            res = max(res, r - l + 1)
        return res`,
        java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> set = new HashSet<>();
        int l = 0, max = 0;
        for (int r = 0; r < s.length(); r++) {
            while (set.contains(s.charAt(r))) {
                set.remove(s.charAt(l++));
            }
            set.add(s.charAt(r));
            max = Math.max(max, r - l + 1);
        }
        return max;
    }
}`,
        cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> st;
        int l = 0, res = 0;
        for (int r = 0; r < s.length(); r++) {
            while (st.count(s[r])) {
                st.erase(s[l++]);
            }
            st.insert(s[r]);
            res = max(res, r - l + 1);
        }
        return res;
    }
};`,
      },
      explanation: "Sliding window with two pointers and a character set. Expand right pointer and contract left pointer on duplicate characters.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(min(N, M))",
    },
    testCases: [
      { id: 1, inputStr: `s = "abcabcbb"`, expectedStr: "3", params: ["abcabcbb"], expectedVal: 3 },
      { id: 2, inputStr: `s = "bbbbb"`, expectedStr: "1", params: ["bbbbb"], expectedVal: 1 },
      { id: 3, inputStr: `s = "pwwkew"`, expectedStr: "3", params: ["pwwkew"], expectedVal: 3 },
    ],
  },

  {
    id: "container-most-water",
    slug: "container-with-most-water",
    problemNumber: 11,
    title: "11. Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    tags: ["Array", "Two Pointers", "Greedy"],
    source: "LEETCODE",
    type: "CODING",
    acceptance: "54.8%",
    xpReward: 100,
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the **maximum amount of water** a container can store. Notice that you may not slant the container.`,
    inputFormat: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
    outputFormat: "49",
    constraints: [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4",
    ],
    examples: [
      { input: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]", output: "49", explanation: "The maximum area is obtained between index 1 and index 8: min(8, 7) * (8 - 1) = 49." },
      { input: "height = [1, 1]", output: "1", explanation: "min(1, 1) * 1 = 1." },
    ],
    hints: [
      "Start with the widest container using pointers at the two ends: `left = 0`, `right = height.length - 1`.",
      "The height of water is constrained by the shorter line: `min(height[left], height[right]) * (right - left)`.",
      "To possibly find a larger area, move the pointer pointing to the shorter vertical line.",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Write your solution below
  
}
`,
      python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # Write your solution below
        pass
`,
      java: `class Solution {
    public int maxArea(int[] height) {
        // Write your solution below
        return 0;
    }
}
`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your solution below
        return 0;
    }
};
`,
      c: `#include <stdio.h>

int maxArea(int* height, int heightSize) {
    // Write your solution below
    return 0;
}
`,
    },
    fnName: "maxArea",
    solution: {
      code: {
        javascript: `function maxArea(height) {
  let l = 0, r = height.length - 1, max = 0;
  while (l < r) {
    const area = Math.min(height[l], height[r]) * (r - l);
    if (area > max) max = area;
    if (height[l] < height[r]) l++;
    else r--;
  }
  return max;
}`,
        python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        l, r, max_water = 0, len(height) - 1, 0
        while l < r:
            area = min(height[l], height[r]) * (r - l)
            if area > max_water:
                max_water = area
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return max_water`,
        java: `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, max = 0;
        while (l < r) {
            int area = Math.min(height[l], height[r]) * (r - l);
            if (area > max) max = area;
            if (height[l] < height[r]) l++;
            else r--;
        }
        return max;
    }
}`,
        cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = height.size() - 1, max = 0;
        while (l < r) {
            int area = min(height[l], height[r]) * (r - l);
            if (area > max) max = area;
            if (height[l] < height[r]) l++;
            else r--;
        }
        return max;
    }
};`,
      },
      explanation: "Two pointers technique from both edges. Moving the shorter line is the only action that can potentially produce a larger area.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    testCases: [
      { id: 1, inputStr: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]", expectedStr: "49", params: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expectedVal: 49 },
      { id: 2, inputStr: "height = [1, 1]", expectedStr: "1", params: [[1, 1]], expectedVal: 1 },
      { id: 3, inputStr: "height = [4, 3, 2, 1, 4]", expectedStr: "16", params: [[4, 3, 2, 1, 4]], expectedVal: 16 },
    ],
  },

  {
    id: "valid-parentheses",
    slug: "valid-parentheses",
    problemNumber: 20,
    title: "20. Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks",
    tags: ["String", "Stack"],
    source: "LEETCODE",
    type: "CODING",
    acceptance: "40.3%",
    xpReward: 50,
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputFormat: `s = "()[]{}"`,
    outputFormat: "true",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    examples: [
      { input: `s = "()"`, output: "true" },
      { input: `s = "()[]{}"`, output: "true" },
      { input: `s = "(]"`, output: "false" },
    ],
    hints: [
      "An opening bracket must eventually match with a closing bracket of the same type.",
      "Use a Last-In First-Out (LIFO) data structure: a Stack.",
      "Push opening brackets. When a closing bracket is found, pop from the stack and verify that it matches.",
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution below
  
}
`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution below
        pass
`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution below
        return false;
    }
}
`,
      cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Write your solution below
        return false;
    }
};
`,
      c: `#include <stdio.h>
#include <stdbool.h>
#include <string.h>

bool isValid(char* s) {
    // Write your solution below
    return false;
}
`,
    },
    fnName: "isValid",
    solution: {
      code: {
        javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let c of s) {
    if (map[c]) {
      if (stack.pop() !== map[c]) return false;
    } else stack.push(c);
  }
  return stack.length === 0;
}`,
        python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        for c in s:
            if c in pairs:
                if not stack or stack.pop() != pairs[c]:
                    return False
            else:
                stack.append(c)
        return not stack`,
        java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> st = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else if (st.isEmpty() || st.pop() != c) return false;
        }
        return st.isEmpty();
    }
}`,
        cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else if (st.empty() || st.top() != c) return false;
            else st.pop();
        }
        return st.empty();
    }
};`,
      },
      explanation: "Using a stack, push closing counterparts when seeing opening brackets. When a closing bracket arrives, verify and pop.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
    },
    testCases: [
      { id: 1, inputStr: `s = "()[]{}"`, expectedStr: "true", params: ["()[]{}"], expectedVal: true },
      { id: 2, inputStr: `s = "(]"`, expectedStr: "false", params: ["(]"], expectedVal: false },
      { id: 3, inputStr: `s = "([{}])"`, expectedStr: "true", params: ["([{}])"], expectedVal: true },
    ],
  },

  {
    id: "climbing-stairs",
    slug: "climbing-stairs",
    problemNumber: 70,
    title: "70. Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    source: "LEETCODE",
    type: "CODING",
    acceptance: "52.8%",
    xpReward: 50,
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    inputFormat: "n = 3",
    outputFormat: "3",
    constraints: [
      "1 <= n <= 45",
    ],
    examples: [
      { input: "n = 2", output: "2", explanation: "1. 1 step + 1 step\n2. 2 steps" },
      { input: "n = 3", output: "3", explanation: "1. 1 + 1 + 1 step\n2. 1 + 2 steps\n3. 2 + 1 steps" },
    ],
    hints: [
      "To reach step n, you can either come from step n - 1 or step n - 2.",
      "Therefore: ways(n) = ways(n - 1) + ways(n - 2). This is the Fibonacci sequence!",
      "You can solve it in O(N) time and O(1) space with two variables.",
    ],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Write your solution below
  
}
`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your solution below
        pass
`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your solution below
        return 0;
    }
}
`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your solution below
        return 0;
    }
};
`,
      c: `int climbStairs(int n) {
    // Write your solution below
    return 0;
}
`,
    },
    fnName: "climbStairs",
    solution: {
      code: {
        javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev1 = 1, prev2 = 2;
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;
    prev1 = prev2;
    prev2 = cur;
  }
  return prev2;
}`,
        python: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        one, two = 1, 2
        for _ in range(3, n + 1):
            one, two = two, one + two
        return two`,
        java: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}`,
        cpp: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};`,
      },
      explanation: "Dynamic programming with space optimization: ways[i] = ways[i - 1] + ways[i - 2].",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    testCases: [
      { id: 1, inputStr: "n = 2", expectedStr: "2", params: [2], expectedVal: 2 },
      { id: 2, inputStr: "n = 3", expectedStr: "3", params: [3], expectedVal: 3 },
      { id: 3, inputStr: "n = 5", expectedStr: "8", params: [5], expectedVal: 8 },
    ],
  },

  // =========================================================================
  // 2. LEETCODE DATABASE (SQL) PROBLEMS
  // =========================================================================
  {
    id: "combine-two-tables",
    slug: "combine-two-tables",
    problemNumber: 175,
    title: "175. Combine Two Tables",
    difficulty: "Easy",
    category: "Database & SQL",
    tags: ["Database", "SQL", "Join"],
    source: "SQL_DATABASE",
    type: "SQL",
    acceptance: "74.8%",
    xpReward: 50,
    description: `Table: \`Person\`
\`\`\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| personId    | int     |
| lastName    | varchar |
| firstName   | varchar |
+-------------+---------+
\`\`\`
\`personId\` is the primary key column for this table.

Table: \`Address\`
\`\`\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| addressId   | int     |
| personId    | int     |
| city        | varchar |
| state       | varchar |
+-------------+---------+
\`\`\`
\`addressId\` is the primary key column for this table.

Write a solution to report the **first name**, **last name**, **city**, and **state** of each person in the \`Person\` table. If the address of a \`personId\` is not present in the \`Address\` table, report \`null\` instead.

Return the result table in any order.`,
    inputFormat: `Person:
+----------+----------+-----------+
| personId | lastName | firstName |
+----------+----------+-----------+
| 1        | Wang     | Allen     |
| 2        | Alice    | Bob       |
+----------+----------+-----------+
Address:
+-----------+----------+---------------+----------+
| addressId | personId | city          | state    |
+-----------+----------+---------------+----------+
| 1         | 2        | New York City | New York |
+-----------+----------+---------------+----------+`,
    outputFormat: `+-----------+----------+---------------+----------+
| firstName | lastName | city          | state    |
+-----------+----------+---------------+----------+
| Allen     | Wang     | Null          | Null     |
| Bob       | Alice    | New York City | New York |
+-----------+----------+---------------+----------+`,
    constraints: [
      "There is no person with NULL personId in Person table.",
      "Output columns must match: firstName, lastName, city, state.",
    ],
    examples: [
      {
        input: "Person = [[1, 'Wang', 'Allen'], [2, 'Alice', 'Bob']], Address = [[1, 2, 'New York City', 'New York']]",
        output: "[['Allen', 'Wang', null, null], ['Bob', 'Alice', 'New York City', 'New York']]",
        explanation: "Person 1 has no address in Address table, so city and state are NULL.",
      },
    ],
    hints: [
      "Think about which SQL JOIN preserves all records from the primary table even if there is no matching entry in the second table.",
      "Specify which columns belong to which table using table aliases or explicit column names.",
    ],
    starterCode: {
      mysql: `-- Write your MySQL query statement below\nSELECT \nFROM \n`,
      postgresql: `-- Write your PostgreSQL query statement below\nSELECT \nFROM \n`,
      sql: `-- Write your SQL query statement below\nSELECT \nFROM \n`,
      javascript: `-- Write your SQL query statement below\nSELECT \nFROM \n`,
      python: `# Write your SQL query statement below\n`,
      java: `-- Write your SQL query statement below\n`,
      cpp: `-- Write your SQL query statement below\n`,
      c: `-- Write your SQL query statement below\n`,
    },
    fnName: "combineTwoTables",
    solution: {
      code: {
        javascript: `SELECT p.firstName, p.lastName, a.city, a.state
FROM Person p
LEFT JOIN Address a ON p.personId = a.personId;`,
        python: `SELECT p.firstName, p.lastName, a.city, a.state
FROM Person p
LEFT JOIN Address a ON p.personId = a.personId;`,
        java: `SELECT p.firstName, p.lastName, a.city, a.state
FROM Person p
LEFT JOIN Address a ON p.personId = a.personId;`,
        cpp: `SELECT p.firstName, p.lastName, a.city, a.state
FROM Person p
LEFT JOIN Address a ON p.personId = a.personId;`,
      },
      explanation: "Using a LEFT OUTER JOIN ensures all rows from Person are retained even when no matching record exists in Address.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
    },
    testCases: [
      {
        id: 1,
        inputStr: "Person (2 rows), Address (1 row)",
        expectedStr: "2 rows returned with Allen Wang (null, null) and Bob Alice (New York City, New York)",
        params: [],
        expectedVal: "VALID_SQL",
      },
    ],
  },

  {
    id: "second-highest-salary",
    slug: "second-highest-salary",
    problemNumber: 176,
    title: "176. Second Highest Salary",
    difficulty: "Medium",
    category: "Database & SQL",
    tags: ["Database", "SQL", "Aggregate"],
    source: "SQL_DATABASE",
    type: "SQL",
    acceptance: "41.2%",
    xpReward: 100,
    description: `Table: \`Employee\`
\`\`\`
+-------------+------+
| Column Name | Type |
+-------------+------+
| id          | int  |
| salary      | int  |
+-------------+------+
\`\`\`
\`id\` is the primary key column for this table.
Each row contains information about the salary of an employee.

Write a solution to find the **second highest distinct salary** from the \`Employee\` table. If there is no second highest salary, return \`null\`.`,
    inputFormat: `Employee:
+----+--------+
| id | salary |
+----+--------+
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
+----+--------+`,
    outputFormat: `+---------------------+
| SecondHighestSalary |
+---------------------+
| 200                 |
+---------------------+`,
    constraints: [
      "Ensure distinct salary values are considered (duplicate top salaries do not count).",
      "Return NULL if only 1 distinct salary exists in the table.",
    ],
    examples: [
      {
        input: "Employee = [[1, 100], [2, 200], [3, 300]]",
        output: "200",
        explanation: "The highest salary is 300, and the second highest salary is 200.",
      },
      {
        input: "Employee = [[1, 100]]",
        output: "null",
        explanation: "There is only one salary, so no second highest salary exists.",
      },
    ],
    hints: [
      "How can you find the highest salary that is strictly less than the maximum salary in the table?",
      "Consider what happens if there is only 1 distinct salary in the table—the query should safely evaluate to NULL.",
    ],
    starterCode: {
      mysql: `-- Write your MySQL query statement below\nSELECT \nFROM \n`,
      postgresql: `-- Write your PostgreSQL query statement below\nSELECT \nFROM \n`,
      sql: `-- Write your SQL query statement below\nSELECT \nFROM \n`,
      javascript: `-- Write your SQL query statement below\nSELECT \nFROM \n`,
      python: `# Write your SQL query statement below\n`,
      java: `-- Write your SQL query statement below\n`,
      cpp: `-- Write your SQL query statement below\n`,
      c: `-- Write your SQL query statement below\n`,
    },
    fnName: "secondHighestSalary",
    solution: {
      code: {
        javascript: `SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);`,
        python: `SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);`,
        java: `SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);`,
        cpp: `SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);`,
      },
      explanation: "Subquery filters out all instances of the maximum salary, and MAX() on the remaining salaries yields the second highest or NULL.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    testCases: [
      { id: 1, inputStr: "Salaries: [100, 200, 300]", expectedStr: "200", params: [], expectedVal: "VALID_SQL" },
      { id: 2, inputStr: "Salaries: [100]", expectedStr: "null", params: [], expectedVal: "VALID_SQL" },
    ],
  },

  {
    id: "duplicate-emails",
    slug: "duplicate-emails",
    problemNumber: 182,
    title: "182. Duplicate Emails",
    difficulty: "Easy",
    category: "Database & SQL",
    tags: ["Database", "SQL", "Group By"],
    source: "SQL_DATABASE",
    type: "SQL",
    acceptance: "71.6%",
    xpReward: 50,
    description: `Table: \`Person\`
\`\`\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| email       | varchar |
+-------------+---------+
\`\`\`
\`id\` is the primary key column for this table.
Each row of this table contains an email. The emails will not contain uppercase letters.

Write a solution to report all the **duplicate emails**. Note that it's guaranteed that the email field is not NULL.

Return the result table in any order.`,
    inputFormat: `Person:
+----+---------+
| id | email   |
+----+---------+
| 1  | a@b.com |
| 2  | c@d.com |
| 3  | a@b.com |
+----+---------+`,
    outputFormat: `+---------+
| Email   |
+---------+
| a@b.com |
+---------+`,
    constraints: [
      "1 <= Person.length <= 10^5",
      "email field is never NULL.",
    ],
    examples: [
      { input: "Person = [[1, 'a@b.com'], [2, 'c@d.com'], [3, 'a@b.com']]", output: "a@b.com", explanation: "a@b.com is repeated two times." },
    ],
    hints: [
      "How can you count the occurrences of each email address?",
      "Which SQL clause is used to filter aggregated group results after a GROUP BY statement?",
    ],
    starterCode: {
      mysql: `-- Write your MySQL query statement below\nSELECT \nFROM \n`,
      postgresql: `-- Write your PostgreSQL query statement below\nSELECT \nFROM \n`,
      sql: `-- Write your SQL query statement below\nSELECT \nFROM \n`,
      javascript: `-- Write your SQL query statement below\nSELECT \nFROM \n`,
      python: `# Write your SQL query statement below\n`,
      java: `-- Write your SQL query statement below\n`,
      cpp: `-- Write your SQL query statement below\n`,
      c: `-- Write your SQL query statement below\n`,
    },
    fnName: "duplicateEmails",
    solution: {
      code: {
        javascript: `SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(email) > 1;`,
        python: `SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(email) > 1;`,
        java: `SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(email) > 1;`,
        cpp: `SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(email) > 1;`,
      },
      explanation: "GROUP BY email and filter with HAVING COUNT(email) > 1 to retrieve emails that appear more than once.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
    },
    testCases: [
      { id: 1, inputStr: "Person emails: ['a@b.com', 'c@d.com', 'a@b.com']", expectedStr: "a@b.com", params: [], expectedVal: "VALID_SQL" },
    ],
  },

  {
    id: "big-countries",
    slug: "big-countries",
    problemNumber: 595,
    title: "595. Big Countries",
    difficulty: "Easy",
    category: "Database & SQL",
    tags: ["Database", "SQL"],
    source: "SQL_DATABASE",
    type: "SQL",
    acceptance: "78.2%",
    xpReward: 50,
    description: `Table: \`World\`
\`\`\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| name        | varchar |
| continent   | varchar |
| area        | int     |
| population  | int     |
| gdp         | bigint  |
+-------------+---------+
\`\`\`
\`name\` is the primary key column for this table.
Each row of this table gives information about the country's name, continent, area, population, and GDP.

A country is **big** if:
- it has an area of at least three million (i.e., \`3000000 km²\`), or
- it has a population of at least twenty-five million (i.e., \`25000000\`).

Write a solution to find the name, population, and area of the **big countries**.

Return the result table in any order.`,
    inputFormat: `World:
+-------------+-----------+---------+------------+--------------+
| name        | continent | area    | population | gdp          |
+-------------+-----------+---------+------------+--------------+
| Afghanistan | Asia      | 652230  | 25500100   | 20343000000  |
| Albania     | Europe    | 28748   | 2831741    | 12960000000  |
| Algeria     | Africa    | 2381741 | 37100000   | 188681000000 |
+-------------+-----------+---------+------------+--------------+`,
    outputFormat: `+-------------+------------+---------+
| name        | population | area    |
+-------------+------------+---------+
| Afghanistan | 25500100   | 652230  |
| Algeria     | 37100000   | 2381741 |
+-------------+------------+---------+`,
    constraints: [
      "1 <= World.length <= 10^5",
    ],
    examples: [
      {
        input: "World table with sample records",
        output: "Afghanistan, Algeria",
        explanation: "Afghanistan has population >= 25,000,000; Algeria has population >= 25,000,000.",
      },
    ],
    hints: [
      "Look at the condition: an area of at least 3,000,000 OR a population of at least 25,000,000.",
      "Filter the records with a standard WHERE clause using the logical OR operator.",
    ],
    starterCode: {
      mysql: `-- Write your MySQL query statement below\nSELECT \nFROM \n`,
      postgresql: `-- Write your PostgreSQL query statement below\nSELECT \nFROM \n`,
      sql: `-- Write your SQL query statement below\nSELECT \nFROM \n`,
      javascript: `-- Write your SQL query statement below\nSELECT \nFROM \n`,
      python: `# Write your SQL query statement below\n`,
      java: `-- Write your SQL query statement below\n`,
      cpp: `-- Write your SQL query statement below\n`,
      c: `-- Write your SQL query statement below\n`,
    },
    fnName: "bigCountries",
    solution: {
      code: {
        javascript: `SELECT name, population, area
FROM World
WHERE area >= 3000000 OR population >= 25000000;`,
        python: `SELECT name, population, area
FROM World
WHERE area >= 3000000 OR population >= 25000000;`,
        java: `SELECT name, population, area
FROM World
WHERE area >= 3000000 OR population >= 25000000;`,
        cpp: `SELECT name, population, area
FROM World
WHERE area >= 3000000 OR population >= 25000000;`,
      },
      explanation: "Standard filtered selection with logical OR condition.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    testCases: [
      { id: 1, inputStr: "World records (3 countries)", expectedStr: "Afghanistan and Algeria", params: [], expectedVal: "VALID_SQL" },
    ],
  },

  // =========================================================================
  // 3. GEEKSFORGEEKS CURATED
  // =========================================================================
  {
    id: "gfg-subarray-sum",
    slug: "subarray-with-given-sum",
    problemNumber: 101,
    title: "Subarray with Given Sum",
    difficulty: "Medium",
    category: "Arrays & Sliding Window",
    tags: ["Arrays", "Sliding Window", "Prefix Sum"],
    source: "GEEKSFORGEEKS",
    type: "CODING",
    acceptance: "45.0%",
    xpReward: 100,
    description: `Given an unsorted array \`arr\` of size \`N\` that contains only non-negative integers, find a continuous sub-array that adds to a given number \`S\`.

In case of multiple sub-arrays, return the subarray which comes first on moving from left to right. If no such subarray exists, return \`[-1]\`.`,
    inputFormat: "arr = [1, 2, 3, 7, 5], S = 12",
    outputFormat: "[2, 4] (1-based index)",
    constraints: [
      "1 <= N <= 10^5",
      "0 <= arr[i] <= 10^9",
      "0 <= S <= 10^9",
    ],
    examples: [
      { input: "arr = [1, 2, 3, 7, 5], S = 12", output: "[2, 4]", explanation: "The sum of elements from 2nd position to 4th position is 2 + 3 + 7 = 12." },
      { input: "arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], S = 15", output: "[1, 5]", explanation: "1 + 2 + 3 + 4 + 5 = 15." },
    ],
    hints: [
      "Since all numbers are non-negative, you can maintain a sliding window sum.",
      "Add elements from the right. If the current sum exceeds S, remove elements from the left.",
    ],
    starterCode: {
      javascript: `function subarraySum(arr, s) {
  // Write your solution below (1-based indices)
  
}
`,
      python: `def subarraySum(arr, s):
    # Write your solution below
    pass
`,
      java: `class Solution {
    public int[] subarraySum(int[] arr, int s) {
        return new int[]{-1};
    }
}
`,
      cpp: `vector<int> subarraySum(vector<int> arr, int s) {
    return {-1};
}
`,
      c: `int* subarraySum(int* arr, int n, int s, int* returnSize) {
    *returnSize = 0;
    return NULL;
}
`,
    },
    fnName: "subarraySum",
    solution: {
      code: {
        javascript: `function subarraySum(arr, s) {
  let left = 0, currentSum = 0;
  for (let right = 0; right < arr.length; right++) {
    currentSum += arr[right];
    while (currentSum > s && left < right) {
      currentSum -= arr[left];
      left++;
    }
    if (currentSum === s) {
      return [left + 1, right + 1];
    }
  }
  return [-1];
}`,
        python: `def subarraySum(arr, s):
    left = 0
    cur_sum = 0
    for right in range(len(arr)):
        cur_sum += arr[right]
        while cur_sum > s and left < right:
            cur_sum -= arr[left]
            left += 1
        if cur_sum == s:
            return [left + 1, right + 1]
    return [-1]`,
        java: `class Solution {
    public int[] subarraySum(int[] arr, int s) {
        int left = 0, sum = 0;
        for (int right = 0; right < arr.length; right++) {
            sum += arr[right];
            while (sum > s && left < right) {
                sum -= arr[left++];
            }
            if (sum == s) {
                return new int[]{left + 1, right + 1};
            }
        }
        return new int[]{-1};
    }
}`,
        cpp: `vector<int> subarraySum(vector<int> arr, int s) {
    int left = 0, sum = 0;
    for (int right = 0; right < arr.size(); right++) {
        sum += arr[right];
        while (sum > s && left < right) sum -= arr[left++];
        if (sum == s) return {left + 1, right + 1};
    }
    return {-1};
}`,
      },
      explanation: "Two pointers sliding window. Because numbers are non-negative, the window sum is monotonic with respect to pointer advances.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    testCases: [
      { id: 1, inputStr: "arr = [1, 2, 3, 7, 5], S = 12", expectedStr: "[2, 4]", params: [[1, 2, 3, 7, 5], 12], expectedVal: [2, 4] },
      { id: 2, inputStr: "arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], S = 15", expectedStr: "[1, 5]", params: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 15], expectedVal: [1, 5] },
    ],
  },

  // =========================================================================
  // 4. CODEFORCES CLASSICS
  // =========================================================================
  {
    id: "cf-watermelon",
    slug: "watermelon",
    problemNumber: 4,
    title: "4A. Watermelon",
    difficulty: "Easy",
    category: "Math & Logic",
    tags: ["math", "brute force"],
    source: "CODEFORCES",
    type: "CODING",
    acceptance: "82.1%",
    xpReward: 50,
    description: `One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed \`w\` kilos.

They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.

Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs an **even number of kilos**, while it is not obligatory that the parts are equal in size.

Check whether they can divide the watermelon into two even-weighted pieces. Return \`"YES"\` or \`"NO"\`.`,
    inputFormat: "w = 8",
    outputFormat: `"YES"`,
    constraints: [
      "1 <= w <= 100",
    ],
    examples: [
      { input: "w = 8", output: `"YES"`, explanation: "Can be divided into 2 and 6 or 4 and 4." },
      { input: "w = 2", output: `"NO"`, explanation: "Only possible division is 1 and 1, which are odd numbers." },
    ],
    hints: [
      "If the sum of two even numbers is even, `w` must be even.",
      "Be careful with `w = 2`: 2 = 1 + 1 (both odd!). So `w` must be even and strictly greater than 2.",
    ],
    starterCode: {
      javascript: `function watermelon(w) {
  // Return "YES" or "NO"
  
}
`,
      python: `def watermelon(w: int) -> str:
    # Return "YES" or "NO"
    pass
`,
      java: `class Solution {
    public String watermelon(int w) {
        return "NO";
    }
}
`,
      cpp: `#include <string>
using namespace std;

string watermelon(int w) {
    return "NO";
}
`,
      c: `#include <stdio.h>

const char* watermelon(int w) {
    return "NO";
}
`,
    },
    fnName: "watermelon",
    solution: {
      code: {
        javascript: `function watermelon(w) {
  return w > 2 && w % 2 === 0 ? "YES" : "NO";
}`,
        python: `def watermelon(w: int) -> str:
    return "YES" if w > 2 and w % 2 == 0 else "NO"`,
        java: `class Solution {
    public String watermelon(int w) {
        return (w > 2 && w % 2 == 0) ? "YES" : "NO";
    }
}`,
        cpp: `string watermelon(int w) {
    return (w > 2 && w % 2 == 0) ? "YES" : "NO";
}`,
      },
      explanation: "A watermelon can be divided into two even parts if and only if its total weight w is even and strictly greater than 2.",
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
    },
    testCases: [
      { id: 1, inputStr: "w = 8", expectedStr: `"YES"`, params: [8], expectedVal: "YES" },
      { id: 2, inputStr: "w = 2", expectedStr: `"NO"`, params: [2], expectedVal: "NO" },
      { id: 3, inputStr: "w = 10", expectedStr: `"YES"`, params: [10], expectedVal: "YES" },
    ],
  },
];
