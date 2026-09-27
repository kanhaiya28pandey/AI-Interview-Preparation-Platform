import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentProgressService } from "@/services/studentProgressService";
import { StudentProgress, TeacherNote } from "@/mocks/studentProgressData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { ContextualHelpTooltip } from "@/components/common/ContextualHelpTooltip";
import {
  ArrowLeft,
  Printer,
  Download,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Code2,
  Video,
  HelpCircle,
  FileText,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Plus,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export const AdminStudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"interviews" | "coding" | "quizzes" | "resume">("interviews");

  useEffect(() => {
    if (!id) return;
    studentProgressService.getStudentById(id).then((data) => {
      if (data) {
        setStudent(data);
      } else {
        toast.error("Student record not found.");
        navigate("/admin/students");
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !student) return;
    setAddingNote(true);
    try {
      const newNote = await studentProgressService.addTeacherNote(student.id, noteText);
      setStudent((prev) => (prev ? { ...prev, teacherNotes: [newNote, ...prev.teacherNotes] } : null));
      setNoteText("");
      toast.success("Teacher note saved successfully.");
    } catch (e: any) {
      toast.error("Failed to save note.");
    } finally {
      setAddingNote(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (student) {
      studentProgressService.exportStudentsCSV([student], `${student.name.replace(/\s+/g, "_")}_report.csv`);
      toast.success("Downloaded student progress CSV report.");
    }
  };

  if (loading || !student) {
    return <CardSkeleton />;
  }

  const isAtRisk = student.riskLevel === "At Risk";

  return (
    <div className="space-y-6">
      {/* Print Styles Injection */}
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
          .print-full-width { width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border no-print">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/students")}
          className="text-xs font-mono text-text-muted hover:text-cyan-400 gap-1.5 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Roster
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs font-mono gap-1.5">
            <Printer className="w-3.5 h-3.5 text-cyan-400" /> Print / PDF Report
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs font-mono gap-1.5">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/profile")}
            className="text-xs font-mono gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Public Recruiter Profile
          </Button>
        </div>
      </div>

      {/* Student Profile Header Banner */}
      <Card className={cn("p-6 bg-surface border-border shadow-xl space-y-4 print-full-width", isAtRisk ? "border-l-4 border-l-amber-400" : "")}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-cyan-400/20 border-2 border-cyan-400/50 text-cyan-400 font-bold font-serif text-2xl flex items-center justify-center shrink-0 shadow-soft">
              {student.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-text-primary">{student.name}</h1>
                {student.verificationStatus === "VERIFIED" && (
                  <Badge variant="active" className="flex items-center gap-1 font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED STUDENT
                  </Badge>
                )}
                {isAtRisk && (
                  <Badge variant="blocked" className="flex items-center gap-1 font-mono text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" /> AT RISK
                  </Badge>
                )}
              </div>

              <div className="text-xs font-mono text-text-secondary flex flex-wrap items-center gap-y-1 gap-x-3">
                <span>Roll: <strong className="text-text-primary">{student.rollNumber}</strong></span>
                <span>•</span>
                <span>{student.course} ({student.year})</span>
                <span>•</span>
                <span>{student.branch}</span>
              </div>

              <p className="text-xs text-text-muted font-mono">{student.college} • Joined {student.joinedDate}</p>
            </div>
          </div>

          <div className="p-4 bg-surface-raised border border-border rounded-2xl flex items-center gap-6 shrink-0">
            <div>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Activity Score</span>
              <span className="font-serif font-bold text-3xl text-cyan-400">{student.activityScore}<span className="text-base text-text-muted">/100</span></span>
            </div>
            <div className="border-l border-border pl-6 space-y-1 font-mono text-xs">
              <div className="flex items-center gap-1 text-text-muted">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Last Active: <strong className="text-text-primary">{student.lastActive}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-live font-semibold">
                <Flame className="w-3.5 h-3.5 fill-live text-live" />
                <span>{student.streakDays} Day Practice Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Reason Banner if At Risk */}
        {isAtRisk && student.riskReason && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 font-mono text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Teacher Alert:</strong> {student.riskReason}</span>
          </div>
        )}
      </Card>

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-surface border-border space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-live" /> Day Streak
          </span>
          <span className="font-serif font-bold text-xl text-text-primary block">{student.streakDays} Days</span>
        </Card>

        <Card className="p-3.5 bg-surface border-border space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
            <Code2 className="w-3 h-3 text-cyan-400" /> Code Benchmarks
          </span>
          <span className="font-serif font-bold text-xl text-text-primary block">{student.problemsSolved} Solved</span>
          <span className="text-[10px] font-mono text-text-muted block">({student.problemsSolvedWithHelp} with help)</span>
        </Card>

        <Card className="p-3.5 bg-surface border-border space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
            <Video className="w-3 h-3 text-cyan-400" /> AI Mocks
          </span>
          <span className="font-serif font-bold text-xl text-text-primary block">{student.interviewsCompleted} Rounds</span>
          <span className="text-[10px] font-mono text-emerald-400 block">Avg: {student.avgInterviewScore}% Rating</span>
        </Card>

        <Card className="p-3.5 bg-surface border-border space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-cyan-400" /> MCQ Quizzes
          </span>
          <span className="font-serif font-bold text-xl text-text-primary block">{student.quizzesTaken} Quizzes</span>
          <span className="text-[10px] font-mono text-cyan-400 block">Avg: {student.avgQuizScore}% Score</span>
        </Card>

        <Card className="p-3.5 bg-surface border-border space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
            <FileText className="w-3 h-3 text-cyan-400" /> Resume ATS
          </span>
          <span className="font-serif font-bold text-xl text-text-primary block">{student.bestAtsScore}% Best</span>
          <span className="text-[10px] font-mono text-text-muted block">{student.resumeAnalyses} Scans Run</span>
        </Card>

        <Card className="p-3.5 bg-surface border-border space-y-1">
          <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-400" /> Campus Rank
          </span>
          <span className="font-serif font-bold text-xl text-emerald-400 block">#{student.leaderboardRank}</span>
        </Card>
      </div>

      {/* Activity Trend & Topic Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 30-Day Activity Trend Chart */}
        <Card className="lg:col-span-7 p-5 bg-surface border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> 30-Day Engagement & Activity Trend
            </h3>
            <ContextualHelpTooltip
              title="Engagement Metric"
              content="Calculated daily based on benchmarks solved, quizzes completed, and mock interview practice."
              faqId="pra-1"
            />
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={student.activityHistory30d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={(val) => val.slice(5)} />
                <YAxis stroke="var(--text-muted)" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#activityScoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Topic Breakdown Bar Chart */}
        <Card className="lg:col-span-5 p-5 bg-surface border-border space-y-3">
          <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" /> Topic & Domain Mastery (% Score)
          </h3>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={student.topicBreakdown} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                <XAxis type="number" stroke="var(--text-muted)" fontSize={10} domain={[0, 100]} />
                <YAxis dataKey="topic" type="category" stroke="var(--text-muted)" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="score" fill="#4ade80" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* GitHub-style Activity Heatmap Panel */}
      <Card className="p-5 bg-surface border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> 90-Day Daily Activity Heatmap
          </h3>
          <span className="text-xs font-mono text-text-muted">Darker cyan indicates higher practice volume</span>
        </div>

        <div className="p-4 bg-surface-raised border border-border rounded-xl overflow-x-auto custom-scrollbar">
          <div className="flex gap-1.5 min-w-[700px] justify-between">
            {Array.from({ length: 13 }).map((_, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1.5">
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const dayData = student.heatmapData[weekIdx * 7 + dayIdx];
                  const count = dayData ? dayData.count : 0;
                  const dateStr = dayData ? dayData.date : "";

                  let bgClass = "bg-surface border border-border/50";
                  if (count > 0 && count <= 2) bgClass = "bg-cyan-900/40 border border-cyan-700/50";
                  if (count > 2 && count <= 4) bgClass = "bg-cyan-600/70 border border-cyan-500/60";
                  if (count > 4) bgClass = "bg-cyan-400 border border-cyan-300 text-black";

                  return (
                    <div
                      key={dayIdx}
                      title={dateStr ? `${count} activities on ${dateStr}` : "No activity"}
                      className={cn("w-4 h-4 rounded-sm transition-transform hover:scale-125 cursor-pointer", bgClass)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* History Tabs & Tables */}
      <Card className="p-0 overflow-hidden bg-surface border-border shadow-lg">
        <div className="flex border-b border-border bg-surface-raised font-mono text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveHistoryTab("interviews")}
            className={cn(
              "px-4 py-3 font-semibold transition-colors flex items-center gap-1.5 shrink-0",
              activeHistoryTab === "interviews" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
            )}
          >
            <Video className="w-3.5 h-3.5" /> Mock Interviews ({student.interviewHistory.length})
          </button>
          <button
            onClick={() => setActiveHistoryTab("coding")}
            className={cn(
              "px-4 py-3 font-semibold transition-colors flex items-center gap-1.5 shrink-0",
              activeHistoryTab === "coding" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
            )}
          >
            <Code2 className="w-3.5 h-3.5" /> Coding Benchmarks ({student.codingHistory.length})
          </button>
          <button
            onClick={() => setActiveHistoryTab("quizzes")}
            className={cn(
              "px-4 py-3 font-semibold transition-colors flex items-center gap-1.5 shrink-0",
              activeHistoryTab === "quizzes" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
            )}
          >
            <HelpCircle className="w-3.5 h-3.5" /> MCQ Quizzes ({student.quizHistory.length})
          </button>
          <button
            onClick={() => setActiveHistoryTab("resume")}
            className={cn(
              "px-4 py-3 font-semibold transition-colors flex items-center gap-1.5 shrink-0",
              activeHistoryTab === "resume" ? "text-cyan-400 border-b-2 border-cyan-400 bg-surface" : "text-text-muted hover:text-text-primary"
            )}
          >
            <FileText className="w-3.5 h-3.5" /> Resume ATS Scans ({student.resumeHistory.length})
          </button>
        </div>

        <div className="p-4">
          {activeHistoryTab === "interviews" && (
            <div className="overflow-x-auto font-sans text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Track & Type</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">AI Feedback Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {student.interviewHistory.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-text-muted font-mono">No mock interviews completed yet.</td></tr>
                  ) : (
                    student.interviewHistory.map((int) => (
                      <tr key={int.id} className="hover:bg-surface-raised/60">
                        <td className="p-3 font-mono text-text-muted">{int.date}</td>
                        <td className="p-3">
                          <span className="font-semibold text-text-primary block">{int.track}</span>
                          <span className="text-[11px] text-text-muted">{int.type}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{int.score}/100</td>
                        <td className="p-3 font-mono text-text-secondary">{int.durationMinutes} mins</td>
                        <td className="p-3 text-text-secondary leading-relaxed">{int.feedbackSummary}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeHistoryTab === "coding" && (
            <div className="overflow-x-auto font-sans text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Benchmark Problem</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Attempts</th>
                    <th className="p-3">Last Attempt Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {student.codingHistory.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-text-muted font-mono">No coding problems attempted yet.</td></tr>
                  ) : (
                    student.codingHistory.map((cd) => (
                      <tr key={cd.id} className="hover:bg-surface-raised/60">
                        <td className="p-3 font-semibold text-text-primary">{cd.title}</td>
                        <td className="p-3">
                          <Badge variant={cd.difficulty.toLowerCase() as any}>{cd.difficulty}</Badge>
                        </td>
                        <td className="p-3">
                          {cd.status === "SOLVED" && <Badge variant="active">SOLVED</Badge>}
                          {cd.status === "SOLVED_WITH_HELP" && <Badge variant="accent">SOLVED WITH HELP</Badge>}
                          {cd.status === "ATTEMPTED" && <Badge variant="medium">ATTEMPTED</Badge>}
                        </td>
                        <td className="p-3 font-mono text-text-secondary">{cd.attempts}</td>
                        <td className="p-3 font-mono text-text-muted">{cd.lastAttemptDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeHistoryTab === "quizzes" && (
            <div className="overflow-x-auto font-sans text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Quiz Topic</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Questions</th>
                    <th className="p-3">Time Taken</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {student.quizHistory.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-text-muted font-mono">No quiz records found.</td></tr>
                  ) : (
                    student.quizHistory.map((qz) => (
                      <tr key={qz.id} className="hover:bg-surface-raised/60">
                        <td className="p-3 font-semibold text-text-primary">{qz.topic}</td>
                        <td className="p-3 font-mono font-bold text-cyan-400">{qz.scorePct}%</td>
                        <td className="p-3 font-mono text-text-secondary">{qz.questions} Qs</td>
                        <td className="p-3 font-mono text-text-muted">{qz.timeTaken}</td>
                        <td className="p-3 font-mono text-text-muted">{qz.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeHistoryTab === "resume" && (
            <div className="overflow-x-auto font-sans text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Target Role</th>
                    <th className="p-3">ATS Score</th>
                    <th className="p-3">Key Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {student.resumeHistory.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-text-muted font-mono">No resume scans performed.</td></tr>
                  ) : (
                    student.resumeHistory.map((res) => (
                      <tr key={res.id} className="hover:bg-surface-raised/60">
                        <td className="p-3 font-mono text-text-muted">{res.date}</td>
                        <td className="p-3 font-semibold text-text-primary">{res.targetRole}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{res.atsScore}%</td>
                        <td className="p-3 text-text-secondary leading-relaxed">{res.feedbackSummary}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Teacher Notes Panel (Visible only to Admins/Teachers) */}
      <Card className="p-5 bg-surface border-border space-y-4 shadow-lg no-print">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" /> Private Teacher & Placement Notes
          </h3>
          <span className="text-xs font-mono text-text-muted">Visible exclusively to admins and faculty</span>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write an observation or intervention recommendation (e.g., 'Student needs more practice on DP algorithms before tier 1 drive')..."
            rows={3}
            className="w-full p-3 bg-surface-raised border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400 font-sans resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={addingNote}
              disabled={!noteText.trim()}
              className="text-xs font-mono gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Save Teacher Note
            </Button>
          </div>
        </form>

        {/* Notes History */}
        <div className="space-y-3 pt-2">
          {student.teacherNotes.length === 0 ? (
            <p className="text-xs text-text-muted font-mono py-3 text-center">No teacher notes recorded yet.</p>
          ) : (
            student.teacherNotes.map((note) => (
              <div key={note.id} className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-1 font-sans text-xs">
                <div className="flex justify-between items-center border-b border-border/50 pb-1.5">
                  <span className="font-semibold text-cyan-400 font-mono text-[11px]">{note.author}</span>
                  <span className="text-[10px] font-mono text-text-muted">{note.date}</span>
                </div>
                <p className="text-text-primary leading-relaxed pt-1">{note.text}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
