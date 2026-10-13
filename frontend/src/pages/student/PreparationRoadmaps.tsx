import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Filter,
  Layers,
  Binary,
  Layout,
  Server,
  BrainCircuit,
  BarChart3,
  Cloud,
  Zap,
  Check,
  Flame,
  Target,
  GraduationCap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useAuth } from "@/context/AuthContext";
import { getScopedItem, setScopedItem } from "@/lib/userScope";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Domain, RoadmapWeek, RoadmapTask } from "@/lib/taxonomy";

// Dynamic icon resolver
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
      return BrainCircuit;
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

const getTaskTypeConfig = (type: string) => {
  switch (type) {
    case "CODING":
      return {
        icon: Code2,
        label: "Coding Arena",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        actionText: "Solve Now",
      };
    case "QUIZ":
      return {
        icon: HelpCircle,
        label: "Concept Quiz",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        actionText: "Take Quiz",
      };
    case "INTERVIEW":
      return {
        icon: Video,
        label: "AI Mock Interview",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        actionText: "Start Round",
      };
    case "READING":
      return {
        icon: BookOpen,
        label: "Article & Guide",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        actionText: "Read Guide",
      };
    case "PRACTICE":
    default:
      return {
        icon: Sparkles,
        label: "Practice Track",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        actionText: "Practice",
      };
  }
};

export const PreparationRoadmaps: React.FC = () => {
  const { user } = useAuth();
  const { domains } = useTaxonomy();

  // Active selected domain slug
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    return domains[0]?.slug || "dsa";
  });

  // Keep selectedSlug valid if domains list changes
  useEffect(() => {
    if (domains.length > 0 && !domains.some((d) => d.slug === selectedSlug)) {
      setSelectedSlug(domains[0].slug);
    }
  }, [domains, selectedSlug]);

  const activeDomain = useMemo(() => {
    return domains.find((d) => d.slug === selectedSlug) || domains[0];
  }, [domains, selectedSlug]);

  // Expanded weeks state
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1, 2]);

  // Task filtering
  const [taskFilter, setTaskFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Scoped completed tasks tracking
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

  const expandAll = () => {
    if (!activeDomain?.weeks) return;
    setExpandedWeeks(activeDomain.weeks.map((w) => w.weekNumber));
  };

  const collapseAll = () => {
    setExpandedWeeks([]);
  };

  // Helper to compute progress for any domain
  const getDomainProgress = (dom: Domain) => {
    const allTasks = dom.weeks?.flatMap((w) => w.tasks) || [];
    if (allTasks.length === 0) return { total: 0, completed: 0, percent: 0 };
    const completed = allTasks.filter((t) => completedTaskIds.includes(t.id)).length;
    const percent = Math.round((completed / allTasks.length) * 100);
    return { total: allTasks.length, completed, percent };
  };

  // Active domain stats
  const activeStats = useMemo(() => {
    if (!activeDomain) return { total: 0, completed: 0, percent: 0, totalHours: 0, durationWeeks: 0 };
    const prog = getDomainProgress(activeDomain);
    return {
      ...prog,
      totalHours: activeDomain.totalHours || 0,
      durationWeeks: activeDomain.durationWeeks || activeDomain.weeks?.length || 0,
    };
  }, [activeDomain, completedTaskIds]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header Banner with Readable Backdrop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-raised/40 border border-border/40 backdrop-blur-sm shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-text-primary tracking-tight">
                  Placement Preparation Roadmaps
                </h1>
                <Badge variant="accent" className="font-mono text-xs font-semibold">
                  {domains.length} Career Tracks
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary font-medium mt-0.5">
                Comprehensive beginner-to-advanced placement curricula tailored for engineering roles and company recruitment rounds.
              </p>
            </div>
          </div>
        </div>

        {/* Global Progress pill */}
        <div className="flex items-center gap-3 bg-surface-raised/80 border border-border px-4 py-2.5 rounded-2xl self-start md:self-auto shrink-0 shadow-xs">
          <GraduationCap className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] text-text-muted font-mono uppercase tracking-wider font-semibold">
              Total Milestones Solved
            </div>
            <div className="text-xs font-bold text-text-primary">
              <span className="text-cyan-400">{completedTaskIds.length}</span> Tasks Completed Across Tracks
            </div>
          </div>
        </div>
      </div>

      {/* DOMAIN SELECTION GRID - Full Clear Visibility with Readable Backdrop */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-3 py-2 rounded-xl bg-surface-raised/30 border border-border/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary font-mono flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" /> Select Placement Domain & Track
            </h2>
          </div>
          <span className="text-xs text-text-secondary font-medium">
            Click any track to view its full week-by-week curriculum
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {domains.map((dom) => {
            const isSelected = activeDomain?.slug === dom.slug;
            const IconComponent = getDomainIcon(dom.icon);
            const { total, completed, percent } = getDomainProgress(dom);

            return (
              <div
                key={dom.id}
                onClick={() => setSelectedSlug(dom.slug)}
                className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 group ${
                  isSelected
                    ? "bg-surface-raised border-cyan-400/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50"
                    : "bg-surface border-border hover:border-cyan-500/40 hover:bg-surface-raised/60"
                }`}
              >
                {/* Active Indicator Chip */}
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-cyan-500 text-black font-bold text-[10px] px-2 py-0.5 rounded-full font-mono shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" /> Active Track
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
                    <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {dom.description}
                    </p>
                  </div>
                </div>

                {/* Level Badge */}
                {dom.level && (
                  <div className="mt-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-raised border border-border text-text-muted inline-block truncate max-w-full">
                      {dom.level}
                    </span>
                  </div>
                )}

                {/* Meta stats footer */}
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary font-semibold">
                      {dom.durationWeeks || dom.weeks?.length || 0}W
                    </span>
                    <span>•</span>
                    <span>{dom.totalHours || 0}h Total</span>
                    <span>•</span>
                    <span>{dom.topics?.length || 0} Topics</span>
                  </div>

                  <span className={`font-semibold ${percent > 0 ? "text-cyan-400" : "text-text-muted"}`}>
                    {percent}%
                  </span>
                </div>

                {/* Micro Progress Bar */}
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

      {/* ACTIVE ROADMAP DETAIL VIEW */}
      {activeDomain && (
        <div className="space-y-6 pt-2">
          {/* Active Roadmap Banner & Overview */}
          <Card className="p-6 bg-surface border-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent" className="font-mono text-xs">
                    Curriculum Master
                  </Badge>
                  {activeDomain.level && (
                    <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                      {activeDomain.level}
                    </Badge>
                  )}
                  {activeDomain.isCustom && (
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-300">
                      Custom Track
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  {activeDomain.name} Placement Roadmap
                </h2>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {activeDomain.description}
                </p>

                {/* Topics Covered Tag Cloud */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-mono text-text-muted mr-1">Core Modules:</span>
                  {activeDomain.topics?.map((top) => (
                    <span
                      key={top.id}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-raised border border-border text-cyan-300"
                    >
                      {top.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-surface-raised/80 border border-border p-4 rounded-2xl min-w-[260px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted">Track Completion</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {activeStats.percent}%
                  </span>
                </div>

                <Progress value={activeStats.percent} className="h-2 bg-surface" />

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-text-muted">
                  <div className="bg-surface/60 p-2 rounded-xl border border-border">
                    <div className="text-text-muted">Completed</div>
                    <div className="font-bold text-text-primary text-xs mt-0.5">
                      {activeStats.completed} / {activeStats.total} Tasks
                    </div>
                  </div>
                  <div className="bg-surface/60 p-2 rounded-xl border border-border">
                    <div className="text-text-muted">Estimated Prep</div>
                    <div className="font-bold text-text-primary text-xs mt-0.5">
                      {activeStats.durationWeeks}W ({activeStats.totalHours}h)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Controls Bar: Search, Task Type Filters, Expand/Collapse */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-border">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-text-muted px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: "ALL", label: "All Tasks" },
                { id: "CODING", label: "Coding" },
                { id: "QUIZ", label: "Quizzes" },
                { id: "INTERVIEW", label: "Interviews" },
                { id: "READING", label: "Articles" },
                { id: "PRACTICE", label: "Practice" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTaskFilter(f.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    taskFilter === f.id
                      ? "bg-cyan-500 text-black font-semibold shadow-sm"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tasks..."
                  className="pl-8 pr-3 py-1 bg-surface-raised border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400 w-36 sm:w-44"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={expandedWeeks.length === (activeDomain.weeks?.length || 0) ? collapseAll : expandAll}
                className="text-xs h-7 border-border hover:bg-surface-raised"
              >
                {expandedWeeks.length === (activeDomain.weeks?.length || 0) ? "Collapse All" : "Expand All"}
              </Button>
            </div>
          </div>

          {/* WEEKS ACCORDION LIST */}
          <div className="space-y-4">
            {(!activeDomain.weeks || activeDomain.weeks.length === 0) && (
              <Card className="p-8 text-center bg-surface border-border">
                <Compass className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
                <h3 className="font-bold text-sm text-text-primary">No Curriculum Weeks Defined Yet</h3>
                <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                  This track is currently being organized by the administrator. Check back soon or add weeks in the Admin Taxonomy panel.
                </p>
              </Card>
            )}

            {activeDomain.weeks?.map((week) => {
              const isExpanded = expandedWeeks.includes(week.weekNumber);

              // Filter tasks by type and search query
              const filteredTasks = week.tasks.filter((t) => {
                const matchesType = taskFilter === "ALL" || t.type === taskFilter;
                const matchesSearch =
                  !searchQuery ||
                  t.label.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesType && matchesSearch;
              });

              const weekCompletedCount = week.tasks.filter((t) =>
                completedTaskIds.includes(t.id)
              ).length;
              const weekPercent =
                week.tasks.length > 0
                  ? Math.round((weekCompletedCount / week.tasks.length) * 100)
                  : 0;

              return (
                <Card
                  key={week.weekNumber}
                  className={`border transition-all duration-200 overflow-hidden ${
                    weekPercent === 100
                      ? "border-emerald-500/30 bg-surface/90"
                      : "border-border bg-surface hover:border-cyan-500/30"
                  }`}
                >
                  {/* Week Header */}
                  <div
                    onClick={() => toggleWeek(week.weekNumber)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-surface-raised/30 hover:bg-surface-raised/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          weekPercent === 100
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}
                      >
                        {weekPercent === 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          `W${week.weekNumber}`
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-text-primary">
                            {week.title}
                          </h3>
                          {weekPercent === 100 && (
                            <Badge variant="accent" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                          {week.focus}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-mono font-bold text-text-primary">
                          {weekCompletedCount}/{week.tasks.length} Done
                        </div>
                        <div className="text-[10px] text-text-muted font-mono">
                          {weekPercent}% Completed
                        </div>
                      </div>

                      <div className="w-16 hidden sm:block">
                        <Progress value={weekPercent} className="h-1.5 bg-surface" />
                      </div>

                      <div className="p-1 text-text-muted hover:text-text-primary transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Week Tasks Breakdown */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-border bg-ink/20 space-y-2.5">
                      {filteredTasks.length === 0 ? (
                        <p className="text-xs text-text-muted py-2 italic text-center">
                          No tasks match the active filters for this week.
                        </p>
                      ) : (
                        filteredTasks.map((task) => {
                          const isDone = completedTaskIds.includes(task.id);
                          const typeConfig = getTaskTypeConfig(task.type);
                          const TypeIcon = typeConfig.icon;

                          return (
                            <div
                              key={task.id}
                              className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                                isDone
                                  ? "bg-surface/40 border-border opacity-75"
                                  : "bg-surface border-border hover:border-cyan-500/25 shadow-sm"
                              }`}
                            >
                              <div className="flex items-start sm:items-center gap-3">
                                {/* Checkbox */}
                                <button
                                  type="button"
                                  onClick={() => toggleTask(task.id)}
                                  className={`p-1 rounded-lg transition-colors mt-0.5 sm:mt-0 ${
                                    isDone
                                      ? "text-emerald-400 hover:text-text-muted"
                                      : "text-text-muted hover:text-cyan-400"
                                  }`}
                                  title={isDone ? "Mark as incomplete" : "Mark as completed"}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-text-muted" />
                                  )}
                                </button>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`text-xs font-semibold ${
                                        isDone
                                          ? "line-through text-text-muted"
                                          : "text-text-primary"
                                      }`}
                                    >
                                      {task.label}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${typeConfig.color}`}
                                    >
                                      <TypeIcon className="w-3 h-3" />
                                      {typeConfig.label}
                                    </span>

                                    <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {task.estimatedMinutes} mins
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Link to={task.linkUrl}>
                                  <Button
                                    size="sm"
                                    variant={isDone ? "outline" : "primary"}
                                    className={`text-xs py-1 h-8 px-3 flex items-center gap-1.5 ${
                                      isDone
                                        ? "border-border text-text-muted hover:text-text-primary"
                                        : "bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                                    }`}
                                  >
                                    {typeConfig.actionText}
                                    <ArrowRight className="w-3 h-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
