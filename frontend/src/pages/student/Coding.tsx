import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { ContextualHelpTooltip } from "@/components/common/ContextualHelpTooltip";
import { codingService } from "@/services/codingService";
import { CodingProblem, ExecutionResult, DIFFICULTY_XP, TestCaseResult } from "@/mocks/codingData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { Dialog } from "@/components/ui/Dialog";
import { highlightLineTokens } from "@/lib/syntaxHighlight";
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  Clock,
  Cpu,
  Sparkles,
  RotateCcw,
  Lock,
  Unlock,
  Lightbulb,
  Terminal,
  HelpCircle,
  Check,
  AlertCircle,
  Award,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS: CustomSelectOption<"javascript" | "python" | "java" | "cpp">[] = [
  { value: "javascript", label: "JavaScript (Node 20)" },
  { value: "python", label: "Python 3.12 (Simulated)" },
  { value: "java", label: "Java 21 (Simulated)" },
  { value: "cpp", label: "C++ 20 (Simulated)" },
];

interface ProblemLocalState {
  status: "UNSOLVED" | "SOLVED" | "SOLVED_WITH_HELP";
  attempts: number;
  unlockedSolution: boolean;
  hintsRevealed: number;
  savedCode: Record<string, string>;
}

export const Coding: React.FC = () => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [isExecuting, setIsExecuting] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "examples" | "constraints" | "hints" | "solution">("description");
  const [solutionLang, setSolutionLang] = useState<"javascript" | "python" | "java" | "cpp">("javascript");

  const [showResetModal, setShowResetModal] = useState(false);
  const [localStates, setLocalStates] = useState<Record<string, ProblemLocalState>>({});
  const [xpAwardMessage, setXpAwardMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Load problems and local storage states
  useEffect(() => {
    codingService.getProblems().then((data) => {
      setProblems(data);
      if (data.length > 0) {
        const first = data[0];
        setSelectedProblem(first);

        // Load local state map
        const storedStates: Record<string, ProblemLocalState> = {};
        data.forEach((p) => {
          try {
            const val = localStorage.getItem(`coding_state_${p.id}`);
            if (val) {
              storedStates[p.id] = JSON.parse(val);
            }
          } catch {
            // ignore
          }
        });
        setLocalStates(storedStates);

        const firstState = storedStates[first.id];
        if (firstState && firstState.savedCode && firstState.savedCode.javascript) {
          setCode(firstState.savedCode.javascript);
        } else {
          setCode(first.starterCode.javascript);
        }
      }
      setLoading(false);
    });
  }, []);

  const getProblemState = (problemId: string): ProblemLocalState => {
    return (
      localStates[problemId] || {
        status: "UNSOLVED",
        attempts: 0,
        unlockedSolution: false,
        hintsRevealed: 0,
        savedCode: {},
      }
    );
  };

  const updateProblemState = (problemId: string, updater: (prev: ProblemLocalState) => ProblemLocalState) => {
    setLocalStates((prevMap) => {
      const current = prevMap[problemId] || {
        status: "UNSOLVED",
        attempts: 0,
        unlockedSolution: false,
        hintsRevealed: 0,
        savedCode: {},
      };
      const next = updater(current);
      try {
        localStorage.setItem(`coding_state_${problemId}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return { ...prevMap, [problemId]: next };
    });
  };

  // Auto-save code on change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (selectedProblem) {
      updateProblemState(selectedProblem.id, (prev) => ({
        ...prev,
        savedCode: {
          ...prev.savedCode,
          [language]: newCode,
        },
      }));
    }
  };

  const handleSelectProblem = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setExecResult(null);
    setXpAwardMessage(null);
    const pState = getProblemState(problem.id);
    if (pState.savedCode && pState.savedCode[language]) {
      setCode(pState.savedCode[language]);
    } else {
      setCode(problem.starterCode[language] || problem.starterCode.javascript);
    }
  };

  const handleLanguageChange = (newLang: "javascript" | "python" | "java" | "cpp") => {
    setLanguage(newLang);
    setSolutionLang(newLang);
    if (selectedProblem) {
      const pState = getProblemState(selectedProblem.id);
      if (pState.savedCode && pState.savedCode[newLang]) {
        setCode(pState.savedCode[newLang]);
      } else {
        setCode(selectedProblem.starterCode[newLang] || "");
      }
    }
  };

  const handleResetCode = () => {
    if (!selectedProblem) return;
    const defaultCode = selectedProblem.starterCode[language] || "";
    handleCodeChange(defaultCode);
    setShowResetModal(false);
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
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#22d3ee", "#4ade80", "#14b8a6", "#818cf8"],
    });
  };

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsExecuting(true);
    setExecResult(null);
    setXpAwardMessage(null);
    try {
      const res = await codingService.runCode(selectedProblem.id, language, code);
      setExecResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsExecuting(true);
    setExecResult(null);
    setXpAwardMessage(null);
    try {
      const res = await codingService.submitCode(selectedProblem.id, language, code);
      setExecResult(res);

      const pState = getProblemState(selectedProblem.id);

      if (res.status === "ACCEPTED") {
        triggerConfetti();

        // Calculate XP reward
        const baseXP = DIFFICULTY_XP[selectedProblem.difficulty] || 50;
        const penaltyMultiplier = Math.max(0.7, 1 - pState.hintsRevealed * 0.1);
        const finalXP = Math.round(baseXP * penaltyMultiplier);

        const newStatus = pState.unlockedSolution ? "SOLVED_WITH_HELP" : "SOLVED";

        updateProblemState(selectedProblem.id, (prev) => ({
          ...prev,
          status: newStatus,
        }));

        setXpAwardMessage(`🎉 Benchmark Solved! Awarded +${finalXP} XP ${pState.hintsRevealed > 0 ? `(${pState.hintsRevealed} hint penalty applied)` : ""}`);
      } else {
        // Failed attempt
        const newAttempts = pState.attempts + 1;
        const shouldAutoUnlock = newAttempts >= 3;

        updateProblemState(selectedProblem.id, (prev) => ({
          ...prev,
          attempts: newAttempts,
          unlockedSolution: prev.unlockedSolution || shouldAutoUnlock,
        }));
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRevealHint = () => {
    if (!selectedProblem) return;
    updateProblemState(selectedProblem.id, (prev) => ({
      ...prev,
      hintsRevealed: Math.min(selectedProblem.hints.length, prev.hintsRevealed + 1),
    }));
  };

  const handleUnlockSolution = () => {
    if (!selectedProblem) return;
    updateProblemState(selectedProblem.id, (prev) => ({
      ...prev,
      unlockedSolution: true,
      status: prev.status === "SOLVED" ? "SOLVED" : "SOLVED_WITH_HELP",
    }));
  };

  if (loading || !selectedProblem) {
    return <CardSkeleton />;
  }

  const pState = getProblemState(selectedProblem.id);
  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(15, lineCount) }, (_, i) => i + 1);

  const problemOptions: CustomSelectOption[] = problems.map((p) => {
    const st = getProblemState(p.id);
    const badgeStr = st.status === "SOLVED" ? "✓" : st.status === "SOLVED_WITH_HELP" ? "⚡" : "";
    return {
      value: p.id,
      label: `${badgeStr} ${p.title} (${p.difficulty})`.trim(),
    };
  });

  const fileExt = language === "javascript" ? "js" : language === "python" ? "py" : language === "java" ? "java" : "cpp";

  return (
    <div className="space-y-6">
      {/* Reset Code Modal */}
      <Dialog
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Editor Code?"
        description="This action will discard your current modifications and restore the starter template."
        maxWidthClass="max-w-md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetCode}>
              Reset Code
            </Button>
          </div>
        }
      >
        <p className="text-xs text-text-secondary leading-relaxed font-sans">
          Are you sure you want to reset your code for <strong className="text-text-primary">{selectedProblem.title}</strong> ({language.toUpperCase()})?
          All un-submitted changes will be permanently lost.
        </p>
      </Dialog>

      {/* Top Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-serif text-2xl font-medium text-text-primary flex items-center gap-2">
              <Code2 className="w-6 h-6 text-cyan-400" /> Coding Arena Benchmarks
            </h2>
            {pState.status === "SOLVED" && (
              <Badge variant="active" className="flex items-center gap-1 font-mono text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> SOLVED
              </Badge>
            )}
            {pState.status === "SOLVED_WITH_HELP" && (
              <Badge variant="accent" className="flex items-center gap-1 font-mono text-[11px]">
                <Sparkles className="w-3 h-3" /> SOLVED WITH HELP
              </Badge>
            )}
            <Badge variant="outline" className="font-mono text-xs text-cyan-400 border-cyan-400/30">
              +{DIFFICULTY_XP[selectedProblem.difficulty]} XP
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Real JavaScript browser execution sandbox with infinite loop protection, error stack trace parsing, hints, and solution analysis.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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

      {/* XP Award Toast Banner */}
      {xpAwardMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-mono flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{xpAwardMessage}</span>
          </div>
          <button onClick={() => setXpAwardMessage(null)} className="text-emerald-400/70 hover:text-emerald-300 font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Workspace */}
        <Card className="lg:col-span-5 p-0 overflow-hidden bg-surface border-border max-h-[80vh] flex flex-col shadow-lg">
          {/* Tabs Navigation */}
          <div className="flex border-b border-border bg-surface-raised font-mono text-xs overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-3.5 py-3 font-semibold transition-colors shrink-0 ${
                activeTab === "description" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("examples")}
              className={`px-3.5 py-3 font-semibold transition-colors shrink-0 ${
                activeTab === "examples" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Test Cases ({selectedProblem.testCases.length})
            </button>
            <button
              onClick={() => setActiveTab("constraints")}
              className={`px-3.5 py-3 font-semibold transition-colors shrink-0 ${
                activeTab === "constraints" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Constraints
            </button>
            <button
              onClick={() => setActiveTab("hints")}
              className={`px-3.5 py-3 font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === "hints" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hints ({pState.hintsRevealed}/{selectedProblem.hints.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("solution")}
              className={`px-3.5 py-3 font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === "solution" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {pState.unlockedSolution ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>Solution</span>
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 space-y-4 font-sans custom-scrollbar">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={selectedProblem.difficulty.toLowerCase() as any}>
                    {selectedProblem.difficulty}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-muted">Acceptance: {selectedProblem.acceptance}</span>
                    <ContextualHelpTooltip
                      title="Coding Benchmark Scoring"
                      content="Submitting a passing solution awards XP based on difficulty. Reveals hints deduct 10% per hint."
                      faqId="pra-1"
                    />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">{selectedProblem.title}</h3>
                <div className="text-xs text-text-secondary whitespace-pre-line leading-relaxed font-sans space-y-2">
                  {selectedProblem.description}
                </div>
              </div>
            )}

            {/* Test Cases Tab */}
            {activeTab === "examples" && (
              <div className="space-y-4 font-mono text-xs">
                {selectedProblem.testCases.map((tc, idx) => (
                  <div key={tc.id} className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-2">
                    <span className="text-cyan-400 font-semibold block">Test Case {idx + 1}:</span>
                    <div><span className="text-text-muted">Input:</span> <code className="text-text-primary bg-surface px-1.5 py-0.5 rounded border border-border">{tc.inputStr}</code></div>
                    <div><span className="text-text-muted">Expected Output:</span> <code className="text-emerald-400 font-semibold bg-surface px-1.5 py-0.5 rounded border border-border">{tc.expectedStr}</code></div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints Tab */}
            {activeTab === "constraints" && (
              <div className="space-y-3 font-mono text-xs">
                <h4 className="text-cyan-400 font-semibold uppercase tracking-wider">Benchmark Constraints</h4>
                <ul className="space-y-2 list-disc list-inside text-text-secondary">
                  {selectedProblem.constraints.map((c, i) => (
                    <li key={i} className="p-2 bg-surface-raised border border-border rounded-lg list-none flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints Tab */}
            {activeTab === "hints" && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold font-mono text-[11px]">Progressive Hint System</p>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      Hints are revealed one at a time. Each revealed hint applies a small -10% penalty to the final XP awarded upon solving.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedProblem.hints.slice(0, pState.hintsRevealed).map((hintText, idx) => (
                    <div key={idx} className="p-3.5 bg-surface-raised border border-cyan-400/30 rounded-xl space-y-1.5 animate-fade-in">
                      <span className="text-cyan-400 font-mono font-semibold text-[11px] block">Hint {idx + 1}:</span>
                      <p className="text-text-secondary leading-relaxed">{hintText}</p>
                    </div>
                  ))}

                  {pState.hintsRevealed < selectedProblem.hints.length && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRevealHint}
                      className="w-full text-xs font-mono gap-2 border-dashed border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 py-2.5"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Reveal Hint {pState.hintsRevealed + 1} of {selectedProblem.hints.length}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Solution Tab */}
            {activeTab === "solution" && (
              <div className="space-y-4 text-xs font-sans">
                {!pState.unlockedSolution ? (
                  <div className="p-6 bg-surface-raised border border-border rounded-xl text-center space-y-4 my-2">
                    <div className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif text-lg font-semibold text-text-primary">Reference Solution Locked</h4>
                      <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
                        Submit a passing solution or complete 3 failed attempts to automatically unlock the full solution analysis.
                      </p>
                      <p className="font-mono text-[11px] text-cyan-400 pt-1">
                        Current attempts: {pState.attempts} / 3
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnlockSolution}
                      className="text-xs font-mono gap-2 border-amber-400/40 text-amber-400 hover:bg-amber-400/10"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock Solution Now (Marks as Solved with Help)</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="font-mono font-semibold text-cyan-400 flex items-center gap-1.5 text-xs">
                        <Unlock className="w-4 h-4 text-emerald-400" /> Reference Solution
                      </span>
                      <div className="flex items-center gap-2">
                        {(["javascript", "python", "java", "cpp"] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSolutionLang(lang)}
                            className={cn(
                              "px-2 py-0.5 rounded font-mono text-[10px] uppercase transition-colors",
                              solutionLang === lang
                                ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40 font-bold"
                                : "text-text-muted hover:text-text-primary"
                            )}
                          >
                            {lang === "javascript" ? "JS" : lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Code display */}
                    <div className="p-3 bg-[#0d1321] border border-[#1e293b] rounded-xl overflow-x-auto font-mono text-xs text-[#e2e8f0]">
                      <pre className="m-0 leading-5">
                        <code>{selectedProblem.solution.code[solutionLang]}</code>
                      </pre>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2 p-3.5 bg-surface-raised border border-border rounded-xl">
                      <h5 className="font-mono font-semibold text-xs text-text-primary">Approach & Algorithm</h5>
                      <p className="text-text-secondary leading-relaxed text-xs">
                        {selectedProblem.solution.explanation}
                      </p>
                    </div>

                    {/* Complexity analysis */}
                    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
                        <span className="text-text-muted text-[10px] uppercase block">Time Complexity</span>
                        <span className="text-emerald-400 font-semibold">{selectedProblem.solution.timeComplexity}</span>
                      </div>
                      <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
                        <span className="text-text-muted text-[10px] uppercase block">Space Complexity</span>
                        <span className="text-cyan-400 font-semibold">{selectedProblem.solution.spaceComplexity}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Code Editor & Toolbar */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-0 overflow-hidden bg-surface border-border shadow-2xl">
            {/* Editor Toolbar */}
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
                  onClick={() => setShowResetModal(true)}
                  title="Reset code to starter template"
                  className="p-2 h-auto text-text-muted hover:text-text-primary border border-border font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>

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

            {/* Non-JS Simulated Execution Advisory Banner */}
            {language !== "javascript" && (
              <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-amber-300 font-mono text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>⚠ Simulated Execution Mode ({language.toUpperCase()}) — Full compilation available when connected to a backend judge.</span>
              </div>
            )}

            {/* Code Editor Pane with Error Line Highlight */}
            <div className="flex bg-[#0d1321] font-mono text-xs overflow-hidden h-[380px] relative">
              {/* Line Numbers Gutter */}
              <div
                ref={gutterRef}
                className="py-4 px-2 text-right bg-[#080b12] text-[#64748b] select-none border-r border-[#1e293b] overflow-hidden shrink-0 min-w-[48px]"
              >
                {lineNumbers.map((num) => {
                  const isErrorLine = execResult?.errorLineNumber === num;
                  return (
                    <div
                      key={num}
                      className={cn(
                        "h-6 leading-6 font-mono text-xs px-1 rounded transition-colors",
                        isErrorLine
                          ? "bg-rose-500/40 text-rose-200 font-bold border border-rose-500/60"
                          : "text-[#64748b]"
                      )}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>

              {/* Editor Workspace */}
              <div className="relative flex-1 bg-[#0d1321] overflow-hidden">
                <pre
                  ref={preRef}
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full p-4 pointer-events-none font-mono text-xs leading-6 whitespace-pre tab-size-2 overflow-hidden m-0 border-0 text-[#e2e8f0]"
                >
                  <code>
                    {code.split("\n").map((line, idx) => {
                      const isErrorLine = execResult?.errorLineNumber === idx + 1;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "h-6 leading-6 transition-colors px-1 rounded",
                            isErrorLine ? "bg-rose-500/25 border-l-2 border-rose-500 text-rose-100" : ""
                          )}
                        >
                          {highlightLineTokens(line)}
                        </div>
                      );
                    })}
                  </code>
                </pre>

                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onScroll={handleScroll}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-cyan-400 focus:outline-none resize-none font-mono text-xs leading-6 whitespace-pre tab-size-2 m-0 border-0"
                />
              </div>
            </div>
          </Card>

          {/* Results Breakdown Panel */}
          {execResult && (
            <Card className="p-4 bg-surface border-border space-y-4 shadow-xl animate-fade-in">
              {/* Verdict Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
                <div className="flex items-center gap-2.5">
                  {execResult.status === "ACCEPTED" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {execResult.status === "WRONG_ANSWER" && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  {execResult.status === "RUNTIME_ERROR" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                  {execResult.status === "TIME_LIMIT_EXCEEDED" && <Clock className="w-5 h-5 text-purple-400 shrink-0" />}
                  {execResult.status === "COMPILE_ERROR" && <FileCode2 className="w-5 h-5 text-rose-400 shrink-0" />}

                  <div>
                    <span className="font-mono text-sm font-bold text-text-primary uppercase tracking-wide">
                      {execResult.status.replace(/_/g, " ")}
                    </span>
                    {execResult.isSimulated && (
                      <span className="ml-2 text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                        SIMULATED
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-text-muted flex-wrap">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {execResult.runtimeMs} ms</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> {execResult.memoryMb} MB</span>
                  <span className="font-semibold text-text-primary">Pass: {execResult.passedTests} / {execResult.totalTests}</span>
                </div>
              </div>

              {/* O(n^2) Complexity Advisory Note */}
              {execResult.hasNestedLoopsAdvisory && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-mono flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>💡 Optimization Advisory: Your code contains nested loops (O(n²)). Can you optimize it to O(n) using a hash map or two pointers?</span>
                </div>
              )}

              {/* Error Message Stack Preview */}
              {execResult.errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 font-mono text-xs space-y-1">
                  <span className="font-bold block">Runtime Exception / Error:</span>
                  <p>{execResult.errorMessage}</p>
                  {execResult.errorLineNumber && (
                    <span className="text-[11px] text-rose-400 font-semibold block pt-0.5">
                      📍 Highlighted error on line {execResult.errorLineNumber} in editor above.
                    </span>
                  )}
                </div>
              )}

              {/* Test Cases Results Breakdown Cards */}
              {execResult.testCaseResults && execResult.testCaseResults.length > 0 && (
                <div className="space-y-2.5">
                  <span className="font-mono text-xs font-semibold text-text-muted uppercase tracking-wider block">
                    Test Case Results ({execResult.passedTests}/{execResult.totalTests} Passed)
                  </span>
                  <div className="grid grid-cols-1 gap-2.5 font-mono text-xs">
                    {execResult.testCaseResults.map((tc, idx) => (
                      <div
                        key={tc.id || idx}
                        className={cn(
                          "p-3 rounded-xl border transition-all space-y-2",
                          tc.passed
                            ? "bg-surface-raised border-emerald-500/30"
                            : "bg-rose-500/10 border-rose-500/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {tc.passed ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            )}
                            <span className="font-semibold text-text-primary">
                              Test Case {idx + 1}: {tc.passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted">{tc.runtimeMs} ms</span>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div><span className="text-text-muted">Input:</span> <code className="text-text-primary">{tc.inputStr}</code></div>
                          <div><span className="text-text-muted">Expected Output:</span> <code className="text-emerald-400 font-semibold">{tc.expectedStr}</code></div>
                          <div>
                            <span className="text-text-muted">Actual Output:</span>{" "}
                            <code className={tc.passed ? "text-emerald-400" : "text-rose-400 font-bold"}>
                              {tc.actualStr}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Console.log Output Drawer */}
              {execResult.outputLogs && execResult.outputLogs.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="font-mono text-xs font-semibold text-text-muted flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Console Logs & Output
                  </span>
                  <div className="bg-[#080b12] border border-[#1e293b] p-3 rounded-xl font-mono text-[11px] text-text-secondary max-h-36 overflow-y-auto space-y-1">
                    {execResult.outputLogs.map((line, idx) => (
                      <p key={idx} className="leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
