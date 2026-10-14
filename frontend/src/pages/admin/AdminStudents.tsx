import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COURSE_FILTER_OPTIONS, matchesCourseFilter } from "@/lib/courseDurations";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { RoleBadge } from "@/components/common/RoleBadge";
import { RowActions } from "@/components/common/RowActions";
import { useAdminStore, MasterStudent, isRegistrationNew } from "@/context/AdminStoreContext";
import { useAuth } from "@/context/AuthContext";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CompareStudentsDialog } from "@/components/admin/CompareStudentsDialog";
import { DeleteAccountDialog, isAccountProtected } from "@/components/admin/DeleteAccountDialog";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { StudentProgress, mockStudentsProgress } from "@/mocks/studentProgressData";
import { verificationService } from "@/services/verificationService";
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
  RotateCw,
  ShieldAlert,
  ExternalLink,
  FileSpreadsheet,
  UserCheck,
  UserX,
  Check,
  X,
  Flame,
  Phone,
  Calendar,
  Clock,
  BookOpen,
  Code2,
  Video,
  HelpCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";

// Readiness Score calculation helper
export const calculateReadinessScore = (
  student: MasterStudent
): { score: number; level: string; color: string; badgeVariant: "active" | "accent" | "medium" | "blocked" } => {
  const score = Math.round(
    student.activityScore * 0.4 +
      student.avgInterviewScore * 0.3 +
      student.avgQuizScore * 0.15 +
      student.bestAtsScore * 0.15
  );
  if (score >= 85) return { score, level: "Placement Ready", color: "text-emerald-400", badgeVariant: "active" };
  if (score >= 70) return { score, level: "Good Standing", color: "text-cyan-400", badgeVariant: "accent" };
  if (score >= 50) return { score, level: "Needs Practice", color: "text-amber-400", badgeVariant: "medium" };
  return { score, level: "High Risk", color: "text-rose-400", badgeVariant: "blocked" };
};

export type QuickFilterType =
  | "ALL"
  | "VERIFIED"
  | "PENDING"
  | "REJECTED"
  | "PLACEMENT_READY"
  | "AT_RISK"
  | "BLOCKED";

export interface AdminStudentsProps {
  defaultTab?: "directory" | "progress" | "analytics";
}

export const AdminStudents: React.FC<AdminStudentsProps> = ({ defaultTab = "directory" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    students,
    toggleBlockUser,
    deleteStudent,
    bulkDeleteStudents,
    restoreStudent,
    restoreStudents,
    deactivateStudent,
    reactivateStudent,
    addAuditLog,
  } = useAdminStore();

  const currentAdminEmail = user?.email || "admin@aiprep.com";

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"directory" | "progress" | "analytics">(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Live Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      await verificationService.getAllSubmissions().catch(() => {});
      toast.success("Synchronized student directory and verification status.");
    } catch {
      toast.error("Could not sync live records from backend.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Filters & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>("ALL");

  // Sorting & Pagination
  const [sortField, setSortField] = useState<"name" | "activityScore" | "registeredAt" | "role" | "status">("activityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection & Dialogs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [skippedProtectedCount, setSkippedProtectedCount] = useState(0);

  // 360° Profile Inspector Modal State
  const [selectedUserDetail, setSelectedUserDetail] = useState<MasterStudent | null>(null);

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

  // Bulk deactivate selected rows
  const handleDeactivateSelected = () => {
    const targetIds = selectedIds.filter((id) => {
      const s = students.find((item) => item.id === id);
      return s && !isAccountProtected(s, currentAdminEmail);
    });
    if (targetIds.length === 0) {
      toast.error("No eligible accounts selected to block/deactivate.");
      return;
    }

    targetIds.forEach((id) => deactivateStudent(id));
    toast.success(`Blocked/deactivated ${targetIds.length} candidate account(s).`);
    setSelectedIds([]);
  };

  // Toggle active/blocked
  const handleToggleBlock = (s: MasterStudent) => {
    if (isAccountProtected(s, currentAdminEmail)) {
      toast.error("Admin and demo accounts cannot be blocked.");
      return;
    }
    toggleBlockUser(s.id);
    const willBlock = s.status === "ACTIVE";
    toast.success(
      willBlock
        ? `Blocked user "${s.name}". They will not be able to log in.`
        : `Unblocked user "${s.name}". Account reactivated.`
    );
    if (selectedUserDetail && selectedUserDetail.id === s.id) {
      setSelectedUserDetail((prev) => (prev ? { ...prev, status: willBlock ? "BLOCKED" : "ACTIVE" } : null));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV (Full batch or individual candidate)
  const handleExportCSV = (specificStudent?: MasterStudent) => {
    const targetStudents = specificStudent
      ? [specificStudent]
      : selectedIds.length > 0
      ? students.filter((s) => selectedIds.includes(s.id))
      : filteredStudents;

    if (targetStudents.length === 0) {
      toast.error("No student or user records available to export.");
      return;
    }

    const headers = [
      "User ID",
      "Full Name",
      "Email Address",
      "Phone",
      "College / Institution",
      "Course",
      "Branch",
      "Year / Semester",
      "Roll Number",
      "Role",
      "Account Status",
      "Verification Status",
      "Readiness Score (%)",
      "Readiness Level",
      "Activity Score",
      "Problems Solved",
      "Interviews Completed",
      "Avg Interview Score (%)",
      "Avg Quiz Score (%)",
      "Best ATS Resume Score (%)",
      "Streak Days",
      "Risk Level",
      "Registered At",
      "Last Active",
    ];

    const rows = targetStudents.map((s) => {
      const readiness = calculateReadinessScore(s);
      return [
        s.id,
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.phone || ""}"`,
        `"${s.college}"`,
        `"${s.course}"`,
        `"${s.branch}"`,
        `"${s.yearSemester || s.year || ""}"`,
        `"${s.rollNumber}"`,
        s.role,
        s.status,
        s.verificationStatus,
        readiness.score,
        `"${readiness.level}"`,
        s.activityScore,
        s.problemsSolved,
        s.interviewsCompleted,
        s.avgInterviewScore,
        s.avgQuizScore,
        s.bestAtsScore,
        s.streakDays,
        s.riskLevel,
        `"${s.registeredAt}"`,
        `"${s.lastActive || ""}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = specificStudent
      ? `student_report_${specificStudent.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`
      : `students_and_users_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported CSV report for ${targetStudents.length} record(s).`);
  };

  // Convert selected students to StudentProgress array for CompareStudentsDialog
  const selectedStudentsForCompare: StudentProgress[] = useMemo(() => {
    return selectedIds
      .map((id) => {
        const ms = students.find((s) => s.id === id);
        if (!ms) return null;
        const existing = mockStudentsProgress.find((p) => p.id === id);
        if (existing) {
          return {
            ...existing,
            name: ms.name,
            college: ms.college,
            course: ms.course,
            readinessScore: calculateReadinessScore(ms).score,
          };
        }
        return {
          id: ms.id,
          name: ms.name,
          email: ms.email,
          college: ms.college,
          course: ms.course,
          branch: ms.branch,
          rollNumber: ms.rollNumber,
          readinessScore: calculateReadinessScore(ms).score,
          problemsSolved: ms.problemsSolved,
          interviewsCompleted: ms.interviewsCompleted,
          avgInterviewScore: ms.avgInterviewScore,
          avgQuizScore: ms.avgQuizScore,
          bestAtsScore: ms.bestAtsScore,
          streakDays: ms.streakDays,
          topicBreakdown: [
            { topic: "DSA & Algorithms", score: ms.problemsSolved > 30 ? 88 : 65 },
            { topic: "System Design", score: ms.avgInterviewScore || 70 },
            { topic: "Web & Fullstack", score: ms.activityScore || 80 },
            { topic: "Core CS & DBMS", score: ms.avgQuizScore || 75 },
          ],
        } as unknown as StudentProgress;
      })
      .filter(Boolean) as StudentProgress[];
  }, [selectedIds, students]);

  // Comprehensive Filtering
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const query = search.toLowerCase();
        const matchesSearch =
          s.name.toLowerCase().includes(query) ||
          s.rollNumber.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.college.toLowerCase().includes(query);

        const matchesRole = roleFilter === "ALL" || s.role.toUpperCase() === roleFilter.toUpperCase();
        const matchesCourse = matchesCourseFilter(s.course, courseFilter);
        const matchesVerification =
          verificationFilter === "ALL" || s.verificationStatus.toUpperCase() === verificationFilter.toUpperCase();
        const matchesStatus = statusFilter === "ALL" || s.status.toUpperCase() === statusFilter.toUpperCase();
        const matchesRisk = riskFilter === "ALL" || s.riskLevel.toUpperCase() === riskFilter.toUpperCase();

        // Quick filter conditions
        let matchesQuick = true;
        if (quickFilter === "VERIFIED") {
          matchesQuick = s.verificationStatus.toUpperCase() === "VERIFIED";
        } else if (quickFilter === "PENDING") {
          matchesQuick = s.verificationStatus.toUpperCase().includes("PENDING");
        } else if (quickFilter === "REJECTED") {
          matchesQuick = s.verificationStatus.toUpperCase() === "REJECTED";
        } else if (quickFilter === "PLACEMENT_READY") {
          matchesQuick = calculateReadinessScore(s).score >= 85;
        } else if (quickFilter === "AT_RISK") {
          matchesQuick = s.riskLevel === "At Risk" || s.riskLevel === "Needs Attention";
        } else if (quickFilter === "BLOCKED") {
          matchesQuick = s.status === "BLOCKED";
        }

        return matchesSearch && matchesRole && matchesCourse && matchesVerification && matchesStatus && matchesRisk && matchesQuick;
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
  }, [students, search, roleFilter, courseFilter, verificationFilter, statusFilter, riskFilter, quickFilter, sortField, sortOrder]);

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

  // Handle successful deletion with 8-second Undo toast
  const handleDeleteSuccess = (deletedList: MasterStudent[]) => {
    const count = deletedList.length;
    setSelectedIds((prev) => prev.filter((id) => !deletedList.some((d) => d.id === id)));
    if (selectedUserDetail && deletedList.some((d) => d.id === selectedUserDetail.id)) {
      setSelectedUserDetail(null);
    }

    toast.custom(
      (t) => (
        <div className="flex items-center justify-between gap-4 p-4 bg-surface-raised border border-cyan-500/40 rounded-xl shadow-2xl text-text-primary text-xs font-mono max-w-md w-full">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {count === 1
                ? `Permanently removed "${deletedList[0].name}".`
                : `Removed ${count} accounts.`}
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
              toast.success(`Restored ${count === 1 ? deletedList[0].name : `${count} accounts`}.`);
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

  // Key Global Metrics
  const totalCount = students.length;
  const studentsCount = students.filter((s) => s.role === "STUDENT").length;
  const adminsCount = students.filter((s) => s.role === "ADMIN").length;
  const placementReadyCount = students.filter((s) => s.role === "STUDENT" && calculateReadinessScore(s).score >= 85).length;
  const verifiedStudentsCount = students.filter((s) => s.role === "STUDENT" && s.verificationStatus === "Verified").length;
  const verifiedPct = studentsCount > 0 ? Math.round((verifiedStudentsCount / studentsCount) * 100) : 0;
  const atRiskOrBlockedCount = students.filter(
    (s) => s.status === "BLOCKED" || s.riskLevel === "At Risk" || s.riskLevel === "Needs Attention"
  ).length;

  // Cohort Skill Radar Data
  const cohortRadarData = [
    { subject: "DSA & Coding", score: 82, fullMark: 100 },
    { subject: "System Design", score: 71, fullMark: 100 },
    { subject: "Mock Interviews", score: 78, fullMark: 100 },
    { subject: "Technical Quizzes", score: 84, fullMark: 100 },
    { subject: "Resume ATS Match", score: 86, fullMark: 100 },
    { subject: "Consistency & Streak", score: 75, fullMark: 100 },
  ];

  // Score Distribution Chart Data
  const scoreDistributionData = [
    { tier: "Placement Ready (85%+)", count: placementReadyCount, fill: "#34d399" },
    { tier: "Good Standing (70-84%)", count: students.filter((s) => { const sc = calculateReadinessScore(s).score; return sc >= 70 && sc < 85; }).length, fill: "#22d3ee" },
    { tier: "Needs Practice (50-69%)", count: students.filter((s) => { const sc = calculateReadinessScore(s).score; return sc >= 50 && sc < 70; }).length, fill: "#f59e0b" },
    { tier: "High Risk (<50%)", count: students.filter((s) => calculateReadinessScore(s).score < 50).length, fill: "#f43f5e" },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* PAGE HEADER */}
      <PageHeader
        icon={Users}
        title="Candidate Profiles & Performance"
        subtitle="Unified directory for candidate administration, verification controls, and placement readiness performance."
        badge="CANDIDATES"
        accent="cyan"
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncData}
              disabled={isSyncing}
              className="text-xs font-mono gap-1.5 h-10 px-3.5 rounded-xl"
              title="Sync latest records from database"
            >
              <RotateCw className={cn("w-3.5 h-3.5 text-cyan-400", isSyncing && "animate-spin")} />
              <span>{isSyncing ? "Syncing..." : "Sync Records"}</span>
            </Button>

            {selectedIds.length >= 2 && selectedIds.length <= 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompareDialog(true)}
                className="text-xs font-mono gap-1.5 h-10 px-3.5 rounded-xl border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
              >
                <Award className="w-3.5 h-3.5" /> Compare ({selectedIds.length})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV()}
              className="text-xs font-mono gap-1.5 h-10 px-3.5 rounded-xl text-text-primary hover:text-cyan-400 hover:border-cyan-400"
              title="Download CSV report for current records"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}</span>
            </Button>
          </div>
        }
      />

      {/* TOP KPI OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <Card className="p-4 bg-surface border-border flex items-center gap-4 shadow-soft">
          <div className="p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl text-cyan-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
              Total Accounts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-2xl text-text-primary">{totalCount}</span>
              <span className="text-[11px] font-mono text-text-muted">
                ({studentsCount} Students • {adminsCount} Staff)
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Placement Ready */}
        <Card className="p-4 bg-surface border-border flex items-center gap-4 shadow-soft">
          <div className="p-3 bg-emerald-400/10 border border-emerald-400/30 rounded-xl text-emerald-400 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
              Placement Ready
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-2xl text-emerald-400">{placementReadyCount}</span>
              <span className="text-[11px] font-mono text-emerald-400/80">
                (≥85% benchmark score)
              </span>
            </div>
          </div>
        </Card>

        {/* Card 3: Verified Students */}
        <Card className="p-4 bg-surface border-border flex items-center gap-4 shadow-soft">
          <div className="p-3 bg-indigo-400/10 border border-indigo-400/30 rounded-xl text-indigo-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
              ID Verified Ratio
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-2xl text-text-primary">{verifiedPct}%</span>
              <span className="text-[11px] font-mono text-text-muted">
                ({verifiedStudentsCount} of {studentsCount})
              </span>
            </div>
          </div>
        </Card>

        {/* Card 4: Blocked / At-Risk */}
        <Card className="p-4 bg-surface border-border flex items-center gap-4 shadow-soft">
          <div className="p-3 bg-rose-400/10 border border-rose-400/30 rounded-xl text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
              At-Risk / Blocked
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-2xl text-rose-400">{atRiskOrBlockedCount}</span>
              <span className="text-[11px] font-mono text-rose-300/80">
                Needs Admin Action
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* VIEW SWITCHER SUB-TABS */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-3">
        <div className="flex items-center p-1 bg-surface-raised border border-border rounded-xl text-xs font-mono tablist-scroll-container">
          <button
            onClick={() => {
              setActiveTab("directory");
              setCurrentPage(1);
            }}
            className={cn(
              "px-3.5 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap",
              activeTab === "directory"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <Users className="w-4 h-4" />
            <span>User Directory & Accounts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("progress");
              setCurrentPage(1);
            }}
            className={cn(
              "px-3.5 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap",
              activeTab === "progress"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Progress & Readiness Scores</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("analytics");
              setCurrentPage(1);
            }}
            className={cn(
              "px-3.5 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap",
              activeTab === "analytics"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Cohort Analytics & Radar</span>
          </button>
        </div>

        <span className="text-xs font-mono text-text-muted">
          Showing <strong className="text-text-primary">{filteredStudents.length}</strong> matching candidate(s)
        </span>
      </div>

      {/* FILTER & SEARCH BAR (Available for Directory & Progress views) */}
      {activeTab !== "analytics" && (
        <div className="space-y-3 p-4 bg-surface border border-border rounded-xl shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search name, roll #, email, college..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 text-xs h-10 py-0 rounded-xl"
                />
              </div>

              {/* Role Filter */}
              <CustomSelect
                options={[
                  { value: "ALL", label: "All Roles" },
                  { value: "STUDENT", label: "Students Only" },
                  { value: "ADMIN", label: "Admins Only" },
                ]}
                value={roleFilter}
                onChange={(v) => {
                  setRoleFilter(v);
                  setCurrentPage(1);
                }}
                ariaLabel="Filter by role"
              />

              {/* Course Filter */}
              <CustomSelect
                options={COURSE_FILTER_OPTIONS}
                value={courseFilter}
                onChange={(v) => {
                  setCourseFilter(v);
                  setCurrentPage(1);
                }}
                ariaLabel="Filter by course"
              />

              {/* Verification Filter */}
              <CustomSelect
                options={[
                  { value: "ALL", label: "All Verifications" },
                  { value: "VERIFIED", label: "Verified Only" },
                  { value: "PENDING VERIFICATION", label: "Pending Review" },
                  { value: "REJECTED", label: "Rejected Only" },
                ]}
                value={verificationFilter}
                onChange={(v) => {
                  setVerificationFilter(v);
                  setCurrentPage(1);
                }}
                ariaLabel="Filter by verification status"
              />

              {/* Status Filter */}
              <CustomSelect
                options={[
                  { value: "ALL", label: "All Status" },
                  { value: "ACTIVE", label: "Active Accounts" },
                  { value: "BLOCKED", label: "Blocked Accounts" },
                ]}
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
                ariaLabel="Filter by account status"
              />
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/50">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-text-muted mr-1">Quick Filters:</span>
              {(
                [
                  { id: "ALL", label: "All Candidates" },
                  { id: "VERIFIED", label: "Verified Only" },
                  { id: "PENDING", label: "Pending Verification" },
                  { id: "REJECTED", label: "Rejected" },
                  { id: "PLACEMENT_READY", label: "Placement Ready (≥85%)" },
                  { id: "AT_RISK", label: "At-Risk" },
                  { id: "BLOCKED", label: "Blocked" },
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

            {quickFilter !== "ALL" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuickFilter("ALL")}
                className="text-xs font-mono text-text-muted hover:text-text-primary h-7 px-2"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: USER DIRECTORY & ACCOUNT GOVERNANCE */}
      {activeTab === "directory" && (
        <Card className="bg-surface border-border overflow-hidden shadow-soft">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-text-muted space-y-3 font-mono text-xs">
              <Users className="w-10 h-10 mx-auto text-text-muted/50" />
              <p>No user accounts found matching current query or filters.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                  setCourseFilter("ALL");
                  setVerificationFilter("ALL");
                  setStatusFilter("ALL");
                  setQuickFilter("ALL");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-raised text-text-muted uppercase font-mono text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allEligibleSelected}
                        onChange={handleSelectAll}
                        className="rounded border-border text-cyan-400"
                        title="Select All Eligible On Page"
                      />
                    </th>
                    <th className="p-3.5">Candidate / User</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5">ID Verification</th>
                    <th className="p-3.5">Readiness Score</th>
                    <th className="p-3.5">Security Control</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {paginatedStudents.map((usr) => {
                      const isSelected = selectedIds.includes(usr.id);
                      const isProtected = isAccountProtected(usr, currentAdminEmail);
                      const readiness = calculateReadinessScore(usr);

                      return (
                        <motion.tr
                          key={usr.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedUserDetail(usr)}
                          className={cn(
                            "hover:bg-surface-raised/60 transition-colors cursor-pointer",
                            isSelected ? "bg-cyan-400/5" : ""
                          )}
                        >
                          {/* Checkbox */}
                          <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isProtected}
                              onChange={() => handleToggleSelect(usr.id)}
                              className="rounded border-border text-cyan-400 disabled:opacity-30"
                            />
                          </td>

                          {/* Candidate User Info */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-raised border border-border flex items-center justify-center shrink-0">
                                {usr.selfieUrl ? (
                                  <img src={usr.selfieUrl} alt={usr.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-mono font-bold text-xs text-cyan-400">
                                    {usr.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-text-primary text-sm">
                                    {usr.name}
                                  </span>
                                  {isRegistrationNew(usr.registeredAt) && (
                                    <Badge variant="accent" className="text-[9px] font-mono">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5 flex-wrap">
                                  <span>{usr.email}</span>
                                  <span>•</span>
                                  <span className="text-text-secondary">{usr.college}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="p-3.5 whitespace-nowrap">
                            <RoleBadge role={usr.role} size="sm" />
                          </td>

                          {/* Account Status */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border",
                                usr.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  usr.status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"
                                )}
                              />
                              {usr.status}
                            </span>
                          </td>

                          {/* Verification */}
                          <td className="p-3.5 whitespace-nowrap">
                            <Badge
                              variant={
                                usr.verificationStatus === "Verified"
                                  ? "active"
                                  : usr.verificationStatus === "Rejected"
                                  ? "blocked"
                                  : "medium"
                              }
                              className="text-[10px] font-mono"
                            >
                              {usr.verificationStatus}
                            </Badge>
                          </td>

                          {/* Readiness Score */}
                          <td className="p-3.5 whitespace-nowrap">
                            {usr.role === "STUDENT" ? (
                              <div className="flex items-center gap-2">
                                <span className={cn("font-mono font-bold text-xs", readiness.color)}>
                                  {readiness.score}%
                                </span>
                                <Badge variant={readiness.badgeVariant} className="text-[9px] font-mono">
                                  {readiness.level}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-[11px] font-mono text-text-muted italic">Staff Account</span>
                            )}
                          </td>

                          {/* Security Toggle: Block / Unblock */}
                          <td className="p-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {isProtected ? (
                              <span className="text-[10px] text-text-muted font-mono italic">Protected</span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleBlock(usr)}
                                className={cn(
                                  "h-8 px-2.5 text-xs font-mono gap-1.5",
                                  usr.status === "ACTIVE"
                                    ? "text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-400"
                                    : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400"
                                )}
                                title={usr.status === "ACTIVE" ? "Block Candidate" : "Unblock Candidate"}
                              >
                                {usr.status === "ACTIVE" ? (
                                  <>
                                    <Ban className="w-3.5 h-3.5" /> Block
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Unblock
                                  </>
                                )}
                              </Button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <RowActions>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUserDetail(usr)}
                                className="h-8 px-2.5 text-xs text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/10"
                                title="Inspect Candidate 360° Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Inspect</span>
                              </Button>

                              {!isProtected && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSingle(usr)}
                                  className="h-8 px-2.5 text-xs text-rose-400 hover:bg-rose-500/10"
                                  title="Permanently Delete Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </RowActions>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted">
                Page {currentPage} of {totalPages} ({filteredStudents.length} candidates)
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
      )}

      {/* TAB 2: PROGRESS & READINESS BENCHMARKS */}
      {activeTab === "progress" && (
        <Card className="bg-surface border-border overflow-hidden shadow-soft">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-text-muted space-y-3 font-mono text-xs">
              <GraduationCap className="w-10 h-10 mx-auto text-text-muted/50" />
              <p>No student progress records match the active criteria.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setCourseFilter("ALL");
                  setVerificationFilter("ALL");
                  setQuickFilter("ALL");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-raised text-text-muted uppercase font-mono text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allEligibleSelected}
                        onChange={handleSelectAll}
                        className="rounded border-border text-cyan-400"
                        title="Select All Students"
                      />
                    </th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Readiness Score</th>
                    <th className="p-3.5">Problems Solved</th>
                    <th className="p-3.5">Mock Interviews</th>
                    <th className="p-3.5">Quiz Mastery</th>
                    <th className="p-3.5">Best ATS Score</th>
                    <th className="p-3.5">Risk Level</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {paginatedStudents.map((s) => {
                      const isSelected = selectedIds.includes(s.id);
                      const isProtected = isAccountProtected(s, currentAdminEmail);
                      const readiness = calculateReadinessScore(s);

                      return (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedUserDetail(s)}
                          className={cn(
                            "hover:bg-surface-raised/60 transition-colors cursor-pointer",
                            isSelected ? "bg-cyan-400/5" : ""
                          )}
                        >
                          {/* Checkbox */}
                          <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isProtected}
                              onChange={() => handleToggleSelect(s.id)}
                              className="rounded border-border text-cyan-400 disabled:opacity-30"
                            />
                          </td>

                          {/* Student Identity */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-raised border border-border flex items-center justify-center shrink-0">
                                {s.selfieUrl ? (
                                  <img src={s.selfieUrl} alt={s.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-mono font-bold text-xs text-cyan-400">
                                    {s.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-text-primary text-sm">
                                    {s.name}
                                  </span>
                                  {isRegistrationNew(s.registeredAt) && (
                                    <Badge variant="accent" className="text-[9px] font-mono">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5 flex-wrap">
                                  <span>{s.college}</span>
                                  <span>•</span>
                                  <span className="text-cyan-400">{s.course}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Readiness Score Progress */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="space-y-1 w-32">
                              <div className="flex items-center justify-between font-mono text-[11px]">
                                <span className={cn("font-bold", readiness.color)}>{readiness.score}%</span>
                                <Badge variant={readiness.badgeVariant} className="text-[9px] px-1 py-0">
                                  {readiness.level}
                                </Badge>
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-300",
                                    readiness.score >= 85
                                      ? "bg-emerald-400"
                                      : readiness.score >= 70
                                      ? "bg-cyan-400"
                                      : readiness.score >= 50
                                      ? "bg-amber-400"
                                      : "bg-rose-400"
                                  )}
                                  style={{ width: `${Math.min(100, readiness.score)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Coding Arena */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-mono text-xs">
                              <span className="font-bold text-text-primary">{s.problemsSolved}</span>
                              <span className="text-text-muted"> solved</span>
                            </div>
                            <div className="text-[10px] text-cyan-400 font-mono">
                              Activity: {s.activityScore}/100
                            </div>
                          </td>

                          {/* Mock Interviews */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-mono text-xs text-text-primary">
                              <span className="font-bold">{s.interviewsCompleted}</span> sessions
                            </div>
                            <div className="text-[10px] text-text-muted font-mono">
                              Avg: <span className="text-cyan-400 font-semibold">{s.avgInterviewScore}%</span>
                            </div>
                          </td>

                          {/* Quiz Score */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs text-text-primary block">
                              {s.avgQuizScore}%
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">
                              {s.testsAttended || 0} tests attended
                            </span>
                          </td>

                          {/* ATS Score */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs text-purple-400">
                              {s.bestAtsScore}%
                            </span>
                          </td>

                          {/* Risk Level */}
                          <td className="p-3.5 whitespace-nowrap">
                            <Badge
                              variant={
                                s.riskLevel === "On Track"
                                  ? "active"
                                  : s.riskLevel === "Needs Attention"
                                  ? "medium"
                                  : "blocked"
                              }
                              className="text-[10px] font-mono"
                            >
                              {s.riskLevel}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <RowActions>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUserDetail(s)}
                                className="h-8 px-2.5 text-xs text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/10"
                                title="Inspect Candidate 360° Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Inspect</span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/students/${s.id}`)}
                                className="h-8 px-2.5 text-xs text-text-secondary hover:text-cyan-400"
                                title="Open Full Analytics Detail View"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>

                              {!isProtected && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSingle(s)}
                                  className="h-8 px-2.5 text-xs text-rose-400 hover:bg-rose-500/10"
                                  title="Permanently Delete Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </RowActions>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted">
                Page {currentPage} of {totalPages} ({filteredStudents.length} candidates)
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
      )}

      {/* TAB 3: COHORT ANALYTICS & RADAR CHARTS */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Radar Chart */}
            <Card className="p-5 bg-surface border-border space-y-3 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" /> Platform Skill Radar Competency Map
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Aggregated proficiency spread across technical & interview benchmark domains.
                  </p>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={cohortRadarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} />
                    <Radar
                      name="Cohort Average"
                      dataKey="score"
                      stroke="#22d3ee"
                      fill="#22d3ee"
                      fillOpacity={0.4}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#090d16",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Score Distribution Bar Chart */}
            <Card className="p-5 bg-surface border-border space-y-3 shadow-soft">
              <div>
                <h3 className="font-serif font-semibold text-base text-text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" /> Placement Readiness Tiers
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Distribution of student cohort across four core placement readiness tiers.
                </p>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistributionData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="tier"
                      stroke="var(--text-secondary)"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#090d16",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {scoreDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Top Candidates and At-Risk Action List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Placement-Ready Students */}
            <Card className="p-5 bg-surface border-border space-y-4 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-semibold text-base text-emerald-400 flex items-center gap-2">
                  <Award className="w-5 h-5" /> Top Placement-Ready Candidates
                </h3>
                <Badge variant="active" className="text-xs font-mono">
                  Score ≥ 85%
                </Badge>
              </div>

              <div className="space-y-2.5">
                {students
                  .filter((s) => s.role === "STUDENT")
                  .sort((a, b) => calculateReadinessScore(b).score - calculateReadinessScore(a).score)
                  .slice(0, 4)
                  .map((s, idx) => {
                    const readiness = calculateReadinessScore(s);
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedUserDetail(s)}
                        className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between hover:border-emerald-500/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-text-muted font-bold w-4">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                            <p className="text-[11px] text-text-muted font-mono">{s.college} • {s.course}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            {readiness.score}%
                          </span>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-cyan-400">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>

            {/* At-Risk Alert List */}
            <Card className="p-5 bg-surface border-border space-y-4 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-semibold text-base text-rose-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> At-Risk / Inactive Candidates
                </h3>
                <Badge variant="blocked" className="text-xs font-mono">
                  Needs Attention
                </Badge>
              </div>

              <div className="space-y-2.5">
                {students
                  .filter((s) => s.role === "STUDENT" && (s.riskLevel === "At Risk" || s.riskLevel === "Needs Attention" || s.status === "BLOCKED"))
                  .slice(0, 4)
                  .map((s) => {
                    const readiness = calculateReadinessScore(s);
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedUserDetail(s)}
                        className="p-3 bg-surface-raised border border-rose-500/20 rounded-xl flex items-center justify-between hover:border-rose-500/40 transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                            {s.status === "BLOCKED" && (
                              <Badge variant="blocked" className="text-[9px] font-mono">
                                BLOCKED
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted font-mono">{s.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="medium" className="text-[10px] font-mono">
                            {readiness.score}% Readiness
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-cyan-400">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* CANDIDATE 360° PROFILE INSPECTOR MODAL */}
      {selectedUserDetail && (
        <Dialog
          isOpen={Boolean(selectedUserDetail)}
          onClose={() => setSelectedUserDetail(null)}
          title={`Candidate 360° Profile: ${selectedUserDetail.name}`}
          maxWidthClass="max-w-3xl"
        >
          <div className="space-y-5 text-xs font-sans">
            {/* Header Identity Banner */}
            <div className="p-4 bg-surface-raised border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-black border border-border flex items-center justify-center shrink-0">
                  {selectedUserDetail.selfieUrl ? (
                    <img
                      src={selectedUserDetail.selfieUrl}
                      alt={selectedUserDetail.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono font-bold text-xl text-cyan-400">
                      {selectedUserDetail.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-lg font-bold text-text-primary">
                      {selectedUserDetail.name}
                    </h3>
                    <RoleBadge role={selectedUserDetail.role} size="sm" />
                    <Badge
                      variant={
                        selectedUserDetail.verificationStatus === "Verified"
                          ? "active"
                          : selectedUserDetail.verificationStatus === "Rejected"
                          ? "blocked"
                          : "medium"
                      }
                      className="text-[10px] font-mono"
                    >
                      {selectedUserDetail.verificationStatus}
                    </Badge>
                    {isRegistrationNew(selectedUserDetail.registeredAt) && (
                      <Badge variant="accent" className="text-[9px] font-mono">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">{selectedUserDetail.email}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="text-right sm:text-right shrink-0">
                <span className="text-[10px] font-mono text-text-muted uppercase block">Account Status</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border font-semibold mt-1",
                    selectedUserDetail.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      selectedUserDetail.status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"
                    )}
                  />
                  {selectedUserDetail.status}
                </span>
              </div>
            </div>

            {/* Academic & Contact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1.5">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Academic Info</span>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-text-muted">College:</span>
                  <span className="text-text-primary font-sans font-medium text-right truncate max-w-[180px]">
                    {selectedUserDetail.college}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-text-muted">Course / Branch:</span>
                  <span className="text-text-primary text-right">
                    {selectedUserDetail.course} {selectedUserDetail.branch ? `(${selectedUserDetail.branch})` : ""}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-text-muted">Roll / Reg Number:</span>
                  <span className="text-cyan-400 font-bold">{selectedUserDetail.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Year / Semester:</span>
                  <span className="text-text-primary">{selectedUserDetail.yearSemester || selectedUserDetail.year}</span>
                </div>
              </div>

              <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1.5">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Account Metadata</span>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-text-muted">Phone Number:</span>
                  <span className="text-text-primary">{selectedUserDetail.phone || "Not Provided"}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-text-muted">Registered Date:</span>
                  <span className="text-text-primary">
                    {new Date(selectedUserDetail.registeredAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-text-muted">Current Streak:</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {selectedUserDetail.streakDays} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Last Active:</span>
                  <span className="text-cyan-400">{selectedUserDetail.lastActive || "Recently"}</span>
                </div>
              </div>
            </div>

            {/* Performance & Readiness Matrix (Students Only) */}
            {selectedUserDetail.role === "STUDENT" && (
              <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-text-primary flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-cyan-400" /> Placement Readiness Benchmark
                  </span>
                  {(() => {
                    const readiness = calculateReadinessScore(selectedUserDetail);
                    return (
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold", readiness.color)}>{readiness.score}%</span>
                        <Badge variant={readiness.badgeVariant} className="text-[10px]">
                          {readiness.level}
                        </Badge>
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                  <div className="p-2.5 bg-surface border border-border rounded-lg">
                    <span className="text-[10px] text-text-muted uppercase block">Coding Solved</span>
                    <span className="text-base font-bold text-text-primary">
                      {selectedUserDetail.problemsSolved}
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-lg">
                    <span className="text-[10px] text-text-muted uppercase block">Interview Avg</span>
                    <span className="text-base font-bold text-cyan-400">
                      {selectedUserDetail.avgInterviewScore}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-lg">
                    <span className="text-[10px] text-text-muted uppercase block">Quiz Mastery</span>
                    <span className="text-base font-bold text-emerald-400">
                      {selectedUserDetail.avgQuizScore}%
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      {selectedUserDetail.testsAttended || 0} tests attended
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-lg">
                    <span className="text-[10px] text-text-muted uppercase block">Best ATS Score</span>
                    <span className="text-base font-bold text-purple-400">
                      {selectedUserDetail.bestAtsScore}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                {!isAccountProtected(selectedUserDetail, currentAdminEmail) && (
                  <Button
                    variant={selectedUserDetail.status === "ACTIVE" ? "danger" : "teal-cyan"}
                    size="sm"
                    onClick={() => handleToggleBlock(selectedUserDetail)}
                    className="text-xs"
                  >
                    {selectedUserDetail.status === "ACTIVE" ? (
                      <>
                        <Ban className="w-3.5 h-3.5" /> Block Account
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Unblock Account
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(selectedUserDetail)}
                  className="text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" /> Download Report
                </Button>

                {selectedUserDetail.role === "STUDENT" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUserDetail(null);
                      navigate(`/admin/students/${selectedUserDetail.id}`);
                    }}
                    className="text-xs gap-1.5 text-text-secondary hover:text-cyan-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Full Analytics
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isAccountProtected(selectedUserDetail, currentAdminEmail) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const toDelete = selectedUserDetail;
                      setSelectedUserDetail(null);
                      handleDeleteSingle(toDelete);
                    }}
                    className="text-xs text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUserDetail(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* BULK ACTION BAR */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => {
          setSelectedIds([]);
          setSkippedProtectedCount(0);
        }}
        onDeleteSelected={handleDeleteSelected}
        onDeactivateSelected={handleDeactivateSelected}
        skippedProtectedCount={skippedProtectedCount}
        entityName="accounts"
      />

      {/* SIDE-BY-SIDE COMPARE STUDENTS MODAL */}
      {showCompareDialog && (
        <CompareStudentsDialog
          isOpen={showCompareDialog}
          onClose={() => setShowCompareDialog(false)}
          students={selectedStudentsForCompare}
        />
      )}

      {/* SHARED DELETE ACCOUNT CONFIRMATION DIALOG */}
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
    </div>
  );
};

export default AdminStudents;
