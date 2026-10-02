import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Code2,
  Video,
  Award,
  ArrowRight,
  CheckCircle2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Star,
  Layers,
  ShieldCheck,
  Flame,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CompanyMarquee } from "@/components/common/CompanyMarquee";
import { TestimonialsCarousel } from "@/components/common/TestimonialsCarousel";
import { GradientMesh, FloatingOrbs, AnimatedCounter, Reveal, TiltCard } from "@/components/fx";
import { HERO_ROLES } from "@/constants/heroRoles";
import { HeroShowcase } from "@/components/landing/HeroShowcase";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { cn } from "@/lib/utils";

export const ROTATE_MS = 1200;

export const ROLES = [
  "Frontend Engineers",
  "Backend Developers",
  "Full Stack Developers",
  "Data Analysts",
  "AI/ML Engineers",
  "DevOps Engineers",
  "Cloud Engineers",
  "Android Developers",
  "QA & Test Engineers",
  "Cybersecurity Analysts",
] as const;

export const LONGEST_ROLE = "Cybersecurity Analysts";

const TYPE_MS = 70;
const DELETE_MS = 35;
const HOLD_MS = 1600;

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user, loginDemoStudent, loginDemoAdmin } = useAuth();
  const navigate = useNavigate();

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Rotating roles state
  const [roleIndex, setRoleIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);

  const reducedMotion = useReducedEffects();
  const currentRole = HERO_ROLES[roleIndex] || HERO_ROLES[0];
  const currentRoleName = ROLES[roleIndex] || ROLES[0];

  // Animated counters state
  const [studentsCount, setStudentsCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [mockCount, setMockCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSessionSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Count up animation effect
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setStudentsCount(Math.min(1250, step * 50));
      setQuestionsCount(Math.min(4500, step * 180));
      setMockCount(Math.min(2150, step * 90));
      if (step >= 25) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect: types, holds, deletes, and advances to the next role in an infinite loop
  useEffect(() => {
    if (isPaused) return;

    if (reducedMotion) {
      setTypedText(ROLES[roleIndex]);
      const timer = setTimeout(() => {
        setRoleIndex((p) => (p + 1) % ROLES.length);
      }, 2500);
      return () => clearTimeout(timer);
    }

    const target = ROLES[roleIndex];
    let timerId: ReturnType<typeof setTimeout>;

    const typeNext = (charIndex: number) => {
      if (charIndex <= target.length) {
        setTypedText(target.slice(0, charIndex));
        if (charIndex < target.length) {
          timerId = setTimeout(() => typeNext(charIndex + 1), TYPE_MS);
        } else {
          timerId = setTimeout(() => deleteNext(target.length), HOLD_MS);
        }
      }
    };

    const deleteNext = (charIndex: number) => {
      if (charIndex >= 0) {
        setTypedText(target.slice(0, charIndex));
        if (charIndex > 0) {
          timerId = setTimeout(() => deleteNext(charIndex - 1), DELETE_MS);
        } else {
          setRoleIndex((p) => (p + 1) % ROLES.length);
        }
      }
    };

    typeNext(0);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [roleIndex, isPaused, reducedMotion]);

  const handleRoleSelect = (index: number) => {
    setRoleIndex(index);
  };

  const formatClock = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleDemoStudent = () => {
    loginDemoStudent();
    navigate(`/dashboard?role=${currentRole.slug}`);
  };

  const handleDemoAdmin = () => {
    loginDemoAdmin();
    navigate(`/admin?role=${currentRole.slug}`);
  };

  const faqs = [
    {
      q: "How does the AI Mock Interview work?",
      a: "The platform presents realistic engineering interview scenarios (React, Java Spring, System Design, STAR behavioral). You answer via text or voice, and our evaluator analyzes clarity, trade-off reasoning, and code efficiency to output a detailed scorecard.",
    },
    {
      q: "Is the platform free for college students?",
      a: "Yes! Verified college students get full access to all practice tracks, coding arena challenges, and mock interview rooms during campus placement season.",
    },
    {
      q: "Does the backend need to be running for demo mode?",
      a: "No! You can click 'Instant Demo Student' or 'Instant Demo Admin' to explore the full platform even when offline or during presentations.",
    },
    {
      q: "Can administrators add custom coding tests and interview tracks?",
      a: "Absolutely. The Admin Panel allows full management of users, creation of custom algorithm problems, and configuration of interview tracks.",
    },
  ];

  const testimonials = [
    {
      name: "Aarav Sharma",
      role: "Placed at Amazon SDE-1",
      college: "SRM Institute of Science and Technology",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      quote: "The AI mock feedback showed me exactly where my system design answers were lacking. Walked into my Amazon interview feeling like it was just another practice session.",
    },
    {
      name: "Priya Nair",
      role: "Placed at Microsoft SDE",
      college: "IIT Madras",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      quote: "The coding arena and STAR behavioral questions prepared me for tough pressure questions. Best placement prep tool our college recommended!",
    },
    {
      name: "Vikramaditya Roy",
      role: "Placed at Atlassian",
      college: "BITS Pilani",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      quote: "Tracking my streak and seeing my interview score jump from 65% to 92% gave me tremendous confidence before campus placement drives.",
    },
  ];

  return (
    <div className="min-h-screen bg-ink text-text-primary flex flex-col selection:bg-[#22d3ee] selection:text-[#0d1321]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-12 lg:py-24 w-full">
        {/* Ambient Gradient Mesh and Floating Orbs (Contained outside grid flow) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <GradientMesh variant="aurora" />
          <FloatingOrbs count={3} />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full z-10">
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-6 text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-400 text-xs font-mono uppercase tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              AI Placement Preparation Platform
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight leading-[1.08]">
              Master every placement round for <br />
              <span
                className="inline-grid grid-cols-1 grid-rows-1 text-cyan-400 font-serif italic font-normal align-bottom select-none cursor-default"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                tabIndex={0}
                aria-live="off"
                title="Hover to pause rotation"
              >
                {/* Invisible placeholder for max width/height reservation to eliminate layout shifts */}
                <span
                  className="invisible col-start-1 row-start-1 select-none pointer-events-none whitespace-normal sm:whitespace-nowrap"
                  aria-hidden="true"
                >
                  {LONGEST_ROLE}
                </span>
                {/* Typewriter role renderer */}
                <span className="col-start-1 row-start-1 inline-flex items-center whitespace-normal sm:whitespace-nowrap">
                  <span>{typedText}</span>
                  <span
                    className="inline-block w-0.5 h-[0.9em] ml-1.5 align-middle bg-cyan-400 animate-pulse shadow-sm"
                    aria-hidden="true"
                  />
                </span>
              </span>
            </h1>

            {/* Accessible screen reader announcement for the roles */}
            <span className="sr-only">
              Master every placement round for {ROLES.join(", ")}.
            </span>

            {/* Interactive Role Chips */}
            <div
              className="flex flex-wrap items-center gap-1.5 pt-1"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              role="group"
              aria-label="Target engineering roles"
            >
              {(showAllChips
                ? HERO_ROLES.map((r, i) => ({ role: r, index: i }))
                : [
                    ...HERO_ROLES.slice(0, 6).map((r, i) => ({ role: r, index: i })),
                    ...(roleIndex >= 6 ? [{ role: HERO_ROLES[roleIndex], index: roleIndex }] : []),
                  ]
              ).map(({ role, index }) => {
                const Icon = role.icon;
                const isActive = roleIndex === index;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(index)}
                    aria-pressed={isActive}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border",
                      isActive
                        ? "font-semibold scale-[1.03]"
                        : "bg-surface-raised/70 border-border text-text-secondary hover:text-text-primary hover:border-cyan-400/40 hover:bg-surface-raised"
                    )}
                    style={
                      isActive
                        ? {
                            borderColor: role.accentColor,
                            backgroundColor: `${role.accentColor}18`,
                            color: role.accentColor,
                            boxShadow: `0 0 12px ${role.glowColor}`,
                          }
                        : undefined
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{role.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowAllChips((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono text-cyan-400/90 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 transition-all cursor-pointer"
                aria-expanded={showAllChips}
              >
                {showAllChips ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>+{HERO_ROLES.length - 6} more</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl font-sans">
              AI Interview Preparation is the modern practice platform for top engineering students. Practice adapted mock interviews, solve algorithm benchmarks, and walk into placement drives with complete confidence.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isAuthenticated ? (
                <Button
                  variant="teal-cyan"
                  size="lg"
                  onClick={() => navigate(user?.role === "ADMIN" ? `/admin?role=${currentRole.slug}` : `/dashboard?role=${currentRole.slug}`)}
                  className="shadow-[0_0_20px_var(--accent-glow)]"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5 text-[#0d1321] transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              ) : (
                <>
                  <Button variant="primary" size="lg" onClick={handleDemoStudent} className="shadow-[0_0_20px_var(--accent-glow)]">
                    <Sparkles className="w-5 h-5" /> Try Instant Demo
                  </Button>
                  <Link to={`/register?role=${currentRole.slug}`}>
                    <Button variant="outline" size="lg" className="hover:border-cyan-400/60">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Count-up Statistics Row */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/80">
              <div>
                <b className="font-serif text-3xl sm:text-4xl font-semibold text-text-primary block">
                  <AnimatedCounter value={1250} suffix="+" />
                </b>
                <span className="text-xs text-text-muted font-mono uppercase">Verified Students</span>
              </div>
              <div>
                <b className="font-serif text-3xl sm:text-4xl font-semibold text-cyan-400 block">
                  <AnimatedCounter value={2150} suffix="+" />
                </b>
                <span className="text-xs text-text-muted font-mono uppercase">Mock Interviews</span>
              </div>
              <div>
                <b className="font-serif text-3xl sm:text-4xl font-semibold text-live block">
                  <AnimatedCounter value={94} suffix="%" />
                </b>
                <span className="text-xs text-text-muted font-mono uppercase">Placement Success</span>
              </div>
            </div>
          </div>

          {/* Right Visual Showcase Column */}
          <div className="lg:col-span-5 w-full relative z-10 flex items-center justify-center">
            <HeroShowcase
              roleIndex={roleIndex}
              sessionSeconds={sessionSeconds}
              onDemoAdmin={handleDemoAdmin}
            />
          </div>
        </div>
      </section>

      {/* Company Logos Marquee */}
      <Reveal direction="up">
        <CompanyMarquee />
      </Reveal>

      {/* 3 Step Workflow */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <Reveal direction="up" className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">The Preparation Method</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-text-primary">Three steps to placement mastery</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Reveal direction="up" delay={0.1}>
            <TiltCard intensity={10}>
              <Card className="glass border-border hover:border-cyan-400/50 hover:shadow-card transition-all duration-300 p-8 space-y-4 group h-full">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold">
                  01
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary group-hover:text-cyan-400 transition-colors">Practice a Round</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Pick a domain track — MERN, Java Spring Boot, System Design, or STAR Behavioral — and enter the simulated interview room.
                </p>
              </Card>
            </TiltCard>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <TiltCard intensity={10}>
              <Card className="glass border-border hover:border-emerald-400/50 hover:shadow-card transition-all duration-300 p-8 space-y-4 group h-full">
                <div className="w-10 h-10 rounded-xl bg-live/15 text-live border border-live/30 flex items-center justify-center font-mono font-bold">
                  02
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary group-hover:text-live transition-colors">Get Detailed Feedback</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  No generic fluff. Feedback pinpoints technical depth, architectural trade-offs, and communication clarity with exact scores.
                </p>
              </Card>
            </TiltCard>
          </Reveal>

          <Reveal direction="up" delay={0.3}>
            <TiltCard intensity={10}>
              <Card className="glass border-border hover:border-violet-400/50 hover:shadow-card transition-all duration-300 p-8 space-y-4 group h-full">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center justify-center font-mono font-bold">
                  03
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary group-hover:text-violet-400 transition-colors">Interview Summary & Progress</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Track your daily practice streaks, solve coding benchmarks, and watch your campus rank rise.
                </p>
              </Card>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-surface-raised/40 border-y border-border/60 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <Reveal direction="up" className="text-center max-w-xl mx-auto space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Student Testimonials</p>
            <h2 className="font-serif text-3xl font-medium text-text-primary">Hear from students who nailed placement day</h2>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <TestimonialsCarousel />
          </Reveal>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full space-y-8">
        <Reveal direction="up" className="text-center space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Frequently Asked Questions</p>
          <h2 className="font-serif text-3xl font-medium text-text-primary">Everything you need to know</h2>
        </Reveal>

        <Reveal direction="up" delay={0.15}>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="p-5 glass border-border cursor-pointer transition-all hover:border-cyan-400/40 hover:shadow-card"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-base font-medium text-text-primary">{faq.q}</h3>
                  <ChevronDown className={`w-4 h-4 text-accent transition-transform duration-200 ${activeFaq === index ? "rotate-180" : ""}`} />
                </div>
                {activeFaq === index && (
                  <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-border leading-relaxed font-sans">
                    {faq.a}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-5xl mx-auto px-6 mb-20 w-full">
        <Reveal direction="up">
          <div className="border-beam-card bg-gradient-to-r from-surface via-surface-raised to-surface border border-accent/40 p-10 rounded-2xl text-center space-y-6 shadow-soft relative overflow-hidden">
            <GradientMesh variant="sunset" />
            <div className="space-y-2 max-w-xl mx-auto z-10 relative">
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-text-primary">Ready for your mock interview?</h2>
              <p className="text-sm text-text-secondary">Start practicing on AI Interview Preparation today and master your placement rounds.</p>
            </div>
            <div className="flex justify-center gap-4 z-10 relative">
              <Button variant="primary" size="lg" onClick={handleDemoStudent} className="shadow-[0_0_20px_var(--accent-glow)]">
                <Sparkles className="w-5 h-5" /> Launch Instant Demo
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
};
