import React from "react";

export interface VerdictHeadlineProps {
  /** Prefix text before verdict word, e.g. "Your Profile is ", "Your Score is ", "Your Interview was " */
  prefix?: string;
  /** Suffix text after verdict word, e.g. "!", " for Frontend Developer". Defaults to "!" */
  suffix?: string;
  /** Explicit verdict text (e.g. "Excellent", "Great", "Good", "Needs Work", "Accepted"). Derived from score if omitted. */
  verdict?: string;
  /** Score out of 100 (0-100). Determines color band if status is not explicitly set. */
  score?: number;
  /** Optional status override: "success" | "warning" | "danger" | "accent" | "excellent" | "great" | "good" | "poor" */
  status?: "success" | "warning" | "danger" | "accent" | "excellent" | "great" | "good" | "poor";
  /** Size variant: "sm" | "md" | "lg" | "xl". Default is "lg". */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether to show text glow text-shadow. Default is true. */
  glow?: boolean;
  /** HTML Tag element: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div". Default is "h2". */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  /** Additional CSS class names */
  className?: string;
}

export function getVerdictConfig(
  score?: number,
  verdictStr?: string,
  status?: string
) {
  let scoreVal = score !== undefined ? score : 100;

  // Infer score from explicit verdict text if score is missing
  if (score === undefined && verdictStr) {
    const v = verdictStr.toLowerCase();
    if (v.includes("excellent") || v.includes("outstanding") || v.includes("accepted") || v.includes("perfect")) {
      scoreVal = 95;
    } else if (v.includes("great") || v.includes("strong") || v.includes("passed") || v.includes("pass")) {
      scoreVal = 80;
    } else if (v.includes("good") || v.includes("fair") || v.includes("moderate") || v.includes("average")) {
      scoreVal = 55;
    } else if (v.includes("poor") || v.includes("needs work") || v.includes("incomplete") || v.includes("action") || v.includes("failed") || v.includes("fail")) {
      scoreVal = 25;
    }
  }

  // Infer from status override
  if (status) {
    if (status === "danger" || status === "poor") scoreVal = 25;
    else if (status === "warning" || status === "good") scoreVal = 55;
    else if (status === "accent" || status === "great") scoreVal = 80;
    else if (status === "success" || status === "excellent") scoreVal = 95;
  }

  // Color bands mapped per specs:
  // 90-100% -> "Excellent"/"Outstanding" in --success / green
  if (scoreVal >= 90) {
    return {
      defaultWord: "Excellent",
      colorClass: "text-emerald-600 dark:text-[#4ade80]",
      hex: "#4ade80",
      darkGlow: "0 0 16px rgba(74, 222, 128, 0.55)",
      lightGlow: "0 0 8px rgba(22, 163, 74, 0.3)",
    };
  }
  // 75-89% -> "Great"/"Strong" in --accent / cyan
  if (scoreVal >= 75) {
    return {
      defaultWord: "Great",
      colorClass: "text-cyan-700 dark:text-[#22d3ee]",
      hex: "#22d3ee",
      darkGlow: "0 0 16px rgba(34, 211, 238, 0.55)",
      lightGlow: "0 0 8px rgba(8, 145, 178, 0.3)",
    };
  }
  // 40-74% -> "Good"/"Fair" in --accent-bright / amber
  if (scoreVal >= 40) {
    return {
      defaultWord: "Good",
      colorClass: "text-amber-700 dark:text-[#f59e0b]",
      hex: "#f59e0b",
      darkGlow: "0 0 16px rgba(245, 158, 11, 0.55)",
      lightGlow: "0 0 8px rgba(217, 119, 6, 0.3)",
    };
  }
  // 0-39% -> "Poor"/"Needs Work" in --danger / red
  return {
    defaultWord: "Needs Work",
    colorClass: "text-rose-600 dark:text-[#f2867b]",
    hex: "#f2867b",
    darkGlow: "0 0 16px rgba(242, 134, 123, 0.55)",
    lightGlow: "0 0 8px rgba(220, 38, 38, 0.3)",
  };
}

export const VerdictHeadline: React.FC<VerdictHeadlineProps> = ({
  prefix = "Your Performance is ",
  suffix = "!",
  verdict,
  score,
  status,
  size = "lg",
  glow = true,
  as: Component = "h2",
  className = "",
}) => {
  const config = getVerdictConfig(score, verdict, status);
  const verdictWord = verdict || config.defaultWord;

  const sizeClasses = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl md:text-3xl",
    xl: "text-2xl sm:text-3xl md:text-4xl",
  };

  return (
    <Component
      className={`font-serif font-bold text-text-primary tracking-tight leading-snug ${sizeClasses[size]} ${className}`}
    >
      <span>{prefix}</span>
      <span
        className={`font-extrabold ${config.colorClass} transition-colors inline-block`}
        style={{
          textShadow: glow
            ? `0 0 14px ${config.hex}80`
            : undefined,
        }}
      >
        {verdictWord}
      </span>
      <span>{suffix}</span>
    </Component>
  );
};
