import React, { useState } from "react";
import { Plus, Trash2, Play, CheckCircle2, AlertCircle, Code, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contentManagerService } from "@/services/contentManagerService";

export interface CodingTestCase {
  id: string;
  inputStr: string;
  expectedStr: string;
  isHidden: boolean;
  points: number;
}

export interface CodingEditorData {
  statement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  languages?: string[];
  starterCode?: Record<string, string>;
  testCases?: CodingTestCase[];
  hints?: string[];
  editorial?: string;
  referenceSolution?: string;
  referenceLanguage?: string;
}

interface CodingEditorProps {
  data: CodingEditorData;
  onChange: (updated: CodingEditorData) => void;
}

export const CodingEditor: React.FC<CodingEditorProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<"STATEMENT" | "STARTER" | "TESTCASES" | "VALIDATE">("STATEMENT");
  const [selectedLang, setSelectedLang] = useState("python");

  // New Test Case State
  const [tcInput, setTcInput] = useState("");
  const [tcExpected, setTcExpected] = useState("");
  const [tcHidden, setTcHidden] = useState(false);
  const [tcPoints, setTcPoints] = useState(20);

  // Bulk test case paste state
  const [bulkTcRaw, setBulkTcRaw] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);

  const testCases = data.testCases || [];
  const starterCode = data.starterCode || {
    python: "# Write your solution here\ndef solve():\n    pass",
    java: "class Solution {\n    public void solve() {\n        // Code here\n    }\n}",
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}",
    javascript: "function solve() {\n    // Implementation\n}",
  };

  const handleAddTestCase = () => {
    if (!tcInput.trim() || !tcExpected.trim()) return;

    const newTc: CodingTestCase = {
      id: `tc-${Date.now()}`,
      inputStr: tcInput.trim(),
      expectedStr: tcExpected.trim(),
      isHidden: tcHidden,
      points: tcPoints,
    };

    onChange({
      ...data,
      testCases: [...testCases, newTc],
    });

    setTcInput("");
    setTcExpected("");
    setTcHidden(false);
    setTcPoints(20);
  };

  const handleBulkAddTestCases = () => {
    if (!bulkTcRaw.trim()) return;
    const blocks = bulkTcRaw.split("---").map((b) => b.trim()).filter(Boolean);
    const newItems: CodingTestCase[] = [];

    blocks.forEach((block, i) => {
      const lines = block.split("\n");
      const inIdx = lines.findIndex((l) => l.toLowerCase().startsWith("input:"));
      const outIdx = lines.findIndex((l) => l.toLowerCase().startsWith("output:"));
      if (inIdx !== -1 && outIdx !== -1) {
        const inStr = lines.slice(inIdx + 1, outIdx).join("\n").trim();
        const outStr = lines.slice(outIdx + 1).join("\n").trim();
        newItems.push({
          id: `tc-bulk-${Date.now()}-${i}`,
          inputStr: inStr,
          expectedStr: outStr,
          isHidden: i > 1,
          points: 20,
        });
      }
    });

    if (newItems.length > 0) {
      onChange({ ...data, testCases: [...testCases, ...newItems] });
      setBulkTcRaw("");
      setShowBulkModal(false);
    }
  };

  const handleRunValidation = async () => {
    if (!data.referenceSolution?.trim()) return;
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await contentManagerService.validateSolution({
        language: data.referenceLanguage || "python",
        sourceCode: data.referenceSolution,
        testCases,
      });
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult({
        status: "FAILED",
        message: "Validation engine timed out or encountered an issue.",
        results: [],
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Problem Configuration & Judge Engine</h3>
          <p className="text-xs text-text-muted">
            Configure problem statement, constraints, visible/hidden test cases, and validate with reference solution.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-lg border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("STATEMENT")}
            className={`px-3 py-1.5 rounded-md font-medium ${
              activeTab === "STATEMENT" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Statement & Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("STARTER")}
            className={`px-3 py-1.5 rounded-md font-medium ${
              activeTab === "STARTER" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Starter Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("TESTCASES")}
            className={`px-3 py-1.5 rounded-md font-medium ${
              activeTab === "TESTCASES" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Test Cases ({testCases.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VALIDATE")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium ${
              activeTab === "VALIDATE" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            Validate Solution
          </button>
        </div>
      </div>

      {/* TAB 1: STATEMENT & SPECS */}
      {activeTab === "STATEMENT" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Problem Statement (Markdown Supported) *</label>
            <textarea
              rows={6}
              value={data.statement || ""}
              onChange={(e) => onChange({ ...data, statement: e.target.value })}
              placeholder="### Problem Description&#10;Given an array of integers `nums`, return the indices of the two numbers such that they add up to `target`..."
              className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Input Format</label>
              <textarea
                rows={3}
                value={data.inputFormat || ""}
                onChange={(e) => onChange({ ...data, inputFormat: e.target.value })}
                placeholder="The first line contains an integer N..."
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Output Format</label>
              <textarea
                rows={3}
                value={data.outputFormat || ""}
                onChange={(e) => onChange({ ...data, outputFormat: e.target.value })}
                placeholder="Output the computed index pair..."
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Constraints</label>
            <textarea
              rows={2}
              value={data.constraints || ""}
              onChange={(e) => onChange({ ...data, constraints: e.target.value })}
              placeholder="1 <= N <= 10^5&#10;-10^9 <= nums[i] <= 10^9"
              className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Execution Time Limit (ms)</label>
              <input
                type="number"
                min={500}
                max={10000}
                step={500}
                value={data.timeLimitMs || 2000}
                onChange={(e) => onChange({ ...data, timeLimitMs: parseInt(e.target.value, 10) || 2000 })}
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Memory Limit (MB)</label>
              <input
                type="number"
                min={64}
                max={1024}
                value={data.memoryLimitMb || 256}
                onChange={(e) => onChange({ ...data, memoryLimitMb: parseInt(e.target.value, 10) || 256 })}
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STARTER CODE */}
      {activeTab === "STARTER" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            {["python", "java", "cpp", "javascript"].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 text-xs rounded-md font-mono capitalize ${
                  selectedLang === lang ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Starter Boilerplate Code for {selectedLang.toUpperCase()}
            </label>
            <textarea
              rows={10}
              value={starterCode[selectedLang] || ""}
              onChange={(e) => {
                const next = { ...starterCode, [selectedLang]: e.target.value };
                onChange({ ...data, starterCode: next });
              }}
              className="w-full px-3 py-2 text-xs font-mono bg-ink border border-border rounded-lg text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* TAB 3: TEST CASES */}
      {activeTab === "TESTCASES" && (
        <div className="space-y-5">
          <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Create Single Test Case
              </span>
              <button
                type="button"
                onClick={() => setShowBulkModal(!showBulkModal)}
                className="text-xs text-cyan-400 hover:underline"
              >
                {showBulkModal ? "Close Bulk Paste" : "Bulk Add / Paste"}
              </button>
            </div>

            {showBulkModal && (
              <div className="p-3 bg-surface border border-border rounded-lg space-y-2">
                <span className="text-[11px] text-text-muted">Format: Separate cases with --- and use Input: / Output: tags</span>
                <textarea
                  rows={4}
                  value={bulkTcRaw}
                  onChange={(e) => setBulkTcRaw(e.target.value)}
                  placeholder="Input:&#10;[2, 7, 11, 15]&#10;9&#10;Output:&#10;[0, 1]&#10;---&#10;Input:&#10;[3, 2, 4]&#10;6&#10;Output:&#10;[1, 2]"
                  className="w-full px-3 py-2 text-xs font-mono bg-ink border border-border rounded-lg text-text-primary"
                />
                <Button
                  type="button"
                  onClick={handleBulkAddTestCases}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Parse & Insert Cases
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Standard Input</label>
                <textarea
                  rows={3}
                  value={tcInput}
                  onChange={(e) => setTcInput(e.target.value)}
                  placeholder="e.g. 5&#10;1 2 3 4 5"
                  className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Expected Output</label>
                <textarea
                  rows={3}
                  value={tcExpected}
                  onChange={(e) => setTcExpected(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg text-text-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-text-primary">
                  <input
                    type="checkbox"
                    checked={tcHidden}
                    onChange={(e) => setTcHidden(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span>Hidden Test Case (graded only on submit)</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Points:</span>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={tcPoints}
                    onChange={(e) => setTcPoints(parseInt(e.target.value, 10) || 20)}
                    className="w-16 px-2 py-1 text-xs bg-surface border border-border rounded text-text-primary font-mono"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddTestCase}
                disabled={!tcInput.trim() || !tcExpected.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Test Case
              </Button>
            </div>
          </div>

          {/* Test Cases Table */}
          <div className="space-y-2">
            {testCases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-cyan-400">#{idx + 1}</span>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                      tc.isHidden ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    }`}
                  >
                    {tc.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {tc.isHidden ? "Hidden" : "Sample Visible"}
                  </span>
                  <span className="text-text-muted font-mono">{tc.points} pts</span>
                  <span className="text-text-muted truncate max-w-xs font-mono">In: {tc.inputStr.replace(/\n/g, " ")}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onChange({ ...data, testCases: testCases.filter((_, i) => i !== idx) })}
                  className="p-1 text-text-muted hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VALIDATE REFERENCE SOLUTION */}
      {activeTab === "VALIDATE" && (
        <div className="p-5 bg-surface-raised border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Validate with Reference Solution
              </h4>
              <p className="text-xs text-text-muted">
                Run reference code against all {testCases.length} configured test cases through the server judge engine before publishing.
              </p>
            </div>
            <select
              value={data.referenceLanguage || "python"}
              onChange={(e) => onChange({ ...data, referenceLanguage: e.target.value })}
              className="px-3 py-1 text-xs bg-surface border border-border rounded-lg text-text-primary font-mono"
            >
              <option value="python">Python 3</option>
              <option value="java">Java 21</option>
              <option value="cpp">C++ 20</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <textarea
            rows={8}
            value={data.referenceSolution || ""}
            onChange={(e) => onChange({ ...data, referenceSolution: e.target.value })}
            placeholder="# Paste your authoritative reference solution here&#10;def solve():&#10;    # Verified correct logic"
            className="w-full px-3 py-2 text-xs font-mono bg-ink border border-border rounded-lg text-cyan-300 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">
              {testCases.length === 0 ? "Add at least 1 test case first" : `${testCases.length} test cases to evaluate`}
            </span>
            <Button
              type="button"
              onClick={handleRunValidation}
              disabled={isValidating || !data.referenceSolution?.trim() || testCases.length === 0}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              {isValidating ? "Executing in Judge Sandbox..." : "Run Reference Verification"}
            </Button>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              validationResult.status === "ALL_PASSED"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}>
              <div className="flex items-center gap-2 font-semibold text-xs">
                {validationResult.status === "ALL_PASSED" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <span>{validationResult.message}</span>
              </div>

              {validationResult.results?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                  {validationResult.results.map((r: any) => (
                    <div
                      key={r.testCaseIndex}
                      className="p-2 rounded bg-surface/50 border border-border/50 flex items-center justify-between"
                    >
                      <span>Test #{r.testCaseIndex}</span>
                      <span className={r.passed ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                        {r.passed ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
