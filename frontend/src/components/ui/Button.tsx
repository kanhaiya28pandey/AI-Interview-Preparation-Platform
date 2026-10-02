import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline" | "gold-soft" | "teal-cyan" | "accent-soft";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] group";

  const variants = {
    primary:
      "bg-gradient-to-br from-teal-500 to-cyan-400 text-white dark:text-[#0d1321] font-semibold shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink border-none",
    "teal-cyan":
      "bg-gradient-to-br from-teal-500 to-cyan-400 text-white dark:text-[#0d1321] font-semibold shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink border-none",
    "gold-soft":
      "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 dark:border-cyan-400/30 hover:bg-cyan-500/25 dark:hover:bg-cyan-400/25 focus-visible:ring-2 focus-visible:ring-cyan-400/50 font-semibold dark:font-medium",
    "accent-soft":
      "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 dark:border-cyan-400/30 hover:bg-cyan-500/25 dark:hover:bg-cyan-400/25 focus-visible:ring-2 focus-visible:ring-cyan-400/50 font-semibold dark:font-medium",
    ghost:
      "bg-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary border border-transparent focus-visible:ring-2 focus-visible:ring-border",
    outline:
      "bg-transparent text-text-primary border border-border hover:bg-surface-raised hover:border-border-strong focus-visible:ring-2 focus-visible:ring-border",
    danger:
      "bg-danger text-white dark:text-ink font-semibold hover:bg-danger/90 focus-visible:ring-2 focus-visible:ring-danger/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-lg gap-2",
    lg: "px-6 py-3.5 text-base rounded-xl gap-2.5 font-semibold",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
};
