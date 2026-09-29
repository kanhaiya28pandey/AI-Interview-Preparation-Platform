import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { resumeService } from "@/services/resumeService";
import { AdminReportData } from "@/mocks/adminData";
import { AdminResumeAnalytics } from "@/mocks/resumeAnalysis";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Users, Video, Code2, ShieldAlert, FileText, ExternalLink, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AdminReportData | null>(null);
  const [resumeAnalytics, setResumeAnalytics] = useState<AdminResumeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getReports(), resumeService.getAdminAnalytics()])
      .then(([reportsData, resumeData]) => {
        setReports(reportsData);
        setResumeAnalytics(resumeData);
      })
      .catch((err) => {
        console.warn("Failed to load admin dashboard reports:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !reports || !resumeAnalytics) return <CardSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium text-text-primary">Platform Admin Dashboard</h2>
        <p className="text-xs text-text-secondary">Overview of student registrations, interview completions, and AI ATS resume benchmark analytics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Registered Users" value="950" subtitle="Across 12 campuses" icon={Users} trend={{ value: "+28%", isPositive: true }} />
        <StatCard title="Interviews Conducted" value="2,150" subtitle="AI rounds completed" icon={Video} trend={{ value: "+18%", isPositive: true }} />
        <StatCard title="Active Coding Tests" value="14" subtitle="Algorithm challenges" icon={Code2} />
        <StatCard title="Avg Resume ATS Score" value={`${resumeAnalytics.avgAtsScore} / 100`} subtitle={`${resumeAnalytics.totalResumesAnalyzed} resumes scanned`} icon={FileText} trend={{ value: "+4.2%", isPositive: true }} />
        <StatCard title="Platform Health" value="99.98%" subtitle="Spring Boot + MongoDB" icon={ShieldAlert} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 p-6 space-y-4 bg-surface border-border">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-medium text-text-primary">Student Registration Growth</h3>
              <p className="text-xs text-text-muted">Total vs active daily students (September 2026)</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reports.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" stroke="var(--chart-text)" fontSize={11} />
                <YAxis stroke="var(--chart-text)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--tooltip-border)", color: "var(--text-primary)", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="users" stroke="#22d3ee" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5 p-6 space-y-4 bg-surface border-border">
          <div>
            <h3 className="font-serif text-lg font-medium text-text-primary">Interviews by Domain</h3>
            <p className="text-xs text-text-muted">Distribution across tracks</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.interviewStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="category" stroke="var(--chart-text)" fontSize={10} />
                <YAxis stroke="var(--chart-text)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--tooltip-border)", color: "var(--text-primary)", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="font-serif text-xl font-semibold text-text-primary">
                AI Resume Intelligence & Skill Deficit Benchmark
              </h3>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Aggregate student ATS compliance metrics and platform-wide candidate gaps.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/reports")}
            className="text-xs font-mono gap-1.5"
          >
            View Full Reports
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 p-6 space-y-4 bg-surface border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-semibold text-text-primary">
                  Top Missing Skills Platform-Wide
                </h4>
                <p className="text-xs text-text-muted">
                  Frequency of technical skill gaps identified across all student resumes
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
                Top 5 Deficits
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={resumeAnalytics.topMissingSkills}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis type="number" stroke="var(--chart-text)" fontSize={11} unit="%" />
                  <YAxis type="category" dataKey="name" stroke="var(--chart-text)" fontSize={10} width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg)",
                      borderColor: "var(--tooltip-border)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [`${value}% of submissions missing`, "Deficit Rate"]}
                  />
                  <Bar dataKey="percentage" fill="#f2867b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-5 p-6 space-y-4 bg-surface border-border">
            <div>
              <h4 className="font-serif text-base font-semibold text-text-primary">
                Target Role Distribution
              </h4>
              <p className="text-xs text-text-muted">
                Share of resumes submitted by target career specialization
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resumeAnalytics.roleDistribution}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {resumeAnalytics.roleDistribution.map((entry, index) => (
                      <Cell key={`role-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg)",
                      borderColor: "var(--tooltip-border)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(val: any, name: any) => [`${val} Resumes`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/60 text-[11px] font-mono">
              {resumeAnalytics.roleDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-text-secondary truncate">{item.role}</span>
                  <span className="text-text-muted font-bold">({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
