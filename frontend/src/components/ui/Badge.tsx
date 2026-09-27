import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "easy" | "medium" | "hard" | "gold" | "accent" | "active" | "blocked" | "admin" | "student" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = "outline", ...props }) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase";

  const variants = {
    easy: "bg-[#4ade80]/12 text-[#4ade80] border border-[#4ade80]/30",
    medium: "bg-[#22d3ee]/12 text-[#22d3ee] border border-[#22d3ee]/30",
    hard: "bg-[#f2867b]/12 text-[#f2867b] border border-[#f2867b]/30",
    gold: "bg-[#22d3ee]/12 text-[#22d3ee] border border-[#22d3ee]/30",
    accent: "bg-[#14b8a6]/12 text-[#22d3ee] border border-[#22d3ee]/30",
    active: "bg-[#4ade80]/12 text-[#4ade80] border border-[#4ade80]/30",
    blocked: "bg-[#f2867b]/12 text-[#f2867b] border border-[#f2867b]/30",
    admin: "bg-teal-500/12 text-teal-600 dark:text-cyan-400 border border-teal-500/30",
    student: "bg-[#22d3ee]/12 text-[#22d3ee] border border-[#22d3ee]/30",
    outline: "bg-surface-raised text-text-secondary border border-border",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
