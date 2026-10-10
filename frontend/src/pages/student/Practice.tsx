import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { practiceService } from "@/services/practiceService";
import { progressService } from "@/services/progressService";
import {
  ContentItem,
  StudentTestSubmission,
} from "@/services/contentManagerService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Dialog } from "@/components/ui/Dialog";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  RotateCcw,
  Flame,
  Layout,
  Binary,
  HelpCircle,
  Video,
  Award,
  Trophy,
  Users,
  Play,
  ArrowRight,
  AlertTriangle,
  Check,
  Target,
  BarChart3,
  Server,
  Cloud,
  Zap,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

// Dynamic domain icon resolver
const getDomainIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "binary":
      return Binary;
    case "layout":
      return Layout;
    case "server":
      return Server;
    case "braincircuit":
    case "brain-circuit":
      return Sparkles;
    case "barchart3":
    case "bar-chart-3":
      return BarChart3;
    case "cloud":
      return Cloud;
    case "zap":
      return Zap;
    default:
      return Layers;
  }
};

const getTypeConfig = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes("QUIZ")) {
    return {
      label: "MCQ Quiz",
      icon: HelpCircle,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    };
  }
  if (t.includes("MOCK_TEST") || t.includes("MOCK TEST")) {
    return {
      label: "Mock Test",
      icon: Clock,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    };
  }
  if (t.includes("INTERVIEW")) {
    return {
      label: "AI Mock Interview",
      icon: Video,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };
  }
  return {
    label: "Practice Track",
    icon: Sparkles,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
};

// Robust question sanitizer ensuring options and fields are always defined
const extractTestQuestions = (test: ContentItem | null): any[] => {
  if (!test) return [];

  let rawList: any[] = [];
  if (Array.isArray(test.contentData?.questions)) {
    rawList = test.contentData.questions;
  } else if (Array.isArray(test.contentData)) {
    rawList = test.contentData;
  } else if (typeof test.contentData === "string") {
    try {
      const parsed = JSON.parse(test.contentData);
      if (Array.isArray(parsed?.questions)) rawList = parsed.questions;
      else if (Array.isArray(parsed)) rawList = parsed;
    } catch {}
  } else if (Array.isArray(test.payload?.questions)) {
    rawList = test.payload.questions;
  } else if (Array.isArray(test.payload?.mcqQuestions)) {
    rawList = test.payload.mcqQuestions;
  } else if (Array.isArray((test as any).questions)) {
    rawList = (test as any).questions;
  }

  // If no questions found in item, synthesize default fallback questions for this test domain
  if (!rawList || rawList.length === 0) {
    const topic = test.topics?.[0] || test.title;
    const subj = test.subject || "General";
    rawList = [
      {
        id: `q-${test.id}-1`,
        question: `What is the primary architectural requirement for ${topic} in ${subj}?`,
        codeSnippet: `// Benchmark assessment standard for ${subj}\nfunction evaluateInvariant(context: ExecutionContext) {\n  return context.validateCorePrinciples();\n}`,
        options: [
          "Optimizes time complexity to O(1) amortized while guaranteeing data integrity",
          "Executes unindexed full table scans causing unbounded latency spikes",
          "Disables concurrency boundaries without transaction isolation",
          "Forces blocking synchronous network round-trips for all requests",
        ],
        correctIndex: 0,
        explanation: `Under industry-standard engineering guidelines, this strategy guarantees optimal performance while preserving architectural consistency.`,
        difficulty: test.difficulty || "Medium",
        topic: subj,
        keyPoints: ["Optimal time and space bounds", "Strict concurrency protection", "Fault-tolerant failure handling"],
      },
      {
        id: `q-${test.id}-2`,
        question: `When implementing production workflows for ${topic}, what is the recommended design pattern?`,
        options: [
          "Decoupled asynchronous event processing with idempotency keys",
          "Hardcoded static credentials in client-side bundles",
          "Synchronous chained RPC calls without circuit breakers",
          "Unbounded in-memory queueing without backpressure management",
        ],
        correctIndex: 0,
        explanation: "Decoupling systems using event streams and idempotency prevents cascade failures and guarantees at-least-once delivery without duplicate state mutations.",
        difficulty: test.difficulty || "Medium",
        topic: subj,
        keyPoints: ["Idempotent request handling", "Circuit breakers and backpressure", "Resilient state management"],
      },
      {
        id: `q-${test.id}-3`,
        question: `How do you diagnose and eliminate performance bottlenecks in ${subj}?`,
        options: [
          "Profiling telemetry traces, inspecting flame graphs, and monitoring P99 latency distribution",
          "Restarting production servers randomly until throughput increases",
          "Removing all unit tests and static validation rules",
          "Increasing CPU cores without analyzing query execution plans",
        ],
        correctIndex: 0,
        explanation: "P99 latency distribution and distributed tracing provide deterministic visibility into queue times, lock contention, and slow downstream dependencies.",
        difficulty: test.difficulty || "Hard",
        topic: subj,
        keyPoints: ["P99 tail latency metrics", "Distributed flame graph inspection", "Root cause elimination"],
      },
    ];
  }

  return rawList.map((q: any, idx: number) => {
    let options: string[] = [];
    if (Array.isArray(q.options)) {
      options = q.options.map((opt: any) => String(opt || ""));
    } else if (typeof q.options === "object" && q.options !== null) {
      options = Object.values(q.options).map((opt: any) => String(opt || ""));
    } else if (Array.isArray(q.choices)) {
      options = q.choices.map((c: any) => String(c || ""));
    } else {
      options = [
        "Primary optimal implementation pattern",
        "Alternative secondary design architecture",
        "Legacy fallback configuration approach",
        "High-throughput asynchronous event model",
      ];
    }

    if (options.length < 2) {
      options = [
        "Primary optimal implementation pattern",
        "Alternative secondary design architecture",
        "Legacy fallback configuration approach",
        "High-throughput asynchronous event model",
      ];
    }

    return {
      id: String(q.id || `q-${test.id}-${idx + 1}`),
      question: String(q.question || q.questionText || q.title || q.prompt || `Assessment Question #${idx + 1}`),
      codeSnippet: typeof q.codeSnippet === "string" ? q.codeSnippet : undefined,
      options,
      correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : 0,
      explanation: String(q.explanation || q.sampleAnswer || "Optimal implementation verified against benchmark standards."),
      difficulty: String(q.difficulty || test.difficulty || "Medium"),
      topic: String(q.topic || test.subject || "General"),
      keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints.map((k: any) => String(k)) : Array.isArray(q.idealAnswerPoints) ? q.idealAnswerPoints.map((k: any) => String(k)) : [],
    };
  });
};

export const Practice: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDomain = searchParams.get("domain") || "ALL";

  const { domains } = useTaxonomy();
  const { user } = useAuth();

  const [tests, setTests] = useState<ContentItem[]>([]);
  const [submissions, setSubmissions] = useState<StudentTestSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");

  // TEST ARENA STATES
  const [activeTest, setActiveTest] = useState<ContentItem | null>(null);
  const [arenaQuestions, setArenaQuestions] = useState<any[]>([]);
  const [inTestArena, setInTestArena] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number | string>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [testTimeSpentSeconds, setTestTimeSpentSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // POST-TEST RESULT & ANALYSIS MODAL
  const [analysisResult, setAnalysisResult] = useState<StudentTestSubmission | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const allTests = await practiceService.getPracticeTests();
      const allSubmissions = practiceService.getStudentSubmissions(user?.userId);
      setTests(Array.isArray(allTests) ? allTests : []);
      setSubmissions(Array.isArray(allSubmissions) ? allSubmissions : []);
    } catch (err) {
      console.error("Failed to load practice tests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("content-updated", handleUpdate);
    window.addEventListener("submissions-updated", handleUpdate);
    return () => {
      window.removeEventListener("content-updated", handleUpdate);
      window.removeEventListener("submissions-updated", handleUpdate);
    };
  }, [user]);

  // Sync URL domain
  useEffect(() => {
    const urlDomain = searchParams.get("domain");
    if (urlDomain && urlDomain !== selectedDomain) {
      setSelectedDomain(urlDomain);
    }
  }, [searchParams]);

  const handleSelectDomain = (slug: string) => {
    setSelectedDomain(slug);
    if (slug === "ALL") {
      searchParams.delete("domain");
    } else {
      searchParams.set("domain", slug);
    }
    setSearchParams(searchParams);
  };

  // Filter tests
  const filteredTests = useMemo(() => {
    const safeTests = Array.isArray(tests) ? tests : [];
    return safeTests.filter((t) => {
      const title = t.title || "";
      const desc = t.description || "";
      const subj = t.subject || "";
      const diff = t.difficulty || "Medium";
      const tType = t.type || "QUIZ";
      const tags = Array.isArray(t.tags) ? t.tags : [];

      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        desc.toLowerCase().includes(search.toLowerCase()) ||
        subj.toLowerCase().includes(search.toLowerCase()) ||
        tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesDiff =
        difficultyFilter === "ALL" || diff.toUpperCase() === difficultyFilter;

      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "QUIZ" && tType.toUpperCase().includes("QUIZ")) ||
        (typeFilter === "MOCK_TEST" && (tType.toUpperCase().includes("MOCK_TEST") || tType.toUpperCase().includes("MOCK TEST"))) ||
        (typeFilter === "MOCK_INTERVIEW" && tType.toUpperCase().includes("INTERVIEW")) ||
        (typeFilter === "PRACTICE_TOPIC" && tType.toUpperCase().includes("PRACTICE"));

      const matchesDomain =
        selectedDomain === "ALL" ||
        subj.toLowerCase() === selectedDomain.toLowerCase() ||
        tags.some((tag) => tag.toLowerCase() === selectedDomain.toLowerCase());

      return matchesSearch && matchesDiff && matchesType && matchesDomain;
    });
  }, [tests, search, difficultyFilter, typeFilter, selectedDomain]);

  // Compute domain stats
  const getDomainStats = (domainSlug: string) => {
    const safeTests = Array.isArray(tests) ? tests : [];
    const safeSubmissions = Array.isArray(submissions) ? submissions : [];

    const domainTests = safeTests.filter(
      (t) =>
        (t.subject && t.subject.toLowerCase() === domainSlug.toLowerCase()) ||
        (Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase() === domainSlug.toLowerCase()))
    );
    const domainSubmissions = safeSubmissions.filter((s) => s.domain === domainSlug);
    const attemptedCount = new Set(domainSubmissions.map((s) => s.testId)).size;
    const percent =
      domainTests.length > 0
        ? Math.round((attemptedCount / domainTests.length) * 100)
        : 0;

    return { total: domainTests.length, attempted: attemptedCount, percent };
  };

  // START TEST ACTION
  const handleStartTest = (test: ContentItem) => {
    const parsedQuestions = extractTestQuestions(test);
    setActiveTest(test);
    setArenaQuestions(parsedQuestions);
    setStudentAnswers({});
    setMarkedForReview([]);
    setCurrentQuestionIdx(0);

    const durationMins = test.durationMinutes || test.settings?.durationMinutes || 30;
    setSecondsRemaining(durationMins * 60);
    setTestTimeSpentSeconds(0);
    setInTestArena(true);
  };

  // LIVE TIMER TICKER
  useEffect(() => {
    if (!inTestArena || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTestTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [inTestArena, secondsRemaining]);

  // AUTO-SUBMIT ON TIMER ZERO
  const handleAutoSubmit = async () => {
    if (!activeTest || isSubmitting) return;
    await executeSubmission();
  };

  // MANUAL SUBMIT ACTION
  const handleSubmitTest = async () => {
    if (!activeTest || isSubmitting) return;
    const totalQ = arenaQuestions.length;
    const answeredQ = Object.keys(studentAnswers).length;

    if (answeredQ < totalQ) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredQ} out of ${totalQ} questions. Are you sure you want to submit now?`
      );
      if (!confirmSubmit) return;
    }

    await executeSubmission();
  };

  const executeSubmission = async () => {
    if (!activeTest) return;
    setIsSubmitting(true);
    try {
      const result = await practiceService.submitTestAttempt({
        testId: activeTest.id,
        userId: user?.userId || "demo-student",
        userName: user?.name || "Student",
        timeSpentSeconds: testTimeSpentSeconds,
        answers: studentAnswers,
      });

      setInTestArena(false);
      setActiveTest(null);
      setArenaQuestions([]);
      setAnalysisResult(result);
      toast.success(`Assessment Completed! +${result.xpEarned || 25} XP Earned`, {
        description: `${result.score} of ${result.totalMarks} questions solved correct (${result.percentage}%).`,
      });
      loadData();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-text-primary tracking-tight">
                  Practice Tracks & Assessment Arena
                </h1>
                <Badge variant="accent" className="font-mono text-xs">
                  {tests.length} Available Tests
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Take timed conceptual quizzes, mock tests, and AI domain interviews. Submit anytime, receive immediate score reports, and review correct answers and relative class ranks.
              </p>
            </div>
          </div>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-3 bg-surface-raised/60 border border-border px-4 py-2.5 rounded-2xl self-start md:self-auto">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] text-text-muted font-mono uppercase tracking-wider">
              Tests Attended
            </div>
            <div className="text-xs font-bold text-text-primary">
              <span className="text-cyan-400 font-mono font-bold">
                {submissions.length}
              </span>{" "}
              Completed Evaluations
            </div>
          </div>
        </div>
      </div>

      {/* DOMAIN SELECTION GRID - High Clear Visibility (No Horizontal Strip) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" /> Explore Tests by Domain
            </h2>
          </div>
          <button
            onClick={() => handleSelectDomain("ALL")}
            className={`text-xs font-mono transition-colors ${
              selectedDomain === "ALL"
                ? "text-cyan-400 font-semibold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Show All Domains ({tests.length} tests)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {domains.map((dom) => {
            const isSelected = selectedDomain === dom.slug;
            const IconComponent = getDomainIcon(dom.icon);
            const { total, attempted, percent } = getDomainStats(dom.slug);

            return (
              <div
                key={dom.id}
                onClick={() => handleSelectDomain(isSelected ? "ALL" : dom.slug)}
                className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 group ${
                  isSelected
                    ? "bg-surface-raised border-cyan-400/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50"
                    : "bg-surface border-border hover:border-cyan-500/40 hover:bg-surface-raised/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-cyan-500 text-black font-bold text-[10px] px-2 py-0.5 rounded-full font-mono shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" /> Active Filter
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${dom.color}15`,
                      color: dom.color,
                      border: `1px solid ${dom.color}35`,
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1 pr-6">
                    <h3 className="font-bold text-sm text-text-primary group-hover:text-cyan-400 transition-colors truncate">
                      {dom.name}
                    </h3>
                    <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                      {total} Active Tests & Modules
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <span>
                    {attempted} of {total} Attended
                  </span>
                  <span className={`font-semibold ${percent > 0 ? "text-cyan-400" : "text-text-muted"}`}>
                    {percent}%
                  </span>
                </div>

                <div className="w-full bg-border/40 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & CONTROLS BAR */}
      <div className="space-y-3">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: "All Tests" },
            { id: "QUIZ", label: "MCQ Quizzes", icon: HelpCircle },
            { id: "MOCK_TEST", label: "Mock Tests", icon: Clock },
            { id: "MOCK_INTERVIEW", label: "AI Mock Interviews", icon: Video },
            { id: "PRACTICE_TOPIC", label: "Practice Tracks", icon: Sparkles },
          ].map((tab) => {
            const isSelected = typeFilter === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-cyan-500 text-black font-semibold shadow-sm"
                    : "bg-surface border border-border text-text-muted hover:text-text-primary hover:bg-surface-raised"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Difficulty */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-border">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests, topics, keywords..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-raised border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex bg-surface-raised border border-border p-1 rounded-xl text-xs font-mono self-start sm:self-auto">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  difficultyFilter === diff
                    ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-[#0d1321] font-semibold shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TESTS GRID */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-text-muted">
          Loading practice tests...
        </div>
      ) : filteredTests.length === 0 ? (
        <Card className="p-12 text-center bg-surface border-border">
          <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-base text-text-primary">No Tests Found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or switch to "All Domains".
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => {
            const typeCfg = getTypeConfig(test.type);
            const TypeIcon = typeCfg.icon;
            const timer = test.durationMinutes || test.settings?.durationMinutes || 30;
            const qCount = test.questionsCount || test.contentData?.questions?.length || 5;
            const attendees = test.studentAttempts || 0;

            // Check if current student has a recorded submission for this test
            const userSub = submissions.find((s) => s.testId === test.id);

            return (
              <Card
                key={test.id}
                className="p-5 bg-surface border-border hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Header: Type Badge & Attendee metric */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1 font-semibold ${typeCfg.color}`}
                    >
                      <TypeIcon className="w-3 h-3" />
                      {typeCfg.label}
                    </span>

                    <span className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {attendees} Attended
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-sm text-text-primary group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {test.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  {/* Tags & Time Limit Badge */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-cyan-300 px-2 py-0.5 rounded">
                      {test.subject.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded">
                      {test.difficulty}
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {timer} Mins
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded">
                      {qCount} Questions
                    </span>
                  </div>
                </div>

                {/* Card Action & Results Status */}
                <div className="pt-3 border-t border-border space-y-2.5">
                  {userSub ? (
                    /* Already Attempted State */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Score: {userSub.percentage}%
                        </span>
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Rank #{userSub.rank} of {userSub.totalAttendees}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAnalysisResult(userSub)}
                          className="flex-1 text-xs py-1.5 h-8 border-border text-cyan-400 hover:bg-cyan-500/10"
                        >
                          Review Answers & Analysis
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartTest(test)}
                          className="text-xs py-1.5 h-8 border-border text-text-muted hover:text-text-primary px-3"
                          title="Retake test"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Not Attempted State */
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-mono text-text-muted">
                        Anytime Assessment
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleStartTest(test)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs py-1.5 h-8 px-4 flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-black" />
                        Start Test
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* FULL TIMED TEST ARENA MODAL */}
      {inTestArena && activeTest && (
        <Dialog
          isOpen={inTestArena}
          onClose={() => setShowExitConfirm(true)}
          title={activeTest.title}
          description={`Domain: ${(activeTest.subject || "General").toUpperCase()} · Question ${
            currentQuestionIdx + 1
          } of ${arenaQuestions.length || 1}`}
          maxWidthClass="max-w-4xl"
        >
          {(() => {
            const currentQ = arenaQuestions[currentQuestionIdx];
            const isTimerWarning = secondsRemaining < 120; // under 2 mins

            return (
              <div className="space-y-5">
                {/* Arena Top Bar: Live Timer & Progress */}
                <div className="p-3.5 bg-surface-raised border border-border rounded-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-text-muted">
                      QUESTION {currentQuestionIdx + 1} OF {arenaQuestions.length}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {currentQ?.difficulty || "Medium"}
                    </Badge>
                  </div>

                  {/* Live Timer Pill */}
                  <div
                    className={`px-3 py-1 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 border transition-all ${
                      isTimerWarning
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time Remaining: {formatTimer(secondsRemaining)}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowExitConfirm(true)}
                    className="text-xs h-7 border-border text-rose-400 hover:bg-rose-500/10"
                  >
                    Cancel / Exit
                  </Button>
                </div>

                {/* Question Area */}
                {currentQ ? (
                  <div className="space-y-4 p-5 bg-surface rounded-2xl border border-border">
                    <h3 className="text-sm sm:text-base font-bold text-text-primary leading-relaxed">
                      {currentQuestionIdx + 1}. {currentQ.question}
                    </h3>

                    {currentQ.codeSnippet && (
                      <pre className="p-3.5 bg-ink rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto border border-border/80">
                        {currentQ.codeSnippet}
                      </pre>
                    )}

                    {/* Radio Options List */}
                    {Array.isArray(currentQ.options) && currentQ.options.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {currentQ.options.map((opt: string, optIdx: number) => {
                          const isSelected = studentAnswers[currentQ.id] === optIdx;

                          return (
                            <div
                              key={optIdx}
                              onClick={() =>
                                setStudentAnswers((prev) => ({
                                  ...prev,
                                  [currentQ.id]: optIdx,
                                }))
                              }
                              className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-3 cursor-pointer transition-all select-none ${
                                isSelected
                                  ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 font-semibold shadow-sm"
                                  : "bg-surface-raised border-border text-text-muted hover:border-cyan-500/30 hover:bg-surface-raised/80"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold ${
                                  isSelected
                                    ? "border-cyan-400 bg-cyan-400 text-black"
                                    : "border-border text-text-muted"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span className="flex-1 leading-relaxed">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-text-muted text-xs font-mono">
                    No active question found.
                  </div>
                )}

                {/* Question Navigation Controls & Palette */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                        className="text-xs h-8 border-border"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Previous
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentQuestionIdx >= arenaQuestions.length - 1}
                        onClick={() => setCurrentQuestionIdx((p) => Math.min(arenaQuestions.length - 1, p + 1))}
                        className="text-xs h-8 border-border"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSubmitTest}
                        disabled={isSubmitting}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-5 h-8 shadow-sm"
                      >
                        {isSubmitting ? "Evaluating Results..." : "Submit Test"}
                      </Button>
                    </div>
                  </div>

                  {/* Question Palette Grid */}
                  {Array.isArray(arenaQuestions) && arenaQuestions.length > 0 && (
                    <div className="p-3 bg-surface-raised/60 rounded-xl border border-border flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono text-text-muted mr-2">
                        Question Palette:
                      </span>
                      {arenaQuestions.map((q: any, idx: number) => {
                        const isAnswered = studentAnswers[q.id] !== undefined;
                        const isCurrent = currentQuestionIdx === idx;

                        return (
                          <button
                            key={q.id || idx}
                            type="button"
                            onClick={() => setCurrentQuestionIdx(idx)}
                            className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                              isCurrent
                                ? "ring-2 ring-cyan-400 bg-cyan-500 text-black"
                                : isAnswered
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-surface border border-border text-text-muted hover:border-cyan-500/30"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Dialog>
      )}

      {/* CONFIRM EXIT TEST MODAL */}
      <Dialog
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Exit Active Test?"
        description="Are you sure you want to cancel? Your test responses will not be saved."
        maxWidthClass="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            The timer is currently running. Exiting now will discard this attempt without recording a score.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitConfirm(false)}
              className="text-xs"
            >
              Resume Test
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowExitConfirm(false);
                setInTestArena(false);
                setActiveTest(null);
              }}
              className="bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs px-4"
            >
              Confirm Exit
            </Button>
          </div>
        </div>
      </Dialog>

      {/* COMPREHENSIVE RESULT & DEEP ANALYSIS MODAL */}
      {analysisResult && (
        <Dialog
          isOpen={analysisResult !== null}
          onClose={() => setAnalysisResult(null)}
          title={`Performance & Answer Analysis: ${analysisResult.testTitle}`}
          description={`Domain: ${analysisResult.domain.toUpperCase()} · Completed in ${Math.floor(
            analysisResult.timeSpentSeconds / 60
          )}m ${analysisResult.timeSpentSeconds % 60}s`}
          maxWidthClass="max-w-3xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Score & Relative Ranking Banner */}
            <div className="p-5 bg-surface-raised border border-border rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                  Final Score
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-2xl font-bold font-mono text-cyan-400">
                    {analysisResult.percentage}%
                  </span>
                  <Badge
                    variant={analysisResult.isPassed ? "accent" : "outline"}
                    className={
                      analysisResult.isPassed
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"
                    }
                  >
                    {analysisResult.isPassed ? "PASSED" : "NEEDS PRACTICE"}
                  </Badge>
                </div>
                <p className="text-[11px] text-text-muted font-mono">
                  {analysisResult.score} of {analysisResult.totalMarks} Questions Correct
                </p>
              </div>

              {/* Relative Class Rank Position */}
              <div className="space-y-1 sm:border-l sm:border-border sm:pl-4">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block flex items-center justify-center sm:justify-start gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Relative Class Position
                </span>
                <div className="text-xl font-bold font-mono text-text-primary">
                  Rank #{analysisResult.rank}{" "}
                  <span className="text-xs text-text-muted font-normal">
                    of {analysisResult.totalAttendees} Attendees
                  </span>
                </div>
                <p className="text-[11px] text-cyan-400 font-mono font-semibold">
                  Top{" "}
                  {Math.max(
                    1,
                    Math.round((analysisResult.rank / analysisResult.totalAttendees) * 100)
                  )}
                  % Cohort Percentile
                </p>
              </div>

              {/* XP Award */}
              <div className="space-y-1 sm:border-l sm:border-border sm:pl-4 flex flex-col justify-center">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                  Experience Earned
                </span>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  +{analysisResult.xpEarned ?? (analysisResult.isPassed ? 30 : 10)} XP Added
                </div>
                <p className="text-[11px] text-text-muted font-mono leading-tight">
                  {analysisResult.xpBreakdown || `${analysisResult.score} correct + participation`}
                </p>
              </div>
            </div>

            {/* Question by Question Detailed Review */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-text-muted">
                Question-by-Question Deep Analysis & Explanations
              </h4>

              {Array.isArray(analysisResult?.detailedReview) && analysisResult.detailedReview.map((rev, idx) => (
                <div
                  key={rev.questionId || idx}
                  className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                    rev.isCorrect
                      ? "bg-surface border-emerald-500/30"
                      : "bg-surface border-rose-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-xs text-text-primary leading-relaxed">
                      {idx + 1}. {rev.question}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                        rev.isCorrect
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {rev.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  {rev.codeSnippet && (
                    <pre className="p-2.5 bg-ink rounded-lg font-mono text-[11px] text-cyan-300 overflow-x-auto border border-border/80">
                      {rev.codeSnippet}
                    </pre>
                  )}

                  {/* Options review */}
                  {Array.isArray(rev.options) && rev.options.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {rev.options.map((opt: string, optIdx: number) => {
                        const isStudentChoice = rev.chosenOptionIndex === optIdx;
                        const isActualCorrect = rev.correctOptionIndex === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg border font-mono text-[11px] flex items-center justify-between gap-2 ${
                              isActualCorrect
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                                : isStudentChoice && !isActualCorrect
                                ? "bg-rose-500/10 border-rose-500/40 text-rose-300 line-through"
                                : "bg-surface-raised/40 border-border/60 text-text-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px] shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isActualCorrect && (
                              <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isStudentChoice && !isActualCorrect && (
                              <span className="text-[10px] text-rose-400 font-bold shrink-0">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Deep Architectural Explanation */}
                  <div className="p-3 bg-surface-raised rounded-xl border border-border/80 space-y-1">
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold block">
                      Architectural Explanation & Why You Were{" "}
                      {rev.isCorrect ? "Right" : "Wrong"}:
                    </span>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {rev.explanation}
                    </p>
                    {Array.isArray(rev.keyPoints) && rev.keyPoints.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-mono text-text-muted">Key Concept Tags: </span>
                        {rev.keyPoints.map((kp, kIdx) => (
                          <span
                            key={kIdx}
                            className="text-[10px] font-mono text-cyan-300 bg-surface px-1.5 py-0.5 rounded border border-border mr-1"
                          >
                            #{kp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnalysisResult(null)}
                className="text-xs px-5"
              >
                Close Analysis
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
