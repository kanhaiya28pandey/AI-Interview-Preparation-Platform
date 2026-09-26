import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AdminMockInterviewConfig } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { Plus, Edit2, Video } from "lucide-react";
import { toast } from "sonner";

export const AdminMockInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<AdminMockInterviewConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminMockInterviewConfig>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getMockInterviews().then((data) => {
      setInterviews(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = () => {
    setEditing({ roleTitle: "", category: "Frontend", questionsCount: 4, durationMinutes: 25, status: "ACTIVE" });
    setModalOpen(true);
  };

  const handleEdit = (item: AdminMockInterviewConfig) => {
    setEditing({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing.roleTitle) return;
    setSaving(true);
    try {
      const saved = await adminService.saveMockInterview(editing);
      setInterviews((prev) => {
        const exists = prev.some((i) => i.id === saved.id);
        return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved];
      });
      toast.success("Interview track saved!");
      setModalOpen(false);
    } catch (e) {
      toast.error("Error saving track.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">Mock Interview Configurations</h2>
          <p className="text-xs text-text-secondary">Configure domain role tracks and question duration for simulated rounds.</p>
        </div>

        <Button variant="primary" size="sm" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> Create New Track
        </Button>
      </div>

      <Card className="p-0 overflow-hidden bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 bg-surface-raised">Role Title</th>
                <th className="p-4 bg-surface-raised">Category</th>
                <th className="p-4 bg-surface-raised">Questions</th>
                <th className="p-4 bg-surface-raised">Duration</th>
                <th className="p-4 bg-surface-raised">Status</th>
                <th className="p-4 bg-surface-raised text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {interviews.map((item) => (
                <tr key={item.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="p-4 font-semibold text-text-primary">{item.roleTitle}</td>
                  <td className="p-4">
                    <Badge variant="accent">{item.category}</Badge>
                  </td>
                  <td className="p-4 font-mono text-text-secondary">{item.questionsCount}</td>
                  <td className="p-4 font-mono text-cyan-400">{item.durationMinutes} Mins</td>
                  <td className="p-4">
                    <Badge variant={item.status === "ACTIVE" ? "active" : "outline"}>{item.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog Modal */}
      {modalOpen && (
        <Dialog
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing.id ? "Edit Interview Track" : "Create Interview Track"}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>Save Track</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Role Title"
              value={editing.roleTitle || ""}
              onChange={(e) => setEditing({ ...editing, roleTitle: e.target.value })}
              placeholder="E.g., Senior Full Stack MERN Engineer"
            />

            <Input
              label="Category"
              value={editing.category || ""}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              placeholder="Full Stack"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Questions Count"
                type="number"
                value={editing.questionsCount || 4}
                onChange={(e) => setEditing({ ...editing, questionsCount: parseInt(e.target.value) })}
              />
              <Input
                label="Duration (Mins)"
                type="number"
                value={editing.durationMinutes || 25}
                onChange={(e) => setEditing({ ...editing, durationMinutes: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
