import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getRouteMeta, ACCENT_CONFIG } from "@/lib/routeMeta";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { cn } from "@/lib/utils";

export interface TopbarTitleProps {
  title?: string;
}

export const TopbarTitle: React.FC<TopbarTitleProps> = ({ title: propTitle }) => {
  const location = useLocation();
  const meta = getRouteMeta(location.pathname, propTitle);
  const reduced = useReducedEffects();
  const styles = ACCENT_CONFIG[meta.accent] || ACCENT_CONFIG.cyan;
  const Icon = meta.icon;

  const displayTitle = propTitle || meta.title;

  return (
    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
      {/* 1) Page Icon Chip */}
      <div
        className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5",
          styles.chip
        )}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      </div>

      {/* 2) Breadcrumb + Highlighted Title Block */}
      <div className="min-w-0 flex-1">
        {/* Small Breadcrumb Line on Top (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted leading-tight mb-0.5 truncate">
          <Link
            to={meta.parentLink}
            className="hover:text-text-primary transition-colors focus:outline-none focus:underline"
          >
            {meta.breadcrumbParent}
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-text-secondary truncate">{meta.breadcrumbChild}</span>
        </div>

        {/* Title Row + Role Pill */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="font-serif font-bold tracking-tight text-lg sm:text-xl leading-tight truncate max-w-[180px] sm:max-w-[280px] md:max-w-[420px] lg:max-w-none"
            title={displayTitle}
            aria-current="page"
          >
            <span className="sr-only">Current Section: </span>
            <span className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-900 dark:from-cyan-300 dark:via-teal-100 dark:to-white bg-clip-text text-transparent">
              {displayTitle}
            </span>
          </div>

          {/* Role Pill */}
          <span
            className={cn(
              "hidden sm:inline-flex items-center font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 transition-colors uppercase tracking-wider",
              meta.role === "ADMIN"
                ? "bg-violet-500/10 dark:bg-violet-400/15 border-violet-500/25 dark:border-violet-400/30 text-violet-700 dark:text-violet-300"
                : "bg-cyan-500/10 dark:bg-cyan-400/15 border-cyan-500/25 dark:border-cyan-400/30 text-cyan-700 dark:text-cyan-300"
            )}
          >
            {meta.role}
          </span>
        </div>

        {/* 3) Short Animated Accent Underline (28px - 40px) */}
        <div className="w-7 sm:w-10 h-[2px] mt-0.5 overflow-hidden rounded-full">
          {reduced ? (
            <div className={cn("w-full h-full bg-gradient-to-r", styles.underline)} />
          ) : (
            <motion.div
              key={location.pathname}
              initial={{ scaleX: 0.3, opacity: 0.5 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ originX: 0 }}
              className={cn("w-full h-full bg-gradient-to-r rounded-full", styles.underline)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TopbarTitle;
