import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { useAdminStore } from "@/context/AdminStoreContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleBadge } from "@/components/common/RoleBadge";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Zap,
  Award,
  Filter,
  ShieldCheck,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart as PieChartIcon,
  Sparkles,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const AdminReports: React.FC = () => {
  const { students } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; is403: boolean; isNetworkError: boolean } | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminService.getReports();
    } catch (err: any) {
      console.error("Failed to load reports:", err);
      const is403 = err?.response?.status === 403;
      const isNetworkError = !err?.response || err?.code === "ERR_NETWORK";
      let message = "An error occurred while loading reports.";
      if (isNetworkError) {
        message = "Could not reach the server. Make sure the backend is running.";
      } else if (is403) {
        message = "You do not have permission to view this page.";
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      setError({ message, is403, isNetworkError });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filters
  const [dateRange, setDateRange] = useState("30");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [collegeFilter, setCollegeFilter] = useState("ALL");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [comparePrevious, setComparePrevious] = useState(true);

  // Print Mode State
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Mock Registrations Over Time (Line Chart)
  const registrationsData = [
    { date: "Sep 01", registered: 42, verified: 36, prevPeriod: 30 },
    { date: "Sep 05", registered: 78, verified: 68, prevPeriod: 52 },
    { date: "Sep 10", registered: 110, verified: 95, prevPeriod: 80 },
    { date: "Sep 15", registered: 165, verified: 142, prevPeriod: 125 },
    { date: "Sep 20", registered: 240, verified: 210, prevPeriod: 180 },
    { date: "Sep 25", registered: 310, verified: 285, prevPeriod: 230 },
    { date: "Sep 30", registered: 380, verified: 345, prevPeriod: 290 },
  ];

  // Mock Score by Domain & Topic
  const domainScoreData = [
    { domain: "Java Core", avgScore: 84, topTopic: "Collections (88%)" },
    { domain: "DSA", avgScore: 78, topTopic: "Arrays (85%)" },
    { domain: "System Design", avgScore: 72, topTopic: "Caching (79%)" },
    { domain: "Frontend", avgScore: 91, topTopic: "React Hooks (95%)" },
    { domain: "MERN Stack", avgScore: 83, topTopic: "Node.js REST (87%)" },
    { domain: "Behavioral", avgScore: 89, topTopic: "STAR Method (92%)" },
  ];

  // Difficulty Split (Donut Chart)
  const difficultyData = [
    { name: "Easy", value: 45, color: "#22c55e" },
    { name: "Medium", value: 38, color: "#22d3ee" },
    { name: "Hard", value: 17, color: "#f43f5e" },
  ];

  // Course-Wise Performance
  const coursePerformanceData = [
    { course: "B.Tech CSE", avgScore: 88, totalStudents: 420 },
    { course: "B.Tech IT", avgScore: 82, totalStudents: 280 },
    { course: "B.Tech ECE", avgScore: 76, totalStudents: 190 },
    { course: "M.Tech CS", avgScore: 92, totalStudents: 110 },
    { course: "MCA", avgScore: 79, totalStudents: 140 },
  ];

  // Pass vs Fail per Test
  const passVsFailData = [
    { testName: "Java Core Drive", passed: 320, failed: 80 },
    { testName: "System Design Benchmark", passed: 210, failed: 110 },
    { testName: "DSA Dynamic Prog", passed: 280, failed: 140 },
    { testName: "React & Async JS", passed: 390, failed: 60 },
    { testName: "MERN Stack Round", passed: 260, failed: 90 },
  ];

  // Verification Funnel Data
  const verificationFunnelData = [
    { stage: "1. Registered", count: students.length + 150, pct: "100%" },
    { stage: "2. Submitted ID", count: students.length + 80, pct: "86%" },
    { stage: "3. Verified Accounts", count: students.filter((s) => s.verificationStatus === "Verified").length + 60, pct: "78%" },
  ];

  // Weekly Heatmap Activity Data (7 Days x 4 Time Blocks)
  const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heatmapBlocks = ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 21:00"];
  const getHeatmapColor = (r: number, c: number) => {
    const intensity = (r * 3 + c * 7) % 5;
    if (intensity === 4) return "bg-cyan-400 text-black font-bold";
    if (intensity === 3) return "bg-cyan-500/60 text-white";
    if (intensity === 2) return "bg-cyan-500/30 text-cyan-300";
    if (intensity === 1) return "bg-cyan-500/15 text-cyan-400";
    return "bg-surface-raised text-text-muted";
  };

  // Top 10 Leaderboard
  const top10Leaderboard = [...students]
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, 10);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Domain", "Average Score", "Top Topic", "Pass Rate"];
    const rows = domainScoreData.map((d) => [`"${d.domain}"`, d.avgScore, `"${d.topTopic}"`, "78%"]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "platform_analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Platform Analytics CSV exported!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-semibold">
              Executive Analytics & Placement Metrics
            </span>
            <Badge variant="accent" className="text-[10px] font-mono">
              Live Data
            </Badge>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
            Analytics & Reports Suite
          </h2>
          <p className="text-xs text-text-secondary">
            Comprehensive platform performance, verification funnel, leaderboard rankings, and cohort growth trends.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs font-mono">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
          </Button>

          <Button variant="teal-cyan" size="sm" onClick={handlePrint} className="text-xs font-mono font-semibold">
            <Printer className="w-3.5 h-3.5" /> Print Report
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-200 animate-fade-in print:hidden">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-red-300">
                {error.isNetworkError
                  ? "Could not reach the server. Make sure the backend is running."
                  : error.is403
                  ? "You do not have permission to view this page."
                  : error.message}
              </p>
              <p className="text-xs text-red-400/80">
                {error.isNetworkError
                  ? "Backend service at http://localhost:8080 is unreachable. Verify that backend is running with ./mvnw.cmd spring-boot:run"
                  : error.is403
                  ? "Administrator privileges required to access analytics reports."
                  : "Please check your network connection and retry."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadReports}
            className="border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs shrink-0 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* FILTER BAR */}
      <Card className="p-4 bg-surface border border-border shadow-soft space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] text-text-muted uppercase block mb-1">Time Horizon</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-text-primary focus:outline-none focus:border-cyan-400"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Year-to-Date (YTD)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-text-muted uppercase block mb-1">Degree Course</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-text-primary focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Courses (B.Tech, M.Tech, MCA)</option>
              <option value="B.Tech">B.Tech Only</option>
              <option value="M.Tech">M.Tech Only</option>
              <option value="MCA">MCA Only</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-text-muted uppercase block mb-1">Institution College</label>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-text-primary focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Colleges (SRM, VIT, IIT, BITS)</option>
              <option value="SRMIST">SRMIST</option>
              <option value="VIT">VIT Vellore</option>
              <option value="IITM">IIT Madras</option>
              <option value="BITS">BITS Pilani</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-text-muted uppercase block mb-1">Domain Track</label>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-text-primary focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Domains (Java, System Design...)</option>
              <option value="Java">Java</option>
              <option value="System Design">System Design</option>
              <option value="DSA">DSA</option>
              <option value="Frontend">Frontend</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary select-none">
              <input
                type="checkbox"
                checked={comparePrevious}
                onChange={(e) => setComparePrevious(e.target.checked)}
                className="w-4 h-4 rounded border-border text-cyan-400 focus:ring-cyan-400"
              />
              <span>Compare Previous Period</span>
            </label>
          </div>
        </div>
      </Card>

      {/* KPI CARDS WITH TREND ARROWS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Students", value: students.length + 120, trend: "+14.8%", isUp: true, icon: Users, color: "text-cyan-400" },
          { label: "Verified %", value: "88.5%", trend: "+5.2%", isUp: true, icon: ShieldCheck, color: "text-live" },
          { label: "Active Today", value: "342", trend: "+12.4%", isUp: true, icon: Activity, color: "text-emerald-400" },
          { label: "Tests Completed", value: "4,890", trend: "+22.1%", isUp: true, icon: CheckCircle2, color: "text-purple-400" },
          { label: "Average Score", value: "81.4", trend: "+3.8%", isUp: true, icon: Award, color: "text-amber-400" },
          { label: "Pass Rate", value: "74.2%", trend: "-1.2%", isUp: false, icon: Zap, color: "text-cyan-300" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-4 bg-surface border border-border space-y-2 shadow-soft">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="space-y-0.5">
                <span className="font-serif font-bold text-2xl text-text-primary block">
                  {kpi.value}
                </span>
                {comparePrevious && (
                  <span className={`text-[10px] font-mono flex items-center font-semibold ${kpi.isUp ? "text-live" : "text-danger"}`}>
                    {kpi.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend} vs prev
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* CHART SECTION 1: REGISTRATION TRENDS & SCORE BY DOMAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registrations Over Time Area Chart */}
        <Card className="lg:col-span-7 p-6 space-y-4 bg-surface border-border shadow-soft">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-medium text-text-primary">Registrations & Verification Over Time</h3>
              <p className="text-xs text-text-muted">Student signup trajectory compared to previous evaluation period.</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/30">
              Area Growth
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Area type="monotone" dataKey="registered" stroke="#22d3ee" fillOpacity={1} fill="url(#colorReg)" name="Registered Students" />
                <Area type="monotone" dataKey="verified" stroke="#22c55e" fillOpacity={1} fill="url(#colorVer)" name="Verified Students" />
                {comparePrevious && (
                  <Line type="monotone" dataKey="prevPeriod" stroke="#94a3b8" strokeDasharray="5 5" name="Prev Period Comparison" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Score by Domain Bar Chart */}
        <Card className="lg:col-span-5 p-6 space-y-4 bg-surface border-border shadow-soft">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-medium text-text-primary">Score by Domain & Top Topic</h3>
              <p className="text-xs text-text-muted">Average score breakdown across practice domains.</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="domain" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)", borderRadius: "8px" }} />
                <Bar dataKey="avgScore" fill="#a855f7" radius={[4, 4, 0, 0]} name="Avg Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* CHART SECTION 2: DIFFICULTY SPLIT & PASS VS FAIL & VERIFICATION FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Difficulty Split Donut */}
        <Card className="lg:col-span-4 p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-cyan-400" /> Difficulty Solved Split
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} label>
                  {difficultyData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-mono pt-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Easy (45%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-cyan-400" /> Medium (38%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Hard (17%)</span>
          </div>
        </Card>

        {/* Pass vs Fail Stacked Bar */}
        <Card className="lg:col-span-5 p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" /> Pass vs. Fail Ratio per Benchmark Test
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passVsFailData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="testName" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="passed" stackId="a" fill="#22c55e" name="Passed" />
                <Bar dataKey="failed" stackId="a" fill="#f43f5e" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Verification Funnel */}
        <Card className="lg:col-span-3 p-6 space-y-4 bg-surface border-border shadow-soft">
          <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-live" /> Verification Funnel
          </h3>
          <div className="space-y-3 pt-2 font-mono text-xs">
            {verificationFunnelData.map((f, idx) => (
              <div key={idx} className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-text-primary">{f.stage}</span>
                  <span className="text-cyan-400">{f.count} ({f.pct})</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: f.pct }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* WEEKLY ACTIVITY HEATMAP GRID */}
      <Card className="p-6 bg-surface border border-border shadow-soft space-y-4">
        <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" /> Weekly Peak Activity Heatmap
        </h3>
        <p className="text-xs text-text-muted">Peak student test submissions broken down by day and time block.</p>

        <div className="overflow-x-auto">
          <div className="min-w-[600px] grid grid-cols-5 gap-2 text-xs font-mono">
            <div className="font-bold text-text-muted p-2">Time Block / Day</div>
            {heatmapDays.slice(0, 4).map((d) => (
              <div key={d} className="font-bold text-text-primary text-center p-2 bg-surface-raised rounded-lg border border-border">
                {d}
              </div>
            ))}

            {heatmapBlocks.map((block, rowIdx) => (
              <React.Fragment key={block}>
                <div className="p-2 font-semibold text-text-secondary flex items-center">{block}</div>
                {[0, 1, 2, 3].map((colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`p-3 rounded-lg text-center flex items-center justify-center font-mono ${getHeatmapColor(rowIdx, colIdx)}`}
                  >
                    {Math.floor(25 + ((rowIdx * 7 + colIdx * 13) % 45))} Submissions
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      {/* TOP 10 CAMPUS LEADERBOARD TABLE */}
      <Card className="p-6 bg-surface border border-border shadow-soft space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Top 10 Campus Leaderboard Standings
          </h3>
          <Badge variant="accent" className="font-mono text-xs">Updated Live</Badge>
        </div>

        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px]">
              <tr>
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Student Candidate</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">College Institution</th>
                <th className="p-3.5">Completed Mocks</th>
                <th className="p-3.5">Activity XP</th>
                <th className="p-3.5 font-mono">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {top10Leaderboard.map((s, idx) => (
                <tr key={s.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                      idx === 0 ? "bg-amber-400 text-black font-extrabold" : idx === 1 ? "bg-slate-300 text-black font-bold" : idx === 2 ? "bg-amber-600 text-white" : "bg-surface-raised text-text-muted"
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>

                  <td className="p-3.5 font-semibold text-text-primary">
                    <div>{s.name}</div>
                    <div className="text-[10px] text-text-muted font-mono">{s.rollNumber}</div>
                  </td>

                  <td className="p-3.5">
                    <RoleBadge role={s.role} size="xs" />
                  </td>

                  <td className="p-3.5 text-text-secondary">{s.college}</td>

                  <td className="p-3.5 font-mono text-cyan-400 font-semibold">
                    {s.interviewsCompleted} Mocks
                  </td>

                  <td className="p-3.5 font-mono font-bold text-live text-sm">
                    {s.activityScore * 10} XP
                  </td>

                  <td className="p-3.5">
                    <Badge variant={idx < 3 ? "live" : "active"}>
                      {idx === 0 ? "🏆 Top Gold" : idx < 3 ? "🥈 Podium" : "High Performer"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
