import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { isMockMode, getDataModeLabel } from "@/lib/dataMode";
import { isObjectId, clearAllAppStorage } from "@/lib/appStorage";
import { getLastVerificationRequest, VerificationRequestLog } from "@/services/verificationService";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  RotateCcw,
  X,
  Server,
  Key,
  User,
  ShieldAlert,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const { user, token } = useAuth();
  const [backendStatus, setBackendStatus] = useState<"checking" | "reachable" | "unreachable">("checking");
  const [backendLatency, setBackendLatency] = useState<number | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [lastReq, setLastReq] = useState<VerificationRequestLog | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLastReq(getLastVerificationRequest());

    const checkBackend = async () => {
      setBackendStatus("checking");
      setBackendError(null);
      const start = performance.now();
      try {
        await api.get("/api/v1/verification/status");
        const elapsed = Math.round(performance.now() - start);
        setBackendStatus("reachable");
        setBackendLatency(elapsed);
      } catch (err: any) {
        const elapsed = Math.round(performance.now() - start);
        setBackendLatency(elapsed);
        const status = err?.response?.status;
        // If 401 or 403, the backend server is reachable and answered
        if (status === 401 || status === 403 || status === 200) {
          setBackendStatus("reachable");
        } else {
          setBackendStatus("unreachable");
          setBackendError(err?.response?.data?.message || err?.message || "Connection refused");
        }
      }
    };

    checkBackend();
  }, [isOpen]);

  if (!isOpen) return null;

  const validId = isObjectId(user?.userId);
  const isDemoTok = token?.startsWith("demo-") || token?.startsWith("mock-");
  const tokenType = !token ? "None" : isDemoTok ? "Mock/Demo Token" : "Bearer JWT";

  const diagnosticsData = {
    timestamp: new Date().toISOString(),
    dataMode: isMockMode() ? "MOCK" : "REAL_BACKEND",
    dataModeLabel: getDataModeLabel(),
    user: {
      userId: user?.userId || null,
      isValidObjectId: validId,
      name: user?.name || null,
      email: user?.email || null,
      role: user?.role || null,
      verificationStatus: user?.verificationStatus || null,
    },
    token: {
      present: Boolean(token),
      tokenType,
      preview: token ? `${token.slice(0, 15)}...${token.slice(-6)}` : null,
    },
    backend: {
      status: backendStatus,
      latencyMs: backendLatency,
      error: backendError,
    },
    lastVerificationRequest: lastReq,
  };

  const handleCopyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosticsData, null, 2));
      toast.success("Diagnostics JSON copied to clipboard!");
    } catch {
      toast.error("Failed to copy diagnostics.");
    }
  };

  const handleResetAppData = () => {
    clearAllAppStorage();
    setShowConfirmReset(false);
    onClose();
    toast.info("All local application data cleared. Redirecting to login...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-raised">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-text-primary">
                System Diagnostics
              </h3>
              <p className="text-[11px] font-mono text-text-muted">
                Inspect session, token, and backend connectivity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Data Mode Banner */}
          <div className="p-3.5 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
            <span className="text-text-secondary font-medium">Data Storage Mode:</span>
            <Badge variant={isMockMode() ? "medium" : "active"} className="text-[11px]">
              {getDataModeLabel()}
            </Badge>
          </div>

          {/* User Session Grid */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-text-secondary font-semibold border-b border-border/60 pb-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              <span>User Session Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="space-y-1">
                <span className="text-text-muted">User ID:</span>
                <div className="p-1.5 rounded bg-surface border border-border truncate text-text-primary">
                  {user?.userId || "None (Logged out)"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">ID Format (24-char ObjectId):</span>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-surface border border-border">
                  {validId ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-live shrink-0" />
                      <span className="text-live font-semibold">Valid MongoDB ObjectId</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-amber-400 font-medium">
                        {user ? "Mock/Demo ID" : "N/A"}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Role:</span>
                <div className="p-1.5 rounded bg-surface border border-border text-text-primary">
                  {user?.role || "None"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Auth Token Type:</span>
                <div className="p-1.5 rounded bg-surface border border-border text-cyan-400">
                  {tokenType}
                </div>
              </div>
            </div>
          </div>

          {/* Backend Connectivity */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <div className="flex items-center gap-2 text-text-secondary font-semibold">
                <Server className="w-4 h-4 text-live" />
                <span>Backend Server Status</span>
              </div>
              <span className="text-[10px] text-text-muted">
                {backendLatency !== null ? `${backendLatency}ms` : ""}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-surface border border-border text-[11px]">
              <span>Status Endpoint (/api/v1/verification/status):</span>
              {backendStatus === "checking" && (
                <span className="text-text-muted">Checking connection...</span>
              )}
              {backendStatus === "reachable" && (
                <span className="text-live flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reachable (200 / 401)
                </span>
              )}
              {backendStatus === "unreachable" && (
                <span className="text-danger flex items-center gap-1 font-semibold">
                  <XCircle className="w-3.5 h-3.5" /> Unreachable ({backendError})
                </span>
              )}
            </div>
          </div>

          {/* Last Verification Request */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-text-secondary font-semibold border-b border-border/60 pb-1.5">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Last Verification Network Request</span>
            </div>

            {lastReq ? (
              <div className="p-2.5 rounded bg-surface border border-border space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Endpoint:</span>
                  <span className="text-text-primary font-bold">
                    {lastReq.method} {lastReq.url}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Status Code:</span>
                  <span
                    className={
                      typeof lastReq.status === "number" && lastReq.status < 400
                        ? "text-live font-semibold"
                        : "text-danger font-semibold"
                    }
                  >
                    {lastReq.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Time:</span>
                  <span className="text-text-secondary">{lastReq.timestamp}</span>
                </div>
                {lastReq.details && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-text-muted">Details:</span>
                    <span className="text-cyan-400 truncate max-w-[280px]">
                      {lastReq.details}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-text-muted p-2 bg-surface rounded border border-border">
                No verification requests executed in current session.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-surface-raised flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyDiagnostics}
            className="w-full sm:w-auto text-xs gap-1.5 font-mono"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Diagnostics</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowConfirmReset(true)}
            className="w-full sm:w-auto text-xs gap-1.5 font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Local App Data</span>
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-surface border border-danger/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-danger">
              <ShieldAlert className="w-7 h-7 shrink-0" />
              <h4 className="font-serif text-lg font-semibold text-text-primary">
                Clear All Local Data?
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              This will remove all stored authentication tokens, demo caches, local verifications, and progress from your browser, then sign you out.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmReset(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleResetAppData}
                className="text-xs"
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
