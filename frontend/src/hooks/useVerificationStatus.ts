import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { verificationService } from "@/services/verificationService";
import { VerificationStatus, VerificationSubmission } from "@/mocks/verifications";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

import { isMockMode } from "@/lib/dataMode";

export interface UseVerificationStatusResult {
  status: VerificationStatus;
  submission?: VerificationSubmission;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useVerificationStatus = (): UseVerificationStatusResult => {
  const { user, isDemoMode, isAdmin, setVerificationStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<VerificationStatus>(() => {
    if (isAdmin() || isDemoMode) return "Verified";
    if (!user) return "Unverified";
    if (isMockMode()) {
      const initial = verificationService.resolveStatus(user.userId, user.email);
      return initial.status;
    }
    return user.verificationStatus || "Unverified";
  });

  const [submission, setSubmission] = useState<VerificationSubmission | undefined>(() => {
    if (!user) return undefined;
    if (isMockMode()) {
      return verificationService.resolveStatus(user.userId, user.email).submission;
    }
    return undefined;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const previousStatusRef = useRef<VerificationStatus>(status);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setStatus("Unverified");
      setSubmission(undefined);
      setIsLoading(false);
      return;
    }

    if (isAdmin() || isDemoMode) {
      setStatus("Verified");
      setIsLoading(false);
      return;
    }

    const res = await verificationService.getVerificationStatus(user.userId, user.email);
    const prevStatus = previousStatusRef.current;

    setStatus(res.status);
    setSubmission(res.submission);
    setIsLoading(false);

    // If transitioned to Verified from unverified/pending/rejected
    if (res.status === "Verified" && prevStatus !== "Verified") {
      setVerificationStatus("Verified");
      toast.success("Your identity is verified - all features unlocked");
      if (location.pathname === "/verify-identity") {
        const fromPath = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(fromPath, { replace: true });
      }
    } else if (res.status === "Rejected" && prevStatus !== "Rejected") {
      setVerificationStatus("Rejected");
      toast.error(`Verification rejected: ${res.submission?.rejectionNotes || "Please review notes and resubmit."}`);
    }

    previousStatusRef.current = res.status;
  }, [user, isDemoMode, isAdmin, setVerificationStatus, location.pathname, location.state, navigate]);

  useEffect(() => {
    fetchStatus();

    // Storage listener (for cross-tab updates when admin approves in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === "ai_interview_prep_verifications" ||
        e.key === "ai_interview_prep_user" ||
        e.key === "admin_master_students"
      ) {
        fetchStatus();
      }
    };

    // Custom in-app event dispatched after submitVerification / reviewVerification
    const handleCustomUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail || !detail.userId || detail.userId === user?.userId) {
        fetchStatus();
      }
    };

    // Focus & Visibility listener
    const handleFocus = () => {
      fetchStatus();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStatus();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("verification-updated", handleCustomUpdate);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Polling interval every 10 seconds while status is Pending Verification
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    if (status === "Pending Verification") {
      pollInterval = setInterval(() => {
        if (!document.hidden) {
          fetchStatus();
        }
      }, 10000);
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("verification-updated", handleCustomUpdate);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [fetchStatus, status, user?.userId]);

  const refresh = async () => {
    setIsLoading(true);
    await fetchStatus();
  };

  return { status, submission, isLoading, refresh };
};
