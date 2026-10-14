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
  ArrowLeft,
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
} from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { AvatarCompletionRing } from "@/components/common/AvatarCompletionRing";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/mocks/profileData";
import { FAQ_CATEGORIES } from "@/mocks/faqs";
import { TopbarTitle } from "./topbar/TopbarTitle";

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
  const { user, logout, isDemoMode, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<string>("all");
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [quickHelpQuery, setQuickHelpQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll } = useNotifications();
  const reducedEffects = useReducedEffects();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme, isThemeTransitioning } = useAppearance();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const notifCounts = {
    all: notifications.length,
    support: notifications.filter((n) => n.type === "support").length,
    contest: notifications.filter((n) => n.type === "contest").length,
    progress: notifications.filter((n) =>
      ["coding", "interview", "quiz", "streak", "profile", "resume"].includes(n.type)
    ).length,
    verif: notifications.filter((n) =>
      ["verification", "interview", "coding"].includes(n.type)
    ).length,
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === "all") return true;
    if (isAdmin()) {
      if (notificationFilter === "support") return n.type === "support";
      if (notificationFilter === "contest") return n.type === "contest";
      if (notificationFilter === "verif")
        return ["verification", "interview", "coding"].includes(n.type);
    } else {
      if (notificationFilter === "progress")
        return ["coding", "interview", "quiz", "streak", "profile", "resume"].includes(n.type);
      if (notificationFilter === "contest") return n.type === "contest";
      if (notificationFilter === "support") return n.type === "support";
    }
    return true;
  });

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
    <header className="h-16 border-b border-border bg-surface z-40 px-4 sm:px-8 flex items-center justify-between gap-4 select-none shrink-0 shadow-sm relative">
      {mobileSearchOpen ? (
        <div className="flex-1 flex items-center gap-2 w-full animate-in fade-in duration-150">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 h-auto text-text-secondary hover:text-cyan-400 shrink-0 cursor-pointer"
            aria-label="Back to dashboard view"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <GlobalSearch
            className="flex-1 min-w-0"
            autoFocus
            onClose={() => setMobileSearchOpen(false)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
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
            <TopbarTitle title={title} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Button */}
            <Button
              id="topbar-mobile-search-btn"
              variant="ghost"
              size="sm"
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2 h-auto text-text-secondary hover:text-teal-600 dark:hover:text-teal-300 shrink-0 cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-teal-600 dark:text-teal-300" />
            </Button>

            {/* Working Global Search Bar */}
            <GlobalSearch className="hidden md:block w-56 sm:w-72" />

        {/* Theme Toggle Button */}
        <Button
          id="theme-toggle-btn"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.currentTarget.blur();
            toggleTheme();
          }}
          disabled={isThemeTransitioning}
          className="p-2 h-auto text-text-secondary hover:text-cyan-400 group relative cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
                isDark
                  ? "rotate-0 opacity-100 scale-100 text-amber-400"
                  : "-rotate-90 opacity-0 scale-50 pointer-events-none text-amber-400"
              }`}
            >
              <Sun className="w-4 h-4" />
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
                !isDark
                  ? "rotate-0 opacity-100 scale-100 text-cyan-500"
                  : "rotate-90 opacity-0 scale-50 pointer-events-none text-cyan-500"
              }`}
            >
              <Moon className="w-4 h-4" />
            </span>
          </div>
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
                    navigate(isAdmin() ? "/admin/help" : "/help");
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
                        navigate(isAdmin() ? `/admin/help?faq=${faq.id}` : `/help?faq=${faq.id}`);
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
                  navigate(isAdmin() ? "/admin/help" : "/help");
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
                  {isAdmin() ? (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold uppercase">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded font-bold uppercase">
                      Personal
                    </span>
                  )}
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-400/15 border border-cyan-400/30 px-1.5 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-text-muted bg-surface border border-border px-1.5 py-0.2 rounded-full">
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

              {/* Notification Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setNotificationFilter("all")}
                  className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors ${
                    notificationFilter === "all"
                      ? "bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/40"
                      : "bg-surface text-text-muted hover:text-text-primary border border-border"
                  }`}
                >
                  All ({notifCounts.all})
                </button>
                {isAdmin() ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter("support")}
                      className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors ${
                        notificationFilter === "support"
                          ? "bg-pink-400/20 text-pink-300 font-bold border border-pink-400/40"
                          : "bg-surface text-text-muted hover:text-text-primary border border-border"
                      }`}
                    >
                      Queries ({notifCounts.support})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter("contest")}
                      className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors ${
                        notificationFilter === "contest"
                          ? "bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40"
                          : "bg-surface text-text-muted hover:text-text-primary border border-border"
                      }`}
                    >
                      Live Tests ({notifCounts.contest})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter("verif")}
                      className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors ${
                        notificationFilter === "verif"
                          ? "bg-teal-400/20 text-teal-300 font-bold border border-teal-400/40"
                          : "bg-surface text-text-muted hover:text-text-primary border border-border"
                      }`}
                    >
                      Activity ({notifCounts.verif})
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter("progress")}
                      className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors ${
                        notificationFilter === "progress"
                          ? "bg-indigo-400/20 text-indigo-300 font-bold border border-indigo-400/40"
                          : "bg-surface text-text-muted hover:text-text-primary border border-border"
                      }`}
                    >
                      My Progress ({notifCounts.progress})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter("contest")}
                      className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors ${
                        notificationFilter === "contest"
                          ? "bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40"
                          : "bg-surface text-text-muted hover:text-text-primary border border-border"
                      }`}
                    >
                      Live Tests ({notifCounts.contest})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter("support")}
                      className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors ${
                        notificationFilter === "support"
                          ? "bg-pink-400/20 text-pink-300 font-bold border border-pink-400/40"
                          : "bg-surface text-text-muted hover:text-text-primary border border-border"
                      }`}
                    >
                      Support ({notifCounts.support})
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-text-muted">
                      <Inbox className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-xs font-semibold text-text-primary">
                      {notificationFilter !== "all"
                        ? "No notifications in this filter"
                        : "You're all caught up"}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {isAdmin()
                        ? "No pending student queries or contest events."
                        : "No personal alerts. Keep practicing to track your achievements!"}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => {
                    const isUnread = !n.read;
                    const priorityBorder =
                      n.priority === "danger"
                        ? "border-l-4 border-l-red-500"
                        : n.priority === "warning"
                        ? "border-l-4 border-l-amber-500"
                        : n.priority === "success"
                        ? "border-l-4 border-l-teal-400"
                        : "border-l-4 border-l-cyan-400";

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
                        className={`group relative w-full text-left p-2.5 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/40 block ${priorityBorder} ${
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
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-surface border border-border text-text-muted shrink-0">
                                  {n.type}
                                </span>
                                <span className={`text-xs truncate ${isUnread ? "font-bold text-text-primary" : "font-medium text-text-secondary"}`}>
                                  {n.title}
                                </span>
                                {isUnread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-text-secondary leading-relaxed mt-1 line-clamp-2">
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
          to={isAdmin() ? "/admin/settings" : "/profile"}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-1"
          title={`Logged in as ${user?.name || "User"} (${user?.role || "STUDENT"})`}
        >
          <AvatarCompletionRing profile={profile} name={user?.name} size="sm" showPill={false} />
          <span className="hidden xl:inline text-xs font-semibold text-text-primary max-w-[120px] truncate">
            {user?.name}
          </span>
        </NavLink>

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
    </>
  )}
    </header>
  );
};
