import React, { useEffect, useRef } from "react";
import { useReducedEffects } from "@/hooks/useReducedEffects";

export interface ConfettiTriggerOptions {
  particleCount?: number;
  origin?: { x: number; y: number }; // 0 to 1 coordinates (e.g. 0.5, 0.5)
  colors?: string[];
}

export function triggerConfetti(options: ConfettiTriggerOptions = {}) {
  if (typeof window === "undefined") return;

  // Check if reduced effects is active
  const isReduced =
    document.documentElement.getAttribute("data-reduced-effects") === "true" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isReduced) return;

  const count = options.particleCount || 60;
  const originX = options.origin?.x ?? 0.5;
  const originY = options.origin?.y ?? 0.5;
  const colors = options.colors || ["#22d3ee", "#14b8a6", "#8b5cf6", "#f43f5e", "#fbbf24", "#34d399"];

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const startX = canvas.width * originX;
  const startY = canvas.height * originY;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRotation: number;
    opacity: number;
    decay: number;
    gravity: number;
  }

  const particles: Particle[] = Array.from({ length: count }).map(() => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    return {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 5 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 12,
      opacity: 1,
      decay: 0.015 + Math.random() * 0.015,
      gravity: 0.25,
    };
  });

  let animId: number;

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;

    particles.forEach((p) => {
      if (p.opacity <= 0) return;
      activeParticles++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRotation;
      p.opacity -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (activeParticles > 0) {
      animId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };

  animId = requestAnimationFrame(render);
}

export const ConfettiEffect: React.FC<{ trigger?: boolean; onComplete?: () => void }> = ({
  trigger = false,
  onComplete,
}) => {
  const reduced = useReducedEffects();

  useEffect(() => {
    if (trigger && !reduced) {
      triggerConfetti();
      if (onComplete) {
        const timer = setTimeout(onComplete, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [trigger, reduced, onComplete]);

  return null;
};

export default ConfettiEffect;
