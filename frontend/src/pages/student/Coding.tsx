import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

// Pre-configure Monaco loader with locally bundled package for instant 0ms offline/deployed startup
loader.config({ monaco });
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { codingService } from "@/services/codingService";
import { parseStructuredProblemText } from "@/lib/problemParser";
import { progressService } from "@/services/progressService";
import { notificationService } from "@/services/notificationService";
import { CodingProblem, ExecutionResult, DIFFICULTY_XP } from "@/mocks/codingData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { Dialog } from "@/components/ui/Dialog";
import { useAuth } from "@/context/AuthContext";
import { getScopedItem, setScopedItem } from "@/lib/userScope";
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  RotateCcw,
  Lightbulb,
  Terminal,
  Award,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  History,
  ArrowLeft,
  FileCode2,
  Database,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CodingLanguage = "javascript" | "python" | "java" | "cpp" | "c";
type SqlLanguage = "mysql" | "postgresql" | "sql";
type AnySupportedLanguage = CodingLanguage | SqlLanguage;

const getMonacoLanguage = (lang: string): string => {
  switch (lang) {
    case "javascript":
      return "javascript";
    case "python":
      return "python";
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    case "c":
      return "c";
    case "mysql":
      return "mysql";
    case "postgresql":
      return "pgsql";
    case "sql":
      return "sql";
    default:
      return "javascript";
  }
};

const CODING_LANGUAGE_OPTIONS: CustomSelectOption<CodingLanguage>[] = [
  { value: "javascript", label: "JavaScript (Node 20)" },
  { value: "python", label: "Python 3.12" },
  { value: "java", label: "Java 21" },
  { value: "cpp", label: "C++ 20" },
  { value: "c", label: "C (C11)" },
];

const SQL_LANGUAGE_OPTIONS: CustomSelectOption<SqlLanguage>[] = [
  { value: "mysql", label: "MySQL (Standard)" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sql", label: "SQL (ANSI)" },
];

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  javascript: "js",
  python: "py",
  java: "java",
  cpp: "cpp",
  c: "c",
  mysql: "sql",
  postgresql: "sql",
  sql: "sql",
};

interface SubmissionRecord {
  id: string;
  status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "COMPILE_ERROR" | "RUNTIME_ERROR";
  language: string;
  runtimeMs: number;
  memoryMb: number;
  passedTests: number;
  totalTests: number;
  timestamp: string;
  code: string;
}

interface ProblemLocalState {
  status: "UNSOLVED" | "SOLVED" | "ATTEMPTED";
  attempts: number;
  savedCode: Record<string, string>;
  submissions?: SubmissionRecord[];
}

const getSafeStarterCode = (p?: CodingProblem | null, lang: string = "javascript"): string => {
  if (!p) return "";
  const starter = p.starterCode as any;
  if (starter && starter[lang]) return starter[lang];
  if (starter && starter.javascript) return starter.javascript;
  if (starter && starter.sql) return starter.sql;
  return "// Write your solution below\n";
};

export const Coding: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Navigation View Mode: "list" (catalog table) or "editor" (dedicated IDE)
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");

  // Problem Catalog State
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search State for Catalog View
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"number" | "title" | "difficulty" | "acceptance">("number");
  const [sortAscending, setSortAscending] = useState<boolean>(true);

  // Editor State
  const [language, setLanguage] = useState<AnySupportedLanguage>("javascript");
  const [code, setCode] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);

  // Problem Left Dossier Tabs: "description" | "submissions" (Strictly NO solution tab)
  const [activeDossierTab, setActiveDossierTab] = useState<"description" | "submissions">("description");

  // Collapsible hints state: hints are hidden by default
  const [showHintsSection, setShowHintsSection] = useState(false);
  const [expandedHintIndices, setExpandedHintIndices] = useState<Set<number>>(new Set());

  // Bottom Console Tabs: "testcase" | "result"
  const [activeConsoleTab, setActiveConsoleTab] = useState<"testcase" | "result">("testcase");
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);
  const [selectedResultCaseIndex, setSelectedResultCaseIndex] = useState<number>(0);
  const [isCustomTestCase, setIsCustomTestCase] = useState(false);
  const [customInputText, setCustomInputText] = useState("");

  // Modals & Storage
  const [showResetModal, setShowResetModal] = useState(false);
  const [localStates, setLocalStates] = useState<Record<string, ProblemLocalState>>({});
  const [xpAwardMessage, setXpAwardMessage] = useState<string | null>(null);

  const editorRef = useRef<any>(null);

  // Fetch problems and load scoped user state
  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await codingService.getProblems();
      setProblems(data);

      const storedStates: Record<string, ProblemLocalState> = {};
      data.forEach((p) => {
        try {
          const val = getScopedItem<ProblemLocalState | null>(user?.userId, `coding_state_${p.id}`, null);
          if (val) {
            storedStates[p.id] = val;
          }
        } catch {
          // ignore
        }
      });
      setLocalStates(storedStates);

      if (data.length > 0 && !selectedProblem) {
        setSelectedProblem(data[0]);
      }
    } catch (err) {
      console.warn("Could not load coding problems:", err);
      toast.error("Failed to load problemset");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [user?.userId]);

  const checkProblemIsSql = (p?: CodingProblem | null): boolean => {
    if (!p) return false;
    return Boolean(
      p.category?.toLowerCase().includes("sql") ||
      p.category?.toLowerCase().includes("database") ||
      p.category?.toLowerCase().includes("dbms") ||
      (p as any)?.type === "SQL" ||
      (p as any)?.subject?.toLowerCase().includes("sql") ||
      (p as any)?.subject?.toLowerCase().includes("database") ||
      (p as any)?.subject?.toLowerCase().includes("dbms")
    );
  };

  // Determine if the current selected problem is a SQL/Database challenge
  const isSqlProblem = checkProblemIsSql(selectedProblem);

  // When selected problem changes, adapt the language choices dynamically!
  useEffect(() => {
    if (!selectedProblem) return;

    if (isSqlProblem) {
      if (language !== "mysql" && language !== "postgresql" && language !== "sql") {
        setLanguage("mysql");
      }
    } else {
      if (language === "mysql" || language === "postgresql" || language === "sql") {
        setLanguage("javascript");
      }
    }
  }, [selectedProblem?.id, isSqlProblem]);

  // Dynamically separate problem statement from examples/constraints if raw markdown is present
  const displayProblem = React.useMemo(() => {
    if (!selectedProblem) return null;
    const parsed = parseStructuredProblemText(selectedProblem.description || "");
    const cleanDescription =
      parsed.statement && parsed.examples.length > 0 ? parsed.statement : selectedProblem.description;
    const cleanExamples = parsed.examples.length > 0 ? parsed.examples : selectedProblem.examples;
    const cleanConstraints =
      parsed.constraints.length > 0 ? parsed.constraints : selectedProblem.constraints;

    return {
      ...selectedProblem,
      description: cleanDescription,
      examples: cleanExamples,
      constraints: cleanConstraints,
    };
  }, [selectedProblem]);

  // When selected problem or language changes in editor mode, load saved code
  useEffect(() => {
    if (!selectedProblem) return;

    const pState = localStates[selectedProblem.id];
    const saved = pState?.savedCode?.[language];

    if (saved) {
      setCode(saved);
    } else {
      setCode(getSafeStarterCode(selectedProblem, language));
    }

    // Reset results and collapsible hints when switching problem
    setExecResult(null);
    setActiveConsoleTab("testcase");
    setSelectedTestCaseIndex(0);
    setIsCustomTestCase(false);
    setShowHintsSection(false);
    setExpandedHintIndices(new Set());
    if (selectedProblem.examples && selectedProblem.examples.length > 0) {
      setCustomInputText(selectedProblem.examples[0].input);
    }
  }, [selectedProblem?.id, language]);

  // Code editor updates with auto-save
  const handleCodeChange = (newVal: string) => {
    setCode(newVal);
    if (!selectedProblem) return;

    const currentPState = localStates[selectedProblem.id] || {
      status: "UNSOLVED",
      attempts: 0,
      savedCode: {},
    };

    const updatedState: ProblemLocalState = {
      ...currentPState,
      savedCode: {
        ...currentPState.savedCode,
        [language]: newVal,
      },
    };

    const newMap = { ...localStates, [selectedProblem.id]: updatedState };
    setLocalStates(newMap);
    setScopedItem(user?.userId, `coding_state_${selectedProblem.id}`, updatedState);
  };

  // Open problem in dedicated IDE workspace
  const handleOpenProblem = (p: CodingProblem) => {
    const isSql = checkProblemIsSql(p);
    if (isSql) {
      if (language !== "mysql" && language !== "postgresql" && language !== "sql") {
        setLanguage("mysql");
      }
    } else {
      if (language === "mysql" || language === "postgresql" || language === "sql") {
        setLanguage("javascript");
      }
    }
    setSelectedProblem(p);
    setViewMode("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigation between adjacent problems
  const handleAdjacentProblem = (direction: "prev" | "next") => {
    if (!selectedProblem || problems.length === 0) return;
    const currentIndex = problems.findIndex((p) => p.id === selectedProblem.id);
    if (currentIndex === -1) return;

    let targetIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0) targetIndex = problems.length - 1;
    if (targetIndex >= problems.length) targetIndex = 0;

    const nextProb = problems[targetIndex];
    const isSql = checkProblemIsSql(nextProb);
    if (isSql) {
      if (language !== "mysql" && language !== "postgresql" && language !== "sql") {
        setLanguage("mysql");
      }
    } else {
      if (language === "mysql" || language === "postgresql" || language === "sql") {
        setLanguage("javascript");
      }
    }
    setSelectedProblem(nextProb);
  };

  // Run Code
  const handleRunCode = async () => {
    if (!selectedProblem || isExecuting) return;
    setIsExecuting(true);
    setActiveConsoleTab("result");

    try {
      const customParam = isCustomTestCase ? { inputStr: customInputText } : undefined;
      const res = await codingService.runCode(selectedProblem.id, language, code, customParam);
      setExecResult(res);

      const firstFailIdx = res.testCaseResults?.findIndex((tc) => !tc.passed);
      setSelectedResultCaseIndex(firstFailIdx !== -1 && firstFailIdx !== undefined ? firstFailIdx : 0);

      if (res.status === "ACCEPTED") {
        toast.success("Test passed cleanly!");
      } else if (res.status === "COMPILE_ERROR") {
        toast.error("Compilation / Syntax error detected");
      } else {
        toast.warning(`Test returned: ${res.status.replace(/_/g, " ")}`);
      }
    } catch (err: any) {
      toast.error("Execution failed: " + (err.message || "Unknown error"));
    } finally {
      setIsExecuting(false);
    }
  };

  // Submit Solution
  const handleSubmitCode = async () => {
    if (!selectedProblem || isExecuting) return;
    setIsExecuting(true);
    setActiveConsoleTab("result");

    try {
      const res = await codingService.submitCode(selectedProblem.id, language, code);
      setExecResult(res);

      const firstFailIdx = res.testCaseResults?.findIndex((tc) => !tc.passed);
      setSelectedResultCaseIndex(firstFailIdx !== -1 && firstFailIdx !== undefined ? firstFailIdx : 0);

      const currentPState = localStates[selectedProblem.id] || {
        status: "UNSOLVED",
        attempts: 0,
        savedCode: {},
        submissions: [],
      };

      const newSubmission: SubmissionRecord = {
        id: `sub-${Date.now()}`,
        status: res.status,
        language,
        runtimeMs: res.runtimeMs,
        memoryMb: res.memoryMb,
        passedTests: res.passedTests,
        totalTests: res.totalTests,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        code,
      };

      const updatedSubmissions = [newSubmission, ...(currentPState.submissions || [])];

      if (res.status === "ACCEPTED") {
        const isFirstSolve = currentPState.status !== "SOLVED";
        const awardedXP = selectedProblem.xpReward || DIFFICULTY_XP[selectedProblem.difficulty] || 50;

        const updatedState: ProblemLocalState = {
          ...currentPState,
          status: "SOLVED",
          attempts: currentPState.attempts + 1,
          submissions: updatedSubmissions,
        };

        const newMap = { ...localStates, [selectedProblem.id]: updatedState };
        setLocalStates(newMap);
        setScopedItem(user?.userId, `coding_state_${selectedProblem.id}`, updatedState);

        // Confetti celebration
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        try {
          progressService.recordCodingSubmission(user?.userId, {
            problemId: selectedProblem.id,
            problemTitle: selectedProblem.title,
            difficulty: selectedProblem.difficulty,
            language: language,
            status: "ACCEPTED",
            passedTests: res.passedTests,
            totalTests: res.totalTests,
            runtimeMs: res.runtimeMs,
            xpEarned: awardedXP,
          });

          if (isFirstSolve) {
            setXpAwardMessage(`Solved! You earned +${awardedXP} XP for solving ${selectedProblem.title}!`);
            if (user?.userId) {
              await notificationService.notifyUser(user.userId, {
                title: "Coding Problem Solved!",
                message: `Congratulations! You solved "${selectedProblem.title}" in ${language.toUpperCase()} and earned ${awardedXP} XP.`,
                type: "coding",
                priority: "success",
                audience: "STUDENT",
              });
            }
          } else {
            toast.success("Solution Accepted! All test cases passed!");
          }
        } catch (e) {
          console.warn("Could not record submission:", e);
        }
      } else {
        // Unsuccessful submission (No false pass!)
        try {
          progressService.recordCodingSubmission(user?.userId, {
            problemId: selectedProblem.id,
            problemTitle: selectedProblem.title,
            difficulty: selectedProblem.difficulty,
            language: language,
            status: res.status as any,
            passedTests: res.passedTests,
            totalTests: res.totalTests,
            runtimeMs: res.runtimeMs,
            xpEarned: 0,
          });
        } catch {}

        const updatedState: ProblemLocalState = {
          ...currentPState,
          status: currentPState.status === "SOLVED" ? "SOLVED" : "ATTEMPTED",
          attempts: currentPState.attempts + 1,
          submissions: updatedSubmissions,
        };

        const newMap = { ...localStates, [selectedProblem.id]: updatedState };
        setLocalStates(newMap);
        setScopedItem(user?.userId, `coding_state_${selectedProblem.id}`, updatedState);

        toast.error(`Submission: ${res.status.replace(/_/g, " ")}`);
      }
    } catch (err: any) {
      toast.error("Submission failed: " + (err.message || "Unknown error"));
    } finally {
      setIsExecuting(false);
    }
  };

  // Reset code boilerplate
  const handleResetCode = () => {
    if (!selectedProblem) return;
    const starter = getSafeStarterCode(selectedProblem, language);
    setCode(starter);

    const currentPState = localStates[selectedProblem.id] || {
      status: "UNSOLVED",
      attempts: 0,
      savedCode: {},
    };

    const updatedState: ProblemLocalState = {
      ...currentPState,
      savedCode: {
        ...currentPState.savedCode,
        [language]: starter,
      },
    };

    setLocalStates({ ...localStates, [selectedProblem.id]: updatedState });
    setScopedItem(user?.userId, `coding_state_${selectedProblem.id}`, updatedState);
    setShowResetModal(false);
    toast.info("Editor reset to default starter template");
  };

  // Toggle individual hint
  const toggleHint = (index: number) => {
    setExpandedHintIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Filter & Sort problems for catalog view
  const categoriesList = Array.from(new Set(problems.map((p) => p.category))).filter(Boolean);

  const filteredProblems = problems.filter((p) => {
    const matchQuery =
      searchQuery.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDifficulty = selectedDifficulty === "ALL" || p.difficulty === selectedDifficulty;
    const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;

    const pState = localStates[p.id];
    const status = pState?.status || "UNSOLVED";
    let matchStatus = true;
    if (selectedStatus === "Solved") matchStatus = status === "SOLVED";
    else if (selectedStatus === "Attempted") matchStatus = status === "ATTEMPTED";
    else if (selectedStatus === "Todo") matchStatus = status === "UNSOLVED";

    return matchQuery && matchDifficulty && matchCategory && matchStatus;
  });

  // Sort ascending by default
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    let cmp = 0;
    if (sortField === "number") {
      const numA = (a as any).problemNumber || parseInt(a.title.match(/^\d+/)?.[0] || "9999", 10);
      const numB = (b as any).problemNumber || parseInt(b.title.match(/^\d+/)?.[0] || "9999", 10);
      cmp = numA - numB;
    } else if (sortField === "title") {
      cmp = a.title.localeCompare(b.title);
    } else if (sortField === "difficulty") {
      const rank: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
      cmp = (rank[a.difficulty] || 2) - (rank[b.difficulty] || 2);
    } else if (sortField === "acceptance") {
      const accA = parseFloat(a.acceptance) || 50;
      const accB = parseFloat(b.acceptance) || 50;
      cmp = accA - accB;
    }
    return sortAscending ? cmp : -cmp;
  });

  // KPI Metrics Calculation
  const totalCount = problems.length;
  const solvedCount = problems.filter((p) => localStates[p.id]?.status === "SOLVED").length;
  const easySolved = problems.filter((p) => p.difficulty === "Easy" && localStates[p.id]?.status === "SOLVED").length;
  const easyTotal = problems.filter((p) => p.difficulty === "Easy").length;
  const medSolved = problems.filter((p) => p.difficulty === "Medium" && localStates[p.id]?.status === "SOLVED").length;
  const medTotal = problems.filter((p) => p.difficulty === "Medium").length;
  const hardSolved = problems.filter((p) => p.difficulty === "Hard" && localStates[p.id]?.status === "SOLVED").length;
  const hardTotal = problems.filter((p) => p.difficulty === "Hard").length;

  const totalCodingXp = problems
    .filter((p) => localStates[p.id]?.status === "SOLVED")
    .reduce((sum, p) => sum + (p.xpReward || DIFFICULTY_XP[p.difficulty] || 50), 0);

  const solvedPercentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Editor Line Numbers
  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 16) }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: CATALOG PROBLEMSET VIEW (LeetCode & GFG Style Table)
  // =========================================================================
  if (viewMode === "list") {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Code2 className="w-6 h-6" />
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
                Coding Arena
              </h1>
            </div>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl">
              Solve curated technical challenges from official repositories in{" "}
              <span className="text-cyan-400 font-semibold font-mono">JavaScript, Python, Java, C++, C</span> and{" "}
              <span className="text-blue-400 font-semibold font-mono">MySQL, PostgreSQL & SQL</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin() && (
              <Link to="/admin/coding-tests">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-mono border-cyan-500/40 text-cyan-400">
                  <Database className="w-3.5 h-3.5" />
                  <span>Admin Question Manager</span>
                </Button>
              </Link>
            )}

            {selectedProblem && (
              <Button
                variant="primary"
                onClick={() => setViewMode("editor")}
                className="gap-2 text-xs font-mono"
              >
                <Code2 className="w-4 h-4" />
                <span>Resume ({selectedProblem.title})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Top KPI Metrics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                Problems Solved
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-text-primary">
                  {solvedCount}
                </span>
                <span className="text-xs text-text-muted font-mono">/ {totalCount}</span>
              </div>
              <div className="w-36 h-2 bg-surface-raised rounded-full overflow-hidden mt-2 border border-border">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${solvedPercentage}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-400">{solvedPercentage}%</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-sm space-y-2 md:col-span-2">
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
              Difficulty Mastery
            </span>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold font-mono">Easy</span>
                  <span className="text-emerald-300 font-mono text-[11px]">{easySolved}/{easyTotal}</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: `${easyTotal > 0 ? (easySolved / easyTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold font-mono">Medium</span>
                  <span className="text-amber-300 font-mono text-[11px]">{medSolved}/{medTotal}</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${medTotal > 0 ? (medSolved / medTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-400 font-bold font-mono">Hard</span>
                  <span className="text-rose-300 font-mono text-[11px]">{hardSolved}/{hardTotal}</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 transition-all"
                    style={{ width: `${hardTotal > 0 ? (hardSolved / hardTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                Coding XP Earned
              </span>
              <div className="flex items-baseline gap-1.5">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400/30" />
                <span className="text-2xl font-serif font-bold text-amber-400">
                  +{totalCodingXp}
                </span>
                <span className="text-xs text-text-muted font-mono">XP</span>
              </div>
              <p className="text-[10px] text-text-muted">Earn XP with each accepted solution.</p>
            </div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-4 bg-surface border-border shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions by title, domain, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400 max-w-[180px] truncate"
              >
                <option value="ALL">All Categories</option>
                <option value="Database & SQL">Database & SQL</option>
                {categoriesList
                  .filter((c) => c !== "Database & SQL")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Status</option>
                <option value="Solved">Solved</option>
                <option value="Attempted">Attempted</option>
                <option value="Todo">Todo</option>
              </select>

              {(selectedDifficulty !== "ALL" || selectedCategory !== "ALL" || selectedStatus !== "ALL" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDifficulty("ALL");
                    setSelectedCategory("ALL");
                    setSelectedStatus("ALL");
                    setSearchQuery("");
                  }}
                  className="text-xs font-mono text-text-muted hover:text-text-primary"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* LeetCode Problemset Table */}
        <Card className="p-0 overflow-hidden bg-surface border-border shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-raised text-[11px] font-mono text-text-muted uppercase tracking-wider select-none">
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-cyan-400 transition-colors"
                    onClick={() => {
                      if (sortField === "number") setSortAscending(!sortAscending);
                      else {
                        setSortField("number");
                        setSortAscending(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Problem Title</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Category</th>
                  <th
                    className="py-3 px-4 w-28 cursor-pointer hover:text-cyan-400 transition-colors"
                    onClick={() => {
                      if (sortField === "difficulty") setSortAscending(!sortAscending);
                      else {
                        setSortField("difficulty");
                        setSortAscending(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Difficulty</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 w-28 cursor-pointer hover:text-cyan-400 transition-colors"
                    onClick={() => {
                      if (sortField === "acceptance") setSortAscending(!sortAscending);
                      else {
                        setSortField("acceptance");
                        setSortAscending(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Acceptance</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 w-24">Reward</th>
                  <th className="py-3 px-4 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-sans text-xs">
                {sortedProblems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-text-muted space-y-3">
                      <Code2 className="w-10 h-10 mx-auto text-text-muted/40" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-text-primary">
                          No coding problems available yet
                        </p>
                        <p className="text-xs text-text-secondary max-w-md mx-auto">
                          Questions imported or created by the administrator in the Admin Panel will appear here in real-time.
                        </p>
                      </div>
                      {isAdmin() && (
                        <Link to="/admin/coding-tests" className="inline-block pt-2">
                          <Button variant="primary" size="sm" className="gap-2 text-xs font-mono">
                            <Database className="w-3.5 h-3.5" />
                            <span>Go to Admin Coding Tests to Import Questions</span>
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  sortedProblems.map((prob) => {
                    const pState = localStates[prob.id];
                    const isSolved = pState?.status === "SOLVED";
                    const isAttempted = pState?.status === "ATTEMPTED";
                    const isSql =
                      prob.category?.toLowerCase().includes("sql") ||
                      prob.category?.toLowerCase().includes("database") ||
                      (prob as any).type === "SQL";

                    return (
                      <tr
                        key={prob.id}
                        onClick={() => handleOpenProblem(prob)}
                        className="hover:bg-surface-raised/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 text-center">
                          {isSolved ? (
                            <span title="Solved">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                            </span>
                          ) : isAttempted ? (
                            <span title="Attempted">
                              <Clock className="w-4 h-4 text-amber-400 mx-auto" />
                            </span>
                          ) : (
                            <span className="text-text-muted font-mono text-xs block text-center" title="Todo">
                              —
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-primary group-hover:text-cyan-400 transition-colors">
                              {prob.title}
                            </span>
                            {isSql && (
                              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold">
                                SQL
                              </span>
                            )}
                            {prob.hints && prob.hints.length > 0 && (
                              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                {prob.hints.length} hints
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-text-secondary font-mono text-[11px]">
                          {prob.category}
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant={prob.difficulty.toLowerCase() as any}>
                            {prob.difficulty}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 font-mono text-text-muted text-[11px]">
                          {prob.acceptance || "72%"}
                        </td>

                        <td className="py-3 px-4 font-mono text-amber-400 text-xs font-semibold">
                          +{prob.xpReward || 50} XP
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={isSolved ? "outline" : "primary"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenProblem(prob);
                            }}
                            className="text-xs font-mono py-1 px-3"
                          >
                            {isSolved ? "Review" : "Solve"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED PROBLEM SOLVING IDE WORKSPACE (LeetCode & GFG Style IDE)
  // =========================================================================
  if (!selectedProblem) return null;

  const pState = localStates[selectedProblem.id] || {
    status: "UNSOLVED",
    attempts: 0,
    savedCode: {},
    submissions: [],
  };

  const fileExt = LANGUAGE_EXTENSIONS[language] || "code";
  const submissionsList = pState.submissions || [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Workspace Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-border p-3.5 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className="text-xs font-mono gap-1.5 text-text-muted hover:text-text-primary px-2.5 py-1.5 border border-border"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Problem List</span>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <h2 className="font-serif text-base sm:text-lg font-medium text-text-primary truncate max-w-xs sm:max-w-md">
              {selectedProblem.title}
            </h2>
            <Badge variant={selectedProblem.difficulty.toLowerCase() as any}>
              {selectedProblem.difficulty}
            </Badge>
            {isSqlProblem && (
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                DATABASE
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-surface-raised">
            <button
              onClick={() => handleAdjacentProblem("prev")}
              title="Previous Problem"
              className="p-1.5 hover:bg-surface text-text-muted hover:text-text-primary transition-colors border-r border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAdjacentProblem("next")}
              title="Next Problem"
              className="p-1.5 hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunCode}
            isLoading={isExecuting}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 border-cyan-400/40 hover:bg-cyan-400/10 gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400/30" />
            <span>Run Test</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitCode}
            isLoading={isExecuting}
            className="text-xs font-mono gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Solution</span>
          </Button>
        </div>
      </div>

      {/* XP Award Toast Banner */}
      {xpAwardMessage && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-mono flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{xpAwardMessage}</span>
          </div>
          <button
            onClick={() => setXpAwardMessage(null)}
            className="text-emerald-400/70 hover:text-emerald-300 font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Split Main Grid: Left Problem Dossier & Right Code Editor IDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Problem Dossier */}
        <Card className="lg:col-span-5 p-0 overflow-hidden bg-surface border-border flex flex-col shadow-lg h-[88vh] max-h-[88vh]">
          <div className="flex border-b border-border bg-surface-raised font-mono text-xs select-none shrink-0">
            <button
              onClick={() => setActiveDossierTab("description")}
              className={`px-4 py-3 font-semibold transition-colors flex items-center gap-1.5 ${
                activeDossierTab === "description"
                  ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setActiveDossierTab("submissions")}
              className={`px-4 py-3 font-semibold transition-colors flex items-center gap-1.5 ${
                activeDossierTab === "submissions"
                  ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions ({submissionsList.length})</span>
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-5 custom-scrollbar text-xs font-sans">
            {activeDossierTab === "description" ? (
              (() => {
                const activeProb = displayProblem || selectedProblem;
                return (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={activeProb.difficulty.toLowerCase() as any}>
                          {activeProb.difficulty}
                        </Badge>
                        <span className="text-[11px] font-mono text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
                          {activeProb.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-text-muted">Acceptance: {activeProb.acceptance}</span>
                        <span className="text-amber-400 font-semibold">+{activeProb.xpReward || 50} XP</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-medium text-text-primary">
                        {activeProb.title}
                      </h3>
                      <div className="text-text-secondary leading-relaxed text-xs font-sans prose prose-invert max-w-none space-y-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {activeProb.description}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {(activeProb.inputFormat || activeProb.outputFormat) && (
                      <div className="space-y-2 font-mono text-[11px] p-3 bg-surface-raised border border-border rounded-xl">
                        {activeProb.inputFormat && (
                          <div>
                            <span className="text-text-muted uppercase text-[10px] block font-bold">Input / Schema Format</span>
                            <code className="text-cyan-400 whitespace-pre block">{activeProb.inputFormat}</code>
                          </div>
                        )}
                        {activeProb.outputFormat && (
                          <div className="pt-1.5 border-t border-border">
                            <span className="text-text-muted uppercase text-[10px] block font-bold">Output / Result Table</span>
                            <code className="text-emerald-400 whitespace-pre block">{activeProb.outputFormat}</code>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3 font-mono text-xs">
                      <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
                        Examples
                      </h4>
                      {activeProb.examples.map((ex, idx) => (
                        <div key={idx} className="p-3 bg-surface-raised border border-border rounded-xl space-y-1.5">
                          <span className="text-cyan-400 font-bold text-[11px] block">Example {idx + 1}:</span>
                          <div>
                            <span className="text-text-muted text-[11px]">Input: </span>
                            <code className="text-text-primary bg-surface px-1.5 py-0.5 rounded border border-border text-[11px] whitespace-pre-wrap">
                              {ex.input}
                            </code>
                          </div>
                          <div>
                            <span className="text-text-muted text-[11px]">Output: </span>
                            <code className="text-emerald-400 font-semibold bg-surface px-1.5 py-0.5 rounded border border-border text-[11px] whitespace-pre-wrap">
                              {ex.output}
                            </code>
                          </div>
                          {ex.explanation && (
                            <p className="text-text-secondary text-[11px] pt-1 font-sans italic">
                              Explanation: {ex.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {activeProb.constraints && activeProb.constraints.length > 0 && (
                      <div className="space-y-2 font-mono text-xs">
                        <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
                          Constraints
                        </h4>
                        <ul className="space-y-1.5">
                          {activeProb.constraints.map((c, i) => (
                            <li key={i} className="p-2 bg-surface-raised border border-border rounded-lg flex items-center gap-2 text-[11px] text-text-secondary">
                              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Collapsible Hints Section (Hidden by default, expandable on request) */}
                    {activeProb.hints && activeProb.hints.length > 0 && (
                      <div className="pt-2 border-t border-border space-y-2">
                        <button
                          onClick={() => setShowHintsSection(!showHintsSection)}
                          className="w-full flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 hover:bg-amber-500/15 transition-colors font-mono text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="font-semibold">
                              💡 Need a hint? ({activeProb.hints.length} hints available)
                            </span>
                          </div>
                          {showHintsSection ? (
                            <ChevronUp className="w-4 h-4 text-amber-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-amber-400" />
                          )}
                        </button>

                        {showHintsSection && (
                          <div className="space-y-2.5 pt-1 animate-fade-in font-sans">
                            {activeProb.hints.map((hintText, hIdx) => {
                              const isExpanded = expandedHintIndices.has(hIdx);
                              return (
                                <div
                                  key={hIdx}
                                  className="border border-border rounded-xl overflow-hidden bg-surface-raised transition-colors"
                                >
                                  <button
                                    onClick={() => toggleHint(hIdx)}
                                    className="w-full flex items-center justify-between p-2.5 text-left text-xs font-mono font-medium text-text-secondary hover:text-text-primary hover:bg-surface/50"
                                  >
                                    <span>Hint {hIdx + 1}</span>
                                    <span className="text-[11px] text-cyan-400">
                                      {isExpanded ? "Hide" : "Click to reveal"}
                                    </span>
                                  </button>
                                  {isExpanded && (
                                    <div className="p-3 border-t border-border bg-surface text-text-primary text-xs leading-relaxed animate-fade-in font-sans">
                                      {hintText}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              /* Submissions Tab */
              <div className="space-y-3 font-mono text-xs">
                {submissionsList.length === 0 ? (
                  <div className="py-12 text-center text-text-muted space-y-2 font-sans">
                    <History className="w-8 h-8 mx-auto text-text-muted/40" />
                    <p className="font-medium">No past submissions yet</p>
                    <p className="text-[11px]">Write your solution and click "Submit Solution" to test against all test cases.</p>
                  </div>
                ) : (
                  submissionsList.map((sub) => (
                    <div
                      key={sub.id}
                      className={cn(
                        "p-3 rounded-xl border space-y-2 transition-all",
                        sub.status === "ACCEPTED"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-surface-raised border-border"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {sub.status === "ACCEPTED" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <span
                            className={cn(
                              "font-bold text-xs uppercase",
                              sub.status === "ACCEPTED" ? "text-emerald-400" : "text-rose-400"
                            )}
                          >
                            {sub.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted">{sub.timestamp}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span className="uppercase text-cyan-400 font-semibold">{sub.language}</span>
                        <span>{sub.runtimeMs} ms</span>
                        <span>{sub.memoryMb} MB</span>
                        <span>{sub.passedTests}/{sub.totalTests} passed</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLanguage(sub.language as any);
                          setCode(sub.code);
                          toast.info(`Loaded code from submission (${sub.timestamp})`);
                        }}
                        className="w-full text-[11px] py-1 text-text-muted hover:text-text-primary border border-border"
                      >
                        Load This Code into Editor
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Code Editor & Console Workspace */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-0 overflow-hidden bg-[#1e1e1e] border-[#333333] shadow-2xl">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#252526] border-b border-[#333333]">
              <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#3c3c3c] px-2.5 py-1 rounded-md">
                {isSqlProblem ? (
                  <Database className="w-4 h-4 text-blue-400" />
                ) : (
                  <FileCode2 className="w-4 h-4 text-cyan-400" />
                )}
                <span className="font-mono text-xs font-medium text-[#cccccc]">
                  {isSqlProblem ? "query.sql" : `solution.${fileExt}`}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Dynamic Language Selector: Shows SQL options for Database problems, Coding options otherwise */}
                {isSqlProblem ? (
                  <CustomSelect
                    options={SQL_LANGUAGE_OPTIONS}
                    value={language as SqlLanguage}
                    onChange={(val) => setLanguage(val)}
                    align="right"
                    ariaLabel="Select SQL dialect"
                  />
                ) : (
                  <CustomSelect
                    options={CODING_LANGUAGE_OPTIONS}
                    value={language as CodingLanguage}
                    onChange={(val) => setLanguage(val)}
                    align="right"
                    ariaLabel="Select programming language"
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                  title="Reset code to starter boilerplate"
                  className="p-2 h-auto text-[#858585] hover:text-white border border-[#3c3c3c] font-mono hover:bg-[#2d2d2d]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* VS Code Monaco Editor */}
            <div className="bg-[#1e1e1e] relative border-b border-[#2d2d2d] h-[480px]">
              <Editor
                height="100%"
                theme="vs-dark"
                language={getMonacoLanguage(language)}
                value={code}
                onChange={(value) => handleCodeChange(value || "")}
                onMount={(editor) => {
                  editorRef.current = editor;
                  // Allow outer window / parent scrolling when editor has no overflow or reaches boundary
                  const domNode = editor.getDomNode();
                  if (domNode) {
                    domNode.addEventListener(
                      "wheel",
                      (e: WheelEvent) => {
                        const scrollTop = editor.getScrollTop();
                        const scrollHeight = editor.getScrollHeight();
                        const clientHeight = editor.getLayoutInfo().height;
                        const atTop = scrollTop <= 2 && e.deltaY < 0;
                        const atBottom = scrollTop + clientHeight >= scrollHeight - 3 && e.deltaY > 0;
                        const cannotScroll = scrollHeight <= clientHeight;

                        if (atTop || atBottom || cannotScroll) {
                          let parent: HTMLElement | null = domNode.parentElement;
                          let scrolled = false;
                          while (parent && parent !== document.body) {
                            const style = window.getComputedStyle(parent);
                            if (
                              (style.overflowY === "auto" || style.overflowY === "scroll") &&
                              parent.scrollHeight > parent.clientHeight
                            ) {
                              parent.scrollBy({ top: e.deltaY, behavior: "auto" });
                              scrolled = true;
                              break;
                            }
                            parent = parent.parentElement;
                          }
                          if (!scrolled) {
                            window.scrollBy({ top: e.deltaY, behavior: "auto" });
                          }
                        }
                      },
                      { passive: true }
                    );
                  }
                }}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  lineNumbers: "on",
                  glyphMargin: false,
                  folding: true,
                  matchBrackets: "always",
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: { other: true, comments: false, strings: true },
                  formatOnType: true,
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  renderLineHighlight: "all",
                  wordWrap: "on",
                  scrollbar: {
                    vertical: "visible",
                    horizontal: "visible",
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    useShadows: false,
                    alwaysConsumeMouseWheel: false,
                  },
                  mouseWheelScrollSensitivity: 1,
                  fastScrollSensitivity: 5,
                }}
              />
            </div>
          </Card>

          {/* Bottom Testcase & Execution Result Console */}
          <Card className="p-0 overflow-hidden bg-surface border-border shadow-xl">
            <div className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConsoleTab("testcase")}
                  className={cn(
                    "px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5",
                    activeConsoleTab === "testcase"
                      ? "bg-surface text-cyan-400 border border-border"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Testcase</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab("result")}
                  className={cn(
                    "px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5",
                    activeConsoleTab === "result"
                      ? "bg-surface text-cyan-400 border border-border"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Test Result</span>
                  {execResult && (
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        execResult.status === "ACCEPTED" ? "bg-emerald-400" : "bg-rose-400"
                      )}
                    />
                  )}
                </button>
              </div>

              {execResult && activeConsoleTab === "result" && (
                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {execResult.runtimeMs} ms
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" /> {execResult.memoryMb} MB
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 font-mono text-xs max-h-[460px] overflow-y-auto custom-scrollbar min-h-[140px]">
              {activeConsoleTab === "testcase" ? (
                (() => {
                  const activeProb = displayProblem || selectedProblem;
                  const probTestCases = activeProb.testCases || [];
                  const activeTestCase = probTestCases[selectedTestCaseIndex] || probTestCases[0];

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {probTestCases.map((tc, idx) => (
                          <button
                            key={tc.id || idx}
                            onClick={() => {
                              setIsCustomTestCase(false);
                              setSelectedTestCaseIndex(idx);
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors border",
                              !isCustomTestCase && selectedTestCaseIndex === idx
                                ? "bg-cyan-400/20 text-cyan-400 border-cyan-400/40"
                                : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                            )}
                          >
                            Case {idx + 1}
                          </button>
                        ))}

                        <button
                          onClick={() => setIsCustomTestCase(true)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors border",
                            isCustomTestCase
                              ? "bg-cyan-400/20 text-cyan-400 border-cyan-400/40"
                              : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                          )}
                        >
                          + Custom Testcase
                        </button>
                      </div>

                      {isCustomTestCase ? (
                        <div className="space-y-2 animate-fade-in">
                          <span className="text-text-muted text-[11px] block">
                            Enter custom parameters or input arguments for your function:
                          </span>
                          <textarea
                            value={customInputText}
                            onChange={(e) => setCustomInputText(e.target.value)}
                            placeholder="e.g. nums = [1, 2, 3], target = 4"
                            className="w-full h-20 p-2.5 bg-[#080b12] border border-[#1e293b] rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400 resize-none"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-2 animate-fade-in">
                          <div>
                            <span className="text-text-muted text-[11px] uppercase block font-bold">Input</span>
                            <code className="text-text-primary bg-surface px-2 py-1 rounded border border-border block mt-1 whitespace-pre-wrap">
                              {activeTestCase?.inputStr || "None"}
                            </code>
                          </div>
                          <div>
                            <span className="text-text-muted text-[11px] uppercase block font-bold">Expected Output</span>
                            <code className="text-emerald-400 font-semibold bg-surface px-2 py-1 rounded border border-border block mt-1 whitespace-pre-wrap">
                              {activeTestCase?.expectedStr || "None"}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                /* Test Result Tab (LeetCode / GFG Style) */
                <div className="space-y-4">
                  {!execResult ? (
                    <div className="py-8 text-center text-text-muted space-y-1">
                      <Play className="w-6 h-6 mx-auto text-text-muted/40" />
                      <p>Run your code or submit solution to inspect test outputs</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      {/* Status Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          {execResult.status === "ACCEPTED" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <span
                              className={cn(
                                "font-bold text-sm uppercase tracking-wide",
                                execResult.status === "ACCEPTED" ? "text-emerald-400" : "text-rose-400"
                              )}
                            >
                              {execResult.status.replace(/_/g, " ")}
                            </span>
                            <div className="text-[11px] text-text-muted mt-0.5">
                              {execResult.passedTests} of {execResult.totalTests} testcases passed
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-surface-raised border border-border text-[11px] text-text-secondary flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-cyan-400" /> {execResult.runtimeMs} ms
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-surface-raised border border-border text-[11px] text-text-secondary flex items-center gap-1 font-mono">
                            <Cpu className="w-3 h-3 text-cyan-400" /> {execResult.memoryMb} MB
                          </span>
                        </div>
                      </div>

                      {/* Compilation / Runtime Diagnostics */}
                      {execResult.errorMessage && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs space-y-1 font-mono">
                          <span className="font-bold flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            Diagnostics / Error:
                          </span>
                          <pre className="whitespace-pre-wrap text-[11px] font-mono mt-1 text-rose-200">
                            {execResult.errorMessage}
                          </pre>
                        </div>
                      )}

                      {/* Test Case Result Selector Tabs */}
                      {execResult.testCaseResults && execResult.testCaseResults.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {execResult.testCaseResults.map((tc, idx) => {
                              const isSelected = selectedResultCaseIndex === idx;
                              return (
                                <button
                                  key={tc.id || idx}
                                  onClick={() => setSelectedResultCaseIndex(idx)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
                                    isSelected
                                      ? tc.passed
                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-sm"
                                        : "bg-rose-500/20 text-rose-400 border-rose-500/60 shadow-sm"
                                      : tc.passed
                                        ? "bg-surface-raised text-emerald-400/80 border-border hover:border-emerald-500/40"
                                        : "bg-surface-raised text-rose-400/80 border-border hover:border-rose-500/40"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      tc.passed ? "bg-emerald-400" : "bg-rose-400"
                                    )}
                                  />
                                  <span>Case {idx + 1}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Active Test Case Detail Comparison (LeetCode Style) */}
                          {(() => {
                            const activeTc =
                              execResult.testCaseResults[selectedResultCaseIndex] ||
                              execResult.testCaseResults[0];
                            if (!activeTc) return null;

                            return (
                              <div className="space-y-3 p-3.5 bg-surface-raised border border-border rounded-xl">
                                {/* Case Status Bar */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <span className="flex items-center gap-1.5">
                                    {activeTc.passed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-rose-400" />
                                    )}
                                    <span className={activeTc.passed ? "text-emerald-400" : "text-rose-400 font-bold"}>
                                      Case {selectedResultCaseIndex + 1}: {activeTc.passed ? "Passed" : "Wrong Answer"}
                                    </span>
                                  </span>
                                  <span className="text-[11px] text-text-muted font-normal">
                                    {activeTc.runtimeMs} ms
                                  </span>
                                </div>

                                {/* Input */}
                                <div className="space-y-1">
                                  <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider block">
                                    Input
                                  </span>
                                  <div className="p-2.5 bg-[#080b12] border border-[#1e293b] rounded-lg font-mono text-xs text-text-primary whitespace-pre-wrap">
                                    {activeTc.inputStr || "None"}
                                  </div>
                                </div>

                                {/* Actual Output vs Expected Output */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Your Output */}
                                  <div className="space-y-1">
                                    <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider block flex items-center justify-between">
                                      <span>Your Output (Actual Answer)</span>
                                      {activeTc.passed ? (
                                        <span className="text-emerald-400 lowercase font-normal text-[10px]">match</span>
                                      ) : (
                                        <span className="text-rose-400 lowercase font-bold text-[10px]">mismatch</span>
                                      )}
                                    </span>
                                    <div
                                      className={cn(
                                        "p-2.5 rounded-lg font-mono text-xs border whitespace-pre-wrap",
                                        activeTc.passed
                                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold"
                                          : "bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold"
                                      )}
                                    >
                                      {activeTc.actualStr ?? "undefined"}
                                    </div>
                                  </div>

                                  {/* Expected Output */}
                                  <div className="space-y-1">
                                    <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider block">
                                      Expected Output
                                    </span>
                                    <div className="p-2.5 bg-[#080b12] border border-emerald-500/30 rounded-lg font-mono text-xs text-emerald-400 font-semibold whitespace-pre-wrap">
                                      {activeTc.expectedStr || "None"}
                                    </div>
                                  </div>
                                </div>

                                {/* Stdout for this case if any */}
                                {activeTc.logs && activeTc.logs.length > 0 && (
                                  <div className="space-y-1 pt-1">
                                    <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider block">
                                      Stdout / Prints for this case
                                    </span>
                                    <div className="p-2.5 bg-[#080b12] border border-[#1e293b] rounded-lg font-mono text-[11px] text-[#a5b4fc] space-y-0.5 whitespace-pre-wrap">
                                      {activeTc.logs.map((log, lIdx) => (
                                        <div key={lIdx}>{log}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Global Console Logs & Extra Calculations block (Captures console.log, print, printf, cout, println) */}
                      {execResult.outputLogs && execResult.outputLogs.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-text-muted text-[11px] uppercase font-mono font-bold flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Console Logs & Calculation Output (stdout)</span>
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">
                              {execResult.outputLogs.length} line(s)
                            </span>
                          </div>
                          <div className="bg-[#080b12] border border-[#1e293b] p-3 rounded-xl font-mono text-xs text-[#a5b4fc] max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                            {execResult.outputLogs.map((log, lIdx) => (
                              <div key={lIdx} className="leading-relaxed whitespace-pre-wrap">
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Reset Code Confirmation Modal */}
      <Dialog
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Code Template?"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-text-secondary">
            Are you sure you want to reset your code for{" "}
            <span className="font-semibold text-text-primary">{selectedProblem.title}</span> in{" "}
            <span className="font-mono text-cyan-400">{language.toUpperCase()}</span>? Any unsaved edits will be replaced with the default boilerplate starter code.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleResetCode}>
              Confirm Reset
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Coding;
