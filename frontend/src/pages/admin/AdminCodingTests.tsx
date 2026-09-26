import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AdminCodingTest } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { Plus, Edit2, Code2 } from "lucide-react";
import { toast } from "sonner";

export const AdminCodingTests: React.FC = () => {
  const [tests, setTests] = useState<AdminCodingTest[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<AdminCodingTest> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getCodingTests().then((data) => {
      setTests(data);
      setLoading(false);
    });
  }, []);

  const handleOpenCreate = () => {
    setEditingTest({ title: "", difficulty: "Easy", status: "ACTIVE" });
    setModalOpen(true);
  };

  const handleOpenEdit = (test: AdminCodingTest) => {
    setEditingTest({ ...test });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingTest || !editingTest.title) return;
    setSaving(true);
    try {
      const saved = await adminService.saveCodingTest(editingTest);
      setTests((prev) => {
        const exists = prev.some((t) => t.id === saved.id);
        return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved];
      });
      toast.success("Coding test saved successfully!");
      setModalOpen(false);
    } catch (e: any) {
      toast.error("Error saving test.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">Coding Tests Management</h2>
          <p className="text-xs text-text-secondary">Add or modify algorithm problems for student practice rounds.</p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add New Test
        </Button>
      </div>

      <Card className="p-0 overflow-hidden bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 bg-surface-raised">Title</th>
                <th className="p-4 bg-surface-raised">Difficulty</th>
                <th className="p-4 bg-surface-raised">Submissions</th>
                <th className="p-4 bg-surface-raised">Pass Rate</th>
                <th className="p-4 bg-surface-raised">Status</th>
                <th className="p-4 bg-surface-raised text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="p-4 font-semibold text-text-primary">{t.title}</td>
                  <td className="p-4">
                    <Badge variant={t.difficulty.toLowerCase() as any}>{t.difficulty}</Badge>
                  </td>
                  <td className="p-4 font-mono text-text-secondary">{t.submissionsCount}</td>
                  <td className="p-4 font-mono text-live">{t.passRate}</td>
                  <td className="p-4">
                    <Badge variant={t.status === "ACTIVE" ? "active" : "outline"}>{t.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(t)}>
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Dialog */}
      {modalOpen && editingTest && (
        <Dialog
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTest.id ? "Edit Coding Test" : "Create New Coding Test"}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>Save Test</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Problem Title"
              value={editingTest.title || ""}
              onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
              placeholder="E.g., 2. Add Two Numbers"
            />

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Difficulty</label>
              <select
                value={editingTest.difficulty || "Easy"}
                onChange={(e) => setEditingTest({ ...editingTest, difficulty: e.target.value as any })}
                className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
