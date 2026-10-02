/**
 * useScrollContainer
 *
 * Returns the nearest `.app-scroll` ancestor element — the one and only
 * scroll container in the logged-in app shell.
 *
 * Use this instead of `window` / `document` for:
 *   - scroll-to-top on route change
 *   - back-to-top buttons
 *   - scroll event listeners
 *   - IntersectionObserver `root` option
 *
 * On public pages (landing, login, etc.) where no `.app-scroll` wrapper
 * exists, the hook falls back to `document.documentElement` so callers do
 * not need conditional logic.
 *
 * Usage:
 *   const scrollEl = useScrollContainer();
 *   scrollEl?.scrollTo({ top: 0, behavior: 'smooth' });
 */
import { useRef, useEffect } from "react";

export function useScrollContainer(): HTMLElement | null {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Walk up from body looking for the first .app-scroll element.
    const el = document.querySelector<HTMLElement>(".app-scroll");
    ref.current = el ?? document.documentElement;
  }, []);

  return ref.current;
}

export default useScrollContainer;
