import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@/components/ui/Dialog";
import { Search, LayoutDashboard, BookOpen, Code2, Video, HelpCircle, FileText, Trophy, User, Settings, Shield, PanelLeftClose, GraduationCap } from "lucide-react";

interface CommandItem {
  label: string;
  path?: string;
  action?: () => void;
  icon: any;
  category: string;
  badge?: string;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

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

  const commands: CommandItem[] = [
    {
      label: "Toggle sidebar",
      action: () => window.dispatchEvent(new CustomEvent("toggle-sidebar")),
      icon: PanelLeftClose,
      category: "Action",
      badge: "Ctrl+B",
    },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, category: "Student" },
    { label: "Practice Tracks", path: "/practice", icon: BookOpen, category: "Student" },
    { label: "Resume Analyzer (AI ATS)", path: "/resume-analyzer", icon: FileText, category: "Student" },
    { label: "Coding Arena", path: "/coding", icon: Code2, category: "Student" },
    { label: "Mock Interview", path: "/mock-interview", icon: Video, category: "Student" },
    { label: "MCQ Quizzes", path: "/quiz", icon: HelpCircle, category: "Student" },
    { label: "Placement Guides & Articles", path: "/articles", icon: FileText, category: "Student" },
    { label: "Campus Leaderboard", path: "/leaderboard", icon: Trophy, category: "Student" },
    { label: "My Profile", path: "/profile", icon: User, category: "Student" },
    { label: "Settings", path: "/settings", icon: Settings, category: "Student" },
    { label: "Help & Support Center", path: "/help", icon: HelpCircle, category: "Student" },
    { label: "Submit Support Ticket", path: "/help?tab=contact", icon: HelpCircle, category: "Student" },
    { label: "Admin Student Progress Roster", path: "/admin/students", icon: GraduationCap, category: "Admin" },
    { label: "Admin Class Cohort Analytics", path: "/admin/students", icon: GraduationCap, category: "Admin" },
    { label: "Admin Overview", path: "/admin", icon: Shield, category: "Admin" },
    { label: "Admin Help Center", path: "/admin/help", icon: Shield, category: "Admin" },
    { label: "Admin User Management", path: "/admin/users", icon: User, category: "Admin" },
  ];

  const filtered = commands.filter((r) =>
    r.label.toLowerCase().includes(query.toLowerCase()) ||
    (r.path && r.path.toLowerCase().includes(query.toLowerCase())) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    setQuery("");
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Quick Jump (Command Palette)" zIndexClass="z-[80]">
      <div className="space-y-4">
        <div className="relative sticky top-0 z-10 bg-surface pb-2">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type a command or jump to page... (e.g. Toggle sidebar, Coding, Admin)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-4 py-3 bg-surface-raised border border-border rounded-xl text-text-primary placeholder:text-text-muted text-xs font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-text-muted">No matching commands found.</p>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path || item.label || idx}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-surface border border-border/60 hover:border-cyan-400/50 hover:bg-surface-raised transition-colors group text-left"
                >
                  <div className="flex items-center gap-3 text-text-primary group-hover:text-cyan-400">
                    <Icon className="w-4 h-4 text-text-muted group-hover:text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/30">
                      {item.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
                      {item.path}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
};

