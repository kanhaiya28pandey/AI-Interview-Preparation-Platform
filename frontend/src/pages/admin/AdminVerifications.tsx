import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useAdminStore, MasterStudent, isRegistrationNew } from "@/context/AdminStoreContext";
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
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const AdminVerifications: React.FC = () => {
  const {
    students,
    approveVerification,
    rejectVerification,
    deleteStudent,
    bulkApproveVerifications,
    bulkRejectVerifications,
    bulkDeleteStudents,
  } = useAdminStore();

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

  // Drawer Detail State
  const [selectedStudent, setSelectedStudent] = useState<MasterStudent | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState("Details don't match ID card");
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Delete Rejected Account Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<MasterStudent | null>(null);
  const [confirmInput, setConfirmInput] = useState("");

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
    setSelectedStudent(null);
  };

  // Single Reject
  const handleConfirmReject = (student: MasterStudent) => {
    if (!rejectionNotes.trim()) {
      toast.error("Please enter a note explaining the rejection reason.");
      return;
    }
    rejectVerification(student.id, rejectionCategory, rejectionNotes.trim());
    toast.error(`Verification request for ${student.name} rejected.`);
    setSelectedStudent(null);
    setIsRejecting(false);
  };

  // Open Single Delete Modal (REJECTED ONLY)
  const handleOpenDelete = (student: MasterStudent) => {
    if (student.verificationStatus !== "Rejected") {
      toast.error("Account deletion from this panel is only permitted for REJECTED accounts.");
      return;
    }
    setStudentToDelete(student);
    setConfirmInput("");
    setDeleteModalOpen(true);
  };

  // Confirm Single Delete
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const targetText = studentToDelete.rollNumber || studentToDelete.name;
    if (confirmInput.trim().toLowerCase() !== targetText.trim().toLowerCase()) {
      toast.error(`Please type "${targetText}" exactly to confirm deletion.`);
      return;
    }

    deleteStudent(studentToDelete.id);
    toast.success(`Account for ${studentToDelete.name} has been permanently deleted.`);
    setDeleteModalOpen(false);
    if (selectedStudent?.id === studentToDelete.id) {
      setSelectedStudent(null);
    }
    setStudentToDelete(null);
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
    if (selectedIds.length === 0) return;
    const rejectedSelected = students.filter((s) => selectedIds.includes(s.id) && s.verificationStatus === "Rejected");
    if (rejectedSelected.length === 0) {
      toast.error("Bulk delete requires selecting at least one REJECTED account.");
      return;
    }

    if (window.confirm(`Permanently delete ${rejectedSelected.length} selected REJECTED accounts?`)) {
      bulkDeleteStudents(rejectedSelected.map((s) => s.id));
      toast.success(`Bulk deleted ${rejectedSelected.length} rejected accounts.`);
      setSelectedIds([]);
    }
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
                  ? "Backend service at http://localhost:8080 is unreachable. Verify that backend is running with ./mvnw.cmd spring-boot:run"
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
                  <th className="p-3.5">Registration Date</th>
                  <th className="p-3.5">ID Card Preview</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
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
                          setZoomLevel(1);
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

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary">{s.name}</span>
                            {isNew && (
                              <Badge variant="accent" className="text-[9px] font-mono px-1.5 py-0.2 animate-pulse">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-text-muted">{s.email}</div>
                          <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{s.id}</div>
                        </td>

                        <td className="p-3.5 max-w-[220px]">
                          <div className="font-medium text-text-primary truncate">{s.college}</div>
                          {domainMatch.matches ? (
                            <span className="text-[10px] font-mono text-live flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Domain Match
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                              ⚠️ Domain Mismatch
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 font-mono text-[11px]">
                          <div className="text-text-primary font-semibold">{s.rollNumber}</div>
                          <div className="text-text-muted text-[10px]">{s.course} - {s.branch}</div>
                        </td>

                        <td className="p-3.5 font-mono text-[11px] text-text-muted">
                          {new Date(s.registeredAt).toLocaleDateString()}
                        </td>

                        <td className="p-3.5">
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

                        <td className="p-3.5">
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

                        <td className="p-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(s);
                              setZoomLevel(1);
                              setIsRejecting(false);
                            }}
                            className="text-xs h-7 px-2 text-cyan-400 border-cyan-400/30"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail Drawer
                          </Button>

                          {/* Delete Account button for REJECTED accounts ONLY */}
                          {s.verificationStatus === "Rejected" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(s)}
                              className="text-xs h-7 px-2 text-danger hover:bg-danger-bg/50"
                              title="Delete rejected student account permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Account
                            </Button>
                          )}
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

      {/* DETAIL DRAWER / SLIDE-OVER WITH ZOOMABLE ID & TIMELINE */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-surface border-l border-border w-full max-w-3xl h-full overflow-y-auto shadow-2xl p-6 space-y-6 flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 uppercase">Verification Detail Drawer</span>
                      <Badge variant={selectedStudent.verificationStatus === "Verified" ? "active" : selectedStudent.verificationStatus === "Rejected" ? "blocked" : "medium"}>
                        {selectedStudent.verificationStatus}
                      </Badge>
                      {isRegistrationNew(selectedStudent.registeredAt) && (
                        <Badge variant="accent" className="text-[9px] font-mono">NEW</Badge>
                      )}
                    </div>
                    <h2 className="font-serif text-2xl font-medium text-text-primary mt-1">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-xs text-text-muted font-mono">{selectedStudent.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)} className="text-text-muted">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* ZOOMABLE ID CARD DISPLAY */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-text-muted uppercase font-semibold">
                      Uploaded ID Image (Zoomable)
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.25))}
                        className="text-xs p-1 h-7"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.25))}
                        className="text-xs p-1 h-7"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoomLevel(1)}
                        className="text-[11px] font-mono h-7 px-2"
                      >
                        Reset ({Math.round(zoomLevel * 100)}%)
                      </Button>
                    </div>
                  </div>

                  <div className="border border-border bg-black rounded-xl overflow-hidden min-h-[220px] max-h-[300px] flex items-center justify-center p-2 relative">
                    {selectedStudent.idCardFrontUrl ? (
                      <img
                        src={selectedStudent.idCardFrontUrl}
                        alt="ID Card"
                        className="max-h-[280px] w-full object-contain transition-transform duration-200"
                        style={{ transform: `scale(${zoomLevel})` }}
                      />
                    ) : (
                      <p className="text-xs text-text-muted font-mono">No ID Card Image Provided</p>
                    )}
                  </div>
                </div>

                {/* SIDE-BY-SIDE COMPARISON TABLE */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-text-muted uppercase font-semibold block">
                    Side-by-Side Detail Comparison
                  </span>
                  <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-2 border-b border-border pb-1 font-semibold text-text-muted">
                      <span>Entered Form Detail</span>
                      <span>Verified ID Read</span>
                    </div>

                    <div className="grid grid-cols-2 border-b border-border/50 pb-1">
                      <span className="text-text-primary">{selectedStudent.name}</span>
                      <span className="text-cyan-400">Match✓</span>
                    </div>

                    <div className="grid grid-cols-2 border-b border-border/50 pb-1">
                      <span className="text-text-primary">{selectedStudent.rollNumber}</span>
                      <span className="text-cyan-400">{selectedStudent.rollNumber}</span>
                    </div>

                    <div className="grid grid-cols-2 border-b border-border/50 pb-1">
                      <span className="text-text-primary">{selectedStudent.college}</span>
                      <span className="text-cyan-400">Match✓</span>
                    </div>

                    <div className="grid grid-cols-2">
                      <span className="text-text-primary">{selectedStudent.course} ({selectedStudent.branch})</span>
                      <span className="text-cyan-400">{selectedStudent.yearSemester}</span>
                    </div>
                  </div>
                </div>

                {/* VERIFICATION TIMELINE */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-text-muted uppercase font-semibold block">
                    Verification History Timeline
                  </span>
                  <div className="pl-4 border-l-2 border-cyan-400/40 space-y-3 text-xs">
                    <div className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -left-[21px] top-1" />
                      <p className="font-semibold text-text-primary">Student Account Created</p>
                      <p className="text-[11px] text-text-muted font-mono">{new Date(selectedStudent.registeredAt).toLocaleString()}</p>
                    </div>

                    <div className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -left-[21px] top-1" />
                      <p className="font-semibold text-text-primary">ID Document Canvas Quality Passed</p>
                      <p className="text-[11px] text-text-muted font-mono">Resolution & Canvas Sharpness Check OK</p>
                    </div>

                    <div className="relative">
                      <span className={`w-2.5 h-2.5 rounded-full absolute -left-[21px] top-1 ${selectedStudent.verificationStatus === "Verified" ? "bg-live" : selectedStudent.verificationStatus === "Rejected" ? "bg-danger" : "bg-amber-400"}`} />
                      <p className="font-semibold text-text-primary">Current Verification Status: {selectedStudent.verificationStatus}</p>
                      {selectedStudent.rejectionNotes && (
                        <p className="text-[11px] text-danger font-mono mt-0.5">{selectedStudent.rejectionNotes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-border space-y-3">
                {isRejecting ? (
                  <div className="p-3 bg-danger-bg border border-danger/40 rounded-xl space-y-3">
                    <span className="font-semibold text-danger text-xs block">Rejection Options</span>
                    <select
                      value={rejectionCategory}
                      onChange={(e) => setRejectionCategory(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none"
                    >
                      <option value="Details don't match ID card">Details don't match ID card</option>
                      <option value="Blurry or Unreadable ID Card">Blurry or Unreadable ID Card</option>
                      <option value="Expired or Invalid Student ID">Expired or Invalid Student ID</option>
                      <option value="Suspected Duplicate / Fake ID">Suspected Duplicate / Fake ID</option>
                    </select>

                    <Input
                      label="Rejection Explanation Note"
                      placeholder="e.g. Uploaded photo is too blurry to read roll number..."
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleConfirmReject(selectedStudent)}
                        className="flex-1 text-xs"
                      >
                        Confirm Rejection
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsRejecting(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="teal-cyan"
                      size="sm"
                      onClick={() => handleApprove(selectedStudent)}
                      className="flex-1 text-xs font-semibold py-2.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Approve & Verify
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setIsRejecting(true);
                        setRejectionNotes("The registration details do not match the uploaded college ID card.");
                      }}
                      className="text-xs py-2.5"
                    >
                      Reject...
                    </Button>

                    {selectedStudent.verificationStatus === "Rejected" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(selectedStudent)}
                        className="text-xs py-2.5 text-danger hover:bg-danger-bg"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Account
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE REJECTED ACCOUNT CONFIRMATION MODAL */}
      {deleteModalOpen && studentToDelete && (
        <Dialog
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={`Permanently Delete Account: ${studentToDelete.name}`}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmDelete} className="bg-danger hover:bg-danger/80">
                <Trash2 className="w-4 h-4" /> Permanently Remove Account
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-danger-bg border border-danger/40 rounded-xl text-danger text-xs space-y-1">
              <span className="font-semibold block">⚠️ Permanent Removal Warning</span>
              <p className="text-[11px] leading-relaxed">
                This account has been <strong>REJECTED</strong>. Deleting it will permanently remove all profile records, roll number ({studentToDelete.rollNumber}), and uploaded ID files from the platform database.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary block">
                Type <strong className="text-text-primary font-mono">{studentToDelete.rollNumber || studentToDelete.name}</strong> to confirm:
              </label>
              <Input
                type="text"
                placeholder={studentToDelete.rollNumber || studentToDelete.name}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
              />
            </div>
          </div>
        </Dialog>
      )}

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
