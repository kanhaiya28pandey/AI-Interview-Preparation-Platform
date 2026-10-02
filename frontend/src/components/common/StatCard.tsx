import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/fx/AnimatedCounter";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  /** Explicit suffix to append after the animated number (e.g. " Days", "%") */
  suffix?: string;
  /** Explicit prefix to prepend before the animated number */
  prefix?: string;
  /** If true, animate numeric portion of `value` with AnimatedCounter */
  animateValue?: boolean;
  accentColor?: "cyan" | "green" | "amber" | "rose" | "purple";
}

const accentMap = {
  cyan:   { bg: "bg-cyan-400/10",   border: "border-cyan-400/30",   text: "text-cyan-400",   glow: "shadow-[0_0_18px_rgba(34,211,238,0.15)]" },
  green:  { bg: "bg-green-400/10",  border: "border-green-400/30",  text: "text-green-400",  glow: "shadow-[0_0_18px_rgba(74,222,128,0.15)]" },
  amber:  { bg: "bg-amber-400/10",  border: "border-amber-400/30",  text: "text-amber-400",  glow: "shadow-[0_0_18px_rgba(251,191,36,0.15)]" },
  rose:   { bg: "bg-rose-400/10",   border: "border-rose-400/30",   text: "text-rose-400",   glow: "shadow-[0_0_18px_rgba(251,113,133,0.15)]" },
  purple: { bg: "bg-purple-400/10", border: "border-purple-400/30", text: "text-purple-400", glow: "shadow-[0_0_18px_rgba(192,132,252,0.15)]" },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  animateValue = true,
  accentColor = "cyan",
  suffix: suffixProp,
  prefix: prefixProp,
}) => {
  const accent = accentMap[accentColor];

  // Parse numeric portion from value for AnimatedCounter
  const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
  const parsedPrefix = typeof value === "string" ? (String(value).match(/^[^0-9]*/)?.[0] ?? "") : "";
  const parsedSuffix = typeof value === "string" ? (String(value).match(/[^0-9.]+$/)?.[0] ?? "") : "";
  const prefix = prefixProp ?? parsedPrefix;
  const suffix = suffixProp ?? parsedSuffix;
  const canAnimate = animateValue && !isNaN(numericValue) && isFinite(numericValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Card
        className={cn(
          "relative overflow-hidden group transition-all duration-300 spotlight-card",
          "hover:border-cyan-400/30 hover:scale-[1.015]",
          className
        )}
      >
        {/* Shimmer sweep on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"
        />

        <div className="flex items-start justify-between gap-3 min-w-0 relative z-20">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted truncate">{title}</p>
            <h3 className={cn("font-serif text-3xl font-semibold mt-1 truncate", accent.text)}>
              {canAnimate ? (
                <AnimatedCounter
                  value={numericValue}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={numericValue % 1 !== 0 ? 1 : 0}
                />
              ) : (
                value
              )}
            </h3>
            {subtitle && <p className="text-xs text-text-secondary mt-1 truncate">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2 text-xs font-mono">
                <span className={trend.isPositive ? "text-live" : "text-danger"}>
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
                <span className="text-text-muted">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "p-3 rounded-xl border transition-all duration-300",
                accent.bg, accent.border, accent.text,
                "group-hover:" + accent.glow
              )}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
