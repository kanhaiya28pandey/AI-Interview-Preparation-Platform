import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Callout } from "@/components/common/Callout";
import {
  Video,
  Code2,
  Flame,
  Award,
  TrendingUp,
  AlertOctagon,
  Compass,
  X,
  Lock,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
  BarChart3,
  BookOpen,
  FileText,
  Activity,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { profileService } from "@/services/profileService";
import { progressService } from "@/services/progressService";
import { liveTestService, LiveTestContest } from "@/services/liveTestService";
import { mockLeaderboardData, LeaderboardUser } from "@/mocks/leaderboardData";
import { UserProfile, calculateProfileCompletion } from "@/mocks/profileData";
import { AvatarCompletionRing } from "@/components/common/AvatarCompletionRing";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { Reveal, PointerArrow, AnimatedCounter } from "@/components/fx";
import { QuoteCard } from "@/components/student/QuoteCard";
import { useReducedEffects } from "@/hooks/useReducedEffects";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reducedMotion = useReducedEffects();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissChecklist, setDismissChecklist] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const { status: verifStatus, submission: verifSub } = useVerificationStatus();

  // Ticking timer for countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    profileService
      .getProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.warn("Failed to load profile:", err))
      .finally(() => setLoading(false));

    const handleProfileUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      } else {
        profileService.getProfile().then((data) => setProfile(data));
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [user]);

  // Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 6) return { text: "Burning the midnight oil", emoji: "🌙" };
    if (hour < 12) return { text: "Good morning", emoji: "☀️" };
    if (hour < 18) return { text: "Good afternoon", emoji: "👋" };
    return { text: "Good evening", emoji: "🌙" };
  }, [now]);

  // Real stats calculation
  const totalCompletedQuestions = useMemo(
    () => progressService.getCompletedQuestionsCount(user?.userId),
    [user?.userId]
  );
  const totalCodingSolved = useMemo(
    () => progressService.getCodingProblemsSolvedCount(user?.userId) || profile?.stats.codingProblemsSolved || 0,
    [user?.userId, profile]
  );
  const interviewSessions = useMemo(
    () => progressService.getInterviewSessions(user?.userId),
    [user?.userId]
  );
  const totalMockInterviews = useMemo(
    () => interviewSessions.length || profile?.stats.mockInterviewsCompleted || 0,
    [interviewSessions, profile]
  );
  const resumeRecords = useMemo(
    () => progressService.getResumeAnalyses(user?.userId),
    [user?.userId]
  );
  const resumeCount = resumeRecords.length;

  const currentStreak = profile?.stats.currentStreak || 0;
  const currentXP = profile?.stats.totalXP || totalCodingSolved * 50 + totalMockInterviews * 100 + 240;
  const currentLevel = Math.max(1, Math.floor(currentXP / 800) + 1);
  const xpInCurrentLevel = currentXP % 800;
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / 800) * 100));

  const averageScore = useMemo(() => {
    if (profile?.stats.overallRating) return profile.stats.overallRating;
    if (interviewSessions.length > 0) {
      const sum = interviewSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0);
      return Math.round(sum / interviewSessions.length);
    }
    return totalCodingSolved > 0 ? 82 : 0;
  }, [profile, interviewSessions, totalCodingSolved]);

  const completion = profile ? calculateProfileCompletion(profile) : 0;

  // Live contests
  const liveTests = useMemo<LiveTestContest[]>(() => {
    try {
      const tests = liveTestService.getActiveOrScheduledTests();
      return tests.slice(0, 3);
    } catch {
      return [];
    }
  }, []);

  // Leaderboard preview (top 5 + current student)
  const topStudents = useMemo<LeaderboardUser[]>(() => {
    return mockLeaderboardData.slice(0, 5);
  }, []);

  // Daily goal calculation: 3 goals (Solve 1 coding problem, Practice 1 topic, 1 mock or resume)
  const dailyGoals = useMemo(() => {
    const goals = [
      {
        id: "goal-1",
        label: "Solve 1 Coding Challenge",
        completed: totalCodingSolved > 0,
        link: "/coding",
      },
      {
        id: "goal-2",
        label: "Practice 1 Placement Track",
        completed: totalCompletedQuestions > 0,
        link: "/practice",
      },
      {
        id: "goal-3",
        label: "Complete AI Mock / Resume ATS",
        completed: totalMockInterviews > 0 || resumeCount > 0,
        link: "/mock-interview",
      },
    ];
    const completedCount = goals.filter((g) => g.completed).length;
    const percentage = Math.round((completedCount / goals.length) * 100);
    return { goals, completedCount, total: goals.length, percentage };
  }, [totalCodingSolved, totalCompletedQuestions, totalMockInterviews, resumeCount]);

  // Skill Radar dataset (6 skills: DSA, System Design, DBMS, OS, HR, Communication)
  const skillRadarData = useMemo(() => {
    return [
      { topic: "DSA", score: Math.min(95, 60 + totalCodingSolved * 5) },
      { topic: "System Design", score: 72 },
      { topic: "DBMS & SQL", score: 80 },
      { topic: "OS & Networks", score: 68 },
      { topic: "HR Behavioral", score: Math.min(92, 65 + totalMockInterviews * 8) },
      { topic: "Communication", score: Math.min(90, 70 + totalMockInterviews * 6) },
    ];
  }, [totalCodingSolved, totalMockInterviews]);

  // Weekly activity trend
  const weeklyTrendData = [
    { day: "Mon", score: 68, questions: 4 },
    { day: "Tue", score: 74, questions: 7 },
    { day: "Wed", score: 79, questions: 5 },
    { day: "Thu", score: 85, questions: 9 },
    { day: "Fri", score: 82, questions: 6 },
    { day: "Sat", score: 89, questions: 12 },
    { day: "Sun", score: averageScore > 0 ? averageScore : 92, questions: 8 },
  ];

  // Checklist items
  const checklistItems = useMemo(() => {
    return [
      {
        id: "c1",
        title: "1. Verify Student Identity",
        desc: "Upload College ID to unlock all platform tools.",
        done: verifStatus === "Verified",
        link: "/verify-identity",
        actionText: "Verify ID",
      },
      {
        id: "c2",
        title: "2. Complete Profile",
        desc: "Add headline, course, and skills to reach 100%.",
        done: completion >= 80,
        link: "/profile",
        actionText: "Edit Profile",
      },
      {
        id: "c3",
        title: "3. Practice Engineering Topics",
        desc: "Review core architecture and questions.",
        done: totalCompletedQuestions > 0,
        link: "/practice",
        actionText: "Practice",
      },
      {
        id: "c4",
        title: "4. Solve First Coding Problem",
        desc: "Test your DSA logic in the interactive browser IDE.",
        done: totalCodingSolved > 0,
        link: "/coding",
        actionText: "Solve DSA",
      },
      {
        id: "c5",
        title: "5. Take First AI Mock Interview",
        desc: "Simulate live technical & behavioral rounds.",
        done: totalMockInterviews > 0,
        link: "/mock-interview",
        actionText: "Mock Interview",
      },
      {
        id: "c6",
        title: "6. Scan Placement Resume",
        desc: "Check ATS match against target job roles.",
        done: resumeCount > 0,
        link: "/resume-analyzer",
        actionText: "Scan Resume",
      },
    ];
  }, [verifStatus, completion, totalCompletedQuestions, totalCodingSolved, totalMockInterviews, resumeCount]);

  const allChecklistDone = checklistItems.every((i) => i.done);

  // Badges & Achievements
  const badgesList = [
    {
      id: "b-streak",
      name: "7-Day Streak Master",
      desc: "Practice 7 consecutive days",
      icon: Flame,
      color: "text-amber-400 border-amber-400/40 bg-amber-500/10",
      unlocked: currentStreak >= 7,
    },
    {
      id: "b-coding",
      name: "Algorithmic Sprinter",
      desc: "Solve 5+ coding benchmarks",
      icon: Code2,
      color: "text-indigo-400 border-indigo-400/40 bg-indigo-500/10",
      unlocked: totalCodingSolved >= 5,
    },
    {
      id: "b-interview",
      name: "Interview Ready",
      desc: "Complete your first AI mock round",
      icon: Video,
      color: "text-teal-400 border-teal-400/40 bg-teal-500/10",
      unlocked: totalMockInterviews >= 1,
    },
    {
      id: "b-ats",
      name: "ATS Optimized",
      desc: "Scan resume with 70%+ score",
      icon: FileText,
      color: "text-emerald-400 border-emerald-400/40 bg-emerald-500/10",
      unlocked: resumeCount >= 1,
    },
    {
      id: "b-system",
      name: "System Architect",
      desc: "Master high-concurrency design",
      icon: Layers,
      color: "text-purple-400 border-purple-400/40 bg-purple-500/10",
      unlocked: false,
    },
    {
      id: "b-contender",
      name: "Campus Contender",
      desc: "Reach top 10% on leaderboard",
      icon: Trophy,
      color: "text-rose-400 border-rose-400/40 bg-rose-500/10",
      unlocked: averageScore >= 85,
    },
  ];

  if (loading || !profile) {
    return (
      <div className="space-y-6 w-full max-w-[1600px] mx-auto">
        <CardSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-surface-raised animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto select-none pb-8">
      {/* 0. Identity Verification Notice Banner (If not Verified) */}
      {verifStatus !== "Verified" && (
        <Callout
          variant={
            verifStatus === "Rejected"
              ? "danger"
              : verifStatus === "Pending Verification"
              ? "warning"
              : "info"
          }
          icon={
            verifStatus === "Pending Verification"
              ? Clock
              : verifStatus === "Rejected"
              ? AlertTriangle
              : ShieldAlert
          }
          title={
            verifStatus === "Pending Verification"
              ? "Identity Verification Under Campus Review"
              : verifStatus === "Rejected"
              ? "Identity Verification Action Required"
              : "College ID Verification Required"
          }
          action={
            <Button
              variant={verifStatus === "Rejected" ? "danger" : "teal-cyan"}
              size="sm"
              onClick={() => navigate("/verify-identity")}
              className="text-xs shrink-0 font-semibold"
            >
              {verifStatus === "Rejected"
                ? "Resubmit ID Card"
                : verifStatus === "Pending Verification"
                ? "Check Status"
                : "Verify College ID"}
            </Button>
          }
        >
          {verifStatus === "Pending Verification"
            ? `Your College ID (Ref: ${verifSub?.verificationId || "VER-2026"}) is being reviewed. Platform modules will unlock automatically once verified.`
            : verifStatus === "Rejected"
            ? `Submission notes: ${verifSub?.rejectionNotes || "Document unreadable"}. Please upload a clearer copy.`
            : "Upload your valid College ID to unlock the Coding Arena, AI Mock Interviews, and Contests."}
        </Callout>
      )}

      {/* SECTION 1: WELCOME BANNER (Personalized greeting by time of day + primary action) */}
      <Reveal direction="up" duration={0.5}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface via-surface-raised to-surface border border-cyan-400/40 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Ambient colorful background glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -left-12 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"
          />

          <div className="flex items-center gap-5 z-10">
            <AvatarCompletionRing
              profile={profile}
              avatarUrl={profile?.avatar || user?.avatarUrl}
              name={user?.name || profile?.name}
              size="xl"
            />
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-400 text-xs font-mono">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span className="font-semibold">{currentStreak}</span>
                <span>Day Streak · Placement Momentum</span>
              </div>
              <h1 className="font-serif font-bold tracking-tight text-text-primary text-2xl sm:text-3xl leading-tight">
                {greeting.emoji} {greeting.text},{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                  {user?.name || "Student"}
                </span>
                !
              </h1>
              <p className="mt-1.5 text-sm sm:text-[15px] leading-relaxed text-text-secondary max-w-xl">
                {averageScore > 0
                  ? `Your placement readiness index is standing at ${averageScore}%. Ready for today's simulated mock round?`
                  : "Welcome to your placement preparation cockpit. Complete today's targets to climb the campus leaderboard."}
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <Button
              variant="teal-cyan"
              size="md"
              onClick={() => {
                if (verifStatus !== "Verified") {
                  toast.warning("Mock Interview is locked until College ID verification.", {
                    action: { label: "Verify", onClick: () => navigate("/verify-identity") },
                  });
                  return;
                }
                navigate("/mock-interview");
              }}
              className="shadow-[0_0_20px_rgba(34,211,238,0.35)] font-semibold"
            >
              {verifStatus !== "Verified" ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              <span>Start Mock Interview</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                if (verifStatus !== "Verified") {
                  toast.warning("Coding Arena is locked until College ID verification.", {
                    action: { label: "Verify", onClick: () => navigate("/verify-identity") },
                  });
                  return;
                }
                navigate("/coding");
              }}
              className="hover:border-cyan-400/60 font-medium"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Coding Arena</span>
            </Button>
          </div>
        </div>
      </Reveal>

      {/* DAILY MOTIVATION SECTION (Between Greeting Hero & KPI Stats) */}
      <Reveal direction="up" delay={0.1}>
        <QuoteCard />
      </Reveal>

      {/* SECTION 2: STATS ROW (5 animated cards with distinct colors) */}
      <Reveal direction="up" delay={0.2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Day Streak (Amber / Flame) */}
          <Card className="p-5 bg-surface border border-amber-500/30 hover:border-amber-400/60 shadow-sm transition-[border-color,box-shadow] flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                Day Streak
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div className="mt-3">
              <b className="font-serif text-3xl font-semibold text-text-primary block">
                <AnimatedCounter value={currentStreak} suffix=" Days" />
              </b>
              <p className="text-[11px] text-text-muted mt-0.5">Daily practice momentum</p>
            </div>
          </Card>

          {/* Card 2: XP / Level with progress bar (Violet / Purple) */}
          <Card className="p-5 bg-surface border border-purple-500/30 hover:border-purple-400/60 shadow-sm transition-[border-color,box-shadow] flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider font-semibold">
                Level {currentLevel}
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between items-baseline">
                <b className="font-serif text-2xl font-semibold text-text-primary">
                  <AnimatedCounter value={currentXP} suffix=" XP" />
                </b>
                <span className="text-[10px] font-mono text-purple-300">{levelProgress}%</span>
              </div>
              <Progress value={levelProgress} color="accent" className="h-1.5" />
            </div>
          </Card>

          {/* Card 3: Interviews Completed (Teal / Cyan) */}
          <Card className="p-5 bg-surface border border-cyan-500/30 hover:border-cyan-400/60 shadow-sm transition-[border-color,box-shadow] flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Interviews
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <b className="font-serif text-3xl font-semibold text-text-primary block">
                <AnimatedCounter value={totalMockInterviews} />
              </b>
              <p className="text-[11px] text-text-muted mt-0.5">AI mock rounds completed</p>
            </div>
          </Card>

          {/* Card 4: Problems Solved (Indigo) */}
          <Card className="p-5 bg-surface border border-indigo-500/30 hover:border-indigo-400/60 shadow-sm transition-[border-color,box-shadow] flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                Problems
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <b className="font-serif text-3xl font-semibold text-text-primary block">
                <AnimatedCounter value={totalCodingSolved} />
              </b>
              <p className="text-[11px] text-text-muted mt-0.5">Algorithmic benchmarks</p>
            </div>
          </Card>

          {/* Card 5: Average Score (Emerald / Green) */}
          <Card className="p-5 bg-surface border border-emerald-500/30 hover:border-emerald-400/60 shadow-sm transition-[border-color,box-shadow] flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Average Score
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <b className="font-serif text-3xl font-semibold text-text-primary block">
                {averageScore > 0 ? (
                  <AnimatedCounter value={averageScore} suffix="%" />
                ) : (
                  <span className="text-xl text-text-muted">No data</span>
                )}
              </b>
              <p className="text-[11px] text-text-muted mt-0.5">
                {averageScore > 0 ? "Placement percentile" : "Take mock to score"}
              </p>
            </div>
          </Card>
        </div>
      </Reveal>

      {/* SECTION 3 & 4: DAILY GOAL RING + ANALYTICS (Weekly chart + Skill Radar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Goal Ring (col-span-4) */}
        <Card className="lg:col-span-4 p-6 bg-surface border border-border flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                Daily Discipline
              </span>
              <h3 className="font-serif text-lg font-medium text-text-primary">Today's Target Ring</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
              {dailyGoals.completedCount} / {dailyGoals.total} Done
            </span>
          </div>

          {/* Circular Progress Ring */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-border/70"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-cyan-400 transition-[stroke-dashoffset] duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * dailyGoals.percentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-serif text-3xl font-semibold text-text-primary">
                  {dailyGoals.percentage}%
                </span>
                <span className="text-[10px] font-mono text-text-muted uppercase">Target</span>
              </div>
            </div>
          </div>

          {/* Goal Targets List */}
          <div className="space-y-2 pt-2 border-t border-border/80">
            {dailyGoals.goals.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(g.link)}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                  g.completed
                    ? "bg-teal-500/5 border-teal-500/30 text-text-primary"
                    : "bg-surface-raised border-border text-text-secondary hover:border-cyan-400/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${g.completed ? "text-live" : "text-text-muted"}`}
                  />
                  <span className={g.completed ? "line-through opacity-80" : ""}>{g.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              </div>
            ))}
          </div>
        </Card>

        {/* Analytics: Weekly Activity AreaChart (col-span-4) */}
        <Card className="lg:col-span-4 p-6 bg-surface border border-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                Momentum
              </span>
              <h3 className="font-serif text-lg font-medium text-text-primary">Weekly Score Trend</h3>
            </div>
            <span className="text-xs font-mono text-live bg-live/10 px-2 py-0.5 rounded-full border border-live/30">
              Active Streak
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-text-muted text-center font-sans">
            Consistent performance across daily algorithmic & interview attempts
          </p>
        </Card>

        {/* Analytics: Skill Radar (col-span-4) */}
        <Card className="lg:col-span-4 p-6 bg-surface border border-border flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-mono text-purple-400 font-semibold uppercase tracking-wider">
              Proficiency
            </span>
            <h3 className="font-serif text-lg font-medium text-text-primary">Topic Skill Radar</h3>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillRadarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="topic"
                  stroke="var(--text-muted)"
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border)" tick={false} />
                <Radar
                  name="Proficiency"
                  dataKey="score"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-text-muted text-center font-sans">
            DSA, System Design, DBMS, OS, HR & Communication
          </p>
        </Card>
      </div>

      {/* SECTION 5: GETTING STARTED CHECKLIST (Auto-hides when complete, pretty design) */}
      {!allChecklistDone && !dismissChecklist && (
        <Reveal direction="up">
          <Card className="p-6 md:p-8 bg-surface border border-border shadow-md space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-text-primary flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" /> Getting Started Checklist
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Complete these essential onboarding milestones to join your campus placement roster.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/30 font-semibold">
                  {checklistItems.filter((i) => i.done).length} of {checklistItems.length} Done
                </span>
                <button
                  type="button"
                  onClick={() => setDismissChecklist(true)}
                  className="p-1 text-text-muted hover:text-text-primary rounded-lg transition-colors"
                  title="Dismiss checklist"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    item.done
                      ? "bg-teal-500/5 border-teal-500/30"
                      : "bg-surface-raised/40 border-border hover:border-cyan-400/40"
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-text-primary flex items-center justify-between">
                      <span>{item.title}</span>
                      {item.done && (
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded font-bold">
                          Done
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-text-muted leading-relaxed font-sans">{item.desc}</p>
                  </div>

                  <Button
                    variant={item.done ? "outline" : "teal-cyan"}
                    size="sm"
                    onClick={() => navigate(item.link)}
                    className="w-full text-xs font-mono mt-1"
                  >
                    {item.actionText}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      )}

      {/* SECTION 6 & 7: BALANCED TWO-COLUMN ROW (Contests + Recommendation on Left, Leaderboard on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (lg:col-span-7): Upcoming Live Tests + Personalized Recommendation Stack */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card A: Upcoming Live Contests */}
          <Card className="p-6 bg-surface border border-border flex flex-col justify-start items-stretch">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono text-rose-400 font-semibold uppercase tracking-wider">
                  Contests & Tests
                </span>
                <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-400" /> Upcoming Live Contests
                </h3>
              </div>
              <Link
                to="/live-tests"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {liveTests.length === 0 ? (
                <div className="text-center py-5 text-text-muted space-y-2">
                  <Calendar className="w-7 h-7 mx-auto opacity-50 text-rose-400" />
                  <p className="text-xs font-sans">No live tests scheduled right now.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/live-tests")}
                    className="text-xs"
                  >
                    View all tests
                  </Button>
                </div>
              ) : (
                liveTests.slice(0, 3).map((test) => {
                  const startTime = test.scheduledStartTime ? new Date(test.scheduledStartTime) : new Date(Date.now() + 3600000 * 4);
                  const diffMs = Math.max(0, startTime.getTime() - now.getTime());
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

                  return (
                    <div
                      key={test.id}
                      className="p-4 rounded-2xl bg-surface-raised/50 border border-border hover:border-rose-400/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-primary">{test.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                            {test.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted font-sans">
                          {test.durationMinutes || 60} mins · {test.problems?.length || 4} challenges · {test.totalMarks || 100} marks
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono text-xs">
                          <span className="text-[10px] text-text-muted block">Starts in</span>
                          <span className="text-rose-300 font-semibold">
                            {diffHours}h {diffMins}m {diffSecs}s
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="teal-cyan"
                          onClick={() => navigate(`/live-tests?testId=${test.id}`)}
                          className="text-xs font-mono"
                        >
                          Enter
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Card B: Personalized Recommendation */}
          <Reveal direction="up">
            <Card className="p-6 bg-gradient-to-r from-surface via-surface-raised to-surface border border-cyan-400/30 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      Personalized Recommendation
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-medium text-text-primary">
                      {totalMockInterviews === 0
                        ? "Take your first AI Mock Interview round"
                        : totalCodingSolved < 3
                        ? "Solve algorithmic challenges in the Coding Arena"
                        : "Benchmark Distributed Caching in System Design"}
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed font-sans max-w-xl">
                      {totalMockInterviews === 0
                        ? "Simulate a 15-minute technical round with real-time rubric feedback on complexity and trade-off articulation."
                        : totalCodingSolved < 3
                        ? "Complete 3 benchmark DSA problems to unlock the 'Algorithmic Sprinter' achievement badge."
                        : "System design rounds at Tier-1 companies prioritize cache-aside patterns and rate limiter logic."}
                    </p>
                  </div>
                </div>

                <Button
                  variant="teal-cyan"
                  size="md"
                  onClick={() =>
                    navigate(
                      totalMockInterviews === 0
                        ? "/mock-interview"
                        : totalCodingSolved < 3
                        ? "/coding"
                        : "/practice?domain=system-design"
                    )
                  }
                  className="shrink-0 font-semibold"
                >
                  <span>Start Action</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Right Column (lg:col-span-5): Campus Leaderboard Preview */}
        <Card className="lg:col-span-5 p-6 bg-surface border border-border flex flex-col justify-start items-stretch self-start">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
                Rankings
              </span>
              <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Campus Leaderboard
              </h3>
            </div>
            <Link
              to="/leaderboard"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {topStudents.map((s, idx) => (
              <div
                key={s.userId}
                className="p-2.5 rounded-xl bg-surface-raised/40 border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      idx === 0
                        ? "bg-amber-400 text-black"
                        : idx === 1
                        ? "bg-slate-300 text-black"
                        : idx === 2
                        ? "bg-amber-700 text-white"
                        : "bg-surface-raised text-text-muted"
                    }`}
                  >
                    {s.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">{s.name}</p>
                    <p className="text-[10px] text-text-muted truncate">{s.college}</p>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <span className="text-cyan-400 font-semibold block">{s.score} XP</span>
                  <span className="text-[10px] text-text-muted">{s.streakDays}d streak</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3.5 p-2.5 rounded-xl bg-surface-raised border border-border flex items-center justify-between text-xs font-mono">
            <span className="text-text-secondary">Your Current Standing:</span>
            <span className="text-accent-bright font-bold">Top 8% percentile</span>
          </div>
        </Card>
      </div>

      {/* SECTION 9: ACHIEVEMENTS AND BADGES */}
      <Reveal direction="up">
        <Card className="p-6 bg-surface border border-border flex flex-col justify-start items-stretch">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-purple-400 font-semibold uppercase tracking-wider">
                Milestones
              </span>
              <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" /> Achievements & Badges
              </h3>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {badgesList.filter((b) => b.unlocked).length} of {badgesList.length} Unlocked
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {badgesList.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                    badge.unlocked
                      ? `${badge.color} shadow-sm scale-[1.02]`
                      : "bg-surface-raised/30 border-border text-text-locked"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      badge.unlocked ? "bg-surface" : "bg-surface-raised"
                    }`}
                  >
                    {badge.unlocked ? (
                      <Icon className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4 text-text-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold truncate max-w-full">{badge.name}</p>
                    <p className="text-[10px] text-text-muted leading-tight mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Reveal>

      {/* SECTION 10: RECENT ACTIVITY TIMELINE */}
      <Card className="w-full p-6 bg-surface border border-border flex flex-col justify-start items-stretch">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              Activity Log
            </span>
            <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Recent Practice Timeline
            </h3>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {interviewSessions.length === 0 && totalCodingSolved === 0 ? (
            <div className="col-span-2 py-8 text-center text-text-muted space-y-2">
              <Activity className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-xs font-sans">No recorded activities yet.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/practice")}
                className="text-xs font-mono"
              >
                Start Your First Session
              </Button>
            </div>
          ) : (
            <>
              {interviewSessions.slice(0, 2).map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-surface-raised/40 border border-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{s.roleTitle || "AI Mock Round"}</p>
                      <p className="text-[10px] text-text-muted">{s.date || "Completed"}</p>
                    </div>
                  </div>
                  <span className="font-mono text-live font-semibold text-sm">{s.overallScore || 85}%</span>
                </div>
              ))}

              {totalCodingSolved > 0 && (
                <div className="p-3.5 rounded-2xl bg-surface-raised/40 border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">DSA Problem Benchmark</p>
                      <p className="text-[10px] text-text-muted">Solved with optimal complexity</p>
                    </div>
                  </div>
                  <span className="font-mono text-indigo-300 font-semibold text-sm">+50 XP</span>
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-4 text-[11px] text-text-muted text-center font-sans border-t border-border pt-3">
          Completed rounds sync automatically with your placement profile
        </p>
      </Card>
    </div>
  );
};

export default StudentDashboard;
