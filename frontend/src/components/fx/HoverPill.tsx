/**
 * HoverPill
 *
 * A sliding animated highlight that glides between items (list rows, tabs,
 * sidebar items). Uses framer-motion `layoutId` so the pill smoothly slides
 * from one active item to the next.
 *
 * Usage:
 *   <HoverPill layoutId="sidebar-nav" isActive={isActive} />
 *   Render one of these inside each nav item, passing the same layoutId.
 */
import React from "react";
import { motion } from "framer-motion";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface HoverPillProps {
  /** Unique shared key — all items in a group use the SAME layoutId */
  layoutId: string;
  /** Only the active/hovered item renders the pill */
  isActive: boolean;
  className?: string;
  /** Color variant */
  variant?: "accent" | "subtle" | "row";
}

export const HoverPill: React.FC<HoverPillProps> = ({
  layoutId,
  isActive,
  className = "",
  variant = "accent",
}) => {
  const reduced = useReducedEffects();

  if (!isActive) return null;

  const variantClass = {
    accent: "bg-cyan-400/15 border border-cyan-400/30",
    subtle: "bg-surface-raised",
    row:    "bg-surface-raised/70",
  }[variant];

  if (reduced) {
    return (
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-lg pointer-events-none ${variantClass} ${className}`}
      />
    );
  }

  return (
    <motion.span
      aria-hidden="true"
      layoutId={layoutId}
      className={`absolute inset-0 rounded-lg pointer-events-none ${variantClass} ${className}`}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    />
  );
};

export default HoverPill;
