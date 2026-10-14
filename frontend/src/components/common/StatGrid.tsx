import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export interface MetricTileProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  subValue?: ReactNode;
  accent?: "cyan" | "violet" | "emerald" | "amber" | "rose";
  className?: string;
  onClick?: () => void;
}

const ACCENT_COLOR_MAP = {
  cyan: "text-cyan-600 dark:text-cyan-400 border-cyan-500/25 bg-cyan-500/10",
  violet: "text-violet-600 dark:text-violet-400 border-violet-500/25 bg-violet-500/10",
  emerald: "text-emerald-600 dark:text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  amber: "text-amber-600 dark:text-amber-400 border-amber-500/25 bg-amber-500/10",
  rose: "text-rose-600 dark:text-rose-400 border-rose-500/25 bg-rose-500/10",
};

/**
 * Standardized responsive container-query grid for statistics and metrics.
 */
export const StatGrid: React.FC<StatGridProps> = ({ children, columns = 4, className }) => {
  const colClass =
    columns === 2
      ? "grid-cols-1 @sm:grid-cols-2"
      : columns === 3
      ? "grid-cols-1 @sm:grid-cols-3"
      : columns === 5
      ? "grid-cols-2 @md:grid-cols-3 @xl:grid-cols-5"
      : "grid-cols-2 @lg:grid-cols-4";

  return (
    <div className={cn("@container w-full grid gap-3 @md:gap-4", colClass, className)}>
      {children}
    </div>
  );
};

/**
 * Standardized equal-height StatTile with clean left alignment, uppercase mono label,
 * bold tabular-nums value, and optional icon.
 */
export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  icon: Icon,
  subValue,
  accent = "cyan",
  className,
  onClick,
}) => {
  const accentStyle = ACCENT_COLOR_MAP[accent] || ACCENT_COLOR_MAP.cyan;

  return (
    <div
      onClick={onClick}
      className={cn(
        "h-full p-4 sm:p-4.5 bg-surface border border-border rounded-xl shadow-2xs flex flex-col justify-between transition-all",
        onClick && "cursor-pointer hover:border-accent hover:bg-surface-raised",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold truncate">
          {label}
        </span>
        {Icon && (
          <div className={cn("p-1.5 rounded-lg border shrink-0", accentStyle)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className="text-2xl sm:text-2xl font-bold tabular-nums text-text-primary leading-tight">
          {value}
        </div>
        {subValue && (
          <div className="mt-1 text-xs text-text-secondary leading-snug">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatGrid;
