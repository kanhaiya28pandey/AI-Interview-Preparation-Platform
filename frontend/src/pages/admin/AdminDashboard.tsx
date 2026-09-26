import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AdminReportData } from "@/mocks/adminData";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Users, Video, Code2, ShieldAlert, BarChart3 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<AdminReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  if (loading || !reports) return <CardSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium text-text-primary">Platform Admin Dashboard</h2>
        <p className="text-xs text-text-secondary">Overview of student registrations, interview completions, and coding benchmarks.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registered Users" value="950" subtitle="Across 12 campuses" icon={Users} trend={{ value: "+28%", isPositive: true }} />
        <StatCard title="Interviews Conducted" value="2,150" subtitle="AI rounds completed" icon={Video} trend={{ value: "+18%", isPositive: true }} />
        <StatCard title="Active Coding Tests" value="14" subtitle="Algorithm challenges" icon={Code2} />
        <StatCard title="Platform Health" value="99.98%" subtitle="Spring Boot + MongoDB" icon={ShieldAlert} />
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Growth Area Chart */}
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

        {/* Category Distribution Bar Chart */}
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
    </div>
  );
};
