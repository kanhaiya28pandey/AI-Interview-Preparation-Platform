import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ToolbarProps {
  children?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  align?: "between" | "start" | "end";
  className?: string;
  variant?: "flat" | "card" | "transparent";
}

/**
 * Standardized Toolbar component for page controls, filters, and action buttons.
 * Enforces consistent control height (h-10 / h-9), items-center baseline alignment,
 * and responsive flex wrapping with container queries.
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  children,
  left,
  right,
  align = "between",
  className,
  variant = "transparent",
}) => {
  const isBetween = align === "between" || Boolean(left && right);

  return (
    <div
      className={cn(
        "@container w-full transition-colors",
        variant === "card" && "p-3 @md:p-4 bg-surface border border-border rounded-2xl shadow-2xs",
        variant === "flat" && "p-2.5 bg-surface-raised border border-border rounded-xl",
        isBetween
          ? "flex flex-col @md:flex-row @md:items-center justify-between gap-3"
          : cn("flex flex-wrap items-center gap-2.5 @md:gap-3", align === "end" ? "justify-end" : "justify-start"),
        className
      )}
    >
      {left && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
          {left}
        </div>
      )}

      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {children}
        </div>
      )}

      {right && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 self-start @md:self-center">
          {right}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
