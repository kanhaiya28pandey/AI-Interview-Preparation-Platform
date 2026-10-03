import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./Button";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  zIndexClass?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidthClass = "max-w-2xl",
  zIndexClass = "z-[100]",
}) => {
  useBodyScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-3 sm:p-6`}>
          {/* Backdrop Overlay: Explicit dark dimming rgba(15, 23, 42, 0.55) & blur(4px) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(15, 23, 42, 0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              zIndex: 0,
            }}
            onClick={onClose}
          />

          {/* Modal Panel Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
            className={`relative z-10 w-full ${maxWidthClass} bg-surface border border-border-strong rounded-2xl shadow-soft-drop overflow-hidden opacity-100 modal-panel`}
          >
            {/* Modal Header: Fixed (flex-shrink: 0) */}
            <div
              style={{ flexShrink: 0 }}
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-surface modal-header shadow-sm"
            >
              <div className="min-w-0 pr-4">
                <h3 className="font-serif text-lg sm:text-xl font-medium text-text-primary truncate">{title}</h3>
                {description && <p className="text-xs text-text-secondary mt-0.5 truncate">{description}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1.5 h-auto text-text-muted hover:text-text-primary hover:bg-surface-raised rounded-lg shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body: Scrollable (flex: 1 1 auto, min-height: 0, overflow-y: auto) */}
            <div
              style={{
                flex: "1 1 auto",
                minHeight: 0,
                overflowY: "auto",
              }}
              className="p-6 custom-scrollbar text-text-primary modal-body"
            >
              <ErrorBoundary isModal onReset={onClose}>
                {children}
              </ErrorBoundary>
            </div>

            {/* Modal Footer: Fixed optional (flex-shrink: 0) */}
            {footer && (
              <div
                style={{ flexShrink: 0 }}
                className="sticky bottom-0 z-10 px-6 py-3.5 border-t border-border bg-surface-raised flex items-center justify-end gap-3 modal-footer shadow-sm"
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
