import React from "react";
import { Trash2, X, AlertCircle, ShieldAlert, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onDeactivateSelected?: () => void;
  skippedProtectedCount?: number;
  entityName?: string;
  isDeleting?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onDeactivateSelected,
  skippedProtectedCount = 0,
  entityName = "accounts",
  isDeleting = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.15 }}
        className="sticky bottom-6 z-30 mx-auto max-w-4xl"
        role="region"
        aria-label="Bulk actions toolbar"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5 bg-surface-raised/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl text-text-primary">
          {/* Selected Count & Notes */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30">
                {selectedCount}
              </span>
              <span className="text-sm font-medium">
                {selectedCount} {selectedCount === 1 ? entityName.replace(/s$/, "") : entityName} selected
              </span>
            </div>

            {skippedProtectedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                {skippedProtectedCount} protected account{skippedProtectedCount > 1 ? "s were" : " was"} skipped
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {onDeactivateSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeactivateSelected}
                className="h-9 px-3 text-xs font-mono text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-400 gap-1.5"
              >
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>Deactivate</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteSelected}
              isLoading={isDeleting}
              className="h-9 px-3 text-xs font-mono text-rose-400 border-rose-500/40 hover:bg-rose-500/15 hover:border-rose-400 gap-1.5 focus-visible:ring-2 focus-visible:ring-rose-400"
              aria-label={`Delete ${selectedCount} selected ${entityName}`}
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Delete selected</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-9 px-2 text-xs font-mono text-text-muted hover:text-text-primary gap-1"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
