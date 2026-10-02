import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  BookOpen,
  Code2,
  Video,
  HelpCircle,
  FileText,
  Trophy,
  User,
  Settings,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const GlobalCommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const COMMAND_ITEMS = [
    { label: "Dashboard", category: "Navigation", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Practice Tracks", category: "Navigation", icon: BookOpen, path: "/practice" },
    { label: "Coding Arena", category: "Navigation", icon: Code2, path: "/coding" },
    { label: "AI Mock Interview", category: "Navigation", icon: Video, path: "/mock-interview" },
    { label: "MCQ Quizzes", category: "Navigation", icon: HelpCircle, path: "/quizzes" },
    { label: "Resume Analyzer", category: "Navigation", icon: FileText, path: "/resume" },
    { label: "Leaderboard", category: "Navigation", icon: Trophy, path: "/leaderboard" },
    { label: "My Profile", category: "Navigation", icon: User, path: "/profile" },
    { label: "Settings", category: "Navigation", icon: Settings, path: "/settings" },
    { label: "Start Mock Interview Room", category: "Quick Action", icon: Sparkles, path: "/mock-interview" },
    { label: "Upload & Analyze Resume", category: "Quick Action", icon: FileText, path: "/resume" },
    { label: "Solve Two Sum Target Match", category: "Coding Problem", icon: Code2, path: "/coding" },
  ];

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: typeof COMMAND_ITEMS[0]) => {
    setIsOpen(false);
    setQuery("");
    navigate(item.path);
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Global Command Palette (Ctrl+K)" description="Quick jump to pages, problems, and AI tools.">
      <div className="space-y-4 text-xs font-sans">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-cyan-400" />
          <Input
            placeholder="Type a command, page name, or problem title..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
            className="pl-9 py-2.5 text-xs font-mono"
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-text-muted">No matching commands found.</div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors",
                    isSelected
                      ? "bg-cyan-400/15 text-cyan-400 border-cyan-400/40 font-bold"
                      : "bg-surface-raised border-border text-text-primary hover:bg-surface-raised/80"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted uppercase px-2 py-0.5 rounded bg-surface border border-border">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
};
