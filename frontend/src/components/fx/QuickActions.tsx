import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import {
  Sparkles,
  X,
  Code2,
  Video,
  FileText,
  FileCheck2,
  Layers,
  HelpCircle,
  Plus,
  BarChart3,
  Bot,
} from "lucide-react";

export const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const reduced = useReducedEffects();

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  const studentActions = [
    { label: "Mock Interview", icon: Video, path: "/mock-interview", color: "text-cyan-400 bg-cyan-500/10" },
    { label: "Coding Arena", icon: Code2, path: "/coding", color: "text-violet-400 bg-violet-500/10" },
    { label: "Take Quiz", icon: Layers, path: "/quiz", color: "text-amber-400 bg-amber-500/10" },
    { label: "Analyze Resume", icon: FileText, path: "/resume-analyzer", color: "text-emerald-400 bg-emerald-500/10" },
  ];

  const adminActions = [
    { label: "Content Manager", icon: Plus, path: "/admin/content", color: "text-cyan-400 bg-cyan-500/10" },
    { label: "Verify Students", icon: FileCheck2, path: "/admin/verifications", color: "text-amber-400 bg-amber-500/10" },
    { label: "Coding Benchmarks", icon: Code2, path: "/admin/coding-tests", color: "text-violet-400 bg-violet-500/10" },
    { label: "Analytics & Reports", icon: BarChart3, path: "/admin/reports", color: "text-emerald-400 bg-emerald-500/10" },
  ];

  const actions = isAdmin ? adminActions : studentActions;

  const handleSelect = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 15 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-3 p-2 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-soft-drop space-y-1 w-52 max-w-[calc(100vw-3rem)]"
          >
            <div className="px-3 py-1.5 border-b border-border/50 text-[10px] font-mono uppercase tracking-wider text-text-muted">
              {isAdmin ? "Admin Shortcuts" : "Quick Launch"}
            </div>
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.path}
                  onClick={() => handleSelect(act.path)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-primary hover:bg-surface-raised rounded-xl transition-colors text-left font-medium group"
                >
                  <span className={`p-1.5 rounded-lg ${act.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span>{act.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Quick Actions Menu"
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 ${
          isOpen
            ? "bg-surface-raised text-text-primary border border-border"
            : "bg-gradient-to-r from-accent to-accent-bright text-ink shadow-[0_0_20px_var(--accent-glow)]"
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Sparkles className="w-5 h-5 animate-pulse" />
        )}
      </button>
    </div>
  );
};

export default QuickActions;
