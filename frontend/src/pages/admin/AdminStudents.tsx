import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { COURSE_FILTER_OPTIONS, matchesCourseFilter } from "@/lib/courseDurations";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { RoleBadge } from "@/components/common/RoleBadge";
import { RowActions } from "@/components/common/RowActions";
import { useAdminStore, MasterStudent, isRegistrationNew } from "@/context/AdminStoreContext";
import { useAuth } from "@/context/AuthContext";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CompareStudentsDialog } from "@/components/admin/CompareStudentsDialog";
import { DeleteAccountDialog, isAccountProtected } from "@/components/admin/DeleteAccountDialog";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Eye,
  Trash2,
  Ban,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Award,
  Layers,
  ArrowUpDown,
  Mail,
  Zap,
  Sparkles,
  Target,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  AlertCircle,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { cn } from "@/lib/utils";

// Readiness Score calculation helper
export const calculateReadinessScore = (student: MasterStudent): { score: number; level: string; color: string } => {
  const score = Math.round(
    student.activityScore * 0.4 +
      student.avgInterviewScore * 0.3 +
      student.avgQuizScore * 0.15 +
      student.bestAtsScore * 0.15
  );
  if (score >= 85) return { score, level: "Placement Ready", color: "text-live" };
  if (score >= 70) return { score, level: "Good Standing", color: "text-cyan-400" };
  if (score >= 50) return { score, level: "Needs Practice", color: "text-amber-400" };
  return { score, level: "High Risk", color: "text-danger" };
};

export type QuickFilterType = "ALL" | "VERIFIED" | "PENDING" | "REJECTED" | "UNVERIFIED" | "INACTIVE" | "NO_ACTIVITY";

export const AdminStudents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    students,
    deleteStudent,
    bulkDeleteStudents,
    restoreStudent,
    restoreStudents,
    deactivateStudent,
    reactivateStudent,
    addAuditLog,
  } = useAdminStore();

  const currentAdminEmail = user?.email || "admin@aiprep.com";

  const [activeTab, setActiveTab] = useState<"roster" | "analytics">("roster");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>("ALL");

  // Sorting & Pagination
  const [sortField, setSortField] = useState<"name" | "activityScore" | "registeredAt">("activityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection & Dialogs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [skippedProtectedCount, setSkippedProtectedCount] = useState(0);

  // Deletion Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [singleStudentToDelete, setSingleStudentToDelete] = useState<MasterStudent | null>(null);
  const [bulkStudentsToDelete, setBulkStudentsToDelete] = useState<MasterStudent[]>([]);


  // Single delete trigger
  const handleDeleteSingle = (student: MasterStudent) => {
    if (isAccountProtected(student, currentAdminEmail)) {
      toast.error("Admin and demo accounts cannot be deleted.");
      return;
    }
    setSingleStudentToDelete(student);
    setBulkStudentsToDelete([]);
    setDeleteDialogOpen(true);
  };

  // Bulk delete trigger for selected rows
  const handleDeleteSelected = () => {
    const selectedStudents = students.filter(
      (s) => selectedIds.includes(s.id) && !isAccountProtected(s, currentAdminEmail)
    );
    if (selectedStudents.length === 0) {
      toast.error("No eligible non-protected accounts selected for deletion.");
      return;
    }
    setSingleStudentToDelete(null);
    setBulkStudentsToDelete(selectedStudents);
    setDeleteDialogOpen(true);
  };

  // Delete all rejected trigger
  const handleDeleteAllRejected = () => {
    const rejectedStudents = filteredStudents.filter(
      (s) => s.verificationStatus.toUpperCase() === "REJECTED" && !isAccountProtected(s, currentAdminEmail)
    );
    if (rejectedStudents.length === 0) {
      toast.error("No rejected accounts found to delete.");
      return;
    }
    setSingleStudentToDelete(null);
    setBulkStudentsToDelete(rejectedStudents);
    setDeleteDialogOpen(true);
  };

  // Bulk deactivate selected rows
  const handleDeactivateSelected = () => {
    const targetIds = selectedIds.filter((id) => {
      const s = students.find((item) => item.id === id);
      return s && !isAccountProtected(s, currentAdminEmail);
    });
    if (targetIds.length === 0) {
      toast.error("No eligible accounts selected to deactivate.");
      return;
    }

    targetIds.forEach((id) => deactivateStudent(id));
    toast.success(`Deactivated ${targetIds.length} student account(s).`);
    setSelectedIds([]);
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

    const headers = ["ID", "Name", "Roll Number", "Email", "College", "Course", "Branch", "Verification Status", "Activity Score", "Risk Level", "Registered At"];
    const rows = targetStudents.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.rollNumber}"`,
      `"${s.email}"`,
      `"${s.college}"`,
      `"${s.course}"`,
      `"${s.branch}"`,
      s.verificationStatus,
      s.activityScore,
      s.riskLevel,
      `"${s.registeredAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_progress_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported CSV report for ${targetStudents.length} student records.`);
  };

  // Filter computation with quick filter support
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const query = search.toLowerCase();
        const matchesSearch =
          s.name.toLowerCase().includes(query) ||
          s.rollNumber.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.college.toLowerCase().includes(query);

        const matchesCourse = matchesCourseFilter(s.course, courseFilter);
        const matchesVerification =
          verificationFilter === "ALL" || s.verificationStatus.toUpperCase() === verificationFilter.toUpperCase();
        const matchesRisk = riskFilter === "ALL" || s.riskLevel.toUpperCase() === riskFilter.toUpperCase();

        // Quick filter conditions
        let matchesQuick = true;
        if (quickFilter === "VERIFIED") {
          matchesQuick = s.verificationStatus.toUpperCase() === "VERIFIED";
        } else if (quickFilter === "PENDING") {
          matchesQuick = s.verificationStatus.toUpperCase() === "PENDING VERIFICATION";
        } else if (quickFilter === "REJECTED") {
          matchesQuick = s.verificationStatus.toUpperCase() === "REJECTED";
        } else if (quickFilter === "UNVERIFIED") {
          matchesQuick = s.verificationStatus.toUpperCase() === "UNVERIFIED" || !s.verificationStatus;
        } else if (quickFilter === "INACTIVE") {
          const registeredTime = new Date(s.registeredAt).getTime();
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          matchesQuick = s.status === "INACTIVE" || (registeredTime < thirtyDaysAgo && s.activityScore === 0);
        } else if (quickFilter === "NO_ACTIVITY") {
          matchesQuick = s.activityScore === 0;
        }

        return matchesSearch && matchesCourse && matchesVerification && matchesRisk && matchesQuick;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (sortOrder === "asc") return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [students, search, courseFilter, verificationFilter, riskFilter, quickFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Non-protected students in current page for select-all
  const eligiblePaginatedStudents = paginatedStudents.filter((s) => !isAccountProtected(s, currentAdminEmail));
  const allEligibleSelected =
    eligiblePaginatedStudents.length > 0 &&
    eligiblePaginatedStudents.every((s) => selectedIds.includes(s.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const eligibleIds = eligiblePaginatedStudents.map((s) => s.id);
      const skipped = paginatedStudents.length - eligiblePaginatedStudents.length;
      setSkippedProtectedCount(skipped);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...eligibleIds])));
      if (skipped > 0) {
        toast.info(`${skipped} protected account${skipped > 1 ? "s were" : " was"} skipped from selection.`);
      }
    } else {
      const pageIds = paginatedStudents.map((s) => s.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      setSkippedProtectedCount(0);
    }
  };

  // Rejected count currently visible
  const rejectedCountInFilter = useMemo(() => {
    return filteredStudents.filter(
      (s) => s.verificationStatus.toUpperCase() === "REJECTED" && !isAccountProtected(s, currentAdminEmail)
    ).length;
  }, [filteredStudents, currentAdminEmail]);

  // Handle successful deletion with 8-second Undo toast
  const handleDeleteSuccess = (deletedList: MasterStudent[]) => {
    const count = deletedList.length;
    setSelectedIds((prev) => prev.filter((id) => !deletedList.some((d) => d.id === id)));

    // Trigger 8-second toast with Undo
    toast.custom(
      (t) => (
        <div className="flex items-center justify-between gap-4 p-4 bg-surface-raised border border-cyan-500/40 rounded-xl shadow-2xl text-text-primary text-xs font-mono max-w-md w-full">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {count === 1
                ? `Removed account "${deletedList[0].name}".`
                : `Removed ${count} student accounts.`}
            </span>
          </div>
          <button
            onClick={() => {
              if (count === 1) {
                restoreStudent(deletedList[0]);
              } else {
                restoreStudents(deletedList);
              }
              toast.dismiss(t);
              toast.success(
                `Restored ${count === 1 ? deletedList[0].name : `${count} accounts`} successfully.`
              );
            }}
            className="px-3 py-1.5 bg-cyan-400 text-slate-950 font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const filteredCount = filteredStudents.length;
  const dynamicAvgActivity = filteredCount > 0
    ? Math.round(filteredStudents.reduce((acc, s) => acc + s.activityScore, 0) / filteredCount)
    : 0;
  const dynamicVerifiedCount = filteredStudents.filter((s) => s.verificationStatus === "Verified").length;
  const dynamicVerifiedPct = filteredCount > 0 ? Math.round((dynamicVerifiedCount / filteredCount) * 100) : 0;
  const dynamicAtRiskCount = filteredStudents.filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Needs Attention").length;

  // Mock Radar Skill Data
  const mockRadarData = [
    { subject: "DSA & Algorithmic", A: 85, fullMark: 100 },
    { subject: "System Design", A: 68, fullMark: 100 },
    { subject: "Frontend & Web", A: 92, fullMark: 100 },
    { subject: "Behavioral STAR", A: 78, fullMark: 100 },
    { subject: "DBMS & SQL", A: 74, fullMark: 100 },
    { subject: "OS & Networking", A: 65, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              Student Progress Analytics
            </span>
            <Badge variant="accent" className="text-[10px] font-mono">
              Readiness Score
            </Badge>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-cyan-400" /> Student Progress & Readiness
          </h2>
          <p className="text-xs text-text-secondary">
            Track student engagement, readiness rings, skill radar breakdowns, and course cohort performance.
          </p>
        </div>

        {/* View Tabs & Export */}
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
              <BarChart3 className="w-3.5 h-3.5" /> Class Analytics & Radar
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs font-mono gap-1.5">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border-border flex items-center gap-4 shadow-soft">
          <div className="p-3 bg-cyan-400/15 border border-cyan-400/30 rounded-xl text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">Total Students</span>
            <span className="font-serif font-bold text-2xl text-text-primary">{filteredCount}</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-4 shadow-soft">
          <div className="p-3 bg-emerald-400/15 border border-emerald-400/30 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">Avg Activity Score</span>
            <span className="font-serif font-bold text-2xl text-text-primary">{dynamicAvgActivity}/100</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-4 shadow-soft">
          <div className="p-3 bg-indigo-400/15 border border-indigo-400/30 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">Verified Students</span>
            <span className="font-serif font-bold text-2xl text-text-primary">{dynamicVerifiedPct}%</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-4 shadow-soft">
          <div className="p-3 bg-amber-400/15 border border-amber-400/30 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">At Risk / Attention</span>
            <span className="font-serif font-bold text-2xl text-amber-400">{dynamicAtRiskCount}</span>
          </div>
        </Card>
      </div>

      {activeTab === "roster" ? (
        <>
          {/* SEARCH & FILTERS & QUICK FILTER CHIPS */}
          <div className="space-y-3 p-4 bg-surface border border-border rounded-xl shadow-soft">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search name, roll #, email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 text-xs"
                  />
                </div>

                <CustomSelect
                  options={COURSE_FILTER_OPTIONS}
                  value={courseFilter}
                  onChange={(v) => {
                    setCourseFilter(v);
                    setCurrentPage(1);
                  }}
                  ariaLabel="Filter by course"
                />

                <CustomSelect
                  options={[
                    { value: "ALL", label: "All Verification" },
                    { value: "VERIFIED", label: "Verified Only" },
                    { value: "PENDING VERIFICATION", label: "Pending Verification" },
                    { value: "REJECTED", label: "Rejected" },
                  ]}
                  value={verificationFilter}
                  onChange={(v) => {
                    setVerificationFilter(v);
                    setCurrentPage(1);
                  }}
                  ariaLabel="Filter by verification"
                />
              </div>
            </div>

            {/* Quick Filter Chips & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-text-muted mr-1">Quick Filters:</span>
                {(
                  [
                    { id: "ALL", label: "All" },
                    { id: "VERIFIED", label: "Verified" },
                    { id: "PENDING", label: "Pending" },
                    { id: "REJECTED", label: "Rejected" },
                    { id: "UNVERIFIED", label: "Unverified" },
                    { id: "INACTIVE", label: "Inactive" },
                    { id: "NO_ACTIVITY", label: "No Activity" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setQuickFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono transition-all border",
                      quickFilter === tab.id
                        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/40 font-semibold shadow-sm"
                        : "bg-surface-raised/60 text-text-muted border-border hover:text-text-primary hover:border-text-muted/30"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {quickFilter === "REJECTED" && rejectedCountInFilter > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllRejected}
                  className="text-xs font-mono text-rose-400 border-rose-500/40 hover:bg-rose-500/15 hover:border-rose-400 gap-1.5 shrink-0 h-8"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  Delete All Rejected ({rejectedCountInFilter})
                </Button>
              )}
            </div>
          </div>

          {/* STUDENT ROSTER TABLE WITH READINESS SCORE & ROLE BADGE */}
          <Card className="p-0 overflow-hidden bg-surface border-border shadow-soft relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={allEligibleSelected}
                        onChange={handleSelectAll}
                        title={
                          skippedProtectedCount > 0
                            ? `${skippedProtectedCount} protected accounts skipped`
                            : "Select all eligible rows"
                        }
                        className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                      />
                    </th>
                    <th className="p-4">Student Candidate</th>
                    <th className="p-4">Role Badge</th>
                    <th className="p-4">Course & Roll No</th>
                    <th className="p-4">Readiness Ring</th>
                    <th className="p-4 whitespace-nowrap">Verification</th>
                    <th className="p-4 whitespace-nowrap">Activity Score</th>
                    <th className="p-4 text-right w-[200px] min-w-[200px] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-text-muted font-mono">
                        No student records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s) => {
                      const readiness = calculateReadinessScore(s);
                      const isNew = isRegistrationNew(s.registeredAt);
                      const isSelected = selectedIds.includes(s.id);
                      const isProtected = isAccountProtected(s, currentAdminEmail);
                      const isInactive = s.status === "INACTIVE";

                      return (
                        <tr
                          key={s.id}
                          onClick={() => navigate(`/admin/students/${s.id}`)}
                          className={`hover:bg-surface-raised/60 transition-colors cursor-pointer ${
                            isSelected ? "bg-cyan-400/5" : ""
                          }`}
                        >
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isProtected}
                              onChange={() => handleToggleSelect(s.id)}
                              title={isProtected ? "Admin and demo accounts cannot be selected" : "Select row"}
                              className={`rounded border-border text-cyan-400 focus:ring-cyan-400 ${
                                isProtected ? "opacity-30 cursor-not-allowed" : ""
                              }`}
                            />
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-text-primary">{s.name}</span>
                              {isNew && (
                                <Badge variant="accent" className="text-[9px] font-mono px-1.5 py-0.2 animate-pulse">
                                  NEW
                                </Badge>
                              )}
                              {isInactive && (
                                <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0.2 text-amber-400 border-amber-500/30">
                                  INACTIVE
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-text-muted font-mono">{s.email}</div>
                          </td>

                          <td className="p-4">
                            <RoleBadge role={s.role} size="sm" />
                          </td>

                          <td className="p-4 font-mono text-[11px]">
                            <div className="text-text-primary font-semibold">{s.rollNumber}</div>
                            <div className="text-text-muted">{s.course} - {s.branch}</div>
                          </td>

                          {/* Readiness Ring Display */}
                          <td className="p-4">
                            <div className="flex items-center gap-2 font-mono">
                              <div className="w-9 h-9 relative flex items-center justify-center">
                                <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    className="text-border"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className={readiness.score >= 80 ? "text-live" : readiness.score >= 65 ? "text-cyan-400" : "text-amber-400"}
                                    strokeDasharray={`${readiness.score}, 100`}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                                <span className="absolute text-[10px] font-bold text-text-primary">
                                  {readiness.score}%
                                </span>
                              </div>
                              <span className={`text-[10px] font-semibold ${readiness.color}`}>
                                {readiness.level}
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            <Badge variant={s.verificationStatus === "Verified" ? "active" : s.verificationStatus === "Rejected" ? "blocked" : "medium"}>
                              {s.verificationStatus}
                            </Badge>
                          </td>

                          <td className="p-4 font-mono font-bold text-text-primary">
                            {s.activityScore}/100
                          </td>

                          <td className="p-4 text-right w-[200px] min-w-[200px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <RowActions>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/students/${s.id}`)}
                                className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/10 hover:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
                                title="View Details"
                                aria-label={`View details for ${s.name}`}
                              >
                                <Eye className="w-4 h-4 shrink-0" />
                                <span className="hidden lg:inline">Details</span>
                              </Button>

                              {isProtected ? (
                                <span title="Admin accounts cannot be deleted.">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm opacity-40 cursor-not-allowed border-border text-text-muted"
                                    aria-label="Admin accounts cannot be deleted"
                                  >
                                    <Trash2 className="w-4 h-4 shrink-0" />
                                    <span className="hidden lg:inline">Delete</span>
                                  </Button>
                                </span>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteSingle(s)}
                                  className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm text-rose-400 border border-rose-500/40 hover:bg-rose-500/15 hover:border-rose-400 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none transition-colors"
                                  title={`Delete account for ${s.name}`}
                                  aria-label={`Delete account for ${s.name}`}
                                >
                                  <Trash2 className="w-4 h-4 shrink-0 text-rose-400" />
                                  <span className="hidden lg:inline">Delete</span>
                                </Button>
                              )}
                            </RowActions>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">
                  Page {currentPage} of {totalPages} ({filteredStudents.length} total students)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="text-xs py-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="text-xs py-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Sticky Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClearSelection={() => {
              setSelectedIds([]);
              setSkippedProtectedCount(0);
            }}
            onDeleteSelected={handleDeleteSelected}
            onDeactivateSelected={handleDeactivateSelected}
            skippedProtectedCount={skippedProtectedCount}
            entityName="students"
          />

          {/* Shared Delete Confirmation Dialog */}
          <DeleteAccountDialog
            isOpen={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSingleStudentToDelete(null);
              setBulkStudentsToDelete([]);
            }}
            studentToDelete={singleStudentToDelete}
            bulkStudentsToDelete={bulkStudentsToDelete}
            onSuccess={handleDeleteSuccess}
            currentAdminEmail={currentAdminEmail}
          />
        </>
      ) : (
        /* ANALYTICS & SKILL RADAR TAB */
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Radar Chart */}
            <Card className="p-5 bg-surface border-border space-y-3">
              <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" /> Platform Skill Radar Competency Map
              </h3>
              <p className="text-xs text-text-muted">Domain proficiency spread calculated from student assessment submissions.</p>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} />
                    <Radar name="Class Proficiency" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Strengths & Weaknesses Breakdown */}
            <Card className="p-5 bg-surface border-border space-y-4">
              <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Cohort Strengths & Weaknesses
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-surface-raised border border-emerald-500/30 rounded-xl space-y-1">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4" /> Top Strengths (High Success Rate)
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Frontend & React Hooks (92%)", "Behavioral STAR Stories (78%)", "DBMS Queries (74%)"].map((str) => (
                      <span key={str} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/30 text-[11px]">
                        {str}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-surface-raised border border-amber-500/30 rounded-xl space-y-1">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Top Weakness Areas (Needs Focus)
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["OS Thread Pools (65%)", "System Design Sharding (68%)", "Dynamic Programming (64%)"].map((wk) => (
                      <span key={wk} className="px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/30 text-[11px]">
                        {wk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
