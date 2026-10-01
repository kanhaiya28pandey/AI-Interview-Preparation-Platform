import { Shield, GraduationCap, LucideIcon } from "lucide-react";

export interface RoleMeta {
  key: "ADMIN" | "STUDENT";
  label: string;
  icon: LucideIcon;
  classes: string;
  dotColor: string;
}

export function getRoleMeta(role?: string | null): RoleMeta {
  if (!role || typeof role !== "string") {
    return {
      key: "STUDENT",
      label: "Student",
      icon: GraduationCap,
      classes: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
      dotColor: "bg-cyan-400",
    };
  }

  const normalized = role.trim().toUpperCase().replace(/^ROLE_/, "");

  if (normalized === "ADMIN") {
    return {
      key: "ADMIN",
      label: "Admin",
      icon: Shield,
      classes: "bg-amber-500/15 text-amber-400 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
      dotColor: "bg-amber-400",
    };
  }

  return {
    key: "STUDENT",
    label: "Student",
    icon: GraduationCap,
    classes: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
    dotColor: "bg-cyan-400",
  };
}
