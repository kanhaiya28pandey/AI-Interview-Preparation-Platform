import React, { ReactNode } from "react";
import {
  LucideIcon,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutVariant = "info" | "success" | "warning" | "danger" | "ai";

export interface CalloutProps {
  variant?: CalloutVariant;
  icon?: LucideIcon | ReactNode;
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
  className?: string;
  role?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
  titleClassName?: string;
}

const DEFAULT_ICONS: Record<CalloutVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  ai: Sparkles,
};

/**
 * Reusable inline code chip for callout descriptions.
 */
export const CalloutCode: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <code className={cn("callout-code callout-code-base", className)}>
      {children}
    </code>
  );
};

/**
 * Unified Callout Component
 *
 * Theme-safe banner for info, success, warning, danger, and AI notices.
 * In Light mode: Opaque, solid background with high-contrast text and left accent bar.
 * In Dark mode: Translucent tinted background with glowing accents and left accent bar.
 */
export const Callout: React.FC<CalloutProps> = ({
  variant = "info",
  icon,
  title,
  children,
  action,
  actions,
  onDismiss,
  className,
  role,
  id,
  size = "md",
  titleClassName,
}) => {
  const actionSlot = actions ?? action;
  const hasRightSlot = Boolean(actionSlot || onDismiss);
  const defaultRole = variant === "danger" || variant === "warning" ? "alert" : "note";
  const isSm = size === "sm";

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = (icon as LucideIcon) || DEFAULT_ICONS[variant];
    return <IconComp className={cn(isSm ? "w-3.5 h-3.5" : "w-4.5 h-4.5", "shrink-0 stroke-[2.2]")} />;
  };

  return (
    <div
      id={id}
      role={role || defaultRole}
      className={cn(
        "callout-container rounded-xl border border-l-4 shadow-sm relative transition-colors",
        isSm ? "p-3 sm:p-3.5" : "p-4 sm:p-5",
        hasRightSlot
          ? "flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4"
          : "flex items-start gap-3 sm:gap-3.5",
        `callout-${variant}`,
        className
      )}
    >
      {/* Left section: Icon chip + Text content */}
      <div className={cn("flex items-start gap-2.5 sm:gap-3 min-w-0", hasRightSlot ? "flex-1" : "flex-1")}>
        <div
          className={cn(
            "callout-icon-chip shrink-0 rounded-lg flex items-center justify-center border mt-0.5",
            isSm ? "h-7 w-7 text-xs" : "h-9 w-9"
          )}
          aria-hidden="true"
        >
          {renderIcon()}
        </div>

        <div className="min-w-0 flex-1">
          {title && (
            <h4 className={cn("callout-title font-semibold leading-snug", isSm ? "text-xs" : "text-sm", titleClassName)}>
              {title}
            </h4>
          )}
          <div
            className={cn(
              "callout-body leading-relaxed max-w-4xl",
              isSm ? "text-xs" : "text-sm",
              title ? "mt-1" : ""
            )}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Right action area (optional action button + optional dismiss) */}
      {hasRightSlot && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center pl-10 sm:pl-0 flex-wrap sm:flex-nowrap pt-1 sm:pt-0">
          {actionSlot}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notice"
              className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Callout;
