import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppearance, BackgroundStyle, MotionIntensity } from "@/context/AppearanceContext";

// ─── Opacity Multiplier based on Intensity ─────────────────────────────────────
function getIntensityMultiplier(intensity: MotionIntensity): number {
  switch (intensity) {
    case "low":
      return 0.65;
    case "high":
      return 1.45;
    case "medium":
    default:
      return 1.0;
  }
}

// ─── 1. Soft Orbs Layer ────────────────────────────────────────────────────────
const SoftOrbsLayer: React.FC<{ isDark: boolean; isPaused: boolean; intensity: MotionIntensity }> = ({
  isDark,
  isPaused,
  intensity,
}) => {
  const mult = getIntensityMultiplier(intensity);

  // Clearly visible: 25-40% opacity in dark mode, 30-50% in light mode
  const o1 = Math.min(1, Math.max(0.1, (isDark ? 0.36 : 0.44) * mult));
  const o2 = Math.min(1, Math.max(0.1, (isDark ? 0.32 : 0.40) * mult));
  const o3 = Math.min(1, Math.max(0.1, (isDark ? 0.30 : 0.38) * mult));
  const o4 = Math.min(1, Math.max(0.1, (isDark ? 0.28 : 0.36) * mult));
  const o5 = Math.min(1, Math.max(0.1, (isDark ? 0.34 : 0.42) * mult));
  const o6 = Math.min(1, Math.max(0.1, (isDark ? 0.26 : 0.34) * mult));

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Orb 1: Teal */}
      <div
        className="absolute rounded-full blur-[100px] will-change-transform w-80 h-80 sm:w-[32rem] sm:h-[32rem]"
        style={{
          top: "4%",
          left: "8%",
          backgroundColor: isDark ? `rgba(20, 184, 166, ${o1})` : `rgba(13, 148, 136, ${o1})`,
          animation: "orbFloat1 24s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />

      {/* Orb 2: Indigo */}
      <div
        className="absolute rounded-full blur-[110px] will-change-transform w-96 h-96 sm:w-[36rem] sm:h-[36rem]"
        style={{
          top: "28%",
          right: "5%",
          backgroundColor: isDark ? `rgba(99, 102, 241, ${o2})` : `rgba(79, 70, 229, ${o2})`,
          animation: "orbFloat2 30s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />

      {/* Orb 3: Violet */}
      <div
        className="absolute rounded-full blur-[105px] will-change-transform w-72 h-72 sm:w-[28rem] sm:h-[28rem]"
        style={{
          bottom: "10%",
          left: "20%",
          backgroundColor: isDark ? `rgba(139, 92, 246, ${o3})` : `rgba(124, 58, 237, ${o3})`,
          animation: "orbFloat3 26s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />

      {/* Orb 4: Amber Accent */}
      <div
        className="absolute rounded-full blur-[95px] will-change-transform w-64 h-64 sm:w-80 sm:h-80"
        style={{
          top: "52%",
          right: "24%",
          backgroundColor: isDark ? `rgba(245, 158, 11, ${o4})` : `rgba(217, 119, 6, ${o4})`,
          animation: "orbFloat4 32s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />

      {/* Orb 5: Cyan Glow */}
      <div
        className="absolute rounded-full blur-[110px] will-change-transform w-80 h-80 sm:w-[30rem] sm:h-[30rem]"
        style={{
          top: "1%",
          right: "30%",
          backgroundColor: isDark ? `rgba(34, 211, 238, ${o5})` : `rgba(14, 165, 233, ${o5})`,
          animation: "orbFloat5 36s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />

      {/* Orb 6: Rose Accent */}
      <div
        className="absolute rounded-full blur-[100px] will-change-transform w-60 h-60 sm:w-72 sm:h-72"
        style={{
          bottom: "22%",
          right: "12%",
          backgroundColor: isDark ? `rgba(244, 63, 94, ${o6})` : `rgba(225, 29, 72, ${o6})`,
          animation: "orbFloat6 28s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />

      <style>{`
        @keyframes orbFloat1 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(50px, -40px, 0) scale(1.08); }
          100% { transform: translate3d(-40px, 30px, 0) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-45px, 40px, 0) scale(0.94); }
          100% { transform: translate3d(55px, -30px, 0) scale(1.06); }
        }
        @keyframes orbFloat3 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(40px, -35px, 0) scale(1.06); }
          100% { transform: translate3d(-35px, 40px, 0) scale(0.96); }
        }
        @keyframes orbFloat4 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-50px, 35px, 0) scale(0.95); }
          100% { transform: translate3d(35px, -40px, 0) scale(1.07); }
        }
        @keyframes orbFloat5 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(35px, 45px, 0) scale(1.05); }
          100% { transform: translate3d(-45px, -25px, 0) scale(0.94); }
        }
        @keyframes orbFloat6 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-35px, -40px, 0) scale(1.05); }
          100% { transform: translate3d(40px, 35px, 0) scale(0.96); }
        }
      `}</style>
    </div>
  );
};

// ─── 2. Gradient Mesh Layer ──────────────────────────────────────────────────
const GradientMeshLayer: React.FC<{ isDark: boolean; isPaused: boolean; intensity: MotionIntensity }> = ({
  isDark,
  isPaused,
  intensity,
}) => {
  const mult = getIntensityMultiplier(intensity);

  const c1 = isDark
    ? `rgba(20, 184, 166, ${Math.min(1, 0.32 * mult)})`
    : `rgba(13, 148, 136, ${Math.min(1, 0.40 * mult)})`;
  const c2 = isDark
    ? `rgba(99, 102, 241, ${Math.min(1, 0.30 * mult)})`
    : `rgba(79, 70, 229, ${Math.min(1, 0.38 * mult)})`;
  const c3 = isDark
    ? `rgba(139, 92, 246, ${Math.min(1, 0.28 * mult)})`
    : `rgba(124, 58, 237, ${Math.min(1, 0.36 * mult)})`;
  const c4 = isDark
    ? `rgba(245, 158, 11, ${Math.min(1, 0.24 * mult)})`
    : `rgba(217, 119, 6, ${Math.min(1, 0.32 * mult)})`;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      <div
        className="absolute -top-[20%] -left-[15%] w-[85vw] h-[85vw] rounded-full blur-[115px] will-change-transform"
        style={{
          background: `radial-gradient(circle, ${c1} 0%, transparent 70%)`,
          animation: "meshDrift1 22s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />
      <div
        className="absolute top-[12%] -right-[20%] w-[78vw] h-[78vw] rounded-full blur-[125px] will-change-transform"
        style={{
          background: `radial-gradient(circle, ${c2} 0%, transparent 70%)`,
          animation: "meshDrift2 26s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />
      <div
        className="absolute -bottom-[20%] left-[12%] w-[82vw] h-[82vw] rounded-full blur-[125px] will-change-transform"
        style={{
          background: `radial-gradient(circle, ${c3} 0%, transparent 70%)`,
          animation: "meshDrift3 20s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />
      <div
        className="absolute bottom-[18%] right-[22%] w-[65vw] h-[65vw] rounded-full blur-[105px] will-change-transform"
        style={{
          background: `radial-gradient(circle, ${c4} 0%, transparent 70%)`,
          animation: "meshDrift4 24s ease-in-out infinite alternate",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      />

      <style>{`
        @keyframes meshDrift1 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(55px, -45px, 0); }
        }
        @keyframes meshDrift2 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-65px, 50px, 0); }
        }
        @keyframes meshDrift3 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(45px, -50px, 0); }
        }
        @keyframes meshDrift4 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-40px, -40px, 0); }
        }
      `}</style>
    </div>
  );
};

// ─── 3. Code Particles Layer ─────────────────────────────────────────────────
const CODE_SYMBOLS = [
  "{ }", "</>", "=>", ";", "fn", "0", "1", "const", "return", "[]", "()", "git", "if", "async", "true", "npm", "*", "!=", "let", "class"
];

interface ParticleData {
  id: number;
  symbol: string;
  left: string;
  duration: number;
  delay: number;
  drift: number;
  fontSize: number;
  opacity: number;
}

const CodeParticlesLayer: React.FC<{ isDark: boolean; isPaused: boolean; intensity: MotionIntensity }> = ({
  isDark,
  isPaused,
  intensity,
}) => {
  const mult = getIntensityMultiplier(intensity);
  const particleCount = intensity === "high" ? 40 : intensity === "low" ? 20 : 32;

  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const col = (i * (94 / particleCount) + (Math.sin(i * 99) * 2)) % 94 + 3;
      const duration = 20 + (i % 7) * 2.2;
      // Staggered negative delays so particles start immediately all over screen height
      const delay = -((i * 1.5) % duration);
      const drift = -25 + (i % 5) * 12;
      const fontSize = 11 + (i % 4);
      // Clearly visible: 15-25% opacity in dark, 20-30% in light (darker teal)
      const baseOpacity = isDark ? 0.16 + (i % 5) * 0.02 : 0.22 + (i % 5) * 0.02;
      const opacity = Math.min(0.45, Math.max(0.08, baseOpacity * mult));

      return {
        id: i,
        symbol: CODE_SYMBOLS[i % CODE_SYMBOLS.length],
        left: `${col}%`,
        duration,
        delay,
        drift,
        fontSize,
        opacity,
      };
    });
  }, [isDark, mult, particleCount]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute font-mono font-semibold will-change-transform select-none ${
            isDark ? "text-cyan-300" : "text-teal-800"
          }`}
          style={{
            left: p.left,
            fontSize: `${p.fontSize}px`,
            opacity: p.opacity,
            top: 0,
            animation: `codeParticleFloat ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            animationPlayState: isPaused ? "paused" : "running",
            ["--p-drift" as any]: `${p.drift}px`,
            ["--p-opacity" as any]: p.opacity,
          }}
        >
          {p.symbol}
        </span>
      ))}

      <style>{`
        @keyframes codeParticleFloat {
          0% {
            transform: translateY(105vh) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: var(--p-opacity, 0.18);
          }
          90% {
            opacity: var(--p-opacity, 0.18);
          }
          100% {
            transform: translateY(-25px) translateX(var(--p-drift, 0px));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// ─── 4. Code Rain (Matrix Canvas) Layer ───────────────────────────────────────
const MATRIX_CHARS = "0123456789{}<>/=;+*#!?:abcdefxyzλπΩΨ";

const CodeRainLayer: React.FC<{ isDark: boolean; isPaused: boolean; intensity: MotionIntensity }> = ({
  isDark,
  isPaused,
  intensity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isRunning = !isPaused;
    let width = 0;
    let height = 0;
    let columnStep = intensity === "high" ? 18 : intensity === "low" ? 28 : 22;
    let columns = 0;
    let drops: number[] = [];

    // Frame rate throttle: strictly capped at ~30 FPS
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    let lastFrameTime = performance.now();
    let slowFrameCounter = 0;

    const mult = getIntensityMultiplier(intensity);

    const setupCanvas = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;

      // Cap devicePixelRatio at 2 for high performance
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      columns = Math.floor(width / columnStep);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -(height / 14));
      }
    };

    setupCanvas();

    let resizeTimer: any = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupCanvas();
      }, 150);
    };
    window.addEventListener("resize", handleResize);

    const render = (now: number) => {
      if (!isRunning) return;

      const delta = now - lastFrameTime;
      if (delta < FRAME_INTERVAL) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = now - (delta % FRAME_INTERVAL);

      // Low-power safeguard
      if (delta > 85) {
        slowFrameCounter++;
        if (slowFrameCounter > 6 && columnStep < 38) {
          columnStep = Math.min(columnStep + 6, 38);
          columns = Math.floor(width / columnStep);
          drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -(height / 14)));
          slowFrameCounter = 0;
        }
      } else {
        slowFrameCounter = Math.max(0, slowFrameCounter - 1);
      }

      // Soft trail clearing
      ctx.fillStyle = isDark ? "rgba(13, 19, 33, 0.14)" : "rgba(248, 250, 252, 0.16)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';

      const fontSize = 15;
      const headOpacity = Math.min(1, (isDark ? 0.65 : 0.60) * mult);
      const bodyOpacity = Math.min(0.5, (isDark ? 0.26 : 0.25) * mult);

      for (let i = 0; i < columns; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * columnStep + 4;
        const y = drops[i] * fontSize;

        if (y > 0 && y < height + 40) {
          // Leading character: bright visible head
          ctx.fillStyle = isDark
            ? `rgba(34, 211, 238, ${headOpacity})`
            : `rgba(15, 118, 110, ${headOpacity})`;
          ctx.fillText(char, x, y);

          // Trailing character: visible body
          const prevChar = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          ctx.fillStyle = isDark
            ? `rgba(20, 184, 166, ${bodyOpacity})`
            : `rgba(13, 148, 136, ${bodyOpacity})`;
          ctx.fillText(prevChar, x, y - fontSize);
        }

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDark, isPaused, intensity]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

// ─── 5. Unified App Background Component ─────────────────────────────────────
export const AppBackground: React.FC = () => {
  const { backgroundStyle, isDark, intensity } = useAppearance();
  const [tabVisible, setTabVisible] = useState(true);

  // Tab visibility listener: pauses when hidden, immediately resumes on visible or focus
  useEffect(() => {
    const handleVisibility = () => {
      setTabVisible(document.visibilityState === "visible");
    };
    const handleFocus = () => setTabVisible(true);
    const handleBlur = () => {
      if (document.hidden) setTabVisible(false);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const isPaused = !tabVisible;
  const effectiveStyle: BackgroundStyle = backgroundStyle || "orbs";

  return (
    <div
      id="app-global-background"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      <AnimatePresence mode="wait">
        {effectiveStyle === "orbs" && (
          <motion.div
            key="bg-orbs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full absolute inset-0"
          >
            <SoftOrbsLayer isDark={isDark} isPaused={isPaused} intensity={intensity} />
          </motion.div>
        )}

        {effectiveStyle === "mesh" && (
          <motion.div
            key="bg-mesh"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full absolute inset-0"
          >
            <GradientMeshLayer isDark={isDark} isPaused={isPaused} intensity={intensity} />
          </motion.div>
        )}

        {effectiveStyle === "particles" && (
          <motion.div
            key="bg-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full absolute inset-0"
          >
            <CodeParticlesLayer isDark={isDark} isPaused={isPaused} intensity={intensity} />
          </motion.div>
        )}

        {effectiveStyle === "coderain" && (
          <motion.div
            key="bg-coderain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full absolute inset-0"
          >
            <CodeRainLayer isDark={isDark} isPaused={isPaused} intensity={intensity} />
          </motion.div>
        )}

        {effectiveStyle === "none" && null}
      </AnimatePresence>
    </div>
  );
};

export default AppBackground;
