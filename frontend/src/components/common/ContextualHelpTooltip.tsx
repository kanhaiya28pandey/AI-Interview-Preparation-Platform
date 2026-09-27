import React, { useState } from "react";
import { HelpCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface ContextualHelpTooltipProps {
  /** Helpful title / summary */
  title: string;
  /** Brief explanation text shown inside the hover popover */
  content: string;
  /** Optional target FAQ item ID to link to in /help */
  faqId?: string;
  /** Positioning of tooltip popover */
  align?: "left" | "right" | "center";
  className?: string;
}

export const ContextualHelpTooltip: React.FC<ContextualHelpTooltipProps> = ({
  title,
  content,
  faqId = "faq-gs-1",
  align = "right",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const alignClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={`relative inline-flex items-center shrink-0 ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Help: ${title}`}
        className="p-1 rounded-full text-text-muted hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors focus:outline-none"
        title={title}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-full mb-2 w-64 p-3 bg-surface-raised border border-border rounded-xl shadow-xl z-50 text-xs text-text-primary pointer-events-auto space-y-1.5 font-sans animate-fade-in ${alignClasses[align]}`}
        >
          <div className="flex items-center justify-between border-b border-border pb-1">
            <span className="font-semibold text-cyan-400 font-mono text-[11px]">{title}</span>
            <span className="text-[10px] font-mono text-text-muted">Help Tip</span>
          </div>
          <p className="text-text-secondary text-[11px] leading-relaxed">{content}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              navigate(`/help?faq=${faqId}`);
            }}
            className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 pt-1 font-semibold"
          >
            Read FAQ Guide <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
