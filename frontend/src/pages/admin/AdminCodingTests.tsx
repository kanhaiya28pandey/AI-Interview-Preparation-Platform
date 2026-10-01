import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AdminCodingTest } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { CreateCodingTestWizard, CodingTestWizardData } from "@/components/admin/CreateCodingTestWizard";
import {
  Plus,
  Edit2,
  Code2,
  Search,
  Copy,
  Archive,
  Trash2,
  Sparkles,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const AdminCodingTests: React.FC = () => {
  const [tests, setTests] = useState<AdminCodingTest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<CodingTestWizardData> | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<AdminCodingTest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    adminService.getCodingTests().then((data) => {
      setTests(data);
      setLoading(false);
    });
  }, []);

  const handleOpenCreate = () => {
    setEditingTest(null);
    setWizardOpen(true);
  };

  const handleOpenEdit = (test: AdminCodingTest) => {
    setEditingTest({
      id: test.id,
      title: test.title,
      difficulty: test.difficulty as any,
      status: test.status === "ACTIVE" ? "PUBLISHED" : "DRAFT",
    });
    setWizardOpen(true);
  };

  const handleSaveWizard = async (wizardData: CodingTestWizardData) => {
    const apiPayload: Partial<AdminCodingTest> = {
      id: wizardData.id,
      title: wizardData.title,
      difficulty: wizardData.difficulty === "Mixed" ? "Medium" : wizardData.difficulty,
      status: wizardData.status === "PUBLISHED" ? "ACTIVE" : "DRAFT",
      submissionsCount: wizardData.id ? undefined : 0,
      passRate: wizardData.id ? undefined : "0.0%",
    };
    const saved = await adminService.saveCodingTest(apiPayload);
    setTests((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev];
    });
  };

  const handleDuplicate = async (test: AdminCodingTest, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dupData: Partial<AdminCodingTest> = {
        title: `${test.title} (Copy)`,
        difficulty: test.difficulty,
        status: "DRAFT",
        submissionsCount: 0,
        passRate: "0.0%",
      };
      const saved = await adminService.saveCodingTest(dupData);
      setTests((prev) => [saved, ...prev]);
      toast.success(`Duplicated test: ${saved.title}`);
    } catch {
      toast.error("Failed to duplicate test.");
    }
  };

  const handleArchive = async (test: AdminCodingTest, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = test.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
      const updated = await adminService.saveCodingTest({ ...test, status: newStatus as any });
      setTests((prev) => prev.map((t) => (t.id === test.id ? updated : t)));
      toast.success(`Test status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to change status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      setTests((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success(`Deleted test: ${deleteTarget.title}`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete test.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch = t.title.toLowerCase().includes(q) || t.difficulty.toLowerCase().includes(q);
    const matchesDiff = difficultyFilter === "ALL" || t.difficulty.toUpperCase() === difficultyFilter;
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesDiff && matchesStatus;
  });

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            Assessment Management
          </span>
          <h2 className="font-serif text-3xl font-medium text-text-primary">Coding Tests & Problem Bank</h2>
          <p className="text-xs text-text-secondary">Design multi-topic coding assessments, set problem counts, and publish rounds.</p>
        </div>

        <Button variant="teal-cyan" size="sm" onClick={handleOpenCreate} className="gap-1.5 shadow-glow">
          <Sparkles className="w-4 h-4" /> Create Test Wizard
        </Button>
      </div>

      {/* FILTER CHIPS & SEARCH BAR */}
      <Card className="p-4 bg-surface border border-border shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <Input
              placeholder="Search coding test title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto font-mono text-[11px]">
            <span className="text-text-muted uppercase text-[10px] mr-1">Difficulty:</span>
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  difficultyFilter === diff
                    ? "bg-cyan-400/15 text-cyan-400 border-cyan-400/40 font-bold"
                    : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {diff}
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
                <th className="p-4 bg-surface-raised">Title</th>
                <th className="p-4 bg-surface-raised">Difficulty</th>
                <th className="p-4 bg-surface-raised">Submissions</th>
                <th className="p-4 bg-surface-raised">Pass Rate</th>
                <th className="p-4 bg-surface-raised">Status</th>
                <th className="p-4 bg-surface-raised text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTests.map((t) => (
                <tr key={t.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-text-primary flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{t.title}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={t.difficulty.toLowerCase() as any}>{t.difficulty}</Badge>
                  </td>
                  <td className="p-4 font-mono text-text-secondary">{t.submissionsCount}</td>
                  <td className="p-4 font-mono text-live">{t.passRate}</td>
                  <td className="p-4">
                    <Badge variant={t.status === "ACTIVE" ? "active" : t.status === "DRAFT" ? "medium" : "outline"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(t)} title="Edit Test Wizard">
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => handleDuplicate(t, e)} title="Duplicate Test">
                      <Copy className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => handleArchive(t, e)} title="Archive / Unarchive">
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(t)} title="Delete Test">
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT WIZARD DIALOG */}
      {wizardOpen && (
        <CreateCodingTestWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSave={handleSaveWizard}
          initialData={editingTest || undefined}
        />
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deleteTarget && (
        <Dialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Coding Test" description={`Target test: ${deleteTarget.title}`}>
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Are you sure you want to delete this coding test? Student submission logs for this test will be unlinked.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm} isLoading={isDeleting}>
                Delete Test
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
