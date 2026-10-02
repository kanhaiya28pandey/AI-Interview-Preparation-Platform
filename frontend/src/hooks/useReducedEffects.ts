import { useAppearance } from "@/context/AppearanceContext";

/**
 * Hook to check if motion and heavy visual effects should be reduced.
 * Respects both the user's explicit preference in Platform Settings and OS prefers-reduced-motion.
 */
export function useReducedEffects(): boolean {
  try {
    const { reducedEffects } = useAppearance();
    return reducedEffects;
  } catch {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  }
}
