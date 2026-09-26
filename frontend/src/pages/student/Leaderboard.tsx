import React, { useState, useEffect } from "react";
import { leaderboardService } from "@/services/leaderboardService";
import { LeaderboardUser } from "@/mocks/leaderboardData";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Trophy, Crown, Flame, Award, ArrowUp, ArrowDown } from "lucide-react";

export const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "weekly" | "college">("all");

  useEffect(() => {
    setLoading(true);
    leaderboardService.getLeaderboard(filter).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [filter]);

  if (loading) return <CardSkeleton />;

  const top3 = data.slice(0, 3);
  const remaining = data.slice(3);

  return (
    <div className="space-y-8">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary flex items-center gap-2">
            <Trophy className="w-6 h-6 text-cyan-400" /> Campus Placement Leaderboard
          </h2>
          <p className="text-xs text-text-secondary">Compare practice scores, coding benchmarks, and daily streaks across engineering campuses.</p>
        </div>

        <div className="flex bg-surface-raised border border-border p-1 rounded-lg text-xs font-mono">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded transition-colors ${filter === "all" ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-[#0d1321] font-semibold" : "text-text-muted hover:text-text-primary"}`}
          >
            All Campuses
          </button>
          <button
            onClick={() => setFilter("weekly")}
            className={`px-3 py-1.5 rounded transition-colors ${filter === "weekly" ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-[#0d1321] font-semibold" : "text-text-muted hover:text-text-primary"}`}
          >
            Highest Streak
          </button>
          <button
            onClick={() => setFilter("college")}
            className={`px-3 py-1.5 rounded transition-colors ${filter === "college" ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-[#0d1321] font-semibold" : "text-text-muted hover:text-text-primary"}`}
          >
            My Campus (SRM)
          </button>
        </div>
      </div>

      {/* Top 3 Podium Section */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
          {/* 2nd Place */}
          <Card className="p-6 text-center space-y-3 bg-surface border-slate-500/40 md:order-1 order-2">
            <div className="relative inline-block">
              <img src={top3[1].avatar} alt={top3[1].name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-300 mx-auto" />
              <span className="absolute -bottom-2 right-0 bg-slate-300 text-ink font-mono font-bold text-xs px-2 py-0.5 rounded-full">
                #2
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-text-primary">{top3[1].name}</h3>
              <p className="text-xs text-text-muted font-mono truncate">{top3[1].college}</p>
            </div>
            <div className="pt-2 border-t border-border flex justify-around text-xs font-mono">
              <div><span className="text-text-muted block">Total XP</span><span className="font-bold text-slate-300">{top3[1].score}</span></div>
              <div><span className="text-text-muted block">Rating</span><span className="font-bold text-live">{top3[1].avgInterviewScore}%</span></div>
            </div>
          </Card>

          {/* 1st Place (Center Champion) */}
          <Card className="p-6 text-center space-y-4 bg-gradient-to-b from-gold/20 to-surface border-2 border-gold md:order-2 order-1 transform md:-translate-y-4 shadow-2xl relative">
            <Crown className="w-7 h-7 text-gold mx-auto animate-bounce" />
            <div className="relative inline-block">
              <img src={top3[0].avatar} alt={top3[0].name} className="w-20 h-20 rounded-full object-cover border-4 border-gold mx-auto shadow-xl" />
              <span className="absolute -bottom-2 right-0 bg-gold text-ink font-mono font-bold text-xs px-2.5 py-0.5 rounded-full">
                #1 Champion
              </span>
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-gold">{top3[0].name}</h3>
              <p className="text-xs text-text-secondary font-mono truncate">{top3[0].college}</p>
            </div>
            <div className="pt-3 border-t border-gold/30 flex justify-around text-xs font-mono">
              <div><span className="text-text-muted block">Total XP</span><span className="font-bold text-gold text-sm">{top3[0].score}</span></div>
              <div><span className="text-text-muted block">Day Streak</span><span className="font-bold text-live text-sm">{top3[0].streakDays} Days</span></div>
            </div>
          </Card>

          {/* 3rd Place */}
          <Card className="p-6 text-center space-y-3 bg-surface border-amber-700/40 md:order-3 order-3">
            <div className="relative inline-block">
              <img src={top3[2].avatar} alt={top3[2].name} className="w-16 h-16 rounded-full object-cover border-2 border-amber-700 mx-auto" />
              <span className="absolute -bottom-2 right-0 bg-amber-700 text-text-primary font-mono font-bold text-xs px-2 py-0.5 rounded-full">
                #3
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-text-primary">{top3[2].name}</h3>
              <p className="text-xs text-text-muted font-mono truncate">{top3[2].college}</p>
            </div>
            <div className="pt-2 border-t border-border flex justify-around text-xs font-mono">
              <div><span className="text-text-muted block">Total XP</span><span className="font-bold text-amber-500">{top3[2].score}</span></div>
              <div><span className="text-text-muted block">Rating</span><span className="font-bold text-live">{top3[2].avgInterviewScore}%</span></div>
            </div>
          </Card>
        </div>
      )}

      {/* Table for remaining students */}
      <Card className="p-0 overflow-hidden bg-surface border-border">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="p-4 border-b border-border bg-surface-raised font-mono text-xs font-semibold text-text-muted flex justify-between">
              <span>Rank & Candidate</span>
              <div className="flex gap-12 mr-4">
                <span>Problems Solved</span>
                <span>Day Streak</span>
                <span>Total XP</span>
              </div>
            </div>

            <div className="divide-y divide-border">
              {remaining.map((usr) => (
                <div
                  key={usr.userId}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    usr.isCurrentUser
                      ? "bg-cyan-400/15 border-l-4 border-cyan-400 text-cyan-400 font-medium"
                      : "hover:bg-surface-raised/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-semibold text-text-muted w-6 text-center">#{usr.rank}</span>
                    <img src={usr.avatar} alt={usr.name} className="w-9 h-9 rounded-full object-cover border border-border" />
                    <div>
                      <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
                        {usr.name}
                        {usr.isCurrentUser && <Badge variant="accent">YOU</Badge>}
                      </h4>
                      <p className="text-[11px] text-text-muted font-mono">{usr.college}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 font-mono text-xs">
                    <span className="text-text-secondary">{usr.problemsSolved} Solved</span>
                    <span className="text-live flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-live text-live" /> {usr.streakDays}d</span>
                    <span className="font-bold text-cyan-400">{usr.score} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
