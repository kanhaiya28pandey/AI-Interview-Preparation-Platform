import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Video,
  Code2,
  Award,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useAuth } from "@/context/AuthContext";
import { getScopedItem, setScopedItem } from "@/lib/userScope";
import { useTaxonomy } from "@/hooks/useTaxonomy";

interface RoadmapWeek {
  weekNumber: number;
  title: string;
  focus: string;
  tasks: Array<{
    id: string;
    label: string;
    type: "PRACTICE" | "QUIZ" | "CODING" | "INTERVIEW" | "READING";
    linkUrl: string;
    estimatedMinutes: number;
  }>;
}

interface RoleRoadmap {
  id: string;
  roleName: string;
  domainSlug: string;
  description: string;
  durationWeeks: number;
  totalHours: number;
  weeks: RoadmapWeek[];
}

export const ROLE_ROADMAPS: RoleRoadmap[] = [
  {
    id: "role-sde",
    roleName: "SDE (DSA Heavy)",
    domainSlug: "dsa",
    description: "Intensive 8-week algorithmic mastery curriculum for Google, Meta, Amazon placement coding rounds.",
    durationWeeks: 8,
    totalHours: 90,
    weeks: [
      {
        weekNumber: 1,
        title: "Arrays, Two Pointers & Sliding Window",
        focus: "Prefix sum arrays, two-pointer bounds, and dynamic sliding window string substrings.",
        tasks: [
          { id: "sde-w1-1", label: "Solve 5 Two-Pointer benchmark problems", type: "CODING", linkUrl: "/coding", estimatedMinutes: 90 },
          { id: "sde-w1-2", label: "Take Arrays & Hashing Concept Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "sde-w1-3", label: "Read Sliding Window Invariant Guide", type: "READING", linkUrl: "/articles", estimatedMinutes: 15 },
        ],
      },
      {
        weekNumber: 2,
        title: "Binary Search & Monotonic Stacks",
        focus: "Searching on rotated arrays, search on monotonic answer space, and next greater element.",
        tasks: [
          { id: "sde-w2-1", label: "Solve 4 Rotated Array & Lower Bound problems", type: "CODING", linkUrl: "/coding", estimatedMinutes: 75 },
          { id: "sde-w2-2", label: "Complete Stack & Monotonic Stack Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 3,
        title: "Trees, BST & Lowest Common Ancestor",
        focus: "Tree DFS/BFS, binary search tree balance, and tree serialization algorithms.",
        tasks: [
          { id: "sde-w3-1", label: "Practice Binary Tree Path Sum & LCA", type: "CODING", linkUrl: "/coding", estimatedMinutes: 90 },
          { id: "sde-w3-2", label: "Take Tree Traversal Precision Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 4,
        title: "Graphs: BFS, DFS & Topological Sort",
        focus: "Connected components, cycle detection in directed graphs, and Course Schedule ordering.",
        tasks: [
          { id: "sde-w4-1", label: "Implement Dijkstra's & Kahn's Topological Sort", type: "CODING", linkUrl: "/coding", estimatedMinutes: 120 },
          { id: "sde-w4-2", label: "Complete Graph Algorithms Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
        ],
      },
      {
        weekNumber: 5,
        title: "Dynamic Programming Foundations",
        focus: "1D memoization vs tabulation, House Robber patterns, and Coin Change unbounded knapsack.",
        tasks: [
          { id: "sde-w5-1", label: "Solve 6 Core Dynamic Programming challenges", type: "CODING", linkUrl: "/coding", estimatedMinutes: 140 },
          { id: "sde-w5-2", label: "Take Dynamic Programming State Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 6,
        title: "Full Placement Mock Interview",
        focus: "Simulated technical bar-raiser interview with live code execution and complexity defense.",
        tasks: [
          { id: "sde-w6-1", label: "Complete AI SDE Technical Interview Session", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 45 },
          { id: "sde-w6-2", label: "Review Interview Telemetry Feedback", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 30 },
        ],
      },
    ],
  },
  {
    id: "role-frontend",
    roleName: "Frontend Engineer",
    domainSlug: "frontend-development",
    description: "Modern React architecture, DOM internals, state management, and web performance tuning.",
    durationWeeks: 6,
    totalHours: 65,
    weeks: [
      {
        weekNumber: 1,
        title: "JavaScript Engine Deep Dive & Event Loop",
        focus: "Microtasks, Macrotasks, Closures, Prototypal Chain, and custom Promise implementation.",
        tasks: [
          { id: "fe-w1-1", label: "Take Advanced JavaScript Runtime Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
          { id: "fe-w1-2", label: "Practice Debounce, Throttle & Custom Hooks", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
        ],
      },
      {
        weekNumber: 2,
        title: "React Fiber Architecture & Render Optimization",
        focus: "Virtual DOM reconciliation, Concurrent Mode, useTransition, and memory leak mitigation.",
        tasks: [
          { id: "fe-w2-1", label: "Take React Architecture Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "fe-w2-2", label: "Read Web Vitals & Bundle Optimization Guide", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 3,
        title: "Frontend Technical Interview Room",
        focus: "Simulate a live UI architecture screen covering state management and system design.",
        tasks: [
          { id: "fe-w3-1", label: "Complete Frontend Engineer Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 40 },
        ],
      },
    ],
  },
  {
    id: "role-backend",
    roleName: "Backend Engineer",
    domainSlug: "backend-development",
    description: "Spring Boot, Node.js, distributed transactions, database indexing, and Kafka streaming.",
    durationWeeks: 6,
    totalHours: 70,
    weeks: [
      {
        weekNumber: 1,
        title: "APIs, Authentication & Concurrency",
        focus: "REST idempotency, JWT refresh tokens, rate limiting, and thread pool safety.",
        tasks: [
          { id: "be-w1-1", label: "Take Backend API Security & JWT Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "be-w1-2", label: "Practice Database Connection Pool Tuning", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 45 },
        ],
      },
      {
        weekNumber: 2,
        title: "Database Indexing & Query Optimization",
        focus: "B-Trees vs LSM, Composite index column ordering, EXPLAIN query profiling, and ACID locks.",
        tasks: [
          { id: "be-w2-1", label: "Take Database Normalization & Indexing Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
          { id: "be-w2-2", label: "Read Storage Engine Internals Guide", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 3,
        title: "Backend Technical Interview Session",
        focus: "Live system architecture interrogation on microservices, caching, and resiliency.",
        tasks: [
          { id: "be-w3-1", label: "Complete Backend AI Interview Room", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 45 },
        ],
      },
    ],
  },
  {
    id: "role-genai",
    roleName: "Generative AI & LLM Engineer",
    domainSlug: "ai-machine-learning",
    description: "Transformer mechanics, RAG architecture, vector search, LangChain agents, and evaluation metrics.",
    durationWeeks: 6,
    totalHours: 75,
    weeks: [
      {
        weekNumber: 1,
        title: "Transformers, Attention & Prompt Engineering",
        focus: "Self-attention mechanism, KV caching, tokenization, and few-shot Chain-of-Thought prompting.",
        tasks: [
          { id: "ai-w1-1", label: "Take LLM Fundamentals & Prompting Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
          { id: "ai-w1-2", label: "Read Vector Embeddings & Similarity Guide", type: "READING", linkUrl: "/articles", estimatedMinutes: 15 },
        ],
      },
      {
        weekNumber: 2,
        title: "RAG & Vector Database Pipelines",
        focus: "Chunking strategies, HNSW vector indexing, hybrid search with BM25, and hallucination guardrails.",
        tasks: [
          { id: "ai-w2-1", label: "Take RAG Systems & Embeddings Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "ai-w2-2", label: "Complete AI/ML Technical Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 40 },
        ],
      },
    ],
  },
  {
    id: "role-data-analyst",
    roleName: "Data Analyst",
    domainSlug: "data-analytics",
    description: "SQL window functions, Python Pandas analysis, cohort metrics, Tableau, and business KPIs.",
    durationWeeks: 5,
    totalHours: 50,
    weeks: [
      {
        weekNumber: 1,
        title: "Advanced SQL Analytics & Window Functions",
        focus: "Dense_rank, retention cohorts, lead/lag rolling averages, and subquery optimization.",
        tasks: [
          { id: "da-w1-1", label: "Take SQL Analytics & Joins Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "da-w1-2", label: "Practice Exploratory Data Analysis with Pandas", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
        ],
      },
      {
        weekNumber: 2,
        title: "Business Case Studies & Metrics",
        focus: "A/B testing statistical significance, metric drop diagnostics, and executive dashboards.",
        tasks: [
          { id: "da-w2-1", label: "Complete Data Analyst Placement Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 35 },
        ],
      },
    ],
  },
  {
    id: "role-devops",
    roleName: "DevOps & Cloud Engineer",
    domainSlug: "devops-cloud",
    description: "Docker, Kubernetes, Terraform IaC, AWS infrastructure, CI/CD pipelines, and observability.",
    durationWeeks: 6,
    totalHours: 70,
    weeks: [
      {
        weekNumber: 1,
        title: "Containers & Orchestration",
        focus: "Multi-stage Docker builds, Kubernetes Pods, Ingress Controllers, and Helm charts.",
        tasks: [
          { id: "do-w1-1", label: "Take Docker & Kubernetes Architecture Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
          { id: "do-w1-2", label: "Read CI/CD Pipeline Hardening Guide", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 2,
        title: "Cloud Infrastructure & SRE Mock Round",
        focus: "AWS VPC architecture, Terraform state locks, Prometheus metrics, and production outages.",
        tasks: [
          { id: "do-w2-1", label: "Complete Cloud & DevOps Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 40 },
        ],
      },
    ],
  },
  {
    id: "role-hr-behavioral",
    roleName: "HR & Behavioral Prep",
    domainSlug: "hr-behavioral",
    description: "STAR framework responses, conflict resolution, leadership stories, and culture fit mastery.",
    durationWeeks: 3,
    totalHours: 30,
    weeks: [
      {
        weekNumber: 1,
        title: "STAR Story Construction & Elevator Pitch",
        focus: "Situation, Task, Action, Result methodology with quantifiable business impacts.",
        tasks: [
          { id: "hr-w1-1", label: "Read Complete Behavioral STAR Guide", type: "READING", linkUrl: "/articles", estimatedMinutes: 15 },
          { id: "hr-w1-2", label: "Take Behavioral Scenario Etiquette Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 15 },
        ],
      },
      {
        weekNumber: 2,
        title: "Behavioral & HR AI Interview Simulation",
        focus: "Interactive 3-round simulated HR evaluation with immediate verbal feedback.",
        tasks: [
          { id: "hr-w2-1", label: "Complete Behavioral STAR AI Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 30 },
        ],
      },
    ],
  },
];

export const PreparationRoadmaps: React.FC = () => {
  const { user } = useAuth();
  const { domains } = useTaxonomy();
  const [selectedRole, setSelectedRole] = useState<RoleRoadmap>(ROLE_ROADMAPS[0]);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1, 2]);

  // Read completed tasks for this user from scoped storage
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    return getScopedItem<string[]>(user?.userId, "roadmap_completed_tasks", []);
  });

  useEffect(() => {
    const loaded = getScopedItem<string[]>(user?.userId, "roadmap_completed_tasks", []);
    setCompletedTaskIds(loaded);
  }, [user]);

  const toggleTask = (taskId: string) => {
    const next = completedTaskIds.includes(taskId)
      ? completedTaskIds.filter((id) => id !== taskId)
      : [...completedTaskIds, taskId];

    setCompletedTaskIds(next);
    setScopedItem(user?.userId, "roadmap_completed_tasks", next);
  };

  const toggleWeek = (num: number) => {
    setExpandedWeeks((prev) =>
      prev.includes(num) ? prev.filter((w) => w !== num) : [...prev, num]
    );
  };

  // Calculate progress for active role
  const allRoleTasks = selectedRole.weeks.flatMap((w) => w.tasks);
  const completedInRole = allRoleTasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const progressPercent = allRoleTasks.length > 0 ? Math.round((completedInRole / allRoleTasks.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-cyan-400" /> Role Preparation Roadmaps
            </h1>
            <Badge variant="accent" className="font-mono text-xs">
              Weekly Curricula
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Structured week-by-week preparation paths tailored for specific engineering roles and company placement drives.
          </p>
        </div>
      </div>

      {/* Role Picker Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {ROLE_ROADMAPS.map((r) => {
          const isSelected = selectedRole.id === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold"
                  : "bg-surface border border-border text-text-muted hover:text-text-primary hover:border-cyan-500/40"
              }`}
            >
              <span>{r.roleName}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSelected ? "bg-black/20 text-black font-bold" : "bg-surface-raised text-text-muted"}`}>
                {r.durationWeeks}W
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Roadmap Overview Card */}
      <Card className="p-6 bg-surface border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary">{selectedRole.roleName} Track</h2>
              <Badge variant="outline" className="font-mono text-xs text-cyan-400 border-cyan-400/30">
                {selectedRole.durationWeeks} Weeks • ~{selectedRole.totalHours} Total Hours
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-1">{selectedRole.description}</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted">Curriculum Progress</span>
              <span className="text-cyan-400 font-bold">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <span className="text-[10px] text-text-muted font-mono block text-right">
              {completedInRole} of {allRoleTasks.length} milestones checked
            </span>
          </div>
        </div>
      </Card>

      {/* Week by Week Accordions */}
      <div className="space-y-4">
        {selectedRole.weeks.map((wk) => {
          const isExpanded = expandedWeeks.includes(wk.weekNumber);
          const weekDoneCount = wk.tasks.filter((t) => completedTaskIds.includes(t.id)).length;
          const isWeekCompleted = weekDoneCount === wk.tasks.length && wk.tasks.length > 0;

          return (
            <Card
              key={wk.weekNumber}
              className={`border transition-all duration-200 overflow-hidden ${
                isWeekCompleted
                  ? "bg-surface/70 border-emerald-500/30"
                  : "bg-surface border-border hover:border-cyan-500/30"
              }`}
            >
              <div
                className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none bg-surface-raised/40 hover:bg-surface-raised/70"
                onClick={() => toggleWeek(wk.weekNumber)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                      isWeekCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    }`}
                  >
                    W{wk.weekNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      {wk.title}
                      {isWeekCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">{wk.focus}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className={isWeekCompleted ? "text-emerald-400 font-semibold" : "text-text-muted"}>
                    {weekDoneCount}/{wk.tasks.length} tasks
                  </span>
                  <div className="text-text-muted">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 border-t border-border bg-ink/20 space-y-3">
                  {wk.tasks.map((task) => {
                    const isChecked = completedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isChecked
                            ? "bg-emerald-500/5 border-emerald-500/25"
                            : "bg-surface border-border hover:border-cyan-500/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 text-text-muted hover:text-cyan-400 transition-colors"
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`text-xs font-medium block ${
                                isChecked ? "line-through text-text-muted" : "text-text-primary"
                              }`}
                            >
                              {task.label}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-text-muted">
                              <span className="px-1.5 py-0.2 rounded bg-surface-raised border border-border text-cyan-300">
                                {task.type}
                              </span>
                              <span>•</span>
                              <span>~{task.estimatedMinutes} mins</span>
                            </div>
                          </div>
                        </div>

                        <Link to={task.linkUrl}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-border hover:bg-surface-raised text-cyan-400 flex items-center gap-1 w-full sm:w-auto justify-center"
                          >
                            <span>Launch</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
