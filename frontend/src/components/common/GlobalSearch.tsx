import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Compass,
  Tag,
  Clock,
  Flame,
  X,
  ChevronRight,
} from "lucide-react";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useAuth } from "@/context/AuthContext";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { mockCodingProblems } from "@/mocks/codingData";
import { mockArticles } from "@/mocks/articleData";

export interface SearchItem {
  id: string;
  label: string;
  description?: string;
  path?: string;
  action?: () => void;
  icon: any;
  category: "Core Pages" | "Coding Challenges" | "Practice Curriculum" | "Guides & Articles";
  badge?: string;
  keywords?: string[];
}

const RECENT_SEARCHES_KEY = "ai_prep_recent_searches_v3";

export interface GlobalSearchProps {
  className?: string;
  autoFocus?: boolean;
  onClose?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className = "",
  autoFocus = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(autoFocus);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ["DSA", "Mock Interview", "System Design", "Resume"];
    } catch {
      return ["DSA", "Mock Interview", "System Design", "Resume"];
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { domains } = useTaxonomy();
  const { status: verifStatus } = useVerificationStatus();

  const isVerified = isAdmin() || verifStatus === "Verified";

  // Close immediately when route changes
  useEffect(() => {
    setIsOpen(false);
    onClose?.();
  }, [location.pathname]);

  // Focus on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Document-level pointerdown listener: closes on click anywhere outside
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
    }
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  // Debounce typing (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setSelectedIndex(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Index searchable platform items
  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [
      {
        id: "page-dashboard",
        label: "Student Dashboard",
        description: "Overview of your readiness score, stats, and daily goals",
        path: "/dashboard",
        icon: LayoutDashboard,
        category: "Core Pages",
        badge: "Overview",
        keywords: ["home", "stats", "overview", "streak", "xp"],
      },
      {
        id: "page-preparation",
        label: "Prep Roadmaps",
        description: "Curated learning tracks for Frontend, Backend, Full Stack & AI",
        path: "/preparation",
        icon: Compass,
        category: "Core Pages",
        badge: "Roadmap",
        keywords: ["curriculum", "syllabus", "path", "guide"],
      },
      {
        id: "page-practice",
        label: "Practice Tracks",
        description: "Technical interview domains, concept questions, and answers",
        path: "/practice",
        icon: BookOpen,
        category: "Core Pages",
        badge: "Practice",
        keywords: ["questions", "topics", "theory", "mcq"],
      },
      {
        id: "page-coding",
        label: "Coding Arena",
        description: "Solve algorithmic benchmarks and DSA challenge problems",
        path: "/coding",
        icon: Code2,
        category: "Core Pages",
        badge: "IDE",
        keywords: ["dsa", "leetcode", "algorithms", "problem", "solve", "code"],
      },
      {
        id: "page-mock-interview",
        label: "Mock Interview",
        description: "AI-evaluated technical and behavioral interview rounds",
        path: "/mock-interview",
        icon: Video,
        category: "Core Pages",
        badge: "AI Mock",
        keywords: ["interview", "mock", "voice", "behavioral", "star", "camera"],
      },
      {
        id: "page-resume-analyzer",
        label: "Resume Analyzer",
        description: "AI ATS scanner with keyword alignment and recruiter impact score",
        path: "/resume-analyzer",
        icon: FileText,
        category: "Core Pages",
        badge: "ATS AI",
        keywords: ["resume", "cv", "ats", "score", "scanner"],
      },
      {
        id: "page-live-tests",
        label: "Live Tests",
        description: "Timed campus coding tests and scheduled placement contests",
        path: "/live-tests",
        icon: Flame,
        category: "Core Pages",
        badge: "Contests",
        keywords: ["test", "exam", "contest", "live", "timed"],
      },
      {
        id: "page-leaderboard",
        label: "Leaderboard",
        description: "College rankings, percentile standing, and student XP",
        path: "/leaderboard",
        icon: Trophy,
        category: "Core Pages",
        badge: "Rankings",
        keywords: ["rank", "leaderboard", "xp", "score", "top"],
      },
      {
        id: "page-articles",
        label: "Articles & Guides",
        description: "Engineering masterclasses, system design cheat sheets, and tips",
        path: "/articles",
        icon: FileText,
        category: "Core Pages",
        badge: "Guides",
        keywords: ["read", "blog", "articles", "system design", "tutorial"],
      },
      {
        id: "page-profile",
        label: "My Profile",
        description: "Academic details, placement target roles, and avatar",
        path: "/profile",
        icon: User,
        category: "Core Pages",
        badge: "Account",
        keywords: ["account", "profile", "settings", "edit", "resume"],
      },
      {
        id: "page-settings",
        label: "Settings",
        description: "Platform appearance, theme toggle, and account configuration",
        path: "/settings",
        icon: Settings,
        category: "Core Pages",
        badge: "Settings",
        keywords: ["theme", "dark mode", "light mode", "appearance", "config"],
      },
      {
        id: "page-help",
        label: "Help & Support",
        description: "Placement prep FAQs, help center guides, and tickets",
        path: "/help",
        icon: HelpCircle,
        category: "Core Pages",
        badge: "Support",
        keywords: ["support", "faq", "ticket", "contact", "issue"],
      },
    ];

    if (!isVerified) {
      items.unshift({
        id: "action-verify",
        label: "Verify Student ID",
        description: "Submit college ID to unlock mock interviews and coding arena",
        path: "/verify-identity",
        icon: Shield,
        category: "Core Pages",
        badge: "Required",
        keywords: ["verify", "id", "college", "student", "unlock"],
      });
    }

    // Taxonomy tracks & topics
    if (domains && domains.length > 0) {
      domains.forEach((d) => {
        items.push({
          id: `domain-${d.slug}`,
          label: `${d.name} Track`,
          description: `Full curriculum for ${d.name} (${d.topics.length} topics)`,
          path: `/practice?domain=${d.slug}`,
          icon: Compass,
          category: "Practice Curriculum",
          badge: "Track",
          keywords: [d.name, d.slug, "track", "curriculum"],
        });

        d.topics.forEach((t) => {
          items.push({
            id: `topic-${t.slug}`,
            label: t.name,
            description: `Topic in ${d.name}`,
            path: `/practice?search=${encodeURIComponent(t.name)}`,
            icon: Tag,
            category: "Practice Curriculum",
            badge: d.name,
            keywords: [t.name, d.name, "topic", "questions"],
          });
        });
      });
    }

    // Coding challenges
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

    // Articles & guides
    if (mockArticles && mockArticles.length > 0) {
      mockArticles.slice(0, 10).forEach((a) => {
        items.push({
          id: `art-${a.id}`,
          label: a.title,
          description: a.summary,
          path: `/articles/${a.slug}`,
          icon: FileText,
          category: "Guides & Articles",
          badge: `${a.readTimeMinutes} min`,
          keywords: [a.title, a.category, a.topic || "", ...(a.tags || [])],
        });
      });
    }

    return items;
  }, [domains, isVerified]);

  // Filtered list based on debounced search
  const filteredItems = useMemo(() => {
    if (!debouncedQuery) {
      return allItems.filter((i) => i.category === "Core Pages").slice(0, 8);
    }
    const q = debouncedQuery.toLowerCase();
    return allItems.filter((i) => {
      const matchLabel = i.label.toLowerCase().includes(q);
      const matchDesc = i.description?.toLowerCase().includes(q);
      const matchKeywords = i.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchDesc || matchKeywords;
    });
  }, [allItems, debouncedQuery]);

  // Save term to recent searches
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [
        term.trim(),
        ...recentSearches.filter((s) => s.toLowerCase() !== term.trim().toLowerCase()),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
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

  const handleSelect = (item: SearchItem) => {
    saveRecentSearch(item.label);
    setIsOpen(false);
    setQuery("");
    onClose?.();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      onClose?.();
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) handleSelect(current);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, isOpen]);

  // Highlight helper
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-teal-200/80 dark:bg-teal-400/25 text-teal-950 dark:text-teal-200 px-0.5 rounded font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-teal-600 dark:text-teal-300 absolute left-3.5 pointer-events-none transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search topics, tracks, tests..."
          aria-expanded={isOpen}
          aria-label="Search topics, tracks, tests"
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 hover:border-teal-500/50 dark:hover:border-teal-400/50 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-400/20 focus:outline-none text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-600 dark:placeholder:text-slate-300 transition-[border-color,box-shadow] duration-200 font-sans font-medium"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 rounded-md transition-colors"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown directly BELOW the input */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] xs:min-w-[320px] sm:min-w-[420px] md:min-w-[480px] max-w-xl max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[70vh] animate-in fade-in duration-150">
          {/* Recent Searches chips when query is empty - stays fixed at the top */}
          {!query && recentSearches.length > 0 && (
            <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B1120] flex items-center justify-between text-xs shrink-0 transition-colors">
              <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 pr-2 [scrollbar-width:none]">
                <span className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0 font-mono uppercase font-semibold tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" /> Recent:
                </span>
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 dark:hover:bg-teal-500/15 dark:hover:text-teal-200 dark:hover:border-teal-400/30 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs font-mono font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200 hover:underline shrink-0 ml-2 h-8 px-2 flex items-center cursor-pointer transition-colors"
                aria-label="Clear recent searches"
              >
                Clear
              </button>
            </div>
          )}

          {/* Results List with Theme-styled Scrollbar and Bottom Fade */}
          <div
            ref={listRef}
            className="overflow-y-auto flex-1 p-2 space-y-1 pr-2.5 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.2)_transparent] relative"
          >
            {filteredItems.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Search className="w-5 h-5 opacity-90" />
                </div>
                <p className="font-serif text-sm font-semibold text-slate-900 dark:text-slate-100">
                  No matches found for "{debouncedQuery}"
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium max-w-xs mx-auto font-sans">
                  Try searching for <span className="text-teal-700 dark:text-teal-300 font-medium">DSA</span>, <span className="text-teal-700 dark:text-teal-300 font-medium">System Design</span>, or <span className="text-teal-700 dark:text-teal-300 font-medium">Mock Interview</span>.
                </p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    data-index={index}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-50 border border-teal-200 ring-1 ring-teal-500/20 dark:bg-teal-500/10 dark:border-teal-400/30 dark:ring-transparent shadow-xs"
                        : "hover:bg-teal-50/60 dark:hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    {/* Left: Icon, Title & Truncated Description */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-teal-600 text-white dark:bg-teal-400 dark:text-[#0F172A]"
                            : "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs truncate transition-colors ${
                              isSelected
                                ? "font-bold text-teal-950 dark:text-teal-200"
                                : "font-semibold text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {highlightMatch(item.label, debouncedQuery)}
                          </p>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-sm sm:max-w-md font-sans">
                            {highlightMatch(item.description, debouncedQuery)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Category badge tag */}
                    <div className="shrink-0 flex items-center gap-1.5 ml-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap font-medium transition-colors ${
                          item.badge === "Easy"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                            : item.badge === "Medium"
                            ? "bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300"
                            : item.badge === "Hard"
                            ? "bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300"
                            : isSelected
                            ? "bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-400/20 dark:border-teal-400/40 dark:text-teal-200"
                            : "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-200 dark:border-teal-400/30"
                        }`}
                      >
                        {item.badge || item.category}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-300 transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}

            {/* Soft fade at the bottom of the scroll area so cut-off rows look intentional */}
            {filteredItems.length > 4 && (
              <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-6 -mt-6 bg-gradient-to-t from-white dark:from-[#0F172A] to-transparent shrink-0 z-10" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
