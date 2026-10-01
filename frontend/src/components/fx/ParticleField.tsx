import React, { useEffect, useRef } from "react";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface ParticleFieldProps {
  className?: string;
  symbolsOnly?: boolean;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedEffects();

  useEffect(() => {
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    const symbols = ["{ }", "</>", "01", "=>", "fn", "*"];
    const count = 12; // Maximum 12 elements as per rule 5

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      text: string;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      speedY: 0.2 + Math.random() * 0.4,
      speedX: (Math.random() - 0.5) * 0.2,
      text: symbols[Math.floor(Math.random() * symbols.length)],
      size: 11 + Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isLight = document.documentElement.classList.contains("light");
      const baseColor = isLight ? "6, 182, 212" : "34, 211, 238";

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        ctx.font = `600 ${p.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
        ctx.fillText(p.text, p.x, p.y);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        if (!isRunning) {
          isRunning = true;
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none z-0 ${className}`}
    />
  );
};

export default ParticleField;
