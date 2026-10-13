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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-xl h-[200px] sm:h-[190px] md:h-[200px] flex flex-col justify-between group select-none transition-[box-shadow,border-color] duration-350 ease-in-out"
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
            className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none opacity-50 mix-blend-multiply filter blur-[2px]"
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
                className="absolute rounded-full blur-2xl animate-pulse pointer-events-none opacity-60"
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
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(${lightVariant.accentColor} 1.5px, transparent 1.5px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-[1px]"
          style={{ backgroundColor: lightVariant.overlay }}
        />
        <div
          className="absolute inset-y-0 left-0 w-full sm:w-4/5 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.20) 65%, transparent 100%)",
          }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LAYER D: Theme Scene (Compact Lottie / SVG on desktop right side) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-28 sm:w-36 h-28 sm:h-36 z-3 pointer-events-none hidden md:flex items-center justify-center">
        <QuoteScene
          theme={currentTheme}
          isDark={isDark}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CARD CONTENT (Compact Banner Layout) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 px-4 py-3 sm:px-6 sm:py-3.5 md:px-7 md:py-4 flex flex-col justify-between h-full">
        {/* HEADER ROW: Label + Lightbulb + Category Tag + Action Controls (No Counter Pill) */}
        <div className="flex items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-2">
          {/* Left Metadata Group */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Decorative Lightbulb Icon */}
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-black/10 dark:border-white/15 bg-white/40 dark:bg-black/35 backdrop-blur-md flex items-center justify-center shrink-0 shadow-2xs"
              aria-hidden="true"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-400/30" />
            </div>

            <span
              className={`font-serif text-[11px] sm:text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Daily Motivation
            </span>

            {/* Category Tag pill */}
            <span
              className={`text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full border shadow-2xs capitalize ${variant.badgeBg}`}
            >
              {quote?.category || "Growth"}
            </span>

            {/* Today's Pick Badge if applicable */}
            {isTodaysPick && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-900 dark:text-amber-200 border border-amber-500/40 font-semibold animate-pulse">
                <Flame className="w-3 h-3 fill-amber-500 dark:fill-amber-400 text-amber-600 dark:text-amber-300" />
                Today's Pick
              </span>
            )}
          </div>

          {/* Right Action Controls: Prev, Next, Sync, Copy, Share, Heart, Favorites (Counter Pill Removed) */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap shrink-0">
            {/* Previous Quote Arrow */}
            <button
              type="button"
              onClick={prev}
              disabled={activeQuotes.length <= 1}
              aria-label="Previous quote"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-black/10 dark:border-white/15 bg-white/40 dark:bg-black/35 hover:bg-white/60 dark:hover:bg-black/55 text-slate-800 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Previous quote"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Next Quote Arrow */}
            <button
              type="button"
              onClick={next}
              disabled={activeQuotes.length <= 1}
              aria-label="Next quote"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-black/10 dark:border-white/15 bg-white/40 dark:bg-black/35 hover:bg-white/60 dark:hover:bg-black/55 text-slate-800 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Next quote"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Sync Random Quote Button */}
            <button
              type="button"
              onClick={handleSync}
              disabled={activeQuotes.length <= 1}
              aria-label="Randomize quote"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-black/10 dark:border-white/15 bg-white/40 dark:bg-black/35 hover:bg-white/60 dark:hover:bg-black/55 text-slate-800 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Random quote"
            >
              <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isSyncing ? "rotate-180" : ""}`} />
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!quote}
              aria-label="Copy quote to clipboard"
              className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-black/10 dark:border-white/15 bg-white/40 dark:bg-black/35 hover:bg-white/60 dark:hover:bg-black/55 text-slate-800 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Copy quote"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-150" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied && (
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-mono font-medium bg-black/90 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-black/10 dark:border-white/15 bg-white/40 dark:bg-black/35 hover:bg-white/60 dark:hover:bg-black/55 text-slate-800 dark:text-slate-100 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Share quote"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Heart (Favorite) Button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={!quote}
              aria-label={currentIsFav ? "Remove from favorites" : "Save to favorites"}
              aria-pressed={currentIsFav}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-2xs ${
                currentIsFav
                  ? "border-rose-500/60 bg-rose-500/25 text-rose-600 dark:text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.35)]"
                  : "border-black/10 dark:border-white/15 bg-white/40 dark:bg-black/35 hover:bg-white/60 dark:hover:bg-black/55 text-slate-800 dark:text-slate-100 hover:text-rose-500"
              }`}
              title={currentIsFav ? "Remove from favorites" : "Save to favorites"}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${currentIsFav ? "fill-current" : ""}`} />
            </button>

            {/* Favorites Filter Switch */}
            <button
              type="button"
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`text-[10px] sm:text-[11px] font-mono px-2 py-1 rounded-lg border transition-all inline-flex items-center gap-1 shrink-0 cursor-pointer backdrop-blur-md shadow-2xs ${
                showFavoritesOnly
                  ? "bg-teal-500/30 border-teal-600 dark:border-teal-400 text-teal-900 dark:text-teal-200 font-semibold"
                  : "bg-white/40 dark:bg-black/35 border-black/10 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={showFavoritesOnly ? "Show all quotes" : "Show saved favorites only"}
              aria-pressed={showFavoritesOnly}
            >
              <Bookmark className={`w-3 h-3 ${showFavoritesOnly ? "fill-current" : ""}`} />
              <span>{showFavoritesOnly ? "Favs" : `Favs (${favorites.length})`}</span>
            </button>
          </div>
        </div>

        {/* BODY: Subtle Decorative Quotation Mark + Compact Staggered Quote + Author Line */}
        <div className="relative flex-1 flex flex-col justify-center max-w-4xl pr-0 md:pr-32 lg:pr-36 min-h-0">
          {/* Subtle Decorative Opening Quotation Mark (Smaller, fainter, doesn't push text down) */}
          <span
            className="absolute -left-1 sm:-left-2 -top-2 sm:-top-3 text-4xl sm:text-5xl font-serif select-none pointer-events-none font-normal leading-none transition-colors duration-350 opacity-25 dark:opacity-20"
            style={{ color: variant.accentColor }}
            aria-hidden="true"
          >
            “
          </span>

          {showFavoritesOnly && activeQuotes.length === 0 ? (
            <div className="relative z-10 py-2 text-center sm:text-left space-y-1">
              <p className={`text-sm font-sans ${isDark ? "text-slate-200" : "text-slate-800"}`}>
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
                initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.35, ease: "easeOut" }}
                className="relative z-10 flex flex-col justify-center"
              >
                {/* Compact Quote Text (text-lg to text-2xl, font-normal, max 70ch, line-clamp-3) */}
                <blockquote
                  aria-live="polite"
                  className={`font-serif italic font-normal text-lg sm:text-xl md:text-2xl leading-[1.38] tracking-tight max-w-[70ch] line-clamp-2 sm:line-clamp-3 transition-colors duration-350 ${
                    isDark
                      ? "text-white drop-shadow-xs"
                      : "text-slate-900 [text-shadow:_0_1px_2px_rgba(255,255,255,0.7)]"
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
                            duration: 0.24,
                            delay: i * 0.035, // 35ms staggered word entrance
                            ease: "easeOut",
                          }}
                          className="inline-block mr-1.5"
                        >
                          {word}
                        </motion.span>
                      ))}
                  ”
                </blockquote>

                {/* Author with accent color line */}
                <p
                  className={`font-sans font-medium text-xs sm:text-sm tracking-wide flex items-center gap-2 mt-1 sm:mt-1.5 transition-colors duration-350 ${
                    isDark ? "text-slate-300" : "text-slate-800 font-semibold"
                  }`}
                >
                  <span
                    className="inline-block w-5 h-0.5 rounded-full transition-colors duration-350 shrink-0"
                    style={{ backgroundColor: variant.accentColor }}
                  />
                  <span>{quote.author}</span>
                </p>
              </motion.div>
            </AnimatePresence>
          ) : null}
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
