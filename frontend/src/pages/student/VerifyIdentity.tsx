import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  suggestCollegeFromEmail,
  VerificationStatus,
  VerificationSubmission,
} from "@/mocks/verifications";
import { verificationService } from "@/services/verificationService";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { CollegeIdUploader, CollegeIdData } from "@/components/verification/CollegeIdUploader";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export const VerifyIdentity: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { status, submission: currentSubmission, isLoading: isLoadingStatus, refresh } = useVerificationStatus();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  // Form Pre-fill State
  const [collegeName, setCollegeName] = useState<string>("");
  const [rollNumber, setRollNumber] = useState<string>("");
  const [courseBranch, setCourseBranch] = useState<string>("B.Tech Computer Science");
  const [yearSemester, setYearSemester] = useState<string>("Year 3 / Sem 5-6");

  useEffect(() => {
    if (!user) return;
    if (currentSubmission) {
      setCollegeName(currentSubmission.collegeName);
      setRollNumber(currentSubmission.rollNumber);
      setCourseBranch(currentSubmission.courseBranch);
      setYearSemester(currentSubmission.yearSemester);
    } else {
      const suggested = suggestCollegeFromEmail(user.email);
      if (suggested) {
        setCollegeName(suggested);
      }
    }
  }, [user, currentSubmission]);

  const handleVerificationSubmit = async (data: CollegeIdData) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      await verificationService.submitVerification({
        userId: user.userId,
        studentName: data.nameOnId || user.name || "Student User",
        email: user.email,
        collegeName: data.collegeNameOnId || collegeName.trim(),
        rollNumber: data.rollNumberOnId || rollNumber.trim(),
        courseBranch: courseBranch.trim(),
        yearSemester,
        idCardFrontUrl:
          data.idFrontPreview ||
          "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
        selfieUrl: data.selfiePreview || undefined,
      });

      await refresh();
      toast.success("College ID submitted successfully for review!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit verification request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="p-8 text-center text-xs font-mono text-text-muted">
        Loading verification status...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold">
              Student Eligibility Check
            </span>
            <Badge
              variant={
                status === "Verified"
                  ? "active"
                  : status === "Pending Verification"
                  ? "medium"
                  : status === "Rejected"
                  ? "blocked"
                  : "accent"
              }
              className="text-[10px] font-mono"
            >
              {status}
            </Badge>
          </div>
          <h1 className="font-serif text-3xl font-medium text-text-primary">
            College ID Verification
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Verify your student enrollment to unlock full access to AI Mock Interviews, Live Coding Arena, and Leaderboards.
          </p>
        </div>

        {status === "Verified" && (
          <div className="px-4 py-2 bg-live/10 border border-live/30 text-live rounded-xl flex items-center gap-2 text-xs font-semibold shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Student Account</span>
          </div>
        )}
      </div>

      {/* STATUS OVERVIEW PANELS */}
      {status === "Verified" && (
        <Card className="p-8 bg-surface border border-live/30 shadow-soft text-center space-y-4 rounded-2xl">
          <div className="w-16 h-16 bg-live/20 text-live rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-text-primary">
              Identity & Student Status Verified
            </h2>
            <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
              Your college enrollment at <strong>{currentSubmission?.collegeName || "your institution"}</strong> has been reviewed and verified. All platform features are unlocked.
            </p>
          </div>

          <div className="p-4 bg-surface-raised border border-border rounded-xl max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-text-muted">
              <span>Reference ID:</span>
              <span className="text-cyan-400 font-semibold">
                {currentSubmission?.verificationId || "VER-2026-00101"}
              </span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Roll Number:</span>
              <span className="text-text-primary">
                {currentSubmission?.rollNumber || "RA2111003010452"}
              </span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Status:</span>
              <span className="text-live font-semibold">Active & Approved</span>
            </div>
          </div>

          <div className="pt-3 flex justify-center gap-3">
            <Button variant="teal-cyan" onClick={() => navigate("/dashboard")} className="text-xs">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/coding")} className="text-xs">
              Start Coding Arena
            </Button>
          </div>
        </Card>
      )}

      {status === "Pending Verification" && (
        <Card className="p-8 bg-surface border border-amber-500/40 shadow-soft text-center space-y-4 rounded-2xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-9 h-9 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-text-primary">
              Verification Request Under Review
            </h2>
            <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
              Your ID document (Ref: <strong>{currentSubmission?.verificationId}</strong>) has been received. Our manual verification queue reviews submissions within 24-48 hours.
            </p>
          </div>

          <div className="p-4 bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/40 dark:border-amber-500/30 rounded-xl max-w-md mx-auto text-left text-xs space-y-2 font-mono text-amber-900 dark:text-amber-300 shadow-xs">
            <div className="flex justify-between">
              <span className="text-amber-800 dark:text-amber-400/90 font-medium">College:</span>
              <span className="font-semibold text-text-primary">
                {currentSubmission?.collegeName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-800 dark:text-amber-400/90 font-medium">Roll Number:</span>
              <span className="font-semibold text-text-primary">{currentSubmission?.rollNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-800 dark:text-amber-400/90 font-medium">Submitted:</span>
              <span className="text-text-secondary font-medium">{new Date(currentSubmission?.submittedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="outline"
              disabled={isCheckingStatus}
              onClick={async () => {
                if (!user) return;
                setIsCheckingStatus(true);
                await refresh();
                setIsCheckingStatus(false);
                const currentRes = verificationService.resolveStatus(user.userId, user.email);
                if (currentRes.status === "Verified") {
                  toast.success("Your identity is verified - all features unlocked");
                  navigate("/dashboard", { replace: true });
                } else {
                  toast.info("Still under review");
                }
              }}
              className="text-xs"
            >
              {isCheckingStatus ? "Checking Status..." : "Check Review Status"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/help")} className="text-xs">
              Help & Support
            </Button>
          </div>
        </Card>
      )}

      {status === "Rejected" && (
        <Card className="p-6 bg-surface border border-danger/40 shadow-soft space-y-4 rounded-2xl">
          <div className="flex items-start gap-4 p-4 bg-danger-bg border border-danger/40 rounded-xl text-danger text-xs">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm font-mono">Verification Request Rejected</h3>
              <p className="leading-relaxed">
                {currentSubmission?.rejectionNotes || "Your submitted ID photo was unclear or details did not match your account email."}
              </p>
              <span className="text-[11px] font-mono text-danger/80 block pt-1">
                Category: {currentSubmission?.rejectionCategory || "Image unclear"}
              </span>
            </div>
          </div>
          <p className="text-xs text-text-secondary">
            Please upload a clear, high-resolution photo of your official college ID card below to resubmit.
          </p>
        </Card>
      )}

      {/* FORM SECTION (Visible if Unverified or Rejected) */}
      {(status === "Unverified" || status === "Rejected") && (
        <CollegeIdUploader
          email={user?.email || ""}
          initialData={{
            nameOnId: user?.name || "",
            collegeNameOnId: collegeName,
            rollNumberOnId: rollNumber,
          }}
          onSubmit={handleVerificationSubmit}
          isSubmitting={isSubmitting}
          submitButtonText={status === "Rejected" ? "Resubmit College ID Card" : "Submit ID for Verification"}
          showBackOption={false}
        />
      )}
    </div>
  );
};
