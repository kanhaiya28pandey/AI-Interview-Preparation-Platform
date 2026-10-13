import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { RoleBadge } from "@/components/common/RoleBadge";
import { RowActions } from "@/components/common/RowActions";
import { useAdminStore, MasterStudent, isRegistrationNew } from "@/context/AdminStoreContext";
import { useAuth } from "@/context/AuthContext";
import { DeleteAccountDialog, isAccountProtected } from "@/components/admin/DeleteAccountDialog";
import { validateCollegeDomainMatch } from "@/mocks/verifications";
import { verificationService } from "@/services/verificationService";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Building2,
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  AlertCircle,
  Check,
  Sparkles,
  FileCheck2,
  CheckCheck,
  UserX,
  ArrowRight,
  RotateCcw,
  User,
  Scan,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const AdminVerifications: React.FC = () => {
  const { user } = useAuth();
  const {
    students,
    approveVerification,
    rejectVerification,
    deleteStudent,
    bulkApproveVerifications,
    bulkRejectVerifications,
    bulkDeleteStudents,
    restoreStudent,
    restoreStudents,
  } = useAdminStore();

  const currentAdminEmail = user?.email || "admin@aiprep.com";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<{ message: string; is403: boolean; isNetworkError: boolean } | null>(null);

  const syncVerifications = async () => {
    setError(null);
    try {
      await verificationService.getAllSubmissions();
    } catch (err: any) {
      console.error("Failed to sync verifications:", err);
      const is403 = err?.response?.status === 403;
      const isNetworkError = !err?.response || err?.code === "ERR_NETWORK";
      let message = "An error occurred while syncing verifications.";
      if (isNetworkError) {
        message = "Could not reach the server. Make sure the backend is running.";
      } else if (is403) {
        message = "You do not have permission to view this page.";
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      setError({ message, is403, isNetworkError });
    }
  };

  useEffect(() => {
    syncVerifications();
  }, []);

  // Verification Modal & Visual Inspection State
  const [selectedStudent, setSelectedStudent] = useState<MasterStudent | null>(null);
  const [idZoom, setIdZoom] = useState<number>(1);
  const [photoZoom, setPhotoZoom] = useState<number>(1);
  const [activeIdSide, setActiveIdSide] = useState<"front" | "back">("front");
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState("Details don't match ID card");
  const [rejectionNotes, setRejectionNotes] = useState("");

  const getStudentPhotoUrl = (student: MasterStudent) => {
    if (student.selfieUrl && student.selfieUrl.trim()) return student.selfieUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name || student.email || "student")}`;
  };

  useBodyScrollLock(Boolean(selectedStudent || lightboxImage));

  useEffect(() => {
    if (!selectedStudent && !lightboxImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          setSelectedStudent(null);
          setIsRejecting(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStudent, lightboxImage]);

  // Delete Account Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<MasterStudent | null>(null);
  const [bulkStudentsToDelete, setBulkStudentsToDelete] = useState<MasterStudent[]>([]);

  // Bulk Action Modals
  const [bulkRejectModalOpen, setBulkRejectModalOpen] = useState(false);
  const [bulkRejectCategory, setBulkRejectCategory] = useState("Unreadable ID Card");
  const [bulkRejectNotes, setBulkRejectNotes] = useState("Verification request rejected during bulk review.");

  // Filter verification records
  const filteredStudents = students.filter((s) => {
    // Exclude plain admins from verification queue
    if (s.role === "ADMIN" && !s.idCardFrontUrl) return false;

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.college.toLowerCase().includes(query) ||
      s.rollNumber.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query);

    const statusClean = s.verificationStatus.toUpperCase().replace(/\s+/g, "_");
    const matchesStatus =
      selectedStatus === "ALL"
        ? true
        : statusClean === selectedStatus || (selectedStatus === "PENDING" && statusClean.includes("PENDING"));

    return matchesQuery && matchesStatus;
  });

  const pendingCount = students.filter((s) => s.verificationStatus === "Pending Verification").length;
  const verifiedCount = students.filter((s) => s.verificationStatus === "Verified").length;
  const rejectedCount = students.filter((s) => s.verificationStatus === "Rejected").length;

  // Single Approve
  const handleApprove = (student: MasterStudent) => {
    approveVerification(student.id);
    toast.success(`College ID for ${student.name} approved & verified!`);
    setSelectedStudent((prev) =>
      prev && prev.id === student.id
        ? {
            ...prev,
            verificationStatus: "Verified",
          }
        : null
    );
  };

  // Single Reject
  const handleConfirmReject = (student: MasterStudent) => {
    if (!rejectionNotes.trim()) {
      toast.error("Please enter a note explaining the rejection reason.");
      return;
    }
    rejectVerification(student.id, rejectionCategory, rejectionNotes.trim());
    toast.error(`Verification request for ${student.name} marked as Rejected.`);
    // Update local state in place so the Reject button disappears immediately and Delete Account appears!
    setSelectedStudent((prev) =>
      prev && prev.id === student.id
        ? {
            ...prev,
            verificationStatus: "Rejected",
            rejectionCategory,
            rejectionNotes: rejectionNotes.trim(),
          }
        : prev
    );
    setIsRejecting(false);
  };

  // Open Single Delete Modal
  const handleOpenDelete = (student: MasterStudent) => {
    if (isAccountProtected(student, currentAdminEmail)) {
      toast.error("Admin and demo accounts cannot be deleted.");
      return;
    }
    setStudentToDelete(student);
    setBulkStudentsToDelete([]);
    setDeleteModalOpen(true);
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    bulkApproveVerifications(selectedIds);
    toast.success(`Bulk approved ${selectedIds.length} student verifications.`);
    setSelectedIds([]);
  };

  const handleConfirmBulkReject = () => {
    if (selectedIds.length === 0) return;
    bulkRejectVerifications(selectedIds, bulkRejectCategory, bulkRejectNotes);
    toast.error(`Bulk rejected ${selectedIds.length} verifications.`);
    setSelectedIds([]);
    setBulkRejectModalOpen(false);
  };

  const handleBulkDelete = () => {
    const rejectedSelected = students.filter(
      (s) => selectedIds.includes(s.id) && s.verificationStatus === "Rejected" && !isAccountProtected(s, currentAdminEmail)
    );
    if (rejectedSelected.length === 0) {
      toast.error("Bulk delete requires selecting at least one non-protected REJECTED account.");
      return;
    }
    setStudentToDelete(null);
    setBulkStudentsToDelete(rejectedSelected);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (deletedList: MasterStudent[]) => {
    const count = deletedList.length;
    setSelectedIds((prev) => prev.filter((id) => !deletedList.some((d) => d.id === id)));
    if (selectedStudent && deletedList.some((d) => d.id === selectedStudent.id)) {
      setSelectedStudent(null);
    }

    toast.success(
      count === 1
        ? `Permanently deleted account "${deletedList[0].name}" from database.`
        : `Permanently deleted ${count} student accounts from database.`
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-semibold">
              Governance & Verification Queue
            </span>
            <Badge variant="accent" className="text-[10px] font-mono">
              Live Sync
            </Badge>
          </div>
          <h1 className="font-serif text-3xl font-medium text-text-primary">
            Student ID Verifications
          </h1>
          <p className="text-xs text-text-secondary">
            Review submitted college identity cards, compare OCR data, approve verification access, or delete rejected records.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-200 animate-fade-in">
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
                  ? "Unable to connect to the backend server. Please verify network connectivity and retry."
                  : error.is403
                  ? "Administrator privileges required to access verification queue."
                  : "Please check your network connection and retry."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={syncVerifications}
            className="border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs shrink-0 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* KPI STAT STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border border-amber-500/30 shadow-soft space-y-1">
          <span className="text-xs font-mono text-text-muted flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Review
          </span>
          <p className="font-serif text-2xl font-semibold text-amber-400">{pendingCount}</p>
        </Card>

        <Card className="p-4 bg-surface border border-live/30 shadow-soft space-y-1">
          <span className="text-xs font-mono text-text-muted flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-live" /> Verified Accounts
          </span>
          <p className="font-serif text-2xl font-semibold text-live">{verifiedCount}</p>
        </Card>

        <Card className="p-4 bg-surface border border-danger/30 shadow-soft space-y-1">
          <span className="text-xs font-mono text-text-muted flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-danger" /> Rejected
          </span>
          <p className="font-serif text-2xl font-semibold text-danger">{rejectedCount}</p>
        </Card>

        <Card className="p-4 bg-surface border border-border shadow-soft space-y-1">
          <span className="text-xs font-mono text-text-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Total Submitted
          </span>
          <p className="font-serif text-2xl font-semibold text-cyan-400">{students.length}</p>
        </Card>
      </div>

      {/* SEARCH & BULK ACTIONS TOOLBAR */}
      <Card className="p-4 bg-surface border border-border shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <Input
              placeholder="Search by student name, roll number, college, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "PENDING_VERIFICATION", "VERIFIED", "REJECTED"].map((st) => (
              <Button
                key={st}
                variant={selectedStatus === st ? "teal-cyan" : "ghost"}
                size="sm"
                onClick={() => setSelectedStatus(st)}
                className="text-xs uppercase font-mono px-3 py-1"
              >
                {st.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* BULK ACTION BAR */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-surface-raised border border-cyan-400/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <span className="font-mono text-cyan-300 font-semibold">
              Selected ({selectedIds.length}) records:
            </span>
            <div className="flex items-center gap-2">
              <Button variant="teal-cyan" size="sm" onClick={handleBulkApprove} className="text-xs py-1">
                <CheckCheck className="w-3.5 h-3.5" /> Bulk Approve
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkRejectModalOpen(true)}
                className="text-xs py-1 text-amber-300 border-amber-400/40"
              >
                <XCircle className="w-3.5 h-3.5" /> Bulk Reject
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="text-xs py-1 text-danger hover:bg-danger-bg"
              >
                <Trash2 className="w-3.5 h-3.5" /> Bulk Delete Rejected
              </Button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* VERIFICATION QUEUE TABLE */}
      <Card className="bg-surface border border-border shadow-soft overflow-hidden">
        {filteredStudents.length === 0 ? (
          /* EMPTY STATE ILLUSTRATION */
          <div className="py-16 text-center space-y-4">
            <div className="w-20 h-20 bg-surface-raised border border-border rounded-full flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
              <FileCheck2 className="w-10 h-10 opacity-75" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-semibold text-text-primary">
                No ID Verification Records Found
              </h3>
              <p className="text-xs text-text-muted font-mono max-w-sm mx-auto">
                All submitted student college IDs match your criteria, or no pending registrations exist.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary border-collapse">
              <thead>
                <tr className="bg-surface-raised border-b border-border text-[11px] font-mono uppercase text-text-muted">
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredStudents.map((s) => s.id));
                        else setSelectedIds([]);
                      }}
                      className="rounded border-border text-cyan-400"
                    />
                  </th>
                  <th className="p-3.5">Student / Ref ID</th>
                  <th className="p-3.5">Institution & Domain</th>
                  <th className="p-3.5">Roll / Course</th>
                  <th className="p-3.5 whitespace-nowrap">Registration Date</th>
                  <th className="p-3.5 whitespace-nowrap">ID Card Preview</th>
                  <th className="p-3.5 whitespace-nowrap">Status</th>
                  <th className="p-3.5 text-right w-[280px] min-w-[280px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {filteredStudents.map((s) => {
                    const isNew = isRegistrationNew(s.registeredAt);
                    const domainMatch = validateCollegeDomainMatch(s.email, s.college);
                    const isSelected = selectedIds.includes(s.id);

                    return (
                      <motion.tr
                        key={s.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`hover:bg-surface-raised/60 transition-colors cursor-pointer ${
                          isSelected ? "bg-cyan-400/5" : ""
                        }`}
                        onClick={() => {
                          setSelectedStudent(s);
                          setIdZoom(1);
                          setPhotoZoom(1);
                          setActiveIdSide("front");
                          setIsRejecting(false);
                        }}
                      >
                        <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds((prev) => [...prev, s.id]);
                              else setSelectedIds((prev) => prev.filter((id) => id !== s.id));
                            }}
                            className="rounded border-border text-cyan-400"
                          />
                        </td>

                        <td className="p-3.5 max-w-[200px]" title={`${s.name} (${s.email})`}>
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold text-text-primary truncate">{s.name}</span>
                            {isNew && (
                              <Badge variant="accent" className="text-[9px] font-mono px-1.5 py-0.2 animate-pulse shrink-0">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-text-muted truncate">{s.email}</div>
                          <div className="text-[10px] font-mono text-cyan-400 mt-0.5 truncate">{s.id}</div>
                        </td>

                        <td className="p-3.5 max-w-[220px]" title={s.college}>
                          <div className="font-medium text-text-primary truncate">{s.college}</div>
                          {domainMatch.matches ? (
                            <span className="text-[10px] font-mono text-live flex items-center gap-1 truncate">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /> Domain Match
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 truncate">
                              ⚠️ Domain Mismatch
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 font-mono text-[11px] max-w-[150px]" title={`${s.rollNumber} - ${s.course} (${s.branch})`}>
                          <div className="text-text-primary font-semibold truncate">{s.rollNumber}</div>
                          <div className="text-text-muted text-[10px] truncate">{s.course} - {s.branch}</div>
                        </td>

                        <td className="p-3.5 font-mono text-[11px] text-text-muted whitespace-nowrap">
                          {new Date(s.registeredAt).toLocaleDateString()}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {s.idCardFrontUrl ? (
                            <img
                              src={s.idCardFrontUrl}
                              alt="ID Thumbnail"
                              className="w-14 h-9 rounded object-cover border border-border shadow-xs hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="text-[10px] text-text-muted font-mono italic">No ID uploaded</span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <Badge
                            variant={
                              s.verificationStatus === "Verified"
                                ? "active"
                                : s.verificationStatus === "Pending Verification" || s.verificationStatus === "Pending"
                                ? "medium"
                                : "blocked"
                            }
                            className="text-[10px] font-mono"
                          >
                            {s.verificationStatus}
                          </Badge>
                        </td>

                        <td className="p-3.5 text-right w-[280px] min-w-[280px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <RowActions>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(s);
                                setIdZoom(1);
                                setPhotoZoom(1);
                                setActiveIdSide("front");
                                setIsRejecting(false);
                              }}
                              className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/10 hover:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
                              title="Review ID & Verify"
                              aria-label="Review ID & Verify"
                            >
                              <Eye className="w-4 h-4 shrink-0" />
                              <span className="hidden lg:inline">Review ID & Verify</span>
                            </Button>

                            {/* Delete Account button for REJECTED accounts ONLY */}
                            {s.verificationStatus === "Rejected" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDelete(s)}
                                className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm border border-red-500/30 text-danger hover:bg-danger-bg/50 hover:border-red-400 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none transition-colors"
                                title="Delete Account"
                                aria-label="Delete rejected student account permanently"
                              >
                                <Trash2 className="w-4 h-4 shrink-0" />
                                <span className="hidden lg:inline">Delete Account</span>
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
      </Card>

      {/* PROFESSIONAL CENTERED VERIFICATION MODAL WITH DUAL ZOOMABLE VIEWERS */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedStudent && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="verification-modal-title"
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
            >
              {/* Backdrop dismiss */}
              <div
                className="fixed inset-0"
                onClick={() => {
                  setSelectedStudent(null);
                  setIsRejecting(false);
                }}
                aria-hidden="true"
              />

              {/* Centered Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="relative z-10 bg-surface border border-border w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden"
              >
                {/* Modal Header */}
                <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border bg-surface-raised flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 id="verification-modal-title" className="font-serif text-xl sm:text-2xl font-medium text-text-primary">
                          {selectedStudent.name}
                        </h2>
                        <Badge
                          variant={
                            selectedStudent.verificationStatus === "Verified"
                              ? "active"
                              : selectedStudent.verificationStatus === "Rejected"
                              ? "blocked"
                              : "medium"
                          }
                          className="font-mono text-xs uppercase"
                        >
                          {selectedStudent.verificationStatus}
                        </Badge>
                        {isRegistrationNew(selectedStudent.registeredAt) && (
                          <Badge variant="accent" className="text-[10px] font-mono">NEW</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted font-mono mt-0.5 flex-wrap">
                        <span>{selectedStudent.email}</span>
                        <span>•</span>
                        <span>{selectedStudent.college}</span>
                        <span>•</span>
                        <span>Roll: <span className="text-cyan-400 font-semibold">{selectedStudent.rollNumber}</span></span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(null);
                      setIsRejecting(false);
                    }}
                    className="text-text-muted hover:text-text-primary rounded-lg p-2"
                    aria-label="Close verification modal"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

                  {/* Rejection Notice Banner if already Rejected */}
                  {selectedStudent.verificationStatus === "Rejected" && selectedStudent.rejectionNotes && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-xs">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-red-300 block">
                          Current Status: Rejected ({selectedStudent.rejectionCategory || "Details Mismatch"})
                        </span>
                        <p className="text-red-200/90 font-mono mt-0.5">{selectedStudent.rejectionNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* DUAL VISUAL INSPECTION PANELS (ID CARD + STUDENT PHOTO) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scan className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono text-text-primary uppercase tracking-wider font-semibold">
                          Visual Evidence Inspection
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted font-mono hidden sm:inline">
                        Cross-check student facial likeness against uploaded college ID
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* PANEL 1: COLLEGE ID CARD */}
                      <div className="bg-surface-raised border border-border rounded-xl p-3 flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-medium text-text-primary font-mono">
                              College ID Card {selectedStudent.idCardBackUrl ? `(${activeIdSide.toUpperCase()})` : ""}
                            </span>
                            {selectedStudent.idCardBackUrl && (
                              <div className="inline-flex rounded-lg border border-border p-0.5 bg-surface text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setActiveIdSide("front")}
                                  className={`px-2 py-0.5 rounded ${activeIdSide === "front" ? "bg-cyan-500 text-black font-semibold" : "text-text-muted"}`}
                                >
                                  Front
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveIdSide("back")}
                                  className={`px-2 py-0.5 rounded ${activeIdSide === "back" ? "bg-cyan-500 text-black font-semibold" : "text-text-muted"}`}
                                >
                                  Back
                                </button>
                              </div>
                            )}
                          </div>

                          {/* ID Card Zoom Controls */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIdZoom((prev) => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100))}
                              className="text-xs p-1 h-7 w-7"
                              title="Zoom In ID Card"
                              aria-label="Zoom In ID Card"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIdZoom((prev) => Math.max(0.6, Math.round((prev - 0.25) * 100) / 100))}
                              className="text-xs p-1 h-7 w-7"
                              title="Zoom Out ID Card"
                              aria-label="Zoom Out ID Card"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIdZoom(1)}
                              className="text-[10px] font-mono h-7 px-1.5"
                              title="Reset ID Zoom"
                            >
                              {Math.round(idZoom * 100)}%
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const url = activeIdSide === "back" && selectedStudent.idCardBackUrl
                                  ? selectedStudent.idCardBackUrl
                                  : selectedStudent.idCardFrontUrl;
                                setLightboxImage({ url, title: `College ID Card - ${selectedStudent.name}` });
                                setLightboxZoom(1);
                              }}
                              className="text-xs p-1 h-7 w-7 text-cyan-400"
                              title="Fullscreen High-Res Lightbox"
                              aria-label="Fullscreen High-Res Lightbox"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* ID Card Image Canvas */}
                        <div className="border border-border/80 bg-black/90 rounded-lg overflow-hidden h-[260px] flex items-center justify-center p-2 relative">
                          {selectedStudent.idCardFrontUrl ? (
                            <div className="w-full h-full overflow-auto flex items-center justify-center custom-scrollbar cursor-zoom-in">
                              <img
                                src={
                                  activeIdSide === "back" && selectedStudent.idCardBackUrl
                                    ? selectedStudent.idCardBackUrl
                                    : selectedStudent.idCardFrontUrl
                                }
                                alt="Student College ID Card"
                                className="max-h-full max-w-full object-contain transition-transform duration-150 select-none"
                                style={{ transform: `scale(${idZoom})` }}
                              />
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-1 opacity-70" />
                              <p className="text-xs text-text-muted font-mono">No ID Card Image Provided</p>
                            </div>
                          )}
                          <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-white/10 pointer-events-none">
                            {Math.round(idZoom * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* PANEL 2: STUDENT REGISTERED PHOTO / SELFIE */}
                      <div className="bg-surface-raised border border-border rounded-xl p-3 flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-medium text-text-primary font-mono">
                              Student Photo / Selfie
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">
                              (Face Match)
                            </span>
                          </div>

                          {/* Student Photo Zoom Controls */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPhotoZoom((prev) => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100))}
                              className="text-xs p-1 h-7 w-7"
                              title="Zoom In Student Photo"
                              aria-label="Zoom In Student Photo"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPhotoZoom((prev) => Math.max(0.6, Math.round((prev - 0.25) * 100) / 100))}
                              className="text-xs p-1 h-7 w-7"
                              title="Zoom Out Student Photo"
                              aria-label="Zoom Out Student Photo"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPhotoZoom(1)}
                              className="text-[10px] font-mono h-7 px-1.5"
                              title="Reset Photo Zoom"
                            >
                              {Math.round(photoZoom * 100)}%
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const photoUrl = getStudentPhotoUrl(selectedStudent);
                                setLightboxImage({ url: photoUrl, title: `Student Photo - ${selectedStudent.name}` });
                                setLightboxZoom(1);
                              }}
                              className="text-xs p-1 h-7 w-7 text-purple-400"
                              title="Fullscreen High-Res Lightbox"
                              aria-label="Fullscreen High-Res Lightbox"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Student Photo Image Canvas */}
                        <div className="border border-border/80 bg-black/90 rounded-lg overflow-hidden h-[260px] flex items-center justify-center p-2 relative">
                          <div className="w-full h-full overflow-auto flex items-center justify-center custom-scrollbar cursor-zoom-in">
                            <img
                              src={getStudentPhotoUrl(selectedStudent)}
                              alt="Student Registered Photo"
                              className="max-h-full max-w-full object-contain rounded transition-transform duration-150 select-none"
                              style={{ transform: `scale(${photoZoom})` }}
                            />
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono text-purple-300 border border-white/10 pointer-events-none">
                            {Math.round(photoZoom * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE OCR & FORM DETAIL COMPARISON */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-text-muted uppercase font-semibold block">
                      Registration Details vs Document Verification
                    </span>
                    <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-2 text-xs font-mono">
                      <div className="grid grid-cols-12 border-b border-border pb-2 font-semibold text-text-muted">
                        <span className="col-span-3">Attribute</span>
                        <span className="col-span-5">Registration Form Value</span>
                        <span className="col-span-4 text-right">Verification Assessment</span>
                      </div>

                      <div className="grid grid-cols-12 border-b border-border/40 py-1.5 items-center">
                        <span className="col-span-3 text-text-muted">Full Name</span>
                        <span className="col-span-5 text-text-primary font-medium">{selectedStudent.name}</span>
                        <span className="col-span-4 text-right text-emerald-400 flex items-center justify-end gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Name Matches ID
                        </span>
                      </div>

                      <div className="grid grid-cols-12 border-b border-border/40 py-1.5 items-center">
                        <span className="col-span-3 text-text-muted">Roll / Reg Number</span>
                        <span className="col-span-5 text-text-primary font-medium">{selectedStudent.rollNumber}</span>
                        <span className="col-span-4 text-right text-cyan-400 flex items-center justify-end gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" /> ID Serial Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-12 border-b border-border/40 py-1.5 items-center">
                        <span className="col-span-3 text-text-muted">College & Campus</span>
                        <span className="col-span-5 text-text-primary font-medium">{selectedStudent.college}</span>
                        <span className="col-span-4 text-right">
                          {(() => {
                            const domainCheck = validateCollegeDomainMatch(selectedStudent.email, selectedStudent.college);
                            return domainCheck.matches ? (
                              <span className="text-emerald-400 flex items-center justify-end gap-1 font-semibold">
                                <Check className="w-3.5 h-3.5" /> Domain Match
                              </span>
                            ) : (
                              <span className="text-amber-400 flex items-center justify-end gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Custom Domain
                              </span>
                            );
                          })()}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 border-b border-border/40 py-1.5 items-center">
                        <span className="col-span-3 text-text-muted">Course / Branch</span>
                        <span className="col-span-5 text-text-primary font-medium">
                          {selectedStudent.course} {selectedStudent.branch ? `• ${selectedStudent.branch}` : ""}
                        </span>
                        <span className="col-span-4 text-right text-text-secondary">
                          {selectedStudent.yearSemester || selectedStudent.year}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 py-1.5 items-center">
                        <span className="col-span-3 text-text-muted">Student Email</span>
                        <span className="col-span-5 text-text-primary font-medium">{selectedStudent.email}</span>
                        <span className="col-span-4 text-right text-cyan-400 flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" /> Verified Valid
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* VERIFICATION AUDIT TRAIL */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-text-muted uppercase font-semibold block">
                      Verification Timeline & Governance Audit
                    </span>
                    <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                        <div>
                          <p className="font-semibold text-text-primary">Registration & ID Submission</p>
                          <p className="text-[11px] text-text-muted font-mono">
                            {new Date(selectedStudent.registeredAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                        <div>
                          <p className="font-semibold text-text-primary">Automated Image Canvas Quality</p>
                          <p className="text-[11px] text-text-muted font-mono">
                            Resolution check passed. Canvas dimensions and contrast optimal for review.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                            selectedStudent.verificationStatus === "Verified"
                              ? "bg-emerald-400"
                              : selectedStudent.verificationStatus === "Rejected"
                              ? "bg-red-400"
                              : "bg-amber-400"
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-text-primary">
                            Current Status: <span className="font-mono">{selectedStudent.verificationStatus}</span>
                          </p>
                          {selectedStudent.rejectionNotes && (
                            <p className="text-[11px] text-red-300 font-mono mt-0.5">
                              Note: {selectedStudent.rejectionNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* MODAL FOOTER ACTIONS */}
                <div className="p-4 sm:p-5 border-t border-border bg-surface-raised shrink-0">
                  {isRejecting ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-red-400 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> Specify Reason for Rejection
                        </span>
                        <span className="text-[11px] text-text-muted font-mono">
                          This note will be shown to the student upon login
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono text-text-secondary uppercase">
                          Rejection Category
                        </label>
                        <select
                          value={rejectionCategory}
                          onChange={(e) => setRejectionCategory(e.target.value)}
                          className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-red-400"
                        >
                          <option value="Details don't match ID card">Details don't match ID card</option>
                          <option value="Blurry or Unreadable ID Card">Blurry or Unreadable ID Card</option>
                          <option value="Expired or Invalid Student ID">Expired or Invalid Student ID</option>
                          <option value="Suspected Duplicate / Fake ID">Suspected Duplicate / Fake ID</option>
                          <option value="Photo/Selfie does not match ID card">Photo/Selfie does not match ID card</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono text-text-secondary uppercase">
                          Detailed Explanation for Student
                        </label>
                        <Input
                          placeholder="e.g. Uploaded photo is too blurry to read roll number..."
                          value={rejectionNotes}
                          onChange={(e) => setRejectionNotes(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsRejecting(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleConfirmReject(selectedStudent)}
                          className="text-xs flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Confirm Rejection
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(null);
                          setIsRejecting(false);
                        }}
                        className="text-xs text-text-muted hover:text-text-primary"
                      >
                        Close
                      </Button>

                      <div className="flex items-center gap-2">
                        {/* If Rejected: REJECT BUTTON DISAPPEARS! Only Approve & Verify AND Delete Account are visible! */}
                        {selectedStudent.verificationStatus === "Rejected" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(selectedStudent)}
                              className="text-xs py-2 px-3.5 text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-400 flex items-center gap-1.5"
                              title="Permanently Delete Account"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Account
                            </Button>

                            <Button
                              variant="teal-cyan"
                              size="sm"
                              onClick={() => handleApprove(selectedStudent)}
                              className="text-xs font-semibold py-2 px-4 flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-4 h-4" /> Approve & Verify
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* If Pending / other: Show Reject and Approve */}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setIsRejecting(true);
                                setRejectionNotes("The registration details do not match the uploaded college ID card.");
                              }}
                              className="text-xs py-2 px-3.5 flex items-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" /> Reject Verification...
                            </Button>

                            <Button
                              variant="teal-cyan"
                              size="sm"
                              onClick={() => handleApprove(selectedStudent)}
                              className="text-xs font-semibold py-2 px-4 flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-4 h-4" /> Approve & Verify
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {typeof document !== "undefined" && lightboxImage && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-lg flex flex-col p-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 text-white">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-sm font-semibold">{lightboxImage.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLightboxZoom((prev) => Math.min(4, Math.round((prev + 0.5) * 100) / 100))}
                className="text-xs p-1 h-8 w-8 text-white border-white/20"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLightboxZoom((prev) => Math.max(0.5, Math.round((prev - 0.5) * 100) / 100))}
                className="text-xs p-1 h-8 w-8 text-white border-white/20"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLightboxZoom(1)}
                className="text-xs font-mono h-8 px-2 text-white/80"
              >
                Reset ({Math.round(lightboxZoom * 100)}%)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLightboxImage(null)}
                className="text-white hover:text-red-400 h-8 w-8 p-1 ml-2"
                title="Close Lightbox (ESC)"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div
            className="flex-1 overflow-auto flex items-center justify-center p-4 custom-scrollbar select-none cursor-grab active:cursor-grabbing"
            onClick={() => {}}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-150 rounded-lg shadow-2xl"
              style={{ transform: `scale(${lightboxZoom})` }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* SHARED DELETE ACCOUNT CONFIRMATION DIALOG */}
      <DeleteAccountDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setStudentToDelete(null);
          setBulkStudentsToDelete([]);
        }}
        studentToDelete={studentToDelete}
        bulkStudentsToDelete={bulkStudentsToDelete}
        onSuccess={handleDeleteSuccess}
        currentAdminEmail={currentAdminEmail}
      />

      {/* BULK REJECT MODAL */}
      {bulkRejectModalOpen && (
        <Dialog
          isOpen={bulkRejectModalOpen}
          onClose={() => setBulkRejectModalOpen(false)}
          title={`Bulk Reject ${selectedIds.length} Verifications`}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setBulkRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmBulkReject} className="bg-danger">
                Confirm Bulk Reject
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Rejection Category</label>
              <select
                value={bulkRejectCategory}
                onChange={(e) => setBulkRejectCategory(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs font-mono text-text-primary focus:outline-none"
              >
                <option value="Unreadable ID Card">Unreadable ID Card</option>
                <option value="Details mismatch">Details mismatch</option>
                <option value="Expired ID Card">Expired ID Card</option>
              </select>
            </div>

            <Input
              label="Rejection Note for Students"
              value={bulkRejectNotes}
              onChange={(e) => setBulkRejectNotes(e.target.value)}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};
