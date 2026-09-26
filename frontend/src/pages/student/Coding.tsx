import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { ContextualHelpTooltip } from "@/components/common/ContextualHelpTooltip";
import { codingService } from "@/services/codingService";
import { CodingProblem, ExecutionResult } from "@/mocks/codingData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { highlightLineTokens } from "@/lib/syntaxHighlight";
import { Code2, Play, Send, CheckCircle2, AlertCircle, FileCode2, Clock, Cpu, Sparkles, RefreshCw } from "lucide-react";

const LANGUAGE_OPTIONS: CustomSelectOption<"javascript" | "python" | "java" | "cpp">[] = [
  { value: "javascript", label: "JavaScript (Node 20)" },
  { value: "python", label: "Python 3.12" },
  { value: "java", label: "Java 21" },
  { value: "cpp", label: "C++ 20" },
];

export const Coding: React.FC = () => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [isExecuting, setIsExecuting] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "examples" | "constraints">("description");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    codingService.getProblems().then((data) => {
      setProblems(data);
      if (data.length > 0) {
        setSelectedProblem(data[0]);
        setCode(data[0].starterCode.javascript);
      }
      setLoading(false);
    });
  }, []);

  const handleSelectProblem = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setCode(problem.starterCode[language] || problem.starterCode.javascript);
    setExecResult(null);
  };

  const handleLanguageChange = (newLang: "javascript" | "python" | "java" | "cpp") => {
    setLanguage(newLang);
    if (selectedProblem) {
      setCode(selectedProblem.starterCode[newLang] || "");
    }
  };

  const handleScroll = () => {
    if (textareaRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      if (gutterRef.current) gutterRef.current.scrollTop = top;
      if (preRef.current) {
        preRef.current.scrollTop = top;
        preRef.current.scrollLeft = left;
      }
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22d3ee", "#4ade80", "#14b8a6"],
    });
  };

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsExecuting(true);
    setExecResult(null);
    try {
      const res = await codingService.runCode(selectedProblem.id, language, code);
      setExecResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsExecuting(true);
    setExecResult(null);
    try {
      const res = await codingService.submitCode(selectedProblem.id, language, code);
      setExecResult(res);
      if (res.status === "ACCEPTED") {
        triggerConfetti();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading || !selectedProblem) {
    return <CardSkeleton />;
  }

  // Line numbers generator
  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(15, lineCount) }, (_, i) => i + 1);

  const problemOptions: CustomSelectOption[] = problems.map((p) => ({
    value: p.id,
    label: `${p.title} (${p.difficulty})`,
  }));

  const fileExt = language === "javascript" ? "js" : language === "python" ? "py" : language === "java" ? "java" : "cpp";

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary flex items-center gap-2">
            <Code2 className="w-6 h-6 text-cyan-400" /> Coding Arena Benchmarks
          </h2>
          <p className="text-xs text-text-secondary">Solve algorithm benchmarks with simulated execution, test cases, and memory profiling.</p>
        </div>

        <div className="flex items-center gap-3">
          <CustomSelect
            options={problemOptions}
            value={selectedProblem.id}
            onChange={(probId) => {
              const p = problems.find((item) => item.id === probId);
              if (p) handleSelectProblem(p);
            }}
            align="right"
            ariaLabel="Select benchmark problem"
          />
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Workspace */}
        <Card className="lg:col-span-5 p-0 overflow-hidden bg-surface border-border max-h-[78vh] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-border bg-surface-raised font-mono text-xs">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "description" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("examples")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "examples" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Test Cases ({selectedProblem.examples.length})
            </button>
            <button
              onClick={() => setActiveTab("constraints")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "constraints" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Constraints
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {activeTab === "description" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={selectedProblem.difficulty.toLowerCase() as any}>
                    {selectedProblem.difficulty}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-muted">Acceptance Rate: {selectedProblem.acceptance}</span>
                    <ContextualHelpTooltip
                      title="Coding Test Scores"
                      content="Scores update automatically upon passing all test cases."
                      faqId="pra-1"
                    />
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-medium text-text-primary">{selectedProblem.title}</h3>
                <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed font-sans">{selectedProblem.description}</p>
              </div>
            )}

            {activeTab === "examples" && (
              <div className="space-y-4 font-mono text-xs">
                {selectedProblem.examples.map((ex, idx) => (
                  <div key={idx} className="p-4 bg-surface-raised border border-border rounded-xl space-y-2">
                    <span className="text-cyan-400 font-semibold block">Example {idx + 1}:</span>
                    <div><span className="text-text-muted">Input:</span> <span className="text-text-primary">{ex.input}</span></div>
                    <div><span className="text-text-muted">Output:</span> <span className="text-live font-semibold">{ex.output}</span></div>
                    {ex.explanation && <p className="text-[11px] text-text-secondary pt-1 font-sans">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "constraints" && (
              <div className="space-y-2 font-mono text-xs">
                <h4 className="text-cyan-400 uppercase tracking-wider">Problem Constraints</h4>
                <ul className="space-y-1 list-disc list-inside text-text-muted">
                  {selectedProblem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Code Editor & Toolbar */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-0 overflow-hidden bg-surface border-border shadow-2xl">
            {/* Editor Toolbar (Theme-aware chrome) */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-raised border-b border-border">
              <div className="flex items-center gap-2 bg-surface border border-border px-2.5 py-1 rounded-md">
                <FileCode2 className="w-4 h-4 text-accent" />
                <span className="font-mono text-xs font-medium text-text-primary">
                  solution.{fileExt}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <CustomSelect
                  options={LANGUAGE_OPTIONS}
                  value={language}
                  onChange={(val) => handleLanguageChange(val as any)}
                  align="right"
                  ariaLabel="Select programming language"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRunCode}
                  isLoading={isExecuting}
                  className="text-xs text-accent hover:text-accent-bright border border-border hover:bg-surface font-mono"
                >
                  <Play className="w-3.5 h-3.5 text-accent" /> Run Test
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitCode}
                  isLoading={isExecuting}
                  className="text-xs font-mono"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Solution
                </Button>
              </div>
            </div>

            {/* Code Editor Pane (Option A: Dedicated Dark Scheme with high contrast line numbers and syntax highlighting) */}
            <div className="flex bg-[#0d1321] font-mono text-xs overflow-hidden h-[380px] relative">
              {/* Line Numbers Gutter */}
              <div
                ref={gutterRef}
                className="py-4 px-3 text-right bg-[#080b12] text-[#64748b] select-none border-r border-[#1e293b] overflow-hidden shrink-0 min-w-[48px]"
              >
                {lineNumbers.map((num) => (
                  <div key={num} className="h-6 leading-6 font-mono text-xs">
                    {num}
                  </div>
                ))}
              </div>

              {/* Editor Workspace */}
              <div className="relative flex-1 bg-[#0d1321] overflow-hidden">
                <pre
                  ref={preRef}
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full p-4 pointer-events-none font-mono text-xs leading-6 whitespace-pre tab-size-2 overflow-hidden m-0 border-0 text-[#e2e8f0]"
                >
                  <code>
                    {code.split("\n").map((line, idx) => (
                      <div key={idx} className="h-6 leading-6">
                        {highlightLineTokens(line)}
                      </div>
                    ))}
                  </code>
                </pre>

                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={handleScroll}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-cyan-400 focus:outline-none resize-none font-mono text-xs leading-6 whitespace-pre tab-size-2 m-0 border-0"
                />
              </div>
            </div>
          </Card>

          {/* Execution Result Box */}
          {execResult && (
            <Card className="p-4 bg-surface border-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-live animate-bounce shrink-0" />
                  <VerdictHeadline
                    prefix="Your Solution is "
                    score={Math.round((execResult.passedTests / execResult.totalTests) * 100)}
                    size="sm"
                    as="div"
                  />
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {execResult.runtimeMs} ms</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> {execResult.memoryMb} MB</span>
                  <span>Pass: {execResult.passedTests} / {execResult.totalTests}</span>
                </div>
              </div>

              <div className="font-mono text-xs space-y-1 text-text-secondary bg-surface-raised p-3 rounded-lg border border-border">
                {execResult.outputLogs.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
