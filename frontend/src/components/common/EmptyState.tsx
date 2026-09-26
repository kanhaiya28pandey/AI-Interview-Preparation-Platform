import React from "react";
import { Button } from "@/components/ui/Button";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-dashed border-border rounded-xl">
      <div className="p-4 bg-surface-raised border border-border rounded-full text-cyan-400 mb-4">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="font-serif text-lg font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="teal-cyan" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
