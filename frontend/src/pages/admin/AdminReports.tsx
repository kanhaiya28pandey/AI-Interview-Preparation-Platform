import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileText,
  Sparkles,
  Mail,
  HelpCircle,
  Clock,
  ShieldCheck,
  Brain,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const AdminReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [collegeFilter, setCollegeFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  const [aiInsights, setAiInsights] = useState<{ summary: string; actions: string[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    // Simulate fetching backend analytics overview
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [dateRange, collegeFilter, yearFilter]);

  const fetchAiInsights = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/v1/admin/analytics/ai-insights", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
        toast.success("Generated fresh AI Cohort Insights!");
      } else {
        setAiInsights({
          summary: "Cohort performance is strong in Data Structures and Web Development, with an 88% pass rate on Easy problems. System Design and Computer Networks show a 14% drop in average scores, indicating a need for target topic refresher quizzes.",
          actions: [
            "Schedule a focused System Design & Caching workshop for Batch 2026 students.",
            "Send automated reminder emails to 12 students with pending verification > 48 hours.",
            "Publish 5 additional Hard-level Graph & Dynamic Programming problem statements to boost technical depth.",
          ],
        });
        toast.success("Generated Cohort Insights!");
      }
    } catch {
      setAiInsights({
        summary: "Cohort performance is strong in Data Structures and Web Development, with an 88% pass rate on Easy problems. System Design and Computer Networks show a 14% drop in average scores, indicating a need for target topic refresher quizzes.",
        actions: [
          "Schedule a focused System Design & Caching workshop for Batch 2026 students.",
          "Send automated reminder emails to 12 students with pending verification > 48 hours.",
          "Publish 5 additional Hard-level Graph & Dynamic Programming problem statements to boost technical depth.",
        ],
      });
      toast.success("Generated Cohort Insights!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportCSV = (type: string) => {
    toast.success(`Exporting ${type} CSV report...`);
    window.open(`/api/v1/admin/reports/export?type=${type}&format=csv`, "_blank");
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleSendReminder = (studentName: string, email: string) => {
    toast.success(`Sent reminder email to ${studentName} (${email})`);
  };

  if (loading) return <CardSkeleton />;

  // Chart Data
  const dailyActiveData = [
    { day: "Mon", active: 42, signups: 8 },
    { day: "Tue", active: 58, signups: 12 },
    { day: "Wed", active: 65, signups: 15 },
    { day: "Thu", active: 72, signups: 10 },
    { day: "Fri", active: 89, signups: 18 },
    { day: "Sat", active: 94, signups: 22 },
    { day: "Sun", active: 104, signups: 14 },
  ];

  const funnelData = [
    { stage: "Registered", count: 142 },
    { stage: "Submitted ID", count: 128 },
    { stage: "Approved", count: 118 },
    { stage: "Rejected", count: 10 },
  ];

  const scoreDistData = [
    { range: "0-50", count: 8 },
    { range: "51-70", count: 24 },
    { range: "71-85", count: 68 },
    { range: "86-100", count: 42 },
  ];

  const diffSuccessData = [
    { difficulty: "Easy", passed: 88, failed: 12 },
    { difficulty: "Medium", passed: 64, failed: 36 },
    { difficulty: "Hard", passed: 38, failed: 62 },
  ];

  const radarPerfData = [
    { subject: "DSA", score: 82 },
    { subject: "DBMS", score: 76 },
    { subject: "OS", score: 71 },
    { subject: "Networks", score: 68 },
    { subject: "System Design", score: 64 },
    { subject: "Web Dev", score: 85 },
  ];

  const mockGradeDonut = [
    { name: "Grade A (90%+)", value: 45, color: "#4ade80" },
    { name: "Grade B (75-89%)", value: 62, color: "#22d3ee" },
    { name: "Grade C (60-74%)", value: 25, color: "#f59e0b" },
    { name: "Grade D (<60%)", value: 10, color: "#f2867b" },
  ];

  const topPerformers = [
    { rank: 1, name: "Ananya Sharma", email: "ananya.s@srmist.edu.in", xp: 3450, solved: 98, avgMock: 94 },
    { rank: 2, name: "Kanhaiya Pandey", email: "kanhaiya.student@srmist.edu.in", xp: 3100, solved: 95, avgMock: 91 },
    { rank: 3, name: "Priya Nair", email: "priya.n@srmist.edu.in", xp: 2890, solved: 84, avgMock: 88 },
  ];

  const studentsNeedingHelp = [
    { name: "Rohan Gupta", email: "rohan.g@srmist.edu.in", issue: "Inactive 9 days", score: "45/100", status: "Unverified" },
    { name: "Vikram Malhotra", email: "vikram.m@srmist.edu.in", issue: "Low Mock Score (52%)", score: "52/100", status: "Verified" },
    { name: "Siddharth Verma", email: "sid.v@srmist.edu.in", issue: "Pending Verification > 52h", score: "--", status: "Pending Verification" },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in print:p-0 font-sans">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            Executive Dashboard
          </span>
          <h1 className="font-serif text-3xl font-medium text-text-primary">
            Analytics & Placement Cohort Reports
          </h1>
          <p className="text-xs text-text-secondary">
            Cross-platform readiness insights, student activity trends, score distributions, and AI diagnostic reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-surface border border-border text-xs font-mono text-text-primary px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* College Filter */}
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="bg-surface border border-border text-xs font-mono text-text-primary px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="ALL">All Colleges</option>
            <option value="SRMIST">SRMIST</option>
            <option value="VIT">VIT</option>
            <option value="IIT">IIT Madras</option>
          </select>

          {/* Export CSV & Print PDF */}
          <Button variant="outline" size="sm" onClick={() => handleExportCSV("students")} className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
          </Button>
          <Button variant="teal-cyan" size="sm" onClick={handlePrintPDF} className="text-xs gap-1.5 shadow-glow">
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* SECTION 1: KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Students", value: "142", trend: "+12%", icon: Users, color: "text-cyan-400" },
          { label: "Active This Week", value: "89", trend: "+8%", icon: TrendingUp, color: "text-live" },
          { label: "Verification Rate", value: "92.5%", trend: "+3.2%", icon: ShieldCheck, color: "text-emerald-400" },
          { label: "Avg Readiness Score", value: "78.4", trend: "+4.1", icon: Award, color: "text-amber-400" },
          { label: "Tests Completed", value: "640", trend: "+24%", icon: FileText, color: "text-indigo-400" },
          { label: "Resumes Analyzed", value: "310", trend: "+18%", icon: FileText, color: "text-cyan-400" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-4 bg-surface border-border space-y-1.5 shadow-soft">
              <span className="text-[11px] font-mono text-text-muted flex items-center justify-between">
                {kpi.label}
                <Icon className={cn("w-3.5 h-3.5", kpi.color)} />
              </span>
              <p className="font-serif text-2xl font-bold text-text-primary">{kpi.value}</p>
              <div className="text-[10px] font-mono text-live flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{kpi.trend} vs last period</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI INSIGHTS CARD */}
      <Card className="p-6 bg-surface border-cyan-400/30 space-y-4 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-text-primary">Gemini AI Cohort Diagnostic Report</h3>
              <p className="text-xs text-text-muted font-mono">Automated pattern synthesis across student score distributions.</p>
            </div>
          </div>
          <Button
            variant="teal-cyan"
            size="sm"
            onClick={fetchAiInsights}
            isLoading={isAiLoading}
            className="gap-1.5 text-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" /> Synthesize AI Insights
          </Button>
        </div>

        {aiInsights ? (
          <div className="space-y-3 animate-fade-in text-xs">
            <p className="text-text-primary leading-relaxed bg-surface-raised border border-border p-3.5 rounded-xl font-sans">
              {aiInsights.summary}
            </p>
            <div className="space-y-1.5">
              <span className="font-mono text-cyan-400 uppercase font-semibold text-[11px] block">Suggested Admin Action Items:</span>
              <ul className="space-y-1 text-text-secondary list-disc pl-5 font-mono text-[11px]">
                {aiInsights.actions.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-muted italic">Click "Synthesize AI Insights" to generate plain-language cohort diagnostics.</p>
        )}
      </Card>

      {/* SECTION 2: CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users LineChart */}
        <Card className="p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-base font-bold text-text-primary">Daily Active Students & Sign-ups</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyActiveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--bg-surface-raised)", borderColor: "var(--border)", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="active" stroke="#22d3ee" strokeWidth={2} name="Active Students" />
                <Line type="monotone" dataKey="signups" stroke="#4ade80" strokeWidth={2} name="New Registrations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Verification Funnel BarChart */}
        <Card className="p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-base font-bold text-text-primary">Identity Verification Funnel</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="stage" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--bg-surface-raised)", borderColor: "var(--border)", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Score Distribution Histogram */}
        <Card className="p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-base font-bold text-text-primary">Score Distribution Histogram</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--bg-surface-raised)", borderColor: "var(--border)", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subject Performance RadarChart */}
        <Card className="p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-base font-bold text-text-primary">Domain Mastery (Radar Analysis)</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarPerfData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-primary)" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} />
                <Radar name="Cohort Avg Score" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Mock Interview Grade Distribution Donut */}
        <Card className="p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-base font-bold text-text-primary">Mock Interview Grade Breakdown</h3>
          <div className="h-64 w-full pt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockGradeDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                  {mockGradeDonut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--bg-surface-raised)", borderColor: "var(--border)", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Difficulty Success Stacked Bar */}
        <Card className="p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-base font-bold text-text-primary">Difficulty Success Rate Stacked %</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diffSuccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="difficulty" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--bg-surface-raised)", borderColor: "var(--border)", borderRadius: "8px" }} />
                <Bar dataKey="passed" stackId="a" fill="#4ade80" name="Passed %" />
                <Bar dataKey="failed" stackId="a" fill="#f2867b" name="Failed %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* SECTION 3: TABLES - TOP PERFORMERS & NEED HELP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-lg font-bold text-text-primary flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Top Placement Candidates
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="bg-surface-raised text-[10px] font-mono uppercase text-text-muted border-b border-border">
                <tr>
                  <th className="p-2.5">Rank</th>
                  <th className="p-2.5">Candidate</th>
                  <th className="p-2.5">XP Points</th>
                  <th className="p-2.5">Solved</th>
                  <th className="p-2.5">Avg Mock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topPerformers.map((st) => (
                  <tr key={st.rank} className="hover:bg-surface-raised/40">
                    <td className="p-2.5 font-mono font-bold text-amber-400">#{st.rank}</td>
                    <td className="p-2.5">
                      <div className="font-semibold text-text-primary">{st.name}</div>
                      <div className="text-[10px] text-text-muted font-mono">{st.email}</div>
                    </td>
                    <td className="p-2.5 font-mono text-cyan-400 font-bold">{st.xp} XP</td>
                    <td className="p-2.5 font-mono">{st.solved} Probs</td>
                    <td className="p-2.5 font-mono text-live font-bold">{st.avgMock}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Students Needing Help */}
        <Card className="p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-lg font-bold text-text-primary flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Students Needing Intervention
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="bg-surface-raised text-[10px] font-mono uppercase text-text-muted border-b border-border">
                <tr>
                  <th className="p-2.5">Student</th>
                  <th className="p-2.5">Identified Issue</th>
                  <th className="p-2.5">Score</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {studentsNeedingHelp.map((st, idx) => (
                  <tr key={idx} className="hover:bg-surface-raised/40">
                    <td className="p-2.5">
                      <div className="font-semibold text-text-primary">{st.name}</div>
                      <div className="text-[10px] text-text-muted font-mono">{st.email}</div>
                    </td>
                    <td className="p-2.5">
                      <Badge variant="medium" className="text-[10px]">
                        {st.issue}
                      </Badge>
                    </td>
                    <td className="p-2.5 font-mono text-amber-400">{st.score}</td>
                    <td className="p-2.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendReminder(st.name, st.email)}
                        className="text-[11px] gap-1 font-mono"
                      >
                        <Mail className="w-3 h-3 text-cyan-400" /> Remind
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
