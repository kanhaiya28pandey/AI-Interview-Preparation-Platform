import React, { useEffect, useState } from "react";
import { useReducedEffects } from "@/hooks/useReducedEffects";

export const CursorGlow: React.FC = () => {
  const reduced = useReducedEffects();
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;

    // Desktop check
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    let idleTimer: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(idleTimer);
    };
  }, [reduced]);

  if (reduced || !isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none select-none z-30 transition-opacity duration-500 will-change-transform"
      style={{
        top: pos.y,
        left: pos.x,
        transform: "translate(-50%, -50%)",
        width: "480px",
        height: "480px",
        background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 65%)",
        opacity: isVisible ? 0.35 : 0,
      }}
    />
  );
};

export default CursorGlow;
