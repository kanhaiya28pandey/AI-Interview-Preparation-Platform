import React from "react";
import { cn } from "@/lib/utils";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl p-5 shadow-sm transition-all duration-200 hover:border-border-strong hover:shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
