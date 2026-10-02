import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface TaxonomySelectOption {
  value: string;
  label: string;
  group?: string;
  sublabel?: string;
}

interface TaxonomySelectProps {
  options: TaxonomySelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  align?: "left" | "right";
  grouped?: boolean;
  disabled?: boolean;
}

export const TaxonomySelect: React.FC<TaxonomySelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  ariaLabel = "Select option",
  align = "left",
  grouped = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.group && opt.group.toLowerCase().includes(q)) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, search]);

  // Grouped options map
  const groupedOptions = useMemo(() => {
    if (!grouped) return null;
    const map = new Map<string, TaxonomySelectOption[]>();
    filteredOptions.forEach((opt) => {
      const g = opt.group || "Other";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(opt);
    });
    return map;
  }, [filteredOptions, grouped]);

  // Handle click outside & escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(filteredOptions.length - 1, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === "Enter" && filteredOptions[highlightedIndex]) {
      e.preventDefault();
      onChange(filteredOptions[highlightedIndex].value);
      setIsOpen(false);
      setSearch("");
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative inline-block text-left w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={`w-full bg-surface-raised border border-border hover:border-cyan-500/40 text-text-primary text-xs px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-cyan-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-1.5 w-full min-w-[240px] max-w-[420px] bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in flex flex-col max-h-72`}
        >
          {/* Search Header */}
          <div className="p-2 border-b border-border bg-surface-raised sticky top-0 z-10 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-text-muted shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Filter topics..."
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none px-1.5 py-0.5"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-1 divide-y divide-border/20" ref={listRef}>
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted">No matches found</div>
            ) : grouped && groupedOptions ? (
              Array.from(groupedOptions.entries()).map(([grp, items]) => (
                <div key={grp} className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 bg-surface-raised/40">
                    {grp}
                  </div>
                  {items.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-cyan-500/15 text-cyan-300 font-semibold"
                            : "text-text-primary hover:bg-surface-raised"
                        }`}
                      >
                        <div className="truncate flex-1">
                          <span className="block truncate">{opt.label}</span>
                          {opt.sublabel && (
                            <span className="text-[10px] text-text-muted block truncate">
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-cyan-500/15 text-cyan-300 font-semibold"
                        : isHighlighted
                        ? "bg-surface-raised text-text-primary"
                        : "text-text-primary hover:bg-surface-raised"
                    }`}
                  >
                    <div className="truncate flex-1">
                      <span className="block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-text-muted block truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
