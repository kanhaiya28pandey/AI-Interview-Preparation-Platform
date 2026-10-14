import React, { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterBarProps {
  children?: ReactNode;
  className?: string;
}

export interface FilterSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  iconClassName?: string;
}

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
}

/**
 * Responsive FilterBar container: 1 col on mobile, 2 col on @md, 4 col on @2xl.
 */
export const FilterBar: React.FC<FilterBarProps> = ({ children, className }) => {
  return (
    <div className={cn("@container w-full grid grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-4 gap-3", className)}>
      {children}
    </div>
  );
};

/**
 * Standardized Search Input for FilterBar with properly positioned internal icon,
 * standard h-10 height, and rounded-xl styling.
 */
export const FilterSearch: React.FC<FilterSearchProps> = ({
  className,
  containerClassName,
  iconClassName,
  placeholder = "Search...",
  ...props
}) => {
  return (
    <div className={cn("relative w-full min-w-0", containerClassName)}>
      <Search
        className={cn(
          "w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none",
          iconClassName
        )}
      />
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full h-10 pl-10 pr-3.5 bg-surface border border-border rounded-xl text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all",
          className
        )}
        {...props}
      />
    </div>
  );
};

/**
 * Standardized Select for FilterBar with h-10 height, truncate support, and rounded-xl.
 */
export const FilterSelect: React.FC<FilterSelectProps> = ({
  className,
  containerClassName,
  children,
  ...props
}) => {
  return (
    <div className={cn("relative w-full min-w-0", containerClassName)}>
      <select
        className={cn(
          "w-full h-10 px-3.5 bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 truncate transition-all cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default FilterBar;
