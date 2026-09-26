import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Video, Code2, BookOpen, Flame, Award, ArrowRight, Play, Sparkles, CheckCircle2, Calendar, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { UserProfile, calculateProfileCompletion } from "@/mocks/profileData";
import { AvatarCompletionRing, ProfileSummaryCard } from "@/components/common/AvatarCompletionRing";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { verificationService } from "@/services/verificationService";
import { VerificationStatus, VerificationSubmission } from "@/mocks/verifications";
import { ShieldAlert, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

export const StudentDashboard: React.FC = () => {
  const { user, isDemoMode, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissReminder, setDismissReminder] = useState(false);
  const [verifStatus, setVerifStatus] = useState<VerificationStatus>("Verified");
  const [verifSub, setVerifSub] = useState<VerificationSubmission | undefined>(undefined);

  useEffect(() => {
    profileService.getProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });

    if (user?.userId && !isDemoMode && !isAdmin()) {
      verificationService.getVerificationStatus(user.userId, user.email).then((res) => {
        setVerifStatus(res.status);
        setVerifSub(res.submission);
      });
    }
  }, [user, isDemoMode, isAdmin]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Mock performance trend data
  const performanceTrend = [
    { day: "Mon", score: 68 },
    { day: "Tue", score: 74 },
    { day: "Wed", score: 79 },
    { day: "Thu", score: 85 },
    { day: "Fri", score: 82 },
    { day: "Sat", score: 89 },
    { day: "Sun", score: 94 },
  ];

  // Skill Radar Data
  const radarData = [
    { subject: "React/FE", A: 90 },
    { subject: "Java/Spring", A: 82 },
    { subject: "DSA/DP", A: 88 },
    { subject: "System Design", A: 75 },
    { subject: "SQL/DB", A: 85 },
  ];

  if (loading || !profile) return <CardSkeleton />;

  const completion = calculateProfileCompletion(profile);

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
      <div className="bg-gradient-to-r from-surface via-surface-raised to-surface border border-cyan-400/40 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-5 z-10">
          <AvatarCompletionRing profile={profile} size="xl" />
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 text-xs font-mono">
              <Flame className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              {profile.stats.currentStreak} Day Streak (Daily Practice)
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
              {getGreeting()}, <span className="text-cyan-400">{user?.name || "Student"}</span>!
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
              Your overall performance is in the top 5% of your campus. Ready for today's mock interview or coding challenge?
            </p>
          </div>
        </div>

        <div className="flex gap-3 z-10 shrink-0">
          <Button variant="primary" size="md" onClick={() => navigate("/mock-interview")}>
            <Video className="w-4 h-4" /> Start Mock Interview
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate("/coding")}>
            <Code2 className="w-4 h-4" /> Coding Arena
          </Button>
        </div>
      </div>

      {/* Profile Completion Verdict Card */}
      {completion < 100 && !dismissReminder && (
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
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Readiness"
          value={`${profile.stats.overallRating}%`}
          subtitle="Campus Placement Score"
          icon={Award}
          trend={{ value: "+4.5%", isPositive: true }}
        />
        <StatCard
          title="Mock Rounds"
          value={profile.stats.mockInterviewsCompleted.toString()}
          subtitle="AI Interviews Completed"
          icon={Video}
          trend={{ value: "+2 this week", isPositive: true }}
        />
        <StatCard
          title="Problems Solved"
          value={profile.stats.codingProblemsSolved.toString()}
          subtitle="DSA & Algorithm Challenges"
          icon={Code2}
        />
        <StatCard
          title="Practice Streak"
          value={`${profile.stats.currentStreak} Days`}
          subtitle="Consistent Daily Momentum"
          icon={Flame}
        />
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Line Chart */}
        <Card className="lg:col-span-7 p-6 space-y-4 bg-surface border-border">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-medium text-text-primary">7-Day Score Momentum</h3>
              <p className="text-xs text-text-muted">Average daily mock interview & coding scores</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
              Top 5% Student
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <XAxis dataKey="day" stroke="var(--chart-text)" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="var(--chart-text)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--tooltip-border)", color: "var(--text-primary)", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={{ fill: "#22d3ee", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Matrix Radar */}
        <Card className="lg:col-span-5 p-6 space-y-4 bg-surface border-border">
          <div>
            <h3 className="font-serif text-lg font-medium text-text-primary">Technical Proficiency Radar</h3>
            <p className="text-xs text-text-muted">Skill distribution across core topics</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Proficiency" dataKey="A" stroke="#4ade80" fill="#4ade80" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
