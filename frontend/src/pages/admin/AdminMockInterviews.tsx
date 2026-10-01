import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AdminMockInterviewConfig } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { CreateMockInterviewWizard, MockInterviewWizardData } from "@/components/admin/CreateMockInterviewWizard";
import {
  Plus,
  Edit2,
  Video,
  Search,
  Copy,
  Archive,
  Trash2,
  Sparkles,
  Brain,
} from "lucide-react";
import { toast } from "sonner";

export const AdminMockInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<AdminMockInterviewConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<MockInterviewWizardData> | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<AdminMockInterviewConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    adminService.getMockInterviews().then((data) => {
      setInterviews(data);
      setLoading(false);
    });
  }, []);

  const handleOpenCreate = () => {
    setEditing(null);
    setWizardOpen(true);
  };

  const handleOpenEdit = (item: AdminMockInterviewConfig) => {
    setEditing({
      id: item.id,
      title: item.roleTitle,
      targetRole: item.roleTitle,
      subject: item.category,
      questionsCount: item.questionsCount,
      timePerQuestionSeconds: Math.round((item.durationMinutes * 60) / item.questionsCount),
      status: item.status === "ACTIVE" ? "PUBLISHED" : "DRAFT",
    });
    setWizardOpen(true);
  };

  const handleSaveWizard = async (wizardData: MockInterviewWizardData) => {
    const totalMins = Math.round((wizardData.questionsCount * wizardData.timePerQuestionSeconds) / 60) || 25;
    const apiPayload: Partial<AdminMockInterviewConfig> = {
      id: wizardData.id,
      roleTitle: wizardData.targetRole || wizardData.title,
      category: wizardData.subject || "Technical",
      questionsCount: wizardData.questionsCount,
      durationMinutes: totalMins,
      status: wizardData.status === "PUBLISHED" ? "ACTIVE" : "INACTIVE",
    };
    const saved = await adminService.saveMockInterview(apiPayload);
    setInterviews((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [saved, ...prev];
    });
  };

  const handleDuplicate = async (item: AdminMockInterviewConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dup: Partial<AdminMockInterviewConfig> = {
        roleTitle: `${item.roleTitle} (Copy)`,
        category: item.category,
        questionsCount: item.questionsCount,
        durationMinutes: item.durationMinutes,
        status: "INACTIVE",
      };
      const saved = await adminService.saveMockInterview(dup);
      setInterviews((prev) => [saved, ...prev]);
      toast.success(`Duplicated track: ${saved.roleTitle}`);
    } catch {
      toast.error("Failed to duplicate track.");
    }
  };

  const handleArchive = async (item: AdminMockInterviewConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = item.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
      const updated = await adminService.saveMockInterview({ ...item, status: newStatus as any });
      setInterviews((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      toast.success(`Status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      setInterviews((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      toast.success(`Deleted track: ${deleteTarget.roleTitle}`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete track.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch = item.roleTitle.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    const matchesCat = categoryFilter === "ALL" || item.category.toUpperCase() === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            Interview Prep Management
          </span>
          <h2 className="font-serif text-3xl font-medium text-text-primary">Mock Interview Configurations</h2>
          <p className="text-xs text-text-secondary">Configure domain role tracks, Gemini AI question generation, and grading rubrics.</p>
        </div>

        <Button variant="teal-cyan" size="sm" onClick={handleOpenCreate} className="gap-1.5 shadow-glow">
          <Sparkles className="w-4 h-4" /> Create Track Wizard
        </Button>
      </div>

      {/* FILTER CHIPS & SEARCH BAR */}
      <Card className="p-4 bg-surface border border-border shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <Input
              placeholder="Search role title, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto font-mono text-[11px]">
            <span className="text-text-muted uppercase text-[10px] mr-1">Category:</span>
            {["ALL", "FRONTEND", "BACKEND", "DATA", "FULLSTACK"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  categoryFilter === cat
                    ? "bg-cyan-400/15 text-cyan-400 border-cyan-400/40 font-bold"
                    : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {cat}
              </button>
            ))}

            <span className="text-text-muted uppercase text-[10px] ml-2 mr-1">Status:</span>
            {["ALL", "ACTIVE", "DRAFT", "ARCHIVED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  statusFilter === st
                    ? "bg-cyan-400/15 text-cyan-400 border-cyan-400/40 font-bold"
                    : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* TABLE */}
      <Card className="p-0 overflow-hidden bg-surface border-border shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 bg-surface-raised">Role Title</th>
                <th className="p-4 bg-surface-raised">Category</th>
                <th className="p-4 bg-surface-raised">Questions</th>
                <th className="p-4 bg-surface-raised">Duration</th>
                <th className="p-4 bg-surface-raised">Status</th>
                <th className="p-4 bg-surface-raised text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInterviews.map((item) => (
                <tr key={item.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-text-primary flex items-center gap-2">
                      <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{item.roleTitle}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="accent">{item.category}</Badge>
                  </td>
                  <td className="p-4 font-mono text-text-secondary">{item.questionsCount} Qs</td>
                  <td className="p-4 font-mono text-cyan-400">{item.durationMinutes} Mins</td>
                  <td className="p-4">
                    <Badge variant={item.status === "ACTIVE" ? "active" : "outline"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)} title="Edit Track Wizard">
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => handleDuplicate(item, e)} title="Duplicate Track">
                      <Copy className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => handleArchive(item, e)} title="Archive / Unarchive">
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)} title="Delete Track">
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* WIZARD DIALOG */}
      {wizardOpen && (
        <CreateMockInterviewWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSave={handleSaveWizard}
          initialData={editing || undefined}
        />
      )}

      {/* DELETE DIALOG */}
      {deleteTarget && (
        <Dialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Mock Track" description={`Track: ${deleteTarget.roleTitle}`}>
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">Are you sure you want to delete this mock interview configuration track?</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm} isLoading={isDeleting}>
                Delete Track
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
