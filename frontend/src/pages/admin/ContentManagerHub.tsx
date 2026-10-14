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
  Layers,
  Sparkles,
  Clock,
  Users,
  Play,
  Pause,
  BarChart3,
  Calendar,
  RotateCw,
  Edit2,
  Check,
  Target,
  Download,
  FileText,
  X,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import {
  ContentItem,
  ContentStatus,
  ContentSummary,
  QuizQuestionItem,
  TestPerformanceReport,
  contentManagerService,
} from "@/services/contentManagerService";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { PageHeader } from "@/components/common/PageHeader";
import { Callout } from "@/components/common/Callout";
import { StatGrid, MetricTile } from "@/components/common/StatGrid";
import { FilterBar, FilterSearch, FilterSelect } from "@/components/common/FilterBar";

export const ContentManagerHub: React.FC = () => {
  const { domains } = useTaxonomy();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [summary, setSummary] = useState<ContentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Creation Wizard Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<"AI" | "MANUAL" | "IMPORT">("AI");
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Generator Form Fields
  const [aiDomain, setAiDomain] = useState<string>("aptitude");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Quantitative Aptitude", "Logical Reasoning"]);
  const [customTopicInput, setCustomTopicInput] = useState<string>("");
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Medium");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [aiDurationMinutes, setAiDurationMinutes] = useState<number>(30);
  const [aiPassPercentage, setAiPassPercentage] = useState<number>(70);
  const [aiNegativeMarking, setAiNegativeMarking] = useState<boolean>(true);

  // Manual Question Builder State
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualDomain, setManualDomain] = useState("aptitude");
  const [manualDuration, setManualDuration] = useState(30);
  const [manualPassMark, setManualPassMark] = useState(70);
  const [manualNegativeMarking, setManualNegativeMarking] = useState(true);
  const [manualQuestions, setManualQuestions] = useState<QuizQuestionItem[]>([]);

  // Single Question Editor Input
  const [qText, setQText] = useState("");
  const [qOpt0, setQOpt0] = useState("");
  const [qOpt1, setQOpt1] = useState("");
  const [qOpt2, setQOpt2] = useState("");
  const [qOpt3, setQOpt3] = useState("");
  const [qCorrectIdx, setQCorrectIdx] = useState(0);
  const [qExplanation, setQExplanation] = useState("");
  const [qSnippet, setQSnippet] = useState("");
  const [qTopic, setQTopic] = useState("");

  // Bulk JSON / CSV Import State
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  // Preview & Delete Modals
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

  // Edit Modal State
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState(30);
  const [editPassMark, setEditPassMark] = useState(70);

  // Test Report & Analytics Modal State
  const [reportTarget, setReportTarget] = useState<ContentItem | null>(null);
  const [reportData, setReportData] = useState<TestPerformanceReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contentData, summaryData] = await Promise.all([
        contentManagerService.listContent({
          type: "QUIZ",
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
    window.addEventListener("submissions-updated", handleUpdate);
    return () => {
      window.removeEventListener("content-updated", handleUpdate);
      window.removeEventListener("submissions-updated", handleUpdate);
    };
  }, [domainFilter, difficultyFilter, statusFilter, search]);

  // Set default domain topics when AI domain changes
  useEffect(() => {
    const matched = domains.find((d) => d.slug === aiDomain || d.slug.toLowerCase() === aiDomain.toLowerCase());
    if (matched && matched.topics?.length > 0) {
      setSelectedTopics(matched.topics.slice(0, 3).map((t) => t.name));
    } else {
      if (aiDomain.toLowerCase().includes("aptitude")) {
        setSelectedTopics(["Quantitative Aptitude", "Logical Reasoning", "Time & Work"]);
      } else if (aiDomain.toLowerCase().includes("dsa")) {
        setSelectedTopics(["Arrays & Strings", "Binary Search", "Trees"]);
      } else if (aiDomain.toLowerCase().includes("front")) {
        setSelectedTopics(["React 19", "Web Performance", "TypeScript"]);
      } else {
        setSelectedTopics(["Core Principles", "Architecture"]);
      }
    }
  }, [aiDomain, domains]);

  const toggleTopicSelection = (topicName: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleAddCustomTopic = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    const clean = customTopicInput.trim();
    if (!clean) return;
    if (!selectedTopics.includes(clean)) {
      setSelectedTopics((prev) => [...prev, clean]);
    }
    setCustomTopicInput("");
  };

  // 1-Click AI Test Generation
  const handleGenerateAiTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await contentManagerService.generateAiTest({
        domain: aiDomain,
        topics: selectedTopics.length > 0 ? selectedTopics : ["Core Competencies"],
        difficulty: aiDifficulty,
        questionCount: aiQuestionCount,
        durationMinutes: aiDurationMinutes,
        passPercentage: aiPassPercentage,
        negativeMarking: aiNegativeMarking,
      });

      setShowCreateModal(false);
      loadData();
    } catch (err) {
      console.error("Failed to generate test:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Manual Question Addition
  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qOpt0.trim() || !qOpt1.trim() || !qOpt2.trim() || !qOpt3.trim()) {
      alert("Please provide the question prompt and all 4 options.");
      return;
    }

    const newQ: QuizQuestionItem = {
      id: `q-man-${Date.now()}-${manualQuestions.length + 1}`,
      question: qText.trim(),
      codeSnippet: qSnippet.trim() || undefined,
      options: [qOpt0.trim(), qOpt1.trim(), qOpt2.trim(), qOpt3.trim()],
      correctIndex: qCorrectIdx,
      explanation: qExplanation.trim() || "Correct answer based on domain specifications.",
      topic: qTopic.trim() || "General",
      difficulty: "Medium",
    };

    setManualQuestions((prev) => [...prev, newQ]);
    setQText("");
    setQOpt0("");
    setQOpt1("");
    setQOpt2("");
    setQOpt3("");
    setQCorrectIdx(0);
    setQExplanation("");
    setQSnippet("");
    setQTopic("");
  };

  const handlePublishManualQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualQuestions.length === 0) {
      alert("Please add at least 1 question before publishing.");
      return;
    }

    try {
      await contentManagerService.createManualQuiz({
        title: manualTitle.trim() || `${manualDomain.toUpperCase()} MCQ Quiz`,
        description: manualDescription.trim() || `Author-crafted assessment with ${manualQuestions.length} questions.`,
        domain: manualDomain,
        topics: [manualDomain],
        difficulty: "Medium",
        durationMinutes: manualDuration,
        passPercentage: manualPassMark,
        negativeMarking: manualNegativeMarking,
        questions: manualQuestions,
      });

      setShowCreateModal(false);
      setManualQuestions([]);
      setManualTitle("");
      setManualDescription("");
      loadData();
    } catch (err) {
      console.error("Failed to publish manual quiz:", err);
    }
  };

  // Parse Bulk JSON Template
  const handleLoadSampleJson = () => {
    const sample = [
      {
        question: "What is the time complexity of searching an element in a balanced binary search tree?",
        options: ["O(N^2)", "O(N)", "O(log N)", "O(1)"],
        correctIndex: 2,
        explanation: "In a balanced BST, height is bounded by log2(N), guaranteeing logarithmic search time.",
        topic: "Trees",
      },
      {
        question: "A pipe fills a tank in 10 hours and another empties it in 15 hours. How long to fill together?",
        options: ["20 hours", "30 hours", "25 hours", "35 hours"],
        correctIndex: 1,
        explanation: "Net rate = (1/10) - (1/15) = (3 - 2)/30 = 1/30 per hour => 30 hours.",
        topic: "Time & Work",
      },
    ];
    setImportJsonText(JSON.stringify(sample, null, 2));
    setImportError(null);
  };

  const handleApplyJsonImport = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("JSON must be a non-empty array of question objects.");
      }

      const validated: QuizQuestionItem[] = parsed.map((item, idx) => {
        if (!item.question || !Array.isArray(item.options) || item.options.length < 2) {
          throw new Error(`Question #${idx + 1} is missing 'question' or valid 'options' array.`);
        }
        return {
          id: `q-imp-${Date.now()}-${idx + 1}`,
          question: String(item.question),
          options: item.options.map((o: any) => String(o)),
          correctIndex: typeof item.correctIndex === "number" ? item.correctIndex : 0,
          explanation: item.explanation ? String(item.explanation) : "Benchmark standard key.",
          topic: item.topic ? String(item.topic) : "General",
          codeSnippet: item.codeSnippet ? String(item.codeSnippet) : undefined,
          difficulty: item.difficulty || "Medium",
        };
      });

      setManualQuestions((prev) => [...prev, ...validated]);
      setCreateMode("MANUAL");
      setImportJsonText("");
    } catch (err: any) {
      setImportError(err.message || "Invalid JSON syntax.");
    }
  };

  // Open Test Report Dialog
  const handleOpenReport = async (item: ContentItem) => {
    setReportTarget(item);
    setIsLoadingReport(true);
    try {
      const data = await contentManagerService.getTestPerformanceReport(item.id);
      setReportData(data);
    } catch (err) {
      console.error("Failed to load test report:", err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Export Attendees CSV
  const handleExportAttendeesCsv = () => {
    if (!reportData || reportData.attendees.length === 0) return;
    const headers = ["Rank", "Student Name", "College", "Roll Number", "Score", "Total Marks", "Percentage", "Status", "Time (Seconds)", "Submitted At"];
    const rows = reportData.attendees.map((a) => [
      a.rank,
      `"${a.userName}"`,
      `"${a.college || 'N/A'}"`,
      `"${a.rollNumber || 'N/A'}"`,
      a.score,
      a.totalMarks,
      `${a.percentage}%`,
      a.isPassed ? "PASSED" : "FAILED",
      a.timeSpentSeconds,
      a.submittedAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportData.testTitle.replace(/[^a-zA-Z0-9]/g, "_")}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Active domain topics for topic chips
  const currentDomainObj = domains.find(
    (d) => d.slug === aiDomain || d.slug.toLowerCase() === aiDomain.toLowerCase()
  );
  const domainAvailableTopics = currentDomainObj?.topics?.map((t) => t.name) || [
    "Quantitative Aptitude",
    "Logical Reasoning",
    "Verbal Ability",
    "Data Interpretation",
    "Time & Work",
    "Percentages",
    "Number Series",
    "Syllogisms",
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header Banner */}
      <PageHeader
        icon={Layers}
        title="MCQ Quizzes & Assessments Manager"
        subtitle="AI-synthesize domain-strict quizzes, choose multiple topics, customize timers & difficulty, import questions, and inspect student performance analytics."
        badge={`${items.length} ACTIVE QUIZZES`}
        accent="cyan"
        actions={
          <Button
            onClick={() => {
              setCreateMode("AI");
              setShowCreateModal(true);
            }}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/25 transition-all cursor-pointer border-none"
          >
            <Sparkles className="w-4 h-4 text-white fill-none" />
            <span>Create / Synthesize MCQ Quiz</span>
          </Button>
        }
      />

      {/* Summary Telemetry Metrics Banner */}
      {summary && (
        <StatGrid columns={5}>
          <MetricTile
            label="Total MCQ Quizzes"
            value={summary.totalItems}
          />
          <MetricTile
            label="Active / Published"
            value={summary.totalPublished}
            accent="emerald"
            icon={CheckCircle2}
          />
          <MetricTile
            label="Paused / Draft"
            value={summary.totalDrafts}
            accent="amber"
            icon={Clock}
          />
          <MetricTile
            label="Total Student Attempts"
            value={summary.totalAttendees}
            accent="cyan"
            icon={Users}
          />
          <MetricTile
            label="Avg Pass Rate"
            value={`${summary.avgPlatformPassRate}%`}
            accent="violet"
            icon={Percent}
          />
        </StatGrid>
      )}

      {/* Domain Quick Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs tablist-scroll-container">
        <button
          onClick={() => setDomainFilter("ALL")}
          className={`pb-2.5 px-3 font-medium transition-colors shrink-0 border-b-2 ${
            domainFilter === "ALL"
              ? "border-cyan-400 text-cyan-400 font-semibold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          All Domains ({items.length})
        </button>
        {domains.map((dom) => {
          const isSelected = domainFilter.toLowerCase() === dom.slug.toLowerCase();
          const count = items.filter(
            (i) => i.subject.toLowerCase() === dom.slug.toLowerCase() || i.tags.some((t) => t.toLowerCase() === dom.slug.toLowerCase())
          ).length;

          return (
            <button
              key={dom.slug}
              onClick={() => setDomainFilter(dom.slug)}
              className={`pb-2.5 px-3 font-medium transition-colors shrink-0 border-b-2 flex items-center gap-1.5 ${
                isSelected
                  ? "border-cyan-400 text-cyan-400 font-semibold"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              <span>{dom.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-raised border border-border text-text-muted font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <FilterBar>
        <FilterSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes by title, topics..."
        />
        <FilterSelect
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="ALL">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </FilterSelect>
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Active / Published</option>
          <option value="DRAFT">Paused / Draft</option>
        </FilterSelect>
      </FilterBar>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs font-mono text-text-muted">
          Loading MCQ assessment modules...
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center bg-surface border-border">
          <Layers className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-base text-text-primary">No MCQ Quizzes Found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or click "+ Create / Synthesize MCQ Quiz" to generate a domain quiz immediately.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isPublished = item.status === "PUBLISHED" || item.status === "Published";
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
                  {/* Top Bar: Domain Chip & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-purple-400" />
                      MCQ QUIZ
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
                    <span className="text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded font-semibold uppercase">
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded">
                      {item.difficulty}
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {timer}m
                    </span>
                    <span className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded">
                      {qCount} Questions
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
                      {/* View Report & Analytics Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReport(item)}
                        className="text-xs h-7 px-2.5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 font-semibold"
                        title="View attendee list and questions error analysis"
                      >
                        <BarChart3 className="w-3 h-3" /> Report
                      </Button>

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
                        title={isPublished ? "Pause quiz" : "Resume quiz"}
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
                        title="Edit quiz settings"
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
                      title="Delete quiz"
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

      {/* MODAL 1: CREATE / SYNTHESIZE MCQ QUIZ (AI + MANUAL + IMPORT) */}
      <Dialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create & Synthesize MCQ Quiz"
        description="Choose between 1-Click AI Generation (domain-strict, shuffled answer keys), Manual Question Builder, or Bulk Questions Import."
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-4">
          {/* Sub-Tabs: AI vs Manual vs Import */}
          <div className="flex border-b border-border text-xs gap-1 pb-1">
            <button
              onClick={() => setCreateMode("AI")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                createMode === "AI"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> 1-Click AI Synthesizer
            </button>
            <button
              onClick={() => setCreateMode("MANUAL")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                createMode === "MANUAL"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" /> Manual Builder ({manualQuestions.length} Qs)
            </button>
            <button
              onClick={() => setCreateMode("IMPORT")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                createMode === "IMPORT"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Download className="w-3.5 h-3.5" /> Bulk JSON / CSV Import
            </button>
          </div>

          {/* TAB 1: AI GENERATOR */}
          {createMode === "AI" && (
            <form onSubmit={handleGenerateAiTest} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Target Quiz Domain *
                </label>
                <select
                  value={aiDomain}
                  onChange={(e) => setAiDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
                >
                  {domains.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name} {d.slug.toLowerCase().includes("aptitude") ? "(Strict Non-Coding Math & Reasoning)" : ""}
                    </option>
                  ))}
                </select>
                {aiDomain.toLowerCase().includes("aptitude") && (
                  <p className="text-[11px] text-amber-400 mt-1 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    Domain Strictness Active: Aptitude questions only (Quantitative, Logical, Verbal). No code/Java/Python will be generated.
                  </p>
                )}
              </div>

              {/* Multiple Topics Selection in Domain */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">
                  Choose Multiple Topics in this Domain *
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-surface-raised/60 rounded-xl border border-border max-h-32 overflow-y-auto">
                  {domainAvailableTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopicSelection(topic)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 font-semibold shadow-sm"
                            : "bg-surface border-border text-text-muted hover:border-border-hover"
                        }`}
                      >
                        {isSelected && "✓ "}
                        {topic}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Topic */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    onKeyDown={handleAddCustomTopic}
                    placeholder="Type custom sub-topic and press enter (e.g. Syllogisms or Sliding Window)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddCustomTopic}
                    className="text-xs h-8 px-3 shrink-0"
                  >
                    + Add Topic
                  </Button>
                </div>
              </div>

              {/* Number of Questions, Timer, Difficulty */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Questions Count
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
                    <option value={25}>25 Questions</option>
                    <option value={30}>30 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Timer (Minutes)
                  </label>
                  <select
                    value={aiDurationMinutes}
                    onChange={(e) => setAiDurationMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value={15}>15 Mins</option>
                    <option value={20}>20 Mins</option>
                    <option value={30}>30 Mins</option>
                    <option value={45}>45 Mins</option>
                    <option value={60}>60 Mins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Mixed">Mixed (Balanced)</option>
                  </select>
                </div>
              </div>

              {/* Passing Score & Negative Marking */}
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
                    Negative Marking (-0.25 penalty)
                  </label>
                </div>
              </div>

              <div className="p-3 bg-surface-raised/40 rounded-xl border border-border text-[11px] text-text-muted space-y-1">
                <span className="font-semibold text-cyan-300 block">Mixed Correct Options Guarantee:</span>
                <p>AI will generate questions with randomized correct answers distributed across A, B, C, and D, never defaulting to option A.</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
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
                  {isGenerating ? "Synthesizing Domain Quiz..." : "Generate & Publish Quiz with AI"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: MANUAL QUESTION BUILDER */}
          {createMode === "MANUAL" && (
            <div className="space-y-4 pt-1 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Quantitative Speed & Ratios Test"
                    className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Target Domain *
                  </label>
                  <select
                    value={manualDomain}
                    onChange={(e) => setManualDomain(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
                  >
                    {domains.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Timer (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Passing Mark (%)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={100}
                    value={manualPassMark}
                    onChange={(e) => setManualPassMark(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Questions Added List Preview */}
              {manualQuestions.length > 0 && (
                <div className="p-3 bg-surface-raised/80 rounded-xl border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cyan-400 font-mono">
                      Added Questions ({manualQuestions.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setManualQuestions([])}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {manualQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 rounded bg-surface border border-border flex items-center justify-between gap-2"
                      >
                        <span className="truncate text-text-primary font-mono">
                          {idx + 1}. {q.question}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                            Correct: {String.fromCharCode(65 + q.correctIndex)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setManualQuestions((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-text-muted hover:text-rose-400 p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Single Question Form */}
              <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2.5">
                <span className="text-xs font-bold text-text-primary block font-mono">
                  + Add Question #{manualQuestions.length + 1}
                </span>

                <div>
                  <label className="block text-[11px] text-text-muted mb-0.5">Question Prompt *</label>
                  <textarea
                    rows={2}
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Enter the question problem statement..."
                    className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5 flex items-center gap-1 font-mono">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={qCorrectIdx === 0}
                        onChange={() => setQCorrectIdx(0)}
                        className="text-cyan-500 cursor-pointer"
                      />
                      Option A (Mark correct)
                    </label>
                    <input
                      type="text"
                      value={qOpt0}
                      onChange={(e) => setQOpt0(e.target.value)}
                      placeholder="Choice A text"
                      className="w-full px-2.5 py-1 text-xs bg-surface-raised border border-border rounded text-text-primary focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5 flex items-center gap-1 font-mono">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={qCorrectIdx === 1}
                        onChange={() => setQCorrectIdx(1)}
                        className="text-cyan-500 cursor-pointer"
                      />
                      Option B (Mark correct)
                    </label>
                    <input
                      type="text"
                      value={qOpt1}
                      onChange={(e) => setQOpt1(e.target.value)}
                      placeholder="Choice B text"
                      className="w-full px-2.5 py-1 text-xs bg-surface-raised border border-border rounded text-text-primary focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5 flex items-center gap-1 font-mono">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={qCorrectIdx === 2}
                        onChange={() => setQCorrectIdx(2)}
                        className="text-cyan-500 cursor-pointer"
                      />
                      Option C (Mark correct)
                    </label>
                    <input
                      type="text"
                      value={qOpt2}
                      onChange={(e) => setQOpt2(e.target.value)}
                      placeholder="Choice C text"
                      className="w-full px-2.5 py-1 text-xs bg-surface-raised border border-border rounded text-text-primary focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5 flex items-center gap-1 font-mono">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={qCorrectIdx === 3}
                        onChange={() => setQCorrectIdx(3)}
                        className="text-cyan-500 cursor-pointer"
                      />
                      Option D (Mark correct)
                    </label>
                    <input
                      type="text"
                      value={qOpt3}
                      onChange={(e) => setQOpt3(e.target.value)}
                      placeholder="Choice D text"
                      className="w-full px-2.5 py-1 text-xs bg-surface-raised border border-border rounded text-text-primary focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-text-muted mb-0.5">Solution Explanation</label>
                  <input
                    type="text"
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="Explain why the selected option is correct..."
                    className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddManualQuestion}
                    className="bg-surface-raised hover:bg-surface border border-border text-text-primary text-xs h-8 px-3"
                  >
                    + Add This Question
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePublishManualQuiz}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4"
                >
                  Publish Custom MCQ Quiz ({manualQuestions.length} Questions)
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: BULK JSON / CSV IMPORT */}
          {createMode === "IMPORT" && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-text-muted">
                  Paste JSON Array of Questions
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleLoadSampleJson}
                  className="text-[11px] h-7 px-2 border-border text-cyan-400"
                >
                  Load Sample JSON Template
                </Button>
              </div>

              <textarea
                rows={9}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[{"question": "Sample?", "options": ["A", "B", "C", "D"], "correctIndex": 1, "explanation": "..."}]'
                className="w-full p-3 font-mono text-xs bg-surface-raised border border-border rounded-xl text-text-primary focus:outline-none focus:border-cyan-400"
              />

              {importError && (
                <Callout variant="danger" icon={AlertTriangle}>
                  <span className="font-mono">{importError}</span>
                </Callout>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyJsonImport}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4"
                >
                  Validate & Load Questions into Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* MODAL 2: DETAILED TEST PERFORMANCE & ATTENDEES REPORT */}
      {reportTarget && (
        <Dialog
          isOpen={reportTarget !== null}
          onClose={() => setReportTarget(null)}
          title={`Performance & Attendees Report: ${reportTarget.title}`}
          description={`Comprehensive assessment telemetry, attendee scores, and question difficulty breakdown for ${reportTarget.subject.toUpperCase()}.`}
          maxWidthClass="max-w-4xl"
        >
          {isLoadingReport || !reportData ? (
            <div className="py-16 text-center text-xs font-mono text-text-muted">
              Loading assessment analytics and telemetry...
            </div>
          ) : (
            <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface-raised p-3.5 rounded-xl border border-border">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                    Total Attendees
                  </span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1 flex items-center gap-1">
                    <Users className="w-4 h-4" /> {reportData.totalAttendees}
                  </div>
                </div>

                <div className="bg-surface-raised p-3.5 rounded-xl border border-border">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                    Average Score
                  </span>
                  <div className="text-xl font-bold font-mono text-text-primary mt-1">
                    {reportData.avgScore}%
                  </div>
                </div>

                <div className="bg-surface-raised p-3.5 rounded-xl border border-border">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                    Passing Rate
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {reportData.passRate}%
                  </div>
                </div>

                <div className="bg-surface-raised p-3.5 rounded-xl border border-border">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                    Average Duration
                  </span>
                  <div className="text-xl font-bold font-mono text-text-primary mt-1">
                    {reportData.avgTimeSpentMinutes} Mins
                  </div>
                </div>
              </div>

              {/* Question-by-Question Correctness Analysis */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted">
                    Question-by-Question Accuracy & Error Analysis
                  </h4>
                  <span className="text-[11px] font-mono text-text-muted">
                    {reportData.questionStats.length} Evaluated Questions
                  </span>
                </div>

                <div className="space-y-2">
                  {reportData.questionStats.map((q, idx) => {
                    const isHard = q.accuracyPercentage < 55;
                    const isHighPerform = q.accuracyPercentage >= 75;

                    return (
                      <div
                        key={q.questionId || idx}
                        className="p-3 bg-surface-raised rounded-xl border border-border space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-text-primary leading-relaxed">
                            {idx + 1}. {q.question}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                              isHighPerform
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isHard
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {q.accuracyPercentage}% Accuracy
                          </span>
                        </div>

                        {/* Accuracy Bar */}
                        <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                          <div
                            className={`h-full transition-all ${
                              isHighPerform
                                ? "bg-emerald-500"
                                : isHard
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${q.accuracyPercentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                          <span>
                            Correct Key: <strong className="text-emerald-400">Option {String.fromCharCode(65 + q.correctIndex)}</strong> ({q.options[q.correctIndex]})
                          </span>
                          <span>
                            {q.correctAttempts} / {q.totalAttempts} students answered correctly
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Student Attendees Roster */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted">
                    Student Attendees Roster ({reportData.attendees.length})
                  </h4>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportAttendeesCsv}
                    className="text-xs h-7 px-3 border-border text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3 h-3" /> Export CSV Report
                  </Button>
                </div>

                <div className="border border-border rounded-xl overflow-hidden bg-surface">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-surface-raised border-b border-border text-[11px] text-text-muted">
                      <tr>
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">College / Roll</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {reportData.attendees.map((att) => (
                        <tr key={att.submissionId} className="hover:bg-surface-raised/40">
                          <td className="py-2.5 px-3 font-bold text-text-muted">
                            #{att.rank}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-text-primary font-sans">
                            {att.userName}
                          </td>
                          <td className="py-2.5 px-3 text-text-muted text-[11px]">
                            {att.college || "SRM IST"} · {att.rollNumber || "RA2111003"}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-cyan-400">
                            {att.percentage}% ({att.score}/{att.totalMarks})
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                att.isPassed
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {att.isPassed ? "PASSED" : "FAILED"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-text-muted text-[11px]">
                            {Math.round(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Dialog>
      )}

      {/* MODAL 3: EDIT TEST SETTINGS */}
      <Dialog
        isOpen={editItem !== null}
        onClose={() => setEditItem(null)}
        title="Edit Quiz Details"
        description="Update title, description, time limit, and passing score."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Quiz Title</label>
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

      {/* MODAL 4: PREVIEW QUESTIONS */}
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
                  <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                    {q.topic || q.difficulty || "MCQ"}
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
                            ✓ Correct Option
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

      {/* MODAL 5: CONFIRM DELETE */}
      <Dialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete Quiz"
        description="Are you sure you want to delete this MCQ quiz?"
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
