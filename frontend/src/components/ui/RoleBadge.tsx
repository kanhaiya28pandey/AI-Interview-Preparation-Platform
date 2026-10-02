import React from "react";
import { getRoleMeta } from "@/lib/roles";
import { cn } from "@/lib/utils";

export interface RoleBadgeProps {
  role?: string | null;
  size?: "xs" | "sm" | "md";
  showIconOnly?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = "sm",
  showIconOnly = false,
  iconOnly = false,
  className,
}) => {
  const meta = getRoleMeta(role);
  const Icon = meta.icon;
  const isOnlyIcon = showIconOnly || iconOnly;

  const sizeClasses =
    size === "md"
      ? "px-2.5 py-1 text-xs gap-1.5"
      : size === "xs"
      ? "px-1.5 py-0.2 text-[10px] gap-1"
      : "px-2 py-0.5 text-[11px] gap-1";

  const iconSize = size === "md" ? "w-3.5 h-3.5" : size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3";

  if (isOnlyIcon) {
    return (
      <span
        title={`Role: ${meta.label}`}
        aria-label={`Role: ${meta.label}`}
        className={cn(
          "inline-flex items-center justify-center p-1 rounded-full border shadow-xs transition-colors",
          meta.classes,
          className
        )}
      >
        <Icon className={iconSize} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-mono tracking-tight font-semibold uppercase shadow-xs select-none whitespace-nowrap",
        sizeClasses,
        meta.classes,
        className
      )}
    >
      <Icon className={cn(iconSize, "shrink-0")} />
      <span>{meta.label}</span>
    </span>
  );
};
