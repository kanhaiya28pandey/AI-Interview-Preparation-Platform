import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  Copy,
  Check,
  Heart,
  Sparkles,
  Bookmark,
  Lightbulb,
  Share2,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import {
  motivationalQuotes,
  type MotivationalQuote,
} from "@/data/motivationalQuotes";
import { getQuoteTheme, type QuoteCategoryTheme } from "@/data/quoteThemes";
import { useRotatingQuote } from "@/hooks/useRotatingQuote";
import { useFavoriteQuotes } from "@/hooks/useFavoriteQuotes";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { useAppearance } from "@/context/AppearanceContext";
import { QuoteScene } from "./QuoteScene";
import { toast } from "sonner";

// Fallback clipboard copy helper
async function copyQuoteToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn("[QuoteCard] Copy failed:", err);
    return false;
  }
}

export const QuoteCard: React.FC = () => {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const { isDark } = useAppearance();
  const reducedMotion = useReducedEffects();
  const { favorites, isFavorite, toggleFavorite } = useFavoriteQuotes();

  // Active pool of quotes (all vs favorites)
  const activeQuotes: MotivationalQuote[] = useMemo(() => {
    if (showFavoritesOnly) {
      return motivationalQuotes.filter((q) => favorites.includes(q.id));
    }
    return motivationalQuotes;
  }, [showFavoritesOnly, favorites]);

  // Rotation hook (auto rotates every 8s, pauses on hover & hidden tab)
  const {
    quote,
    next,
    prev,
    isTodaysPick,
    progress,
    setIsHovered,
    pauseTemporarily,
  } = useRotatingQuote(activeQuotes, 8000);

  // Category theme config & mode variant (instantly responds to theme toggle)
  const currentTheme: QuoteCategoryTheme = useMemo(() => {
    return getQuoteTheme(quote?.category || quote?.theme);
  }, [quote?.category, quote?.theme]);

  const darkVariant = currentTheme.dark;
  const lightVariant = currentTheme.light;
  const variant = isDark ? darkVariant : lightVariant;

  // Sync button handler
  const handleSync = useCallback(() => {
    setIsSyncing(true);
    next();
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  }, [next]);

  // Copy button handler
  const handleCopy = useCallback(async () => {
    if (!quote) return;
    pauseTemporarily(4000);
    const formatted = `"${quote.text}" — ${quote.author}`;
    const success = await copyQuoteToClipboard(formatted);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Quote copied to clipboard");
    }
  }, [quote, pauseTemporarily]);

  // Share button handler (Web Share API with fallback to copy)
  const handleShare = useCallback(async () => {
    if (!quote) return;
    pauseTemporarily(4000);
    const shareData = {
      title: "Daily Motivation · AI Interview Prep",
      text: `"${quote.text}" — ${quote.author}`,
      url: window.location.origin,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Share failed, falling back to copy", err);
        }
      }
    }

    // Fallback: Copy to clipboard
    handleCopy();
  }, [quote, pauseTemporarily, handleCopy]);

  // Heart (Favorite) button handler
  const handleToggleFavorite = useCallback(() => {
    if (!quote) return;
    pauseTemporarily(3500);
    toggleFavorite(quote.id);
  }, [quote, toggleFavorite, pauseTemporarily]);

  const currentIsFav = quote ? isFavorite(quote.id) : false;

  // Words array for staggered word-by-word reveal
  const words = useMemo(() => {
    return quote ? quote.text.split(" ") : [];
  }, [quote]);

  return (
    <div
      className="@container relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-xl flex flex-col justify-between group select-none transition-[box-shadow,border-color] duration-350 ease-in-out min-h-[175px]"
      style={{
        boxShadow: `0 8px 32px ${variant.accentGlow}`,
        borderColor: variant.accentColor + (isDark ? "40" : "60"),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Daily Motivation section"
    >
      {/* ------------------------------------------------------------- */}
      {/* LAYER A & B: Two Stacked Background Layers (Dark & Light) */}
      {/* Both remain permanently mounted and cross-fade opacities in 350ms */}
      {/* ------------------------------------------------------------- */}

      {/* 1. DARK BACKGROUND LAYER */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${darkVariant.gradientClass} z-0 pointer-events-none transition-opacity duration-350 ease-in-out ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        {currentTheme.photoUrl && (
          <img
            src={currentTheme.photoUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none opacity-35 mix-blend-overlay filter blur-[4px]"
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{ backgroundImage: darkVariant.meshStyle }}
        />
        {!reducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {darkVariant.orbs.map((orbColor, idx) => (
              <div
                key={`dark-orb-${idx}`}
                className="absolute rounded-full blur-2xl animate-pulse pointer-events-none opacity-30"
                style={{
                  backgroundColor: orbColor,
                  width: `${100 + idx * 30}px`,
                  height: `${100 + idx * 30}px`,
                  top: idx % 2 === 0 ? `${idx * 18}%` : "auto",
                  bottom: idx % 2 !== 0 ? `${idx * 12}%` : "auto",
                  left: idx < 2 ? `${idx * 28}%` : "auto",
                  right: idx >= 2 ? `${(idx - 2) * 28}%` : "auto",
                  animationDuration: `${10 + idx * 4}s`,
                }}
              />
            ))}
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none opacity-12"
          style={{
            backgroundImage: `radial-gradient(${darkVariant.accentColor} 1.5px, transparent 1.5px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-[1px]"
          style={{ backgroundColor: darkVariant.overlay }}
        />
      </div>

      {/* 2. LIGHT BACKGROUND LAYER */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${lightVariant.gradientClass} z-0 pointer-events-none transition-opacity duration-350 ease-in-out ${
          !isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        {currentTheme.photoUrl && (
          <img
            src={currentTheme.photoUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none opacity-40 mix-blend-multiply filter blur-[2px]"
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none opacity-85"
          style={{ backgroundImage: lightVariant.meshStyle }}
        />
        {!reducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {lightVariant.orbs.map((orbColor, idx) => (
              <div
                key={`light-orb-${idx}`}
                className="absolute rounded-full blur-2xl animate-pulse pointer-events-none opacity-50"
                style={{
                  backgroundColor: orbColor,
                  width: `${100 + idx * 30}px`,
                  height: `${100 + idx * 30}px`,
                  top: idx % 2 === 0 ? `${idx * 18}%` : "auto",
                  bottom: idx % 2 !== 0 ? `${idx * 12}%` : "auto",
                  left: idx < 2 ? `${idx * 28}%` : "auto",
                  right: idx >= 2 ? `${(idx - 2) * 28}%` : "auto",
                  animationDuration: `${10 + idx * 4}s`,
                }}
              />
            ))}
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `radial-gradient(${lightVariant.accentColor} 1.5px, transparent 1.5px)`,
            backgroundSize: "20px 20px",
          }}
        />
        {/* Light Scrim: strong overlay for WCAG AA (>= 4.5:1) text contrast */}
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-[2px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.58)" }}
        />
        <div
          className="absolute inset-y-0 left-0 w-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.45) 60%, rgba(255, 255, 255, 0.30) 100%)",
          }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LAYER D: Theme Scene (Compact Lottie / SVG on extra-wide desktop) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute right-4 @xl:right-8 top-1/2 -translate-y-1/2 w-28 h-28 z-3 pointer-events-none hidden @xl:flex items-center justify-center opacity-30 dark:opacity-25">
        <QuoteScene
          theme={currentTheme}
          isDark={isDark}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CARD CONTENT (Compact Banner Layout with py-4 @md:py-5) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 px-4 py-4 sm:px-6 @md:py-5 @md:px-7 flex flex-col justify-between gap-3 h-full">
        {/* HEADER ROW: Label + Lightbulb + Category Tag + Today's Pick (Wrapping on mobile) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Decorative Lightbulb Icon */}
            <div
              className="w-7 h-7 rounded-lg border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-black/35 backdrop-blur-md flex items-center justify-center shrink-0 shadow-2xs"
              aria-hidden="true"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-400/30" />
            </div>

            <span
              className={`font-serif text-[11px] sm:text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-white" : "text-slate-950 font-bold"
              }`}
            >
              Daily Motivation
            </span>

            {/* Category Tag pill */}
            <span
              className={`text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full border shadow-2xs capitalize font-semibold ${
                isDark
                  ? variant.badgeBg
                  : "bg-white/90 text-slate-950 border-slate-300/90"
              }`}
            >
              {quote?.category || "Growth"}
            </span>

            {/* Today's Pick Badge if applicable */}
            {isTodaysPick && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-950 dark:text-amber-200 border border-amber-500/50 font-semibold shadow-2xs animate-pulse">
                <Flame className="w-3 h-3 fill-amber-500 dark:fill-amber-400 text-amber-600 dark:text-amber-300" />
                Today's Pick
              </span>
            )}
          </div>
        </div>

        {/* BODY: Subtle Decorative Quotation Mark + Compact Staggered Quote */}
        <div className="relative flex-1 flex flex-col justify-center min-h-0 py-1">
          {/* Decorative Opening Quotation Mark behind text (does NOT overlap label or text) */}
          <span
            className="absolute -left-2 -top-2 text-5xl sm:text-6xl font-serif select-none pointer-events-none font-normal leading-none transition-colors duration-350 opacity-20 dark:opacity-15 z-0"
            style={{ color: variant.accentColor }}
            aria-hidden="true"
          >
            “
          </span>

          {showFavoritesOnly && activeQuotes.length === 0 ? (
            <div className="relative z-10 py-2 text-center sm:text-left space-y-1">
              <p className={`text-sm font-sans ${isDark ? "text-slate-200" : "text-slate-900 font-medium"}`}>
                No favorite quotes saved yet. Tap the heart icon on any inspiring quote to save it here.
              </p>
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(false)}
                className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 pt-0.5 cursor-pointer"
              >
                <span>Explore all quotes</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
          ) : quote ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.3, ease: "easeOut" }}
                className="relative z-10 flex flex-col justify-center"
              >
                {/* Quote Text: text-xl @md:text-2xl, font-serif, italic, line-clamp-3 */}
                <blockquote
                  aria-live="polite"
                  className={`font-serif italic font-normal text-xl @md:text-2xl leading-snug tracking-tight max-w-[72ch] line-clamp-3 transition-colors duration-350 ${
                    isDark
                      ? "text-white drop-shadow-xs"
                      : "text-slate-950 font-medium [text-shadow:_0_1px_2px_rgba(255,255,255,0.8)]"
                  }`}
                >
                  “
                  {reducedMotion
                    ? quote.text
                    : words.map((word, i) => (
                        <motion.span
                          key={`${quote.id}-w-${i}`}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.22,
                            delay: i * 0.03,
                            ease: "easeOut",
                          }}
                          className="inline-block mr-1.5"
                        >
                          {word}
                        </motion.span>
                      ))}
                  ”
                </blockquote>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {/* FOOTER ROW: Author line (left) + Action Controls (right) on wide containers */}
        <div className="flex flex-col @md:flex-row @md:items-center @md:justify-between gap-3 pt-2 border-t border-black/5 dark:border-white/10">
          {/* Author line with accent dash */}
          {quote && (
            <p
              className={`font-sans font-medium text-xs @md:text-sm tracking-wide flex items-center gap-2 transition-colors duration-350 shrink-0 ${
                isDark ? "text-slate-200" : "text-slate-950 font-semibold"
              }`}
            >
              <span
                className="inline-block w-4 h-0.5 rounded-full transition-colors duration-350 shrink-0"
                style={{ backgroundColor: variant.accentColor }}
              />
              <span>— {quote.author}</span>
            </p>
          )}

          {/* Action buttons: h-9 w-9, Favs (N) h-9 px-3 */}
          <div className="flex items-center gap-1.5 flex-nowrap shrink-0 overflow-x-auto pb-0.5 @md:pb-0 scrollbar-none">
            {/* Previous Quote Arrow */}
            <button
              type="button"
              onClick={prev}
              disabled={activeQuotes.length <= 1}
              aria-label="Previous quote"
              className="h-9 w-9 rounded-xl border border-slate-300/90 dark:border-white/15 bg-white/80 dark:bg-black/35 hover:bg-white dark:hover:bg-black/55 text-slate-800 hover:text-slate-950 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Previous quote"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Quote Arrow */}
            <button
              type="button"
              onClick={next}
              disabled={activeQuotes.length <= 1}
              aria-label="Next quote"
              className="h-9 w-9 rounded-xl border border-slate-300/90 dark:border-white/15 bg-white/80 dark:bg-black/35 hover:bg-white dark:hover:bg-black/55 text-slate-800 hover:text-slate-950 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Next quote"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Sync Random Quote Button */}
            <button
              type="button"
              onClick={handleSync}
              disabled={activeQuotes.length <= 1}
              aria-label="Randomize quote"
              className="h-9 w-9 rounded-xl border border-slate-300/90 dark:border-white/15 bg-white/80 dark:bg-black/35 hover:bg-white dark:hover:bg-black/55 text-slate-800 hover:text-slate-950 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Random quote"
            >
              <RotateCw className={`w-4 h-4 transition-transform duration-500 ${isSyncing ? "rotate-180" : ""}`} />
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!quote}
              aria-label="Copy quote to clipboard"
              className="relative h-9 w-9 rounded-xl border border-slate-300/90 dark:border-white/15 bg-white/80 dark:bg-black/35 hover:bg-white dark:hover:bg-black/55 text-slate-800 hover:text-slate-950 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Copy quote"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-150" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono font-medium bg-slate-900 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
                  Copied!
                </span>
              )}
            </button>

            {/* Share Button (Web Share API) */}
            <button
              type="button"
              onClick={handleShare}
              disabled={!quote}
              aria-label="Share quote"
              className="h-9 w-9 rounded-xl border border-slate-300/90 dark:border-white/15 bg-white/80 dark:bg-black/35 hover:bg-white dark:hover:bg-black/55 text-slate-800 hover:text-slate-950 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Share quote"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Heart (Favorite) Button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={!quote}
              aria-label={currentIsFav ? "Remove from favorites" : "Save to favorites"}
              aria-pressed={currentIsFav}
              className={`h-9 w-9 rounded-xl border backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs ${
                currentIsFav
                  ? "border-rose-500/60 bg-rose-500/25 text-rose-600 dark:text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.35)]"
                  : "border-slate-300/90 dark:border-white/15 bg-white/80 dark:bg-black/35 hover:bg-white dark:hover:bg-black/55 text-slate-800 hover:text-rose-500 dark:text-slate-100 dark:hover:text-rose-400"
              }`}
              title={currentIsFav ? "Remove from favorites" : "Save to favorites"}
            >
              <Heart className={`w-4 h-4 transition-transform active:scale-125 ${currentIsFav ? "fill-current" : ""}`} />
            </button>

            {/* Favorites Filter Switch */}
            <button
              type="button"
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`h-9 px-3 rounded-xl border transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer backdrop-blur-md text-xs font-mono font-semibold shadow-2xs ${
                showFavoritesOnly
                  ? "bg-teal-600 text-white border-teal-700 dark:bg-teal-500/30 dark:border-teal-400 dark:text-teal-200"
                  : "bg-white/80 border-slate-300/90 text-slate-800 hover:text-slate-950 hover:bg-white dark:bg-black/35 dark:border-white/15 dark:text-slate-200 dark:hover:text-white"
              }`}
              title={showFavoritesOnly ? "Show all quotes" : "Show saved favorites only"}
              aria-pressed={showFavoritesOnly}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-current" : ""}`} />
              <span>{showFavoritesOnly ? "Favs" : `Favs (${favorites.length})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 8-SECOND AUTO-ROTATION PROGRESS BAR (Pauses on hover) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/15 dark:bg-white/10 z-20 overflow-hidden">
        <div
          className="h-full transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: variant.accentColor,
            boxShadow: `0 0 8px ${variant.accentGlow}`,
          }}
        />
      </div>
    </div>
  );
};

export default QuoteCard;
