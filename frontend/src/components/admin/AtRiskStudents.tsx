import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, ArrowRight, ShieldAlert, UserX, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockStudentsProgress, StudentProgress } from "@/mocks/studentProgressData";

export interface AtRiskStudentsProps {
  className?: string;
  limit?: number;
}

export const AtRiskStudents: React.FC<AtRiskStudentsProps> = ({
  className,
  limit = 5,
}) => {
  const navigate = useNavigate();

  // Filter students who are At Risk or Inactive
  const atRiskStudents = mockStudentsProgress
    .filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Inactive" || s.activityScore < 40)
    .slice(0, limit);

  if (atRiskStudents.length === 0) {
    return (
      <Card className={`p-6 bg-surface border-border text-center ${className}`}>
        <p className="text-xs text-text-muted">No students currently flagged at risk.</p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-surface border-border space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-serif text-lg font-bold text-text-primary">
              At-Risk Students Alert
            </h3>
            <p className="text-xs text-text-muted">
              Candidates requiring placement intervention or identity re-verification
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/students")}
          className="text-xs font-mono gap-1"
        >
          <span>All Students</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </Button>
      </div>

      <div className="space-y-3">
        {atRiskStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => navigate(`/admin/students/${student.id}`)}
            className="p-3.5 rounded-xl bg-surface-raised border border-border hover:border-amber-400/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs text-text-primary group-hover:text-amber-400 transition-colors">
                  {student.name}
                </span>
                <span className="text-[10px] font-mono text-text-muted">({student.rollNumber})</span>
                <Badge variant={student.riskLevel === "Inactive" ? "blocked" : "hard"}>
                  {student.riskLevel}
                </Badge>
              </div>

              <p className="text-xs text-text-secondary">
                {student.course} - {student.branch} ({student.year})
              </p>

              {/* Reason Chip */}
              {student.riskReason && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-mono mt-1">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-xs">{student.riskReason}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
              <div className="text-right text-[11px] font-mono">
                <span className="text-text-muted block">Score: <strong className="text-amber-400">{student.activityScore}%</strong></span>
                <span className="text-text-muted block">Inactive: <strong>{student.daysInactive}d</strong></span>
              </div>

              <Button variant="ghost" size="sm" className="text-xs font-mono gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Inspect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
