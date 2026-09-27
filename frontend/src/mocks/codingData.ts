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

export const mockCodingProblems: CodingProblem[] = [
  {
    id: "two-sum",
    title: "1. Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    acceptance: "49.2%",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    inputFormat: "nums = [2,7,11,15], target = 9",
    outputFormat: "[0,1]",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def twoSum(nums: List[int], target: int) -> List[int]:\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []`,
      java: `public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int diff = target - nums[i];\n        if (map.containsKey(diff)) return new int[]{map.get(diff), i};\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> m;\n    for(int i=0; i<nums.size(); i++) {\n        if(m.count(target - nums[i])) return {m[target - nums[i]], i};\n        m[nums[i]] = i;\n    }\n    return {};\n}`
    },
    fnName: "twoSum",
    xpReward: 50,
    testCases: [
      { id: 1, inputStr: "nums = [2,7,11,15], target = 9", expectedStr: "[0,1]", params: [[2, 7, 11, 15], 9], expectedVal: [0, 1] },
      { id: 2, inputStr: "nums = [3,2,4], target = 6", expectedStr: "[1,2]", params: [[3, 2, 4], 6], expectedVal: [1, 2] },
      { id: 3, inputStr: "nums = [3,3], target = 6", expectedStr: "[0,1]", params: [[3, 3], 6], expectedVal: [0, 1] }
    ],
    hints: [
      "Think about using a Hash Map to store numbers you've seen so far along with their indices.",
      "For each number `x`, calculate `complement = target - x`. Check if `complement` is already in your Hash Map in O(1) time.",
      "If `complement` exists in the map, return `[map.get(complement), currentIndex]`. Otherwise, add `map.set(x, currentIndex)`."
    ],
    solution: {
      code: {
        javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
        python: `def twoSum(nums: List[int], target: int) -> List[int]:\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []`,
        java: `public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int diff = target - nums[i];\n        if (map.containsKey(diff)) {\n            return new int[]{map.get(diff), i};\n        }\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}`,
        cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> m;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (m.count(diff)) return {m[diff], i};\n        m[nums[i]] = i;\n    }\n    return {};\n}`
      },
      explanation: "We iterate through the array once. For each element `nums[i]`, we compute the required complement (`target - nums[i]`). If the complement is present in our Hash Map, we return the pair of indices immediately. Otherwise, we record `nums[i]` and its index in the map.",
      timeComplexity: "O(N) — Single pass through the array with O(1) average lookup per element.",
      spaceComplexity: "O(N) — Hash Map stores up to N elements."
    }
  },
  {
    id: "valid-parentheses",
    title: "20. Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks",
    acceptance: "40.5%",
    description: "Determine if the input string containing parentheses '()[]{}' is valid.",
    inputFormat: "s = \"()[]{}\"",
    outputFormat: "true",
    constraints: ["1 <= s.length <= 10^4"],
    examples: [{ input: "s = \"()\"", output: "true" }],
    starterCode: {
      javascript: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let c of s) {\n    if (pairs[c]) {\n      if (stack.pop() !== pairs[c]) return false;\n    } else stack.push(c);\n  }\n  return stack.length === 0;\n}`,
      python: `def isValid(s: str) -> bool:\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in pairs:\n            if not stack or stack.pop() != pairs[c]: return False\n        else: stack.append(c)\n    return not stack`,
      java: `public boolean isValid(String s) {\n    Stack<Character> st = new Stack<>();\n    for (char c : s.toCharArray()) {\n        if (c == '(') st.push(')');\n        else if (st.isEmpty() || st.pop() != c) return false;\n    }\n    return st.isEmpty();\n}`,
      cpp: `bool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(') st.push(')');\n        else if (st.empty() || st.top() != c) return false;\n        else st.pop();\n    }\n    return st.empty();\n}`
    },
    fnName: "isValid",
    xpReward: 50,
    testCases: [
      { id: 1, inputStr: 's = "()[]{}"', expectedStr: "true", params: ["()[]{}"], expectedVal: true },
      { id: 2, inputStr: 's = "(]"', expectedStr: "false", params: ["(]"], expectedVal: false },
      { id: 3, inputStr: 's = "([{}])"', expectedStr: "true", params: ["([{}])"], expectedVal: true }
    ],
    hints: [
      "Use a Stack data structure to keep track of open brackets.",
      "When encountering a closing bracket, check if it matches the top element of the stack.",
      "If the stack is empty at the end, all brackets were validly closed!"
    ],
    solution: {
      code: {
        javascript: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let c of s) {\n    if (pairs[c]) {\n      if (stack.pop() !== pairs[c]) return false;\n    } else {\n      stack.push(c);\n    }\n  }\n  return stack.length === 0;\n}`,
        python: `def isValid(s: str) -> bool:\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n        else:\n            stack.append(c)\n    return not stack`,
        java: `public boolean isValid(String s) {\n    Stack<Character> stack = new Stack<>();\n    for (char c : s.toCharArray()) {\n        if (c == '(') stack.push(')');\n        else if (c == '{') stack.push('}');\n        else if (c == '[') stack.push(']');\n        else if (stack.isEmpty() || stack.pop() != c) return false;\n    }\n    return stack.isEmpty();\n}`,
        cpp: `bool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '{' || c == '[') st.push(c);\n        else {\n            if (st.empty()) return false;\n            if (c == ')' && st.top() != '(') return false;\n            if (c == '}' && st.top() != '{') return false;\n            if (c == ']' && st.top() != '[') return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}`
      },
      explanation: "We push opening brackets onto a stack. When a closing bracket is encountered, we pop from the stack and verify it matches. If the stack is empty after processing the string, all brackets were correctly matched.",
      timeComplexity: "O(N) — Traversing the string of length N.",
      spaceComplexity: "O(N) — Stack holds up to N characters."
    }
  },
  {
    id: "longest-substring",
    title: "3. Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    acceptance: "34.1%",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    inputFormat: "s = \"abcabcbb\"",
    outputFormat: "3",
    constraints: ["0 <= s.length <= 5 * 10^4"],
    examples: [{ input: "s = \"abcabcbb\"", output: "3", explanation: "\"abc\" length 3" }],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  let set = new Set(), l = 0, max = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (set.has(s[r])) { set.delete(s[l]); l++; }\n    set.add(s[r]);\n    max = Math.max(max, r - l + 1);\n  }\n  return max;\n}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    charSet = set()\n    l, res = 0, 0\n    for r in range(len(s)):\n        while s[r] in charSet:\n            charSet.remove(s[l])\n            l += 1\n        charSet.add(s[r])\n        res = max(res, r - l + 1)\n    return res`,
      java: `public int lengthOfLongestSubstring(String s) {\n    Set<Character> set = new HashSet<>();\n    int l = 0, max = 0;\n    for (int r = 0; r < s.length(); r++) {\n        while (set.contains(s.charAt(r))) { set.remove(s.charAt(l++)); }\n        set.add(s.charAt(r));\n        max = Math.max(max, r - l + 1);\n    }\n    return max;\n}`,
      cpp: `int lengthOfLongestSubstring(string s) {\n    unordered_set<char> st;\n    int l = 0, res = 0;\n    for (int r = 0; r < s.length(); r++) {\n        while (st.count(s[r])) { st.erase(s[l++]); }\n        st.insert(s[r]);\n        res = max(res, r - l + 1);\n    }\n    return res;\n}`
    },
    fnName: "lengthOfLongestSubstring",
    xpReward: 100,
    testCases: [
      { id: 1, inputStr: 's = "abcabcbb"', expectedStr: "3", params: ["abcabcbb"], expectedVal: 3 },
      { id: 2, inputStr: 's = "bbbbb"', expectedStr: "1", params: ["bbbbb"], expectedVal: 1 },
      { id: 3, inputStr: 's = "pwwkew"', expectedStr: "3", params: ["pwwkew"], expectedVal: 3 }
    ],
    hints: [
      "Use the Sliding Window technique with two pointers `left` and `right`.",
      "Maintain a Set of unique characters currently inside the window `[left, right]`.",
      "When a duplicate character `s[right]` is found, increment `left` and remove `s[left]` from the Set until duplicate is gone."
    ],
    solution: {
      code: {
        javascript: `function lengthOfLongestSubstring(s) {\n  let set = new Set(), l = 0, maxLen = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (set.has(s[r])) {\n      set.delete(s[l]);\n      l++;\n    }\n    set.add(s[r]);\n    maxLen = Math.max(maxLen, r - l + 1);\n  }\n  return maxLen;\n}`,
        python: `def lengthOfLongestSubstring(s: str) -> int:\n    charSet = set()\n    l, res = 0, 0\n    for r in range(len(s)):\n        while s[r] in charSet:\n            charSet.remove(s[l])\n            l += 1\n        charSet.add(s[r])\n        res = max(res, r - l + 1)\n    return res`,
        java: `public int lengthOfLongestSubstring(String s) {\n    Set<Character> set = new HashSet<>();\n    int l = 0, max = 0;\n    for (int r = 0; r < s.length(); r++) {\n        while (set.contains(s.charAt(r))) {\n            set.remove(s.charAt(l++));\n        }\n        set.add(s.charAt(r));\n        max = Math.max(max, r - l + 1);\n    }\n    return max;\n}`,
        cpp: `int lengthOfLongestSubstring(string s) {\n    unordered_set<char> st;\n    int l = 0, res = 0;\n    for (int r = 0; r < s.length(); r++) {\n        while (st.count(s[r])) st.erase(s[l++]);\n        st.insert(s[r]);\n        res = max(res, r - l + 1);\n    }\n    return res;\n}`
      },
      explanation: "We expand a sliding window using pointer `r`. If `s[r]` is already in our set, we contract the window from the left by removing `s[l]` and advancing `l` until `s[r]` is unique again. We keep track of the maximum window size.",
      timeComplexity: "O(N) — Each character is visited at most twice (once by right pointer, once by left).",
      spaceComplexity: "O(min(N, M)) — Set stores unique characters where M is alphabet size."
    }
  },
  {
    id: "container-most-water",
    title: "11. Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    acceptance: "54.3%",
    description: "Given n non-negative integers representing heights, find two lines that together with the x-axis form a container containing the most water.",
    inputFormat: "height = [1,8,6,2,5,4,8,3,7]",
    outputFormat: "49",
    constraints: ["n == height.length", "2 <= n <= 10^5"],
    examples: [{ input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" }],
    starterCode: {
      javascript: `function maxArea(height) {\n  let l = 0, r = height.length - 1, max = 0;\n  while (l < r) {\n    const area = Math.min(height[l], height[r]) * (r - l);\n    max = Math.max(max, area);\n    if (height[l] < height[r]) l++; else r--;\n  }\n  return max;\n}`,
      python: `def maxArea(height: List[int]) -> int:\n    l, r, res = 0, len(height) - 1, 0\n    while l < r:\n        res = max(res, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return res`,
      java: `public int maxArea(int[] height) {\n    int l = 0, r = height.length - 1, max = 0;\n    while (l < r) {\n        max = Math.max(max, Math.min(height[l], height[r]) * (r - l));\n        if (height[l] < height[r]) l++; else r--;\n    }\n    return max;\n}`,
      cpp: `int maxArea(vector<int>& height) {\n    int l = 0, r = height.size() - 1, res = 0;\n    while (l < r) {\n        res = max(res, min(height[l], height[r]) * (r - l));\n        if (height[l] < height[r]) l++; else r--;\n    }\n    return res;\n}`
    },
    fnName: "maxArea",
    xpReward: 100,
    testCases: [
      { id: 1, inputStr: "height = [1,8,6,2,5,4,8,3,7]", expectedStr: "49", params: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expectedVal: 49 },
      { id: 2, inputStr: "height = [1,1]", expectedStr: "1", params: [[1, 1]], expectedVal: 1 },
      { id: 3, inputStr: "height = [4,3,2,1,4]", expectedStr: "16", params: [[4, 3, 2, 1, 4]], expectedVal: 16 }
    ],
    hints: [
      "Use Two Pointers starting from opposite ends (`left = 0`, `right = height.length - 1`).",
      "The area is restricted by the shorter height: `Math.min(height[left], height[right]) * (right - left)`.",
      "To find a larger area, move the pointer pointing to the shorter line inward."
    ],
    solution: {
      code: {
        javascript: `function maxArea(height) {\n  let l = 0, r = height.length - 1, max = 0;\n  while (l < r) {\n    const area = Math.min(height[l], height[r]) * (r - l);\n    max = Math.max(max, area);\n    if (height[l] < height[r]) l++; else r--;\n  }\n  return max;\n}`,
        python: `def maxArea(height: List[int]) -> int:\n    l, r, res = 0, len(height) - 1, 0\n    while l < r:\n        res = max(res, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return res`,
        java: `public int maxArea(int[] height) {\n    int l = 0, r = height.length - 1, max = 0;\n    while (l < r) {\n        max = Math.max(max, Math.min(height[l], height[r]) * (r - l));\n        if (height[l] < height[r]) l++; else r--;\n    }\n    return max;\n}`,
        cpp: `int maxArea(vector<int>& height) {\n    int l = 0, r = height.size() - 1, res = 0;\n    while (l < r) {\n        res = max(res, min(height[l], height[r]) * (r - l));\n        if (height[l] < height[r]) l++; else r--;\n    }\n    return res;\n}`
      },
      explanation: "Starting with maximum width (pointers at extreme ends), the area is limited by the shorter height. Moving the shorter pointer inward is the only choice that could potentially yield a larger container area.",
      timeComplexity: "O(N) — Linear scan from both sides.",
      spaceComplexity: "O(1) — Constant extra space."
    }
  },
  {
    id: "lru-cache",
    title: "146. LRU Cache",
    difficulty: "Hard",
    category: "Data Structures",
    acceptance: "41.8%",
    description: "Design a data structure that follows Least Recently Used (LRU) cache constraints with O(1) time complexity.",
    inputFormat: "capacity = 2, put(1,1), put(2,2), get(1)",
    outputFormat: "1",
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4"],
    examples: [{ input: "put(1,1), put(2,2), get(1)", output: "1" }],
    starterCode: {
      javascript: `function testLRU() {\n  const map = new Map();\n  map.set(1, 1);\n  map.set(2, 2);\n  return map.get(1);\n}`,
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {}\n}`,
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n};`
    },
    fnName: "testLRU",
    xpReward: 200,
    testCases: [
      { id: 1, inputStr: "capacity = 2, get(1)", expectedStr: "1", params: [], expectedVal: 1 }
    ],
    hints: [
      "Combine a Doubly Linked List for O(1) removals/additions with a Hash Map for O(1) key lookups.",
      "In JS, `Map` remembers original insertion order. Deleting and re-setting a key moves it to the end!"
    ],
    solution: {
      code: {
        javascript: `class LRUCache {\n  constructor(capacity) {\n    this.cap = capacity;\n    this.map = new Map();\n  }\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if (this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if (this.map.size > this.cap) {\n      const oldestKey = this.map.keys().next().value;\n      this.map.delete(oldestKey);\n    }\n  }\n}`,
        python: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.cache = {}\n    def get(self, key: int) -> int:\n        if key in self.cache:\n            val = self.cache.pop(key)\n            self.cache[key] = val\n            return val\n        return -1`,
        java: `class LRUCache extends LinkedHashMap<Integer, Integer> {\n    private int capacity;\n    public LRUCache(int capacity) {\n        super(capacity, 0.75f, true);\n        this.capacity = capacity;\n    }\n}`,
        cpp: `class LRUCache {\n    int cap;\n    list<pair<int,int>> l;\n    unordered_map<int, list<pair<int,int>>::iterator> m;\n};`
      },
      explanation: "Using a Doubly Linked List combined with a Hash Map allows O(1) access, insertion, and deletion of least recently used keys.",
      timeComplexity: "O(1) for both get() and put().",
      spaceComplexity: "O(capacity) for map and list."
    }
  },
  {
    id: "reverse-linked-list",
    title: "206. Reverse Linked List",
    difficulty: "Easy",
    category: "Linked List",
    acceptance: "74.1%",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    inputFormat: "head = [1,2,3,4,5]",
    outputFormat: "[5,4,3,2,1]",
    constraints: ["Number of nodes in range [0, 5000]"],
    examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }],
    starterCode: {
      javascript: `function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let nxt = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  return prev;\n}`,
      python: `def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
      java: `public ListNode reverseList(ListNode head) {\n    ListNode prev = null, curr = head;\n    while (curr != null) {\n        ListNode nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`,
      cpp: `ListNode* reverseList(ListNode* head) {\n    ListNode *prev = NULL, *curr = head;\n    while (curr) {\n        ListNode* nextTemp = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`
    },
    fnName: "reverseList",
    xpReward: 50,
    testCases: [
      { id: 1, inputStr: "head = [1,2,3,4,5]", expectedStr: "[5,4,3,2,1]", params: [[1, 2, 3, 4, 5]], expectedVal: [5, 4, 3, 2, 1] },
      { id: 2, inputStr: "head = [1,2]", expectedStr: "[2,1]", params: [[1, 2]], expectedVal: [2, 1] }
    ],
    hints: [
      "Maintain three pointers: `prev` (initialized to null), `curr` (head), and `nxt`.",
      "In each iteration, save `curr.next` in `nxt`, flip `curr.next = prev`, then advance `prev` and `curr`.",
      "Return `prev` as the new head."
    ],
    solution: {
      code: {
        javascript: `function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let nxt = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  return prev;\n}`,
        python: `def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
        java: `public ListNode reverseList(ListNode head) {\n    ListNode prev = null, curr = head;\n    while (curr != null) {\n        ListNode nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`,
        cpp: `ListNode* reverseList(ListNode* head) {\n    ListNode *prev = NULL, *curr = head;\n    while (curr) {\n        ListNode* nextTemp = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`
      },
      explanation: "Iteratively traverse the list, re-pointing each node's `.next` pointer to its predecessor until `curr` becomes null.",
      timeComplexity: "O(N) — Visiting each node once.",
      spaceComplexity: "O(1) — In-place pointer modifications."
    }
  },
  {
    id: "coin-change",
    title: "322. Coin Change",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "42.1%",
    description: "Find the fewest number of coins needed to make up a given amount. If impossible, return -1.",
    inputFormat: "coins = [1,2,5], amount = 11",
    outputFormat: "3",
    constraints: ["1 <= coins.length <= 12", "0 <= amount <= 10^4"],
    examples: [{ input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" }],
    starterCode: {
      javascript: `function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (let c of coins) {\n      if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}`,
      python: `def coinChange(coins: List[int], amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if a - c >= 0: dp[a] = min(dp[a], 1 + dp[a - c])\n    return dp[amount] if dp[amount] != float('inf') else -1`,
      java: `public int coinChange(int[] coins, int amount) {\n    int[] dp = new int[amount + 1];\n    Arrays.fill(dp, amount + 1);\n    dp[0] = 0;\n    for (int i = 1; i <= amount; i++) {\n        for (int coin : coins) {\n            if (i - coin >= 0) dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}`,
      cpp: `int coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int i = 1; i <= amount; i++) {\n        for (int c : coins) {\n            if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}`
    },
    fnName: "coinChange",
    xpReward: 100,
    testCases: [
      { id: 1, inputStr: "coins = [1,2,5], amount = 11", expectedStr: "3", params: [[1, 2, 5], 11], expectedVal: 3 },
      { id: 2, inputStr: "coins = [2], amount = 3", expectedStr: "-1", params: [[2], 3], expectedVal: -1 },
      { id: 3, inputStr: "coins = [1], amount = 0", expectedStr: "0", params: [[1], 0], expectedVal: 0 }
    ],
    hints: [
      "Use Bottom-Up Dynamic Programming with array `dp` of size `amount + 1`.",
      "Initialize `dp[0] = 0` and all other entries to Infinity.",
      "For each amount `i` from 1 to `amount`, try every coin `c`: `dp[i] = Math.min(dp[i], dp[i - c] + 1)`."
    ],
    solution: {
      code: {
        javascript: `function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (let c of coins) {\n      if (i - c >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - c] + 1);\n      }\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}`,
        python: `def coinChange(coins: List[int], amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if a - c >= 0:\n                dp[a] = min(dp[a], 1 + dp[a - c])\n    return dp[amount] if dp[amount] != float('inf') else -1`,
        java: `public int coinChange(int[] coins, int amount) {\n    int[] dp = new int[amount + 1];\n    Arrays.fill(dp, amount + 1);\n    dp[0] = 0;\n    for (int i = 1; i <= amount; i++) {\n        for (int coin : coins) {\n            if (i - coin >= 0) dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}`,
        cpp: `int coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int i = 1; i <= amount; i++) {\n        for (int c : coins) {\n            if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}`
      },
      explanation: "Using dynamic programming, `dp[i]` stores the minimum coins needed to make amount `i`. We build up the solution from 0 to target amount.",
      timeComplexity: "O(amount * coins.length) — Nested iteration over amount and coin denominations.",
      spaceComplexity: "O(amount) — DP array size."
    }
  }
];
