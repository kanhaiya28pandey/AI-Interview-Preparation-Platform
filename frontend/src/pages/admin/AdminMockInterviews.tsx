import React, { useState, useEffect } from "react";
import { interviewService } from "@/services/interviewService";
import { InterviewRole, InterviewQuestion, InterviewFeedback } from "@/mocks/interviewData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { RowActions } from "@/components/common/RowActions";
import {
  Plus,
  Edit2,
  Trash2,
  Video,
  Sparkles,
  RotateCw,
  AlertCircle,
  FileQuestion,
  Users,
  CheckCircle2,
  Brain,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

export const AdminMockInterviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tracks" | "questions" | "sessions">("tracks");

  // Track state
  const [tracks, setTracks] = useState<InterviewRole[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Partial<InterviewRole>>({});
  const [savingTrack, setSavingTrack] = useState(false);

  // Question management state
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<InterviewQuestion>>({});
  const [savingQuestion, setSavingQuestion] = useState(false);

  // AI Question Generation state
  const [aiGenModalOpen, setAiGenModalOpen] = useState(false);
  const [aiGenCount, setAiGenCount] = useState<number>(3);
  const [aiGenDifficulty, setAiGenDifficulty] = useState<string>("Senior");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<InterviewQuestion[]>([]);

  // Candidate sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSessionAudit, setSelectedSessionAudit] = useState<InterviewFeedback | null>(null);

  // -------------------------
  // Load Tracks
  // -------------------------
  const loadTracks = async () => {
    setLoadingTracks(true);
    try {
      const data = await interviewService.getRoles();
      setTracks(data);
      if (data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(data[0].id);
      }
    } catch (e) {
      console.warn("Error loading tracks:", e);
      toast.error("Failed to load interview tracks.");
    } finally {
      setLoadingTracks(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  // -------------------------
  // Load Questions for Selected Role
  // -------------------------
  const loadQuestions = async (roleId: string) => {
    if (!roleId) return;
    setLoadingQuestions(true);
    try {
      const qs = await interviewService.getQuestions(roleId);
      setQuestions(qs);
    } catch (e) {
      console.warn("Failed to load questions:", e);
      toast.error("Failed to load questions for track.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (selectedRoleId) {
      loadQuestions(selectedRoleId);
    }
  }, [selectedRoleId]);

  // -------------------------
  // Load Candidate Sessions
  // -------------------------
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const sess = await interviewService.getAllSessions();
      setSessions(sess);
    } catch (e) {
      console.warn("Failed to load sessions:", e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === "sessions") {
      loadSessions();
    }
  }, [activeTab]);

  // -------------------------
  // Track Actions
  // -------------------------
  const handleCreateTrack = () => {
    setEditingTrack({
      title: "",
      category: "Frontend",
      difficulty: "Senior",
      durationMinutes: 25,
      description: "",
      icon: "Video",
      totalQuestions: 4,
      status: "ACTIVE",
    });
    setTrackModalOpen(true);
  };

  const handleEditTrack = (t: InterviewRole) => {
    setEditingTrack({ ...t });
    setTrackModalOpen(true);
  };

  const handleSaveTrack = async () => {
    if (!editingTrack.title?.trim()) {
      toast.error("Please enter a role title.");
      return;
    }
    setSavingTrack(true);
    try {
      const saved = await interviewService.saveRole(editingTrack);
      await loadTracks();
      toast.success("Interview track saved successfully!");
      setTrackModalOpen(false);
    } catch (e) {
      toast.error("Error saving track.");
    } finally {
      setSavingTrack(false);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    if (!confirm("Are you sure you want to delete this track and its questions?")) return;
    try {
      await interviewService.deleteRole(id);
      await loadTracks();
      toast.success("Track deleted successfully.");
      if (selectedRoleId === id) {
        setSelectedRoleId(tracks.find((t) => t.id !== id)?.id || "");
      }
    } catch (e) {
      toast.error("Failed to delete track.");
    }
  };

  // -------------------------
  // Question Actions
  // -------------------------
  const handleCreateQuestion = () => {
    setEditingQuestion({
      questionNumber: questions.length + 1,
      question: "",
      category: "System Design & Architecture",
      idealKeyPoints: ["Clear conceptual structure", "Real-world trade-off analysis", "Production edge cases"],
      followUpPrompt: "How would you handle scale, caching, or latency degradation in this scenario?",
    });
    setQuestionModalOpen(true);
  };

  const handleEditQuestion = (q: InterviewQuestion) => {
    setEditingQuestion({ ...q });
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion.question?.trim()) {
      toast.error("Please enter the question text.");
      return;
    }
    setSavingQuestion(true);
    try {
      await interviewService.saveQuestion(selectedRoleId, editingQuestion);
      await loadQuestions(selectedRoleId);
      await loadTracks();
      toast.success("Question saved successfully!");
      setQuestionModalOpen(false);
    } catch (e) {
      toast.error("Failed to save question.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Delete this question from track?")) return;
    try {
      await interviewService.deleteQuestion(selectedRoleId, qId);
      await loadQuestions(selectedRoleId);
      await loadTracks();
      toast.success("Question removed.");
    } catch (e) {
      toast.error("Failed to delete question.");
    }
  };

  // -------------------------
  // AI Question Generation Actions
  // -------------------------
  const handleOpenAiGenModal = () => {
    setGeneratedPreview([]);
    setAiGenModalOpen(true);
  };

  const handleGenerateAiQuestions = async () => {
    const currentTrack = tracks.find((t) => t.id === selectedRoleId);
    const roleTitle = currentTrack?.title || "Senior Software Engineer";
    const category = currentTrack?.category || "Technical";

    setGeneratingAi(true);
    try {
      const generated = await interviewService.generateAiQuestions(
        roleTitle,
        category,
        aiGenCount,
        aiGenDifficulty
      );
      setGeneratedPreview(generated);
      toast.success(`Generated ${generated.length} AI interview questions.`);
    } catch (e) {
      toast.error("Failed to generate AI questions.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleImportAiQuestions = async () => {
    if (generatedPreview.length === 0) return;
    setSavingQuestion(true);
    try {
      for (const q of generatedPreview) {
        await interviewService.saveQuestion(selectedRoleId, {
          question: q.question,
          category: q.category,
          idealKeyPoints: q.idealKeyPoints,
          followUpPrompt: q.followUpPrompt,
        });
      }
      await loadQuestions(selectedRoleId);
      await loadTracks();
      toast.success(`Imported ${generatedPreview.length} questions into track!`);
      setAiGenModalOpen(false);
      setGeneratedPreview([]);
    } catch (e) {
      toast.error("Error importing questions.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const activeTrackObj = tracks.find((t) => t.id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary flex items-center gap-2.5">
            <Video className="w-7 h-7 text-cyan-400" /> Mock Interview Control Center
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Configure interview tracks, manage curricula questions, generate questions with AI, and review candidate speech audits.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-raised border border-border rounded-xl">
          <Button
            variant={activeTab === "tracks" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tracks")}
            className="text-xs font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" /> Tracks ({tracks.length})
          </Button>
          <Button
            variant={activeTab === "questions" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("questions")}
            className="text-xs font-semibold"
          >
            <FileQuestion className="w-3.5 h-3.5 mr-1" /> Questions ({questions.length})
          </Button>
          <Button
            variant={activeTab === "sessions" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("sessions")}
            className="text-xs font-semibold"
          >
            <Users className="w-3.5 h-3.5 mr-1" /> Submissions ({sessions.length})
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: Interview Tracks Configurations */}
      {/* ======================================================== */}
      {activeTab === "tracks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-text-muted">
              {tracks.length} Mock Interview Tracks Configured
            </span>
            <Button variant="primary" size="sm" onClick={handleCreateTrack} className="font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Create New Track
            </Button>
          </div>

          <Card className="p-0 overflow-hidden bg-surface border-border">
            {loadingTracks ? (
              <div className="p-4">
                <TableSkeleton rows={4} />
              </div>
            ) : tracks.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Video className="w-10 h-10 text-text-muted mx-auto" />
                <p className="text-sm font-medium text-text-secondary">No mock interview tracks created yet.</p>
                <Button size="sm" variant="primary" onClick={handleCreateTrack}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create First Track
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4 bg-surface-raised">Role Title & Description</th>
                      <th className="p-4 bg-surface-raised">Category</th>
                      <th className="p-4 bg-surface-raised">Difficulty</th>
                      <th className="p-4 bg-surface-raised whitespace-nowrap">Duration</th>
                      <th className="p-4 bg-surface-raised whitespace-nowrap">Questions</th>
                      <th className="p-4 bg-surface-raised whitespace-nowrap">Status</th>
                      <th className="p-4 bg-surface-raised text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tracks.map((track) => (
                      <tr key={track.id} className="hover:bg-surface-raised/40 transition-colors">
                        <td className="p-4 font-semibold text-text-primary max-w-xs space-y-1">
                          <span className="block font-medium truncate text-sm">{track.title}</span>
                          <span className="block text-text-secondary text-[11px] truncate font-normal">
                            {track.description}
                          </span>
                        </td>

                        <td className="p-4">
                          <Badge variant="accent">{track.category}</Badge>
                        </td>

                        <td className="p-4">
                          <Badge variant="outline">{track.difficulty}</Badge>
                        </td>

                        <td className="p-4 font-mono text-cyan-400 font-semibold whitespace-nowrap">
                          {track.durationMinutes} mins
                        </td>

                        <td className="p-4 font-mono text-text-secondary whitespace-nowrap">
                          {track.totalQuestions || 4} Qs
                        </td>

                        <td className="p-4">
                          <Badge variant={track.status === "ACTIVE" ? "active" : "outline"}>
                            {track.status || "ACTIVE"}
                          </Badge>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <RowActions>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRoleId(track.id);
                                setActiveTab("questions");
                              }}
                              className="text-xs text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/10"
                              title="Manage Questions"
                            >
                              <FileQuestion className="w-3.5 h-3.5 mr-1" />
                              Questions
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTrack(track)}
                              className="text-xs text-text-primary border-border hover:bg-surface-raised"
                              title="Edit Track"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTrack(track.id)}
                              className="text-xs text-text-muted hover:text-red-400 hover:bg-red-500/10"
                              title="Delete Track"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: Questions & Curriculum Management */}
      {/* ======================================================== */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Track Selector & Action Bar */}
          <Card className="p-4 bg-surface border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase">
                Select Track:
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400 min-w-[280px]"
              >
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAiGenModal}
                className="text-xs font-semibold border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Generate Questions
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateQuestion}
                className="text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Question
              </Button>
            </div>
          </Card>

          {/* Questions List */}
          <div className="space-y-3">
            {loadingQuestions ? (
              <TableSkeleton rows={3} />
            ) : questions.length === 0 ? (
              <Card className="p-12 text-center space-y-3 bg-surface border-border">
                <FileQuestion className="w-10 h-10 text-text-muted mx-auto" />
                <p className="text-sm font-medium text-text-secondary">
                  No questions assigned to {activeTrackObj?.title || "this track"} yet.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={handleOpenAiGenModal}>
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Generate with AI
                  </Button>
                  <Button size="sm" variant="primary" onClick={handleCreateQuestion}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Question
                  </Button>
                </div>
              </Card>
            ) : (
              questions.map((q, idx) => (
                <Card
                  key={q.id || idx}
                  className="p-5 bg-surface border-border hover:border-cyan-400/40 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="accent" className="text-[10px] font-mono">
                          Question {q.questionNumber || idx + 1}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {q.category}
                        </Badge>
                      </div>
                      <h4 className="font-serif text-base font-medium text-text-primary leading-snug">
                        "{q.question}"
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(q)}
                        className="text-xs text-text-primary border-border hover:bg-surface-raised"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-xs text-text-muted hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Rubric Points & Follow Up */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border text-xs">
                    <div className="p-3 bg-surface-raised border border-border rounded-lg space-y-1">
                      <span className="font-mono font-semibold text-cyan-400 block text-[11px]">
                        Target Rubric Key Points:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-text-secondary font-mono text-[11px]">
                        {q.idealKeyPoints.map((kp, kIdx) => (
                          <li key={kIdx} className="truncate">{kp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-surface-raised border border-border rounded-lg space-y-1">
                      <span className="font-mono font-semibold text-text-muted block text-[11px]">
                        Interviewer Follow-up Prompt:
                      </span>
                      <p className="text-text-secondary italic text-[11px]">
                        "{q.followUpPrompt || "How would you handle failure recovery in this situation?"}"
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: Candidate Submissions & Audit */}
      {/* ======================================================== */}
      {activeTab === "sessions" && (
        <Card className="p-0 overflow-hidden bg-surface border-border">
          {loadingSessions ? (
            <div className="p-4">
              <TableSkeleton rows={4} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Users className="w-10 h-10 text-text-muted mx-auto" />
              <p className="text-sm font-medium text-text-secondary">
                No candidate mock interview attempts submitted yet.
              </p>
              <p className="text-xs text-text-muted">
                Candidate submissions from the student mock interview room will appear here with instant AI scoring.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 bg-surface-raised">Candidate & Role</th>
                    <th className="p-4 bg-surface-raised">Date</th>
                    <th className="p-4 bg-surface-raised">Overall Score</th>
                    <th className="p-4 bg-surface-raised">Performance Band</th>
                    <th className="p-4 bg-surface-raised text-right whitespace-nowrap">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((sess, idx) => (
                    <tr key={sess.id || sess.sessionId || idx} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="p-4 font-semibold text-text-primary space-y-0.5">
                        <span className="block font-medium truncate text-sm">
                          {sess.roleTitle || "Software Engineer"}
                        </span>
                        <span className="block text-text-secondary font-mono text-[11px]">
                          {sess.userEmail || sess.email || "candidate@platform.local"}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-text-muted whitespace-nowrap">
                        {sess.date || sess.completedAt?.split("T")[0] || "Today"}
                      </td>

                      <td className="p-4 font-serif text-lg font-bold text-cyan-400">
                        {sess.overallScore || sess.feedback?.overallScore || 80}/100
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={
                            sess.performanceBand === "Strong Hire" || (sess.overallScore >= 85)
                              ? "active"
                              : sess.overallScore >= 75
                              ? "accent"
                              : "outline"
                          }
                        >
                          {sess.performanceBand || (sess.overallScore >= 75 ? "Hire" : "Needs Practice")}
                        </Badge>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSessionAudit(sess.feedback || sess)}
                          className="text-xs text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/10"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View AI Audit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: Create / Edit Track */}
      {/* ======================================================== */}
      {trackModalOpen && (
        <Dialog
          isOpen={trackModalOpen}
          onClose={() => setTrackModalOpen(false)}
          title={editingTrack.id ? "Edit Mock Interview Track" : "Create New Mock Interview Track"}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setTrackModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveTrack} isLoading={savingTrack}>
                Save Track
              </Button>
            </>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Role Title"
              value={editingTrack.title || ""}
              onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer (React/TypeScript)"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Category / Domain</label>
                <select
                  value={editingTrack.category || "Frontend"}
                  onChange={(e) => setEditingTrack({ ...editingTrack, category: e.target.value })}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Full Stack">Full Stack</option>
                  <option value="System Design">System Design</option>
                  <option value="Behavioral">Behavioral (STAR)</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Database">Database & SQL</option>
                  <option value="DevOps">DevOps & Cloud</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Seniority Level</label>
                <select
                  value={editingTrack.difficulty || "Senior"}
                  onChange={(e) => setEditingTrack({ ...editingTrack, difficulty: e.target.value as any })}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (Minutes)"
                type="number"
                value={editingTrack.durationMinutes || 25}
                onChange={(e) => setEditingTrack({ ...editingTrack, durationMinutes: parseInt(e.target.value) || 25 })}
              />

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
                <select
                  value={editingTrack.status || "ACTIVE"}
                  onChange={(e) => setEditingTrack({ ...editingTrack, status: e.target.value as any })}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Track Description</label>
              <textarea
                value={editingTrack.description || ""}
                onChange={(e) => setEditingTrack({ ...editingTrack, description: e.target.value })}
                placeholder="Briefly describe the competencies and topics covered in this simulated round..."
                className="w-full h-24 p-3 bg-surface-raised border border-border rounded-lg text-xs text-text-primary font-sans focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Create / Edit Question */}
      {/* ======================================================== */}
      {questionModalOpen && (
        <Dialog
          isOpen={questionModalOpen}
          onClose={() => setQuestionModalOpen(false)}
          title={editingQuestion.id ? "Edit Interview Question" : `Add Question to ${activeTrackObj?.title || "Track"}`}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setQuestionModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveQuestion} isLoading={savingQuestion}>
                Save Question
              </Button>
            </>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
            <div>
              <label className="block font-medium text-text-secondary mb-1">Question Prompt</label>
              <textarea
                value={editingQuestion.question || ""}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                placeholder="e.g. How does React 19 concurrent mode prioritize state transitions, and how do you profile high-frequency re-renders?"
                className="w-full h-24 p-3 bg-surface-raised border border-border rounded-lg text-text-primary font-sans focus:outline-none focus:border-cyan-400 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Topic Category"
                value={editingQuestion.category || ""}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                placeholder="e.g. Architecture, Concurrency, STAR"
              />

              <Input
                label="Question Number / Order"
                type="number"
                value={editingQuestion.questionNumber || 1}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, questionNumber: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div>
              <label className="block font-medium text-text-secondary mb-1">
                Ideal Rubric Key Points (One per line)
              </label>
              <textarea
                value={(editingQuestion.idealKeyPoints || []).join("\n")}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    idealKeyPoints: e.target.value.split("\n").filter((s) => s.trim().length > 0),
                  })
                }
                placeholder="Clear problem context&#10;Trade-off analysis&#10;Specific metrics / latency numbers"
                className="w-full h-24 p-3 bg-surface-raised border border-border rounded-lg text-text-primary font-mono focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div>
              <label className="block font-medium text-text-secondary mb-1">Interviewer Follow-up Question</label>
              <input
                type="text"
                value={editingQuestion.followUpPrompt || ""}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, followUpPrompt: e.target.value })}
                placeholder="e.g. What would you change if you had to re-architect it for 10x traffic?"
                className="w-full p-2.5 bg-surface-raised border border-border rounded-lg text-text-primary font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: AI Generate Questions */}
      {/* ======================================================== */}
      {aiGenModalOpen && (
        <Dialog
          isOpen={aiGenModalOpen}
          onClose={() => setAiGenModalOpen(false)}
          title={`Generate AI Interview Questions (${activeTrackObj?.title || "Role"})`}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setAiGenModalOpen(false)}>
                Cancel
              </Button>
              {generatedPreview.length > 0 && (
                <Button variant="primary" size="sm" onClick={handleImportAiQuestions} isLoading={savingQuestion}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Import {generatedPreview.length} Questions
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
            <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-3">
              <Brain className="w-5 h-5 text-cyan-400 shrink-0" />
              <p className="text-text-secondary text-xs">
                Gemini will craft structured technical placement questions complete with target rubric key points and senior engineer follow-ups.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-text-secondary mb-1">Number of Questions</label>
                <select
                  value={aiGenCount}
                  onChange={(e) => setAiGenCount(parseInt(e.target.value) || 3)}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 font-mono text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  <option value={2}>2 Questions</option>
                  <option value={3}>3 Questions</option>
                  <option value={4}>4 Questions</option>
                  <option value={5}>5 Questions</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-text-secondary mb-1">Target Seniority</label>
                <select
                  value={aiGenDifficulty}
                  onChange={(e) => setAiGenDifficulty(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 font-mono text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleGenerateAiQuestions}
              isLoading={generatingAi}
              className="w-full font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-1 text-cyan-300" />
              Generate Questions via Gemini
            </Button>

            {/* Generated Preview List */}
            {generatedPreview.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border">
                <span className="font-mono font-semibold text-cyan-400 uppercase text-[11px] block">
                  Generated Preview ({generatedPreview.length} Questions):
                </span>
                {generatedPreview.map((q, i) => (
                  <div key={i} className="p-3 bg-surface-raised border border-border rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="accent" className="text-[10px] font-mono">Q{i + 1}</Badge>
                      <span className="text-[11px] font-mono text-text-muted">{q.category}</span>
                    </div>
                    <p className="font-serif font-medium text-text-primary text-xs leading-snug">
                      "{q.question}"
                    </p>
                    <p className="text-[11px] text-text-secondary italic">
                      Follow-up: {q.followUpPrompt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: Candidate Session AI Audit Detail */}
      {/* ======================================================== */}
      {selectedSessionAudit && (
        <Dialog
          isOpen={!!selectedSessionAudit}
          onClose={() => setSelectedSessionAudit(null)}
          title="Candidate AI Mock Interview Audit"
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedSessionAudit(null)}>
              Close Audit
            </Button>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-surface-raised border border-border rounded-xl">
              <div>
                <h4 className="font-serif text-base font-semibold text-text-primary">
                  {selectedSessionAudit.roleTitle}
                </h4>
                <span className="text-text-muted font-mono text-[11px]">{selectedSessionAudit.date}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-text-muted block">Score</span>
                <span className="font-serif text-2xl font-bold text-cyan-400">
                  {selectedSessionAudit.overallScore}/100
                </span>
              </div>
            </div>

            <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
              <span className="font-mono font-semibold text-cyan-400 uppercase text-[11px] block">
                AI Executive Summary:
              </span>
              <p className="text-text-secondary font-sans leading-relaxed">
                {selectedSessionAudit.detailedFeedback}
              </p>
            </div>

            {/* Question Reviews */}
            {selectedSessionAudit.questionReviews && selectedSessionAudit.questionReviews.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="font-mono font-semibold text-text-primary uppercase text-[11px] block">
                  Candidate Spoken Answers & AI Analysis:
                </span>
                {selectedSessionAudit.questionReviews.map((qr, i) => (
                  <div key={i} className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="accent" className="text-[10px] font-mono">Q{qr.questionNumber || i + 1}</Badge>
                      <span className="font-serif font-bold text-cyan-400">{qr.score}/100</span>
                    </div>
                    <p className="font-serif font-medium text-text-primary text-xs">"{qr.question}"</p>
                    <div className="p-2.5 bg-surface border border-border rounded-lg space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 block font-semibold">Candidate Voice Transcript:</span>
                      <p className="text-text-secondary font-mono text-[11px]">"{qr.candidateAnswer}"</p>
                    </div>
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg space-y-1">
                      <span className="text-[10px] font-mono text-cyan-300 block font-semibold">AI Critique:</span>
                      <p className="text-text-secondary text-[11px]">{qr.aiFeedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
};
