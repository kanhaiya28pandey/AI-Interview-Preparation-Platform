import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Sparkles, CheckCircle2, ShieldCheck, Video, Code2, Award } from "lucide-react";

export interface AuthLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  subtitle?: string;
}

const authQuotes = [
  {
    label: "BUILT FOR INTERVIEW SUCCESS · AMAZON SDE-1",
    quote: "Structured coding practice and mock interviews helped me walk into my placement interview prepared, not anxious.",
    author: "Aarav Sharma",
    role: "Backend SDE-1",
    company: "Amazon",
  },
  {
    label: "SYSTEM DESIGN MASTERY · MICROSOFT SDE",
    quote: "The real-time trade-off evaluation showed me exactly how to articulate Fiber reconciliation and database sharding under pressure.",
    author: "Priya Nair",
    role: "Full Stack Engineer",
    company: "Microsoft",
  },
  {
    label: "BEHAVIORAL STAR METHOD · ATLASSIAN",
    quote: "Practicing domain-specific mock rounds boosted my technical confidence score from 65% to 92% before final manager rounds.",
    author: "Vikramaditya Roy",
    role: "Systems SDE",
    company: "Atlassian",
  },
  {
    label: "CODING ARENA BENCHMARKS · GOOGLE",
    quote: "Solving algorithm benchmarks with simulated execution gave me the speed and technical accuracy I needed on campus placement day.",
    author: "Ananya Deshmukh",
    role: "Frontend Engineer",
    company: "Google",
  },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % authQuotes.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const currentQuote = authQuotes[activeQuoteIndex];

  return (
    <div className="min-h-screen bg-ink text-text-primary flex flex-col justify-between select-none">
      <Navbar />

      {/* Main Split Grid Layout: 2 Equal Columns on lg screens */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 w-full">
        {/* Left Column: Form Container (Vertically & Horizontally Centered) */}
        <main className="flex items-center justify-center p-6 sm:p-10 py-10 overflow-y-auto">
          <div className="w-full max-w-md space-y-6">
            {children}
          </div>
        </main>

        {/* Right Column: Hero Panel & Quote Panel (Full half screen, equal width, hidden on mobile/tablet) */}
        <aside
          className="hidden lg:flex relative items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-ink via-surface to-surface-raised border-l border-border"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Soft Floating Teal-Cyan Glow Shapes (pointer-events-none) */}
          <div className="absolute top-1/4 -right-16 w-80 h-80 bg-cyan-400/10 dark:bg-cyan-400/20 opacity-30 dark:opacity-100 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 -left-16 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/20 opacity-30 dark:opacity-100 rounded-full blur-[100px] pointer-events-none" />

          {/* Right Panel Content Container */}
          <div className="w-full max-w-lg min-w-0 space-y-8 z-10">
            {/* Small Label Pill */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 font-mono text-xs uppercase tracking-wider">
                {currentQuote.label}
              </span>
            </div>

            {/* Large Quote */}
            <div className="min-w-0">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary leading-relaxed whitespace-normal break-words">
                "{currentQuote.quote}"
              </h2>
            </div>

            {/* Author Name + Role/Company */}
            <div className="pt-2 border-t border-border min-w-0 space-y-1">
              <h4 className="text-sm font-semibold text-text-primary font-sans truncate">{currentQuote.author}</h4>
              <p className="text-xs font-mono text-cyan-400 truncate">
                {currentQuote.role} · <span className="text-text-primary font-semibold">{currentQuote.company}</span>
              </p>
            </div>

            {/* 3 Mini Feature Points */}
            <div className="space-y-3 pt-4 border-t border-border font-mono text-xs text-text-secondary">
              <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl text-text-primary">
                <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>AI Voice & Text Mock Interview Evaluator</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl text-text-primary">
                <Code2 className="w-4 h-4 text-live shrink-0" />
                <span>Real-time Code Runner & Benchmark Tests</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl text-text-primary">
                <Award className="w-4 h-4 text-danger shrink-0" />
                <span>Verified College Student Campus Rankings</span>
              </div>
            </div>

            {/* Quote Carousel Indicator Dots */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {authQuotes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveQuoteIndex(idx)}
                    aria-label={`Show quote ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeQuoteIndex === idx ? "w-6 bg-accent" : "w-1.5 bg-border hover:bg-text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] text-text-muted">SRM · IIT · BITS · VIT · Placement 2026</span>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};
