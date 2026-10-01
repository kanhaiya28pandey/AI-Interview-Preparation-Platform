import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Sparkles } from "lucide-react";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { useNavigate } from "react-router-dom";

export const AIHelperBubble: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const reduced = useReducedEffects();
  const navigate = useNavigate();

  useEffect(() => {
    // If dismissed in this session, don't show
    if (sessionStorage.getItem("ai_helper_dismissed") === "true") {
      setDismissed(true);
      return;
    }

    let inactivityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setVisible(true);
      }, 10000); // 10 seconds of inactivity
    };

    resetTimer();

    window.addEventListener("mousemove", resetTimer, { passive: true });
    window.addEventListener("keydown", resetTimer, { passive: true });
    window.addEventListener("click", resetTimer, { passive: true });

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [dismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("ai_helper_dismissed", "true");
  };

  const handleOpenHelp = () => {
    setVisible(false);
    // Dispatch Command Palette shortcut
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  };

  if (!visible || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.9 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 15, scale: 0.9 }}
        className="fixed bottom-22 right-6 z-30 flex items-center gap-2 max-w-[280px]"
      >
        <div
          onClick={handleOpenHelp}
          className="group relative cursor-pointer p-3 bg-surface/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-lg hover:border-cyan-400 transition-all flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 animate-bounce" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-text-primary flex items-center gap-1">
              AI Copilot <Sparkles className="w-3 h-3 text-cyan-400" />
            </p>
            <p className="text-[11px] text-text-secondary">Need a hint or quick search?</p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-text-muted hover:text-text-primary rounded-lg ml-1"
            title="Dismiss for session"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIHelperBubble;
