import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Menu, LogOut, Shield, Sparkles, Bell, Search, Sun, Moon, CheckCheck, HelpCircle, ArrowRight, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { CommandPalette } from "@/components/common/CommandPalette";
import { AvatarCompletionRing } from "@/components/common/AvatarCompletionRing";
import { RoleBadge } from "@/components/common/RoleBadge";
import { KeyboardShortcutsHelp } from "@/components/common/KeyboardShortcutsHelp";
import { usePreviewMode } from "@/context/PreviewModeContext";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/mocks/profileData";
import { FAQ_CATEGORIES, FAQItem } from "@/mocks/faqs";

export interface TopbarProps {
  onOpenMobileSidebar?: () => void;
  title?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export interface NotificationItem {
  id: number;
  title: string;
  text: string;
  time: string;
  read: boolean;
  type: "interview" | "placement" | "streak";
  link: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Mock Interview Scored",
    text: "Senior Frontend Round rating: 89/100",
    time: "10m ago",
    read: false,
    type: "interview",
    link: "/mock-interview",
  },
  {
    id: 2,
    title: "Campus Placement Alert",
    text: "Amazon SDE Drive registration closes in 2 days",
    time: "1h ago",
    read: false,
    type: "placement",
    link: "/articles",
  },
  {
    id: 3,
    title: "Daily Practice Streak",
    text: "12 days in a row! Keep up the momentum.",
    time: "4h ago",
    read: false,
    type: "streak",
    link: "/dashboard",
  },
];

import { isDemoUser, scopedKey } from "@/lib/userScope";

const WELCOME_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Welcome to AI Interview Prep",
    text: "Complete your profile to get started and unlock recruiter-ready status.",
    time: "Just now",
    read: false,
    type: "placement",
    link: "/profile",
  },
];

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileSidebar,
  title,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}) => {
  const { user, logout, isDemoMode } = useAuth();
  const { isPreviewMode, togglePreviewMode } = usePreviewMode();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [quickHelpQuery, setQuickHelpQuery] = useState("");

  const isDemo = isDemoMode || isDemoUser(user);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const defaultList = isDemo ? INITIAL_NOTIFICATIONS : WELCOME_NOTIFICATIONS;
    if (!user?.userId) return defaultList;
    try {
      const readKey = scopedKey("notifications_read", user.userId);
      const readIdsRaw = localStorage.getItem(readKey);
      if (readIdsRaw) {
        const readIds: number[] = JSON.parse(readIdsRaw);
        return defaultList.map((n) => ({
          ...n,
          read: readIds.includes(n.id),
        }));
      }
    } catch {
      // fallback
    }
    return defaultList;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    profileService.getProfile().then((data) => setProfile(data));
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      root.classList.add("light");
      setIsDark(false);
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  const saveReadState = (readIds: number[]) => {
    if (user?.userId) {
      try {
        const readKey = scopedKey("notifications_read", user.userId);
        localStorage.setItem(readKey, JSON.stringify(readIds));
      } catch {
        // fallback
      }
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === item.id ? { ...n, read: true } : n));
      const readIds = next.filter((n) => n.read).map((n) => n.id);
      saveReadState(readIds);
      return next;
    });
    setShowNotifications(false);
    navigate(item.link);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      const readIds = next.map((n) => n.id);
      saveReadState(readIds);
      return next;
    });
  };

  // Close notifications and help popover on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowQuickHelp(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNotifications(false);
        setShowQuickHelp(false);
      }
    };

    if (showNotifications || showQuickHelp) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications, showQuickHelp]);

  // Flattened top FAQs for quick help popover
  const allFaqs = FAQ_CATEGORIES.flatMap((c) => c.items);
  const filteredQuickFaqs = quickHelpQuery.trim()
    ? allFaqs.filter(
        (f) =>
          f.question.toLowerCase().includes(quickHelpQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(quickHelpQuery.toLowerCase())
      )
    : allFaqs.slice(0, 3);

  return (
    <header className="h-16 border-b border-border bg-surface sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4 select-none shrink-0 shadow-sm">
      <CommandPalette />

      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileSidebar && (
          <Button variant="ghost" size="sm" onClick={onOpenMobileSidebar} className="lg:hidden p-2 h-auto text-text-secondary shrink-0">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        {onToggleSidebarCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex p-2 h-auto text-text-secondary hover:text-cyan-400 shrink-0"
            title={isSidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-cyan-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-text-muted" />
            )}
          </Button>
        )}
        <h1 className="font-serif text-lg sm:text-xl font-medium text-text-primary tracking-tight truncate">
          {title || "Dashboard Overview"}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Command Palette Trigger */}
        <div
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true });
            window.dispatchEvent(event);
          }}
          className="hidden md:flex items-center gap-2 bg-surface-raised border border-border px-3 py-1.5 rounded-lg text-xs text-text-muted w-48 sm:w-56 focus-within:border-cyan-400/50 cursor-pointer transition-colors"
          title="Press Ctrl+K"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-text-muted truncate">Search or Ctrl+K...</span>
          <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px] font-mono ml-auto text-text-secondary">⌘K</kbd>
        </div>

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <span className="hidden sm:inline-flex items-center gap-1 bg-cyan-400/15 border border-cyan-400/40 text-cyan-400 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
            <Sparkles className="w-3 h-3" /> DEMO SESSION
          </span>
        )}

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2 h-auto text-text-secondary hover:text-cyan-400"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
        </Button>

        {/* Quick Help ? Button & Popover */}
        <div className="relative" ref={helpRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickHelp(!showQuickHelp)}
            className="p-2 h-auto text-text-secondary hover:text-cyan-400 font-mono text-xs"
            title="Quick Help & FAQs"
            aria-expanded={showQuickHelp}
            aria-label="Quick Help & FAQs"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </Button>

          {showQuickHelp && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface border border-border rounded-xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-serif font-bold text-xs text-text-primary flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-cyan-400" /> Quick Help Center
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickHelp(false);
                    navigate("/help");
                  }}
                  className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Full Page <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search FAQ questions..."
                  value={quickHelpQuery}
                  onChange={(e) => setQuickHelpQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-surface-raised border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* FAQ Results Preview */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                {filteredQuickFaqs.length > 0 ? (
                  filteredQuickFaqs.slice(0, 3).map((faq) => (
                    <div
                      key={faq.id}
                      onClick={() => {
                        setShowQuickHelp(false);
                        navigate(`/help?faq=${faq.id}`);
                      }}
                      className="p-2.5 bg-surface-raised border border-border rounded-lg hover:border-cyan-400/40 cursor-pointer transition-colors space-y-1 text-left"
                    >
                      <span className="text-xs font-semibold text-text-primary block truncate">
                        {faq.question}
                      </span>
                      <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted text-center py-3">No quick answers found.</p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowQuickHelp(false);
                  navigate("/help");
                }}
                className="w-full text-xs font-mono gap-1"
              >
                <span>Open Full Help Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 h-auto text-text-secondary hover:text-cyan-400 relative"
            title="Notifications"
            aria-expanded={showNotifications}
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1 right-1 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1 right-1" />
              </>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface-raised border border-border rounded-xl shadow-soft p-4 z-50 space-y-3 opacity-100">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-text-primary">System Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-400/15 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-text-muted bg-surface border border-border px-2 py-0.5 rounded-full">
                      All read
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-mono text-cyan-400 hover:underline hover:text-cyan-300 transition-colors flex items-center gap-1"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Read all
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                {notifications.map((n) => {
                  const isUnread = !n.read;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNotificationClick(n);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/40 block ${
                        isUnread
                          ? "bg-surface border-cyan-400/40 shadow-sm hover:bg-surface-raised hover:border-cyan-400"
                          : "bg-surface/40 border-border opacity-75 hover:opacity-100 hover:bg-surface-raised"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-semibold text-xs">
                          {isUnread ? (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-transparent shrink-0" />
                          )}
                          <span className={isUnread ? "text-text-primary font-bold" : "text-text-secondary"}>
                            {n.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted font-mono shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed mt-1 pl-4">
                        {n.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Link & RoleBadge */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/profile"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-1"
            title={`Logged in as ${user?.name || "User"}`}
          >
            <AvatarCompletionRing profile={profile} name={user?.name} size="sm" showPill={false} />
            <span className="hidden xl:inline text-xs font-semibold text-text-primary max-w-[120px] truncate">
              {user?.name}
            </span>
          </NavLink>
          <RoleBadge role={user?.role} size="sm" className="hidden sm:inline-flex" />
        </div>

        {/* Role switch / Preview as Regular User button if admin */}
        {user?.role === "ADMIN" && (
          <div className="flex items-center gap-1.5">
            <Button
              variant={isPreviewMode ? "accent-soft" : "outline"}
              size="sm"
              onClick={togglePreviewMode}
              title="Toggle preview as a regular user"
              className="text-xs py-1 font-mono"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">
                {isPreviewMode ? "Exit User Preview" : "Preview as User"}
              </span>
            </Button>
            <Button
              variant="teal-cyan"
              size="sm"
              onClick={() => navigate(window.location.pathname.startsWith("/admin") ? "/dashboard" : "/admin")}
              className="text-xs py-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {window.location.pathname.startsWith("/admin") ? "Student View" : "Admin Panel"}
              </span>
            </Button>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          title="Sign out"
          className="text-text-secondary hover:text-danger hover:bg-danger-bg/50 p-2 h-auto"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <KeyboardShortcutsHelp />
    </header>
  );
};
