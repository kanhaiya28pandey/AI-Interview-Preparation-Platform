/**
 * SpotlightCard
 *
 * Wraps any card with a radial pointer-follow glow effect via CSS variables
 * `--mx` and `--my`. Add the `.spotlight-card` CSS class (defined in index.css)
 * so the ::before pseudo-element renders the glow.
 *
 * Also brightens the border near the pointer.
 */
import React, { useRef, useCallback } from "react";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const reduced = useReducedEffects();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        cardRef.current.style.setProperty("--mx", `${x}%`);
        cardRef.current.style.setProperty("--my", `${y}%`);
      });
    },
    [reduced]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    // Reset to center so glow fades gracefully via CSS transition
    cardRef.current.style.setProperty("--mx", "50%");
    cardRef.current.style.setProperty("--my", "50%");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        reduced ? "" : "spotlight-card",
        className
      )}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
