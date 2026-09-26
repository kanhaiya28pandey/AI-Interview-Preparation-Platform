import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  showSubtag?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className, showSubtag = true, size = "md" }) => {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <Link to="/" className={cn("inline-flex items-center gap-2.5 font-serif font-semibold tracking-tight group select-none", sizes[size], className)}>
      {/* Option A: AI Chat-Bubble SVG Icon */}
      <div className="relative flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Chat Bubble Body */}
          <path
            d="M6 14C6 8.47715 10.4772 4 16 4C21.5228 4 26 8.47715 26 14C26 19.5228 21.5228 24 16 24C14.1 24 12.3 23.47 10.8 22.5L6 24L7.5 19.2C6.53 17.7 6 15.9 6 14Z"
            fill="url(#chatAiGlow)"
            fillOpacity="0.15"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* AI Sparkle Star */}
          <path
            d="M16 9L17.2 12.8L21 14L17.2 15.2L16 19L14.8 15.2L11 14L14.8 12.8L16 9Z"
            fill="#22d3ee"
          />
          {/* Accent AI Dot */}
          <circle cx="21" cy="9" r="1.5" fill="#14b8a6" />
          <defs>
            <linearGradient id="chatAiGlow" x1="6" y1="4" x2="26" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
      </div>

      <span className="text-text-primary group-hover:text-cyan-400 transition-colors">
        AI Interview Prep
      </span>

      {showSubtag && (
        <span className="hidden sm:inline-flex text-[10px] font-mono text-text-muted border border-border px-2 py-0.5 rounded-full uppercase tracking-wider font-normal">
          Platform
        </span>
      )}
    </Link>
  );
};
