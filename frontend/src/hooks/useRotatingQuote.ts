import { useState, useEffect, useRef, useCallback } from "react";
import type { MotivationalQuote } from "@/data/motivationalQuotes";

export type QuoteItem = MotivationalQuote;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useRotatingQuote(
  quotes: QuoteItem[] = [],
  intervalMs: number = 8000
) {
  const [currentQuote, setCurrentQuote] = useState<QuoteItem | null>(() => {
    return quotes.length > 0 ? quotes[0] : null;
  });

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const bagRef = useRef<QuoteItem[]>([]);
  const lastQuoteRef = useRef<QuoteItem | null>(currentQuote);
  const tempPauseUntilRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync lastQuoteRef with currentQuote
  useEffect(() => {
    lastQuoteRef.current = currentQuote;
  }, [currentQuote]);

  // Refill and draw from shuffle bag
  const drawNextQuote = useCallback((): QuoteItem | null => {
    if (!quotes || quotes.length === 0) {
      return null;
    }
    if (quotes.length === 1) {
      return quotes[0];
    }

    // If the bag is empty, refill and shuffle
    if (bagRef.current.length === 0) {
      let newBag = shuffle(quotes);
      // Ensure the first quote of the new bag is not identical to the last shown quote
      if (
        lastQuoteRef.current &&
        newBag.length > 1 &&
        newBag[0].id === lastQuoteRef.current.id
      ) {
        // Swap with the last item in the bag
        const lastIdx = newBag.length - 1;
        [newBag[0], newBag[lastIdx]] = [newBag[lastIdx], newBag[0]];
      }
      bagRef.current = newBag;
    }

    const nextQuote = bagRef.current.shift() || null;
    return nextQuote;
  }, [quotes]);

  // Synchronize when the quotes collection changes (e.g., filtering favorites)
  useEffect(() => {
    if (!quotes || quotes.length === 0) {
      setCurrentQuote(null);
      bagRef.current = [];
      return;
    }

    // If current quote is still in the new list, keep it; otherwise pick a new one
    const exists = currentQuote && quotes.some((q) => q.id === currentQuote.id);
    if (!exists) {
      let initialBag = shuffle(quotes);
      const first = initialBag.shift() || quotes[0];
      setCurrentQuote(first);
      bagRef.current = initialBag;
    } else {
      // Re-filter bag to only contain valid remaining quotes
      bagRef.current = bagRef.current.filter((q) =>
        quotes.some((item) => item.id === q.id && item.id !== currentQuote.id)
      );
    }
  }, [quotes]);

  // Trigger next quote manually (Sync button or action)
  const next = useCallback(() => {
    const nextQ = drawNextQuote();
    if (nextQ) {
      setCurrentQuote(nextQ);
    }
  }, [drawNextQuote]);

  // Pause auto-rotation for a temporary duration (e.g. 3500ms when copying or favoriting)
  const pauseTemporarily = useCallback((durationMs: number = 3500) => {
    tempPauseUntilRef.current = Date.now() + durationMs;
  }, []);

  // Timer effect for auto-rotation
  useEffect(() => {
    if (!quotes || quotes.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const tick = () => {
      // Pause if tab is hidden
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      // Pause if hovered
      if (isHovered) {
        return;
      }
      // Pause if temporary interaction delay is active
      if (Date.now() < tempPauseUntilRef.current) {
        return;
      }

      const nextQ = drawNextQuote();
      if (nextQ) {
        setCurrentQuote(nextQ);
      }
    };

    timerRef.current = setInterval(tick, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quotes, intervalMs, isHovered, drawNextQuote]);

  return {
    quote: currentQuote,
    next,
    isHovered,
    setIsHovered,
    pauseTemporarily,
  };
}

export default useRotatingQuote;
