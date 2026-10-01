import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import {
  ContentItem,
  adminContentService,
} from "@/services/adminContentService";
import { SharedContentWizard } from "@/components/admin/SharedContentWizard";
import { ContentPreviewModal } from "@/components/admin/ContentPreviewModal";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Archive,
  AlertTriangle,
  Layers,
  Sparkles,
  Code2,
  Video,
  FileText,
  HelpCircle,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export const AdminContentManager: React.FC = () => {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Wizard & Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<ContentItem["type"]>("MCQ Quiz");
  const [editItem, setEditItem] = useState<ContentItem | null>(null);

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  // Delete Confirm Dialog
  const [deleteModalItem, setDeleteModalItem] = useState<ContentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadContent = async () => {
    setLoading(true);
    const data = await adminContentService.getContentItems({
      type: selectedType,
      subject: selectedSubject,
      difficulty: selectedDifficulty,
      status: selectedStatus,
      search: searchQuery,
    });
    setContentList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadContent();
  }, [selectedType, selectedSubject, selectedDifficulty, selectedStatus, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contentList.map((i) => i.id));
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

  const handleOpenCreateWizard = (type: ContentItem["type"] = "MCQ Quiz") => {
    setWizardType(type);
    setEditItem(null);
    setIsWizardOpen(true);
  };

  const handleOpenEditWizard = (item: ContentItem) => {
    setEditItem(item);
    setWizardType(item.type);
    setIsWizardOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await adminContentService.duplicateContent(id);
      toast.success("Content item duplicated as draft!");
      loadContent();
    } catch {
      toast.error("Failed to duplicate item");
    }
  };

  const handleTogglePublish = async (item: ContentItem) => {
    const newStatus = item.status === "Published" ? "Draft" : "Published";
    await adminContentService.saveContent({ ...item, status: newStatus });
    toast.success(`Content ${newStatus === "Published" ? "Published" : "Unpublished"}!`);
    loadContent();
  };

  const handleArchive = async (item: ContentItem) => {
    await adminContentService.saveContent({ ...item, status: "Archived" });
    toast.success("Content archived!");
    loadContent();
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return;
    setIsDeleting(true);
    const res = await adminContentService.deleteContent(deleteModalItem.id);
    setIsDeleting(false);
    if (res.success) {
      toast.success("Content deleted successfully!");
      setDeleteModalItem(null);
      loadContent();
    } else {
      toast.error(res.message || "Failed to delete item");
    }
  };

  const handleBulkAction = async (action: "PUBLISH" | "UNPUBLISH" | "ARCHIVE" | "DELETE") => {
    if (selectedIds.length === 0) return;
    const res = await adminContentService.bulkUpdateStatus(selectedIds, action);
    toast.success(`Bulk action '${action}' completed for ${res.updatedCount} items!`);
    setSelectedIds([]);
    loadContent();
  };

  // Metrics
  const totalCount = contentList.length;
  const publishedCount = contentList.filter((i) => i.status === "Published").length;
  const draftCount = contentList.filter((i) => i.status === "Draft").length;
  const archivedCount = contentList.filter((i) => i.status === "Archived").length;

  if (loading && contentList.length === 0) return <CardSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header & Overview Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-medium text-text-primary flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-cyan-400" /> Unified Content Manager Hub
          </h2>
          <p className="text-xs text-text-secondary">
            Single control center to create, publish, edit, and archive quizzes, tests, mock interviews, and guides.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="teal-cyan"
            size="md"
            onClick={() => handleOpenCreateWizard("MCQ Quiz")}
            className="gap-2 text-xs font-semibold shadow-glow"
          >
            <Plus className="w-4 h-4" /> Create Content Pack
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border border-border space-y-1">
          <span className="font-mono text-text-muted text-[10px] uppercase block">Total Content Packs</span>
          <div className="flex justify-between items-center">
            <span className="font-serif text-2xl font-bold text-text-primary">{totalCount}</span>
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
        </Card>

        <Card className="p-4 bg-surface border border-border space-y-1">
          <span className="font-mono text-text-muted text-[10px] uppercase block">Published (Active)</span>
          <div className="flex justify-between items-center">
            <span className="font-serif text-2xl font-bold text-live">{publishedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-live" />
          </div>
        </Card>

        <Card className="p-4 bg-surface border border-border space-y-1">
          <span className="font-mono text-text-muted text-[10px] uppercase block">Drafts (In Progress)</span>
          <div className="flex justify-between items-center">
            <span className="font-serif text-2xl font-bold text-amber-400">{draftCount}</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </Card>

        <Card className="p-4 bg-surface border border-border space-y-1">
          <span className="font-mono text-text-muted text-[10px] uppercase block">Archived</span>
          <div className="flex justify-between items-center">
            <span className="font-serif text-2xl font-bold text-text-muted">{archivedCount}</span>
            <Archive className="w-5 h-5 text-text-muted" />
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-surface border border-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <Input
              placeholder="Search title or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface-raised"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-surface-raised border border-border rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="All">All Content Types</option>
            <option value="MCQ Quiz">MCQ Quiz</option>
            <option value="Mock Test">Mock Test</option>
            <option value="Coding Test">Coding Test</option>
            <option value="Mock Interview">Mock Interview</option>
            <option value="Practice Track">Practice Track</option>
            <option value="Article">Article & Guide</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-surface-raised border border-border rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="All">All Subjects / Domains</option>
            <option value="DSA">DSA</option>
            <option value="DBMS">DBMS</option>
            <option value="OS">OS</option>
            <option value="Networks">Networks</option>
            <option value="System Design">System Design</option>
            <option value="Web Dev">Web Dev</option>
            <option value="OOP">OOP</option>
            <option value="AI/ML">AI/ML</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-surface-raised border border-border rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Mixed">Mixed Split</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-raised border border-border rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Bulk Actions Floating Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl flex items-center justify-between gap-3 font-mono text-xs">
            <span className="text-cyan-400 font-semibold">{selectedIds.length} Content Items Selected</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("PUBLISH")}>
                Publish Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("UNPUBLISH")}>
                Unpublish Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("ARCHIVE")}>
                Archive Selected
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleBulkAction("DELETE")}>
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Main Unified Content Table */}
      {contentList.length === 0 ? (
        <EmptyState
          title="No Content Found"
          description="No assessment content matches your selected filter query. Create a new content pack or reset filters."
          actionText="Create Content Pack"
          onAction={() => handleOpenCreateWizard("MCQ Quiz")}
        />
      ) : (
        <Card className="overflow-hidden border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-surface-raised border-b border-border font-mono text-text-muted uppercase text-[11px]">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === contentList.length && contentList.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="accent-cyan-400"
                    />
                  </th>
                  <th className="p-3.5">Title & Type</th>
                  <th className="p-3.5">Subject & Topics</th>
                  <th className="p-3.5">Difficulty</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created By</th>
                  <th className="p-3.5">Attempts</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {contentList.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-surface-raised/50 transition-colors">
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(item.id)}
                          className="accent-cyan-400"
                        />
                      </td>

                      <td className="p-3.5 space-y-1">
                        <span className="font-semibold text-text-primary block text-sm">{item.title}</span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <Badge variant="accent">{item.type}</Badge>
                          <span className="text-text-muted">⏱ {item.durationMinutes} mins</span>
                        </div>
                      </td>

                      <td className="p-3.5 space-y-1 font-mono">
                        <span className="text-cyan-400 font-bold block">{item.subject}</span>
                        <div className="flex flex-wrap gap-1">
                          {item.topics?.slice(0, 2).map((t) => (
                            <Badge key={t} variant="medium" className="text-[9px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <Badge
                          variant={
                            item.difficulty === "Easy"
                              ? "active"
                              : item.difficulty === "Medium"
                              ? "medium"
                              : item.difficulty === "Hard"
                              ? "blocked"
                              : "accent"
                          }
                        >
                          {item.difficulty}
                        </Badge>
                      </td>

                      <td className="p-3.5 font-mono">
                        <Badge
                          variant={
                            item.status === "Published"
                              ? "active"
                              : item.status === "Draft"
                              ? "medium"
                              : "blocked"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>

                      <td className="p-3.5 font-mono text-text-muted">
                        <div>{item.createdBy}</div>
                        <div className="text-[10px] text-text-muted">Upd: {formatRelativeTime(item.updatedAt)}</div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-text-primary">{item.studentAttemptsCount}</span>
                        <span className="text-[10px] text-text-muted block">Attempts</span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 font-mono">
                          {/* Preview Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewItem(item);
                              setIsPreviewOpen(true);
                            }}
                            className="text-cyan-400 p-1.5 h-auto"
                            title="Preview as Student"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditWizard(item)}
                            className="text-text-muted hover:text-text-primary p-1.5 h-auto"
                            title="Edit Content"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Duplicate Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(item.id)}
                            className="text-text-muted hover:text-text-primary p-1.5 h-auto"
                            title="Duplicate Content"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>

                          {/* Toggle Publish */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(item)}
                            className="text-live p-1.5 h-auto"
                            title={item.status === "Published" ? "Unpublish" : "Publish"}
                          >
                            {item.status === "Published" ? <XCircle className="w-3.5 h-3.5 text-amber-400" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteModalItem(item)}
                            className="text-danger hover:bg-danger/10 p-1.5 h-auto"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Shared Creation Wizard */}
      <SharedContentWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={loadContent}
        initialType={wizardType}
        initialData={editItem}
      />

      {/* Student View Preview Modal */}
      <ContentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        item={previewItem}
      />

      {/* Confirmation Modal for Delete */}
      <Dialog
        isOpen={!!deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        title="Delete Content Item?"
        description="Permanently removes this assessment item from the platform."
      >
        {deleteModalItem && (
          <div className="space-y-4 text-xs">
            {deleteModalItem.studentAttemptsCount > 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-amber-300">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  Active Student Attempts Detected ({deleteModalItem.studentAttemptsCount})
                </div>
                <p className="leading-relaxed text-[11px]">
                  Students have already completed or submitted attempts for this item. Permanent deletion is blocked to preserve student score analytics. We recommend Archiving instead.
                </p>
                <Button variant="outline" size="sm" onClick={() => handleArchive(deleteModalItem)}>
                  <Archive className="w-4 h-4 mr-1" /> Archive Content Item Instead
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl space-y-1 text-danger">
                <p className="font-semibold">Confirm Deletion</p>
                <p className="leading-relaxed">
                  Are you sure you want to permanently delete "{deleteModalItem.title}"? This action cannot be undone.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteModalItem(null)}>
                Cancel
              </Button>
              {deleteModalItem.studentAttemptsCount === 0 && (
                <Button variant="danger" size="sm" onClick={handleConfirmDelete} isLoading={isDeleting}>
                  Delete Content Permanently
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
