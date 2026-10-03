import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppearance } from "@/context/AppearanceContext";
import { useNotifications } from "@/context/NotificationContext";
import { AppNotification } from "@/services/notificationService";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { Button } from "@/components/ui/Button";
import {
  Menu,
  LogOut,
  Shield,
  Sparkles,
  Bell,
  Search,
  Sun,
  Moon,
  CheckCheck,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Video,
  Code2,
  FileText,
  Briefcase,
  Flame,
  UserCheck,
  BookOpen,
  LifeBuoy,
  AlertTriangle,
  Inbox,
  Bug,
} from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { CommandPalette } from "@/components/common/CommandPalette";
import { AvatarCompletionRing } from "@/components/common/AvatarCompletionRing";
import { DiagnosticsModal } from "@/components/common/DiagnosticsModal";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/mocks/profileData";
import { FAQ_CATEGORIES } from "@/mocks/faqs";

export interface TopbarProps {
  onOpenMobileSidebar?: () => void;
  title?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileSidebar,
  title,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}) => {
  const { user, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [quickHelpQuery, setQuickHelpQuery] = useState("");
  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll } = useNotifications();
  const reducedEffects = useReducedEffects();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useAppearance();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    profileService.getProfile().then((data) => setProfile(data));
  }, [user]);

  const handleNotificationClick = async (item: AppNotification) => {
    await markRead(item.id);
    setShowNotifications(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await remove(id);
  };

  const renderNotificationIcon = (type: AppNotification["type"], priority?: AppNotification["priority"]) => {
    switch (type) {
      case "verification":
        return priority === "danger" ? (
          <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
        ) : (
          <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        );
      case "interview":
        return <Video className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case "coding":
        return <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case "quiz":
        return <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case "resume":
        return <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case "placement":
        return <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case "streak":
        return <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case "profile":
        return <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case "content":
        return <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case "support":
        return <LifeBuoy className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
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
    <header className="h-16 border-b border-border bg-surface z-30 px-4 sm:px-8 flex items-center justify-between gap-4 select-none shrink-0 shadow-sm">
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
              <span
                className={`absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-cyan-400 text-surface font-mono text-[10px] font-bold shadow-sm ${
                  !reducedEffects ? "animate-pulse" : ""
                }`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-raised border border-border rounded-xl shadow-2xl p-4 z-50 space-y-3 opacity-100">
              <div className="flex justify-between items-center pb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs font-bold text-text-primary tracking-tight">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-400/15 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-text-muted bg-surface border border-border px-2 py-0.5 rounded-full">
                      Caught up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllRead()}
                      className="text-[11px] font-mono text-cyan-400 hover:underline hover:text-cyan-300 transition-colors flex items-center gap-1"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Read all
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => clearAll()}
                      className="text-[11px] font-mono text-text-muted hover:text-danger transition-colors flex items-center gap-1 ml-1"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-text-muted">
                      <Inbox className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-xs font-semibold text-text-primary">You're all caught up</p>
                    <p className="text-[11px] text-text-muted">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNotificationClick(n);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        className={`group relative w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/40 block ${
                          isUnread
                            ? "bg-surface border-cyan-400/40 shadow-sm hover:bg-surface-raised hover:border-cyan-400"
                            : "bg-surface/40 border-border opacity-80 hover:opacity-100 hover:bg-surface-raised"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="p-1.5 rounded-lg bg-surface-raised border border-border shrink-0 mt-0.5">
                              {renderNotificationIcon(n.type, n.priority)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs truncate ${isUnread ? "font-bold text-text-primary" : "font-medium text-text-secondary"}`}>
                                  {n.title}
                                </span>
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-text-muted font-mono mt-1.5 block">
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDismiss(e, n.id)}
                            className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
                            title="Dismiss notification"
                            aria-label="Dismiss notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Link */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-1"
          title={`Logged in as ${user?.name || "User"} (${user?.role || "STUDENT"})`}
        >
          <AvatarCompletionRing profile={profile} name={user?.name} size="sm" showPill={false} />
          <span className="hidden xl:inline text-xs font-semibold text-text-primary max-w-[120px] truncate">
            {user?.name}
          </span>
        </NavLink>

        {/* Diagnostics Debug Button (visible in dev or ?debug=1) */}
        {(import.meta.env.DEV ||
          (typeof window !== "undefined" &&
            (window.location.search.includes("debug=1") ||
              localStorage.getItem("debug_mode") === "1"))) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiagnostics(true)}
            title="Open System Diagnostics"
            className="text-xs py-1 px-2.5 font-mono text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 gap-1.5"
          >
            <Bug className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Debug</span>
          </Button>
        )}

        {/* Role switch pill if admin */}
        {user?.role === "ADMIN" && (
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

      {/* Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </header>
  );
};
