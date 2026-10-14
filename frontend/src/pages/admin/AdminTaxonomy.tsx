import React, { useState } from "react";
import {
  Layers,
  Plus,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  CheckCircle2,
  FolderTree,
  ChevronDown,
  ChevronRight,
  Database,
  Code2,
  Cpu,
  Layout,
  Server,
  Cloud,
  BarChart3,
  Smartphone,
  ShieldAlert,
  CheckCircle,
  Wrench,
  BrainCircuit,
  Users,
  Zap,
  Briefcase,
  Network,
  Binary,
  Trash2,
  Clock,
  HelpCircle,
  Video,
  BookOpen,
  Calendar,
  RotateCcw,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Domain, RoadmapWeek, RoadmapTask } from "@/lib/taxonomy";
import { PageHeader } from "@/components/common/PageHeader";
import { Callout, CalloutCode } from "@/components/common/Callout";
import { mockCodingProblems } from "@/mocks/codingData";
import { mockPracticeTopics } from "@/mocks/practiceData";
import { mockQuizTopics } from "@/mocks/quizData";
import { mockInterviewRoles } from "@/mocks/interviewData";
import { mockArticles } from "@/mocks/articleData";

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
        label: "Coding",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        defaultRoute: "/coding",
      };
    case "QUIZ":
      return {
        icon: HelpCircle,
        label: "Quiz",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        defaultRoute: "/quiz",
      };
    case "INTERVIEW":
      return {
        icon: Video,
        label: "Mock Interview",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        defaultRoute: "/mock-interview",
      };
    case "READING":
      return {
        icon: BookOpen,
        label: "Article / Reading",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        defaultRoute: "/articles",
      };
    case "PRACTICE":
    default:
      return {
        icon: Sparkles,
        label: "Practice",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        defaultRoute: "/practice",
      };
  }
};

export const AdminTaxonomy: React.FC = () => {
  const {
    allDomains,
    addCustomDomain,
    deleteDomain,
    addTopicWithTimeline,
    removeTopic,
    addWeekToDomain,
    removeWeekFromDomain,
    removeTaskFromWeek,
    resetToDefaultTaxonomy,
    toggleHide,
    isHidden,
  } = useTaxonomy();

  const [search, setSearch] = useState("");
  const [expandedDomainSlugs, setExpandedDomainSlugs] = useState<string[]>([
    "dsa",
    "frontend",
    "backend",
  ]);

  // Active view tab per domain ("curriculum" or "topics")
  const [domainViewTab, setDomainViewTab] = useState<Record<string, "curriculum" | "topics">>({});

  // MODALS
  // 1. Add Domain Modal
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");
  const [newDomainDesc, setNewDomainDesc] = useState("");
  const [newDomainColor, setNewDomainColor] = useState("#06b6d4");
  const [newDomainIcon, setNewDomainIcon] = useState("Layers");
  const [newDomainWeeks, setNewDomainWeeks] = useState(6);
  const [newDomainHours, setNewDomainHours] = useState(70);
  const [newDomainLevel, setNewDomainLevel] = useState("Beginner to Placement Ready");

  // 2. Add Topic With Timeline Modal
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [targetDomainSlug, setTargetDomainSlug] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newSubtopicsRaw, setNewSubtopicsRaw] = useState("");
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
  const [selectedTaskType, setSelectedTaskType] = useState<"CODING" | "QUIZ" | "PRACTICE" | "READING" | "INTERVIEW">("CODING");
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(45);

  // 3. Add Week Modal
  const [showAddWeekModal, setShowAddWeekModal] = useState(false);
  const [targetWeekDomainSlug, setTargetWeekDomainSlug] = useState("");
  const [newWeekTitle, setNewWeekTitle] = useState("");
  const [newWeekFocus, setNewWeekFocus] = useState("");

  // 4. Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "domain" | "week" | "topic" | "task";
    domainSlug: string;
    domainName: string;
    idOrNumber?: string | number;
    label?: string;
  } | null>(null);

  const toggleExpand = (slug: string) => {
    setExpandedDomainSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  // Helper to count usage across mock content items
  const getItemCount = (topicName: string, domainName: string) => {
    const tLower = topicName.toLowerCase();
    const dLower = domainName.toLowerCase();

    let count = 0;
    count += mockCodingProblems.filter(
      (p) =>
        p.category.toLowerCase().includes(tLower) ||
        p.category.toLowerCase().includes(dLower) ||
        p.title.toLowerCase().includes(tLower)
    ).length;

    count += mockPracticeTopics.filter(
      (pt) =>
        pt.title.toLowerCase().includes(tLower) ||
        pt.category.toLowerCase().includes(dLower) ||
        pt.tags.some((tag) => tag.toLowerCase().includes(tLower))
    ).length;

    count += mockQuizTopics.filter(
      (q) =>
        q.title.toLowerCase().includes(tLower) ||
        q.category.toLowerCase().includes(dLower) ||
        q.category.toLowerCase().includes(tLower)
    ).length;

    count += mockInterviewRoles.filter(
      (r) =>
        r.title.toLowerCase().includes(tLower) ||
        r.category.toLowerCase().includes(dLower) ||
        r.description.toLowerCase().includes(tLower)
    ).length;

    count += mockArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(tLower) ||
        a.category.toLowerCase().includes(dLower) ||
        a.tags.some((tag) => tag.toLowerCase().includes(tLower))
    ).length;

    return Math.max(1, count);
  };

  // Form Submit: Create Domain
  const handleCreateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;

    addCustomDomain(
      newDomainName.trim(),
      newDomainDesc.trim(),
      newDomainIcon,
      newDomainColor,
      newDomainWeeks,
      newDomainHours,
      newDomainLevel
    );

    setNewDomainName("");
    setNewDomainDesc("");
    setShowAddDomainModal(false);
  };

  // Open Add Topic Modal for a domain
  const handleOpenAddTopic = (domainSlug: string) => {
    setTargetDomainSlug(domainSlug);
    const domain = allDomains.find((d) => d.slug === domainSlug);
    setSelectedWeekNumber(domain?.weeks?.[0]?.weekNumber || 1);
    setNewTopicName("");
    setNewSubtopicsRaw("");
    setNewTaskLabel("");
    setSelectedTaskType("CODING");
    setNewEstimatedMinutes(45);
    setShowAddTopicModal(true);
  };

  // Form Submit: Add Topic with Timeline
  const handleCreateTopicWithTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDomainSlug || !newTopicName.trim()) return;

    const subtopics = newSubtopicsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const taskTypeCfg = getTaskTypeConfig(selectedTaskType);

    addTopicWithTimeline(targetDomainSlug, {
      name: newTopicName.trim(),
      subtopics,
      weekNumber: selectedWeekNumber,
      taskType: selectedTaskType,
      taskLabel: newTaskLabel.trim() || `Master ${newTopicName.trim()} & Benchmark Problems`,
      linkUrl: taskTypeCfg.defaultRoute,
      estimatedMinutes: newEstimatedMinutes,
    });

    setShowAddTopicModal(false);
  };

  // Open Add Week Modal
  const handleOpenAddWeek = (domainSlug: string) => {
    setTargetWeekDomainSlug(domainSlug);
    const dom = allDomains.find((d) => d.slug === domainSlug);
    const nextNum = (dom?.weeks?.length || 0) + 1;
    setNewWeekTitle(`Week ${nextNum}: Advanced Specialization`);
    setNewWeekFocus(`Comprehensive problem solving and evaluation for week ${nextNum}.`);
    setShowAddWeekModal(true);
  };

  // Form Submit: Add Week
  const handleCreateWeek = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWeekDomainSlug || !newWeekTitle.trim()) return;
    addWeekToDomain(targetWeekDomainSlug, {
      title: newWeekTitle.trim(),
      focus: newWeekFocus.trim(),
    });
    setShowAddWeekModal(false);
  };

  // Execute confirmed deletion
  const executeDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "domain") {
      deleteDomain(deleteTarget.domainSlug);
    } else if (deleteTarget.type === "week" && typeof deleteTarget.idOrNumber === "number") {
      removeWeekFromDomain(deleteTarget.domainSlug, deleteTarget.idOrNumber);
    } else if (deleteTarget.type === "topic" && typeof deleteTarget.idOrNumber === "string") {
      removeTopic(deleteTarget.domainSlug, deleteTarget.idOrNumber);
    } else if (deleteTarget.type === "task" && typeof deleteTarget.idOrNumber === "string") {
      const parts = deleteTarget.idOrNumber.split("::");
      if (parts.length === 2) {
        removeTaskFromWeek(deleteTarget.domainSlug, Number(parts[0]), parts[1]);
      }
    }

    setDeleteTarget(null);
  };

  // Filter domains
  const filteredDomains = allDomains.filter((d) => {
    const matchesDomain =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.slug.toLowerCase().includes(search.toLowerCase());
    const matchesTopics = d.topics.some((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
    const matchesWeeks = d.weeks?.some((w) =>
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.focus.toLowerCase().includes(search.toLowerCase()) ||
      w.tasks.some((t) => t.label.toLowerCase().includes(search.toLowerCase()))
    );
    return matchesDomain || matchesTopics || matchesWeeks;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner & Header */}
      <PageHeader
        icon={FolderTree}
        title="Domains, Topics & Placement Roadmaps"
        subtitle="Dynamic curriculum control center: manage domains, assign topics to specific weekly timelines, and configure preparation roadmaps in real-time."
        badge={`${allDomains.length} ACTIVE TRACKS`}
        accent="cyan"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm("Reset all domains and roadmaps back to platform canonical defaults?")) {
                  resetToDefaultTaxonomy();
                }
              }}
              className="text-xs font-semibold h-10 px-3.5 rounded-xl border border-border hover:bg-surface-raised text-text-muted hover:text-text-primary flex items-center gap-1.5"
              title="Reset to canonical defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </Button>

            <Button
              onClick={() => setShowAddDomainModal(true)}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all cursor-pointer border-none"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add New Domain</span>
            </Button>
          </div>
        }
      />

      {/* Info Banner */}
      <Callout
        variant="info"
        icon={Sparkles}
        title="Real-Time Synchronization with Student Prep Roadmaps"
      >
        Any domain added, removed, or edited here immediately updates the Student Preparation Roadmaps view (<CalloutCode>/preparation</CalloutCode>) and assessment filters across the platform. You can assign topics directly to specific roadmap weeks (<CalloutCode>Week 1</CalloutCode>, <CalloutCode>Week 2</CalloutCode>, etc.).
      </Callout>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by domain, topic, subtopic, or week..."
          className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-xl text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400 shadow-2xs transition-all"
        />
      </div>

      {/* DOMAIN LIST / TREE */}
      <div className="space-y-4">
        {filteredDomains.map((dom) => {
          const isExpanded = expandedDomainSlugs.includes(dom.slug);
          const domainHidden = isHidden(dom.slug);
          const IconComponent = getDomainIcon(dom.icon);
          const activeTab = domainViewTab[dom.slug] || "curriculum";

          return (
            <Card
              key={dom.id}
              className={`border transition-all duration-200 overflow-hidden ${
                domainHidden
                  ? "opacity-60 bg-surface/50 border-border"
                  : "bg-surface border-border hover:border-cyan-500/30"
              }`}
            >
              {/* Domain Header Row */}
              <div
                className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none bg-surface-raised/40 hover:bg-surface-raised/80 transition-colors"
                onClick={() => toggleExpand(dom.slug)}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                      backgroundColor: `${dom.color}20`,
                      color: dom.color,
                      border: `1px solid ${dom.color}40`,
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-text-primary">
                        {dom.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                        {dom.slug}
                      </span>
                      {dom.level && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {dom.level}
                        </span>
                      )}
                      {dom.isCustom && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-1 max-w-2xl line-clamp-1">
                      {dom.description}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {dom.weeks?.length || dom.durationWeeks || 0} Weeks
                  </span>
                  <span className="text-xs font-mono text-purple-400 font-semibold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    {dom.topics.length} Topics
                  </span>

                  {/* Hide/Unhide */}
                  <button
                    type="button"
                    title={domainHidden ? "Unhide domain" : "Hide domain from student view"}
                    onClick={() => toggleHide(dom.slug)}
                    className="p-1.5 text-text-muted hover:text-cyan-400 hover:bg-surface-raised rounded-lg transition-colors"
                  >
                    {domainHidden ? (
                      <EyeOff className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                  {/* Add Topic / Timeline */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAddTopic(dom.slug)}
                    className="text-xs py-1 h-8 border-border hover:bg-surface text-cyan-400 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    Add Topic / Task
                  </Button>

                  {/* Add Week */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAddWeek(dom.slug)}
                    className="text-xs py-1 h-8 border-border hover:bg-surface text-text-muted hover:text-text-primary flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    Add Week
                  </Button>

                  {/* Delete Domain */}
                  <button
                    type="button"
                    title="Delete domain"
                    onClick={() =>
                      setDeleteTarget({
                        type: "domain",
                        domainSlug: dom.slug,
                        domainName: dom.name,
                      })
                    }
                    className="p-1.5 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-1 text-text-muted">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Body: Curriculum & Topics */}
              {isExpanded && (
                <div className="border-t border-border bg-ink/20">
                  {/* Sub-Tabs: Curriculum vs Topics */}
                  <div className="flex items-center gap-2 px-5 pt-4 border-b border-border bg-surface-raised/20">
                    <button
                      onClick={() =>
                        setDomainViewTab((prev) => ({ ...prev, [dom.slug]: "curriculum" }))
                      }
                      className={`text-xs pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeTab === "curriculum"
                          ? "border-cyan-400 text-cyan-400"
                          : "border-transparent text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Weekly Curriculum & Timeline ({dom.weeks?.length || 0} Weeks)
                    </button>

                    <button
                      onClick={() =>
                        setDomainViewTab((prev) => ({ ...prev, [dom.slug]: "topics" }))
                      }
                      className={`text-xs pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeTab === "topics"
                          ? "border-cyan-400 text-cyan-400"
                          : "border-transparent text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      Core Topics & Subtopics ({dom.topics.length})
                    </button>
                  </div>

                  {/* TAB 1: WEEKLY CURRICULUM */}
                  {activeTab === "curriculum" && (
                    <div className="p-5 space-y-4">
                      {(!dom.weeks || dom.weeks.length === 0) ? (
                        <div className="p-6 text-center text-text-muted text-xs bg-surface/40 rounded-xl border border-dashed border-border">
                          No weeks defined yet. Click "Add Week" to create the first milestone.
                        </div>
                      ) : (
                        dom.weeks.map((week) => (
                          <div
                            key={week.weekNumber}
                            className="bg-surface rounded-xl border border-border p-4 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                  W{week.weekNumber}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-text-primary">
                                    {week.title}
                                  </h4>
                                  <p className="text-[11px] text-text-muted mt-0.5">
                                    {week.focus}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface-raised border border-border">
                                  {week.tasks.length} Tasks
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "week",
                                      domainSlug: dom.slug,
                                      domainName: dom.name,
                                      idOrNumber: week.weekNumber,
                                      label: week.title,
                                    })
                                  }
                                  className="text-text-muted hover:text-rose-400 p-1"
                                  title="Delete Week"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Week Tasks */}
                            <div className="space-y-2">
                              {week.tasks.map((task) => {
                                const typeCfg = getTaskTypeConfig(task.type);
                                const TypeIcon = typeCfg.icon;

                                return (
                                  <div
                                    key={task.id}
                                    className="p-2.5 rounded-lg bg-surface-raised/50 border border-border/80 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span
                                        className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 ${typeCfg.color}`}
                                      >
                                        <TypeIcon className="w-3 h-3" />
                                        {typeCfg.label}
                                      </span>
                                      <span className="text-text-primary font-medium truncate">
                                        {task.label}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.estimatedMinutes}m
                                      </span>
                                      <span className="text-[10px] font-mono text-cyan-400/80 bg-surface px-1.5 py-0.5 rounded border border-border">
                                        {task.linkUrl}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteTarget({
                                            type: "task",
                                            domainSlug: dom.slug,
                                            domainName: dom.name,
                                            idOrNumber: `${week.weekNumber}::${task.id}`,
                                            label: task.label,
                                          })
                                        }
                                        className="text-text-muted hover:text-rose-400 p-1"
                                        title="Remove task from week"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 2: TOPICS & SUBTOPICS */}
                  {activeTab === "topics" && (
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dom.topics.map((top) => {
                          const topicHidden = isHidden(top.slug);
                          const usageCount = getItemCount(top.name, dom.name);

                          return (
                            <div
                              key={top.id}
                              className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                                topicHidden
                                  ? "opacity-50 bg-surface/40 border-border"
                                  : "bg-surface border-border hover:border-cyan-500/20"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-text-primary truncate">
                                  {top.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {top.weekNumber && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                      W{top.weekNumber}
                                    </span>
                                  )}
                                  <span
                                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                    title="Content items using this topic"
                                  >
                                    {usageCount} items
                                  </span>

                                  <button
                                    type="button"
                                    title="Delete topic"
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: "topic",
                                        domainSlug: dom.slug,
                                        domainName: dom.name,
                                        idOrNumber: top.slug,
                                        label: top.name,
                                      })
                                    }
                                    className="text-text-muted hover:text-rose-400 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {top.subtopics && top.subtopics.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {top.subtopics.map((sub, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-raised text-text-muted border border-border"
                                    >
                                      {sub}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* MODAL 1: ADD NEW DOMAIN */}
      <Dialog
        isOpen={showAddDomainModal}
        onClose={() => setShowAddDomainModal(false)}
        title="Add New Engineering Domain"
        description="Expand the curriculum taxonomy with a new career domain and auto-generate its placement roadmap."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateDomain} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Domain Name *
            </label>
            <input
              type="text"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              placeholder="e.g. Cybersecurity & Ethical Hacking"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={newDomainDesc}
              onChange={(e) => setNewDomainDesc(e.target.value)}
              placeholder="Scope and interview competencies covered by this domain..."
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Duration (Weeks)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={newDomainWeeks}
                onChange={(e) => setNewDomainWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Total Prep Hours
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={newDomainHours}
                onChange={(e) => setNewDomainHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Level Description
            </label>
            <input
              type="text"
              value={newDomainLevel}
              onChange={(e) => setNewDomainLevel(e.target.value)}
              placeholder="e.g. Beginner to Enterprise Specialist"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Icon Style
              </label>
              <select
                value={newDomainIcon}
                onChange={(e) => setNewDomainIcon(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="Binary">Binary (Code/DSA)</option>
                <option value="Layout">Layout (Frontend)</option>
                <option value="Server">Server (Backend)</option>
                <option value="BrainCircuit">BrainCircuit (AI/ML)</option>
                <option value="BarChart3">BarChart3 (Data)</option>
                <option value="Cloud">Cloud (DevOps)</option>
                <option value="Zap">Zap (Aptitude)</option>
                <option value="Layers">Layers (General)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={newDomainColor}
                  onChange={(e) => setNewDomainColor(e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-text-muted">{newDomainColor}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddDomainModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4"
            >
              Create Domain & Roadmap
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 2: ADD TOPIC WITH TIMELINE */}
      <Dialog
        isOpen={showAddTopicModal}
        onClose={() => setShowAddTopicModal(false)}
        title="Add Topic & Timeline Assignment"
        description="Define a new curriculum topic and assign it to a specific week in the preparation roadmap."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateTopicWithTimeline} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Target Domain
            </label>
            <select
              value={targetDomainSlug}
              onChange={(e) => {
                setTargetDomainSlug(e.target.value);
                const dom = allDomains.find((d) => d.slug === e.target.value);
                setSelectedWeekNumber(dom?.weeks?.[0]?.weekNumber || 1);
              }}
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
            >
              {allDomains.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.weeks?.length || 0} Weeks)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => {
                setNewTopicName(e.target.value);
                if (!newTaskLabel) {
                  setNewTaskLabel(`Master ${e.target.value} & Solve Benchmark Exercises`);
                }
              }}
              placeholder="e.g. Raft Consensus Protocol"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Subtopics (Comma separated)
            </label>
            <textarea
              rows={2}
              value={newSubtopicsRaw}
              onChange={(e) => setNewSubtopicsRaw(e.target.value)}
              placeholder="Leader Election, Log Replication, Safety Invariants"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Roadmap Timeline Week *
              </label>
              <select
                value={selectedWeekNumber}
                onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
              >
                {(() => {
                  const targetDom = allDomains.find((d) => d.slug === targetDomainSlug);
                  const weeks = targetDom?.weeks || [];
                  if (weeks.length === 0) {
                    return <option value={1}>Week 1 (Create new)</option>;
                  }
                  return (
                    <>
                      {weeks.map((w) => (
                        <option key={w.weekNumber} value={w.weekNumber}>
                          Week {w.weekNumber}: {w.title.slice(0, 24)}...
                        </option>
                      ))}
                      <option value={weeks.length + 1}>
                        + Add as New Week {weeks.length + 1}
                      </option>
                    </>
                  );
                })()}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Task Type
              </label>
              <select
                value={selectedTaskType}
                onChange={(e) =>
                  setSelectedTaskType(e.target.value as any)
                }
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="CODING">Coding (Coding Arena)</option>
                <option value="QUIZ">Quiz (Concept Quiz)</option>
                <option value="PRACTICE">Practice (Practice Track)</option>
                <option value="INTERVIEW">Interview (Mock Interview)</option>
                <option value="READING">Reading (Article / Guide)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Curriculum Task Label
            </label>
            <input
              type="text"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              placeholder="e.g. Solve 4 Rotated Array & Lower Bound problems"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Estimated Minutes
            </label>
            <input
              type="number"
              min={10}
              max={240}
              value={newEstimatedMinutes}
              onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddTopicModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4"
            >
              Save Topic & Add to Roadmap
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 3: ADD WEEK TO DOMAIN */}
      <Dialog
        isOpen={showAddWeekModal}
        onClose={() => setShowAddWeekModal(false)}
        title="Add Week to Roadmap"
        description="Add a new milestone week to this domain's preparation roadmap."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateWeek} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Week Title *
            </label>
            <input
              type="text"
              value={newWeekTitle}
              onChange={(e) => setNewWeekTitle(e.target.value)}
              placeholder="e.g. Week 8: Advanced Dynamic Programming & Tries"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Focus & Core Objectives
            </label>
            <textarea
              rows={3}
              value={newWeekFocus}
              onChange={(e) => setNewWeekFocus(e.target.value)}
              placeholder="Specific core competencies, algorithms, or concepts mastered in this week..."
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddWeekModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4"
            >
              Add Week
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 4: CONFIRM DELETE */}
      <Dialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={`Confirm Delete ${
          deleteTarget?.type === "domain"
            ? "Domain"
            : deleteTarget?.type === "week"
            ? "Curriculum Week"
            : deleteTarget?.type === "topic"
            ? "Topic"
            : "Task"
        }`}
        description="This action will permanently remove this item from the platform."
        maxWidthClass="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Are you sure you want to delete{" "}
            <span className="font-bold text-text-primary">
              {deleteTarget?.label || deleteTarget?.domainName || "this item"}
            </span>
            ? This will immediately remove it from both the Admin Panel and the Student Preparation Roadmaps.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={executeDelete}
              className="bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs px-4"
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
