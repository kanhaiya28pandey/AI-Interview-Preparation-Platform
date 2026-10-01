/**
 * PointerArrow
 *
 * An animated bouncing arrow that points toward a target element or direction.
 * Used for onboarding hints and "start here" nudges.
 *
 * Usage:
 *   <PointerArrow direction="right" label="Start here" />
 */
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ArrowDown, ArrowUp } from "lucide-react";
import { useReducedEffects } from "@/hooks/useReducedEffects";

type Direction = "up" | "down" | "left" | "right";

interface PointerArrowProps {
  direction?: Direction;
  label?: string;
  color?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ICON_MAP = {
  right: ArrowRight,
  left: ArrowLeft,
  down: ArrowDown,
  up: ArrowUp,
};

const BOUNCE = {
  right: { x: [0, 8, 0] },
  left:  { x: [0, -8, 0] },
  down:  { y: [0, 8, 0] },
  up:    { y: [0, -8, 0] },
};

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export const PointerArrow: React.FC<PointerArrowProps> = ({
  direction = "right",
  label,
  color = "text-cyan-400",
  className = "",
  size = "md",
}) => {
  const reduced = useReducedEffects();
  const Icon = ICON_MAP[direction];

  return (
    <div
      className={`inline-flex items-center gap-2 ${color} ${className}`}
      aria-hidden="true"
    >
      {label && (
        <span className="text-xs font-medium font-mono">{label}</span>
      )}
      <motion.span
        animate={reduced ? {} : BOUNCE[direction]}
        transition={
          reduced
            ? {}
            : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
        }
        className="flex"
      >
        <Icon className={SIZE_MAP[size]} />
      </motion.span>
    </div>
  );
};

export default PointerArrow;
