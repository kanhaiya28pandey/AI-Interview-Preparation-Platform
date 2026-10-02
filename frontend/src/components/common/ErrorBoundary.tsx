import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  resetKey?: string;
  onReset?: () => void;
  isModal?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (this.props.isModal) {
      toast.error("An error occurred in this dialog. The modal has been closed safely.");
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.resetKey !== undefined && prevProps.resetKey !== this.props.resetKey) {
      if (this.state.hasError) {
        this.reset();
      }
    }
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.isModal) {
        return (
          <div className="p-6 bg-surface border border-red-500/30 rounded-2xl text-center space-y-4 shadow-xl max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {this.props.fallbackTitle || "Something went wrong in this dialog"}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {this.props.fallbackMessage || "An unexpected error occurred while loading this view."}
              </p>
              {import.meta.env.DEV && this.state.error?.message && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[11px] font-mono text-red-300 text-left overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.reset}
                className="text-xs border-border hover:border-cyan-500/40 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[300px] flex items-center justify-center p-4 sm:p-8">
          <div className="bg-surface border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                {this.props.fallbackTitle || "Something went wrong in this section"}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                {this.props.fallbackMessage ||
                  "An unexpected error occurred. You can retry the action or navigate back to the main dashboard."}
              </p>
              {import.meta.env.DEV && this.state.error?.message && (
                <div className="mt-3 p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs font-mono text-red-300 text-left overflow-auto max-h-36 shadow-inner">
                  <div className="font-bold text-[10px] text-red-400 uppercase tracking-wider mb-1">
                    Development Error Details:
                  </div>
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={this.reset}
                className="text-xs sm:text-sm px-4 py-2 flex items-center gap-2 font-semibold shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                className="text-xs sm:text-sm px-4 py-2 border-border hover:border-cyan-500/40 text-text-secondary flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper that passes React Router's location key for automatic reset on navigation
import { useLocation } from "react-router-dom";

export const ErrorBoundary: React.FC<Omit<Props, "resetKey">> = (props) => {
  let locationKey = "";
  try {
    const location = useLocation();
    locationKey = location.pathname;
  } catch {
    // If used outside BrowserRouter
  }

  return <ErrorBoundaryClass resetKey={locationKey} {...props} />;
};

// Global unhandled rejection & window error listener
export function setupGlobalErrorListeners() {
  if (typeof window === "undefined") return;

  const handleWindowError = (event: ErrorEvent) => {
    console.error("Global window.onerror:", event.error || event.message);
    toast.error("A system error occurred: " + (event.message || "Unknown error"));
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error("Global unhandledrejection:", event.reason);
    const reasonMsg =
      event.reason instanceof Error
        ? event.reason.message
        : typeof event.reason === "string"
        ? event.reason
        : "An asynchronous operation failed.";
    toast.error("Background request error: " + reasonMsg);
  };

  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    window.removeEventListener("error", handleWindowError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };
}
