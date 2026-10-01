import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight, Target, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface SkillScore {
  subject: string;
  A: number;
}

export interface NextBestActionProps {
  skillsData?: SkillScore[];
  className?: string;
}

export const NextBestAction: React.FC<NextBestActionProps> = ({
  skillsData = [
    { subject: "React/FE", A: 90 },
    { subject: "Java/Spring", A: 82 },
    { subject: "DSA/DP", A: 88 },
    { subject: "System Design", A: 75 },
    { subject: "SQL/DB", A: 85 },
  ],
  className,
}) => {
  const navigate = useNavigate();

  // Find the weakest topic
  const weakest = [...skillsData].sort((a, b) => a.A - b.A)[0] || {
    subject: "System Design",
    A: 75,
  };

  const getRecommendation = (subject: string, score: number) => {
    switch (subject) {
      case "System Design":
        return {
          title: "Complete System Design Architectural Challenge",
          actionText: "Practice System Design",
          link: "/practice",
          reason: `Your ${subject} score is currently ${score}%, which is your lowest area. Mastering microservices & load balancing will boost your readiness score.`,
        };
      case "Java/Spring":
        return {
          title: "Take Spring Boot & Java MCQ Quiz",
          actionText: "Start Java Quiz",
          link: "/quiz",
          reason: `Your ${subject} proficiency is at ${score}%. An extra 10-question quiz will solidify core concepts.`,
        };
      case "DSA/DP":
        return {
          title: "Solve Dynamic Programming Challenge",
          actionText: "Open Coding Arena",
          link: "/coding",
          reason: `Your ${subject} score is ${score}%. Solving 1 hard DP problem will elevate your coding performance percentile.`,
        };
      case "React/FE":
        return {
          title: "Conduct Senior Frontend Mock Interview",
          actionText: "Start AI Mock",
          link: "/mock-interview",
          reason: `Your ${subject} score is ${score}%. Practice real-time speech responses to boost confidence.`,
        };
      default:
        return {
          title: "Conduct AI Mock Technical Interview",
          actionText: "Start Mock Round",
          link: "/mock-interview",
          reason: `Your ${subject} score is ${score}%. Conduct a 15-minute AI interview to improve your feedback score.`,
        };
    };
  };

  const rec = getRecommendation(weakest.subject, weakest.A);

  return (
    <Card className={`p-6 bg-gradient-to-r from-cyan-950/30 via-surface to-surface border border-cyan-400/40 relative overflow-hidden space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            AI Next Best Action Coach
          </span>
        </div>
        <span className="text-[11px] font-mono text-text-muted bg-surface-raised border border-border px-2.5 py-0.5 rounded-full">
          Focus: {weakest.subject} ({weakest.A}%)
        </span>
      </div>

      <div>
        <h4 className="font-serif text-lg font-bold text-text-primary">
          {rec.title}
        </h4>
        {/* Why this? Line */}
        <div className="mt-2 p-3 bg-surface-raised/80 border border-border rounded-xl text-xs text-text-secondary flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-text-primary font-mono">Why this recommendation? </span>
            {rec.reason}
          </p>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(rec.link)}
          className="gap-1.5 text-xs"
        >
          <span>{rec.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
};
