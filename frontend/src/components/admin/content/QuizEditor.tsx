import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Code,
  Image as ImageIcon,
  Copy,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QuizQuestionItem, contentManagerService } from "@/services/contentManagerService";

interface QuizEditorProps {
  subject: string;
  topics: string[];
  difficulty: string;
  questions: QuizQuestionItem[];
  onChange: (questions: QuizQuestionItem[]) => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  subject,
  topics,
  difficulty,
  questions,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<"MANUAL" | "AI" | "IMPORT" | "BANK">("MANUAL");

  // New question form state
  const [qText, setQText] = useState("");
  const [qCode, setQCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [marks, setMarks] = useState(1);
  const [qDifficulty, setQDifficulty] = useState(difficulty || "Medium");
  const [qTopic, setQTopic] = useState(topics[0] || subject || "General");

  // AI Generation State
  const [aiTopic, setAiTopic] = useState(topics[0] || "Core Concepts");
  const [aiDifficulty, setAiDifficulty] = useState(difficulty || "Medium");
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestionItem[]>([]);

  // CSV Import State
  const [csvRaw, setCsvRaw] = useState("");
  const [importResult, setImportResult] = useState<any | null>(null);

  // Question duplicate check
  const duplicateWarning = questions.some(
    (q) => q.question.trim().toLowerCase() === qText.trim().toLowerCase() && qText.trim().length > 5
  );

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const next = options.filter((_, i) => i !== index);
      setOptions(next);
      if (correctIdx >= next.length) setCorrectIdx(0);
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleAddManualQuestion = () => {
    if (!qText.trim()) return;
    const filledOptions = options.map((o, i) => o.trim() || `Option ${String.fromCharCode(65 + i)}`);

    const newQ: QuizQuestionItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      question: qText.trim(),
      codeSnippet: showCode && qCode.trim() ? qCode.trim() : undefined,
      options: filledOptions,
      correctIndex: correctIdx,
      explanation: explanation.trim() || "No explanation provided.",
      marks,
      difficulty: qDifficulty,
      topic: qTopic,
    };

    onChange([...questions, newQ]);

    // reset
    setQText("");
    setQCode("");
    setShowCode(false);
    setOptions(["", "", "", ""]);
    setCorrectIdx(0);
    setExplanation("");
    setMarks(1);
  };

  const handleDeleteQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  const handleGenerateAi = async () => {
    setIsGenerating(true);
    setAiMessage(null);
    try {
      const res = await contentManagerService.generateQuizQuestions({
        subject: subject || "General",
        topic: aiTopic,
        difficulty: aiDifficulty,
        questionCount: aiCount,
      });
      setGeneratedQuestions(res.questions);
      setAiMessage(res.message);
    } catch (err: any) {
      setAiMessage("Failed to connect to AI engine. Using local fallback.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAllAi = () => {
    onChange([...questions, ...generatedQuestions]);
    setGeneratedQuestions([]);
    setActiveTab("MANUAL");
  };

  const handleDownloadCsvTemplate = () => {
    const template =
      "Question,OptionA,OptionB,OptionC,OptionD,CorrectOption,Explanation,Topic,Difficulty,Marks\n" +
      '"What is the time complexity of quicksort average case?","O(N)","O(N log N)","O(N^2)","O(log N)","B","Quicksort partitions around pivots","Sorting","Medium",2\n' +
      '"Which data structure uses LIFO order?","Queue","Stack","Tree","Graph","B","Stack operations push and pop from top","Data Structures","Easy",1';

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mcq_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunCsvPreview = async () => {
    if (!csvRaw.trim()) return;
    const res = await contentManagerService.importQuizCsv(csvRaw);
    setImportResult(res);
  };

  const handleConfirmImport = () => {
    if (importResult?.validQuestions?.length) {
      onChange([...questions, ...importResult.validQuestions]);
      setImportResult(null);
      setCsvRaw("");
      setActiveTab("MANUAL");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Header & Method Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Questions Repository ({questions.length})</h3>
          <p className="text-xs text-text-muted">Build, AI-generate, or import question items with row validations</p>
        </div>

        <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-lg border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("MANUAL")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === "MANUAL" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AI")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === "AI" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Generate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("IMPORT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === "IMPORT" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            CSV Import
          </button>
        </div>
      </div>

      {/* TAB 1: MANUAL ADDITION */}
      {activeTab === "MANUAL" && (
        <div className="bg-surface-raised border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Draft Single Question</span>
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="text-xs flex items-center gap-1 text-cyan-400 hover:underline"
            >
              <Code className="w-3.5 h-3.5" />
              {showCode ? "Hide Code Snippet" : "Attach Code Snippet"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Question Statement *</label>
            <textarea
              rows={3}
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="e.g. What is the amortized time complexity of rehashing in an expandable hash map?"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          {duplicateWarning && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Duplicate Warning: A very similar question statement already exists in this quiz.</span>
            </div>
          )}

          {showCode && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Code Snippet (Optional)</label>
              <textarea
                rows={3}
                value={qCode}
                onChange={(e) => setQCode(e.target.value)}
                placeholder="// Enter code snippet here"
                className="w-full px-3 py-2 text-xs font-mono bg-ink border border-border rounded-lg text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Options Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-muted">
                Options ({options.length}/6) • Select radio button for correct answer
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  Add Option
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                    correctIdx === idx ? "bg-cyan-500/10 border-cyan-500/40" : "bg-surface border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="correct-option-group"
                    checked={correctIdx === idx}
                    onChange={() => setCorrectIdx(idx)}
                    className="accent-cyan-400 cursor-pointer w-4 h-4"
                  />
                  <span className="text-xs font-mono font-bold text-text-muted w-5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                    className="flex-1 bg-transparent text-xs text-text-primary focus:outline-none"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="text-text-muted hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation & Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Topic</label>
              <input
                type="text"
                value={qTopic}
                onChange={(e) => setQTopic(e.target.value)}
                placeholder="Topic tag"
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Difficulty</label>
              <select
                value={qDifficulty}
                onChange={(e) => setQDifficulty(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Marks</label>
              <input
                type="number"
                min={1}
                max={10}
                value={marks}
                onChange={(e) => setMarks(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Detailed Explanation</label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this option is correct to help students learn after submission..."
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleAddManualQuestion}
              disabled={!qText.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Question to Quiz
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: AI GENERATION */}
      {activeTab === "AI" && (
        <div className="bg-surface-raised border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Generate Multiple Choice Questions with Gemini AI</span>
          </div>
          <p className="text-xs text-text-muted">
            The platform will automatically formulate conceptual questions, plausible distractors, and educational explanations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Target Topic</label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. Binary Search Trees"
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Quantity (1-10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={aiCount}
                onChange={(e) => setAiCount(Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>
          </div>

          {aiMessage && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>{aiMessage}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleGenerateAi}
              disabled={isGenerating}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? "Synthesizing Questions..." : "Generate AI Questions"}
            </Button>
          </div>

          {/* AI Output Preview */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">
                  Generated Preview ({generatedQuestions.length} items ready)
                </span>
                <Button
                  type="button"
                  onClick={handleAddAllAi}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add All to Quiz
                </Button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {generatedQuestions.map((gq, idx) => (
                  <div key={gq.id || idx} className="p-3 bg-surface border border-border rounded-lg space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-text-primary">
                        {idx + 1}. {gq.question}
                      </p>
                      <button
                        type="button"
                        onClick={() => setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== idx))}
                        className="text-text-muted hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {gq.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`px-2 py-1 rounded ${
                            gq.correctIndex === oIdx ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-text-muted"
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CSV IMPORT */}
      {activeTab === "IMPORT" && (
        <div className="bg-surface-raised border border-border rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Bulk CSV Import</h4>
              <p className="text-xs text-text-muted">Import multiple questions simultaneously with row-level validation</p>
            </div>
            <Button
              type="button"
              onClick={handleDownloadCsvTemplate}
              variant="outline"
              className="text-xs flex items-center gap-1.5 border-border hover:bg-surface text-cyan-400"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template CSV
            </Button>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Paste CSV Content or Drag and Drop file text
            </label>
            <textarea
              rows={5}
              value={csvRaw}
              onChange={(e) => setCsvRaw(e.target.value)}
              placeholder="Question,OptionA,OptionB,OptionC,OptionD,CorrectOption,Explanation,Topic,Difficulty,Marks"
              className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleRunCsvPreview}
              disabled={!csvRaw.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Validate & Preview CSV
            </Button>
          </div>

          {/* Validation Result Preview */}
          {importResult && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-xs flex items-center gap-3">
                  <span className="text-emerald-400 font-semibold">{importResult.validCount} valid rows ready</span>
                  {importResult.errorCount > 0 && (
                    <span className="text-rose-400 font-semibold">{importResult.errorCount} row errors detected</span>
                  )}
                </div>
                {importResult.validCount > 0 && (
                  <Button
                    type="button"
                    onClick={handleConfirmImport}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm & Add {importResult.validCount} Questions
                  </Button>
                )}
              </div>

              {/* Error messages if any */}
              {importResult.errors?.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-red-400">Row Validation Errors:</span>
                  {importResult.errors.map((err: any, i: number) => (
                    <div key={i} className="text-red-300">
                      Row {err.row}: {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* EXISTING QUESTIONS LIST TABLE */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Quiz Content ({questions.length} Items Configured)
        </span>

        {questions.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl bg-surface/50 text-text-muted">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-text-muted/60" />
            <p className="text-sm font-medium">No questions added yet</p>
            <p className="text-xs mt-1">Use the forms above to add manually, generate with AI, or import from CSV.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 bg-surface-raised border border-border rounded-xl flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="font-bold text-cyan-400 font-mono">Q{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {q.topic || "General"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-text-muted">
                      {q.difficulty}
                    </span>
                    <span className="text-text-muted">• {q.marks} mark{q.marks > 1 ? "s" : ""}</span>
                  </div>

                  <p className="text-xs font-medium text-text-primary leading-relaxed">{q.question}</p>

                  {q.codeSnippet && (
                    <pre className="p-2.5 bg-ink rounded border border-border text-[11px] font-mono text-cyan-300 overflow-x-auto">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`px-2.5 py-1.5 rounded-md border text-xs flex items-center gap-2 ${
                          q.correctIndex === oIdx
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold"
                            : "bg-surface border-border text-text-muted"
                        }`}
                      >
                        <span className="font-mono">{String.fromCharCode(65 + oIdx)}.</span>
                        <span className="truncate">{opt}</span>
                        {q.correctIndex === oIdx && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-auto" />}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <p className="text-[11px] text-text-muted italic pt-1 border-t border-border/50">
                      Explanation: {q.explanation}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                  title="Remove question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
