import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Copy, Check, Heart, Sparkles, Bookmark, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { motivationalQuotes, type MotivationalQuote } from "@/data/motivationalQuotes";
import { useRotatingQuote } from "@/hooks/useRotatingQuote";
import { useFavoriteQuotes } from "@/hooks/useFavoriteQuotes";
import { useReducedEffects } from "@/hooks/useReducedEffects";

// Fallback copy function for browsers/environments without clipboard API
async function copyQuoteToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to execCommand
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
    console.warn("[QuoteCard] Fallback copy failed:", err);
    return false;
  }
}

export const QuoteCard: React.FC = () => {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const reducedMotion = useReducedEffects();
  const { favorites, isFavorite, toggleFavorite } = useFavoriteQuotes();

  // Active list of quotes (all vs favorites)
  const activeQuotes: MotivationalQuote[] = React.useMemo(() => {
    if (showFavoritesOnly) {
      return motivationalQuotes.filter((q) => favorites.includes(q.id));
    }
    return motivationalQuotes;
  }, [showFavoritesOnly, favorites]);

  // Rotation hook
  const { quote, next, setIsHovered, pauseTemporarily } = useRotatingQuote(
    activeQuotes,
    8000
  );

  // Sync button handler
  const handleSync = useCallback(() => {
    setIsSyncing(true);
    next();
    setTimeout(() => {
      setIsSyncing(false);
    }, 500);
  }, [next]);

  // Copy button handler
  const handleCopy = useCallback(async () => {
    if (!quote) return;
    pauseTemporarily(3500);
    const formatted = `"${quote.text}" — ${quote.author}`;
    const success = await copyQuoteToClipboard(formatted);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [quote, pauseTemporarily]);

  // Heart (Favorite) button handler
  const handleToggleFavorite = useCallback(() => {
    if (!quote) return;
    pauseTemporarily(3500);
    toggleFavorite(quote.id);
  }, [quote, toggleFavorite, pauseTemporarily]);

  const currentIsFav = quote ? isFavorite(quote.id) : false;

  return (
    <Card
      className="p-6 bg-surface border-border relative overflow-hidden h-full min-h-[210px] flex flex-col justify-between group transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Quote of the day"
    >
      {/* Header Line: Label on left, Single Row of 4 Icons on right */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-nowrap">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-serif text-xs sm:text-sm font-medium text-text-muted uppercase tracking-wider truncate">
            Quote of the Day
          </h3>
          {/* Favorites Filter Switch */}
          <button
            type="button"
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border transition-all inline-flex items-center gap-1 shrink-0 ${
              showFavoritesOnly
                ? "bg-teal-500/15 border-teal-500/40 text-teal-400 font-medium"
                : "bg-surface-raised border-border/70 text-text-muted hover:text-text-primary hover:border-border"
            }`}
            title={showFavoritesOnly ? "Show all quotes" : "Show only saved favorites"}
            aria-pressed={showFavoritesOnly}
          >
            <Bookmark className={`w-3 h-3 ${showFavoritesOnly ? "fill-teal-400" : ""}`} />
            <span>
              {showFavoritesOnly ? "Favorites" : `Favs (${favorites.length})`}
            </span>
          </button>
        </div>

        {/* SINGLE ROW OF 4 ICONS: Lightbulb, Sync, Copy, Heart (No wrap, 8px gap) */}
        <div className="flex items-center gap-2 flex-nowrap shrink-0">
          {/* 1. Lightbulb (Decorative rounded square, same size & border style, soft tint, full visibility) */}
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 select-none shadow-xs"
            aria-hidden="true"
            title="Quote of the Day"
          >
            <Lightbulb className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-400 fill-amber-400/20" />
          </div>

          {/* 2. Sync Button */}
          <button
            type="button"
            onClick={handleSync}
            disabled={activeQuotes.length <= 1}
            aria-label="Sync new quote"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-border/60 bg-surface-raised hover:bg-surface-raised/80 hover:border-teal-500/40 text-text-muted hover:text-teal-400 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 flex items-center justify-center shrink-0"
            title="Get another random quote"
          >
            <RotateCw
              className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-500 ${
                isSyncing ? "rotate-180 text-teal-400" : ""
              }`}
            />
          </button>

          {/* 3. Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!quote}
            aria-label="Copy quote"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-border/60 bg-surface-raised hover:bg-surface-raised/80 hover:border-teal-500/40 text-text-muted hover:text-teal-400 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 flex items-center justify-center shrink-0"
            title="Copy quote to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-emerald-400 animate-in zoom-in-75 duration-150" />
            ) : (
              <Copy className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            )}
            {copied && (
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-surface border border-border px-1.5 py-0.5 rounded text-emerald-400 shadow-md pointer-events-none whitespace-nowrap z-30">
                Copied!
              </span>
            )}
          </button>

          {/* 4. Heart (Favorite) Button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={!quote}
            aria-label={currentIsFav ? "Remove quote from favorites" : "Save quote to favorites"}
            aria-pressed={currentIsFav}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 flex items-center justify-center shrink-0 ${
              currentIsFav
                ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                : "border-border/60 bg-surface-raised hover:bg-surface-raised/80 hover:border-rose-400/40 text-text-muted hover:text-rose-400"
            }`}
            title={currentIsFav ? "Remove from favorites" : "Save to favorites"}
          >
            <Heart
              className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform active:scale-125 ${
                currentIsFav ? "fill-current text-rose-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Quote Body in normal flow below the header (never under the icons) */}
      <div className="flex-1 flex flex-col justify-center min-h-[95px] pt-1">
        {showFavoritesOnly && activeQuotes.length === 0 ? (
          <div className="py-2 text-center sm:text-left">
            <p className="text-sm text-text-secondary leading-relaxed">
              No favorites yet — tap the heart on a quote you love.
            </p>
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(false)}
              className="mt-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1"
            >
              <span>Explore all quotes</span>
              <Sparkles className="w-3 h-3" />
            </button>
          </div>
        ) : quote ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={quote.id}
              initial={{
                opacity: 0,
                y: reducedMotion ? 0 : 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: reducedMotion ? 0 : -8,
              }}
              transition={{
                duration: reducedMotion ? 0.15 : 0.28,
                ease: "easeOut",
              }}
              className="flex flex-col justify-between"
            >
              <blockquote className="text-text-primary font-serif text-base italic leading-relaxed line-clamp-3">
                "{quote.text}"
              </blockquote>
              <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                <span className="font-sans font-medium text-text-secondary">
                  — {quote.author}
                </span>
                {quote.theme && (
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400/90 border border-teal-500/20 capitalize">
                    {quote.theme}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </Card>
  );
};

export default QuoteCard;
