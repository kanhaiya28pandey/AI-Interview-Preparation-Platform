import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { VerificationSubmission, validateCollegeDomainMatch } from "@/mocks/verifications";
import { verificationService } from "@/services/verificationService";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  RotateCw,
  X,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const AdminVerifications: React.FC = () => {
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Multi-select for bulk delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selected Submission for Review Modal
  const [selectedSub, setSelectedSub] = useState<VerificationSubmission | null>(null);
  const [rejectionCategory, setRejectionCategory] = useState<string>("Image unclear or low quality");
  const [rejectionNotes, setRejectionNotes] = useState<string>("");
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Deletion modals
  const [deleteTarget, setDeleteTarget] = useState<VerificationSubmission | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadSubmissions = () => {
    setIsLoading(true);
    verificationService.getAllSubmissions().then((data) => {
      setSubmissions(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      item.studentName.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.collegeName.toLowerCase().includes(query) ||
      item.rollNumber.toLowerCase().includes(query) ||
      item.verificationId.toLowerCase().includes(query);

    const matchesStatus =
      selectedStatus === "ALL"
        ? true
        : selectedStatus === "REJECTED"
        ? item.status === "Rejected"
        : selectedStatus === "VERIFIED"
        ? item.status === "Verified"
        : selectedStatus === "PENDING"
        ? item.status === "Pending Verification"
        : item.status.toUpperCase().replace(/\s+/g, "_") === selectedStatus;

    return matchesQuery && matchesStatus;
  });

  const pendingCount = submissions.filter((s) => s.status === "Pending Verification").length;
  const verifiedCount = submissions.filter((s) => s.status === "Verified").length;
  const rejectedCount = submissions.filter((s) => s.status === "Rejected").length;

  const handleApprove = async (verificationId: string) => {
    setIsReviewing(true);
    try {
      await verificationService.reviewVerification(verificationId, "APPROVE");
      toast.success("Student College ID verified successfully!");
      setSelectedSub(null);
      loadSubmissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve verification.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRejectConfirm = async (verificationId: string) => {
    if (!rejectionNotes.trim()) {
      toast.error("Please provide a brief explanation note for the student.");
      return;
    }

    setIsReviewing(true);
    try {
      await verificationService.reviewVerification(
        verificationId,
        "REJECT",
        rejectionCategory,
        rejectionNotes.trim()
      );
      toast.success("Verification request rejected.");
      setSelectedSub(null);
      setIsRejecting(false);
      loadSubmissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject verification.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await verificationService.deleteRejectedVerification(deleteTarget.verificationId);
      toast.success(`Deleted rejected profile for ${deleteTarget.studentName}`);
      setSubmissions((prev) => prev.filter((s) => s.verificationId !== deleteTarget.verificationId));
      if (selectedSub?.verificationId === deleteTarget.verificationId) {
        setSelectedSub(null);
      }
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.verificationId));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete rejected profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteBulk = async () => {
    const rejectedSelectedIds = selectedIds.filter((id) => {
      const item = submissions.find((s) => s.verificationId === id);
      return item && item.status === "Rejected";
    });

    if (rejectedSelectedIds.length === 0) {
      toast.error("No REJECTED profiles selected for deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      const count = await verificationService.deleteBulkRejectedVerifications(rejectedSelectedIds);
      toast.success(`Successfully deleted ${count} rejected profile(s).`);
      setSubmissions((prev) => prev.filter((s) => !rejectedSelectedIds.includes(s.verificationId)));
      setSelectedIds((prev) => prev.filter((id) => !rejectedSelectedIds.includes(id)));
      setShowBulkDeleteModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk delete rejected profiles.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedRejectedCount = selectedIds.filter((id) => {
    const item = submissions.find((s) => s.verificationId === id);
    return item && item.status === "Rejected";
  }).length;

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubmissions.map((s) => s.verificationId));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            Admin Governance
          </span>
          <h1 className="font-serif text-3xl font-medium text-text-primary">
            College ID Verifications
          </h1>
          <p className="text-xs text-text-secondary">
            Review student identity document submissions, manage verification statuses, and delete rejected accounts.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedRejectedCount > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBulkDeleteModal(true)}
              className="text-xs gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected Rejected ({selectedRejectedCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={loadSubmissions} className="text-xs shrink-0 gap-1.5">
            <RotateCw className="w-3.5 h-3.5" /> Refresh Queue
          </Button>
        </div>
      </div>

      {/* STAT STRIP */}
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
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Avg Review Time
          </span>
          <p className="font-serif text-2xl font-semibold text-cyan-400">1.8 hrs</p>
        </Card>
      </div>

      {/* FILTER & SEARCH */}
      <Card className="p-4 bg-surface border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <Input
            placeholder="Search student name, email, roll no, college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Filter Tabs Row: All, Pending, Approved, Rejected */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto font-mono">
          {[
            { key: "ALL", label: "All" },
            { key: "PENDING", label: "Pending" },
            { key: "VERIFIED", label: "Approved" },
            { key: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={selectedStatus === tab.key ? "teal-cyan" : "ghost"}
              size="sm"
              onClick={() => setSelectedStatus(tab.key)}
              className="text-xs uppercase px-3 py-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* SUBMISSIONS TABLE */}
      <Card className="bg-surface border border-border shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-text-muted">Loading verification queue...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted space-y-2">
            <p>No verification submissions match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary border-collapse">
              <thead>
                <tr className="bg-surface-raised border-b border-border text-[11px] font-mono uppercase text-text-muted">
                  <th className="p-3.5 w-10 text-center">
                    <button type="button" onClick={toggleSelectAll} className="p-1 hover:text-cyan-400">
                      {selectedIds.length > 0 && selectedIds.length === filteredSubmissions.length ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-text-muted" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Ref ID / Student</th>
                  <th className="p-3.5">Institution & Domain</th>
                  <th className="p-3.5">Roll / Course</th>
                  <th className="p-3.5">Submitted</th>
                  <th className="p-3.5">ID Card</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubmissions.map((sub) => {
                  const domainMatch = validateCollegeDomainMatch(sub.email, sub.collegeName);
                  const isSelected = selectedIds.includes(sub.verificationId);
                  const isRejected = sub.status === "Rejected";

                  return (
                    <tr
                      key={sub.verificationId}
                      className={`hover:bg-surface-raised/60 transition-colors cursor-pointer ${
                        isSelected ? "bg-cyan-400/5" : ""
                      }`}
                      onClick={() => {
                        setSelectedSub(sub);
                        setIsRejecting(false);
                      }}
                    >
                      <td className="p-3.5 text-center" onClick={(e) => toggleSelectRow(sub.verificationId, e)}>
                        <button type="button" className="p-1 hover:text-cyan-400">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4 text-text-muted" />
                          )}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-text-primary">{sub.studentName}</div>
                        <div className="text-[11px] font-mono text-cyan-400">{sub.verificationId}</div>
                        <div className="text-[10px] text-text-muted">{sub.email}</div>
                      </td>

                      <td className="p-3.5 max-w-[200px]">
                        <div className="font-medium text-text-primary truncate">{sub.collegeName}</div>
                        {domainMatch.matches ? (
                          <span className="text-[10px] font-mono text-live flex items-center gap-1">
                            ✓ Domain Match
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                            ⚠️ Domain Mismatch
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-[11px]">
                        <div className="text-text-primary">{sub.rollNumber}</div>
                        <div className="text-text-muted text-[10px]">{sub.courseBranch}</div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-text-muted">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5">
                        <img
                          src={sub.idCardFrontUrl}
                          alt="ID Thumbnail"
                          className="w-12 h-8 rounded object-cover border border-border"
                        />
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant={
                            sub.status === "Verified"
                              ? "active"
                              : sub.status === "Pending Verification"
                              ? "medium"
                              : "blocked"
                          }
                          className="text-[10px] font-mono"
                        >
                          {sub.status}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSub(sub);
                            setIsRejecting(false);
                          }}
                          className="text-xs"
                        >
                          Review <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete button shown strictly for REJECTED verifications */}
                        {isRejected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(sub)}
                            className="text-danger hover:bg-danger/10 p-1.5 h-auto"
                            title="Delete Rejected Profile"
                          >
                            <Trash2 className="w-4 h-4 text-danger" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* REVIEW SLIDE-OVER / MODAL */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 uppercase">Review Submission</span>
                    <Badge variant={selectedSub.status === "Verified" ? "active" : selectedSub.status === "Pending Verification" ? "medium" : "blocked"}>
                      {selectedSub.status}
                    </Badge>
                  </div>
                  <h2 className="font-serif text-2xl font-medium text-text-primary">
                    {selectedSub.studentName} &bull; {selectedSub.verificationId}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSub.status === "Rejected" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget(selectedSub)}
                      className="text-xs gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Profile
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSub(null)} className="text-text-muted">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Side by side view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: ID Card Image Display */}
                <div className="space-y-3">
                  <span className="text-xs font-mono text-text-muted block uppercase font-semibold">
                    Submitted ID Document
                  </span>
                  <div className="border border-border bg-black rounded-xl overflow-hidden min-h-[260px] flex items-center justify-center">
                    <img
                      src={selectedSub.idCardFrontUrl}
                      alt="Full ID Card"
                      className="max-h-[350px] w-full object-contain"
                    />
                  </div>

                  {selectedSub.selfieUrl && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[11px] font-mono text-text-muted block">Selfie Photo with ID:</span>
                      <img
                        src={selectedSub.selfieUrl}
                        alt="Selfie"
                        className="w-20 h-20 rounded-full object-cover border border-cyan-400/40"
                      />
                    </div>
                  )}
                </div>

                {/* Right: Details Comparison & Approval Actions */}
                <div className="space-y-4 text-xs">
                  <span className="text-xs font-mono text-text-muted block uppercase font-semibold">
                    Student Details Verification
                  </span>

                  <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-2.5 font-sans">
                    <div className="flex justify-between border-b border-border pb-1.5">
                      <span className="text-text-muted">Full Name:</span>
                      <span className="font-semibold text-text-primary">{selectedSub.studentName}</span>
                    </div>

                    <div className="flex justify-between border-b border-border pb-1.5">
                      <span className="text-text-muted">Email Address:</span>
                      <span className="font-mono text-text-primary">{selectedSub.email}</span>
                    </div>

                    <div className="flex justify-between border-b border-border pb-1.5">
                      <span className="text-text-muted">College / Institution:</span>
                      <span className="font-semibold text-text-primary text-right max-w-[200px]">{selectedSub.collegeName}</span>
                    </div>

                    <div className="flex justify-between border-b border-border pb-1.5 font-mono">
                      <span className="text-text-muted">Roll / Reg Number:</span>
                      <span className="text-cyan-400 font-semibold">{selectedSub.rollNumber}</span>
                    </div>

                    <div className="flex justify-between border-b border-border pb-1.5">
                      <span className="text-text-muted">Course / Branch:</span>
                      <span className="text-text-primary">{selectedSub.courseBranch}</span>
                    </div>

                    <div className="flex justify-between pb-1">
                      <span className="text-text-muted">Year / Semester:</span>
                      <span className="text-text-primary">{selectedSub.yearSemester}</span>
                    </div>
                  </div>

                  {/* Domain Match Analysis Pill */}
                  {validateCollegeDomainMatch(selectedSub.email, selectedSub.collegeName).matches ? (
                    <div className="p-3 bg-live/10 border border-live/30 rounded-xl text-live text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Email domain matches official institution record ({selectedSub.email}).</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Email domain does not match college name. Visual comparison recommended.</span>
                    </div>
                  )}

                  {/* Rejection Form controls */}
                  {isRejecting ? (
                    <div className="p-4 bg-danger-bg border border-danger/40 rounded-xl space-y-3">
                      <span className="font-semibold text-danger text-xs block">Select Rejection Reason</span>

                      <select
                        value={rejectionCategory}
                        onChange={(e) => setRejectionCategory(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      >
                        <option value="Image unclear or low quality">Image unclear or low quality</option>
                        <option value="Details don't match ID card">Details don't match ID card</option>
                        <option value="Not a valid college ID">Not a valid college ID</option>
                        <option value="Suspected duplicate/fake document">Suspected duplicate/fake document</option>
                        <option value="Other">Other</option>
                      </select>

                      <textarea
                        placeholder="Provide clear notes to student explaining why ID was rejected..."
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
                      />

                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1 text-xs"
                          isLoading={isReviewing}
                          onClick={() => handleRejectConfirm(selectedSub.verificationId)}
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsRejecting(false)}
                          className="text-xs text-text-muted"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="teal-cyan"
                        className="flex-1 py-2.5 text-xs font-semibold"
                        isLoading={isReviewing}
                        onClick={() => handleApprove(selectedSub.verificationId)}
                      >
                        <ShieldCheck className="w-4 h-4" /> Approve & Verify Access
                      </Button>
                      <Button
                        variant="danger"
                        className="py-2.5 text-xs"
                        onClick={() => {
                          setIsRejecting(true);
                          setRejectionNotes("The registration number on the ID card is blurred and unreadable. Please upload a clear photo.");
                        }}
                      >
                        Reject...
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <Dialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Rejected Profile"
          description={`Verification ID: ${deleteTarget.verificationId}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-xs text-text-primary space-y-2">
              <p className="font-semibold text-danger flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                Permanent Deletion Warning
              </p>
              <p className="leading-relaxed">
                Delete this rejected profile? This permanently removes the student's account data, uploaded ID images and verification record. This cannot be undone.
              </p>
              <div className="pt-2 font-mono text-[11px] text-text-secondary border-t border-border">
                Student: <span className="text-text-primary font-semibold">{deleteTarget.studentName}</span> ({deleteTarget.email})
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSingle}
                isLoading={isDeleting}
                className="gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Permanently
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* BULK DELETE CONFIRMATION DIALOG */}
      {showBulkDeleteModal && (
        <Dialog
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          title="Delete Selected Rejected Profiles"
          description={`${selectedRejectedCount} rejected profile(s) selected`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-xs text-text-primary space-y-2">
              <p className="font-semibold text-danger flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                Bulk Permanent Deletion Warning
              </p>
              <p className="leading-relaxed">
                Delete these {selectedRejectedCount} rejected profile(s)? This permanently removes the students' account data, uploaded ID images and verification records. This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteBulk}
                isLoading={isDeleting}
                className="gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete {selectedRejectedCount} Rejected Profile(s)
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
