import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AdminReportData } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/common/Skeletons";
import { BarChart3, Calendar, Download } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<AdminReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    adminService.getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, [dateRange]);

  if (loading || !reports) return <CardSkeleton />;

  const COLORS = ["#4ade80", "#22d3ee", "#f2867b"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">Analytics & Placement Reports</h2>
          <p className="text-xs text-text-secondary">Export platform metrics, average scores by track, and problem pass ratios.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-surface-raised border border-border text-xs font-mono text-accent px-3 py-2 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => toast.success("Report CSV exported!")}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Domain Average Scores Bar Chart */}
        <Card className="lg:col-span-8 p-6 space-y-4 bg-surface border-border">
          <h3 className="font-serif text-lg font-medium text-text-primary">Average Score by Interview Domain</h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.interviewStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="category" stroke="var(--chart-text)" fontSize={11} />
                <YAxis stroke="var(--chart-text)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--tooltip-border)", color: "var(--text-primary)", borderRadius: "8px" }} />
                <Bar dataKey="avgScore" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Difficulty Distribution Pie Chart */}
        <Card className="lg:col-span-4 p-6 space-y-4 bg-surface border-border">
          <h3 className="font-serif text-lg font-medium text-text-primary">Difficulty Solved Split</h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reports.difficultyDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {reports.difficultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg)", borderColor: "var(--tooltip-border)", color: "var(--text-primary)", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
