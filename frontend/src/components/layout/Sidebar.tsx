import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Video,
  HelpCircle,
  FileText,
  Trophy,
  User,
  Settings,
  Users,
  BarChart3,
  X,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Radio,
  Layers,
  Compass,
  FolderTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { AvatarCompletionRing } from "@/components/common/AvatarCompletionRing";
import { RoleBadge } from "@/components/common/RoleBadge";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/mocks/profileData";

export interface SidebarProps {
  isAdmin?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SidebarLink {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

interface SidebarTooltipProps {
  label: string;
  badge?: string;
  sublabel?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const SidebarTooltip: React.FC<SidebarTooltipProps> = ({
  label,
  badge,
  sublabel,
  disabled = false,
  children,
}) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  if (disabled) return <>{children}</>;

  const handleMouseEnter = () => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
      });
    }
  };

  const handleMouseLeave = () => {
    setCoords(null);
  };

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center w-full"
    >
      {children}
      {coords &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            style={{ top: `${coords.top}px`, left: `${coords.left}px`, transform: "translateY(-50%)" }}
            className="fixed z-[9999] pointer-events-none bg-surface-raised border border-border shadow-2xl rounded-lg px-3 py-1.5 text-xs text-text-primary flex items-center gap-2 whitespace-nowrap animate-fade-in"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-text-primary">{label}</span>
              {sublabel && <span className="text-[10px] text-text-muted font-mono">{sublabel}</span>}
            </div>
            {badge && (
              <span className="text-[10px] font-mono bg-cyan-400/20 text-cyan-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                {badge}
              </span>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isAdmin = false,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    profileService.getProfile().then((data) => {
      setProfile(data);
    });
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpenMobile && onCloseMobile) {
        onCloseMobile();
      }
    };
    if (isOpenMobile) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      // Restore to empty string so CSS (not 'unset') controls overflow again
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpenMobile, onCloseMobile]);

  const studentLinks: SidebarLink[] = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/preparation", label: "Prep Roadmaps", icon: Compass, badge: "Track" },
    { to: "/practice", label: "Practice Tracks", icon: BookOpen },
    { to: "/resume-analyzer", label: "Resume Analyzer", icon: FileText, badge: "AI" },
    { to: "/coding", label: "Coding Arena", icon: Code2 },
    { to: "/mock-interview", label: "Mock Interview", icon: Video, badge: "AI" },
    { to: "/quiz", label: "MCQ Quizzes", icon: HelpCircle },
    { to: "/articles", label: "Articles & Guides", icon: FileText },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/profile", label: "My Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/help", label: "Help & Support", icon: HelpCircle },
  ];

  const adminLinks: SidebarLink[] = [
    { to: "/admin", label: "Admin Overview", icon: LayoutDashboard },
    { to: "/admin/content", label: "Content Manager", icon: Layers, badge: "Hub" },
    { to: "/admin/students", label: "Student Progress", icon: GraduationCap, badge: "Analytics" },
    { to: "/admin/users", label: "Manage Users", icon: Users },
    { to: "/admin/verifications", label: "ID Verifications", icon: ShieldCheck, badge: "Review" },
    { to: "/admin/coding-tests", label: "Coding Tests", icon: Code2 },
    { to: "/admin/taxonomy", label: "Domains & Topics", icon: FolderTree },
    { to: "/admin/live-tests", label: "Live Tests", icon: Radio, badge: "Live" },
    { to: "/admin/mock-interviews", label: "Mock Interviews", icon: Video },
    { to: "/admin/articles", label: "Articles CMS", icon: FileText },
    { to: "/admin/reports", label: "Analytics & Reports", icon: BarChart3 },
    { to: "/admin/settings", label: "Platform Settings", icon: Settings },
    { to: "/admin/help", label: "Help & Support", icon: HelpCircle },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const renderSidebarContent = (forceExpanded = false) => {
    const collapsed = forceExpanded ? false : isCollapsed;
    const widthClass = collapsed ? "w-[68px]" : "w-64";

    return (
      <div className={cn("flex flex-col h-full bg-surface border-r border-border text-text-primary transition-all duration-200 ease-in-out p-3", widthClass)}>
        {/* Brand Header */}
        <div
          className={cn(
            "pb-3 border-b border-border sticky top-0 bg-surface z-10 shrink-0",
            collapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between px-1"
          )}
        >
          <NavLink
            to={isAdmin ? "/admin" : "/dashboard"}
            className="flex items-center gap-2.5 font-serif font-semibold text-lg tracking-tight group"
            title={collapsed ? (isAdmin ? "Admin Overview" : "Dashboard") : undefined}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 transition-transform duration-300 group-hover:scale-105"
            >
              <path
                d="M6 14C6 8.47715 10.4772 4 16 4C21.5228 4 26 8.47715 26 14C26 19.5228 21.5228 24 16 24C14.1 24 12.3 23.47 10.8 22.5L6 24L7.5 19.2C6.53 17.7 6 15.9 6 14Z"
                fill="url(#sidebarChatAiGlow)"
                fillOpacity="0.15"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M16 9L17.2 12.8L21 14L17.2 15.2L16 19L14.8 15.2L11 14L14.8 12.8L16 9Z"
                fill="#22d3ee"
              />
              <circle cx="21" cy="9" r="1.5" fill="#14b8a6" />
              <defs>
                <linearGradient id="sidebarChatAiGlow" x1="6" y1="4" x2="26" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            {!collapsed && (
              <>
                <span className="text-text-primary group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                  AI Interview Prep
                </span>
                {isAdmin && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono uppercase">
                    Admin
                  </span>
                )}
              </>
            )}
          </NavLink>

          {/* Desktop Toggle Button */}
          {onToggleCollapse && !forceExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
              className="hidden lg:flex p-1.5 h-auto text-text-muted hover:text-cyan-400 hover:bg-surface-raised shrink-0"
            >
              {collapsed ? <ChevronRight className="w-4 h-4 text-cyan-400" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <Button variant="ghost" size="sm" onClick={onCloseMobile} className="lg:hidden p-1 h-auto text-text-muted">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Nav Links — sidebar-scroll gives a thin 4px scrollbar when menu > viewport */}
        <nav className="flex-1 py-3 space-y-1 sidebar-scroll">
          {!collapsed ? (
            <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted px-2 mb-2">
              {isAdmin ? "Management" : "Main Menu"}
            </div>
          ) : (
            <div className="w-full border-t border-border/50 my-2" />
          )}

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <SidebarTooltip
                key={link.to}
                label={link.label}
                badge={link.badge}
                disabled={!collapsed}
              >
                <NavLink
                  to={link.to}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-all duration-150 group",
                    collapsed
                      ? "justify-center w-10 h-10 mx-auto"
                      : "gap-3 px-3 py-2.5 w-full",
                    isActive
                      ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 shadow-nav"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-cyan-400" : "text-text-muted group-hover:text-text-primary"
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{link.label}</span>
                      {link.badge && (
                        <span className="text-[10px] font-mono bg-cyan-400/20 text-cyan-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </SidebarTooltip>
            );
          })}
        </nav>

        {/* User Info Card Footer */}
        <div className="pt-3 border-t border-border mt-auto">
          <SidebarTooltip
            label={user?.name || profile?.name || "Student User"}
            sublabel={user?.email || profile?.email || "student@srmist.edu.in"}
            disabled={!collapsed}
          >
            <NavLink
              to="/profile"
              onClick={onCloseMobile}
              className={cn(
                "bg-surface-raised border border-border hover:border-cyan-400/40 rounded-lg transition-colors group flex items-center",
                collapsed ? "justify-center p-2 mx-auto w-11 h-11" : "p-2.5 gap-3 w-full"
              )}
            >
              <AvatarCompletionRing profile={profile} name={user?.name || profile?.name} size="sm" showPill={false} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-between">
                    <p className="text-xs font-semibold text-text-primary group-hover:text-cyan-400 transition-colors truncate">
                      {user?.name || profile?.name || "Student User"}
                    </p>
                    <RoleBadge role={user?.role || (isAdmin ? "ADMIN" : "STUDENT")} size="xs" />
                  </div>
                  <p className="text-[11px] text-text-muted font-mono truncate">
                    {user?.email || profile?.email || "student@srmist.edu.in"}
                  </p>
                </div>
              )}
            </NavLink>
          </SidebarTooltip>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden lg:block h-full shrink-0 z-40 transition-all duration-200 ease-in-out",
          isCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Overlay Drawer Portal */}
      {isOpenMobile &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[60] lg:hidden flex">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
            <div className="relative z-10 w-64 max-w-xs h-full bg-surface shadow-soft">
              {renderSidebarContent(true)}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

