import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  calculateProfileCompletion,
  UserProfile,
  getProfileVerdict,
  getProfileNudge,
} from "@/mocks/profileData";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { Button } from "@/components/ui/Button";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { Sparkles, ArrowRight } from "lucide-react";

// Hook for smooth score count-up in sync with ring fill animation
function useAnimatedScore(targetScore: number, durationMs = 1100): number {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setCurrentScore(targetScore);
      return;
    }

    let startTimestamp: number | null = null;
    const startScore = currentScore;
    const scoreDiff = targetScore - startScore;

    if (scoreDiff === 0) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextScore = Math.round(startScore + scoreDiff * easedProgress);

      setCurrentScore(nextScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetScore]);

  return currentScore;
}

export interface AvatarCompletionRingProps {
  profile?: Partial<UserProfile> | null;
  percentage?: number;
  name?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  showPill?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AvatarCompletionRing: React.FC<AvatarCompletionRingProps> = ({
  profile,
  percentage,
  name = "Student User",
  avatarUrl,
  size = "md",
  showLabel = false,
  showPill = true,
  onClick,
  className = "",
}) => {
  const navigate = useNavigate();

  // Determine target completion percentage
  const targetCompletion =
    percentage !== undefined
      ? percentage
      : profile
      ? calculateProfileCompletion(profile)
      : 0;

  const animatedScore = useAnimatedScore(targetCompletion);
  const imageSrc = avatarUrl || profile?.avatar;
  const verdict = getProfileVerdict(animatedScore);

  const showAvatarImage = Boolean(
    imageSrc &&
    imageSrc.trim() !== "" &&
    (profile?.isCustomAvatar || imageSrc.startsWith("data:") || imageSrc.startsWith("blob:")) &&
    !imageSrc.includes("default") &&
    !imageSrc.includes("unsplash.com/photo-1534528741775-53994a69daeb")
  );

  // Geometry configuration per size variant
  const sizeMap = {
    sm: {
      container: "w-10 h-10",
      svgSize: 40,
      cx: 20,
      cy: 20,
      radius: 17,
      strokeWidth: 3,
      photoSize: "w-8 h-8",
      pillText: "text-[9px] px-1.5 py-0.2 -bottom-1",
      fontSize: "text-[10px]",
      glowBlur: 6,
    },
    md: {
      container: "w-14 h-14",
      svgSize: 56,
      cx: 28,
      cy: 28,
      radius: 24,
      strokeWidth: 3.5,
      photoSize: "w-[42px] h-[42px]",
      pillText: "text-[10px] px-2 py-0.2 -bottom-1",
      fontSize: "text-xs",
      glowBlur: 8,
    },
    lg: {
      container: "w-20 h-20",
      svgSize: 80,
      cx: 40,
      cy: 40,
      radius: 34,
      strokeWidth: 4.5,
      photoSize: "w-[60px] h-[60px]",
      pillText: "text-[11px] px-2.5 py-0.5 -bottom-1.5",
      fontSize: "text-sm",
      glowBlur: 10,
    },
    xl: {
      container: "w-32 h-32",
      svgSize: 120,
      cx: 60,
      cy: 60,
      radius: 52,
      strokeWidth: 6,
      photoSize: "w-[94px] h-[94px]",
      pillText: "text-xs px-3 py-0.5 -bottom-2",
      fontSize: "text-base",
      glowBlur: 14,
    },
  };

  const currentSize = sizeMap[size];
  const circumference = 2 * Math.PI * currentSize.radius;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (targetCompletion < 100) {
      navigate("/onboarding");
    } else {
      navigate("/profile");
    }
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  return (
    <div
      onClick={handleClick}
      title={`Profile ${targetCompletion}% complete (${verdict.label}). Click to ${
        targetCompletion < 100 ? "complete profile" : "view profile"
      }.`}
      className={`relative inline-flex items-center justify-center cursor-pointer group shrink-0 ${className}`}
    >
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* SVG Progress Arc Ring */}
        <svg
          width={currentSize.svgSize}
          height={currentSize.svgSize}
          viewBox={`0 0 ${currentSize.svgSize} ${currentSize.svgSize}`}
          className="w-full h-full transform -rotate-90 absolute inset-0 z-10 overflow-visible"
        >
          {/* Background Track */}
          <circle
            cx={currentSize.cx}
            cy={currentSize.cy}
            r={currentSize.radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={currentSize.strokeWidth}
            className="transition-colors duration-200"
          />

          {/* Glowing Animated Progress Arc */}
          <circle
            cx={currentSize.cx}
            cy={currentSize.cy}
            r={currentSize.radius}
            fill="none"
            stroke={verdict.hex}
            strokeWidth={currentSize.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 ${currentSize.glowBlur}px ${verdict.hex})`,
              transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease",
            }}
          />
        </svg>

        {/* Inner Avatar Image cropped to circle */}
        <div
          className={`${currentSize.photoSize} rounded-full overflow-hidden bg-surface-raised border border-border/80 flex items-center justify-center text-cyan-400 font-serif font-bold z-20 transition-transform duration-200 group-hover:scale-105 shadow-inner`}
        >
          {showAvatarImage ? (
            <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className={currentSize.fontSize}>{initials}</span>
          )}
        </div>

        {/* Percentage Pill Badge Overlapping Bottom Edge */}
        {showPill && (
          <div
            className={`absolute z-30 rounded-full font-mono font-bold shadow-lg tracking-tight transition-transform duration-200 group-hover:scale-110 flex items-center justify-center ${currentSize.pillText}`}
            style={{ backgroundColor: verdict.hex, color: "#0d1321" }}
          >
            {animatedScore}%
          </div>
        )}
      </div>

      {showLabel && (
        <div className="ml-3 text-left">
          <p className="text-xs font-semibold text-text-primary group-hover:text-cyan-400 transition-colors">
            {name}
          </p>
          <p className={`text-[11px] font-mono ${verdict.colorClass}`}>
            {verdict.label} ({animatedScore}%)
          </p>
        </div>
      )}
    </div>
  );
};

/* RICHER PROFILE SUMMARY CARD COMPONENT */
interface ProfileSummaryCardProps {
  profile: Partial<UserProfile> | null;
  className?: string;
  compact?: boolean;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profile,
  className = "",
  compact = false,
}) => {
  const navigate = useNavigate();
  const completion = profile ? calculateProfileCompletion(profile) : 60;
  const updatedAgo = formatRelativeTime(profile?.updatedAt);
  const nudge = getProfileNudge(profile || {});

  return (
    <div
      className={`p-6 rounded-2xl bg-surface border border-border shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5 w-full md:w-auto">
        <AvatarCompletionRing profile={profile} size={compact ? "lg" : "xl"} />
        <div className="space-y-1">
          <VerdictHeadline prefix="Your Profile is " score={completion} size="lg" />
          <p className="text-xs text-text-muted font-mono">
            Updated {updatedAgo} &bull; Score: <span className="font-bold text-text-primary">{completion}%</span>
          </p>
          {completion < 100 && (
            <p className="text-xs text-cyan-400 font-medium flex items-center justify-center sm:justify-start gap-1 pt-0.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{nudge}</span>
            </p>
          )}
        </div>
      </div>

      {completion < 100 && (
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/onboarding")}
          className="gap-2 shrink-0 font-semibold text-xs shadow-glow w-full sm:w-auto"
        >
          <span>Complete Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
