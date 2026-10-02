import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, History, RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ContentItem } from "@/services/contentManagerService";

interface VersionHistoryModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (versionNumber: number) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  item,
  isOpen,
  onClose,
  onRestore,
}) => {
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item || typeof document === "undefined") return null;

  const versions: any[] = item.versions || [];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-history-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-surface border border-border rounded-none sm:rounded-2xl w-full max-w-2xl h-dvh sm:h-auto sm:max-h-[85dvh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border flex items-center justify-between bg-surface-raised shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 id="version-history-modal-title" className="text-sm font-bold text-text-primary truncate">Version History</h3>
              <p className="text-xs text-text-muted truncate">
                Showing last {Math.min(5, versions.length)} saved snapshots for "{item.title}"
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close version history"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Version Banner */}
        <div className="p-3.5 sm:p-4 bg-cyan-500/10 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-cyan-300">
              Current Live Version: v{item.version}
            </span>
          </div>
          <span className="text-text-muted font-mono text-[11px]">
            Last Updated: {new Date(item.updatedAt).toLocaleString()}
          </span>
        </div>

        {/* Versions List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
          <ErrorBoundary isModal onReset={onClose}>
          {versions.length === 0 ? (
            <div className="text-center py-10 text-xs text-text-muted">
              No previous version snapshots available. Snapshots are automatically recorded when content is edited.
            </div>
          ) : (
            versions
              .slice()
              .reverse()
              .map((snap, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 bg-surface-raised border border-border rounded-xl flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-text-primary">Version {snap.version || idx + 1}</span>
                      <span className="text-[11px] text-text-muted font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {snap.savedAt ? new Date(snap.savedAt).toLocaleString() : "Previous snapshot"}
                      </span>
                    </div>
                    <p className="text-text-muted text-[11px] truncate max-w-md">
                      Title: {snap.title} • Difficulty: {snap.difficulty}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onRestore(snap.version || idx + 1);
                      onClose();
                    }}
                    className="text-xs border-border hover:bg-surface text-cyan-400 flex items-center gap-1.5 shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </Button>
                </div>
              ))
          )}
          </ErrorBoundary>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-surface-raised flex justify-end shrink-0">
          <Button onClick={onClose} className="bg-surface hover:bg-surface border border-border text-xs px-4">
            Done
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
