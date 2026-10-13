import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Shield,
  PanelLeftClose,
  Compass,
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  CornerDownLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useAuth } from "@/context/AuthContext";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { mockCodingProblems } from "@/mocks/codingData";
import { mockArticles } from "@/mocks/articleData";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  path?: string;
  action?: () => void;
  icon: any;
  category: "Pages & Features" | "Coding Challenges" | "Practice & Curriculum" | "Articles & Guides" | "Quick Actions";
  badge?: string;
  keywords?: string[];
}

const RECENT_SEARCHES_KEY = "ai_prep_recent_searches_v2";

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ["DSA", "Mock Interview", "System Design", "Resume Analyzer"];
    } catch {
      return ["DSA", "Mock Interview", "System Design", "Resume Analyzer"];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { domains } = useTaxonomy();
  const { status: verifStatus } = useVerificationStatus();

  const isVerified = isAdmin() || verifStatus === "Verified";

  // Open / Close keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setDebouncedQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search query (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setSelectedIndex(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // All indexed commands
  const allCommands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Primary Pages & Features
      {
        id: "page-dashboard",
        label: "Student Dashboard",
        description: "Overview of your readiness score, stats, and personalized daily goals",
        path: "/dashboard",
        icon: LayoutDashboard,
        category: "Pages & Features",
        badge: "Overview",
        keywords: ["home", "stats", "overview", "streak", "xp"],
      },
      {
        id: "page-preparation",
        label: "Prep Roadmaps",
        description: "Curated learning paths for Frontend, Backend, Full Stack & AI",
        path: "/preparation",
        icon: Compass,
        category: "Pages & Features",
        badge: "Roadmap",
        keywords: ["curriculum", "syllabus", "path", "guide"],
      },
      {
        id: "page-practice",
        label: "Practice Tracks",
        description: "Browse engineering domains, interview questions, and deep-dive answers",
        path: "/practice",
        icon: BookOpen,
        category: "Pages & Features",
        badge: "Practice",
        keywords: ["questions", "topics", "theory", "mcq"],
      },
      {
        id: "page-coding",
        label: "Coding Arena",
        description: "Interactive browser IDE to solve algorithm benchmarks and DSA problems",
        path: "/coding",
        icon: Code2,
        category: "Pages & Features",
        badge: "IDE",
        keywords: ["dsa", "leetcode", "algorithms", "problem", "solve", "code"],
      },
      {
        id: "page-mock-interview",
        label: "AI Mock Interview",
        description: "Simulated technical & behavioral interview rounds with instant AI evaluation",
        path: "/mock-interview",
        icon: Video,
        category: "Pages & Features",
        badge: "Live AI",
        keywords: ["interview", "mock", "voice", "behavioral", "star", "camera"],
      },
      {
        id: "page-resume-analyzer",
        label: "Resume Analyzer",
        description: "AI ATS scanner with keyword alignment and recruiter impact score",
        path: "/resume-analyzer",
        icon: FileText,
        category: "Pages & Features",
        badge: "ATS AI",
        keywords: ["resume", "cv", "ats", "score", "scanner"],
      },
      {
        id: "page-live-tests",
        label: "Live Tests & Contests",
        description: "Timed campus coding tests, scheduled contests, and placement simulations",
        path: "/live-tests",
        icon: Flame,
        category: "Pages & Features",
        badge: "Contests",
        keywords: ["test", "exam", "contest", "live", "timed"],
      },
      {
        id: "page-leaderboard",
        label: "Campus Leaderboard",
        description: "See college percentile rankings, top performers, and XP standings",
        path: "/leaderboard",
        icon: Trophy,
        category: "Pages & Features",
        badge: "Rankings",
        keywords: ["rank", "leaderboard", "xp", "score", "top"],
      },
      {
        id: "page-quizzes",
        label: "MCQ Quizzes",
        description: "Fast-paced multiple-choice placement quizzes with timers",
        path: "/quiz",
        icon: HelpCircle,
        category: "Pages & Features",
        badge: "Quiz",
        keywords: ["mcq", "quiz", "test", "quiz", "timed"],
      },
      {
        id: "page-articles",
        label: "Articles & Guides",
        description: "In-depth engineering masterclasses, system design cheat sheets, and tips",
        path: "/articles",
        icon: FileText,
        category: "Pages & Features",
        badge: "Guides",
        keywords: ["read", "blog", "articles", "system design", "tutorial"],
      },
      {
        id: "page-profile",
        label: "My Profile",
        description: "Manage your academic details, skills, social links, and avatar",
        path: "/profile",
        icon: User,
        category: "Pages & Features",
        keywords: ["account", "profile", "settings", "edit", "resume"],
      },
      {
        id: "page-settings",
        label: "Settings & Appearance",
        description: "Customize theme, dark mode, background effects, and preferences",
        path: "/settings",
        icon: Settings,
        category: "Pages & Features",
        keywords: ["theme", "dark mode", "light mode", "appearance", "config"],
      },
      {
        id: "page-help",
        label: "Help & Support Center",
        description: "Frequently asked questions, platform documentation, and contact support",
        path: "/help",
        icon: HelpCircle,
        category: "Pages & Features",
        keywords: ["support", "faq", "ticket", "contact", "issue"],
      },
    ];

    if (!isVerified) {
      items.unshift({
        id: "action-verify",
        label: "Verify Student ID (College ID Card)",
        description: "Upload your ID to unlock Mock Interviews, Coding Arena, and Contests",
        path: "/verify-identity",
        icon: Shield,
        category: "Quick Actions",
        badge: "Required",
        keywords: ["verify", "id", "college", "student", "unlock"],
      });
    }

    // Quick Actions
    items.push({
      id: "action-toggle-sidebar",
      label: "Toggle Sidebar",
      description: "Collapse or expand the navigation sidebar (Ctrl+B)",
      action: () => window.dispatchEvent(new CustomEvent("toggle-sidebar")),
      icon: PanelLeftClose,
      category: "Quick Actions",
      badge: "Ctrl+B",
      keywords: ["sidebar", "collapse", "expand", "menu"],
    });

    // Curriculum Domains & Topics from Taxonomy
    if (domains && domains.length > 0) {
      domains.forEach((d) => {
        items.push({
          id: `domain-${d.slug}`,
          label: `${d.name} Track`,
          description: `Full curriculum for ${d.name} (${d.topics.length} topics)`,
          path: `/practice?domain=${d.slug}`,
          icon: Compass,
          category: "Practice & Curriculum",
          badge: "Domain",
          keywords: [d.name, d.slug, "track", "curriculum"],
        });

        d.topics.forEach((t) => {
          items.push({
            id: `topic-${t.slug}`,
            label: `${t.name}`,
            description: `Topic in ${d.name} (${(t as any).questionCount || 10}+ practice questions)`,
            path: `/practice?search=${encodeURIComponent(t.name)}`,
            icon: Tag,
            category: "Practice & Curriculum",
            badge: d.name,
            keywords: [t.name, d.name, "topic", "questions"],
          });
        });
      });
    }

    // Coding Challenges
    if (mockCodingProblems && mockCodingProblems.length > 0) {
      mockCodingProblems.slice(0, 15).forEach((p) => {
        items.push({
          id: `problem-${p.id}`,
          label: p.title,
          description: `${p.category} · ${p.difficulty} · ${p.acceptance} acceptance`,
          path: `/coding?problem=${p.id}`,
          icon: Code2,
          category: "Coding Challenges",
          badge: p.difficulty,
          keywords: [p.title, p.category, p.difficulty, "code", "dsa", "algorithm"],
        });
      });
    }

    // Articles & Guides
    if (mockArticles && mockArticles.length > 0) {
      mockArticles.slice(0, 8).forEach((a) => {
        items.push({
          id: `art-${a.id}`,
          label: a.title,
          description: a.summary,
          path: `/articles/${a.slug}`,
          icon: FileText,
          category: "Articles & Guides",
          badge: `${a.readTimeMinutes} min read`,
          keywords: [a.title, a.category, a.topic || "", ...(a.tags || [])],
        });
      });
    }

    return items;
  }, [domains, isVerified]);

  // Filtered results based on debounced query
  const filteredCommands = useMemo(() => {
    if (!debouncedQuery) {
      // Default initial view: key pages and quick actions
      return allCommands.filter(
        (c) => c.category === "Pages & Features" || c.category === "Quick Actions"
      );
    }

    const q = debouncedQuery.toLowerCase();
    return allCommands.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchPath = item.path?.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));

      return matchLabel || matchDesc || matchCat || matchPath || matchKeywords;
    });
  }, [allCommands, debouncedQuery]);

  // Group filtered results by category
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: CommandItem[] } = {};
    filteredCommands.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredCommands]);

  // Save query to recent searches
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    try {
      const updated = [
        searchTerm.trim(),
        ...recentSearches.filter((s) => s.toLowerCase() !== searchTerm.trim().toLowerCase()),
      ].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage issues
    }
  };

  const clearRecentSearches = () => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  const handleSelect = (item: CommandItem) => {
    saveRecentSearch(item.label);
    setIsOpen(false);
    setQuery("");

    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) {
        handleSelect(current);
      }
    }
  };

  // Keep selected item scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Text highlighting helper
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-cyan-400/25 text-cyan-300 px-0.5 rounded font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const isMac = typeof window !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0;

  if (!isOpen) return null;

  let flatIndexTracker = -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search Palette"
      className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-surface border border-cyan-400/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[85vh] select-none text-text-primary"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-border bg-surface-raised/80">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, tracks, tests, problems..."
            className="w-full bg-transparent text-sm sm:text-base font-sans text-text-primary placeholder:text-text-muted focus:outline-none"
            autoFocus
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-text-muted hover:text-text-primary rounded-lg ml-2"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 bg-surface border border-border px-2 py-0.5 rounded text-[11px] font-mono text-text-muted">
              Esc to close
            </kbd>
          )}
        </div>

        {/* Recent Searches Chips (when query is empty) */}
        {!query && recentSearches.length > 0 && (
          <div className="px-4 py-2.5 bg-surface-raised/40 border-b border-border/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="text-[11px] text-text-muted flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-cyan-400" /> Recent:
              </span>
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-2 py-0.5 rounded bg-surface border border-border text-text-secondary hover:text-cyan-400 hover:border-cyan-400/40 text-[11px] shrink-0 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-[10px] text-text-muted hover:text-rose-400 transition-colors shrink-0 ml-2"
            >
              Clear
            </button>
          </div>
        )}

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto flex-1 p-2 space-y-4 max-h-[500px]">
          {filteredCommands.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
                <Search className="w-6 h-6 opacity-80" />
              </div>
              <h4 className="font-serif text-base font-medium text-text-primary">
                No results found for "{debouncedQuery}"
              </h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto font-sans">
                Try searching for domains like <strong className="text-cyan-400">DSA</strong>, <strong className="text-cyan-400">System Design</strong>, <strong className="text-cyan-400">Mock Interview</strong>, or <strong className="text-cyan-400">Resume</strong>.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                {["DSA", "System Design", "Mock Interview", "Resume"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="px-2.5 py-1 text-xs font-mono rounded-lg bg-surface-raised border border-border hover:border-cyan-400/40 text-text-secondary hover:text-cyan-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-[10px] opacity-70">{items.length} items</span>
                </div>
                {items.map((item) => {
                  flatIndexTracker += 1;
                  const itemIndex = flatIndexTracker;
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      data-index={itemIndex}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`group w-full flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-400/50 shadow-sm"
                          : "bg-surface border-transparent hover:border-border hover:bg-surface-raised"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-cyan-400 text-[#0d1321]"
                              : "bg-surface-raised text-text-muted group-hover:text-cyan-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p
                            className={`text-xs sm:text-sm font-medium truncate ${
                              isSelected ? "text-cyan-300 font-semibold" : "text-text-primary"
                            }`}
                          >
                            {highlightMatch(item.label, debouncedQuery)}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-text-muted truncate max-w-md font-sans">
                              {highlightMatch(item.description, debouncedQuery)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              item.badge === "Easy"
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                : item.badge === "Medium"
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                                : item.badge === "Hard"
                                ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                                : isSelected
                                ? "bg-cyan-400/20 border-cyan-400/40 text-cyan-300"
                                : "bg-surface-raised border-border text-text-muted"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <CornerDownLeft
                          className={`w-3.5 h-3.5 transition-opacity ${
                            isSelected ? "opacity-100 text-cyan-400" : "opacity-0"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-surface-raised/90 border-t border-border flex flex-wrap items-center justify-between text-[11px] font-mono text-text-muted gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px]">↑</kbd>
              <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px]">↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px]">Esc</kbd>
              <span>close</span>
            </span>
          </div>
          <span className="text-[10px] text-cyan-400/80">
            {isMac ? "⌘K" : "Ctrl+K"} anywhere
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
