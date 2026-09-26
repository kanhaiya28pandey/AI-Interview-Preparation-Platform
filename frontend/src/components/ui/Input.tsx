import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-text-primary placeholder:text-text-muted font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-raised/60 disabled:text-text-muted transition-all duration-200",
            error && "border-danger text-danger focus:border-danger focus:ring-danger/20",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-danger font-sans">{error}</p>
        ) : hint ? (
          <p className="text-xs text-text-muted font-sans">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
