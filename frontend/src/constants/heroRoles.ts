import {
  Code2,
  Server,
  Layers,
  BarChart3,
  Brain,
  Workflow,
  Cloud,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const ROTATE_MS = 1200;

export const ROLES = [
  "Frontend Engineers",
  "Backend Developers",
  "Full Stack Developers",
  "Data Analysts",
  "AI/ML Engineers",
  "DevOps Engineers",
  "Cloud Engineers",
  "Android Developers",
  "QA & Test Engineers",
  "Cybersecurity Analysts",
] as const;

export type RoleName = (typeof ROLES)[number];

export interface HeroRole {
  id: string;
  slug: string;
  label: RoleName;
  icon: LucideIcon;
  accentColor: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
}

export const HERO_ROLES: HeroRole[] = [
  {
    id: "frontend",
    slug: "frontend-engineers",
    label: "Frontend Engineers",
    icon: Code2,
    accentColor: "#22d3ee",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-400/30",
    bgColor: "bg-cyan-400/10",
    glowColor: "rgba(34, 211, 238, 0.35)",
  },
  {
    id: "backend",
    slug: "backend-developers",
    label: "Backend Developers",
    icon: Server,
    accentColor: "#38bdf8",
    textColor: "text-sky-400",
    borderColor: "border-sky-400/30",
    bgColor: "bg-sky-400/10",
    glowColor: "rgba(56, 189, 248, 0.35)",
  },
  {
    id: "fullstack",
    slug: "full-stack-developers",
    label: "Full Stack Developers",
    icon: Layers,
    accentColor: "#818cf8",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-400/30",
    bgColor: "bg-indigo-400/10",
    glowColor: "rgba(129, 140, 248, 0.35)",
  },
  {
    id: "data-analyst",
    slug: "data-analysts",
    label: "Data Analysts",
    icon: BarChart3,
    accentColor: "#34d399",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-400/30",
    bgColor: "bg-emerald-400/10",
    glowColor: "rgba(52, 211, 153, 0.35)",
  },
  {
    id: "ai-ml",
    slug: "ai-ml-engineers",
    label: "AI/ML Engineers",
    icon: Brain,
    accentColor: "#c084fc",
    textColor: "text-purple-400",
    borderColor: "border-purple-400/30",
    bgColor: "bg-purple-400/10",
    glowColor: "rgba(192, 132, 252, 0.35)",
  },
  {
    id: "devops",
    slug: "devops-engineers",
    label: "DevOps Engineers",
    icon: Workflow,
    accentColor: "#f472b6",
    textColor: "text-pink-400",
    borderColor: "border-pink-400/30",
    bgColor: "bg-pink-400/10",
    glowColor: "rgba(244, 114, 182, 0.35)",
  },
  {
    id: "cloud",
    slug: "cloud-engineers",
    label: "Cloud Engineers",
    icon: Cloud,
    accentColor: "#60a5fa",
    textColor: "text-blue-400",
    borderColor: "border-blue-400/30",
    bgColor: "bg-blue-400/10",
    glowColor: "rgba(96, 165, 250, 0.35)",
  },
  {
    id: "android",
    slug: "android-developers",
    label: "Android Developers",
    icon: Smartphone,
    accentColor: "#fb923c",
    textColor: "text-orange-400",
    borderColor: "border-orange-400/30",
    bgColor: "bg-orange-400/10",
    glowColor: "rgba(251, 146, 60, 0.35)",
  },
  {
    id: "qa",
    slug: "qa-test-engineers",
    label: "QA & Test Engineers",
    icon: CheckCircle2,
    accentColor: "#a3e635",
    textColor: "text-lime-400",
    borderColor: "border-lime-400/30",
    bgColor: "bg-lime-400/10",
    glowColor: "rgba(163, 230, 53, 0.35)",
  },
  {
    id: "cybersecurity",
    slug: "cybersecurity-analysts",
    label: "Cybersecurity Analysts",
    icon: ShieldCheck,
    accentColor: "#f87171",
    textColor: "text-red-400",
    borderColor: "border-red-400/30",
    bgColor: "bg-red-400/10",
    glowColor: "rgba(248, 113, 113, 0.35)",
  },
];
