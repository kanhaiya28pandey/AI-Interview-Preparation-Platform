import React from "react";
import { X, History, RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  if (!isOpen || !item) return null;

  const versions: any[] = item.versions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-raised">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Version History</h3>
              <p className="text-xs text-text-muted">
                Showing last {Math.min(5, versions.length)} saved snapshots for "{item.title}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Version Banner */}
        <div className="p-4 bg-cyan-500/10 border-b border-cyan-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-cyan-300">
              Current Live Version: v{item.version}
            </span>
          </div>
          <span className="text-text-muted font-mono">
            Last Updated: {new Date(item.updatedAt).toLocaleString()}
          </span>
        </div>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
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
                  className="p-4 bg-surface-raised border border-border rounded-xl flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
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
                    className="text-xs border-border hover:bg-surface text-cyan-400 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </Button>
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-raised flex justify-end">
          <Button onClick={onClose} className="bg-surface hover:bg-surface border border-border text-xs px-4">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
