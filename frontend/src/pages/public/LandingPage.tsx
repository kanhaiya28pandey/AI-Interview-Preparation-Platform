import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Code2, Video, Award, ArrowRight, CheckCircle2, Terminal, ChevronDown, Star, Layers, ShieldCheck, Flame, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CompanyMarquee } from "@/components/common/CompanyMarquee";
import { TestimonialsCarousel } from "@/components/common/TestimonialsCarousel";

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user, loginDemoStudent, loginDemoAdmin } = useAuth();
  const navigate = useNavigate();

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  const formatClock = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleDemoStudent = () => {
    loginDemoStudent();
    navigate("/dashboard");
  };

  const handleDemoAdmin = () => {
    loginDemoAdmin();
    navigate("/admin");
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
      <section className="relative max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        {/* Glowing Spotlight Background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 opacity-30 dark:opacity-100 rounded-full blur-[120px] pointer-events-none" />

        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            AI Placement Preparation Platform for Colleges
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight leading-[1.08]">
            Walk into your interview <br />
            already <em className="not-italic text-cyan-400 italic font-normal">prepared for every question.</em>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl font-sans">
            AI Interview Preparation is the modern practice platform for top engineering students. Practice adapted mock interviews, solve algorithm benchmarks, and walk into placement drives with complete confidence.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {isAuthenticated ? (
              <Button
                variant="teal-cyan"
                size="lg"
                onClick={() => navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard")}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 text-[#0d1321] transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            ) : (
              <>
                <Button variant="primary" size="lg" onClick={handleDemoStudent}>
                  <Sparkles className="w-5 h-5" /> Try Instant Demo
                </Button>
                <Link to="/register">
                  <Button variant="outline" size="lg">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Count-up Statistics Row */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/80">
            <div>
              <b className="font-serif text-3xl sm:text-4xl font-semibold text-text-primary block">{studentsCount}+</b>
              <span className="text-xs text-text-muted font-mono uppercase">Verified Students</span>
            </div>
            <div>
              <b className="font-serif text-3xl sm:text-4xl font-semibold text-cyan-400 block">{mockCount}+</b>
              <span className="text-xs text-text-muted font-mono uppercase">Mock Interviews Done</span>
            </div>
            <div>
              <b className="font-serif text-3xl sm:text-4xl font-semibold text-live block">94%</b>
              <span className="text-xs text-text-muted font-mono uppercase">Placement Success</span>
            </div>
          </div>
        </div>

        {/* Live Session Terminal Card */}
        <div className="lg:col-span-5 w-full">
          <Card className="p-0 overflow-hidden bg-surface border-cyan-400/40 shadow-soft relative group">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-raised">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-live animate-pulse-live" />
                <span className="font-mono text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Mock Session #104
                </span>
              </div>
              <span className="font-mono text-xs text-text-muted">{formatClock(sessionSeconds)}</span>
            </div>

            <div className="p-5 h-[340px] overflow-y-auto font-mono text-xs space-y-4 bg-surface divider-fade">
              <div className="p-3 bg-surface-raised border border-border rounded-lg space-y-1">
                <span className="text-cyan-400 font-semibold block">AI Evaluator:</span>
                <p className="text-text-primary leading-relaxed">
                  "Explain how React 19 concurrent rendering and Fiber engine prevent main-thread UI lag during complex updates."
                </p>
              </div>

              <div className="p-3 bg-ink border border-cyan-400/30 rounded-lg space-y-1">
                <span className="text-live font-semibold block">Candidate Answer:</span>
                <p className="text-text-primary leading-relaxed">
                  "Fiber breaks work into units. useTransition marks state updates as non-urgent so urgent user input renders immediately..."
                </p>
              </div>

              <div className="p-3 bg-surface-raised border border-live/30 rounded-lg space-y-1">
                <span className="text-live font-semibold block">Instant Scorecard: 92/100</span>
                <p className="text-text-muted text-[11px]">
                  ✓ Articulated reconciliation accurately. <br />
                  💡 Tip: Mention requestAnimationFrame for animation frames.
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface-raised border-t border-border flex justify-between items-center text-xs font-mono text-text-muted">
              <span>Status: <strong className="text-live">Live Evaluator Active</strong></span>
              <button onClick={handleDemoAdmin} className="text-cyan-400 hover:underline">
                Try Admin View →
              </button>
            </div>
          </Card>
        </div>
      </section>

      {/* Company Logos Marquee */}
      <CompanyMarquee />

      {/* 3 Step Workflow */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">The Preparation Method</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-text-primary">Three steps to placement mastery</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-surface border-border hover:border-accent/50 hover:shadow-card transition-all duration-300 p-8 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent border border-accent/30 flex items-center justify-center font-mono font-bold">
              01
            </div>
            <h3 className="font-serif text-xl font-medium text-text-primary group-hover:text-accent transition-colors">Practice a Round</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Pick a domain track — MERN, Java Spring Boot, System Design, or STAR Behavioral — and enter the simulated interview room.
            </p>
          </Card>

          <Card className="bg-surface border-border hover:border-accent/50 hover:shadow-card transition-all duration-300 p-8 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-live/15 text-live border border-live/30 flex items-center justify-center font-mono font-bold">
              02
            </div>
            <h3 className="font-serif text-xl font-medium text-text-primary group-hover:text-accent transition-colors">Get Detailed Feedback</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              No generic fluff. Feedback pinpoints technical depth, architectural trade-offs, and communication clarity with exact scores.
            </p>
          </Card>

          <Card className="bg-surface border-border hover:border-accent/50 hover:shadow-card transition-all duration-300 p-8 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 flex items-center justify-center font-mono font-bold">
              03
            </div>
            <h3 className="font-serif text-xl font-medium text-text-primary group-hover:text-accent transition-colors">Interview Summary & Progress</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Track your daily practice streaks, solve coding benchmarks, and watch your campus rank rise.
            </p>
          </Card>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-surface-raised/40 border-y border-border/60 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Student Testimonials</p>
            <h2 className="font-serif text-3xl font-medium text-text-primary">Hear from students who nailed placement day</h2>
          </div>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full space-y-8">
        <div className="text-center space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Frequently Asked Questions</p>
          <h2 className="font-serif text-3xl font-medium text-text-primary">Everything you need to know</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="p-5 bg-surface border-border cursor-pointer transition-colors hover:border-accent/40 hover:shadow-card"
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
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-5xl mx-auto px-6 mb-20 w-full">
        <div className="bg-gradient-to-r from-surface via-surface-raised to-surface border border-accent/40 p-10 rounded-2xl text-center space-y-6 shadow-soft relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto z-10 relative">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-text-primary">Ready for your mock interview?</h2>
            <p className="text-sm text-text-secondary">Start practicing on AI Interview Preparation today and master your placement rounds.</p>
          </div>
          <div className="flex justify-center gap-4 z-10 relative">
            <Button variant="primary" size="lg" onClick={handleDemoStudent}>
              <Sparkles className="w-5 h-5" /> Launch Instant Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
