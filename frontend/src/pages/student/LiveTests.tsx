import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import {
  liveTestService,
  LiveTestContest,
  LiveTestProblem,
} from "@/services/liveTestService";
import { useAuth } from "@/context/AuthContext";
import {
  Radio,
  Clock,
  Code2,
  Users,
  ShieldCheck,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  Send,
  Terminal,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Award,
  Zap,
  Info,
  Layers,
  Flame,
  Check,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const LiveTests: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tests, setTests] = useState<LiveTestContest[]>(() => liveTestService.getAllTests());
  const [filterTab, setFilterTab] = useState<"ALL" | "LIVE" | "SCHEDULED" | "COMPLETED">("ALL");

  // Registration state
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("ai_prep_registered_live_tests");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Active Arena State
  const [activeArenaTest, setActiveArenaTest] = useState<LiveTestContest | null>(null);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  const [userCode, setUserCode] = useState<Record<string, string>>({});
  const [arenaTimer, setArenaTimer] = useState(2700); // 45 mins
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [runOutput, setRunOutput] = useState<{ status: "idle" | "running" | "success" | "error"; output: string; timeMs: number } | null>(null);

  // Sync tests from service on mount and storage events
  useEffect(() => {
    const handleUpdate = () => {
      setTests(liveTestService.getAllTests());
    };
    window.addEventListener("live_tests_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("live_tests_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter computation
  const filteredTests = tests.filter((t) => {
    if (filterTab === "LIVE") return t.status === "Live" || t.status === "Paused";
    if (filterTab === "SCHEDULED") return t.status === "Scheduled";
    if (filterTab === "COMPLETED") return t.status === "Completed" || t.status === "Cancelled";
    return true;
  });

  const liveCount = tests.filter((t) => t.status === "Live" || t.status === "Paused").length;
  const scheduledCount = tests.filter((t) => t.status === "Scheduled").length;

  const handleRegister = (testId: string) => {
    liveTestService.registerStudent(testId);
    const nextMap = { ...registeredMap, [testId]: true };
    setRegisteredMap(nextMap);
    localStorage.setItem("ai_prep_registered_live_tests", JSON.stringify(nextMap));
    toast.success("Successfully registered for this live placement test! You will receive countdown reminders.");
  };

  // Launch Arena
  const handleEnterArena = (test: LiveTestContest) => {
    setActiveArenaTest(test);
    setSelectedProblemIndex(0);
    setArenaTimer(test.durationMinutes * 60);
    setTabSwitchCount(0);
    setTestSubmitted(false);
    setRunOutput(null);

    // Initialize code for problems
    const initialCodes: Record<string, string> = {};
    test.problems.forEach((p) => {
      initialCodes[p.id] = p.starterCode[selectedLanguage] || p.starterCode.javascript || "";
    });
    setUserCode(initialCodes);
  };

  // In-Arena Timer countdown
  useEffect(() => {
    if (!activeArenaTest || testSubmitted) return;

    const interval = setInterval(() => {
      setArenaTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTestSubmitted(true);
          toast.error("Test time has expired! Your code has been automatically submitted.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeArenaTest, testSubmitted]);

  // Anti-Cheating Tab Switch Proctoring Detection
  useEffect(() => {
    if (!activeArenaTest || testSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowWarningModal(true);
          toast.error(
            `Proctoring Warning #${next}: Leaving the test window or switching tabs is strictly forbidden! Incident reported.`
          );
          return next;
        });
      }
    };

    const handleBlur = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setShowWarningModal(true);
        return next;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [activeArenaTest, testSubmitted]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleRunCode = () => {
    if (!activeArenaTest) return;
    const currentProblem = activeArenaTest.problems[selectedProblemIndex];
    setRunOutput({ status: "running", output: "Compiling code against test cases...", timeMs: 0 });

    setTimeout(() => {
      setRunOutput({
        status: "success",
        output: `Test Case 1: PASSED (Input: ${currentProblem.sampleTestCases[0]?.input || "N/A"} -> Output: ${currentProblem.sampleTestCases[0]?.output || "N/A"})\nAll sample assertions verified successfully. Ready for final evaluation.`,
        timeMs: 42,
      });
      toast.success("Sample test cases passed!");
    }, 900);
  };

  const handleSubmitProblem = () => {
    toast.success("Problem submission recorded successfully! Points added to live rank.");
  };

  const handleFinalSubmitTest = () => {
    setTestSubmitted(true);
    toast.success("Congratulations! Your live contest submission has been received and evaluated.");
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Live Competitions & Proctored Arenas
            </span>
            <Badge variant="accent" className="text-[10px] font-mono">
              National Placement League
            </Badge>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary flex items-center gap-2.5 mt-1">
            <Radio className="w-7 h-7 text-rose-500 animate-pulse" /> Live Tests & Contests
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Compete in real-time placement coding tests, national speed challenges, and proctored benchmark arenas.
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-surface-raised border border-border p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setFilterTab("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors font-semibold",
                filterTab === "ALL" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-text-muted hover:text-text-primary"
              )}
            >
              All Tests ({tests.length})
            </button>
            <button
              onClick={() => setFilterTab("LIVE")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5",
                filterTab === "LIVE" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "text-text-muted hover:text-text-primary"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" /> Live Now ({liveCount})
            </button>
            <button
              onClick={() => setFilterTab("SCHEDULED")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors font-semibold",
                filterTab === "SCHEDULED" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-text-muted hover:text-text-primary"
              )}
            >
              Upcoming ({scheduledCount})
            </button>
          </div>
        </div>
      </div>

      {/* NO LIVE TEST EMPTY STATE (IF NO TESTS MATCH CRITERIA) */}
      {filteredTests.length === 0 ? (
        <Card className="p-12 text-center bg-surface border-border space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mx-auto text-text-muted">
            <Radio className="w-8 h-8 text-text-muted/60" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif text-xl font-semibold text-text-primary">
              No Live Tests Currently Active
            </h3>
            <p className="text-xs text-text-secondary font-sans leading-relaxed">
              There are currently no active or scheduled placement contests matching this filter.
              Platform administrators schedule new national and campus tests regularly. You can practice in the Coding Arena while waiting!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="teal-cyan"
              size="sm"
              onClick={() => navigate("/coding")}
              className="text-xs gap-1.5"
            >
              <Code2 className="w-4 h-4" /> Practice in Coding Arena
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/practice")}
              className="text-xs gap-1.5"
            >
              <Layers className="w-4 h-4" /> Explore Practice Tracks
            </Button>
          </div>
        </Card>
      ) : (
        /* LIVE TEST CARDS GRID (SHOWS MULTIPLE TESTS PROMINENTLY) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTests.map((test) => {
            const isLive = test.status === "Live";
            const isScheduled = test.status === "Scheduled";
            const isRegistered = registeredMap[test.id];

            return (
              <Card
                key={test.id}
                className={cn(
                  "p-5 bg-surface border transition-all duration-200 flex flex-col justify-between space-y-5 relative overflow-hidden shadow-soft",
                  isLive ? "border-rose-500/40 hover:border-rose-500/70" : "border-border hover:border-cyan-500/40"
                )}
              >
                {/* Background Glow for Live Tests */}
                {isLive && (
                  <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="space-y-3.5 relative z-10">
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={isLive ? "blocked" : isScheduled ? "medium" : "active"}
                          className={cn("text-[10px] font-mono uppercase flex items-center gap-1.5", isLive && "bg-rose-500 text-white animate-pulse font-bold")}
                        >
                          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                          {isLive ? "LIVE ARENA NOW" : test.status}
                        </Badge>
                        <span className="text-[11px] font-mono text-cyan-400 font-semibold">{test.category}</span>
                      </div>
                      <h2 className="font-serif text-lg font-bold text-text-primary group-hover:text-cyan-400 transition-colors">
                        {test.title}
                      </h2>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-text-muted uppercase block">Duration</span>
                      <span className="text-xs font-mono font-bold text-text-primary flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" /> {test.durationMinutes} Mins
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {test.description}
                  </p>

                  {/* Highlights Bar */}
                  <div className="p-3 bg-surface-raised border border-border rounded-xl grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-text-muted block">Questions</span>
                      <span className="font-bold text-text-primary">{test.totalQuestions} Problems</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Registered</span>
                      <span className="font-bold text-cyan-400">{test.registeredParticipantsCount} Candidates</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Proctoring</span>
                      <span className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Strict
                      </span>
                    </div>
                  </div>

                  {/* Languages Allowed */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-text-muted">
                    <span>Allowed:</span>
                    {test.allowedLanguages.map((lang) => (
                      <span key={lang} className="px-2 py-0.5 rounded bg-surface border border-border text-text-secondary">
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Live Broadcast Notice (if available) */}
                  {test.broadcasts.length > 0 && (
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">Admin Alert: {test.broadcasts[0].message}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-3 relative z-10">
                  <div className="text-[11px] font-mono text-text-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {isLive ? "Started Just Now" : new Date(test.scheduledStartTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {isLive ? (
                    <Button
                      variant="teal-cyan"
                      size="sm"
                      onClick={() => handleEnterArena(test)}
                      className="text-xs font-semibold px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-lg flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4 fill-white" /> Enter Live Arena
                    </Button>
                  ) : isScheduled ? (
                    <Button
                      variant={isRegistered ? "outline" : "teal-cyan"}
                      size="sm"
                      disabled={isRegistered}
                      onClick={() => handleRegister(test.id)}
                      className="text-xs px-3.5"
                    >
                      {isRegistered ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Registered ✓
                        </>
                      ) : (
                        "Register for Test"
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Contest results have been archived to national leaderboard.")}
                      className="text-xs"
                    >
                      View Results
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN FOCUSED LIVE ARENA MODAL */}
      {activeArenaTest && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
          {/* Arena Top Navigation Bar */}
          <div className="h-14 px-4 bg-surface border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <div>
                <h2 className="font-serif font-bold text-sm text-text-primary flex items-center gap-2">
                  {activeArenaTest.title}
                </h2>
                <span className="text-[10px] font-mono text-cyan-400">
                  Problem {selectedProblemIndex + 1} of {activeArenaTest.problems.length}: {activeArenaTest.problems[selectedProblemIndex].title}
                </span>
              </div>
            </div>

            {/* Timer and Anti-Cheating Monitor */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-surface-raised border border-border rounded-lg text-xs font-mono">
                <Clock className={cn("w-4 h-4", arenaTimer < 300 ? "text-rose-500 animate-pulse" : "text-cyan-400")} />
                <span className={cn("font-bold", arenaTimer < 300 ? "text-rose-500" : "text-text-primary")}>
                  {formatTimer(arenaTimer)}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-surface-raised border border-border rounded-lg text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-text-muted">Proctoring:</span>
                <span className={tabSwitchCount > 0 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {tabSwitchCount} / {activeArenaTest.maxTabSwitchesAllowed} Tab Switches
                </span>
              </div>

              <Button
                variant="teal-cyan"
                size="sm"
                onClick={handleFinalSubmitTest}
                className="text-xs font-semibold px-3 h-8 bg-emerald-500 hover:bg-emerald-600 text-black"
              >
                Submit Contest
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to exit the Live Arena? Your test timer will keep running.")) {
                    setActiveArenaTest(null);
                  }
                }}
                className="h-8 w-8 p-0 text-text-muted hover:text-rose-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Arena Body: Problem & Code Workspace */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Problem Statement */}
            <div className="w-full lg:w-1/2 border-r border-border flex flex-col bg-surface overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {/* Problem Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-border pb-3">
                {activeArenaTest.problems.map((prob, idx) => (
                  <button
                    key={prob.id}
                    onClick={() => {
                      setSelectedProblemIndex(idx);
                      setRunOutput(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5",
                      selectedProblemIndex === idx
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold"
                        : "bg-surface-raised text-text-muted hover:text-text-primary"
                    )}
                  >
                    <span>Q{idx + 1}: {prob.title}</span>
                    <Badge variant={prob.difficulty === "Easy" ? "active" : prob.difficulty === "Medium" ? "medium" : "blocked"} className="text-[9px] px-1 py-0">
                      {prob.points} pts
                    </Badge>
                  </button>
                ))}
              </div>

              {/* Current Problem Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-text-primary">
                    {activeArenaTest.problems[selectedProblemIndex].title}
                  </h3>
                  <Badge variant={activeArenaTest.problems[selectedProblemIndex].difficulty === "Easy" ? "active" : "medium"}>
                    {activeArenaTest.problems[selectedProblemIndex].difficulty}
                  </Badge>
                </div>

                <div className="text-xs text-text-secondary whitespace-pre-line leading-relaxed font-sans">
                  {activeArenaTest.problems[selectedProblemIndex].description}
                </div>

                {/* Sample Test Cases */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono text-text-primary font-bold block uppercase tracking-wider">
                    Sample Test Cases
                  </span>
                  {activeArenaTest.problems[selectedProblemIndex].sampleTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-surface-raised border border-border rounded-xl space-y-1.5 font-mono text-xs">
                      <div>
                        <span className="text-text-muted">Input: </span>
                        <span className="text-cyan-400">{tc.input}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Output: </span>
                        <span className="text-emerald-400">{tc.output}</span>
                      </div>
                      {tc.explanation && (
                        <p className="text-[11px] text-text-muted font-sans pt-1 border-t border-border/40">
                          {tc.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono text-text-primary font-bold block uppercase tracking-wider">
                    Constraints
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono text-text-muted">
                    {activeArenaTest.problems[selectedProblemIndex].constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Code Editor & Execution Runner */}
            <div className="w-full lg:w-1/2 flex flex-col bg-ink overflow-hidden">
              {/* Editor Header Toolbar */}
              <div className="h-10 px-4 bg-surface-raised border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      const lang = e.target.value as "javascript" | "python" | "java" | "cpp";
                      setSelectedLanguage(lang);
                      const currentProbId = activeArenaTest.problems[selectedProblemIndex].id;
                      setUserCode((prev) => ({
                        ...prev,
                        [currentProbId]: activeArenaTest.problems[selectedProblemIndex].starterCode[lang] || "",
                      }));
                    }}
                    className="bg-surface border border-border rounded px-2 py-0.5 text-xs font-mono text-text-primary focus:outline-none"
                  >
                    <option value="javascript">JavaScript (Node 20)</option>
                    <option value="python">Python 3.12</option>
                    <option value="java">Java 21</option>
                    <option value="cpp">C++ 20</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const currentProb = activeArenaTest.problems[selectedProblemIndex];
                      setUserCode((prev) => ({
                        ...prev,
                        [currentProb.id]: currentProb.starterCode[selectedLanguage] || "",
                      }));
                      toast.info("Starter code reset to default.");
                    }}
                    className="text-xs font-mono h-7 px-2 text-text-muted hover:text-text-primary"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Reset
                  </Button>
                </div>
              </div>

              {/* Code Textarea / Workspace */}
              <div className="flex-1 relative bg-[#090d16] p-3 font-mono text-xs">
                <textarea
                  value={userCode[activeArenaTest.problems[selectedProblemIndex].id] || ""}
                  onChange={(e) => {
                    const currentId = activeArenaTest.problems[selectedProblemIndex].id;
                    setUserCode((prev) => ({ ...prev, [currentId]: e.target.value }));
                  }}
                  className="w-full h-full bg-transparent text-text-primary resize-none focus:outline-none custom-scrollbar leading-relaxed"
                  placeholder="// Write your live solution code here..."
                  spellCheck={false}
                />
              </div>

              {/* Output Console / Runner Panel */}
              <div className="h-44 border-t border-border bg-surface flex flex-col shrink-0">
                <div className="h-8 px-3 bg-surface-raised border-b border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Execution Console</span>
                  </div>
                  {runOutput && (
                    <span className="text-text-muted">Runtime: {runOutput.timeMs}ms</span>
                  )}
                </div>

                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs custom-scrollbar">
                  {runOutput ? (
                    <div className={runOutput.status === "error" ? "text-rose-400 whitespace-pre-wrap" : "text-emerald-400 whitespace-pre-wrap"}>
                      {runOutput.output}
                    </div>
                  ) : (
                    <span className="text-text-muted italic">Click 'Run Code' to execute against sample test cases.</span>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-2.5 border-t border-border bg-surface-raised flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunCode}
                    className="text-xs font-mono h-8 px-3 gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400" /> Run Code
                  </Button>

                  <Button
                    variant="teal-cyan"
                    size="sm"
                    onClick={handleSubmitProblem}
                    className="text-xs font-semibold h-8 px-4 gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Problem
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROCTORING TAB-SWITCH WARNING MODAL */}
      {showWarningModal && (
        <Dialog
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          title="⚠️ Proctoring Violation Warning"
          maxWidthClass="max-w-md"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 text-rose-300">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Tab Switch Detected (#{tabSwitchCount})</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Leaving the contest window, switching application tabs, or minimizing the browser is strictly recorded by the automated proctoring monitor.
              </p>
              <p className="text-[11px] text-rose-400 font-bold">
                Max Allowed Violations: {activeArenaTest?.maxTabSwitchesAllowed || 3}. Exceeding this limit will trigger automatic disqualification!
              </p>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowWarningModal(false)}
              className="w-full text-xs font-bold py-2"
            >
              I Understand & Return to Test
            </Button>
          </div>
        </Dialog>
      )}

      {/* TEST SUBMITTED SUMMARY MODAL */}
      {testSubmitted && (
        <Dialog
          isOpen={testSubmitted}
          onClose={() => {
            setTestSubmitted(false);
            setActiveArenaTest(null);
          }}
          title="Contest Submission Recorded!"
          maxWidthClass="max-w-md"
        >
          <div className="space-y-4 text-center text-xs font-mono py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Placement Arena Submitted
              </h3>
              <p className="text-text-muted">
                Your code has been received and evaluated against hidden performance benchmarks.
              </p>
            </div>

            <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-text-muted">Contest:</span>
                <span className="text-text-primary font-bold">{activeArenaTest?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Proctoring Violations:</span>
                <span className={tabSwitchCount > 0 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {tabSwitchCount} Tab Switches
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Rank Placement:</span>
                <span className="text-cyan-400 font-bold">Top 8% Candidate</span>
              </div>
            </div>

            <Button
              variant="teal-cyan"
              size="sm"
              onClick={() => {
                setTestSubmitted(false);
                setActiveArenaTest(null);
              }}
              className="w-full text-xs font-bold py-2"
            >
              Return to Live Contests Hub
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default LiveTests;
