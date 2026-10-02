import React, { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Flame, Calendar, Trophy } from "lucide-react";

export interface StreakHeatmapProps {
  currentStreak?: number;
  longestStreak?: number;
  className?: string;
}

interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number; // 0 to 4+
  dayOfWeek: number; // 0-6
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  currentStreak = 12,
  longestStreak = 18,
  className,
}) => {
  // Generate 84 days (12 weeks * 7 days) of mock activity data relative to today
  const activityGrid = useMemo(() => {
    const days: DayActivity[] = [];
    const today = new Date();

    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();

      // Mock formula to generate realistic study activity pattern
      let count = 0;
      if (i < 12) {
        // Last 12 days: active (for current streak)
        count = (i % 3) + 1;
      } else {
        const rand = (i * 17 + dayOfWeek * 5) % 10;
        if (rand > 4) count = (rand % 3) + 1;
        else if (rand > 2) count = 1;
        else count = 0;
      }

      days.push({
        date: dateStr,
        count,
        dayOfWeek,
      });
    }
    return days;
  }, []);

  const totalSubmissions = useMemo(
    () => activityGrid.reduce((acc, curr) => acc + curr.count, 0),
    [activityGrid]
  );

  const getIntensityColor = (count: number) => {
    if (count === 0) return "bg-surface-raised/80 border-border/40";
    if (count === 1) return "bg-cyan-950 dark:bg-cyan-950/80 text-cyan-300 border-cyan-800/40";
    if (count === 2) return "bg-cyan-700/80 text-cyan-200 border-cyan-600/50";
    if (count === 3) return "bg-cyan-500 text-black border-cyan-400 font-bold";
    return "bg-teal-400 text-black border-teal-300 font-bold shadow-xs";
  };

  return (
    <Card className={`p-6 bg-surface border-border space-y-4 ${className}`}>
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-live fill-live animate-pulse" />
          <h3 className="font-serif text-lg font-medium text-text-primary">
            12-Week Study Momentum Heatmap
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-surface-raised border border-border px-2.5 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5 text-live fill-live" />
            <span className="text-text-muted">Current:</span>
            <span className="text-live font-bold">{currentStreak} Days</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-raised border border-border px-2.5 py-1 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-text-muted">Longest:</span>
            <span className="text-amber-400 font-bold">{longestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Grid rendering */}
      <div className="space-y-2 overflow-x-auto pb-1">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[500px]">
          {activityGrid.map((day, idx) => (
            <div
              key={idx}
              title={`${day.date}: ${day.count} ${day.count === 1 ? "activity" : "activities"}`}
              className={`w-4 h-4 rounded-[3px] border transition-transform hover:scale-125 hover:z-10 cursor-pointer ${getIntensityColor(
                day.count
              )}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-1">
          <span>{totalSubmissions} Total study actions in 12 weeks</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-3 h-3 rounded-[2px] bg-surface-raised border border-border" />
            <div className="w-3 h-3 rounded-[2px] bg-cyan-950 border border-cyan-800" />
            <div className="w-3 h-3 rounded-[2px] bg-cyan-700 border border-cyan-600" />
            <div className="w-3 h-3 rounded-[2px] bg-cyan-500 border border-cyan-400" />
            <div className="w-3 h-3 rounded-[2px] bg-teal-400 border border-teal-300" />
            <span>More</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
