import React from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend, className }) => {
  return (
    <Card className={cn("relative overflow-hidden group", className)}>
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono uppercase tracking-wider text-text-muted truncate">{title}</p>
          <h3 className="font-serif text-3xl font-semibold text-text-primary mt-1 truncate">{value}</h3>
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
          <div className="p-3 bg-surface-raised border border-border rounded-lg text-cyan-400 group-hover:border-cyan-400/40 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
};
