import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Video,
  Layers,
  Sparkles,
  Clock,
  Users,
  Play,
  Pause,
  BarChart3,
  Calendar,
  RotateCw,
  FolderTree,
  ChevronRight,
  ExternalLink,
  Edit2,
  Check,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import {
  ContentItem,
  ContentType,
  ContentStatus,
  ContentSummary,
  contentManagerService,
} from "@/services/contentManagerService";
import { useTaxonomy } from "@/hooks/useTaxonomy";

export const ContentManagerHub: React.FC = () => {
  const { domains } = useTaxonomy();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [summary, setSummary] = useState<ContentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiType, setAiType] = useState<"QUIZ" | "MOCK_TEST" | "MOCK_INTERVIEW" | "PRACTICE_TOPIC">("QUIZ");
  const [aiDomain, setAiDomain] = useState<string>("dsa");
  const [aiTopic, setAiTopic] = useState<string>("");
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Medium");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [aiDurationMinutes, setAiDurationMinutes] = useState<number>(30);
  const [aiPassPercentage, setAiPassPercentage] = useState<number>(70);
  const [aiNegativeMarking, setAiNegativeMarking] = useState<boolean>(true);

  // Preview & Delete Modals
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

  // Edit Modal State
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState(30);
  const [editPassMark, setEditPassMark] = useState(70);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contentData, summaryData] = await Promise.all([
        contentManagerService.listContent({
          type: typeFilter,
          subject: domainFilter,
          difficulty: difficultyFilter,
          status: statusFilter,
          search,
        }),
        contentManagerService.getSummary(),
      ]);
      setItems(contentData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Load content data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("content-updated", handleUpdate);
    return () => window.removeEventListener("content-updated", handleUpdate);
  }, [typeFilter, domainFilter, difficultyFilter, statusFilter, search]);

  // Set default domain topic when domain changes in AI modal
  useEffect(() => {
    const matched = domains.find((d) => d.slug === aiDomain);
    if (matched && matched.topics?.length > 0) {
      setAiTopic(matched.topics[0].name);
    } else {
      setAiTopic("Core Fundamentals");
    }
  }, [aiDomain, domains]);

  // 1-Click AI Test Generation
  const handleGenerateAiTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const created = await contentManagerService.generateAiTest({
        type: aiType,
        domain: aiDomain,
        topic: aiTopic || "Core Concepts",
        difficulty: aiDifficulty,
        questionCount: aiQuestionCount,
        durationMinutes: aiDurationMinutes,
        passPercentage: aiPassPercentage,
        negativeMarking: aiNegativeMarking,
      });

      setShowAiModal(false);
      loadData();
    } catch (err) {
      console.error("Failed to generate test:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Pause / Resume
  const handleTogglePause = async (item: ContentItem) => {
    try {
      await contentManagerService.togglePauseContent(item.id);
      loadData();
    } catch (err) {
      console.error("Toggle pause error:", err);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await contentManagerService.deleteContent(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Edit save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await contentManagerService.updateContent(editItem.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        durationMinutes: editDuration,
        passMarkPercent: editPassMark,
        settings: {
          ...editItem.settings,
          durationMinutes: editDuration,
          passPercentage: editPassMark,
        },
      });
      setEditItem(null);
      loadData();
    } catch (err) {
      console.error("Save edit error:", err);
    }
  };

  const getTypeBadge = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes("QUIZ")) {
      return {
        label: "MCQ Quiz",
        icon: HelpCircle,
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
    }
    if (t.includes("MOCK_TEST") || t.includes("MOCK TEST")) {
      return {
        label: "Mock Test",
        icon: Clock,
        className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      };
    }
    if (t.includes("INTERVIEW")) {
      return {
        label: "AI Mock Interview",
        icon: Video,
        className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      };
    }
    return {
      label: "Practice Track",
      icon: Sparkles,
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  Tests & Practice Content Manager
                </h1>
                <Badge variant="accent" className="font-mono text-xs">
                  {items.length} Modules
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                AI-driven test authoring center: synthesize quizzes, mock tests, AI domain interviews, and practice tracks with real-time attendee telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setShowAiModal(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            1-Click AI Test Synthesizer
          </Button>
        </div>
      </div>

      {/* Summary Telemetry Metrics Banner */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
              Total Tests
            </span>
            <div className="text-xl font-bold text-text-primary font-mono mt-1">
              {summary.totalItems}
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
              Active / Published
            </span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {summary.totalPublished}
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
              Paused / Draft
            </span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              {summary.totalDrafts}
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
              Total Student Attempts
            </span>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1 flex items-center gap-1">
              <Users className="w-4 h-4" /> {summary.totalAttendees}
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block">
              Avg Pass Rate
            </span>
            <div className="text-xl font-bold text-purple-400 font-mono mt-1">
              {summary.avgPlatformPassRate}%
            </div>
          </div>
        </div>
      )}

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs">
        {[
          { id: "ALL", label: "All Tests & Tracks" },
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
              className={`pb-2.5 px-3 font-medium transition-colors flex items-center gap-1.5 shrink-0 border-b-2 ${
                isSelected
                  ? "border-cyan-400 text-cyan-400 font-semibold"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface p-3 rounded-2xl border border-border">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests by title, topic..."
            className="w-full pl-9 pr-3 py-2 bg-surface-raised border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Domain Filter */}
        <div>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Domains</option>
            {domains.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Active / Published</option>
            <option value="DRAFT">Paused / Draft</option>
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs font-mono text-text-muted">
          Loading tests and assessment modules...
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center bg-surface border-border">
          <Layers className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-base text-text-primary">No Tests Found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or click "1-Click AI Test Synthesizer" to generate a new test immediately.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isPublished = item.status === "PUBLISHED" || item.status === "Published";
            const typeBadge = getTypeBadge(item.type);
            const TypeIcon = typeBadge.icon;
            const qCount = item.questionsCount || item.contentData?.questions?.length || 5;
            const timer = item.durationMinutes || item.settings?.durationMinutes || 30;
            const attempts = item.studentAttempts || 0;
            const avgScore = item.avgScorePercent || 75;

            return (
              <Card
                key={item.id}
                className="p-5 bg-surface border-border hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Type Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1 font-semibold ${typeBadge.className}`}
                    >
                      <TypeIcon className="w-3 h-3" />
                      {typeBadge.label}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isPublished
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {isPublished ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" /> Active
                        </>
                      ) : (
                        <>
                          <Pause className="w-2.5 h-2.5" /> Paused
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-sm text-text-primary group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Domain & Topic Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-cyan-300 px-2 py-0.5 rounded">
                      {item.subject.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded">
                      {item.difficulty}
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {timer}m
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded">
                      {qCount} Qs
                    </span>
                  </div>
                </div>

                {/* Telemetry Footer & Action Buttons */}
                <div className="pt-3 border-t border-border space-y-3">
                  {/* Telemetry numbers */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                    <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                      <Users className="w-3.5 h-3.5" /> {attempts} Attended
                    </span>
                    <span className="text-text-primary">
                      {avgScore}% Avg Score
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <div className="flex items-center gap-1">
                      {/* Pause / Resume Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePause(item)}
                        className={`text-xs h-7 px-2 border-border flex items-center gap-1 ${
                          isPublished
                            ? "text-amber-400 hover:bg-amber-500/10"
                            : "text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                        title={isPublished ? "Pause test (hide from students)" : "Resume test (make available)"}
                      >
                        {isPublished ? (
                          <>
                            <Pause className="w-3 h-3" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-emerald-400" /> Resume
                          </>
                        )}
                      </Button>

                      {/* Edit */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditItem(item);
                          setEditTitle(item.title);
                          setEditDescription(item.description);
                          setEditDuration(item.durationMinutes || 30);
                          setEditPassMark(item.passMarkPercent || 70);
                        }}
                        className="text-xs h-7 px-2 border-border text-text-muted hover:text-text-primary"
                        title="Edit title or settings"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>

                      {/* Preview */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewItem(item)}
                        className="text-xs h-7 px-2 border-border text-text-muted hover:text-text-primary"
                        title="Preview questions"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete test"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: 1-CLICK AI TEST SYNTHESIZER */}
      <Dialog
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        title="1-Click AI Test Synthesizer"
        description="Generate complete quizzes, mock tests, and interviews with questions, options, code snippets, and explanations automatically using AI."
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleGenerateAiTest} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Test / Module Type *
              </label>
              <select
                value={aiType}
                onChange={(e) => setAiType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
              >
                <option value="QUIZ">MCQ Quiz</option>
                <option value="MOCK_TEST">Full Mock Test</option>
                <option value="MOCK_INTERVIEW">AI Mock Interview</option>
                <option value="PRACTICE_TOPIC">Practice Track</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Target Domain *
              </label>
              <select
                value={aiDomain}
                onChange={(e) => setAiDomain(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
              >
                {domains.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Topic / Skill Focus
            </label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g. Sliding Window Invariants or Fiber Reconciliation"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Difficulty
              </label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value as any)}
                className="w-full px-2.5 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Questions
              </label>
              <select
                value={aiQuestionCount}
                onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Timer (Mins)
              </label>
              <select
                value={aiDurationMinutes}
                onChange={(e) => setAiDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value={15}>15 Mins</option>
                <option value={25}>25 Mins</option>
                <option value={30}>30 Mins</option>
                <option value={45}>45 Mins</option>
                <option value={60}>60 Mins</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={40}
                max={100}
                value={aiPassPercentage}
                onChange={(e) => setAiPassPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="negMark"
                checked={aiNegativeMarking}
                onChange={(e) => setAiNegativeMarking(e.target.checked)}
                className="w-4 h-4 rounded border-border text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="negMark" className="text-xs text-text-muted select-none cursor-pointer">
                Negative Marking (-0.25)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAiModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isGenerating}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              {isGenerating ? "Synthesizing Test..." : "Generate Test with AI"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 2: EDIT TEST SETTINGS */}
      <Dialog
        isOpen={editItem !== null}
        onClose={() => setEditItem(null)}
        title="Edit Test Details"
        description="Update title, description, time limit, and passing score."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
            <textarea
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Timer (Minutes)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Pass Mark (%)</label>
              <input
                type="number"
                min={30}
                max={100}
                value={editPassMark}
                onChange={(e) => setEditPassMark(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditItem(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 3: PREVIEW QUESTIONS */}
      {previewItem && (
        <Dialog
          isOpen={previewItem !== null}
          onClose={() => setPreviewItem(null)}
          title={`Preview: ${previewItem.title}`}
          description={`${previewItem.subject.toUpperCase()} · ${previewItem.durationMinutes} Mins · ${
            previewItem.contentData?.questions?.length || 0
          } Questions`}
          maxWidthClass="max-w-2xl"
        >
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {previewItem.contentData?.questions?.map((q: any, idx: number) => (
              <div
                key={q.id || idx}
                className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-text-primary">
                    {idx + 1}. {q.question}
                  </span>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {q.difficulty}
                  </Badge>
                </div>

                {q.codeSnippet && (
                  <pre className="p-2.5 bg-ink rounded-lg font-mono text-[11px] text-cyan-300 overflow-x-auto border border-border/80">
                    {q.codeSnippet}
                  </pre>
                )}

                {q.options && (
                  <div className="space-y-1 pt-1">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-lg border font-mono text-[11px] flex items-center gap-2 ${
                          optIdx === q.correctIndex
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold"
                            : "bg-surface border-border text-text-muted"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px] shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                        {optIdx === q.correctIndex && (
                          <span className="ml-auto text-[10px] text-emerald-400 font-bold">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {q.explanation && (
                  <p className="text-[11px] text-text-muted bg-surface/60 p-2 rounded border border-border/60">
                    <span className="text-cyan-400 font-semibold">Explanation: </span>
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Dialog>
      )}

      {/* MODAL 4: CONFIRM DELETE */}
      <Dialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete Test"
        description="Are you sure you want to delete this test?"
        maxWidthClass="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Are you sure you want to permanently delete{" "}
            <span className="font-bold text-text-primary">
              {deleteTarget?.title}
            </span>
            ? This will remove all associated student attempt records and telemetry.
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
              onClick={handleConfirmDelete}
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
