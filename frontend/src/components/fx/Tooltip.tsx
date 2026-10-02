/**
 * Tooltip
 *
 * A consistent animated tooltip with an arrow, for icon-only buttons and
 * any element needing supplemental labeling.
 *
 * Usage:
 *   <Tooltip content="Save document" placement="top">
 *     <button ...>
 *   </Tooltip>
 */
import React, { useState, useRef, useEffect, cloneElement, isValidElement } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface TooltipProps {
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  children: React.ReactElement<any>;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = "top",
  delay = 400,
  children,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const targetRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = useReducedEffects();

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    if (!visible || !targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        break;
    }
    setCoords({ top, left });
  }, [visible, placement]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (disabled) return children;

  if (!isValidElement(children)) return children;

  // Use a wrapper div to attach events + ref without mutating child props unsafely
  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    width: 8,
    height: 8,
    background: "var(--tooltip-bg)",
    border: "1px solid var(--tooltip-border)",
    rotate: "45deg",
    ...(placement === "top"    ? { bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)" } : {}),
    ...(placement === "bottom" ? { top:    -5, left: "50%", transform: "translateX(-50%) rotate(45deg)" } : {}),
    ...(placement === "left"   ? { right:  -5, top:  "50%", transform: "translateY(-50%) rotate(45deg)" } : {}),
    ...(placement === "right"  ? { left:   -5, top:  "50%", transform: "translateY(-50%) rotate(45deg)" } : {}),
  };

  const transformOrigin =
    placement === "top"    ? "center bottom" :
    placement === "bottom" ? "center top"    :
    placement === "left"   ? "right center"  :
                             "left center";

  return (
    <>
      <div
        ref={targetRef as React.RefObject<HTMLDivElement>}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        style={{ display: "contents" }}
      >
        {children}
      </div>
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {visible && (
              <motion.div
                role="tooltip"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left,
                  transform:
                    placement === "top"    ? "translate(-50%, -100%)" :
                    placement === "bottom" ? "translate(-50%, 0)"     :
                    placement === "left"   ? "translate(-100%, -50%)" :
                                            "translate(0, -50%)",
                  transformOrigin,
                  zIndex: 9999,
                  pointerEvents: "none",
                }}
                className="bg-[var(--tooltip-bg)] border border-[var(--tooltip-border)] text-text-primary rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-xl whitespace-nowrap max-w-[200px]"
              >
                {content}
                <span aria-hidden="true" style={arrowStyle} />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
