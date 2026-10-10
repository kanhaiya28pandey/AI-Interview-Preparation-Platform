import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Flame, Calendar, Trophy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface YearlyActivityHeatmapProps {
  activityData?: ActivityDay[];
  currentStreak?: number;
  longestStreak?: number;
  className?: string;
  title?: string;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const YearlyActivityHeatmap: React.FC<YearlyActivityHeatmapProps> = ({
  activityData = [],
  currentStreak = 7,
  longestStreak = 14,
  className,
  title = "365-Day Daily Activity Heatmap",
}) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Build a 52-week array ending on today
  const { weeks, monthHeaders, totalActivities, activeDaysCount } = useMemo(() => {
    const today = new Date();
    // Normalize to end of day
    today.setHours(23, 59, 59, 999);

    // Map of date string -> count from input data
    const countMap = new Map<string, number>();
    activityData.forEach((d) => {
      if (d.date) countMap.set(d.date.slice(0, 10), d.count);
    });

    // 52 weeks = 364 days. Current day of week determines where the last column ends.
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const totalDays = 52 * 7 + (currentDayOfWeek + 1);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    const weekCols: {
      days: { date: string; count: number; dayOfWeek: number; isFuture: boolean }[];
    }[] = [];

    const monthPositions: { month: string; colIndex: number }[] = [];
    let lastMonth = -1;

    let currentDate = new Date(startDate);
    let totalCount = 0;
    let activeDays = 0;

    let currentWeek: { date: string; count: number; dayOfWeek: number; isFuture: boolean }[] = [];

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayOfWeek = currentDate.getDay();
      const month = currentDate.getMonth();

      // Check month boundary for header
      if (month !== lastMonth && currentDate.getDate() <= 7) {
        monthPositions.push({
          month: MONTH_NAMES[month],
          colIndex: weekCols.length,
        });
        lastMonth = month;
      }

      const count = countMap.get(dateStr) ?? 0;
      totalCount += count;
      if (count > 0) activeDays += 1;

      currentWeek.push({
        date: dateStr,
        count,
        dayOfWeek,
        isFuture: false,
      });

      if (dayOfWeek === 6 || currentDate.getTime() >= today.getTime()) {
        weekCols.push({ days: currentWeek });
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weekCols.push({ days: currentWeek });
    }

    return {
      weeks: weekCols,
      monthHeaders: monthPositions,
      totalActivities: totalCount,
      activeDaysCount: activeDays,
    };
  }, [activityData]);

  const getCellColor = (count: number) => {
    if (count === 0) return "bg-surface-raised/70 border-border/40 hover:border-cyan-400/50";
    if (count <= 2) return "bg-emerald-950/80 border-emerald-800/60 text-emerald-300";
    if (count <= 4) return "bg-emerald-700/80 border-emerald-600/70 text-emerald-100";
    if (count <= 6) return "bg-emerald-500 border-emerald-400 text-black";
    return "bg-emerald-400 border-emerald-300 text-black shadow-xs";
  };

  return (
    <Card className={cn("p-5 bg-surface border-border space-y-4 relative select-none", className)}>
      {/* Header with Title and Streak Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h3 className="font-serif text-base font-semibold text-text-primary">{title}</h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-surface-raised border border-border px-3 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-text-muted">Current Streak:</span>
            <span className="text-amber-400 font-bold">{currentStreak} Days</span>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-raised border border-border px-3 py-1 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-text-muted">Longest:</span>
            <span className="text-cyan-400 font-bold">{longestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Outer Horizontal Scroll Container */}
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="inline-block min-w-full">
          {/* Month Header Row */}
          <div className="flex text-[10px] font-mono text-text-muted mb-1.5 pl-7 relative h-4">
            {monthHeaders.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${28 + m.colIndex * 13.5}px` }}
              >
                {m.month}
              </span>
            ))}
          </div>

          {/* Grid with Day of Week Labels */}
          <div className="flex items-start gap-1">
            {/* Day Labels Column (Mon, Wed, Fri) */}
            <div className="flex flex-col text-[9px] font-mono text-text-muted justify-between h-[96px] pr-1.5 pt-0.5 shrink-0">
              <span className="h-[11px] leading-[11px]"></span>
              <span className="h-[11px] leading-[11px]">Mon</span>
              <span className="h-[11px] leading-[11px]"></span>
              <span className="h-[11px] leading-[11px]">Wed</span>
              <span className="h-[11px] leading-[11px]"></span>
              <span className="h-[11px] leading-[11px]">Fri</span>
              <span className="h-[11px] leading-[11px]"></span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[2.5px] shrink-0">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[2.5px]">
                  {Array.from({ length: 7 }).map((_, dIdx) => {
                    const dayItem = week.days.find((d) => d.dayOfWeek === dIdx);
                    if (!dayItem) {
                      return <div key={dIdx} className="w-[11px] h-[11px] rounded-[2px] opacity-0" />;
                    }

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            date: dayItem.date,
                            count: dayItem.count,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={cn(
                          "w-[11px] h-[11px] rounded-[2px] border transition-transform duration-100 hover:scale-150 hover:z-20 cursor-pointer",
                          getCellColor(dayItem.count)
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y}px`, transform: "translate(-50%, -100%)" }}
          className="fixed pointer-events-none z-50 bg-surface-raised border border-border shadow-xl px-2.5 py-1 rounded-md text-[11px] font-mono text-text-primary whitespace-nowrap animate-fade-in"
        >
          <span className="text-cyan-400 font-bold">{hoveredDay.count}</span>{" "}
          {hoveredDay.count === 1 ? "activity" : "activities"} on{" "}
          <span className="text-text-secondary">{hoveredDay.date}</span>
        </div>
      )}

      {/* Bottom Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-text-muted pt-2 border-t border-border">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-text-primary">
            <strong className="text-cyan-400">{totalActivities}</strong> total contributions in the last year
          </span>
          <span className="text-text-muted">•</span>
          <span>
            <strong className="text-emerald-400">{activeDaysCount}</strong> active practice days
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-surface-raised/70 border border-border/40" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950/80 border border-emerald-800/60" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700/80 border border-emerald-600/70" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 border border-emerald-400" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-300" />
          <span>More</span>
        </div>
      </div>
    </Card>
  );
};
