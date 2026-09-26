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
}

export interface ExecutionResult {
  status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "COMPILE_ERROR";
  runtimeMs: number;
  memoryMb: number;
  passedTests: number;
  totalTests: number;
  outputLogs: string[];
  errorMessage?: string;
}

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
      javascript: `class LRUCache {\n  constructor(capacity) {\n    this.cap = capacity;\n    this.map = new Map();\n  }\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n  }\n}`,
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.cache = {}\n    def get(self, key: int) -> int:\n        if key in self.cache:\n            val = self.cache.pop(key)\n            self.cache[key] = val\n            return val\n        return -1`,
      java: `class LRUCache {\n    private int cap;\n    private LinkedHashMap<Integer, Integer> map;\n    public LRUCache(int capacity) {\n        this.cap = capacity;\n        this.map = new LinkedHashMap<>();\n    }\n}`,
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n};`
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
    }
  },
  {
    id: "merge-intervals",
    title: "56. Merge Intervals",
    difficulty: "Medium",
    category: "Arrays & Sorting",
    acceptance: "46.7%",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
    inputFormat: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    outputFormat: "[[1,6],[8,10],[15,18]]",
    constraints: ["1 <= intervals.length <= 10^4"],
    examples: [{ input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" }],
    starterCode: {
      javascript: `function merge(intervals) {\n  intervals.sort((a,b) => a[0] - b[0]);\n  const res = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const last = res[res.length - 1];\n    if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);\n    else res.push(intervals[i]);\n  }\n  return res;\n}`,
      python: `def merge(intervals: List[List[int]]) -> List[List[int]]:\n    intervals.sort(key=lambda i: i[0])\n    output = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= output[-1][1]: output[-1][1] = max(output[-1][1], end)\n        else: output.append([start, end])\n    return output`,
      java: `public int[][] merge(int[][] intervals) {\n    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n    List<int[]> res = new ArrayList<>();\n    for (int[] interval : intervals) {\n        if (res.isEmpty() || res.get(res.size() - 1)[1] < interval[0]) res.add(interval);\n        else res.get(res.size() - 1)[1] = Math.max(res.get(res.size() - 1)[1], interval[1]);\n    }\n    return res.toArray(new int[res.size()][]);\n}`,
      cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end());\n    vector<vector<int>> res;\n    for (auto& i : intervals) {\n        if (res.empty() || res.back()[1] < i[0]) res.push_back(i);\n        else res.back()[1] = max(res.back()[1], i[1]);\n    }\n    return res;\n}`
    }
  },
  {
    id: "group-anagrams",
    title: "49. Group Anagrams",
    difficulty: "Medium",
    category: "Hash Table",
    acceptance: "66.9%",
    description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
    inputFormat: "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
    outputFormat: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]",
    constraints: ["1 <= strs.length <= 10^4"],
    examples: [{ input: "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", output: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]" }],
    starterCode: {
      javascript: `function groupAnagrams(strs) {\n  const map = {};\n  for (let s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map[key]) map[key] = [];\n    map[key].push(s);\n  }\n  return Object.values(map);\n}`,
      python: `def groupAnagrams(strs: List[str]) -> List[List[str]]:\n    ans = defaultdict(list)\n    for s in strs:\n        ans[tuple(sorted(s))].append(s)\n    return list(ans.values())`,
      java: `public List<List<String>> groupAnagrams(String[] strs) {\n    Map<String, List<String>> map = new HashMap<>();\n    for (String s : strs) {\n        char[] ca = s.toCharArray(); Arrays.sort(ca);\n        String key = String.valueOf(ca);\n        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n    }\n    return new ArrayList<>(map.values());\n}`,
      cpp: `vector<vector<string>> groupAnagrams(vector<string>& strs) {\n    unordered_map<string, vector<string>> mp;\n    for(string s : strs){\n        string t = s; sort(t.begin(), t.end());\n        mp[t].push_back(s);\n    }\n    vector<vector<string>> res;\n    for(auto p : mp) res.push_back(p.second);\n    return res;\n}`
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
    }
  },
  {
    id: "trapping-rain-water",
    title: "42. Trapping Rain Water",
    difficulty: "Hard",
    category: "Two Pointers & DP",
    acceptance: "59.8%",
    description: "Given n non-negative integers representing an elevation map where width of each bar is 1, compute how much water it can trap after raining.",
    inputFormat: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
    outputFormat: "6",
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4"],
    examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }],
    starterCode: {
      javascript: `function trap(height) {\n  let l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, res = 0;\n  while (l < r) {\n    if (height[l] < height[r]) {\n      if (height[l] >= leftMax) leftMax = height[l];\n      else res += leftMax - height[l];\n      l++;\n    } else {\n      if (height[r] >= rightMax) rightMax = height[r];\n      else res += rightMax - height[r];\n      r--;\n    }\n  }\n  return res;\n}`,
      python: `def trap(height: List[int]) -> int:\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    leftMax, rightMax = height[l], height[r]\n    res = 0\n    while l < r:\n        if leftMax < rightMax:\n            l += 1; leftMax = max(leftMax, height[l]); res += leftMax - height[l]\n        else:\n            r -= 1; rightMax = max(rightMax, height[r]); res += rightMax - height[r]\n    return res`,
      java: `public int trap(int[] height) {\n    int l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, res = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            if (height[l] >= leftMax) leftMax = height[l];\n            else res += leftMax - height[l];\n            l++;\n        } else {\n            if (height[r] >= rightMax) rightMax = height[r];\n            else res += rightMax - height[r];\n            r--;\n        }\n    }\n    return res;\n}`,
      cpp: `int trap(vector<int>& height) {\n    int l = 0, r = height.size() - 1, leftMax = 0, rightMax = 0, res = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            height[l] >= leftMax ? (leftMax = height[l]) : res += leftMax - height[l];\n            l++;\n        } else {\n            height[r] >= rightMax ? (rightMax = height[r]) : res += rightMax - height[r];\n            r--;\n        }\n    }\n    return res;\n}`
    }
  },
  {
    id: "search-rotated-sorted",
    title: "33. Search in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Binary Search",
    acceptance: "39.8%",
    description: "Search for a target value in an integer array sorted in ascending order that is rotated at an unknown pivot index.",
    inputFormat: "nums = [4,5,6,7,0,1,2], target = 0",
    outputFormat: "4",
    constraints: ["1 <= nums.length <= 5000"],
    examples: [{ input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" }],
    starterCode: {
      javascript: `function search(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    let m = Math.floor((l + r) / 2);\n    if (nums[m] === target) return m;\n    if (nums[l] <= nums[m]) {\n      if (target >= nums[l] && target < nums[m]) r = m - 1; else l = m + 1;\n    } else {\n      if (target > nums[m] && target <= nums[r]) l = m + 1; else r = m - 1;\n    }\n  }\n  return -1;\n}`,
      python: `def search(nums: List[int], target: int) -> int:\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= target < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < target <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1`,
      java: `public int search(int[] nums, int target) {\n    int l = 0, r = nums.length - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[l] <= nums[m]) {\n            if (target >= nums[l] && target < nums[m]) r = m - 1; else l = m + 1;\n        } else {\n            if (target > nums[m] && target <= nums[r]) l = m + 1; else r = m - 1;\n        }\n    }\n    return -1;\n}`,
      cpp: `int search(vector<int>& nums, int target) {\n    int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[l] <= nums[m]) {\n            if (target >= nums[l] && target < nums[m]) r = m - 1; else l = m + 1;\n        } else {\n            if (target > nums[m] && target <= nums[r]) l = m + 1; else r = m - 1;\n        }\n    }\n    return -1;\n}`
    }
  },
  {
    id: "course-schedule",
    title: "207. Course Schedule",
    difficulty: "Medium",
    category: "Graph Topological Sort",
    acceptance: "46.2%",
    description: "Determine if it is possible for you to finish all courses given prerequisites [a, b] indicating you must take course b before course a.",
    inputFormat: "numCourses = 2, prerequisites = [[1,0]]",
    outputFormat: "true",
    constraints: ["1 <= numCourses <= 2000"],
    examples: [{ input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" }],
    starterCode: {
      javascript: `function canFinish(numCourses, prerequisites) {\n  const adj = Array.from({length: numCourses}, () => []);\n  for (let [a, b] of prerequisites) adj[b].push(a);\n  const visited = new Array(numCourses).fill(0);\n  function dfs(node) {\n    if (visited[node] === 1) return false;\n    if (visited[node] === 2) return true;\n    visited[node] = 1;\n    for (let neighbor of adj[node]) if (!dfs(neighbor)) return false;\n    visited[node] = 2;\n    return true;\n  }\n  for (let i = 0; i < numCourses; i++) if (!dfs(i)) return false;\n  return true;\n}`,
      python: `def canFinish(numCourses: int, prerequisites: List[List[int]]) -> bool:\n    preMap = {i: [] for i in range(numCourses)}\n    for crs, pre in prerequisites: preMap[crs].append(pre)\n    visiting = set()\n    def dfs(crs):\n        if crs in visiting: return False\n        if preMap[crs] == []: return True\n        visiting.add(crs)\n        for pre in preMap[crs]:\n            if not dfs(pre): return False\n        visiting.remove(crs)\n        preMap[crs] = []\n        return True\n    for crs in range(numCourses):\n        if not dfs(crs): return False\n    return True`,
      java: `public boolean canFinish(int numCourses, int[][] prerequisites) {\n    List<List<Integer>> adj = new ArrayList<>();\n    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n    for (int[] p : prerequisites) adj.get(p[1]).add(p[0]);\n    int[] visited = new int[numCourses];\n    for (int i = 0; i < numCourses; i++) {\n        if (!dfs(i, adj, visited)) return false;\n    }\n    return true;\n}`,
      cpp: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n    vector<vector<int>> adj(numCourses);\n    for (auto& p : prerequisites) adj[p[1]].push_back(p[0]);\n    vector<int> vis(numCourses, 0);\n    for (int i = 0; i < numCourses; i++) {\n        if (!dfs(i, adj, vis)) return false;\n    }\n    return true;\n}`
    }
  },
  {
    id: "word-break",
    title: "139. Word Break",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "46.1%",
    description: "Given a string `s` and a dictionary of strings `wordDict`, return true if `s` can be segmented into a space-separated sequence of dictionary words.",
    inputFormat: "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
    outputFormat: "true",
    constraints: ["1 <= s.length <= 300"],
    examples: [{ input: "s = \"leetcode\", wordDict = [\"leet\",\"code\"]", output: "true" }],
    starterCode: {
      javascript: `function wordBreak(s, wordDict) {\n  const dp = new Array(s.length + 1).fill(false);\n  dp[s.length] = true;\n  for (let i = s.length - 1; i >= 0; i--) {\n    for (let w of wordDict) {\n      if (i + w.length <= s.length && s.slice(i, i + w.length) === w) {\n        dp[i] = dp[i + w.length];\n      }\n      if (dp[i]) break;\n    }\n  }\n  return dp[0];\n}`,
      python: `def wordBreak(s: str, wordDict: List[str]) -> bool:\n    dp = [False] * (len(s) + 1)\n    dp[len(s)] = True\n    for i in range(len(s) - 1, -1, -1):\n        for w in wordDict:\n            if (i + len(w)) <= len(s) and s[i:i + len(w)] == w:\n                dp[i] = dp[i + len(w)]\n            if dp[i]: break\n    return dp[0]`,
      java: `public boolean wordBreak(String s, List<String> wordDict) {\n    boolean[] dp = new boolean[s.length() + 1];\n    dp[0] = true;\n    for (int i = 1; i <= s.length(); i++) {\n        for (String w : wordDict) {\n            if (i >= w.length() && s.substring(i - w.length(), i).equals(w)) {\n                dp[i] = dp[i] || dp[i - w.length()];\n            }\n        }\n    }\n    return dp[s.length()];\n}`,
      cpp: `bool wordBreak(string s, vector<string>& wordDict) {\n    vector<bool> dp(s.length() + 1, false);\n    dp[s.length()] = true;\n    for (int i = s.length() - 1; i >= 0; i--) {\n        for (auto& w : wordDict) {\n            if (i + w.length() <= s.length() && s.substr(i, w.length()) == w) {\n                dp[i] = dp[i + w.length()];\n            }\n            if (dp[i]) break;\n        }\n    }\n    return dp[0];\n}`
    }
  },
  {
    id: "product-array-except-self",
    title: "238. Product of Array Except Self",
    difficulty: "Medium",
    category: "Arrays & Prefix Sum",
    acceptance: "65.1%",
    description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]` without using division in O(n).",
    inputFormat: "nums = [1,2,3,4]",
    outputFormat: "[24,12,8,6]",
    constraints: ["2 <= nums.length <= 10^5"],
    examples: [{ input: "nums = [1,2,3,4]", output: "[24,12,8,6]" }],
    starterCode: {
      javascript: `function productExceptSelf(nums) {\n  const res = new Array(nums.length).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < nums.length; i++) { res[i] = prefix; prefix *= nums[i]; }\n  let postfix = 1;\n  for (let i = nums.length - 1; i >= 0; i--) { res[i] *= postfix; postfix *= nums[i]; }\n  return res;\n}`,
      python: `def productExceptSelf(nums: List[int]) -> List[int]:\n    res = [1] * len(nums)\n    prefix = 1\n    for i in range(len(nums)):\n        res[i] = prefix\n        prefix *= nums[i]\n    postfix = 1\n    for i in range(len(nums) - 1, -1, -1):\n        res[i] *= postfix\n        postfix *= nums[i]\n    return res`,
      java: `public int[] productExceptSelf(int[] nums) {\n    int n = nums.length;\n    int[] res = new int[n];\n    res[0] = 1;\n    for (int i = 1; i < n; i++) res[i] = res[i - 1] * nums[i - 1];\n    int R = 1;\n    for (int i = n - 1; i >= 0; i--) { res[i] *= R; R *= nums[i]; }\n    return res;\n}`,
      cpp: `vector<int> productExceptSelf(vector<int>& nums) {\n    int n = nums.size();\n    vector<int> res(n, 1);\n    for (int i = 1; i < n; i++) res[i] = res[i - 1] * nums[i - 1];\n    int right = 1;\n    for (int i = n - 1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }\n    return res;\n}`
    }
  },
  {
    id: "subsets",
    title: "78. Subsets",
    difficulty: "Medium",
    category: "Backtracking",
    acceptance: "76.4%",
    description: "Given an integer array `nums` of unique elements, return all possible subsets (the power set).",
    inputFormat: "nums = [1,2,3]",
    outputFormat: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
    constraints: ["1 <= nums.length <= 10"],
    examples: [{ input: "nums = [1,2,3]", output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" }],
    starterCode: {
      javascript: `function subsets(nums) {\n  const res = [];\n  function backtrack(start, path) {\n    res.push([...path]);\n    for (let i = start; i < nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop();\n    }\n  }\n  backtrack(0, []);\n  return res;\n}`,
      python: `def subsets(nums: List[int]) -> List[List[int]]:\n    res = []\n    def dfs(i, path):\n        if i >= len(nums):\n            res.append(path.copy()); return\n        path.append(nums[i]); dfs(i + 1, path)\n        path.pop(); dfs(i + 1, path)\n    dfs(0, [])\n    return res`,
      java: `public List<List<Integer>> subsets(int[] nums) {\n    List<List<Integer>> list = new ArrayList<>();\n    backtrack(list, new ArrayList<>(), nums, 0);\n    return list;\n}`,
      cpp: `vector<vector<int>> subsets(vector<int>& nums) {\n    vector<vector<int>> res;\n    vector<int> path;\n    backtrack(0, nums, path, res);\n    return res;\n}`
    }
  }
];
