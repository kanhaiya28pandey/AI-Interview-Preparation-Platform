import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  max?: number;
  color?: "gold" | "accent" | "cyan" | "live" | "danger";
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, color = "accent", className, ...props }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    gold: "bg-gradient-to-r from-teal-500 to-cyan-400",
    accent: "bg-gradient-to-r from-teal-500 to-cyan-400",
    cyan: "bg-gradient-to-r from-teal-500 to-cyan-400",
    live: "bg-live",
    danger: "bg-danger",
  };

  return (
    <div className={cn("w-full h-2 bg-surface-raised border border-border rounded-full overflow-hidden", className)} {...props}>
      <div
        className={cn("h-full transition-all duration-300 ease-out rounded-full", colors[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
