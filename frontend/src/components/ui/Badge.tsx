import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "easy" | "medium" | "hard" | "gold" | "accent" | "active" | "blocked" | "admin" | "student" | "outline" | "live" | "danger";
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = "outline", ...props }) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase";

  const variants = {
    easy: "bg-emerald-500/15 text-emerald-700 dark:text-[#4ade80] dark:bg-[#4ade80]/12 border border-emerald-500/30 dark:border-[#4ade80]/30 font-semibold dark:font-medium",
    medium: "bg-cyan-500/15 text-cyan-800 dark:text-[#22d3ee] dark:bg-[#22d3ee]/12 border border-cyan-500/30 dark:border-[#22d3ee]/30 font-semibold dark:font-medium",
    hard: "bg-rose-500/15 text-rose-700 dark:text-[#f2867b] dark:bg-[#f2867b]/12 border border-rose-500/30 dark:border-[#f2867b]/30 font-semibold dark:font-medium",
    gold: "bg-cyan-500/15 text-cyan-800 dark:text-[#22d3ee] dark:bg-[#22d3ee]/12 border border-cyan-500/30 dark:border-[#22d3ee]/30 font-semibold dark:font-medium",
    accent: "bg-teal-500/15 text-teal-800 dark:text-[#22d3ee] dark:bg-[#14b8a6]/12 border border-teal-500/30 dark:border-[#22d3ee]/30 font-semibold dark:font-medium",
    active: "bg-emerald-500/15 text-emerald-700 dark:text-[#4ade80] dark:bg-[#4ade80]/12 border border-emerald-500/30 dark:border-[#4ade80]/30 font-semibold dark:font-medium",
    blocked: "bg-rose-500/15 text-rose-700 dark:text-[#f2867b] dark:bg-[#f2867b]/12 border border-rose-500/30 dark:border-[#f2867b]/30 font-semibold dark:font-medium",
    admin: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 font-semibold dark:font-medium",
    student: "bg-cyan-500/15 text-cyan-800 dark:text-[#22d3ee] dark:bg-[#22d3ee]/12 border border-cyan-500/30 dark:border-[#22d3ee]/30 font-semibold dark:font-medium",
    outline: "bg-surface-raised text-text-secondary border border-border font-semibold dark:font-medium",
    live: "bg-emerald-500/20 text-emerald-700 dark:text-[#4ade80] dark:bg-[#4ade80]/20 border border-emerald-500/40 dark:border-[#4ade80]/40 font-bold",
    danger: "bg-rose-500/15 text-rose-700 dark:text-[#f2867b] dark:bg-[#f2867b]/15 border border-rose-500/30 dark:border-[#f2867b]/30 font-semibold dark:font-medium",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
