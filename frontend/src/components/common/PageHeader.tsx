import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PageHeaderAccent = "cyan" | "violet" | "emerald" | "amber" | "rose";

export interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  actionsPlacement?: "right" | "below" | "auto";
  accent?: PageHeaderAccent;
  className?: string;
}

export const ACCENT_STYLES: Record<
  PageHeaderAccent,
  {
    iconBox: string;
    icon: string;
    badge: string;
    highlight: string;
  }
> = {
  cyan: {
    iconBox: "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/25 dark:border-cyan-400/30 text-cyan-600 dark:text-cyan-400",
    icon: "text-cyan-600 dark:text-cyan-400",
    badge: "bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25 dark:border-cyan-400/30",
    highlight: "text-cyan-700 dark:text-cyan-300 font-semibold",
  },
  violet: {
    iconBox: "bg-violet-500/10 dark:bg-violet-500/15 border-violet-500/25 dark:border-violet-400/30 text-violet-600 dark:text-violet-400",
    icon: "text-violet-600 dark:text-violet-400",
    badge: "bg-violet-500/10 dark:bg-violet-400/10 text-violet-700 dark:text-violet-300 border-violet-500/25 dark:border-violet-400/30",
    highlight: "text-violet-700 dark:text-violet-300 font-semibold",
  },
  emerald: {
    iconBox: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-400",
    icon: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-400/30",
    highlight: "text-emerald-700 dark:text-emerald-300 font-semibold",
  },
  amber: {
    iconBox: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 dark:border-amber-400/30 text-amber-600 dark:text-amber-400",
    icon: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border-amber-500/25 dark:border-amber-400/30",
    highlight: "text-amber-700 dark:text-amber-300 font-semibold",
  },
  rose: {
    iconBox: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25 dark:border-rose-400/30 text-rose-600 dark:text-rose-400",
    icon: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-500/10 dark:bg-rose-400/10 text-rose-700 dark:text-rose-300 border-rose-500/25 dark:border-rose-400/30",
    highlight: "text-rose-700 dark:text-rose-300 font-semibold",
  },
};

/**
 * Reusable inline text highlight for counts, numbers, and key metrics.
 */
export const Highlight: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <span className={cn("text-teal-700 dark:text-cyan-300 font-semibold", className)}>
      {children}
    </span>
  );
};

export const PageHeaderHighlight = Highlight;

/**
 * Reusable right-slot stat tile matching the reference Roadmaps tile.
 */
export interface StatTileProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  accent?: PageHeaderAccent;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  icon: Icon,
  accent = "cyan",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 shadow-2xs shrink-0 transition-colors h-11",
        className
      )}
    >
      {Icon && (
        <div className={cn("shrink-0", (ACCENT_STYLES[accent] ?? ACCENT_STYLES.cyan).icon)}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="text-left min-w-0">
        <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold truncate">
          {label}
        </div>
        <div className="text-xs sm:text-sm font-bold text-text-primary tabular-nums mt-0.5">
          {value}
        </div>
      </div>
    </div>
  );
};

/**
 * Single shared PageHeader component used across all student and admin pages.
 * Responsive container-query glass card with left icon chip, bold serif title, optional badge,
 * mandatory subtitle, optional meta chips, and an optional slot for actions or stat tiles.
 * Supports actionsPlacement="below" to prevent wide tab bars from stealing title width.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  meta,
  actions,
  actionsPlacement = "auto",
  accent = "cyan",
  className,
}) => {
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.cyan;
  const isBelow = actionsPlacement === "below";

  return (
    <div
      className={cn(
        "@container relative rounded-2xl border border-border bg-surface/95 dark:bg-surface/80 backdrop-blur-md p-4 @md:p-6 shadow-soft transition-colors duration-200",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4",
          !isBelow && "@xl:flex-row @xl:items-center @xl:justify-between @xl:gap-6"
        )}
      >
        {/* Left Section: Icon chip + Title & Badge + Subtitle + Meta */}
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div
            className={cn(
              "h-11 w-11 sm:h-12 sm:w-12 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-colors mt-0.5",
              styles.iconBox
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title Row with Badge */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h1 className="font-serif font-bold tracking-tight text-text-primary text-xl sm:text-2xl @lg:text-3xl leading-tight">
                {title}
              </h1>

              {badge && (
                <span
                  className={cn(
                    "font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 transition-colors",
                    styles.badge
                  )}
                >
                  {badge}
                </span>
              )}
            </div>

            {/* Subtitle / Description - Aligned with title's left edge */}
            <p className="mt-1.5 text-xs sm:text-sm @md:text-[15px] leading-relaxed text-text-secondary max-w-3xl">
              {subtitle}
            </p>

            {/* Optional Meta Chips */}
            {meta && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {meta}
              </div>
            )}
          </div>
        </div>

        {/* Actions slot: on wide, sits on the right, vertically centered; on narrow, drops below */}
        {actions && !isBelow && (
          <div className="shrink-0 w-full @xl:w-auto flex flex-wrap items-center justify-start @xl:justify-end gap-2.5 sm:gap-3 [&>button]:w-full @sm:[&>button]:w-auto @xl:[&>button]:w-auto [&>a]:w-full @sm:[&>a]:w-auto @xl:[&>a]:w-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Wide controls (tab bars, segmented controls, more than 3 buttons) row below */}
      {actions && isBelow && (
        <div className="w-full pt-3.5 border-t border-border/50 flex flex-wrap items-center justify-start gap-2.5 sm:gap-3 overflow-x-auto tablist-scroll-container">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * Standardized SectionHeading for inner-page second-level titles (h2/h3),
 * ensuring visual hierarchy across pages without competing with the main h1.
 */
export interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  as?: "h2" | "h3";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  action,
  icon: Icon,
  as: Component = "h2",
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4", className)}>
      <div>
        <Component className="font-serif font-semibold text-lg sm:text-xl text-text-primary flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-cyan-500 dark:text-cyan-400 shrink-0" />}
          <span>{title}</span>
        </Component>
        {description && (
          <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
