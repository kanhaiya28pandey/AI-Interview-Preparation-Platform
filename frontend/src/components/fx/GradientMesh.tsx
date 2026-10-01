import React from "react";
import { motion } from "framer-motion";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface GradientMeshProps {
  className?: string;
  variant?: "aurora" | "sunset" | "ocean";
}

export const GradientMesh: React.FC<GradientMeshProps> = ({ className = "", variant = "aurora" }) => {
  const reduced = useReducedEffects();

  const getVariantStyles = () => {
    switch (variant) {
      case "sunset":
        return {
          c1: "rgba(245, 158, 11, 0.14)",
          c2: "rgba(236, 72, 153, 0.12)",
          c3: "rgba(139, 92, 246, 0.12)",
        };
      case "ocean":
        return {
          c1: "rgba(59, 130, 246, 0.14)",
          c2: "rgba(34, 211, 238, 0.12)",
          c3: "rgba(16, 185, 129, 0.12)",
        };
      case "aurora":
      default:
        return {
          c1: "rgba(20, 184, 166, 0.14)",
          c2: "rgba(34, 211, 238, 0.14)",
          c3: "rgba(139, 92, 246, 0.12)",
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
    >
      <motion.div
        className="absolute -top-[25%] -left-[20%] w-[80vw] h-[80vw] rounded-full blur-[100px] will-change-transform"
        style={{ background: `radial-gradient(circle, ${v.c1} 0%, transparent 70%)` }}
        animate={
          reduced
            ? {}
            : {
                x: [0, 40, -30, 0],
                y: [0, 30, -20, 0],
              }
        }
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] -right-[20%] w-[70vw] h-[70vw] rounded-full blur-[110px] will-change-transform"
        style={{ background: `radial-gradient(circle, ${v.c2} 0%, transparent 70%)` }}
        animate={
          reduced
            ? {}
            : {
                x: [0, -50, 30, 0],
                y: [0, -30, 40, 0],
              }
        }
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[20%] left-[20%] w-[75vw] h-[75vw] rounded-full blur-[120px] will-change-transform"
        style={{ background: `radial-gradient(circle, ${v.c3} 0%, transparent 70%)` }}
        animate={
          reduced
            ? {}
            : {
                x: [0, 30, -40, 0],
                y: [0, -25, 25, 0],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default GradientMesh;
