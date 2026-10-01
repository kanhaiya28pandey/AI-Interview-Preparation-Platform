import React from "react";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Award, Lock, CheckCircle2, Flame, ShieldCheck, Video, Code2, Trophy, FileText, Sparkles } from "lucide-react";

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number; // 0-100
  unlockedDate?: string;
}

export interface AchievementsProps {
  variant?: "compact" | "full";
  className?: string;
}

const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "first_mock",
    title: "First Mock Interview",
    description: "Completed 1st AI speech mock interview round",
    icon: Video,
    unlocked: true,
    progress: 100,
    unlockedDate: "Sep 15, 2026",
  },
  {
    id: "streak_7",
    title: "7-Day Streak",
    description: "Practiced 7 days in a row without missing",
    icon: Flame,
    unlocked: true,
    progress: 100,
    unlockedDate: "Sep 22, 2026",
  },
  {
    id: "verified_student",
    title: "Verified Student",
    description: "Uploaded and verified College Student ID",
    icon: ShieldCheck,
    unlocked: true,
    progress: 100,
    unlockedDate: "Sep 10, 2026",
  },
  {
    id: "top_leaderboard",
    title: "Top 10 Leaderboard",
    description: "Ranked among top 10 candidates in campus drive",
    icon: Trophy,
    unlocked: true,
    progress: 100,
    unlockedDate: "Sep 28, 2026",
  },
  {
    id: "coding_pioneer",
    title: "Coding Master",
    description: "Solve 25 coding challenges in Arena",
    icon: Code2,
    unlocked: false,
    progress: 75, // 15/20 solved
  },
  {
    id: "resume_90",
    title: "ATS Resume Perfection",
    description: "Achieve 90+ ATS Score on AI Resume Scanner",
    icon: FileText,
    unlocked: false,
    progress: 86, // 86/90
  },
];

export const Achievements: React.FC<AchievementsProps> = ({
  variant = "full",
  className,
}) => {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  if (variant === "compact") {
    return (
      <Card className={`p-4 bg-surface border-border space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="font-serif text-sm font-semibold text-text-primary">
              Student Badges & Achievements
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
            {unlockedCount} / {ACHIEVEMENTS.length} Unlocked
          </span>
        </div>

        {/* Compact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {ACHIEVEMENTS.map((ach) => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.id}
                title={`${ach.title}: ${ach.description} (${ach.unlocked ? "Unlocked" : `${ach.progress}%`})`}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all select-none ${
                  ach.unlocked
                    ? "bg-cyan-500/10 border-cyan-400/30 text-text-primary"
                    : "bg-surface-raised/40 border-border opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                }`}
              >
                <div className={`p-2 rounded-lg ${ach.unlocked ? "bg-cyan-400/20 text-cyan-400" : "bg-surface border border-border text-text-muted"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold line-clamp-1">{ach.title}</span>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-surface border-border space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" /> Platform Achievements & Milestones
          </h3>
          <p className="text-xs text-text-secondary">Earn verified badges by completing mocks, daily practice, and identity verification.</p>
        </div>
        <div className="text-right font-mono">
          <span className="text-2xl font-bold text-cyan-400">{unlockedCount}</span>
          <span className="text-xs text-text-muted block">/ {ACHIEVEMENTS.length} Unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const Icon = ach.icon;
          return (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                ach.unlocked
                  ? "bg-surface-raised border-cyan-400/40 shadow-soft"
                  : "bg-surface border-border opacity-70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    ach.unlocked
                      ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-400"
                      : "bg-surface-raised border-border text-text-muted"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-text-primary">{ach.title}</h4>
                    {ach.unlocked ? (
                      <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked {ach.unlockedDate}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">{ach.description}</p>

              {!ach.unlocked && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>Progress</span>
                    <span className="text-cyan-400 font-bold">{ach.progress}%</span>
                  </div>
                  <Progress value={ach.progress} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
