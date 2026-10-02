/**
 * ScrollProgress
 *
 * A thin gradient progress bar at the top of the viewport that fills as the
 * user scrolls the `.app-scroll` container. Falls back to the document on
 * public pages.
 *
 * Also provides a "Back to Top" button that appears after scrolling 20%.
 */
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface ScrollProgressProps {
  showBackToTop?: boolean;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  showBackToTop = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [showBtn, setShowBtn] = useState(false);
  const rafRef = useRef<number>(0);
  const reduced = useReducedEffects();

  useEffect(() => {
    const scrollEl =
      document.querySelector<HTMLElement>(".app-scroll") ??
      document.documentElement;

    const update = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollEl;
        const max = scrollHeight - clientHeight;
        const pct = max > 0 ? (scrollTop / max) * 100 : 0;
        setProgress(pct);
        setShowBtn(pct > 20);
      });
    };

    scrollEl.addEventListener("scroll", update, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", update);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scrollToTop = () => {
    const scrollEl =
      document.querySelector<HTMLElement>(".app-scroll") ??
      document.documentElement;
    scrollEl.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      {/* Progress bar */}
      <div
        aria-hidden="true"
        className="scroll-progress-bar"
        style={{ width: `${progress}%` }}
      />

      {/* Back to top */}
      {showBackToTop && (
        <AnimatePresence>
          {showBtn && (
            <motion.button
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="fixed bottom-24 right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center bg-surface-raised border border-border text-text-muted hover:text-accent hover:border-accent/50 shadow-soft-drop transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default ScrollProgress;
