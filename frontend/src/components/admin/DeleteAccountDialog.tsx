import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { MasterStudent, useAdminStore } from "@/context/AdminStoreContext";
import { useAuth } from "@/context/AuthContext";
import {
  AlertTriangle,
  ShieldAlert,
  Trash2,
  UserX,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
} from "lucide-react";
import { toast } from "sonner";

export function isAccountProtected(
  student?: Partial<MasterStudent> | null,
  currentAuthEmail?: string
): boolean {
  if (!student) return false;

  if (student.role === "ADMIN") return true;

  const email = (student.email || "").toLowerCase();
  const name = (student.name || "").toLowerCase();

  if (
    email === "admin@aiprep.com" ||
    email === "kanhaiya.pandey@admin.aiprep.com" ||
    name.includes("administrator") ||
    student.id === "usr-admin-01" ||
    student.userId === "usr-admin-01"
  ) {
    return true;
  }

  if (currentAuthEmail && email === currentAuthEmail.toLowerCase()) {
    return true;
  }

  return false;
}

export function getAccountProtectionReason(
  student?: Partial<MasterStudent> | null,
  currentAuthEmail?: string
): string | null {
  if (!student) return null;

  if (student.role === "ADMIN") {
    return "Admin accounts cannot be deleted.";
  }

  const email = (student.email || "").toLowerCase();
  const name = (student.name || "").toLowerCase();

  if (
    email === "admin@aiprep.com" ||
    email === "kanhaiya.pandey@admin.aiprep.com" ||
    name.includes("administrator") ||
    student.id === "usr-admin-01" ||
    student.userId === "usr-admin-01"
  ) {
    return "Seeded system admin accounts are permanently protected.";
  }

  if (currentAuthEmail && email === currentAuthEmail.toLowerCase()) {
    return "You cannot delete your own logged-in account.";
  }

  return null;
}

export function hasStudentActivity(student?: Partial<MasterStudent> | null): boolean {
  if (!student) return false;
  return (
    (student.activityScore ?? 0) > 0 ||
    (student.problemsSolved ?? 0) > 0 ||
    (student.interviewsCompleted ?? 0) > 0 ||
    (student.streakDays ?? 0) > 0 ||
    student.verificationStatus === "Verified"
  );
}

export interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentToDelete?: MasterStudent | null;
  student?: MasterStudent | null;
  bulkStudentsToDelete?: MasterStudent[];
  students?: MasterStudent[];
  isBulk?: boolean;
  onSuccess?: (deletedList: MasterStudent[]) => void;
  onConfirmDelete?: () => Promise<void> | void;
  onDeactivateInstead?: () => Promise<void> | void;
  isLoading?: boolean;
  bulkProgress?: { current: number; total: number } | null;
  currentAdminEmail?: string;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  isOpen,
  onClose,
  studentToDelete,
  student,
  bulkStudentsToDelete = [],
  students = [],
  isBulk = false,
  onSuccess,
  onConfirmDelete,
  onDeactivateInstead,
  isLoading = false,
  bulkProgress: externalBulkProgress = null,
  currentAdminEmail,
}) => {
  const { user } = useAuth();
  const { deleteStudent, bulkDeleteStudents, deactivateStudent, addAuditLog } = useAdminStore();

  const [confirmInput, setConfirmInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalProgress, setInternalProgress] = useState<{ current: number; total: number } | null>(null);

  const effectiveAdminEmail = currentAdminEmail || user?.email || "admin@aiprep.com";

  useEffect(() => {
    if (isOpen) {
      setConfirmInput("");
      setIsSubmitting(false);
      setInternalProgress(null);
    }
  }, [isOpen]);

  const singleTarget = studentToDelete || student;
  const listTarget = bulkStudentsToDelete.length > 0 ? bulkStudentsToDelete : students;

  const isMultiple = isBulk || listTarget.length > 1;
  const targetStudent = isMultiple ? null : singleTarget || (listTarget.length === 1 ? listTarget[0] : null);

  // Check protection
  const isSingleProtected = targetStudent ? isAccountProtected(targetStudent, effectiveAdminEmail) : false;
  const singleProtectionReason = targetStudent ? getAccountProtectionReason(targetStudent, effectiveAdminEmail) : null;

  // Filter out protected accounts for bulk operations
  const eligibleStudents = isMultiple
    ? listTarget.filter((s) => !isAccountProtected(s, effectiveAdminEmail))
    : targetStudent && !isSingleProtected
    ? [targetStudent]
    : [];

  const protectedCount = isMultiple ? listTarget.length - eligibleStudents.length : 0;
  const hasActivity = targetStudent ? hasStudentActivity(targetStudent) : eligibleStudents.some(hasStudentActivity);

  // Required confirmation string
  const requiredConfirmText = isMultiple
    ? "DELETE"
    : targetStudent?.email || "DELETE";

  const isConfirmed =
    confirmInput.trim().toLowerCase() === requiredConfirmText.trim().toLowerCase() ||
    confirmInput.trim().toUpperCase() === "DELETE";

  const handleConfirm = async () => {
    if (!isConfirmed || isSubmitting || isSingleProtected || eligibleStudents.length === 0) return;
    setIsSubmitting(true);

    try {
      if (onConfirmDelete) {
        await onConfirmDelete();
      } else {
        // Concurrency-limited deletion
        const total = eligibleStudents.length;
        const deletedResults: MasterStudent[] = [];
        const failedResults: { student: MasterStudent; error: string }[] = [];

        const concurrency = 3;
        for (let i = 0; i < total; i += concurrency) {
          const batch = eligibleStudents.slice(i, i + concurrency);
          await Promise.all(
            batch.map(async (st) => {
              try {
                deleteStudent(st.id);
                deletedResults.push(st);
              } catch (err: any) {
                failedResults.push({ student: st, error: err?.message || "Failed to delete" });
              }
            })
          );
          setInternalProgress({ current: Math.min(total, i + batch.length), total });
          // small tick for UI smoothness
          await new Promise((res) => setTimeout(res, 80));
        }

        // Add to audit trail
        addAuditLog({
          action: total > 1 ? "BULK_DELETE_STUDENTS" : "DELETE_STUDENT",
          adminName: user?.name || "Platform Administrator",
          adminEmail: effectiveAdminEmail,
          targetCount: deletedResults.length,
          targets: deletedResults.map((s) => `${s.name} (${s.email})`),
          details: `Permanently removed ${deletedResults.length} account(s).${
            failedResults.length > 0 ? ` ${failedResults.length} failed.` : ""
          }`,
        });

        if (failedResults.length > 0) {
          toast.warning(`${deletedResults.length} deleted, ${failedResults.length} failed.`);
        }

        if (onSuccess) {
          onSuccess(deletedResults);
        }
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "An error occurred during account deletion.");
    } finally {
      setIsSubmitting(false);
      setInternalProgress(null);
    }
  };

  const handleDeactivate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (onDeactivateInstead) {
        await onDeactivateInstead();
      } else if (targetStudent) {
        deactivateStudent(targetStudent.id);
        toast.success(`Account for ${targetStudent.name} deactivated.`);
      } else if (eligibleStudents.length > 0) {
        eligibleStudents.forEach((s) => deactivateStudent(s.id));
        toast.success(`Deactivated ${eligibleStudents.length} accounts.`);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const progress = externalBulkProgress || internalProgress;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting && !isLoading) onClose();
      }}
      title={
        isMultiple
          ? `Permanently Delete ${eligibleStudents.length} Accounts`
          : `Delete Account: ${targetStudent?.name || "Student"}`
      }
      description="This action is destructive and cannot be undone after the retention grace period."
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-4">
        {/* Protected Account Warning */}
        {isSingleProtected && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              Protected Account
            </div>
            <p className="text-xs text-red-300/90 leading-relaxed">
              {singleProtectionReason || "This account is protected by system security rules and cannot be deleted."}
            </p>
            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs border-border">
                Close
              </Button>
            </div>
          </div>
        )}

        {!isSingleProtected && (
          <>
            {/* Multiple selection with skipped accounts note */}
            {isMultiple && protectedCount > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>{protectedCount} protected account(s)</strong> were automatically skipped and will remain intact.
                </span>
              </div>
            )}

            {/* Target Summary Card */}
            {!isMultiple && targetStudent && (
              <div className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <span className="font-bold text-text-primary text-sm block">{targetStudent.name}</span>
                    <span className="text-text-muted font-mono text-[11px]">{targetStudent.email}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface border border-border text-cyan-300">
                    {targetStudent.verificationStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-text-secondary font-mono">
                  <div>Roll No: <span className="text-text-primary font-sans">{targetStudent.rollNumber || "N/A"}</span></div>
                  <div>College: <span className="text-text-primary font-sans truncate">{targetStudent.college}</span></div>
                  <div>Activity Score: <span className="text-cyan-400">{targetStudent.activityScore || 0}%</span></div>
                  <div>Solved Problems: <span className="text-text-primary font-sans">{targetStudent.problemsSolved || 0}</span></div>
                </div>
              </div>
            )}

            {/* Strong Warning for Active / Verified Data */}
            {hasActivity && (
              <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Warning: Student Has Recorded Activity Data
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  This candidate has submissions, scores, and verified placement records. Permanently deleting will wipe out all interview recordings, coding solutions, resume analyses, and credentials.
                </p>
              </div>
            )}

            {/* What will be removed list */}
            <div className="space-y-1.5 text-xs text-text-muted">
              <span className="font-semibold text-text-secondary text-[11px] uppercase tracking-wider block">
                The following data will be permanently removed:
              </span>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-text-muted">
                <li>Authentication profile & student credentials</li>
                <li>Uploaded College ID cards & verification records</li>
                <li>Quiz answers, coding solutions & mock interview transcripts</li>
                <li>Campus leaderboard score and streak history</li>
              </ul>
            </div>

            {/* Progress bar for bulk operation */}
            {(isLoading || isSubmitting || progress) && (
              <div className="space-y-2 p-3 bg-surface-raised border border-border rounded-xl">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">Deleting candidate accounts...</span>
                  <span className="text-cyan-400 font-bold">
                    {progress ? `${progress.current} / ${progress.total}` : "Processing..."}
                  </span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-danger transition-all duration-300"
                    style={{
                      width: progress
                        ? `${Math.round((progress.current / Math.max(1, progress.total)) * 100)}%`
                        : "75%",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Confirmation Typing Input */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="block text-xs font-medium text-text-secondary">
                To confirm, type <strong className="text-text-primary font-mono select-all font-bold">{requiredConfirmText}</strong> below:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={`Type "${requiredConfirmText}" to confirm`}
                disabled={isLoading || isSubmitting}
                className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 font-mono"
                autoFocus
              />
            </div>

            {/* Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
              {/* Deactivate Instead Option */}
              {hasActivity ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeactivate}
                  disabled={isLoading || isSubmitting}
                  className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 flex items-center gap-1.5"
                  title="Deactivate login access without deleting student records"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Deactivate instead
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading || isSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirm}
                  disabled={!isConfirmed || isLoading || isSubmitting || eligibleStudents.length === 0}
                  isLoading={isLoading || isSubmitting}
                  className="text-xs bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-red-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  {isMultiple
                    ? `Delete ${eligibleStudents.length} Accounts Permanently`
                    : "Delete permanently"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};
