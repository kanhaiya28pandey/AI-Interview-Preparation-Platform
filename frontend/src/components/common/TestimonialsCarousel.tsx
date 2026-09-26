import React, { useState, useEffect, useRef } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  college: string;
  avatar: string;
  quote: string;
  stars?: number;
}

export const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Aarav Sharma",
    role: "Backend SDE-1",
    company: "Amazon",
    college: "SRM Institute of Science and Technology",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    quote: "The AI mock feedback showed me exactly where my system design answers were lacking. Walked into my Amazon interview feeling like it was just another practice session.",
    stars: 5,
  },
  {
    id: "2",
    name: "Priya Nair",
    role: "Full Stack Engineer",
    company: "Microsoft",
    college: "IIT Madras",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    quote: "The coding arena and STAR behavioral questions prepared me for tough pressure questions. The AI evaluator caught subtle race conditions in my concurrent queue answer that no other practice tool ever highlighted.",
    stars: 5,
  },
  {
    id: "3",
    name: "Vikramaditya Roy",
    role: "Systems SDE",
    company: "Atlassian",
    college: "BITS Pilani",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    quote: "Tracking my streak and watching my mock score increase from 65% to 92% gave me unbelievable confidence before campus drives. The feedback on communication clarity helped me structure my thoughts effortlessly during final manager rounds.",
    stars: 5,
  },
  {
    id: "4",
    name: "Ananya Deshmukh",
    role: "Frontend Engineer",
    company: "Google",
    college: "VJTI Mumbai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    quote: "The real-time scorecard and trade-off analysis during MERN mock interviews helped me land my dream role at Google with zero interview anxiety.",
    stars: 5,
  },
  {
    id: "5",
    name: "Rohan Kulkarni",
    role: "Platform Engineer",
    company: "Flipkart",
    college: "PES University Bengaluru",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    quote: "Before using AI Interview Preparation, I always froze during live coding rounds. Practicing 15+ benchmark problems with simulated execution gave me the speed and muscle memory I needed.",
    stars: 5,
  },
  {
    id: "6",
    name: "Sneha Reddy",
    role: "Distributed Systems SDE",
    company: "Oracle",
    college: "IIIT Hyderabad",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    quote: "As a 4th-year student juggling coursework and placement prep, the platform's daily streaks kept me accountable. The technical feedback was so specific and actionable that I cleared all 4 rounds at Oracle on my first attempt!",
    stars: 5,
  },
];

export const TestimonialsCarousel: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Autoplay functionality every 5s (pauses on hover, respects reduced motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      if (!trackRef.current) return;
      const nextIndex = (activeIndex + 1) % mockTestimonials.length;
      if (nextIndex === 0) {
        trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        trackRef.current.scrollBy({ left: 360, behavior: "smooth" });
      }
      setActiveIndex(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex, isPaused]);

  const handleScroll = () => {
    if (!trackRef.current) return;
    const container = trackRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 360;
    const index = Math.round(scrollLeft / cardWidth);
    if (index >= 0 && index < mockTestimonials.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: -360, behavior: "smooth" });
    setActiveIndex((prev) => (prev === 0 ? mockTestimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: 360, behavior: "smooth" });
    setActiveIndex((prev) => (prev === mockTestimonials.length - 1 ? 0 : prev + 1));
  };

  const scrollToDot = (idx: number) => {
    if (!trackRef.current) return;
    const cardElements = trackRef.current.children;
    if (cardElements[idx]) {
      const targetCard = cardElements[idx] as HTMLElement;
      trackRef.current.scrollTo({
        left: targetCard.offsetLeft - trackRef.current.offsetLeft,
        behavior: "smooth",
      });
      setActiveIndex(idx);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className="w-full space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Scrollable Track - Bulletproof CSS scroll-snap */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {mockTestimonials.map((t) => (
          <article
            key={t.id}
            style={{ flex: "0 0 auto", width: "min(340px, 85vw)", minWidth: "260px" }}
            className="snap-center rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-card"
          >
            <div className="space-y-3 min-w-0 flex-1">
              {/* Top Row: Quote Mark Icon + Star Rating */}
              <div className="flex items-center justify-between">
                <Quote className="w-7 h-7 text-cyan-400 fill-cyan-400/20" />
                <div className="flex items-center gap-1 text-cyan-400">
                  {Array.from({ length: t.stars || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-cyan-400" />
                  ))}
                </div>
              </div>

              {/* Quote Text */}
              <div className="min-w-0">
                <p className="text-[17px] text-text-primary leading-[1.6] font-sans whitespace-normal break-words">
                  "{t.quote}"
                </p>
              </div>
            </div>

            {/* Divider & User Information */}
            <div className="pt-4 mt-4 border-t border-border min-w-0">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar with Initials Fallback */}
                <div className="relative shrink-0 w-11 h-11 rounded-full overflow-hidden border border-cyan-400/40 bg-surface-raised flex items-center justify-center font-mono font-bold text-sm text-cyan-400">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <span>{getInitials(t.name)}</span>
                </div>

                {/* Candidate Name & Role Label */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-sm font-semibold text-text-primary truncate font-sans">{t.name}</h4>
                  <p className="text-xs font-mono text-cyan-400 font-medium truncate">
                    {t.role} · <span className="text-text-primary font-semibold">{t.company}</span>
                  </p>
                  <p className="text-[11px] text-text-muted font-mono truncate">{t.college}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Navigation Row: Pagination Dots & Scroll Arrows */}
      <div className="flex items-center justify-between px-2">
        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {mockTestimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToDot(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "w-6 bg-cyan-400" : "w-2 bg-border hover:bg-text-muted"
              }`}
            />
          ))}
        </div>

        {/* Previous & Next Scroll Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous Testimonial"
            className="p-2 rounded-full bg-surface-raised border border-border text-text-primary hover:border-cyan-400 hover:text-cyan-400 transition-colors focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Testimonial"
            className="p-2 rounded-full bg-surface-raised border border-border text-text-primary hover:border-cyan-400 hover:text-cyan-400 transition-colors focus:outline-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
