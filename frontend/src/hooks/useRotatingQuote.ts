import { useState, useEffect, useRef, useCallback } from "react";
import { type MotivationalQuote, getTodaysQuote } from "@/data/motivationalQuotes";

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
  // Pick today's quote on first mount if present in the pool
  const todaysQuote = getTodaysQuote();

  const [currentQuote, setCurrentQuote] = useState<QuoteItem | null>(() => {
    if (!quotes || quotes.length === 0) return null;
    const matchToday = quotes.find((q) => q.id === todaysQuote.id);
    return matchToday || quotes[0];
  });

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const historyRef = useRef<QuoteItem[]>([]);
  const bagRef = useRef<QuoteItem[]>([]);
  const lastQuoteRef = useRef<QuoteItem | null>(currentQuote);
  const tempPauseUntilRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  // Sync lastQuoteRef with currentQuote and record into history
  useEffect(() => {
    lastQuoteRef.current = currentQuote;
    if (currentQuote) {
      // Don't push duplicate consecutive entries into history
      const lastHist = historyRef.current[historyRef.current.length - 1];
      if (!lastHist || lastHist.id !== currentQuote.id) {
        historyRef.current.push(currentQuote);
        if (historyRef.current.length > 50) {
          historyRef.current.shift();
        }
      }
    }
  }, [currentQuote]);

  // Refill and draw from shuffle bag
  const drawNextQuote = useCallback((): QuoteItem | null => {
    if (!quotes || quotes.length === 0) return null;
    if (quotes.length === 1) return quotes[0];

    // If bag is empty, refill without immediate repeat of last quote
    if (bagRef.current.length === 0) {
      let newBag = shuffle(quotes);
      if (
        lastQuoteRef.current &&
        newBag.length > 1 &&
        newBag[0].id === lastQuoteRef.current.id
      ) {
        const lastIdx = newBag.length - 1;
        [newBag[0], newBag[lastIdx]] = [newBag[lastIdx], newBag[0]];
      }
      bagRef.current = newBag;
    }

    return bagRef.current.shift() || null;
  }, [quotes]);

  // Reset timer & progress on quote transition
  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    elapsedBeforePauseRef.current = 0;
    setProgress(0);
  }, []);

  // Manual next
  const next = useCallback(() => {
    const nextQ = drawNextQuote();
    if (nextQ) {
      setCurrentQuote(nextQ);
      resetTimer();
    }
  }, [drawNextQuote, resetTimer]);

  // Manual prev
  const prev = useCallback(() => {
    if (historyRef.current.length > 1) {
      // Remove current
      historyRef.current.pop();
      // Get previous
      const prevQ = historyRef.current.pop();
      if (prevQ) {
        setCurrentQuote(prevQ);
        resetTimer();
        return;
      }
    }
    // Fallback if at start of history: pick another from bag
    next();
  }, [next, resetTimer]);

  // Pause auto-rotation for a temporary duration (e.g. 3500ms when copying)
  const pauseTemporarily = useCallback((durationMs: number = 3500) => {
    tempPauseUntilRef.current = Date.now() + durationMs;
  }, []);

  // Synchronize when the quotes collection changes (e.g., filtering favorites)
  useEffect(() => {
    if (!quotes || quotes.length === 0) {
      setCurrentQuote(null);
      bagRef.current = [];
      setProgress(0);
      return;
    }

    const exists = currentQuote && quotes.some((q) => q.id === currentQuote.id);
    if (!exists) {
      const matchToday = quotes.find((q) => q.id === todaysQuote.id);
      setCurrentQuote(matchToday || quotes[0]);
      bagRef.current = shuffle(quotes.filter((q) => q.id !== (matchToday || quotes[0]).id));
      resetTimer();
    } else {
      bagRef.current = bagRef.current.filter((q) =>
        quotes.some((item) => item.id === q.id && item.id !== currentQuote.id)
      );
    }
  }, [quotes]);

  // Progress tick & auto-rotation loop
  useEffect(() => {
    if (!quotes || quotes.length <= 1) {
      setProgress(0);
      return;
    }

    const interval = 80; // 80ms resolution for smooth progress bar
    const timer = setInterval(() => {
      // Pause if tab is hidden
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      // Pause if hovered or temporary interaction delay is active
      if (isHovered || Date.now() < tempPauseUntilRef.current) {
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / intervalMs) * 100);
      setProgress(pct);

      if (elapsed >= intervalMs) {
        const nextQ = drawNextQuote();
        if (nextQ) {
          setCurrentQuote(nextQ);
          resetTimer();
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [quotes, intervalMs, isHovered, drawNextQuote, resetTimer]);

  // 1-based index calculation
  const currentIndex = currentQuote
    ? quotes.findIndex((q) => q.id === currentQuote.id) + 1
    : 1;

  const isTodaysPick = currentQuote?.id === todaysQuote.id;

  return {
    quote: currentQuote,
    next,
    prev,
    currentIndex: currentIndex > 0 ? currentIndex : 1,
    totalCount: quotes.length,
    isTodaysPick,
    progress,
    isHovered,
    setIsHovered,
    pauseTemporarily,
  };
}

export default useRotatingQuote;
