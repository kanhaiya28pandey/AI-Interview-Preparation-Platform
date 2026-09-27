import React, { useState, useEffect, useRef } from "react";
import { getYearSemesterOptions, isValidYearSemesterForCourse } from "@/lib/courseDurations";
import { AlertCircle, SlidersHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface YearSemesterSelectProps {
  course: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  required?: boolean;
}

export const YearSemesterSelect: React.FC<YearSemesterSelectProps> = ({
  course,
  value,
  onChange,
  error,
  label = "Current Year / Semester",
  disabled = false,
  className,
  id,
  required = false,
}) => {
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(
    value.startsWith("Custom:") || (value !== "" && !isValidYearSemesterForCourse(course, value) && course !== "")
  );
  const [customYear, setCustomYear] = useState<string>("");
  const [customSem, setCustomSem] = useState<string>("");

  const prevCourseRef = useRef<string>(course);

  // Parse initial custom value if present
  useEffect(() => {
    if (value.startsWith("Custom:")) {
      const parts = value.replace("Custom: ", "").split(" / ");
      if (parts[0]) setCustomYear(parts[0].replace("Year ", ""));
      if (parts[1]) setCustomSem(parts[1].replace("Sem ", ""));
      setIsCustomMode(true);
    }
  }, []);

  // Handle Course Change
  useEffect(() => {
    if (prevCourseRef.current !== course) {
      if (course && value && !isCustomMode) {
        const isValid = isValidYearSemesterForCourse(course, value);
        if (!isValid) {
          onChange("");
          setResetNotice(`Please re-select your year for ${course}.`);
        } else {
          setResetNotice(null);
        }
      } else if (!course) {
        onChange("");
        setResetNotice(null);
      }
      prevCourseRef.current = course;
    }
  }, [course, value, isCustomMode, onChange]);

  const options = getYearSemesterOptions(course);
  const isDisabled = disabled || !course || course.trim() === "";

  const handleCustomChange = (yearStr: string, semStr: string) => {
    setCustomYear(yearStr);
    setCustomSem(semStr);
    if (yearStr || semStr) {
      const formatted = `Custom: Year ${yearStr || "1"} / Sem ${semStr || "1"}`;
      onChange(formatted);
    } else {
      onChange("");
    }
  };

  const toggleCustomMode = () => {
    const nextMode = !isCustomMode;
    setIsCustomMode(nextMode);
    setResetNotice(null);
    if (!nextMode) {
      // Reverting to standard dropdown
      onChange("");
    } else {
      handleCustomChange(customYear || "1", customSem || "1");
    }
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id || "year-semester-select"} className="block text-xs font-medium text-text-secondary">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        {course && (
          <button
            type="button"
            onClick={toggleCustomMode}
            className="text-[11px] text-cyan-400 hover:underline font-mono flex items-center gap-1 transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{isCustomMode ? "Standard Options" : "Other duration?"}</span>
          </button>
        )}
      </div>

      {!isCustomMode ? (
        <select
          id={id || "year-semester-select"}
          disabled={isDisabled}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setResetNotice(null);
          }}
          className={cn(
            "w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-text-primary placeholder:text-text-muted font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-raised/60 disabled:text-text-muted transition-all duration-200",
            error && "border-danger text-danger focus:border-danger focus:ring-danger/20"
          )}
        >
          {isDisabled ? (
            <option value="">Select a course first</option>
          ) : (
            <>
              <option value="">-- Select Year / Semester --</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </>
          )}
        </select>
      ) : (
        <div className="p-3 bg-surface-raised border border-cyan-400/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-semibold">
            <span>Custom Course Duration Mode</span>
            <span className="text-text-muted">Enter specific year & sem</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-text-muted font-mono block">Current Year #</label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder="e.g. 5"
                value={customYear}
                onChange={(e) => handleCustomChange(e.target.value, customSem)}
                className="w-full px-3 py-1.5 bg-surface border border-border rounded text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-text-muted font-mono block">Current Semester #</label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="e.g. 9"
                value={customSem}
                onChange={(e) => handleCustomChange(customYear, e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-border rounded text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {resetNotice && (
        <p className="text-xs text-amber-400 font-mono flex items-center gap-1 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{resetNotice}</span>
        </p>
      )}

      {error && <p className="text-xs text-danger font-sans">{error}</p>}
    </div>
  );
};
