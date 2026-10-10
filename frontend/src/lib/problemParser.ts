import { TestCase } from "@/mocks/codingData";

export interface ParsedProblemStructure {
  statement: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: TestCase[];
  followUp?: string;
}

/**
 * Strips HTML tags and unescapes basic HTML entities.
 */
function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<pre>|<\/pre>/gi, "")
    .replace(/<code>|<\/code>/gi, "`")
    .replace(/<strong>|<\/strong>/gi, "")
    .replace(/<em>|<\/em>/gi, "")
    .replace(/<p>|<\/p>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<ul>|<\/ul>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/<[^>]*>/g, "")
    .replace(/\*\*/g, "")
    .trim();
}

/**
 * Parses raw LeetCode / external problem markdown or HTML into structured,
 * separated sections: clean statement, dedicated examples, constraints list,
 * and working, typed test cases with real expected outputs (e.g. true/false).
 */
export function parseStructuredProblemText(rawText: string): ParsedProblemStructure {
  if (!rawText) {
    return {
      statement: "",
      examples: [],
      constraints: [],
      testCases: [],
    };
  }

  // Check if text has examples or constraints markers
  const exampleMarkerRegex = /(?:<p>)?(?:<strong[^>]*>)?(?:Example\s*\d+:?|\*\*Example\s*\d+:?\*\*?|Example:|\*\*Example:\*\*)/i;
  const exampleStartMatch = rawText.match(exampleMarkerRegex);

  // If no examples present in text, return the rawText as statement
  if (!exampleStartMatch || exampleStartMatch.index === undefined) {
    return {
      statement: rawText.trim(),
      examples: [],
      constraints: [],
      testCases: [],
    };
  }

  // 1. Problem statement is everything before the first Example
  let statement = rawText.substring(0, exampleStartMatch.index).trim();
  statement = statement
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();

  const remaining = rawText.substring(exampleStartMatch.index);

  // 2. Identify Constraints and Follow-up boundaries
  const constraintsRegex = /(?:(?:<p>)?(?:<strong[^>]*>)?(?:Constraints:|\*\*Constraints:\*\*|<h\d>Constraints<\/h\d>))/i;
  const constraintsMatch = remaining.match(constraintsRegex);

  const followUpRegex = /(?:(?:<p>)?(?:<strong[^>]*>)?(?:Follow[- ]?up:|\*\*Follow[- ]?up:\*\*))/i;
  const followUpMatch = remaining.match(followUpRegex);

  let examplesRaw = remaining;
  let constraintsRaw = "";
  let followUpRaw = "";

  if (constraintsMatch && constraintsMatch.index !== undefined) {
    examplesRaw = remaining.substring(0, constraintsMatch.index);
    const afterConstraints = remaining.substring(constraintsMatch.index + constraintsMatch[0].length);

    if (followUpMatch && followUpMatch.index !== undefined && followUpMatch.index > constraintsMatch.index) {
      const followUpIndexInAfter = afterConstraints.search(followUpRegex);
      if (followUpIndexInAfter !== -1) {
        constraintsRaw = afterConstraints.substring(0, followUpIndexInAfter);
        followUpRaw = afterConstraints.substring(followUpIndexInAfter);
      } else {
        constraintsRaw = afterConstraints;
      }
    } else {
      constraintsRaw = afterConstraints;
    }
  } else if (followUpMatch && followUpMatch.index !== undefined) {
    examplesRaw = remaining.substring(0, followUpMatch.index);
    followUpRaw = remaining.substring(followUpMatch.index);
  }

  // 3. Parse individual examples
  const examples: { input: string; output: string; explanation?: string }[] = [];
  const exampleBlocks = examplesRaw.split(/(?:Example\s*\d+:?|\*\*Example\s*\d+:?\*\*?|<strong[^>]*>Example\s*\d+:?<\/strong>)/i);

  for (const block of exampleBlocks) {
    if (!block.trim()) continue;

    const inputMatch = block.match(/(?:Input:|\*\*Input:\*\*|<strong[^>]*>Input:?<\/strong>)\s*([\s\S]*?)(?=(?:Output:|\*\*Output:\*\*|<strong[^>]*>Output:?<\/strong>)|$)/i);
    const outputMatch = block.match(/(?:Output:|\*\*Output:\*\*|<strong[^>]*>Output:?<\/strong>)\s*([\s\S]*?)(?=(?:Explanation:|\*\*Explanation:\*\*|<strong[^>]*>Explanation:?<\/strong>)|$)/i);
    const explMatch = block.match(/(?:Explanation:|\*\*Explanation:\*\*|<strong[^>]*>Explanation:?<\/strong>)\s*([\s\S]*?)$/i);

    const inputStr = inputMatch ? cleanText(inputMatch[1]) : "";
    const outputStr = outputMatch ? cleanText(outputMatch[1]) : "";
    const explanationStr = explMatch ? cleanText(explMatch[1]) : undefined;

    if (inputStr || outputStr) {
      examples.push({
        input: inputStr,
        output: outputStr,
        explanation: explanationStr,
      });
    }
  }

  // 4. Parse constraints list
  const constraints: string[] = [];
  if (constraintsRaw) {
    const rawLines = constraintsRaw.split(/\n+/);
    for (let line of rawLines) {
      line = cleanText(line).replace(/^[-*•]\s*/, "").trim();
      if (line.length > 1 && !line.toLowerCase().startsWith("constraints")) {
        constraints.push(line);
      }
    }
  }

  if (followUpRaw) {
    const cleanFollowUp = cleanText(followUpRaw).replace(/^(?:Follow[- ]?up:?|\*\*Follow[- ]?up:?\*\*?)\s*/i, "").trim();
    if (cleanFollowUp) {
      constraints.push(`Follow-up: ${cleanFollowUp}`);
    }
  }

  // 5. Generate real Test Cases matching the parsed examples!
  const testCases: TestCase[] = examples.map((ex, idx) => {
    // Strip parameter assignment if present (e.g. "x = 121" -> "121", "nums = [2,7,11,15], target = 9" -> "[2,7,11,15], 9")
    let cleanInput = ex.input;
    if (/^[a-zA-Z_]\w*\s*=\s*/.test(cleanInput)) {
      cleanInput = cleanInput.replace(/^[a-zA-Z_]\w*\s*=\s*/, "").trim();
    }

    const cleanOutput = ex.output.trim();

    // Parse typed expectedVal
    let expectedVal: any = cleanOutput;
    if (/^true$/i.test(cleanOutput)) {
      expectedVal = true;
    } else if (/^false$/i.test(cleanOutput)) {
      expectedVal = false;
    } else if (/^-?\d+$/.test(cleanOutput)) {
      expectedVal = parseInt(cleanOutput, 10);
    } else if (/^-?\d+\.\d+$/.test(cleanOutput)) {
      expectedVal = parseFloat(cleanOutput);
    } else if (/^\[.*\]$/.test(cleanOutput) || /^\{.*\}$/.test(cleanOutput)) {
      try {
        expectedVal = JSON.parse(cleanOutput);
      } catch {
        expectedVal = cleanOutput;
      }
    }

    return {
      id: idx + 1,
      inputStr: cleanInput || ex.input,
      expectedStr: cleanOutput,
      params: [cleanInput || ex.input],
      expectedVal: expectedVal,
    };
  });

  return {
    statement: statement || rawText.trim(),
    examples,
    constraints: constraints.length > 0 ? constraints : ["1 <= input length <= 10^5", "Optimal runtime expected"],
    testCases,
    followUp: followUpRaw ? cleanText(followUpRaw) : undefined,
  };
}
