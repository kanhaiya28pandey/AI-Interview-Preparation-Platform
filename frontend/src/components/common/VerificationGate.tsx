import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Lock, Clock, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { verificationService } from "@/services/verificationService";
import { VerificationStatus, VerificationSubmission } from "@/mocks/verifications";

export interface VerificationGateProps {
  featureName: string;
  children: React.ReactNode;
}

export const VerificationGate: React.FC<VerificationGateProps> = ({ featureName, children }) => {
  const { user, isDemoMode, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<VerificationStatus>("Verified");
  const [submission, setSubmission] = useState<VerificationSubmission | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Exempt admins and demo users immediately
    if (isAdmin() || isDemoMode || user?.userId === "demo-usr-student-01" || user?.email?.includes("demo")) {
      setStatus("Verified");
      setIsLoading(false);
      return;
    }

    if (user?.userId) {
      verificationService
        .getVerificationStatus(user.userId, user.email)
        .then((res) => {
          setStatus(res.status);
          setSubmission(res.submission);
        })
        .catch(() => setStatus("Unverified"))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user, isDemoMode, isAdmin]);

  if (isLoading) {
    return <div className="p-8 text-center text-xs font-mono text-text-muted">Checking account eligibility...</div>;
  }

  // If verified, render children normally
  if (status === "Verified") {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[70vh] w-full">
      {/* Blurred background preview */}
      <div className="pointer-events-none filter blur-md opacity-25 select-none aria-hidden overflow-hidden h-[600px] max-h-[80vh]">
        {children}
      </div>

      {/* Lock Overlay Modal */}
      <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in">
        <Card className="max-w-md w-full p-6 sm:p-8 bg-surface border border-border shadow-2xl text-center space-y-5 rounded-2xl">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-inner">
            {status === "Pending Verification" ? (
              <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
            ) : status === "Rejected" ? (
              <AlertTriangle className="w-7 h-7 text-danger" />
            ) : (
              <Lock className="w-7 h-7 text-cyan-400" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant={
                  status === "Pending Verification"
                    ? "medium"
                    : status === "Rejected"
                    ? "blocked"
                    : "accent"
                }
                className="text-[11px] font-mono px-2.5 py-0.5"
              >
                {status}
              </Badge>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-text-primary">
              Verification Required
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Access to <strong>{featureName}</strong> is locked until your College ID identity check is verified.
            </p>
          </div>

          {status === "Pending Verification" && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left space-y-1.5 text-xs text-amber-300">
              <div className="font-semibold flex items-center justify-between">
                <span>Application Under Review</span>
                <span className="font-mono text-[10px] text-amber-400/80">{submission?.verificationId}</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Your ID submission is currently in the review queue. Submissions are processed within 24-48 hours.
              </p>
            </div>
          )}

          {status === "Rejected" && (
            <div className="p-3.5 bg-danger-bg border border-danger/40 rounded-xl text-left space-y-1.5 text-xs text-danger">
              <span className="font-semibold block">Rejection Reason:</span>
              <p className="text-[11px] leading-relaxed">
                {submission?.rejectionNotes || "Your college ID image was unreadable or details mismatch."}
              </p>
            </div>
          )}

          {status === "Unverified" && (
            <p className="text-xs text-text-muted bg-surface-raised p-3 rounded-xl border border-border">
              To ensure academic eligibility for AI mock interview sessions and leaderboard placements, please upload your College ID card.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="teal-cyan"
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5"
              onClick={() => navigate("/verify-identity")}
            >
              <span>{status === "Rejected" ? "Resubmit ID Card" : "Verify College ID"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
