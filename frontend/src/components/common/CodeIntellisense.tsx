import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface SuggestionItem {
  label: string;
  insertText: string;
  detail: string;
  kind: "keyword" | "function" | "snippet" | "type";
}

const COMMON_SUGGESTIONS: Record<string, SuggestionItem[]> = {
  // 1. JavaScript
  javascript: [
    { label: "console.log", insertText: "console.log()", detail: "Prints to stdout", kind: "function" },
    { label: "function", insertText: "function solve() {\n  \n}", detail: "Function definition", kind: "snippet" },
    { label: "return", insertText: "return ", detail: "Return from function", kind: "keyword" },
    { label: "const", insertText: "const ", detail: "Immutable declaration", kind: "keyword" },
    { label: "let", insertText: "let ", detail: "Mutable variable", kind: "keyword" },
    { label: "for-loop", insertText: "for (let i = 0; i < arr.length; i++) {\n  \n}", detail: "Iterate over array", kind: "snippet" },
    { label: "while", insertText: "while () {\n  \n}", detail: "While condition loop", kind: "snippet" },
    { label: "if-else", insertText: "if () {\n  \n} else {\n  \n}", detail: "Conditional branch", kind: "snippet" },
    { label: "Map", insertText: "new Map()", detail: "Key-value hash map", kind: "type" },
    { label: "Set", insertText: "new Set()", detail: "Unique value collection", kind: "type" },
    { label: "Math.max", insertText: "Math.max()", detail: "Maximum value", kind: "function" },
    { label: "Math.min", insertText: "Math.min()", detail: "Minimum value", kind: "function" },
    { label: "Array.push", insertText: "push()", detail: "Append element", kind: "function" },
    { label: "Array.pop", insertText: "pop()", detail: "Remove last element", kind: "function" },
    { label: "Array.slice", insertText: "slice()", detail: "Sub-array slice", kind: "function" },
  ],

  // 2. Python
  python: [
    { label: "print", insertText: "print()", detail: "Print to console", kind: "function" },
    { label: "def", insertText: "def solve():\n    ", detail: "Function definition", kind: "snippet" },
    { label: "return", insertText: "return ", detail: "Return statement", kind: "keyword" },
    { label: "for-range", insertText: "for i in range(len(nums)):\n    ", detail: "Iterate by index", kind: "snippet" },
    { label: "for-item", insertText: "for item in arr:\n    ", detail: "Iterate over sequence", kind: "snippet" },
    { label: "while", insertText: "while condition:\n    ", detail: "While loop", kind: "snippet" },
    { label: "if-else", insertText: "if condition:\n    pass\nelse:\n    pass", detail: "If-Else block", kind: "snippet" },
    { label: "len", insertText: "len()", detail: "Collection length", kind: "function" },
    { label: "range", insertText: "range()", detail: "Sequence range", kind: "function" },
    { label: "append", insertText: "append()", detail: "Append to list", kind: "function" },
    { label: "dict", insertText: "{}", detail: "Hash map dictionary", kind: "type" },
    { label: "set", insertText: "set()", detail: "Unique hash set", kind: "type" },
    { label: "min", insertText: "min()", detail: "Smallest element", kind: "function" },
    { label: "max", insertText: "max()", detail: "Largest element", kind: "function" },
  ],

  // 3. Java
  java: [
    { label: "System.out.println", insertText: "System.out.println();", detail: "Print line to stdout", kind: "function" },
    { label: "public static void", insertText: "public static void main(String[] args) {\n    \n}", detail: "Main method", kind: "snippet" },
    { label: "return", insertText: "return ;", detail: "Return statement", kind: "keyword" },
    { label: "for-i", insertText: "for (int i = 0; i < arr.length; i++) {\n    \n}", detail: "Indexed loop", kind: "snippet" },
    { label: "for-each", insertText: "for (int x : arr) {\n    \n}", detail: "Enhanced for loop", kind: "snippet" },
    { label: "HashMap", insertText: "Map<Integer, Integer> map = new HashMap<>();", detail: "Hash table map", kind: "type" },
    { label: "HashSet", insertText: "Set<Integer> set = new HashSet<>();", detail: "Hash set collection", kind: "type" },
    { label: "ArrayList", insertText: "List<Integer> list = new ArrayList<>();", detail: "Dynamic array list", kind: "type" },
    { label: "Math.max", insertText: "Math.max(a, b)", detail: "Maximum value", kind: "function" },
    { label: "Math.min", insertText: "Math.min(a, b)", detail: "Minimum value", kind: "function" },
    { label: "Arrays.sort", insertText: "Arrays.sort(arr);", detail: "Sort array", kind: "function" },
  ],

  // 4. C++
  cpp: [
    { label: "cout", insertText: "cout << << endl;", detail: "Print to console", kind: "function" },
    { label: "cin", insertText: "cin >> ;", detail: "Read from stdin", kind: "function" },
    { label: "vector", insertText: "vector<int> ", detail: "Dynamic array", kind: "type" },
    { label: "unordered_map", insertText: "unordered_map<int, int> ", detail: "Hash Map O(1)", kind: "type" },
    { label: "unordered_set", insertText: "unordered_set<int> ", detail: "Hash Set O(1)", kind: "type" },
    { label: "push_back", insertText: "push_back()", detail: "Append element", kind: "function" },
    { label: "for-i", insertText: "for (int i = 0; i < n; i++) {\n    \n}", detail: "Standard index loop", kind: "snippet" },
    { label: "for-range", insertText: "for (auto& x : vec) {\n    \n}", detail: "Range-based for loop", kind: "snippet" },
    { label: "return", insertText: "return ;", detail: "Return statement", kind: "keyword" },
    { label: "sort", insertText: "sort(v.begin(), v.end());", detail: "Sort collection", kind: "function" },
    { label: "max", insertText: "max(a, b)", detail: "Max value", kind: "function" },
    { label: "min", insertText: "min(a, b)", detail: "Min value", kind: "function" },
  ],

  // 5. C
  c: [
    { label: "printf", insertText: 'printf("%d\\n", );', detail: "Formatted stdout print", kind: "function" },
    { label: "scanf", insertText: 'scanf("%d", &);', detail: "Formatted stdin read", kind: "function" },
    { label: "malloc", insertText: "(int*)malloc(n * sizeof(int));", detail: "Dynamic memory allocate", kind: "function" },
    { label: "free", insertText: "free();", detail: "Free allocated memory", kind: "function" },
    { label: "sizeof", insertText: "sizeof()", detail: "Size of type", kind: "keyword" },
    { label: "strlen", insertText: "strlen()", detail: "String length", kind: "function" },
    { label: "memset", insertText: "memset(arr, 0, sizeof(arr));", detail: "Memory block fill", kind: "function" },
    { label: "for-i", insertText: "for (int i = 0; i < n; i++) {\n    \n}", detail: "Standard loop", kind: "snippet" },
    { label: "return", insertText: "return ;", detail: "Return from function", kind: "keyword" },
    { label: "struct", insertText: "struct Node {\n    int val;\n    struct Node* next;\n};", detail: "Struct declaration", kind: "type" },
  ],

  // 6. SQL (MySQL, PostgreSQL, Standard SQL)
  sql: [
    { label: "SELECT", insertText: "SELECT * FROM ", detail: "Query table columns", kind: "snippet" },
    { label: "FROM", insertText: "FROM ", detail: "Source table specification", kind: "keyword" },
    { label: "WHERE", insertText: "WHERE ", detail: "Row filtering condition", kind: "keyword" },
    { label: "LEFT JOIN", insertText: "LEFT JOIN  ON . = .", detail: "Left outer join", kind: "snippet" },
    { label: "INNER JOIN", insertText: "INNER JOIN  ON . = .", detail: "Inner join", kind: "snippet" },
    { label: "GROUP BY", insertText: "GROUP BY ", detail: "Aggregate row grouping", kind: "keyword" },
    { label: "HAVING", insertText: "HAVING COUNT(*) > 1", detail: "Group aggregation filter", kind: "snippet" },
    { label: "ORDER BY", insertText: "ORDER BY  DESC", detail: "Sort query result", kind: "keyword" },
    { label: "COUNT", insertText: "COUNT(*)", detail: "Count matching rows", kind: "function" },
    { label: "SUM", insertText: "SUM()", detail: "Sum of numeric column", kind: "function" },
    { label: "AVG", insertText: "AVG()", detail: "Average of numeric column", kind: "function" },
    { label: "MAX", insertText: "MAX()", detail: "Maximum column value", kind: "function" },
    { label: "MIN", insertText: "MIN()", detail: "Minimum column value", kind: "function" },
    { label: "DISTINCT", insertText: "DISTINCT ", detail: "Unique rows only", kind: "keyword" },
    { label: "CASE-WHEN", insertText: "CASE WHEN  THEN  ELSE  END", detail: "Conditional logic expression", kind: "snippet" },
    { label: "LIMIT", insertText: "LIMIT 1 OFFSET 1", detail: "Row pagination limit", kind: "snippet" },
    { label: "COALESCE", insertText: "COALESCE(val, 'default')", detail: "First non-null value", kind: "function" },
    { label: "IFNULL", insertText: "IFNULL(val, 0)", detail: "Handle null value (MySQL)", kind: "function" },
  ],
};

// Aliases for MySQL and PostgreSQL to point to SQL
COMMON_SUGGESTIONS.mysql = COMMON_SUGGESTIONS.sql;
COMMON_SUGGESTIONS.postgresql = COMMON_SUGGESTIONS.sql;

interface CodeIntellisenseProps {
  language: string;
  currentWord: string;
  visible: boolean;
  onSelect: (item: SuggestionItem) => void;
  onClose: () => void;
  selectedIndex: number;
}

export const CodeIntellisense: React.FC<CodeIntellisenseProps> = ({
  language,
  currentWord,
  visible,
  onSelect,
  onClose,
  selectedIndex,
}) => {
  if (!visible || !currentWord) return null;

  const langKey = language.toLowerCase();
  const pool = COMMON_SUGGESTIONS[langKey] || COMMON_SUGGESTIONS.javascript;

  const matches = pool.filter((item) =>
    item.label.toLowerCase().startsWith(currentWord.toLowerCase())
  );

  if (matches.length === 0) return null;

  return (
    <div className="absolute right-4 bottom-14 z-40 w-72 bg-[#252526] border border-[#454545] rounded-md shadow-2xl overflow-hidden font-mono text-xs animate-fade-in select-none">
      {/* Header */}
      <div className="px-2.5 py-1 bg-[#1e1e1e] border-b border-[#333333] flex items-center justify-between text-[10px] text-[#858585]">
        <span>VS Code IntelliSense ({matches.length})</span>
        <span>Tab / ↵ to insert</span>
      </div>

      {/* Suggestion list */}
      <div className="max-h-48 overflow-y-auto divide-y divide-[#2d2d2d] custom-scrollbar">
        {matches.map((item, idx) => {
          const isSelected = (selectedIndex % matches.length) === idx;
          return (
            <div
              key={item.label}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
              className={cn(
                "px-2.5 py-1.5 flex items-center justify-between cursor-pointer transition-colors",
                isSelected
                  ? "bg-[#094771] text-white"
                  : "text-[#cccccc] hover:bg-[#2a2d2e]"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={cn(
                    "text-[9px] px-1 py-0.2 rounded font-bold uppercase shrink-0",
                    item.kind === "keyword"
                      ? "bg-purple-900/60 text-purple-300 border border-purple-500/40"
                      : item.kind === "function"
                      ? "bg-amber-900/60 text-amber-300 border border-amber-500/40"
                      : item.kind === "type"
                      ? "bg-cyan-900/60 text-cyan-300 border border-cyan-500/40"
                      : "bg-emerald-900/60 text-emerald-300 border border-emerald-500/40"
                  )}
                >
                  {item.kind.slice(0, 2)}
                </span>
                <span className="font-semibold truncate">{item.label}</span>
              </div>
              <span className="text-[10px] text-[#858585] ml-2 truncate max-w-[100px]">
                {item.detail}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
