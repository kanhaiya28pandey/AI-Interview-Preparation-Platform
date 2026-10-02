import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Keyboard, Command } from "lucide-react";

export const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shortcuts = [
    { keys: ["Ctrl", "K"], label: "Open Role-aware Command Palette" },
    { keys: ["Ctrl", "B"], label: "Toggle Sidebar (Expand / Collapse)" },
    { keys: ["?"], label: "Show Keyboard Shortcuts Dialog" },
    { keys: ["Esc"], label: "Close Active Modals or Tooltips" },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Keyboard Shortcuts"
      description="Quick reference for platform shortcuts"
    >
      <div className="space-y-3 font-sans text-xs">
        <div className="p-3 bg-surface-raised border border-border rounded-xl flex items-center gap-2 text-cyan-400 font-mono text-xs">
          <Keyboard className="w-4 h-4" />
          <span>Press any key combination below while in the platform:</span>
        </div>

        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 hover:bg-surface-raised/50 transition-colors">
              <span className="text-text-primary font-medium">{s.label}</span>
              <div className="flex items-center gap-1 font-mono">
                {s.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="bg-surface-raised border border-border text-cyan-400 text-[11px] px-2 py-0.5 rounded shadow-xs font-semibold"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
};
