/**
 * HotspotDot
 *
 * A pulsing ring that draws attention to a new feature or the "next best action".
 * It disappears after the user clicks or interacts with the target element.
 *
 * Saved per user via userScope so it does not show again after dismissal.
 *
 * Usage:
 *   <HotspotDot hotspotId="practice-track-new" label="New!">
 *     <button>...</button>
 *   </HotspotDot>
 */
import React from "react";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { useTour } from "@/context/TourContext";

interface HotspotDotProps {
  /** Unique ID — stored in userScope to track dismissal */
  hotspotId: string;
  /** Label shown next to the dot */
  label?: string;
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export const HotspotDot: React.FC<HotspotDotProps> = ({
  hotspotId,
  label = "New",
  color = "bg-cyan-400",
  children,
  className = "",
}) => {
  const reduced = useReducedEffects();
  const { isDismissed, dismiss } = useTour();

  const dismissed = isDismissed(`hotspot_${hotspotId}`);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onClick={() => !dismissed && dismiss(`hotspot_${hotspotId}`)}
    >
      {children}
      {!dismissed && (
        <span className="absolute -top-1 -right-1 flex items-center gap-1 pointer-events-none" aria-hidden="true">
          {/* Pulsing ring */}
          <span className="relative flex items-center justify-center">
            <span
              className={`absolute inline-flex h-3 w-3 rounded-full ${color} opacity-75 ${reduced ? "" : "hotspot-ring"}`}
            />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
          </span>
          {label && (
            <span
              className="text-[9px] font-mono font-bold uppercase tracking-wider px-1 py-0.5 rounded text-ink"
              style={{ background: "var(--accent-bright)" }}
            >
              {label}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default HotspotDot;
