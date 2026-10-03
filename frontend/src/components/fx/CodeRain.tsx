/**
 * CodeRain
 *
 * A subtle "Matrix/code" style background layer.
 * Random code symbols and keywords drift downward at varying speeds.
 * Uses CSS animations only (no canvas) — respects reduced motion.
 * Max 12 animated elements as per performance rules.
 */
import React, { useMemo, useEffect, useState } from "react";
import { useReducedEffects } from "@/hooks/useReducedEffects";

const SYMBOLS = [
  "{ }", "</>", "=>", "fn", "if", "++", "[]", "//", "01", "&&",
  "!=", "::", "let", "null",
];

interface Particle {
  id: number;
  symbol: string;
  left: string;
  animDuration: string;
  delay: string;
  fontSize: string;
  opacity: number;
}

export const CodeRain: React.FC<{ count?: number }> = ({ count = 12 }) => {
  const reduced = useReducedEffects();
  const [paused, setPaused] = useState(false);

  // Pause when tab hidden
  useEffect(() => {
    const handler = () => setPaused(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: Math.min(count, 12) }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      left: `${5 + Math.random() * 90}%`,
      animDuration: `${12 + Math.random() * 20}s`,
      delay: `${-Math.random() * 20}s`,
      fontSize: `${9 + Math.random() * 5}px`,
      opacity: 0.05 + Math.random() * 0.1,
    }));
  }, [count]);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute font-mono text-accent-bright"
          style={{
            left: p.left,
            fontSize: p.fontSize,
            opacity: p.opacity,
            top: "-20px",
            animation: `codeRainFall ${p.animDuration} linear infinite`,
            animationDelay: p.delay,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {p.symbol}
        </span>
      ))}

      <style>{`
        @keyframes codeRainFall {
          0%   { transform: translateY(-20px);  opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(105vh);  opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CodeRain;
