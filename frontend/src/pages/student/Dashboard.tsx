import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Video, Code2, BookOpen, Flame, Award, ArrowRight, Play, Sparkles, CheckCircle2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/mocks/profileData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService.getProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

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
    { subject: "STAR/Behavioral", A: 95 },
  ];

  // 28-day streak heatmap grid
  const heatmapDays = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    active: i > 8,
    level: (i % 4) + 1,
  }));

  if (loading || !profile) return <CardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-surface via-surface-raised to-surface border border-cyan-400/40 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 text-xs font-mono">
            <Flame className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
            {profile.stats.currentStreak} Day Streak (Daily Practice)
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
            {getGreeting()}, <span className="text-cyan-400">{user?.name || "Student"}</span>!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
            Your overall performance is in the top 5% of your campus. Ready for today's mock interview or dynamic programming challenge?
          </p>
        </div>

        <div className="flex gap-3 z-10">
          <Button variant="primary" size="md" onClick={() => navigate("/mock-interview")}>
            <Video className="w-4 h-4" /> Start Mock Interview
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate("/coding")}>
            <Code2 className="w-4 h-4" /> Coding Arena
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mock Interviews"
          value={profile.stats.mockInterviewsCompleted}
          subtitle="Completed sessions"
          icon={Video}
          trend={{ value: "15%", isPositive: true }}
        />
        <StatCard
          title="Problems Solved"
          value={profile.stats.codingProblemsSolved}
          subtitle="Accepted algorithm benchmarks"
          icon={Code2}
          trend={{ value: "8 this week", isPositive: true }}
        />
        <StatCard
          title="Placement Readiness"
          value={`${profile.stats.overallRating}%`}
          subtitle="Average score"
          icon={Award}
          trend={{ value: "4%", isPositive: true }}
        />
        <StatCard
          title="Day Streak"
          value={`${profile.stats.currentStreak} Days`}
          subtitle="Daily practice commitment"
          icon={Flame}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Performance Line Chart */}
          <Card className="p-6 space-y-4 bg-surface border-border">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-medium text-text-primary">Weekly Performance Progression</h3>
                <p className="text-xs text-text-muted">Average score trend across past 7 sessions</p>
              </div>
              <span className="text-xs font-mono text-live font-semibold">Peak: 94%</span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend}>
                  <XAxis dataKey="day" stroke="var(--chart-text)" fontSize={11} />
                  <YAxis stroke="var(--chart-text)" fontSize={11} domain={[50, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--tooltip-border)", color: "var(--text-primary)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={{ fill: "#22d3ee", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* GitHub-style Activity Heatmap */}
          <Card className="p-6 space-y-4 bg-surface border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="font-serif text-lg font-medium text-text-primary">Practice Activity Heatmap</h3>
              </div>
              <span className="text-xs font-mono text-text-muted">Past 28 Days</span>
            </div>

            <div className="grid grid-cols-14 gap-1.5 pt-2">
              {heatmapDays.map((d) => (
                <div
                  key={d.day}
                  title={`Day ${d.day}: ${d.active ? `${d.level} sessions` : "No activity"}`}
                  className={`w-full aspect-square rounded-sm border transition-all ${
                    !d.active
                      ? "bg-surface-raised border-border/40"
                      : d.level === 4
                      ? "bg-cyan-400 border-cyan-400"
                      : d.level === 3
                      ? "bg-cyan-400/70 border-cyan-400/80"
                      : "bg-cyan-400/40 border-cyan-400/50"
                  }`}
                />
              ))}
            </div>
          </Card>

          {/* Daily Challenge Card */}
          <Card className="p-6 bg-gradient-to-r from-surface to-surface-raised border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono bg-live/15 text-live border border-live/30 px-2 py-0.5 rounded">
                ⚡ Daily Challenge
              </span>
              <h4 className="font-serif text-base font-semibold text-text-primary">146. LRU Cache Implementation</h4>
              <p className="text-xs text-text-secondary">O(1) Get & Put operations using Doubly Linked List & Hash Map.</p>
            </div>

            <Button variant="teal-cyan" size="sm" onClick={() => navigate("/coding")}>
              Solve Problem <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>

        {/* Right Column (4 cols): Skill Radar & Recent */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skill Radar Chart */}
          <Card className="p-6 space-y-4 bg-surface border-border">
            <h3 className="font-serif text-lg font-medium text-text-primary">Skill Proficiency Radar</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="var(--chart-grid)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--chart-text)" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--chart-grid)" />
                  <Radar name="Proficiency" dataKey="A" stroke="#4ade80" fill="#4ade80" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Continue Learning */}
          <Card className="p-6 space-y-3 bg-surface border-border">
            <h3 className="font-serif text-base font-medium text-text-primary">Continue Practice</h3>
            <div className="p-3 bg-surface-raised border border-border rounded-lg space-y-1">
              <span className="text-xs font-semibold text-text-primary block">STAR Behavioral Framework</span>
              <p className="text-[11px] text-text-muted font-mono">3 of 5 questions remaining</p>
              <Progress value={60} color="accent" className="h-1.5 mt-2" />
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate("/practice")}>
              Resume Track
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
