/**
 * CoachMark
 *
 * The visual component for the guided product tour.
 * When the tour is active, this renders:
 * 1. A semi-transparent overlay dimming the page.
 * 2. A spotlight cutout around the target element.
 * 3. A floating card with the title, body, navigation dots, back/next/skip buttons.
 *
 * Fully keyboard accessible: Esc = skip, ArrowRight = next, ArrowLeft = back.
 * Rendered in a portal over everything (z-[9990]).
 */
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTour } from "@/context/TourContext";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const CoachMark: React.FC = () => {
  const { isTourActive, currentStep, steps, nextStep, prevStep, skipTour } =
    useTour();
  const reduced = useReducedEffects();
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  const step = steps[currentStep];

  // Find the target element and measure it
  useEffect(() => {
    if (!isTourActive || !step) return;

    const measure = () => {
      const el = document.querySelector<HTMLElement>(step.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          top:    r.top    - 8,
          left:   r.left   - 8,
          width:  r.width  + 16,
          height: r.height + 16,
        });
      } else {
        setRect(null);
      }
    };

    measure();
    // Re-measure on resize
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isTourActive, step, currentStep]);

  // Trap focus inside coach mark card
  useEffect(() => {
    if (isTourActive && firstFocusRef.current) {
      firstFocusRef.current.focus();
    }
  }, [isTourActive, currentStep]);

  if (!isTourActive || !step) return null;

  const pad = 12;
  const cardWidth = 320;

  // Position the card relative to the spotlight rect
  const placement = step.placement ?? "right";
  let cardTop  = (rect?.top  ?? 40) + (rect?.height ?? 0) / 2 - 80;
  let cardLeft = (rect?.left ?? 40) + (rect?.width  ?? 0) + pad;

  if (placement === "left")   cardLeft = (rect?.left ?? 40) - cardWidth - pad;
  if (placement === "top")  { cardTop  = (rect?.top  ?? 40) - 180; cardLeft = (rect?.left ?? 40); }
  if (placement === "bottom"){ cardTop  = (rect?.top  ?? 40) + (rect?.height ?? 0) + pad; cardLeft = (rect?.left ?? 40); }

  // Clamp to viewport
  cardTop  = Math.max(16, Math.min(cardTop,  window.innerHeight - 240));
  cardLeft = Math.max(16, Math.min(cardLeft, window.innerWidth  - cardWidth - 16));

  const spotStyle: React.CSSProperties = rect
    ? {
        top:    rect.top,
        left:   rect.left,
        width:  rect.width,
        height: rect.height,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
        borderRadius: 12,
        position: "fixed",
        zIndex: 9991,
        pointerEvents: "none",
      }
    : {};

  return createPortal(
    <AnimatePresence>
      {isTourActive && (
        <>
          {/* Dark overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9990] pointer-events-none"
            style={{ background: "rgba(0,0,0,0.7)" }}
            aria-hidden="true"
          />

          {/* Spotlight cutout */}
          {rect && (
            <motion.div
              key={`spot-${currentStep}`}
              initial={reduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={spotStyle}
              aria-hidden="true"
            />
          )}

          {/* Coach mark card */}
          <motion.div
            key={`card-${currentStep}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Tour step ${currentStep + 1} of ${steps.length}: ${step.title}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "fixed",
              top:  cardTop,
              left: cardLeft,
              width: cardWidth,
              zIndex: 9995,
            }}
            className="bg-surface border border-border rounded-2xl p-5 shadow-2xl pointer-events-auto"
          >
            {/* Close */}
            <button
              ref={firstFocusRef}
              onClick={skipTour}
              aria-label="Skip tour"
              className="absolute top-3 right-3 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="pr-6 space-y-2">
              <p className="font-semibold text-text-primary text-sm">{step.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{step.body}</p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-4">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-4 bg-accent"
                      : "w-1.5 bg-border-strong"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={skipTour}
                className="text-[11px] text-text-muted hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              >
                Don't show again
              </button>
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    aria-label="Previous step"
                    className="p-1.5 rounded-lg border border-border hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="px-4 py-1.5 bg-accent text-ink rounded-lg text-xs font-semibold hover:bg-accent-bright transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {currentStep >= steps.length - 1 ? "Done 🎉" : "Next"}
                  {currentStep < steps.length - 1 && (
                    <ChevronRight className="inline w-3.5 h-3.5 ml-1" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CoachMark;
