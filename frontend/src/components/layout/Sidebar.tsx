import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { AvatarCompletionRing } from "@/components/common/AvatarCompletionRing";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/mocks/profileData";

export interface SidebarProps {
  isAdmin?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface SidebarLink {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isAdmin = false,
  isOpenMobile = false,
  onCloseMobile,
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
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpenMobile, onCloseMobile]);

  const studentLinks: SidebarLink[] = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
    { to: "/admin/users", label: "Manage Users", icon: Users },
    { to: "/admin/verifications", label: "ID Verifications", icon: ShieldCheck, badge: "Review" },
    { to: "/admin/coding-tests", label: "Coding Tests", icon: Code2 },
    { to: "/admin/mock-interviews", label: "Mock Interviews", icon: Video },
    { to: "/admin/articles", label: "Articles CMS", icon: FileText },
    { to: "/admin/reports", label: "Analytics & Reports", icon: BarChart3 },
    { to: "/admin/settings", label: "Platform Settings", icon: Settings },
    { to: "/admin/help", label: "Help & Support", icon: HelpCircle },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const content = (
    <div className="flex flex-col h-full bg-surface border-r border-border w-64 p-4 text-text-primary">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 pb-4 border-b border-border sticky top-0 bg-surface z-10 shrink-0">
        <NavLink to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2.5 font-serif font-semibold text-lg tracking-tight group">
          <svg
            width="22"
            height="22"
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
          <span className="text-text-primary group-hover:text-cyan-400 transition-colors">AI Interview Prep</span>
          {isAdmin && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono uppercase">
              Admin
            </span>
          )}
        </NavLink>
        {onCloseMobile && (
          <Button variant="ghost" size="sm" onClick={onCloseMobile} className="lg:hidden p-1 h-auto text-text-muted">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted px-3 mb-2">
          {isAdmin ? "Management" : "Main Menu"}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 shadow-nav"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-cyan-400" : "text-text-muted group-hover:text-text-primary")} />
              <span className="flex-1">{link.label}</span>
              {link.badge && (
                <span className="text-[10px] font-mono bg-cyan-400/20 text-cyan-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Card Footer */}
      <div className="pt-4 border-t border-border mt-auto">
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          className="bg-surface-raised border border-border hover:border-cyan-400/40 rounded-lg p-2.5 flex items-center gap-3 transition-colors group"
        >
          <AvatarCompletionRing profile={profile} name={user?.name || profile?.name} size="sm" showPill={false} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary group-hover:text-cyan-400 transition-colors truncate">
              {user?.name || profile?.name || "Student User"}
            </p>
            <p className="text-[11px] text-text-muted font-mono truncate">
              {user?.email || profile?.email || "student@srmist.edu.in"}
            </p>
          </div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-40">
        {content}
      </aside>

      {/* Mobile Overlay Drawer Portal */}
      {isOpenMobile && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[60] lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 max-w-xs h-full bg-surface shadow-soft">
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
