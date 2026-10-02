import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Flame, Code2, Award, Zap, Sparkles, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: "Streak" | "Milestone" | "Skill";
  icon: any;
  unlocked: boolean;
  unlockedAt?: string;
  topBadge?: boolean;
}

export const AchievementsShelf: React.FC = () => {
  const badges: AchievementBadge[] = [
    { id: "b1", title: "12-Day Streak Master", description: "Maintained a continuous 12-day practice streak", category: "Streak", icon: Flame, unlocked: true, unlockedAt: "2 days ago", topBadge: true },
    { id: "b2", title: "Algorithm Architect", description: "Solved 50+ Hard level coding problems", category: "Milestone", icon: Code2, unlocked: true, unlockedAt: "1 week ago" },
    { id: "b3", title: "Mock Champion", description: "Achieved 90%+ in 5 Mock Interviews", category: "Skill", icon: Award, unlocked: true, unlockedAt: "Yesterday" },
    { id: "b4", title: "System Design Guru", description: "Complete System Design Track", category: "Skill", icon: ShieldCheck, unlocked: false },
    { id: "b5", title: "Centurion Solver", description: "Solve 100 Coding Problems", category: "Milestone", icon: Zap, unlocked: false },
  ];

  const handleCelebrate = (badge: AchievementBadge) => {
    if (!badge.unlocked) return;
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <Card className="p-6 bg-surface border-border space-y-4 shadow-soft">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-text-primary">Achievements & Badge Shelf</h3>
            <p className="text-[11px] text-text-muted font-mono">Milestone badges earned through platform practice.</p>
          </div>
        </div>
        <Badge variant="accent" className="font-mono">
          3 / 5 Unlocked
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              onClick={() => handleCelebrate(b)}
              className={`p-3.5 rounded-xl border text-center space-y-2 transition-all cursor-pointer ${
                b.unlocked
                  ? "bg-surface-raised border-amber-400/40 hover:border-amber-400 shadow-soft"
                  : "bg-surface/50 border-border opacity-50 grayscale"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                  b.unlocked
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                    : "bg-surface border border-border text-text-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-xs font-bold text-text-primary block truncate">{b.title}</span>
                <span className="text-[10px] text-text-muted font-mono block mt-0.5">{b.category}</span>
              </div>
              {b.topBadge && (
                <Badge variant="active" className="text-[9px] font-mono mx-auto">
                  ★ Top Badge
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
