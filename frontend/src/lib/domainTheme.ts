/**
 * getDomainTheme
 *
 * Returns a consistent color/gradient theme for a domain slug.
 * Used everywhere a domain appears: practice cards, quiz chips,
 * coding arena, mock interviews, articles, admin taxonomy.
 *
 * Each domain always renders in the SAME colors, no matter where
 * it appears in the app.
 */

export interface DomainTheme {
  /** Primary accent color (hex) */
  color: string;
  /** Secondary accent color (hex) */
  colorSecondary: string;
  /** Tailwind bg class for cards */
  bgClass: string;
  /** Tailwind text class for headings */
  textClass: string;
  /** Tailwind border class */
  borderClass: string;
  /** Inline gradient string for SVG fills etc. */
  gradient: string;
  /** CSS class from index.css domain presets */
  domainClass: string;
  /** Emoji icon for the domain */
  emoji: string;
  /** Display label */
  label: string;
}

const DOMAIN_MAP: Record<string, DomainTheme> = {
  frontend: {
    color: "#f472b6",
    colorSecondary: "#a78bfa",
    bgClass: "bg-domain-frontend",
    textClass: "text-pink-400",
    borderClass: "border-pink-500/30",
    gradient: "linear-gradient(135deg,#f472b6,#a78bfa)",
    domainClass: "bg-domain-frontend",
    emoji: "⚛️",
    label: "Frontend",
  },
  backend: {
    color: "#34d399",
    colorSecondary: "#22d3ee",
    bgClass: "bg-domain-backend",
    textClass: "text-emerald-400",
    borderClass: "border-emerald-500/30",
    gradient: "linear-gradient(135deg,#34d399,#22d3ee)",
    domainClass: "bg-domain-backend",
    emoji: "⚙️",
    label: "Backend",
  },
  "ai-ml": {
    color: "#a78bfa",
    colorSecondary: "#3b82f6",
    bgClass: "bg-domain-aiml",
    textClass: "text-violet-400",
    borderClass: "border-violet-500/30",
    gradient: "linear-gradient(135deg,#a78bfa,#3b82f6)",
    domainClass: "bg-domain-aiml",
    emoji: "🤖",
    label: "AI / ML",
  },
  aiml: {
    color: "#a78bfa",
    colorSecondary: "#3b82f6",
    bgClass: "bg-domain-aiml",
    textClass: "text-violet-400",
    borderClass: "border-violet-500/30",
    gradient: "linear-gradient(135deg,#a78bfa,#3b82f6)",
    domainClass: "bg-domain-aiml",
    emoji: "🤖",
    label: "AI / ML",
  },
  devops: {
    color: "#fbbf24",
    colorSecondary: "#f97316",
    bgClass: "bg-domain-devops",
    textClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    gradient: "linear-gradient(135deg,#fbbf24,#f97316)",
    domainClass: "bg-domain-devops",
    emoji: "🐳",
    label: "DevOps",
  },
  data: {
    color: "#38bdf8",
    colorSecondary: "#14b8a6",
    bgClass: "bg-domain-data",
    textClass: "text-sky-400",
    borderClass: "border-sky-500/30",
    gradient: "linear-gradient(135deg,#38bdf8,#14b8a6)",
    domainClass: "bg-domain-data",
    emoji: "📊",
    label: "Data Science",
  },
  security: {
    color: "#fb7185",
    colorSecondary: "#dc2626",
    bgClass: "bg-domain-security",
    textClass: "text-rose-400",
    borderClass: "border-rose-500/30",
    gradient: "linear-gradient(135deg,#fb7185,#dc2626)",
    domainClass: "bg-domain-security",
    emoji: "🔐",
    label: "Security",
  },
  hr: {
    color: "#fbbf24",
    colorSecondary: "#f472b6",
    bgClass: "bg-domain-hr",
    textClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    gradient: "linear-gradient(135deg,#fbbf24,#f472b6)",
    domainClass: "bg-domain-hr",
    emoji: "🤝",
    label: "HR / Soft Skills",
  },
  aptitude: {
    color: "#a3e635",
    colorSecondary: "#34d399",
    bgClass: "bg-domain-aptitude",
    textClass: "text-lime-400",
    borderClass: "border-lime-500/30",
    gradient: "linear-gradient(135deg,#a3e635,#34d399)",
    domainClass: "bg-domain-aptitude",
    emoji: "🧮",
    label: "Aptitude",
  },
  dsa: {
    color: "#34d399",
    colorSecondary: "#22d3ee",
    bgClass: "bg-domain-backend",
    textClass: "text-emerald-400",
    borderClass: "border-emerald-500/30",
    gradient: "linear-gradient(135deg,#34d399,#22d3ee)",
    domainClass: "bg-domain-backend",
    emoji: "🌳",
    label: "DSA",
  },
  system: {
    color: "#38bdf8",
    colorSecondary: "#a78bfa",
    bgClass: "bg-domain-data",
    textClass: "text-sky-400",
    borderClass: "border-sky-500/30",
    gradient: "linear-gradient(135deg,#38bdf8,#a78bfa)",
    domainClass: "bg-domain-data",
    emoji: "🏗️",
    label: "System Design",
  },
};

/** Default fallback for unknown domains */
const DEFAULT_THEME: DomainTheme = {
  color: "#22d3ee",
  colorSecondary: "#14b8a6",
  bgClass: "bg-domain-backend",
  textClass: "text-cyan-400",
  borderClass: "border-cyan-500/30",
  gradient: "linear-gradient(135deg,#22d3ee,#14b8a6)",
  domainClass: "bg-domain-backend",
  emoji: "💡",
  label: "General",
};

/**
 * Normalize a domain name/slug to a canonical key.
 * Handles spaces, hyphens, underscores and case differences.
 */
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Get the design theme for a domain.
 * Pass the domain's slug, name or any variant — it will normalize it.
 *
 * @example
 * const theme = getDomainTheme("frontend");
 * <div className={theme.bgClass}>...</div>
 */
export function getDomainTheme(slug: string): DomainTheme {
  if (!slug) return DEFAULT_THEME;
  const key = normalizeSlug(slug);

  // Direct match
  if (DOMAIN_MAP[key]) return DOMAIN_MAP[key];

  // Partial / contains match
  for (const [mapKey, theme] of Object.entries(DOMAIN_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) {
      return theme;
    }
  }

  return DEFAULT_THEME;
}

export { DOMAIN_MAP, DEFAULT_THEME };
