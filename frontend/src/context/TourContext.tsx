/**
 * TourContext
 *
 * Manages:
 * 1. The guided product tour (coach marks with spotlight) — step-by-step.
 * 2. Hotspot dismissal state (which "New!" dots the user has clicked away).
 *
 * All state persists per user via userScope (localStorage scoped to userId).
 *
 * API:
 *   const { startTour, isTourActive, currentStep, ... } = useTour();
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { getScopedItem, setScopedItem } from "@/lib/userScope";

// ─── Tour step definition ──────────────────────────────────────────────────

export interface TourStep {
  /** CSS selector for the element to spotlight */
  target: string;
  /** Heading shown in the coach mark card */
  title: string;
  /** Body text */
  body: string;
  /** Which side of the target the card appears */
  placement?: "top" | "bottom" | "left" | "right";
}

export const STUDENT_TOUR: TourStep[] = [
  {
    target: '[href="/dashboard"]',
    title: "Your Dashboard 🏠",
    body: "Track your readiness score, activity streak, and daily goals all in one place.",
    placement: "right",
  },
  {
    target: '[href="/practice"]',
    title: "Practice Tracks 📚",
    body: "Structured domain-wise practice with curated questions at every difficulty level.",
    placement: "right",
  },
  {
    target: '[href="/resume-analyzer"]',
    title: "Resume Analyzer 🤖",
    body: "Upload your resume — our AI grades it against real ATS systems in seconds.",
    placement: "right",
  },
  {
    target: '[href="/coding"]',
    title: "Coding Arena 💻",
    body: "Solve DSA problems in our in-browser IDE. Hints, test cases, and explanations included.",
    placement: "right",
  },
  {
    target: '[href="/mock-interview"]',
    title: "AI Mock Interview 🎤",
    body: "Practice with an AI interviewer. Get a real score and detailed feedback instantly.",
    placement: "right",
  },
  {
    target: '[href="/leaderboard"]',
    title: "Campus Leaderboard 🏆",
    body: "See how you rank against your classmates. Climb the board by solving more problems.",
    placement: "right",
  },
  {
    target: '[href="/profile"]',
    title: "Your Profile 👤",
    body: "Complete your profile to unlock the verified badge and stand out to recruiters.",
    placement: "right",
  },
];

export const ADMIN_TOUR: TourStep[] = [
  {
    target: '[href="/admin/verifications"]',
    title: "ID Verifications ✅",
    body: "Review pending student registrations and approve or reject their ID documents.",
    placement: "right",
  },
  {
    target: '[href="/admin/content"]',
    title: "Content Manager 📝",
    body: "Create and publish questions, articles, and quizzes for all domains and topics.",
    placement: "right",
  },
  {
    target: '[href="/admin/taxonomy"]',
    title: "Domains & Topics 🗂️",
    body: "Manage the taxonomy — add domains, topics and subtopics that structure all content.",
    placement: "right",
  },
  {
    target: '[href="/admin/reports"]',
    title: "Analytics & Reports 📊",
    body: "Monitor student progress, platform health and content engagement in real time.",
    placement: "right",
  },
];

// ─── Context ───────────────────────────────────────────────────────────────

interface TourContextType {
  /** Whether the full-page tour is currently active */
  isTourActive: boolean;
  /** Current step index (0-based) */
  currentStep: number;
  /** Steps for the active tour */
  steps: TourStep[];
  /** Start the tour (pass custom steps to override the role-based default) */
  startTour: (customSteps?: TourStep[]) => void;
  /** Go to the next step */
  nextStep: () => void;
  /** Go back a step */
  prevStep: () => void;
  /** Skip / close the tour entirely */
  skipTour: () => void;
  /** True if the user has already completed the tour */
  tourSeen: boolean;
  /** Dismiss a hotspot by its key */
  dismiss: (key: string) => void;
  /** Check if a hotspot has been dismissed */
  isDismissed: (key: string) => boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_SEEN_KEY = "tour_seen_v1";
const DISMISSED_KEY = "tour_dismissed_v1";

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const userId = user?.userId;
  const isAdmin = user?.role === "ADMIN";

  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [tourSeen, setTourSeen] = useState(true); // default true = don't auto-start
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  // Load per-user state from userScope
  useEffect(() => {
    if (!userId) return;
    const seen = getScopedItem<boolean>(userId, TOUR_SEEN_KEY, false);
    setTourSeen(seen);
    const dis = getScopedItem<Record<string, boolean>>(userId, DISMISSED_KEY, {});
    setDismissed(dis);

    // Auto-start if not seen and user is authenticated
    if (!seen) {
      const defaultSteps = isAdmin ? ADMIN_TOUR : STUDENT_TOUR;
      // Small delay so the page layout stabilises first
      const t = setTimeout(() => {
        setSteps(defaultSteps);
        setCurrentStep(0);
        setIsTourActive(true);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [userId, isAdmin]);

  // Keyboard navigation for the tour
  useEffect(() => {
    if (!isTourActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipTour();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextStep();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevStep();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isTourActive, currentStep, steps.length]);

  const startTour = useCallback(
    (customSteps?: TourStep[]) => {
      const tourSteps = customSteps ?? (isAdmin ? ADMIN_TOUR : STUDENT_TOUR);
      setSteps(tourSteps);
      setCurrentStep(0);
      setIsTourActive(true);
    },
    [isAdmin]
  );

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) {
        // Tour complete
        setIsTourActive(false);
        if (userId) {
          setScopedItem(userId, TOUR_SEEN_KEY, true);
          setTourSeen(true);
        }
        return 0;
      }
      return prev + 1;
    });
  }, [steps.length, userId]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    if (userId) {
      setScopedItem(userId, TOUR_SEEN_KEY, true);
      setTourSeen(true);
    }
  }, [userId]);

  const dismiss = useCallback(
    (key: string) => {
      setDismissed((prev) => {
        const next = { ...prev, [key]: true };
        if (userId) setScopedItem(userId, DISMISSED_KEY, next);
        return next;
      });
    },
    [userId]
  );

  const isDismissed = useCallback(
    (key: string) => !!dismissed[key],
    [dismissed]
  );

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStep,
        steps,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        tourSeen,
        dismiss,
        isDismissed,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be inside TourProvider");
  return ctx;
};
