import React from "react";

const CODE_KEYWORDS = new Set([
  "function", "return", "const", "let", "var", "if", "else", "for", "while",
  "class", "import", "from", "export", "def", "elif", "in", "is", "not",
  "public", "private", "static", "void", "int", "double", "float", "long", "char",
  "bool", "vector", "using", "namespace", "include", "template", "typename",
  "new", "delete", "try", "catch", "throw", "typeof", "instanceof", "async", "await", "yield",
  "switch", "case", "break", "continue", "default", "struct", "auto", "typedef",
  "sizeof", "unsigned", "signed", "pass", "lambda", "with", "as"
]);

const SQL_KEYWORDS = new Set([
  "select", "from", "where", "join", "left", "right", "inner", "outer", "cross",
  "on", "group", "by", "having", "order", "asc", "desc", "limit", "offset",
  "distinct", "as", "case", "when", "then", "else", "end", "union", "all",
  "in", "and", "or", "not", "is", "null", "like", "between", "exists",
  "insert", "into", "values", "update", "set", "delete", "create", "table",
  "alter", "drop", "index", "view", "with", "partition", "over",
  "primary", "key", "foreign", "references", "database", "use"
]);

const BUILTINS = new Set([
  "Map", "Set", "Array", "Object", "Math", "String", "Number", "Boolean",
  "console", "List", "HashMap", "HashSet", "ArrayList", "Stack", "Queue",
  "ListNode", "TreeNode", "std", "cout", "cin", "endl", "nullptr", "null", "NULL",
  "undefined", "true", "false", "True", "False", "None", "self",
  "malloc", "free", "printf", "scanf", "strlen", "strcpy", "memset", "size_t",
  "count", "sum", "avg", "min", "max", "coalesce", "ifnull", "row_number", "dense_rank", "rank"
]);

export const highlightLineTokens = (line: string): React.ReactNode => {
  if (!line) return "\n";

  // Regex captures:
  // 1. Comments: //... or #... or --...
  // 2. Strings: "...", '...', `...`
  // 3. Numbers: integers and floats
  // 4. Identifiers: alphanumeric words
  // 5. Operators & punctuation
  const tokenRegex =
    /(\/\/[^\n]*|#[^\n]*|--[^\n]*)|("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*\b)|([^\s\w]+|\s+)/g;

  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    const [raw, comment, str, num, ident] = match;
    const key = `tok-${idx++}`;

    if (comment) {
      elements.push(
        <span key={key} className="text-[#6a9955] italic">
          {comment}
        </span>
      );
    } else if (str) {
      elements.push(
        <span key={key} className="text-[#ce9178]">
          {str}
        </span>
      );
    } else if (num) {
      elements.push(
        <span key={key} className="text-[#b5cea8]">
          {num}
        </span>
      );
    } else if (ident) {
      const lower = ident.toLowerCase();
      if (CODE_KEYWORDS.has(ident)) {
        elements.push(
          <span key={key} className="text-[#c586c0] font-semibold">
            {ident}
          </span>
        );
      } else if (SQL_KEYWORDS.has(lower)) {
        elements.push(
          <span key={key} className="text-[#569cd6] font-bold">
            {ident}
          </span>
        );
      } else if (BUILTINS.has(ident) || BUILTINS.has(lower)) {
        elements.push(
          <span key={key} className="text-[#4ec9b0]">
            {ident}
          </span>
        );
      } else if (line[tokenRegex.lastIndex] === "(") {
        elements.push(
          <span key={key} className="text-[#dcdcaa]">
            {ident}
          </span>
        );
      } else {
        elements.push(
          <span key={key} className="text-[#9cdcfe]">
            {ident}
          </span>
        );
      }
    } else {
      elements.push(
        <span key={key} className="text-[#d4d4d4]">
          {raw}
        </span>
      );
    }
  }

  return elements;
};
