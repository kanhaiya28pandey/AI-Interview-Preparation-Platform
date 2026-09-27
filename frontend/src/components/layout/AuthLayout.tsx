import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Video,
  Code2,
  Award,
  BookOpen,
  Target,
  BarChart3,
  Clock,
  Lock,
  Lightbulb,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AuthLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  subtitle?: string;
  step?: number;
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

const academicFacts = [
  "Students from 40+ colleges use this platform to prepare for placements",
  "Customized mock interviews for CS, IT, AI/DS, MCA, & ECE curricula",
  "Track semester-by-semester placement readiness score trends",
  "Branch-wise percentile benchmarks for campus recruitment rounds",
];

const photoTips = [
  "Make sure all four corners of your ID card are clearly visible",
  "Avoid glare or heavy shadows over the student roll number",
  "Use a flat surface under bright room lighting for best clarity",
  "Ensure text and face photo are sharp and readable before submitting",
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, step = 1 }) => {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [activeFactIndex, setActiveFactIndex] = useState(0);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % authQuotes.length);
      setActiveFactIndex((prev) => (prev + 1) % academicFacts.length);
      setActiveTipIndex((prev) => (prev + 1) % photoTips.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const currentQuote = authQuotes[activeQuoteIndex];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-ink text-text-primary select-none">
      {/* Top Navbar: Fixed height in normal flow, never scrolls */}
      <Navbar />

      {/* Two-Column Split Layout filling remaining viewport height */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left Column: Form Container (ONLY scrollable element on page) */}
        <main className="w-full lg:w-1/2 h-full overflow-y-auto custom-scrollbar p-6 sm:p-10 flex items-start justify-center">
          <div className="w-full max-w-xl my-auto font-sans">{children}</div>
        </main>

        {/* Right Column: Fixed Decorative Guidance Panel (NEVER scrolls) */}
        <aside
          className="hidden lg:flex lg:w-1/2 h-full overflow-hidden relative items-center justify-center p-10 bg-gradient-to-br from-ink via-surface to-surface-raised border-l border-border"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Soft Floating Teal-Cyan Glow Shapes (pointer-events-none) */}
          <div className="absolute top-1/4 -right-16 w-80 h-80 bg-cyan-400/10 dark:bg-cyan-400/20 opacity-30 dark:opacity-100 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 -left-16 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/20 opacity-30 dark:opacity-100 rounded-full blur-[100px] pointer-events-none" />

          {/* Right Panel Content Container with Full Fixed Height & Step Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg h-full flex flex-col justify-between z-10 py-2"
            >
              {/* STEP 1 CONTENT — Personal Information & Placement Outcomes */}
              {step === 1 && (
                <>
                  <div className="space-y-5">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 font-mono text-xs uppercase tracking-wider">
                        {currentQuote.label}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary leading-relaxed whitespace-normal break-words">
                        "{currentQuote.quote}"
                      </h2>
                    </div>

                    <div className="pt-2 border-t border-border min-w-0 space-y-1">
                      <h4 className="text-sm font-semibold text-text-primary font-sans truncate">
                        {currentQuote.author}
                      </h4>
                      <p className="text-xs font-mono text-cyan-400 truncate">
                        {currentQuote.role} ·{" "}
                        <span className="text-text-primary font-semibold">{currentQuote.company}</span>
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-border font-mono text-xs text-text-secondary">
                      <div className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-xl text-text-primary">
                        <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>AI Voice & Text Mock Interview Evaluator</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-xl text-text-primary">
                        <Code2 className="w-4 h-4 text-live shrink-0" />
                        <span>Real-time Code Runner & Benchmark Tests</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-xl text-text-primary">
                        <Award className="w-4 h-4 text-accent shrink-0" />
                        <span>Verified College Student Campus Rankings</span>
                      </div>
                    </div>
                  </div>

                  {/* Pinned Bottom Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
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
                    <span className="font-mono text-[11px] text-text-muted">
                      SRM · IIT · BITS · VIT · Placement 2026
                    </span>
                  </div>
                </>
              )}

              {/* STEP 2 CONTENT — Academic Details & Program Tailoring */}
              {step === 2 && (
                <>
                  <div className="space-y-5">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 font-mono text-xs uppercase tracking-wider">
                        Academic Placement Intelligence
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary leading-tight">
                        Tell us about your program
                      </h2>
                      <p className="text-xs text-text-secondary leading-relaxed font-sans">
                        We personalize your AI mock questions, coding challenges, and readiness metrics based on your degree and current semester.
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-border font-mono text-xs text-text-secondary">
                      <div className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-xl text-text-primary">
                        <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>We tailor your practice tracks to your course and semester</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-xl text-text-primary">
                        <Target className="w-4 h-4 text-live shrink-0" />
                        <span>Get placement-readiness benchmarks specific to your branch</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-xl text-text-primary">
                        <BarChart3 className="w-4 h-4 text-accent shrink-0" />
                        <span>See how you compare with peers in your program</span>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-raised border border-cyan-400/30 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span>Campus Fact & Metric</span>
                      </div>
                      <p className="text-xs text-text-primary font-sans leading-relaxed">
                        "{academicFacts[activeFactIndex]}"
                      </p>
                    </div>
                  </div>

                  {/* Pinned Bottom Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {academicFacts.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFactIndex(idx)}
                          aria-label={`Show fact ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            activeFactIndex === idx ? "w-6 bg-cyan-400" : "w-1.5 bg-border hover:bg-text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[11px] text-text-muted">
                      Customized Curriculum Tracks
                    </span>
                  </div>
                </>
              )}

              {/* STEP 3 CONTENT — ID Verification & Trust Guidelines */}
              {step === 3 && (
                <>
                  <div className="space-y-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 font-mono text-xs uppercase tracking-wider">
                        Campus Eligibility & Verification
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary leading-tight">
                        Almost there — let's verify your student status
                      </h2>
                      <p className="text-xs text-text-secondary leading-relaxed font-sans">
                        Verification confirms your active college enrollment to maintain authentic campus leaderboards and recruiter credibility.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-border pt-2 font-mono text-xs text-text-secondary">
                      <div className="flex items-center gap-3 p-2 bg-surface border border-border rounded-xl text-text-primary">
                        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Your ID is used only to confirm you're a genuine student</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-surface border border-border rounded-xl text-text-primary">
                        <Clock className="w-4 h-4 text-live shrink-0" />
                        <span>Most verifications are reviewed within 24-48 hours</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-surface border border-border rounded-xl text-text-primary">
                        <Lock className="w-4 h-4 text-accent shrink-0" />
                        <span>Your information is kept private and only visible to platform admins</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface border border-cyan-400/30 rounded-xl flex items-center gap-2 text-xs font-mono text-cyan-300">
                      <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">"{photoTips[activeTipIndex]}"</span>
                    </div>
                  </div>

                  {/* Pinned Bottom Controls & Encryption Note */}
                  <div className="space-y-2.5 pt-2 border-t border-border">
                    <div className="p-2.5 bg-surface-raised border border-border rounded-xl flex items-start gap-2.5 text-xs text-text-secondary">
                      <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-sans text-[11px]">
                        <strong className="text-text-primary">Privacy Guaranteed:</strong> Your data is stored securely with encryption and never shared with third parties.
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {photoTips.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTipIndex(idx)}
                            aria-label={`Show tip ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              activeTipIndex === idx ? "w-6 bg-cyan-400" : "w-1.5 bg-border hover:bg-text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[11px] text-text-muted">
                        100% Encrypted & Private
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
};
