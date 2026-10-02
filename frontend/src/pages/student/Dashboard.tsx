import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";

import { StatCard } from "@/components/common/StatCard";

import { Card } from "@/components/ui/Card";

import { Button } from "@/components/ui/Button";

import { Progress } from "@/components/ui/Progress";

import { CardSkeleton } from "@/components/common/Skeletons";

import { Video, Code2, BookOpen, Flame, Award, ArrowRight, Play, Sparkles, CheckCircle2, Calendar, X, ShieldAlert, Clock, AlertTriangle, ShieldCheck, TrendingUp, AlertOctagon, Compass } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { profileService } from "@/services/profileService";

import { UserProfile, calculateProfileCompletion } from "@/mocks/profileData";

import { AvatarCompletionRing, ProfileSummaryCard } from "@/components/common/AvatarCompletionRing";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

import { verificationService } from "@/services/verificationService";

import { VerificationStatus, VerificationSubmission } from "@/mocks/verifications";

import { EmptyState } from "@/components/common/EmptyState";

import { ReadinessScore } from "@/components/student/ReadinessScore";

import { CountdownPlanner } from "@/components/student/CountdownPlanner";

import { StreakHeatmap } from "@/components/student/StreakHeatmap";

import { NextBestAction } from "@/components/student/NextBestAction";

import { Achievements } from "@/components/student/Achievements";

import { StudyPlanWidget } from "@/components/student/StudyPlanWidget";

import { PrepTracksWidget } from "@/components/student/PrepTracksWidget";

import { Reveal } from "@/components/fx";

export const StudentDashboard: React.FC = () => {

  const { user, isDemoMode, isAdmin } = useAuth();

  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [dismissReminder, setDismissReminder] = useState(false);

  const [verifStatus, setVerifStatus] = useState<VerificationStatus>("Verified");

  const [verifSub, setVerifSub] = useState<VerificationSubmission | undefined>(undefined);

  useEffect(() => {

    profileService.getProfile()

      .then((data) => {

        setProfile(data);

      })

      .catch((err) => {

        console.warn("Failed to load profile:", err);

      })

      .finally(() => {

        setLoading(false);

      });

    if (user?.userId && !isDemoMode && !isAdmin()) {

      verificationService.getVerificationStatus(user.userId, user.email)

        .then((res) => {

          setVerifStatus(res.status);

          setVerifSub(res.submission);

        })

        .catch(() => {

          setVerifStatus("Verified");

        });

    }

  }, [user, isDemoMode, isAdmin]);

  const getGreeting = () => {

    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";

    if (hour < 18) return "Good afternoon";

    return "Good evening";

  };

  const isDemo = isDemoMode || user?.userId?.startsWith("demo-usr-");

  // Mock performance trend data (demo presentation only)

  const performanceTrend = [

    { day: "Mon", score: 68 },

    { day: "Tue", score: 74 },

    { day: "Wed", score: 79 },

    { day: "Thu", score: 85 },

    { day: "Fri", score: 82 },

    { day: "Sat", score: 89 },

    { day: "Sun", score: 94 },

  ];

  // Skill Radar Data (demo presentation only)

  const radarData = [

    { subject: "React/FE", A: 90 },

    { subject: "Java/Spring", A: 82 },

    { subject: "DSA/DP", A: 88 },

    { subject: "System Design", A: 75 },

    { subject: "SQL/DB", A: 85 },

  ];

  if (loading || !profile) return <CardSkeleton />;

  const completion = calculateProfileCompletion(profile);

  const hasActivity = isDemo || (profile.stats && (profile.stats.codingProblemsSolved > 0 || profile.stats.mockInterviewsCompleted > 0 || profile.stats.totalPracticeSessions > 0));

  // Stagger container variants

  const stagger = {

    hidden: {},

    show: { transition: { staggerChildren: 0.08 } },

  };

  return (

    <div className="space-y-8">

      {/* Verification Status Banner (If not Verified) */}

      {verifStatus !== "Verified" && (

        <div

          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-soft ${

            verifStatus === "Pending Verification"

              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"

              : verifStatus === "Rejected"

              ? "bg-danger-bg border-danger/40 text-danger"

              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"

          }`}

        >

          <div className="flex items-center gap-3">

            {verifStatus === "Pending Verification" ? (

              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />

            ) : verifStatus === "Rejected" ? (

              <AlertTriangle className="w-5 h-5 text-danger shrink-0" />

            ) : (

              <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />

            )}

            <div>

              <span className="font-semibold text-sm block">

                {verifStatus === "Pending Verification"

                  ? "Identity Verification Under Review"

                  : verifStatus === "Rejected"

                  ? "Identity Verification Action Required"

                  : "College ID Verification Required"}

              </span>

              <p className="text-[11px] opacity-90 leading-relaxed">

                {verifStatus === "Pending Verification"

                  ? `Your College ID (Ref: ${verifSub?.verificationId || "VER-2026"}) is under review. Full features will unlock automatically.`

                  : verifStatus === "Rejected"

                  ? `Rejection Reason: ${verifSub?.rejectionNotes || "Image was unreadable"}. Please resubmit.`

                  : "Verify your student status with your College ID to unlock Coding Arena, Mock Interviews, & Leaderboard."}

              </p>

            </div>

          </div>

          <Button

            variant={verifStatus === "Rejected" ? "danger" : "teal-cyan"}

            size="sm"

            onClick={() => navigate("/verify-identity")}

            className="text-xs shrink-0 font-semibold"

          >

            {verifStatus === "Rejected" ? "Resubmit ID Card" : verifStatus === "Pending Verification" ? "Check Status" : "Verify College ID"}

          </Button>

        </div>

      )}

      {/* Welcome Banner with Avatar Completion Ring */}

      <Reveal direction="up" duration={0.6}>

        <div className="bg-gradient-to-r from-surface via-surface-raised to-surface border border-cyan-400/40 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">

          {/* Animated background glow pulse */}

          <motion.div

            aria-hidden

            className="pointer-events-none absolute -top-12 -left-12 w-56 h-56 rounded-full bg-cyan-400/8 blur-3xl"

            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}

            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}

          />

          <motion.div

            aria-hidden

            className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-purple-500/6 blur-3xl"

            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}

            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}

          />

          <div className="flex items-center gap-5 z-10">

            <AvatarCompletionRing profile={profile} size="xl" />

            <div className="space-y-1.5">

              {/* Streak badge with animated flame */}

              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-400 text-xs font-mono">

                <motion.span

                  animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }}

                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}

                  className="inline-flex"

                >

                  <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />

                </motion.span>

                <span className="font-semibold">{profile.stats.currentStreak}</span>

                <span className="opacity-80">Day Streak · Daily Practice</span>

              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">

                {getGreeting()}, <span className="text-cyan-400">{user?.name || "Student"}</span>!

              </h2>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">

                Your overall performance is in the top 5% of your campus. Ready for today's mock interview or coding challenge?

              </p>

            </div>
          </div>

          <div className="flex gap-3 z-10 shrink-0 flex-wrap">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button variant="primary" size="md" onClick={() => navigate("/mock-interview")}>
                <Video className="w-4 h-4" /> Start Mock Interview
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" size="md" onClick={() => navigate("/coding")}>
                <Code2 className="w-4 h-4" /> Coding Arena
              </Button>
            </motion.div>

          </div>

        </div>

      </Reveal>

      {/* Profile Completion Verdict Card */}

      {completion < 100 && !dismissReminder && (

        <Reveal direction="up" delay={0.1}>

          <div className="relative">

            <ProfileSummaryCard profile={profile} compact />

            <button

              type="button"

              onClick={() => setDismissReminder(true)}

              className="absolute top-3 right-3 text-text-muted hover:text-text-primary text-xs p-1"

              title="Dismiss reminder"

            >

              <X className="w-4 h-4" />

            </button>

          </div>

        </Reveal>

      )}

      {/* First-Run Onboarding Checklist Card */}

      {(() => {

        const checklist = [

          { id: "profile", title: "Complete Candidate Profile", link: "/profile", done: completion >= 60 || profile.onboardingComplete },

          { id: "resume", title: "Upload & Scan Resume (AI ATS)", link: "/resume-analyzer", done: !!profile.resumeUrl },

          { id: "coding", title: "Solve 1 Problem in Coding Arena", link: "/coding", done: profile.stats.codingProblemsSolved > 0 },

          { id: "quiz", title: "Take 1 MCQ Technical Quiz", link: "/quiz", done: profile.stats.quizzesCompleted > 0 },

          { id: "mock", title: "Complete 1 AI Mock Interview Round", link: "/mock-interview", done: profile.stats.mockInterviewsCompleted > 0 },

        ];

        const completedCount = checklist.filter((i) => i.done).length;

        if (completedCount === checklist.length) return null;

        return (

          <Card className="p-6 bg-gradient-to-r from-surface via-surface-raised to-surface border border-cyan-400/30 space-y-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">

              <div>

                <h3 className="font-serif text-lg font-bold text-text-primary flex items-center gap-2">

                  <Sparkles className="w-5 h-5 text-cyan-400" /> Getting Started: Placement Onboarding Checklist

                </h3>

                <p className="text-xs text-text-secondary">Complete these key steps to get highlighted to campus recruitment partners.</p>

              </div>

              <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/30 self-start sm:self-auto">

                {completedCount} / {checklist.length} Completed

              </span>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

              {checklist.map((item) => (

                <div

                  key={item.id}

                  onClick={() => navigate(item.link)}

                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${

                    item.done

                      ? "bg-cyan-500/10 border-cyan-500/30 text-text-primary"

                      : "bg-surface-raised border-border hover:border-cyan-400/40 hover:bg-surface"

                  }`}

                >

                  <div className="flex items-center gap-2.5 min-w-0">

                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.done ? "text-cyan-400 fill-cyan-400/20" : "text-text-muted"}`} />

                    <span className={`text-xs font-medium truncate ${item.done ? "line-through text-text-muted" : "text-text-primary"}`}>

                      {item.title}

                    </span>

                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:text-cyan-400" />

                </div>

              ))}

            </div>

          </Card>

        );

      })()}

      {/* KPI Stat Cards */}

      <motion.div

        variants={stagger}

        initial="hidden"

        whileInView="show"

        viewport={{ once: true }}

        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"

      >

        <StatCard

          title="Overall Readiness"

          value={profile.stats.overallRating}

          suffix="%"

          subtitle="Campus Placement Score"

          icon={Award}

          accentColor="cyan"

          trend={isDemo ? { value: "+4.5%", isPositive: true } : undefined}

        />

        <StatCard

          title="Mock Rounds"

          value={profile.stats.mockInterviewsCompleted}

          subtitle={profile.stats.mockInterviewsCompleted > 0 ? "AI Interviews Completed" : "Start your first mock round"}

          icon={Video}

          accentColor="green"

          trend={isDemo ? { value: "+2 this week", isPositive: true } : undefined}

        />

        <StatCard

          title="Problems Solved"

          value={profile.stats.codingProblemsSolved}

          subtitle={profile.stats.codingProblemsSolved > 0 ? "DSA & Algorithm Challenges" : "No coding problems solved yet"}

          icon={Code2}

          accentColor="purple"

        />

        <StatCard

          title="Practice Streak"

          value={profile.stats.currentStreak}

          suffix=" Days"

          subtitle={profile.stats.currentStreak > 0 ? "Consistent Daily Momentum" : "Start your daily practice streak"}

          icon={Flame}

          accentColor="amber"

        />

      </motion.div>

      {/* Readiness & AI Coach Grid */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7 space-y-6">

          <ReadinessScore

            breakdown={

              isDemo

                ? { coding: 88, quiz: 82, mockInterview: profile.stats.overallRating || 89, resume: 85 }

                : { coding: 0, quiz: 0, mockInterview: profile.stats.overallRating || 0, resume: 0 }

            }

          />

          <NextBestAction skillsData={radarData} />

        </div>

        <div className="lg:col-span-5">

          <CountdownPlanner />

        </div>

      </div>

      {/* Real Performance Highlights: Strongest Domain & Needs Work */}

      {hasActivity && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Card className="p-5 bg-surface border-emerald-500/30 flex items-start gap-4">

            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">

              <TrendingUp className="w-6 h-6" />

            </div>

            <div className="space-y-1">

              <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">

                Strongest Domain

              </span>

              <h4 className="font-serif text-base font-semibold text-text-primary">

                Data Structures & Algorithms (DSA)

              </h4>

              <p className="text-xs text-text-muted">

                Strong algorithmic intuition with {profile.stats.codingProblemsSolved} challenges solved.

              </p>

            </div>

          </Card>

          <Card className="p-5 bg-surface border-amber-500/30 flex items-start gap-4">

            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">

              <AlertOctagon className="w-6 h-6" />

            </div>

            <div className="space-y-1">

              <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase tracking-wider">

                Focus Area (Needs Work)

              </span>

              <h4 className="font-serif text-base font-semibold text-text-primary">

                System Design & Microservices

              </h4>

              <p className="text-xs text-text-muted">

                Recommended: practice distributed caching and rate limiter architectures to raise placement readiness.

              </p>

            </div>

          </Card>

        </div>

      )}

      {/* Charts & Analytics */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Performance Line Chart */}

        <Card className="lg:col-span-7 p-6 space-y-4 bg-surface border-border">

          <div className="flex justify-between items-center">

            <div>

              <h3 className="font-serif text-lg font-medium text-text-primary">Score Momentum</h3>

              <p className="text-xs text-text-muted">Daily performance across completed rounds</p>

            </div>

            <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">

              {isDemo ? "Top 5% Student" : "Active Student"}

            </span>

          </div>

          <div className="h-64 w-full pt-2">

            {hasActivity ? (

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={performanceTrend}>

                  <XAxis dataKey="day" stroke="var(--chart-text)" fontSize={11} />

                  <YAxis domain={[50, 100]} stroke="var(--chart-text)" fontSize={11} />

                  <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--tooltip-border)", color: "var(--text-primary)", borderRadius: "8px" }} />

                  <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={{ fill: "#22d3ee", r: 4 }} />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <EmptyState

                title="No Momentum Data Yet"

                description="Complete your first quiz, coding problem, or mock interview to start tracking daily score momentum."

                actionText="Start Practice Track"

                onAction={() => navigate("/practice")}

              />

            )}

          </div>

        </Card>

        {/* Technical Proficiency Radar */}

        <Card className="lg:col-span-5 p-6 space-y-4 bg-surface border-border">

          <div>

            <h3 className="font-serif text-lg font-medium text-text-primary">Technical Proficiency Radar</h3>

            <p className="text-xs text-text-muted">Skill distribution across verified attempts</p>

          </div>

          <div className="h-64 w-full flex items-center justify-center">

            {hasActivity ? (

              <ResponsiveContainer width="100%" height="100%">

                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>

                  <PolarGrid stroke="#334155" />

                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />

                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />

                  <Radar name="Proficiency" dataKey="A" stroke="#4ade80" fill="#4ade80" fillOpacity={0.4} />

                </RadarChart>

              </ResponsiveContainer>

            ) : (

              <EmptyState

                title="No Skill Proficiency Data"

                description="Take a quiz or solve a coding challenge to build your technical proficiency radar."

                actionText="Open Coding Arena"

                onAction={() => navigate("/coding")}

              />

            )}

          </div>

        </Card>

      </div>

      {/* Streak Heatmap */}

      <StreakHeatmap currentStreak={profile.stats.currentStreak || 0} longestStreak={isDemo ? 18 : profile.stats.currentStreak || 0} />

      {/* AI 30-Day Study Plan & Prep Tracks */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7">

          <StudyPlanWidget />

        </div>

        <div className="lg:col-span-5">

          <PrepTracksWidget />

        </div>

      </div>

      {/* Compact Badges Strip */}

      <Achievements variant="compact" />

    </div>

  );

};
