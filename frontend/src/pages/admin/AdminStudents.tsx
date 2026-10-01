import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { studentProgressService } from "@/services/studentProgressService";
import { StudentProgress, CohortAnalytics } from "@/mocks/studentProgressData";
import { COURSE_FILTER_OPTIONS, matchesCourseFilter } from "@/lib/courseDurations";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/common/Skeletons";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CompareStudentsDialog } from "@/components/admin/CompareStudentsDialog";
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Eye,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Award,
  Layers,
  ArrowUpDown,
  Mail,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { RoleBadge } from "@/components/ui/RoleBadge";

export const AdminStudents: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [analytics, setAnalytics] = useState<CohortAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"roster" | "analytics">("roster");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // Sorting
  const [sortField, setSortField] = useState<"name" | "activityScore" | "lastActive" | "problemsSolved">("activityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Compare
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);

  useEffect(() => {
    Promise.all([
      studentProgressService.getStudents(),
      studentProgressService.getCohortAnalytics(),
    ]).then(([sData, aData]) => {
      setStudents(sData);
      setAnalytics(aData);
      setLoading(false);
    });
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const targetStudents = selectedIds.length > 0
      ? students.filter((s) => selectedIds.includes(s.id))
      : filteredStudents;
    studentProgressService.exportStudentsCSV(targetStudents);
    toast.success(`Exported CSV for ${targetStudents.length} student records.`);
  };

  const handleSendNotice = () => {
    toast.success(`Notification notice sent to ${selectedIds.length} selected student(s).`);
  };

  // Filter logic using shared matchesCourseFilter helper
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchesCourse = matchesCourseFilter(s.course, courseFilter);
    const matchesBranch = branchFilter === "ALL" || s.branch.includes(branchFilter);
    const matchesVerification = verificationFilter === "ALL" || s.verificationStatus === verificationFilter;
    const matchesRisk = riskFilter === "ALL" || s.riskLevel === riskFilter;

    return matchesSearch && matchesCourse && matchesBranch && matchesVerification && matchesRisk;
  }).sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];
    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (sortOrder === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  // Dynamic KPI Metrics recalculated based on the filtered set
  const filteredCount = filteredStudents.length;
  const dynamicAvgActivity = filteredCount > 0
    ? Math.round(filteredStudents.reduce((acc, s) => acc + s.activityScore, 0) / filteredCount)
    : 0;
  const dynamicVerifiedCount = filteredStudents.filter((s) => s.verificationStatus === "VERIFIED").length;
  const dynamicVerifiedPct = filteredCount > 0
    ? Math.round((dynamicVerifiedCount / filteredCount) * 100)
    : 0;
  const dynamicAtRiskCount = filteredStudents.filter((s) => s.riskLevel === "At Risk").length;

  const selectedStudentsObj = students.filter((s) => selectedIds.includes(s.id));

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-6">
      {/* Compare Dialog */}
      <CompareStudentsDialog
        isOpen={showCompareDialog}
        onClose={() => setShowCompareDialog(false)}
        students={selectedStudentsObj}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-cyan-400" /> Student Progress & Performance
          </h2>
          <p className="text-xs text-text-secondary">
            Monitor student engagement metrics, benchmark completion, at-risk alerts, and class cohort analytics.
          </p>
        </div>

        {/* View Mode Tabs & Primary Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-surface-raised border border-border p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveTab("roster")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5",
                activeTab === "roster" ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40" : "text-text-muted hover:text-text-primary"
              )}
            >
              <Users className="w-3.5 h-3.5" /> Student Roster
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5",
                activeTab === "analytics" ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40" : "text-text-muted hover:text-text-primary"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Class Analytics
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs font-mono gap-1.5">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Top Dynamic KPI Cards (recalculated per filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border-border flex items-center gap-4">
          <div className="p-3 bg-cyan-400/15 border border-cyan-400/30 rounded-xl text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
              {courseFilter !== "ALL" || riskFilter !== "ALL" || verificationFilter !== "ALL" ? "Filtered Students" : "Total Students"}
            </span>
            <span className="font-serif font-bold text-2xl text-text-primary">{filteredCount}</span>
            {filteredCount !== students.length && (
              <span className="text-[10px] font-mono text-text-muted block">out of {students.length} total</span>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-4">
          <div className="p-3 bg-emerald-400/15 border border-emerald-400/30 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">Avg Activity Score</span>
            <span className="font-serif font-bold text-2xl text-text-primary">{dynamicAvgActivity}/100</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-4">
          <div className="p-3 bg-indigo-400/15 border border-indigo-400/30 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">Verified Students</span>
            <span className="font-serif font-bold text-2xl text-text-primary">{dynamicVerifiedPct}%</span>
            <span className="text-[10px] font-mono text-text-muted block">({dynamicVerifiedCount} verified)</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-4">
          <div className="p-3 bg-amber-400/15 border border-amber-400/30 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">At Risk / Inactive (7d+)</span>
            <span className="font-serif font-bold text-2xl text-amber-400">{dynamicAtRiskCount}</span>
          </div>
        </Card>
      </div>

      {activeTab === "roster" ? (
        <>
          {/* Filters & Bulk Actions Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-surface-raised border border-border rounded-xl">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search name, roll #, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              {/* Shared Single Source of Truth Course Filter Dropdown */}
              <CustomSelect
                options={COURSE_FILTER_OPTIONS}
                value={courseFilter}
                onChange={setCourseFilter}
                ariaLabel="Filter by course"
              />

              <CustomSelect
                options={[
                  { value: "ALL", label: "All Risk Levels" },
                  { value: "Active", label: "Active" },
                  { value: "At Risk", label: "At Risk ⚠" },
                  { value: "Inactive", label: "Inactive" },
                ]}
                value={riskFilter}
                onChange={setRiskFilter}
                ariaLabel="Filter by risk level"
              />

              <CustomSelect
                options={[
                  { value: "ALL", label: "All Verification" },
                  { value: "VERIFIED", label: "Verified Only" },
                  { value: "PENDING", label: "Pending Verification" },
                  { value: "REJECTED", label: "Rejected" },
                ]}
                value={verificationFilter}
                onChange={setVerificationFilter}
                ariaLabel="Filter by verification"
              />
            </div>

            {/* Bulk Action Controls */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/30 px-3 py-1.5 rounded-xl font-mono text-xs animate-fade-in shrink-0">
                <span className="text-cyan-400 font-bold">{selectedIds.length} Selected</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCompareDialog(true)}
                  disabled={selectedIds.length < 2 || selectedIds.length > 4}
                  className="text-[11px] py-1 h-auto"
                >
                  <Layers className="w-3.5 h-3.5" /> Compare (2-4)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSendNotice}
                  className="text-[11px] text-text-secondary hover:text-text-primary py-1 h-auto"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" /> Send Notice
                </Button>
              </div>
            )}
          </div>

          {/* Student Roster Table */}
          <Card className="p-0 overflow-hidden bg-surface border-border shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                      />
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:text-cyan-400 transition-colors"
                      onClick={() => {
                        setSortField("name");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Candidate <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-4">Course & Branch</th>
                    <th className="p-4">Verification</th>
                    <th
                      className="p-4 cursor-pointer hover:text-cyan-400 transition-colors"
                      onClick={() => {
                        setSortField("activityScore");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Activity Score <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-4">Streak & Benchmarks</th>
                    <th className="p-4">Risk Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-text-muted font-mono">
                        No student records match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSelected = selectedIds.includes(s.id);
                      const isAtRisk = s.riskLevel === "At Risk";

                      return (
                        <tr
                          key={s.id}
                          onClick={() => navigate(`/admin/students/${s.id}`)}
                          className={cn(
                            "hover:bg-surface-raised/80 transition-colors cursor-pointer",
                            isSelected ? "bg-cyan-400/5" : "",
                            isAtRisk ? "bg-amber-500/5 border-l-4 border-l-amber-500" : ""
                          )}
                        >
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(s.id)}
                              className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                                {s.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-text-primary flex items-center gap-1.5">
                                  <span>{s.name}</span>
                                  <RoleBadge role="STUDENT" size="sm" />
                                </div>
                                <div className="text-[11px] text-text-muted font-mono">{s.rollNumber} • {s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-text-primary">{s.course} ({s.year})</div>
                            <div className="text-[11px] text-text-muted truncate max-w-[180px]">{s.branch}</div>
                          </td>
                          <td className="p-4">
                            {s.verificationStatus === "VERIFIED" && <Badge variant="active"><ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED</Badge>}
                            {s.verificationStatus === "PENDING" && <Badge variant="medium"><Zap className="w-3 h-3 mr-1" /> PENDING</Badge>}
                            {s.verificationStatus === "REJECTED" && <Badge variant="blocked">REJECTED</Badge>}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-surface-raised h-2 rounded-full overflow-hidden border border-border">
                                <div
                                  className="h-full bg-cyan-400 rounded-full"
                                  style={{ width: `${s.activityScore}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-text-primary">{s.activityScore}/100</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-text-secondary">
                            <div>{s.streakDays}d Streak</div>
                            <div className="text-[10px] text-text-muted">{s.problemsSolved} Code • {s.interviewsCompleted} Mocks</div>
                          </td>
                          <td className="p-4">
                            {s.riskLevel === "At Risk" && (
                              <Badge variant="blocked" className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> AT RISK
                              </Badge>
                            )}
                            {s.riskLevel === "Active" && (
                              <Badge variant="active" className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> ACTIVE
                              </Badge>
                            )}
                            {s.riskLevel === "Inactive" && (
                              <Badge variant="outline">INACTIVE</Badge>
                            )}
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/students/${s.id}`)}
                              className="text-cyan-400 hover:text-cyan-300 font-mono text-xs gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* Class Cohort Analytics Tab */
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Average Performance Chart */}
            <Card className="p-5 bg-surface border-border space-y-3">
              <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> Course Performance Averages
              </h3>
              <p className="text-xs text-text-muted">Average Student Activity Score across degree tracks.</p>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.courseAverages || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="course" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="avgScore" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Most Struggled Topics Platform-wide */}
            <Card className="p-5 bg-surface border-border space-y-3">
              <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Platform Skill Gap Areas
              </h3>
              <p className="text-xs text-text-muted">Topics where students face the highest failure rate during practice.</p>

              <div className="space-y-3 pt-2 font-mono text-xs">
                {analytics?.topStruggledTopics.map((top, idx) => (
                  <div key={idx} className="p-3 bg-surface-raised border border-border rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary">{top.topic}</span>
                      <span className="text-amber-400 font-bold">{top.strugglePct}% Struggle Rate</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${top.strugglePct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Top Performers & Mock Interview Rating Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 p-5 bg-surface border-border space-y-3">
              <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> Campus Leaderboard Leaders
              </h3>
              <p className="text-xs text-text-muted">Top performing students across algorithm benchmarks and mock interviews.</p>

              <div className="space-y-2 pt-2">
                {analytics?.topPerformers.map((perf) => (
                  <div
                    key={perf.id}
                    onClick={() => navigate(`/admin/students/${perf.id}`)}
                    className="p-3 bg-surface-raised border border-border rounded-xl hover:border-cyan-400/40 cursor-pointer transition-colors flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 font-bold flex items-center justify-center text-[11px]">
                        #{perf.rank}
                      </span>
                      <div>
                        <span className="font-bold text-text-primary block font-sans text-xs">{perf.name}</span>
                        <span className="text-[10px] text-text-muted">{perf.course}</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm">{perf.score} XP</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-5 p-5 bg-surface border-border space-y-3">
              <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" /> Mock Interview Rating Spread
              </h3>
              <p className="text-xs text-text-muted">Score distribution across completed AI mock interviews.</p>

              <div className="space-y-2.5 pt-2 font-mono text-xs">
                {analytics?.interviewRatingDistribution.map((dist, idx) => (
                  <div key={idx} className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between">
                    <span className="text-text-secondary">{dist.range}</span>
                    <span className="font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/30">
                      {dist.count} Students
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
