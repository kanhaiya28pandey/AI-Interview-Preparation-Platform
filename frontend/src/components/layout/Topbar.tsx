import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Menu, LogOut, Shield, Sparkles, Bell, Search, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CommandPalette } from "@/components/common/CommandPalette";

export interface TopbarProps {
  onOpenMobileSidebar?: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar, title }) => {
  const { user, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(true);

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

  const mockNotifications = [
    { id: 1, title: "Mock Interview Scored", text: "Senior Frontend Round rating: 89/100", time: "10m ago" },
    { id: 2, title: "Campus Placement Alert", text: "Amazon SDE Drive registration closes in 2 days", time: "1h ago" },
    { id: 3, title: "Daily Practice Streak", text: "12 days in a row! Keep up the momentum.", time: "4h ago" },
  ];

  // Close notifications dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications]);

  return (
    <header className="h-16 border-b border-border bg-surface sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4 select-none shrink-0 shadow-sm">
      <CommandPalette />

      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileSidebar && (
          <Button variant="ghost" size="sm" onClick={onOpenMobileSidebar} className="lg:hidden p-2 h-auto text-text-secondary shrink-0">
            <Menu className="w-5 h-5" />
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

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 h-auto text-text-secondary hover:text-cyan-400 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1 right-1 animate-ping" />
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface-raised border border-border rounded-xl shadow-soft p-4 z-50 space-y-3 opacity-100">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="font-mono text-xs font-semibold text-text-primary">System Notifications</span>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-400/15 px-2 py-0.5 rounded-full">3 new</span>
              </div>
              <div className="space-y-2">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-surface border border-border text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-text-primary">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-text-muted font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
    </header>
  );
};
