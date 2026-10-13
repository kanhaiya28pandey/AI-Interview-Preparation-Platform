export interface ThemeVariant {
  gradientClass: string;
  meshStyle: string;
  orbs: string[];
  overlay: string;
  textColor: string;
  authorColor: string;
  accentColor: string;
  accentBorder: string;
  accentBg: string;
  accentGlow: string;
  badgeBg: string;
  cardBorder: string;
  quoteMarkColor: string;
}

export interface QuoteCategoryTheme {
  category: string;
  motif: "code" | "circles" | "embers" | "stars" | "leaves" | "mountains" | "aurora" | "target" | "speech";
  photoUrl: string;
  lottieUrl: string;
  dark: ThemeVariant;
  light: ThemeVariant;
}

export const QUOTE_THEMES: Record<string, QuoteCategoryTheme> = {
  Coding: {
    category: "Coding",
    motif: "code",
    photoUrl: "/quotes/coding.webp",
    lottieUrl: "/lottie/coding.json",
    dark: {
      gradientClass: "from-teal-950 via-[#0a1120] to-indigo-950",
      meshStyle: "radial-gradient(at 0% 0%, #115e59 0px, transparent 50%), radial-gradient(at 100% 100%, #312e81 0px, transparent 50%), radial-gradient(at 50% 50%, #0e7490 0px, transparent 50%)",
      orbs: ["#2dd4bf", "#6366f1", "#06b6d4", "#14b8a6"],
      overlay: "rgba(10, 15, 29, 0.48)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#2dd4bf",
      accentBorder: "border-teal-400/40",
      accentBg: "bg-teal-500/20",
      accentGlow: "rgba(45, 212, 191, 0.35)",
      badgeBg: "bg-teal-400/15 text-teal-300 border-teal-400/40",
      cardBorder: "border-teal-500/30",
      quoteMarkColor: "rgba(45, 212, 191, 0.22)",
    },
    // LIGHT MODE: sky blue to teal to indigo (mid-tones, saturated, edge-to-edge)
    light: {
      gradientClass: "from-sky-300 via-teal-300 to-indigo-300",
      meshStyle: "radial-gradient(at 0% 0%, #38bdf8 0px, transparent 55%), radial-gradient(at 100% 100%, #6366f1 0px, transparent 55%), radial-gradient(at 50% 50%, #14b8a6 0px, transparent 55%)",
      orbs: ["#0284c7", "#4f46e5", "#0d9488", "#06b6d4"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#0f766e",
      accentBorder: "border-teal-700/50",
      accentBg: "bg-teal-500/25",
      accentGlow: "rgba(15, 118, 110, 0.28)",
      badgeBg: "bg-teal-900/15 text-teal-950 border-teal-800/40 font-semibold",
      cardBorder: "border-teal-400/60",
      quoteMarkColor: "rgba(15, 118, 110, 0.25)",
    },
  },
  Consistency: {
    category: "Consistency",
    motif: "circles",
    photoUrl: "/quotes/consistency.webp",
    lottieUrl: "/lottie/target.json",
    dark: {
      gradientClass: "from-blue-950 via-[#0a0f26] to-purple-950",
      meshStyle: "radial-gradient(at 0% 0%, #1e3a8a 0px, transparent 50%), radial-gradient(at 100% 100%, #581c87 0px, transparent 50%), radial-gradient(at 50% 50%, #701a75 0px, transparent 50%)",
      orbs: ["#60a5fa", "#c084fc", "#e879f9", "#3b82f6"],
      overlay: "rgba(10, 14, 34, 0.5)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#60a5fa",
      accentBorder: "border-blue-400/40",
      accentBg: "bg-blue-500/20",
      accentGlow: "rgba(96, 165, 250, 0.35)",
      badgeBg: "bg-blue-400/15 text-blue-300 border-blue-400/40",
      cardBorder: "border-blue-500/30",
      quoteMarkColor: "rgba(96, 165, 250, 0.22)",
    },
    // LIGHT MODE: blue to violet to pink
    light: {
      gradientClass: "from-blue-300 via-violet-300 to-pink-300",
      meshStyle: "radial-gradient(at 0% 0%, #3b82f6 0px, transparent 55%), radial-gradient(at 100% 100%, #ec4899 0px, transparent 55%), radial-gradient(at 50% 50%, #8b5cf6 0px, transparent 55%)",
      orbs: ["#2563eb", "#7c3aed", "#db2777", "#3b82f6"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#1d4ed8",
      accentBorder: "border-blue-700/50",
      accentBg: "bg-blue-500/25",
      accentGlow: "rgba(29, 78, 216, 0.28)",
      badgeBg: "bg-blue-900/15 text-blue-950 border-blue-800/40 font-semibold",
      cardBorder: "border-blue-400/60",
      quoteMarkColor: "rgba(29, 78, 216, 0.25)",
    },
  },
  Discipline: {
    category: "Discipline",
    motif: "embers",
    photoUrl: "/quotes/discipline.webp",
    lottieUrl: "/lottie/rocket.json",
    dark: {
      gradientClass: "from-amber-950 via-[#180e12] to-rose-950",
      meshStyle: "radial-gradient(at 0% 0%, #78350f 0px, transparent 50%), radial-gradient(at 100% 100%, #881337 0px, transparent 50%), radial-gradient(at 50% 50%, #9a3412 0px, transparent 50%)",
      orbs: ["#fbbf24", "#fb7185", "#f97316", "#f59e0b"],
      overlay: "rgba(18, 12, 16, 0.5)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#fbbf24",
      accentBorder: "border-amber-400/40",
      accentBg: "bg-amber-500/20",
      accentGlow: "rgba(251, 191, 36, 0.35)",
      badgeBg: "bg-amber-400/15 text-amber-300 border-amber-400/40",
      cardBorder: "border-amber-500/30",
      quoteMarkColor: "rgba(251, 191, 36, 0.22)",
    },
    // LIGHT MODE: orange to amber to rose
    light: {
      gradientClass: "from-orange-300 via-amber-300 to-rose-300",
      meshStyle: "radial-gradient(at 0% 0%, #f97316 0px, transparent 55%), radial-gradient(at 100% 100%, #f43f5e 0px, transparent 55%), radial-gradient(at 50% 50%, #f59e0b 0px, transparent 55%)",
      orbs: ["#ea580c", "#d97706", "#e11d48", "#f97316"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#c2410c",
      accentBorder: "border-amber-700/50",
      accentBg: "bg-amber-500/25",
      accentGlow: "rgba(194, 65, 12, 0.28)",
      badgeBg: "bg-amber-900/15 text-amber-950 border-amber-800/40 font-semibold",
      cardBorder: "border-orange-400/60",
      quoteMarkColor: "rgba(194, 65, 12, 0.25)",
    },
  },
  Confidence: {
    category: "Confidence",
    motif: "stars",
    photoUrl: "/quotes/confidence.webp",
    lottieUrl: "/lottie/stars.json",
    dark: {
      gradientClass: "from-purple-950 via-[#120a1f] to-pink-950",
      meshStyle: "radial-gradient(at 0% 0%, #581c87 0px, transparent 50%), radial-gradient(at 100% 100%, #831843 0px, transparent 50%), radial-gradient(at 50% 50%, #701a75 0px, transparent 50%)",
      orbs: ["#c084fc", "#f472b6", "#fbbf24", "#a855f7"],
      overlay: "rgba(14, 10, 24, 0.5)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#c084fc",
      accentBorder: "border-purple-400/40",
      accentBg: "bg-purple-500/20",
      accentGlow: "rgba(192, 132, 252, 0.35)",
      badgeBg: "bg-purple-400/15 text-purple-300 border-purple-400/40",
      cardBorder: "border-purple-500/30",
      quoteMarkColor: "rgba(192, 132, 252, 0.22)",
    },
    // LIGHT MODE: purple to fuchsia to gold
    light: {
      gradientClass: "from-purple-300 via-fuchsia-300 to-amber-200",
      meshStyle: "radial-gradient(at 0% 0%, #a855f7 0px, transparent 55%), radial-gradient(at 100% 100%, #eab308 0px, transparent 55%), radial-gradient(at 50% 50%, #d946ef 0px, transparent 55%)",
      orbs: ["#9333ea", "#c026d3", "#ca8a04", "#7e22ce"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#7e22ce",
      accentBorder: "border-purple-700/50",
      accentBg: "bg-purple-500/25",
      accentGlow: "rgba(126, 34, 206, 0.28)",
      badgeBg: "bg-purple-900/15 text-purple-950 border-purple-800/40 font-semibold",
      cardBorder: "border-purple-400/60",
      quoteMarkColor: "rgba(126, 34, 206, 0.25)",
    },
  },
  Growth: {
    category: "Growth",
    motif: "leaves",
    photoUrl: "/quotes/growth.webp",
    lottieUrl: "/lottie/plant.json",
    dark: {
      gradientClass: "from-emerald-950 via-[#0a1814] to-teal-950",
      meshStyle: "radial-gradient(at 0% 0%, #064e3b 0px, transparent 50%), radial-gradient(at 100% 100%, #115e59 0px, transparent 50%), radial-gradient(at 50% 50%, #14532d 0px, transparent 50%)",
      orbs: ["#34d399", "#a3e635", "#2dd4bf", "#10b981"],
      overlay: "rgba(10, 20, 16, 0.5)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#34d399",
      accentBorder: "border-emerald-400/40",
      accentBg: "bg-emerald-500/20",
      accentGlow: "rgba(52, 211, 153, 0.35)",
      badgeBg: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
      cardBorder: "border-emerald-500/30",
      quoteMarkColor: "rgba(52, 211, 153, 0.22)",
    },
    // LIGHT MODE: emerald to lime to cyan
    light: {
      gradientClass: "from-emerald-300 via-lime-300 to-cyan-300",
      meshStyle: "radial-gradient(at 0% 0%, #10b981 0px, transparent 55%), radial-gradient(at 100% 100%, #06b6d4 0px, transparent 55%), radial-gradient(at 50% 50%, #84cc16 0px, transparent 55%)",
      orbs: ["#059669", "#65a30d", "#0891b2", "#10b981"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#047857",
      accentBorder: "border-emerald-700/50",
      accentBg: "bg-emerald-500/25",
      accentGlow: "rgba(4, 120, 87, 0.28)",
      badgeBg: "bg-emerald-900/15 text-emerald-950 border-emerald-800/40 font-semibold",
      cardBorder: "border-emerald-400/60",
      quoteMarkColor: "rgba(4, 120, 87, 0.25)",
    },
  },
  Perseverance: {
    category: "Perseverance",
    motif: "mountains",
    photoUrl: "/quotes/perseverance.webp",
    lottieUrl: "/lottie/rocket.json",
    dark: {
      gradientClass: "from-red-950 via-[#1a0f0d] to-amber-950",
      meshStyle: "radial-gradient(at 0% 0%, #7f1d1d 0px, transparent 50%), radial-gradient(at 100% 100%, #78350f 0px, transparent 50%), radial-gradient(at 50% 50%, #9a3412 0px, transparent 50%)",
      orbs: ["#f87171", "#fb923c", "#fde047", "#ef4444"],
      overlay: "rgba(20, 12, 10, 0.52)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#f87171",
      accentBorder: "border-red-400/40",
      accentBg: "bg-red-500/20",
      accentGlow: "rgba(248, 113, 113, 0.35)",
      badgeBg: "bg-red-400/15 text-red-300 border-red-400/40",
      cardBorder: "border-red-500/30",
      quoteMarkColor: "rgba(248, 113, 113, 0.22)",
    },
    // LIGHT MODE: red-orange to yellow
    light: {
      gradientClass: "from-rose-300 via-orange-300 to-amber-300",
      meshStyle: "radial-gradient(at 0% 0%, #f43f5e 0px, transparent 55%), radial-gradient(at 100% 100%, #eab308 0px, transparent 55%), radial-gradient(at 50% 50%, #f97316 0px, transparent 55%)",
      orbs: ["#e11d48", "#ea580c", "#ca8a04", "#ef4444"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#b91c1c",
      accentBorder: "border-red-700/50",
      accentBg: "bg-red-500/25",
      accentGlow: "rgba(185, 28, 28, 0.28)",
      badgeBg: "bg-red-900/15 text-red-950 border-red-800/40 font-semibold",
      cardBorder: "border-rose-400/60",
      quoteMarkColor: "rgba(185, 28, 28, 0.25)",
    },
  },
  Success: {
    category: "Success",
    motif: "aurora",
    photoUrl: "/quotes/success.webp",
    lottieUrl: "/lottie/trophy.json",
    dark: {
      gradientClass: "from-blue-950 via-[#0c1224] to-emerald-950",
      meshStyle: "radial-gradient(at 0% 0%, #1e3a8a 0px, transparent 50%), radial-gradient(at 100% 100%, #064e3b 0px, transparent 50%), radial-gradient(at 50% 50%, #581c87 0px, transparent 50%)",
      orbs: ["#38bdf8", "#34d399", "#a855f7", "#22d3ee"],
      overlay: "rgba(10, 16, 28, 0.5)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#38bdf8",
      accentBorder: "border-sky-400/40",
      accentBg: "bg-sky-500/20",
      accentGlow: "rgba(56, 189, 248, 0.35)",
      badgeBg: "bg-sky-400/15 text-sky-300 border-sky-400/40",
      cardBorder: "border-sky-500/30",
      quoteMarkColor: "rgba(56, 189, 248, 0.22)",
    },
    // LIGHT MODE: blue to mint to violet
    light: {
      gradientClass: "from-blue-300 via-teal-300 to-violet-300",
      meshStyle: "radial-gradient(at 0% 0%, #2563eb 0px, transparent 55%), radial-gradient(at 100% 100%, #8b5cf6 0px, transparent 55%), radial-gradient(at 50% 50%, #14b8a6 0px, transparent 55%)",
      orbs: ["#1d4ed8", "#0d9488", "#7c3aed", "#0284c7"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#1d4ed8",
      accentBorder: "border-blue-700/50",
      accentBg: "bg-blue-500/25",
      accentGlow: "rgba(29, 78, 216, 0.28)",
      badgeBg: "bg-blue-900/15 text-blue-950 border-blue-800/40 font-semibold",
      cardBorder: "border-blue-400/60",
      quoteMarkColor: "rgba(29, 78, 216, 0.25)",
    },
  },
  Focus: {
    category: "Focus",
    motif: "target",
    photoUrl: "/quotes/focus.webp",
    lottieUrl: "/lottie/target.json",
    dark: {
      gradientClass: "from-cyan-950 via-[#0a1420] to-violet-950",
      meshStyle: "radial-gradient(at 0% 0%, #164e63 0px, transparent 50%), radial-gradient(at 100% 100%, #4c1d95 0px, transparent 50%), radial-gradient(at 50% 50%, #1e1b4b 0px, transparent 50%)",
      orbs: ["#22d3ee", "#818cf8", "#a78bfa", "#06b6d4"],
      overlay: "rgba(10, 18, 30, 0.5)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#22d3ee",
      accentBorder: "border-cyan-400/40",
      accentBg: "bg-cyan-500/20",
      accentGlow: "rgba(34, 211, 238, 0.35)",
      badgeBg: "bg-cyan-400/15 text-cyan-300 border-cyan-400/40",
      cardBorder: "border-cyan-500/30",
      quoteMarkColor: "rgba(34, 211, 238, 0.22)",
    },
    // LIGHT MODE: cyan to sky to indigo
    light: {
      gradientClass: "from-cyan-300 via-sky-300 to-indigo-300",
      meshStyle: "radial-gradient(at 0% 0%, #06b6d4 0px, transparent 55%), radial-gradient(at 100% 100%, #6366f1 0px, transparent 55%), radial-gradient(at 50% 50%, #38bdf8 0px, transparent 55%)",
      orbs: ["#0891b2", "#0284c7", "#4f46e5", "#06b6d4"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#0369a1",
      accentBorder: "border-sky-700/50",
      accentBg: "bg-sky-500/25",
      accentGlow: "rgba(3, 105, 161, 0.28)",
      badgeBg: "bg-sky-900/15 text-sky-950 border-sky-800/40 font-semibold",
      cardBorder: "border-cyan-400/60",
      quoteMarkColor: "rgba(3, 105, 161, 0.25)",
    },
  },
  Interviews: {
    category: "Interviews",
    motif: "speech",
    photoUrl: "/quotes/interviews.webp",
    lottieUrl: "/lottie/stars.json",
    dark: {
      gradientClass: "from-indigo-950 via-[#0c1227] to-teal-950",
      meshStyle: "radial-gradient(at 0% 0%, #312e81 0px, transparent 50%), radial-gradient(at 100% 100%, #115e59 0px, transparent 50%), radial-gradient(at 50% 50%, #0369a1 0px, transparent 50%)",
      orbs: ["#818cf8", "#38bdf8", "#5eead4", "#6366f1"],
      overlay: "rgba(11, 17, 34, 0.5)",
      textColor: "text-white",
      authorColor: "text-slate-200",
      accentColor: "#818cf8",
      accentBorder: "border-indigo-400/40",
      accentBg: "bg-indigo-500/20",
      accentGlow: "rgba(129, 140, 248, 0.35)",
      badgeBg: "bg-indigo-400/15 text-indigo-300 border-indigo-400/40",
      cardBorder: "border-indigo-500/30",
      quoteMarkColor: "rgba(129, 140, 248, 0.22)",
    },
    // LIGHT MODE: indigo to sky blue to mint
    light: {
      gradientClass: "from-indigo-300 via-sky-300 to-emerald-300",
      meshStyle: "radial-gradient(at 0% 0%, #6366f1 0px, transparent 55%), radial-gradient(at 100% 100%, #10b981 0px, transparent 55%), radial-gradient(at 50% 50%, #38bdf8 0px, transparent 55%)",
      orbs: ["#4f46e5", "#0284c7", "#059669", "#6366f1"],
      overlay: "rgba(255, 255, 255, 0.16)",
      textColor: "text-slate-900",
      authorColor: "text-slate-800",
      accentColor: "#4338ca",
      accentBorder: "border-indigo-700/50",
      accentBg: "bg-indigo-500/25",
      accentGlow: "rgba(67, 56, 202, 0.28)",
      badgeBg: "bg-indigo-900/15 text-indigo-950 border-indigo-800/40 font-semibold",
      cardBorder: "border-indigo-400/60",
      quoteMarkColor: "rgba(67, 56, 202, 0.25)",
    },
  },
};

export function getQuoteTheme(categoryOrTheme?: string): QuoteCategoryTheme {
  const norm = (categoryOrTheme || "").toLowerCase();
  if (norm.includes("code") || norm.includes("program")) return QUOTE_THEMES.Coding;
  if (norm.includes("consist") || norm.includes("persist")) return QUOTE_THEMES.Consistency;
  if (norm.includes("disciplin") || norm.includes("habit")) return QUOTE_THEMES.Discipline;
  if (norm.includes("confiden") || norm.includes("belief")) return QUOTE_THEMES.Confidence;
  if (norm.includes("growth") || norm.includes("learn") || norm.includes("mindset")) return QUOTE_THEMES.Growth;
  if (norm.includes("persever") || norm.includes("resilien") || norm.includes("fail")) return QUOTE_THEMES.Perseverance;
  if (norm.includes("success") || norm.includes("win")) return QUOTE_THEMES.Success;
  if (norm.includes("focus") || norm.includes("priorit")) return QUOTE_THEMES.Focus;
  if (norm.includes("interview") || norm.includes("hr") || norm.includes("placement")) return QUOTE_THEMES.Interviews;
  return QUOTE_THEMES.Coding;
}
