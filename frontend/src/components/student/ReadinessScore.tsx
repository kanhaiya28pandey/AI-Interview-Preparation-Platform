import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Progress } from "@/components/ui/Progress";
import { Award, Code2, HelpCircle, Video, FileText, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";

export interface ReadinessBreakdown {
  coding: number;
  quiz: number;
  mockInterview: number;
  resume: number;
}

export interface ReadinessScoreProps {
  breakdown?: ReadinessBreakdown;
  className?: string;
}

export const ReadinessScore: React.FC<ReadinessScoreProps> = ({
  breakdown = { coding: 88, quiz: 82, mockInterview: 89, resume: 78 },
  className,
}) => {
  const [showModal, setShowModal] = useState(false);

  const totalScore = Math.round(
    (breakdown.coding + breakdown.quiz + breakdown.mockInterview + breakdown.resume) / 4
  );

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return { text: "Placement Ready", color: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10" };
    if (score >= 50) return { text: "Interview Ready", color: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10" };
    return { text: "Getting Started", color: "text-amber-400 border-amber-400/40 bg-amber-400/10" };
  };

  const status = getReadinessLabel(totalScore);
  const strokeDashoffset = 283 - (283 * totalScore) / 100;

  return (
    <>
      <Card
        onClick={() => setShowModal(true)}
        className={`p-5 bg-surface border-border hover:border-cyan-400/40 transition-all cursor-pointer group relative overflow-hidden ${className}`}
        title="Click to view detailed readiness breakdown"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="font-serif text-sm font-semibold text-text-primary">
              Interview Readiness Score
            </span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${status.color}`}>
            {status.text}
          </span>
        </div>

        <div className="flex items-center gap-5 my-2">
          {/* Circular SVG Ring */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-surface-raised"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#readinessGrad)"
                strokeWidth="8"
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono text-text-primary group-hover:scale-105 transition-transform">
                {totalScore}
              </span>
              <span className="text-[9px] text-text-muted font-mono uppercase">/ 100</span>
            </div>
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <p className="text-text-secondary leading-relaxed">
              Combined weight from Coding, Quizzes, AI Mocks, and ATS Resume evaluation.
            </p>
            <div className="flex items-center text-cyan-400 font-mono text-[11px] group-hover:translate-x-1 transition-transform">
              <span>View score breakdown</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </Card>

      {/* Score Breakdown Modal */}
      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Readiness Score Breakdown"
        description="How your placement readiness score is calculated"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
            <div>
              <span className="text-text-muted text-[10px] block font-mono">OVERALL SCORE</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">{totalScore} / 100</span>
            </div>
            <span className={`text-xs font-mono px-3 py-1 rounded-full border ${status.color}`}>
              {status.text}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: "Coding Arena", score: breakdown.coding, icon: Code2, weight: "25% weight" },
              { label: "MCQ Quizzes", score: breakdown.quiz, icon: HelpCircle, weight: "25% weight" },
              { label: "AI Mock Interviews", score: breakdown.mockInterview, icon: Video, weight: "25% weight" },
              { label: "ATS Resume Scan", score: breakdown.resume, icon: FileText, weight: "25% weight" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3 bg-surface border border-border rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-primary flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      {item.label}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">{item.score}%</span>
                  </div>
                  <Progress value={item.score} />
                  <span className="text-[10px] text-text-muted font-mono block text-right">{item.weight}</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-2 text-text-secondary text-[11px]">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Consistent daily practice increases your readiness index. Target a score of 80+ to get highlighted to campus placement recruiters!
            </span>
          </div>
        </div>
      </Dialog>
    </>
  );
};
