import React from "react";
import { ShieldCheck, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoleBadgeProps {
  role?: string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role = "STUDENT",
  size = "sm",
  className = "",
  showIcon = true,
}) => {
  const normalizedRole = (role || "STUDENT").toUpperCase();
  const isAdmin = normalizedRole.includes("ADMIN");

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px] gap-1 font-mono",
    sm: "px-2 py-0.5 text-[10px] gap-1 font-mono",
    md: "px-2.5 py-1 text-xs gap-1.5 font-mono",
  }[size];

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
  }[size];

  if (isAdmin) {
    return (
      <span
        className={cn(
          "inline-flex items-center font-bold tracking-wider rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 select-none shadow-xs",
          sizeClasses,
          className
        )}
        title="Role: Administrator"
      >
        {showIcon && <ShieldCheck className={cn(iconSizes, "text-purple-400 shrink-0")} />}
        <span>ADMIN</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold tracking-wider rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 select-none shadow-xs",
        sizeClasses,
        className
      )}
      title="Role: Enrolled Student"
    >
      {showIcon && <GraduationCap className={cn(iconSizes, "text-cyan-400 shrink-0")} />}
      <span>STUDENT</span>
    </span>
  );
};
