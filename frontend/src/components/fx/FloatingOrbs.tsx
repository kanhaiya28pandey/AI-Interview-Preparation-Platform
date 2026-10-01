import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface FloatingOrbsProps {
  count?: number;
  className?: string;
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({ count = 3, className = "" }) => {
  const reduced = useReducedEffects();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const orbs = [
    {
      id: "orb-1",
      color: "bg-cyan-500/15 dark:bg-cyan-500/20",
      size: "w-72 h-72 sm:w-96 sm:h-96",
      top: "10%",
      left: "15%",
      animate: reduced || !isVisible
        ? {}
        : {
            x: [0, 40, -30, 0],
            y: [0, -30, 25, 0],
            scale: [1, 1.08, 0.95, 1],
          },
      duration: 18,
    },
    {
      id: "orb-2",
      color: "bg-violet-500/15 dark:bg-violet-500/20",
      size: "w-80 h-80 sm:w-[28rem] sm:h-[28rem]",
      top: "40%",
      right: "10%",
      animate: reduced || !isVisible
        ? {}
        : {
            x: [0, -35, 45, 0],
            y: [0, 35, -20, 0],
            scale: [1, 0.94, 1.06, 1],
          },
      duration: 22,
    },
    {
      id: "orb-3",
      color: "bg-pink-500/10 dark:bg-pink-500/15",
      size: "w-64 h-64 sm:w-80 sm:h-80",
      top: "70%",
      left: "30%",
      animate: reduced || !isVisible
        ? {}
        : {
            x: [0, 30, -25, 0],
            y: [0, -25, 30, 0],
            scale: [1, 1.05, 0.96, 1],
          },
      duration: 20,
    },
  ].slice(0, count);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
    >
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full blur-[90px] will-change-transform ${orb.color} ${orb.size}`}
          style={{
            top: orb.top,
            left: (orb as any).left,
            right: (orb as any).right,
          }}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingOrbs;
