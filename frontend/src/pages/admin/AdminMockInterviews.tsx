import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AdminMockInterviewConfig, TopicConfig } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { RowActions } from "@/components/common/RowActions";
import { TopicManager } from "@/components/admin/TopicManager";
import { Plus, Edit2, Video, Tag, Ban, RotateCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const AdminMockInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<AdminMockInterviewConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; is403: boolean; isNetworkError: boolean } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminMockInterviewConfig>>({});
  const [saving, setSaving] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  const loadInterviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getMockInterviews();
      setInterviews(data);
    } catch (err: any) {
      console.error("Failed to load mock interviews:", err);
      const is403 = err?.response?.status === 403;
      const isNetworkError = !err?.response || err?.code === "ERR_NETWORK";
      let message = "An error occurred while loading mock interview tracks.";
      if (isNetworkError) {
        message = "Could not reach the server. Make sure the backend is running.";
      } else if (is403) {
        message = "You do not have permission to view this page.";
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      setError({ message, is403, isNetworkError });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const handleCreate = () => {
    setEditing({
      roleTitle: "",
      domain: "Frontend",
      category: "Frontend",
      topics: [
        { name: "React Architecture", questionCount: 2, weightage: 50 },
        { name: "Performance Optimization", questionCount: 2, weightage: 50 },
      ],
      questionsCount: 4,
      durationMinutes: 25,
      status: "ACTIVE",
    });
    setTopicError(null);
    setModalOpen(true);
  };

  const handleEdit = (item: AdminMockInterviewConfig) => {
    setEditing({ ...item });
    setTopicError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing.roleTitle?.trim()) {
      toast.error("Please enter a role title.");
      return;
    }
    if (!editing.topics || editing.topics.length === 0) {
      setTopicError("At least one topic must be selected.");
      toast.error("Please configure at least one topic.");
      return;
    }

    setSaving(true);
    try {
      const saved = await adminService.saveMockInterview(editing);
      setInterviews((prev) => {
        const exists = prev.some((i) => i.id === saved.id);
        return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved];
      });
      toast.success("Mock interview track saved successfully!");
      setModalOpen(false);
    } catch (e) {
      toast.error("Error saving track.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
            Mock Interview Track Configurations
          </h2>
          <p className="text-xs text-text-secondary">
            Configure domain roles, topics, question weightages, and time limits for simulated interview rounds.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleCreate} className="shrink-0 font-semibold">
          <Plus className="w-4 h-4" /> Create New Track
        </Button>
      </div>

      {/* Error Banner */}
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
                  ? "Backend service at http://localhost:8080 is unreachable. Verify that backend is running with ./mvnw.cmd spring-boot:run"
                  : error.is403
                  ? "Administrator privileges required to access mock interview management."
                  : "Please check your network connection and retry."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadInterviews}
            className="border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs shrink-0 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}

      <Card className="p-0 overflow-hidden bg-surface border-border">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={4} />
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-sm font-semibold text-text-primary">
              {error.isNetworkError
                ? "Could not reach the server. Make sure the backend is running."
                : error.is403
                ? "You do not have permission to view this page."
                : error.message}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={loadInterviews}
              className="text-xs mx-auto border-border hover:bg-surface-raised flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Retry Loading Tracks
            </Button>
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Video className="w-10 h-10 text-text-muted mx-auto" />
            <p className="text-sm font-medium text-text-secondary">No mock interview tracks configured yet.</p>
            <Button size="sm" variant="primary" onClick={handleCreate} className="text-xs mx-auto">
              <Plus className="w-3.5 h-3.5" /> Create New Track
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 bg-surface-raised">Role Title & Domain</th>
                  <th className="p-4 bg-surface-raised">Configured Topics</th>
                  <th className="p-4 bg-surface-raised">Questions Count</th>
                  <th className="p-4 bg-surface-raised whitespace-nowrap">Duration</th>
                  <th className="p-4 bg-surface-raised whitespace-nowrap">Status</th>
                  <th className="p-4 bg-surface-raised text-right w-[140px] min-w-[140px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {interviews.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="p-4 font-semibold text-text-primary space-y-1 max-w-xs">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                        {item.domain || item.category || "General"}
                      </span>
                      <span className="block font-medium truncate">{item.roleTitle}</span>
                    </td>

                    <td className="p-4 max-w-md">
                      <div className="flex flex-wrap gap-1.5">
                        {item.topics && item.topics.length > 0 ? (
                          item.topics.map((tp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 text-cyan-400" />
                              <span>{tp.name}</span>
                            </span>
                          ))
                        ) : (
                          <Badge variant="accent">{item.category}</Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-text-secondary">
                      {item.questionsCount || (item.topics ? item.topics.reduce((a, b) => a + b.questionCount, 0) : 4)} Qs
                    </td>
                    <td className="p-4 font-mono text-cyan-400 font-semibold">{item.durationMinutes} Mins</td>

                    <td className="p-4">
                      <Badge variant={item.status === "ACTIVE" ? "active" : "outline"}>{item.status}</Badge>
                    </td>

                    <td className="p-4 text-right w-[140px] min-w-[140px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <RowActions>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/10 hover:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
                          title="Edit Mock Interview Track"
                          aria-label="Edit Mock Interview Track"
                        >
                          <Edit2 className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </RowActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Dialog Modal */}
      {modalOpen && (
        <Dialog
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing.id ? "Edit Mock Interview Track" : "Create New Mock Interview Track"}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
                Save Track
              </Button>
            </>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Role Title"
              value={editing.roleTitle || ""}
              onChange={(e) => setEditing({ ...editing, roleTitle: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer (React/TypeScript)"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (Minutes)"
                type="number"
                value={editing.durationMinutes || 25}
                onChange={(e) => setEditing({ ...editing, durationMinutes: parseInt(e.target.value) || 25 })}
              />
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Track Status</label>
                <select
                  value={editing.status || "ACTIVE"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            {/* Topic Manager */}
            <TopicManager
              domain={editing.domain || editing.category || "Frontend"}
              onChangeDomain={(d) => setEditing({ ...editing, domain: d, category: d })}
              topics={editing.topics || []}
              onChangeTopics={(topList) => {
                setTopicError(null);
                const qCount = topList.reduce((acc, t) => acc + (t.questionCount || 0), 0);
                setEditing({ ...editing, topics: topList, questionsCount: qCount || 4 });
              }}
              error={topicError}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};
