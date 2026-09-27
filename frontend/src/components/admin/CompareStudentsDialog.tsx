import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { StudentProgress } from "@/mocks/studentProgressData";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Award, Flame, Code2, Video, HelpCircle, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

export interface CompareStudentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProgress[];
}

const COLORS = ["#22d3ee", "#4ade80", "#f59e0b", "#a855f7"];

export const CompareStudentsDialog: React.FC<CompareStudentsDialogProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  if (students.length === 0) return null;

  // Prepare topic chart comparison data
  // Collect unique topics across selected students
  const topicSet = new Set<string>();
  students.forEach((s) => s.topicBreakdown.forEach((t) => topicSet.add(t.topic)));
  const topics = Array.from(topicSet);

  const topicChartData = topics.map((top) => {
    const entry: Record<string, any> = { topic: top };
    students.forEach((s) => {
      const match = s.topicBreakdown.find((t) => t.topic === top);
      entry[s.name] = match ? match.score : 0;
    });
    return entry;
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Side-by-Side Student Performance Comparison (${students.length} Selected)`}
      description="Comparing key benchmark metrics, problem-solving stats, and topic mastery."
      maxWidthClass="max-w-5xl"
    >
      <div className="space-y-6 font-sans text-xs">
        {/* KPI Comparison Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-${students.length} gap-4`}>
          {students.map((student, idx) => (
            <div
              key={student.id}
              className="p-4 bg-surface-raised border border-border rounded-xl space-y-3 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                  {student.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-sm text-text-primary truncate">{student.name}</h4>
                  <p className="text-[11px] text-text-muted font-mono truncate">{student.rollNumber} • {student.course}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-text-muted">Activity Score:</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{student.activityScore}/100</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px] text-text-secondary">
                <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1"><Flame className="w-3 h-3 text-live" /> Streak:</span>
                  <span className="font-semibold text-text-primary">{student.streakDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1"><Code2 className="w-3 h-3 text-cyan-400" /> Solved:</span>
                  <span className="font-semibold text-text-primary">{student.problemsSolved} Problems</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1"><Video className="w-3 h-3 text-cyan-400" /> Mocks:</span>
                  <span className="font-semibold text-text-primary">{student.interviewsCompleted} ({student.avgInterviewScore}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1"><HelpCircle className="w-3 h-3 text-cyan-400" /> Quiz Avg:</span>
                  <span className="font-semibold text-text-primary">{student.avgQuizScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1"><FileText className="w-3 h-3 text-cyan-400" /> ATS Score:</span>
                  <span className="font-semibold text-text-primary">{student.bestAtsScore}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="text-text-muted">Status:</span>
                {student.riskLevel === "At Risk" ? (
                  <Badge variant="blocked" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> AT RISK
                  </Badge>
                ) : (
                  <Badge variant="active" className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Grouped Bar Chart of Topic Mastery */}
        <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
          <h4 className="font-serif font-bold text-sm text-text-primary flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" /> Topic Mastery Comparison (% Score)
          </h4>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="topic" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                {students.map((student, idx) => (
                  <Bar
                    key={student.id}
                    dataKey={student.name}
                    fill={COLORS[idx % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
