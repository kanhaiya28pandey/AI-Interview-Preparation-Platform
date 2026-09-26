import React from "react";

const KEYWORDS = new Set([
  "function", "return", "const", "let", "var", "if", "else", "for", "while",
  "class", "import", "from", "export", "def", "elif", "in", "is", "not",
  "public", "private", "static", "void", "int", "double", "bool", "vector",
  "using", "namespace", "include", "template", "typename", "new", "try",
  "catch", "throw", "typeof", "instanceof", "async", "await", "yield",
  "switch", "case", "break", "continue", "default", "struct", "auto"
]);

const BUILTINS = new Set([
  "Map", "Set", "Array", "Object", "Math", "String", "Number", "Boolean",
  "console", "List", "HashMap", "HashSet", "ArrayList", "Stack", "Queue",
  "ListNode", "TreeNode", "std", "cout", "cin", "endl", "nullptr", "null",
  "undefined", "true", "false", "True", "False", "None", "self"
]);

export const highlightLineTokens = (line: string): React.ReactNode => {
  if (!line) return "\n";

  const tokenRegex = /(\/\/[^\n]*|#[^\n]*)|("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*\b)|([^\s\w]+|\s+)/g;

  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    const [raw, comment, str, num, ident] = match;
    const key = `tok-${idx++}`;

    if (comment) {
      elements.push(
        <span key={key} className="text-[#636f88] italic">
          {comment}
        </span>
      );
    } else if (str) {
      elements.push(
        <span key={key} className="text-[#4ade80]">
          {str}
        </span>
      );
    } else if (num) {
      elements.push(
        <span key={key} className="text-[#f97316]">
          {num}
        </span>
      );
    } else if (ident) {
      if (KEYWORDS.has(ident)) {
        elements.push(
          <span key={key} className="text-[#c678dd] font-semibold">
            {ident}
          </span>
        );
      } else if (BUILTINS.has(ident)) {
        elements.push(
          <span key={key} className="text-[#fbbf24]">
            {ident}
          </span>
        );
      } else if (line[tokenRegex.lastIndex] === "(") {
        elements.push(
          <span key={key} className="text-[#38bdf8]">
            {ident}
          </span>
        );
      } else {
        elements.push(
          <span key={key} className="text-[#e2e8f0]">
            {ident}
          </span>
        );
      }
    } else {
      elements.push(
        <span key={key} className="text-[#94a3b8]">
          {raw}
        </span>
      );
    }
  }

  return elements;
};
