import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn("animate-pulse bg-surface-raised/80 rounded-md", className)} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex gap-4 border-b border-border pb-3">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2 border-b border-border/40">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 flex-1" />
        </div>
      ))}
    </div>
  );
};
