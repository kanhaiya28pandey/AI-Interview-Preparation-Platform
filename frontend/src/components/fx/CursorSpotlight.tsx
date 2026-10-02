/**
 * CursorSpotlight
 *
 * A soft radial glow that follows the pointer across the `.app-scroll`
 * main content area (desktop only, throttled with rAF).
 *
 * Respects reduceEffects and touch devices.
 */
import React, { useEffect, useRef } from "react";
import { useReducedEffects } from "@/hooks/useReducedEffects";

export const CursorSpotlight: React.FC = () => {
  const spotRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const reduced = useReducedEffects();

  useEffect(() => {
    // Disable on touch devices and reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || isTouch) return;

    const scrollEl = document.querySelector<HTMLElement>(".app-scroll");
    if (!scrollEl) return;

    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!spotRef.current) return;
        const rect = scrollEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + scrollEl.scrollTop;
        spotRef.current.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
        spotRef.current.style.opacity = "1";
      });
    };

    const handleLeave = () => {
      if (spotRef.current) spotRef.current.style.opacity = "0";
    };

    // Pause when tab hidden
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && spotRef.current) {
        spotRef.current.style.opacity = "0";
      }
    };

    scrollEl.addEventListener("mousemove", handleMove);
    scrollEl.addEventListener("mouseleave", handleLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      scrollEl.removeEventListener("mousemove", handleMove);
      scrollEl.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      style={{ position: "absolute", inset: 0 }}
    >
      <div
        ref={spotRef}
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          opacity: 0,
          transition: "opacity 0.3s ease",
          willChange: "transform",
        }}
      />
    </div>
  );
};

export default CursorSpotlight;
