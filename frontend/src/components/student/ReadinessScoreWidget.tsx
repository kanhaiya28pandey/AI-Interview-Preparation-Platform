import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { Award, TrendingUp, Zap, CheckCircle2, Layers } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export interface ReadinessScoreWidgetProps {
  score?: number;
  className?: string;
}

export const ReadinessScoreWidget: React.FC<ReadinessScoreWidgetProps> = ({
  score = 82,
  className,
}) => {
  const radarData = [
    { subject: "Resume ATS", value: 81 },
    { subject: "Coding Arena", value: 88 },
    { subject: "Quizzes", value: 76 },
    { subject: "Mock Interview", value: 84 },
    { subject: "Consistency", value: 90 },
  ];

  return (
    <Card className={`p-6 bg-surface border-border space-y-4 shadow-soft ${className}`}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-text-primary">Interview Readiness Score</h3>
            <p className="text-[11px] text-text-muted font-mono">Multi-dimensional placement qualification index.</p>
          </div>
        </div>
        <Badge variant="active" className="text-xs font-mono">
          Placement Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="space-y-3 text-center sm:text-left">
          <VerdictHeadline prefix="Score: " score={score} size="xl" />
          <p className="text-xs text-text-secondary leading-relaxed">
            Your combined technical problem solving, ATS keyword density, and mock response clarity place you in the top 12% of placement candidates.
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
            <div className="p-2 bg-surface-raised border border-border rounded-lg">
              <span className="text-text-muted block">Resume ATS</span>
              <span className="text-cyan-400 font-bold">81/100</span>
            </div>
            <div className="p-2 bg-surface-raised border border-border rounded-lg">
              <span className="text-text-muted block">Coding Arena</span>
              <span className="text-live font-bold">88/100</span>
            </div>
            <div className="p-2 bg-surface-raised border border-border rounded-lg">
              <span className="text-text-muted block">Quiz Mastery</span>
              <span className="text-amber-400 font-bold">76/100</span>
            </div>
            <div className="p-2 bg-surface-raised border border-border rounded-lg">
              <span className="text-text-muted block">Mock Grade</span>
              <span className="text-indigo-400 font-bold">84/100</span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" stroke="var(--text-primary)" fontSize={10} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" fontSize={9} />
              <Radar name="Readiness" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
