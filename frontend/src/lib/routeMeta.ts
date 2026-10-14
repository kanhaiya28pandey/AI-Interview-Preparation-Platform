import {
  LucideIcon,
  LayoutDashboard,
  Compass,
  BookOpen,
  FileText,
  Code2,
  Video,
  HelpCircle,
  Newspaper,
  Trophy,
  User,
  Settings,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Radio,
  Layers,
  Users,
  FolderTree,
  BarChart3,
} from "lucide-react";

export type RouteAccent = "cyan" | "violet" | "indigo" | "emerald" | "amber" | "slate" | "rose";

export interface RouteMeta {
  title: string;
  breadcrumbParent: string;
  breadcrumbChild: string;
  parentLink: string;
  icon: LucideIcon;
  role: "STUDENT" | "ADMIN";
  accent: RouteAccent;
}

export const ACCENT_CONFIG: Record<
  RouteAccent,
  {
    chip: string;
    underline: string;
  }
> = {
  cyan: {
    chip: "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/30 dark:border-cyan-400/40 text-cyan-600 dark:text-cyan-400 shadow-sm shadow-cyan-500/10 dark:shadow-[0_0_12px_rgba(6,182,212,0.25)]",
    underline: "from-cyan-500 via-sky-500 to-teal-400",
  },
  violet: {
    chip: "bg-violet-500/10 dark:bg-violet-500/15 border-violet-500/30 dark:border-violet-400/40 text-violet-600 dark:text-violet-400 shadow-sm shadow-violet-500/10 dark:shadow-[0_0_12px_rgba(139,92,246,0.25)]",
    underline: "from-violet-500 via-purple-500 to-indigo-400",
  },
  indigo: {
    chip: "bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/30 dark:border-indigo-400/40 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/10 dark:shadow-[0_0_12px_rgba(99,102,241,0.25)]",
    underline: "from-indigo-500 via-blue-500 to-cyan-400",
  },
  emerald: {
    chip: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 dark:border-emerald-400/40 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10 dark:shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    underline: "from-emerald-500 via-teal-500 to-cyan-400",
  },
  amber: {
    chip: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 dark:border-amber-400/40 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/10 dark:shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    underline: "from-amber-500 via-orange-500 to-yellow-400",
  },
  slate: {
    chip: "bg-slate-500/10 dark:bg-slate-400/15 border-slate-500/30 dark:border-slate-400/40 text-slate-700 dark:text-slate-300 shadow-sm shadow-slate-500/10 dark:shadow-[0_0_12px_rgba(148,163,184,0.25)]",
    underline: "from-slate-500 via-blue-500 to-sky-400",
  },
  rose: {
    chip: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 dark:border-rose-400/40 text-rose-600 dark:text-rose-400 shadow-sm shadow-rose-500/10 dark:shadow-[0_0_12px_rgba(244,63,94,0.25)]",
    underline: "from-rose-500 via-pink-500 to-amber-400",
  },
};

const ROUTES: Record<string, RouteMeta> = {
  // Student Routes
  "/dashboard": {
    title: "Student Dashboard",
    breadcrumbParent: "Student",
    breadcrumbChild: "Dashboard Overview",
    parentLink: "/dashboard",
    icon: LayoutDashboard,
    role: "STUDENT",
    accent: "cyan",
  },
  "/preparation": {
    title: "Prep Roadmaps",
    breadcrumbParent: "Student",
    breadcrumbChild: "Preparation Roadmaps",
    parentLink: "/dashboard",
    icon: Compass,
    role: "STUDENT",
    accent: "cyan",
  },
  "/practice": {
    title: "Practice Tracks",
    breadcrumbParent: "Student",
    breadcrumbChild: "Practice Tracks",
    parentLink: "/dashboard",
    icon: BookOpen,
    role: "STUDENT",
    accent: "cyan",
  },
  "/resume-analyzer": {
    title: "Resume Analyzer",
    breadcrumbParent: "Student",
    breadcrumbChild: "Resume Analyzer",
    parentLink: "/dashboard",
    icon: FileText,
    role: "STUDENT",
    accent: "violet",
  },
  "/coding": {
    title: "Coding Arena",
    breadcrumbParent: "Student",
    breadcrumbChild: "Coding Arena",
    parentLink: "/dashboard",
    icon: Code2,
    role: "STUDENT",
    accent: "indigo",
  },
  "/mock-interview": {
    title: "AI Mock Interview",
    breadcrumbParent: "Student",
    breadcrumbChild: "Mock Interview",
    parentLink: "/dashboard",
    icon: Video,
    role: "STUDENT",
    accent: "violet",
  },
  "/quiz": {
    title: "MCQ Quizzes",
    breadcrumbParent: "Student",
    breadcrumbChild: "Quizzes",
    parentLink: "/dashboard",
    icon: HelpCircle,
    role: "STUDENT",
    accent: "cyan",
  },
  "/articles": {
    title: "Articles & Guides",
    breadcrumbParent: "Student",
    breadcrumbChild: "Articles & Guides",
    parentLink: "/dashboard",
    icon: Newspaper,
    role: "STUDENT",
    accent: "cyan",
  },
  "/leaderboard": {
    title: "Campus Leaderboard",
    breadcrumbParent: "Student",
    breadcrumbChild: "Leaderboard",
    parentLink: "/dashboard",
    icon: Trophy,
    role: "STUDENT",
    accent: "emerald",
  },
  "/profile": {
    title: "My Profile",
    breadcrumbParent: "Student",
    breadcrumbChild: "Profile",
    parentLink: "/dashboard",
    icon: User,
    role: "STUDENT",
    accent: "cyan",
  },
  "/settings": {
    title: "Settings",
    breadcrumbParent: "Student",
    breadcrumbChild: "Settings",
    parentLink: "/dashboard",
    icon: Settings,
    role: "STUDENT",
    accent: "slate",
  },
  "/help": {
    title: "Help & Support",
    breadcrumbParent: "Student",
    breadcrumbChild: "Help Center",
    parentLink: "/dashboard",
    icon: LifeBuoy,
    role: "STUDENT",
    accent: "slate",
  },
  "/verify-identity": {
    title: "College ID Verification",
    breadcrumbParent: "Student",
    breadcrumbChild: "Verify Identity",
    parentLink: "/dashboard",
    icon: ShieldCheck,
    role: "STUDENT",
    accent: "amber",
  },
  "/onboarding": {
    title: "Profile Setup",
    breadcrumbParent: "Student",
    breadcrumbChild: "Onboarding Wizard",
    parentLink: "/dashboard",
    icon: Sparkles,
    role: "STUDENT",
    accent: "cyan",
  },
  "/live-tests": {
    title: "Live Tests & Contests",
    breadcrumbParent: "Student",
    breadcrumbChild: "Live Contests",
    parentLink: "/dashboard",
    icon: Radio,
    role: "STUDENT",
    accent: "rose",
  },

  // Admin Routes
  "/admin": {
    title: "Admin Dashboard Overview",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Dashboard Overview",
    parentLink: "/admin",
    icon: LayoutDashboard,
    role: "ADMIN",
    accent: "violet",
  },
  "/admin/content": {
    title: "Content Manager Hub",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Content Manager",
    parentLink: "/admin",
    icon: Layers,
    role: "ADMIN",
    accent: "violet",
  },
  "/admin/content-manager": {
    title: "Content Manager Hub",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Content Manager",
    parentLink: "/admin",
    icon: Layers,
    role: "ADMIN",
    accent: "violet",
  },
  "/admin/students": {
    title: "Candidate Profiles & Performance",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Candidate Directory",
    parentLink: "/admin",
    icon: Users,
    role: "ADMIN",
    accent: "violet",
  },
  "/admin/users": {
    title: "Candidate Profiles & Performance",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Users Directory",
    parentLink: "/admin",
    icon: Users,
    role: "ADMIN",
    accent: "violet",
  },
  "/admin/verifications": {
    title: "Student ID Verifications",
    breadcrumbParent: "Admin",
    breadcrumbChild: "ID Verifications",
    parentLink: "/admin",
    icon: ShieldCheck,
    role: "ADMIN",
    accent: "amber",
  },
  "/admin/coding-tests": {
    title: "Coding Tests Management",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Coding Tests",
    parentLink: "/admin",
    icon: Code2,
    role: "ADMIN",
    accent: "indigo",
  },
  "/admin/taxonomy": {
    title: "Domains & Topics Taxonomy",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Domains & Topics",
    parentLink: "/admin",
    icon: FolderTree,
    role: "ADMIN",
    accent: "violet",
  },
  "/admin/live-tests": {
    title: "Live Tests & Operations",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Live Tests",
    parentLink: "/admin",
    icon: Radio,
    role: "ADMIN",
    accent: "rose",
  },
  "/admin/mock-interviews": {
    title: "Mock Interview Track Configs",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Mock Interviews",
    parentLink: "/admin",
    icon: Video,
    role: "ADMIN",
    accent: "violet",
  },
  "/admin/articles": {
    title: "Articles CMS",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Articles CMS",
    parentLink: "/admin",
    icon: Newspaper,
    role: "ADMIN",
    accent: "violet",
  },
  "/admin/reports": {
    title: "Analytics & Reports",
    breadcrumbParent: "Admin",
    breadcrumbChild: "System Reports",
    parentLink: "/admin",
    icon: BarChart3,
    role: "ADMIN",
    accent: "cyan",
  },
  "/admin/settings": {
    title: "Platform Settings",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Settings",
    parentLink: "/admin",
    icon: Settings,
    role: "ADMIN",
    accent: "slate",
  },
  "/admin/help": {
    title: "Platform Support & Help Desk",
    breadcrumbParent: "Admin",
    breadcrumbChild: "Help Desk",
    parentLink: "/admin",
    icon: LifeBuoy,
    role: "ADMIN",
    accent: "slate",
  },
};

export function getRouteMeta(pathname: string, fallbackTitle?: string): RouteMeta {
  // Direct match
  if (ROUTES[pathname]) {
    return ROUTES[pathname];
  }

  // Prefix match (for routes like /admin/students/:id, /articles/:slug)
  const sortedKeys = Object.keys(ROUTES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (key !== "/" && pathname.startsWith(key)) {
      const match = ROUTES[key];
      // Special child handling for nested candidate detail
      if (key === "/admin/students" && pathname.length > key.length) {
        return {
          ...match,
          title: fallbackTitle || "Candidate Profile",
          breadcrumbChild: "Candidate Profile",
        };
      }
      return match;
    }
  }

  // Fallback based on admin vs student
  const isAdminPath = pathname.startsWith("/admin");
  return {
    title: fallbackTitle || (isAdminPath ? "Admin Portal" : "Dashboard"),
    breadcrumbParent: isAdminPath ? "Admin" : "Student",
    breadcrumbChild: fallbackTitle || (isAdminPath ? "Portal" : "Dashboard"),
    parentLink: isAdminPath ? "/admin" : "/dashboard",
    icon: LayoutDashboard,
    role: isAdminPath ? "ADMIN" : "STUDENT",
    accent: isAdminPath ? "violet" : "cyan",
  };
}
