import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  MoreVertical,
  Edit2,
  Copy,
  Send,
  Eye,
  Archive,
  Trash2,
  Download,
  History,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  Video,
  BookOpen,
  FileText,
  Radio,
  Layers,
  Sparkles,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  ContentItem,
  ContentType,
  ContentStatus,
  ContentSummary,
  ContentAuditLog,
  contentManagerService,
} from "@/services/contentManagerService";
import { SharedContentWizard } from "@/components/admin/content/SharedContentWizard";
import { StudentPreviewModal } from "@/components/admin/content/StudentPreviewModal";
import { VersionHistoryModal } from "@/components/admin/content/VersionHistoryModal";
import { RowActions } from "@/components/common/RowActions";
import { useTaxonomy } from "@/hooks/useTaxonomy";

export const ContentManagerHub: React.FC = () => {
  const { domains } = useTaxonomy();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [summary, setSummary] = useState<ContentSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<ContentAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"INVENTORY" | "AUDIT">("INVENTORY");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<ContentType>("QUIZ");
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // Modals state
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [historyItem, setHistoryItem] = useState<ContentItem | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [forceDeleteConfirm, setForceDeleteConfirm] = useState(false);

  // Error state
  const [error, setError] = useState<{
    message: string;
    is403: boolean;
    isNetworkError: boolean;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [contentData, summaryData, logsData] = await Promise.all([
        contentManagerService.listContent({
          type: typeFilter,
          subject: subjectFilter,
          difficulty: difficultyFilter,
          status: statusFilter,
          search,
          sortBy,
          sortDir,
        }),
        contentManagerService.getSummary(),
        contentManagerService.getAuditLogs(),
      ]);
      setItems(contentData);
      setSummary(summaryData);
      setAuditLogs(logsData);
    } catch (err: any) {
      console.error("Load content data error:", err);
      const is403 = err?.response?.status === 403;
      const isNetworkError = !err?.response || err?.code === "ERR_NETWORK";
      let message = "An error occurred while loading content.";
      if (isNetworkError) {
        message = "Could not reach the server. Make sure the backend is running.";
      } else if (is403) {
        message = "You do not have permission to view this page.";
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      setError({ message, is403, isNetworkError });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, subjectFilter, difficultyFilter, statusFilter, sortBy, sortDir]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenWizard = (type: ContentType) => {
    setWizardType(type);
    setEditingItem(null);
    setIsWizardOpen(true);
  };

  const handleEditItem = (item: ContentItem) => {
    setEditingItem(item);
    setWizardType(item.type);
    setIsWizardOpen(true);
  };

  const handleDuplicate = async (item: ContentItem) => {
    try {
      await contentManagerService.duplicateContent(item.id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublish = async (item: ContentItem) => {
    try {
      if (item.status === "PUBLISHED") {
        await contentManagerService.unpublishContent(item.id);
      } else {
        await contentManagerService.publishContent(item.id);
      }
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (item: ContentItem) => {
    try {
      await contentManagerService.archiveContent(item.id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await contentManagerService.deleteContent(deleteTarget.id, forceDeleteConfirm);
      setDeleteTarget(null);
      setForceDeleteConfirm(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  const handleBulkAction = async (action: "PUBLISH" | "UNPUBLISH" | "ARCHIVE" | "DELETE") => {
    if (selectedIds.length === 0) return;
    try {
      await contentManagerService.bulkAction(selectedIds, action);
      setSelectedIds([]);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDownloadJson = (item: ContentItem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `content-${item.id}.json`);
    dlAnchor.click();
  };

  // Content type card definitions
  const contentTypeCards: Array<{
    type: ContentType;
    label: string;
    icon: any;
    desc: string;
  }> = [
    { type: "QUIZ", label: "MCQ Quizzes", icon: HelpCircle, desc: "Timed tests & topic banks" },
    { type: "MOCK_TEST", label: "Mock Tests", icon: Radio, desc: "Multi-section full placement tests" },
    { type: "CODING_PROBLEM", label: "Coding Arena", icon: Code2, desc: "Algorithmic problems & tests" },
    { type: "MOCK_INTERVIEW", label: "Mock Interviews", icon: Video, desc: "AI-led conversational tracks" },
    { type: "PRACTICE_TOPIC", label: "Practice Tracks", icon: BookOpen, desc: "Topic progression hierarchies" },
    { type: "ARTICLE", label: "Articles & Guides", icon: FileText, desc: "Markdown learning guides" },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Content Manager Hub
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Centrally author, curate, version, and publish all student learning content & assessments without code seeding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenWizard("QUIZ")}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Content
          </Button>
        </div>
      </div>

      {/* TOP CONTENT TYPE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {contentTypeCards.map((c) => {
          const stats = summary?.statsByType?.[c.type] || { total: 0, draft: 0, published: 0, archived: 0 };
          const Icon = c.icon;
          return (
            <div
              key={c.type}
              className="bg-surface border border-border hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-text-primary">
                    {stats.total} total
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-text-primary truncate">{c.label}</h3>
                  <p className="text-[10px] text-text-muted truncate">{c.desc}</p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono pt-1">
                  <span className="text-emerald-400">{stats.published} pub</span>
                  <span className="text-text-muted">•</span>
                  <span className="text-amber-400">{stats.draft} draft</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-border/60">
                <Button
                  onClick={() => handleOpenWizard(c.type)}
                  variant="outline"
                  size="sm"
                  className="w-full text-[11px] py-1 h-7 border-border hover:bg-surface-raised hover:border-cyan-500/40 text-cyan-300 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Create
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* HUB NAVIGATION TABS */}
      <div className="border-b border-border flex items-center gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("INVENTORY")}
          className={`pb-3 px-1 transition-colors flex items-center gap-2 ${
            activeTab === "INVENTORY"
              ? "text-cyan-400 border-b-2 border-cyan-400 font-bold"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Layers className="w-4 h-4" />
          Content Inventory ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`pb-3 px-1 transition-colors flex items-center gap-2 ${
            activeTab === "AUDIT"
              ? "text-cyan-400 border-b-2 border-cyan-400 font-bold"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <History className="w-4 h-4" />
          Activity & Audit Logs
        </button>
      </div>

      {/* TAB 1: INVENTORY TABLE & FILTERS */}
      {activeTab === "INVENTORY" && (
        <div className="space-y-4">
          {/* FILTER & SEARCH BAR */}
          <div className="p-4 bg-surface border border-border rounded-2xl flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, subject, or tag..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-raised border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-raised border border-border rounded-xl text-text-primary"
              >
                <option value="ALL">All Types</option>
                <option value="QUIZ">MCQ Quizzes</option>
                <option value="MOCK_TEST">Mock Tests</option>
                <option value="CODING_PROBLEM">Coding Problems</option>
                <option value="CODING_TEST">Coding Tests</option>
                <option value="MOCK_INTERVIEW">Mock Interviews</option>
                <option value="PRACTICE_TOPIC">Practice Topics</option>
                <option value="ARTICLE">Articles</option>
              </select>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-raised border border-border rounded-xl text-text-primary"
              >
                <option value="ALL">All Subjects</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-raised border border-border rounded-xl text-text-primary"
              >
                <option value="ALL">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-raised border border-border rounded-xl text-text-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* BULK ACTIONS TOOLBAR */}
          {selectedIds.length > 0 && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs animate-fade-in">
              <span className="font-semibold text-cyan-300">
                {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction("PUBLISH")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold py-1 h-7"
                >
                  Publish Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("UNPUBLISH")}
                  className="text-xs py-1 h-7 border-border hover:bg-surface text-amber-400"
                >
                  Unpublish Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("ARCHIVE")}
                  className="text-xs py-1 h-7 border-border hover:bg-surface text-text-muted"
                >
                  Archive Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("DELETE")}
                  className="text-xs py-1 h-7 border-red-500/30 hover:bg-red-500/10 text-red-400"
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          )}

          {/* ERROR BANNER */}
          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-200 animate-fade-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-red-300">
                    {error.isNetworkError
                      ? "Could not reach the server. Make sure the backend is running."
                      : error.is403
                      ? "You do not have permission to view this page."
                      : error.message}
                  </p>
                  <p className="text-xs text-red-400/80">
                    {error.isNetworkError
                      ? "Backend service at http://localhost:8080 is unreachable. Make sure backend is running with ./mvnw.cmd spring-boot:run"
                      : error.is403
                      ? "Access is restricted to authorized administrators."
                      : "Please check your network connection and retry."}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadData()}
                className="border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs shrink-0 flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" /> Retry
              </Button>
            </div>
          )}

          {/* UNIFIED CONTENT TABLE */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-raised border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={items.length > 0 && selectedIds.length === items.length}
                        onChange={handleSelectAll}
                        className="accent-cyan-400 rounded"
                      />
                    </th>
                    <th
                      className="p-4 font-semibold cursor-pointer hover:text-text-primary"
                      onClick={() => {
                        setSortBy("title");
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      }}
                    >
                      Title
                    </th>
                    <th
                      className="p-4 font-semibold cursor-pointer hover:text-text-primary"
                      onClick={() => {
                        setSortBy("type");
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      }}
                    >
                      Type
                    </th>
                    <th className="p-4 font-semibold">Domain</th>
                    <th className="p-4 font-semibold">Difficulty</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Created By</th>
                    <th
                      className="p-4 font-semibold cursor-pointer hover:text-text-primary"
                      onClick={() => {
                        setSortBy("attempts");
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      }}
                    >
                      Attempts
                    </th>
                    <th
                      className="p-4 font-semibold cursor-pointer hover:text-text-primary"
                      onClick={() => {
                        setSortBy("updatedAt");
                        setSortDir(sortDir === "asc" ? "desc" : "asc");
                      }}
                    >
                      Last Updated
                    </th>
                    <th className="p-4 text-right font-semibold w-[240px] min-w-[240px] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse border-b border-border/50">
                        <td className="p-4"><div className="w-4 h-4 bg-surface-raised rounded" /></td>
                        <td className="p-4"><div className="w-48 h-4 bg-surface-raised rounded mb-1.5" /><div className="w-32 h-3 bg-surface-raised/60 rounded" /></td>
                        <td className="p-4"><div className="w-16 h-5 bg-surface-raised rounded" /></td>
                        <td className="p-4"><div className="w-20 h-4 bg-surface-raised rounded" /></td>
                        <td className="p-4"><div className="w-14 h-5 bg-surface-raised rounded" /></td>
                        <td className="p-4"><div className="w-24 h-4 bg-surface-raised rounded" /></td>
                        <td className="p-4"><div className="w-12 h-4 bg-surface-raised rounded" /></td>
                        <td className="p-4"><div className="w-20 h-4 bg-surface-raised rounded" /></td>
                        <td className="p-4 text-right"><div className="w-24 h-7 bg-surface-raised rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-text-muted space-y-3">
                        <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
                        <p className="text-sm font-semibold text-text-primary">
                          {error.isNetworkError
                            ? "Could not reach the server. Make sure the backend is running."
                            : error.is403
                            ? "You do not have permission to view this page."
                            : error.message}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => loadData()}
                          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs py-1.5 px-3 mx-auto flex items-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5" /> Retry
                        </Button>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-text-muted space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">No content items found</p>
                          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                            {search || typeFilter !== "ALL" || subjectFilter !== "ALL"
                              ? "No items match your active filters. Try clearing them or create a new assessment."
                              : "Your content repository is currently empty. Get started by creating your first assessment."}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleOpenWizard("QUIZ")}
                          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs py-1.5 px-4 mx-auto flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Create
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-surface-raised/60 transition-colors ${
                            isSelected ? "bg-cyan-500/5" : ""
                          }`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(item.id)}
                              className="accent-cyan-400 rounded"
                            />
                          </td>

                          <td className="p-4 max-w-xs">
                            <div className="font-semibold text-text-primary truncate">{item.title}</div>
                            {item.description && (
                              <div className="text-[11px] text-text-muted truncate mt-0.5">{item.description}</div>
                            )}
                          </td>

                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-raised border border-border text-cyan-300">
                              {item.type}
                            </span>
                          </td>

                          <td className="p-4 text-text-muted">{item.subject}</td>

                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                item.difficulty === "Easy"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : item.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.status === "PUBLISHED"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : item.status === "DRAFT"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="p-4 text-text-muted font-mono">{item.createdBy}</td>

                          <td className="p-4 font-mono">
                            <span
                              className={`font-semibold ${
                                item.studentAttempts > 0 ? "text-cyan-400" : "text-text-muted"
                              }`}
                            >
                              {item.studentAttempts}
                            </span>
                          </td>

                          <td className="p-4 text-text-muted font-mono text-[11px] whitespace-nowrap">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </td>

                          <td className="p-4 text-right w-[240px] min-w-[240px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <RowActions className="gap-1">
                              {/* Preview as Student */}
                              <button
                                onClick={() => setPreviewItem(item)}
                                title="Preview as student"
                                className="p-1.5 text-text-muted hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleEditItem(item)}
                                title="Edit assessment"
                                className="p-1.5 text-text-muted hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Version History */}
                              <button
                                onClick={() => setHistoryItem(item)}
                                title="Version history"
                                className="p-1.5 text-text-muted hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicate(item)}
                                title="Duplicate"
                                className="p-1.5 text-text-muted hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Publish / Unpublish */}
                              <button
                                onClick={() => handleTogglePublish(item)}
                                title={item.status === "PUBLISHED" ? "Unpublish to draft" : "Publish to students"}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  item.status === "PUBLISHED"
                                    ? "text-emerald-400 hover:bg-emerald-500/10"
                                    : "text-amber-400 hover:bg-amber-500/10"
                                }`}
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              {/* Archive */}
                              <button
                                onClick={() => handleArchive(item)}
                                title="Archive"
                                className="p-1.5 text-text-muted hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  setDeleteTarget(item);
                                  setForceDeleteConfirm(false);
                                }}
                                title="Delete"
                                className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </RowActions>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === "AUDIT" && (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Content Activity & Audit Log</h3>
              <p className="text-xs text-text-muted">
                Immutable trace of who created, edited, published, scheduled, or deleted assessments.
              </p>
            </div>
            <span className="text-xs text-text-muted font-mono">{auditLogs.length} events recorded</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.action === "PUBLISH"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.action === "DELETE"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-cyan-500/20 text-cyan-400"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-semibold text-text-primary">{log.contentTitle}</span>
                    <span className="text-text-muted font-mono text-[11px]">({log.contentType})</span>
                  </div>
                  <p className="text-text-muted text-[11px]">{log.details}</p>
                </div>

                <div className="text-right text-[11px] text-text-muted font-mono shrink-0">
                  <div>by {log.performedBy || "Admin"}</div>
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHARED AUTHORING WIZARD MODAL */}
      <SharedContentWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialType={wizardType}
        editingItem={editingItem}
        onSaved={async () => {
          await loadData();
        }}
      />

      {/* STUDENT PERSPECTIVE PREVIEW MODAL */}
      <StudentPreviewModal
        isOpen={!!previewItem}
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* VERSION HISTORY MODAL */}
      <VersionHistoryModal
        isOpen={!!historyItem}
        item={historyItem}
        onClose={() => setHistoryItem(null)}
        onRestore={async (ver) => {
          if (historyItem) {
            await contentManagerService.restoreVersion(historyItem.id, ver);
            await loadData();
          }
        }}
      />

      {/* DELETE CONFIRMATION MODAL WITH ATTEMPTS GUARD */}
      {deleteTarget && typeof document !== "undefined" && createPortal(
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Confirm Content Deletion
            </h3>

            <p className="text-xs text-text-muted">
              Are you sure you want to delete <strong className="text-text-primary">"{deleteTarget.title}"</strong>?
            </p>

            {deleteTarget.studentAttempts > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2 text-amber-300">
                <span className="font-semibold block">Warning: Active Student Attempts</span>
                <span>
                  This item has <strong>{deleteTarget.studentAttempts}</strong> recorded student attempts. Deleting it will permanently break past attempt analytics.
                </span>
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-200">
                    <input
                      type="checkbox"
                      checked={forceDeleteConfirm}
                      onChange={(e) => setForceDeleteConfirm(e.target.checked)}
                      className="accent-red-500"
                    />
                    <span>Force delete anyway and discard attempt history</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteTarget(null);
                  setForceDeleteConfirm(false);
                }}
                className="text-xs"
              >
                Cancel
              </Button>

              {deleteTarget.studentAttempts > 0 && !forceDeleteConfirm ? (
                <Button
                  size="sm"
                  onClick={async () => {
                    await handleArchive(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold"
                >
                  Archive Instead (Recommended)
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleConfirmDelete}
                  className="bg-red-500 hover:bg-red-400 text-black text-xs font-semibold"
                >
                  Confirm Delete
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
