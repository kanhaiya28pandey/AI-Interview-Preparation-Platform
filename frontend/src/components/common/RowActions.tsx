import React from "react";

interface RowActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const RowActions: React.FC<RowActionsProps> = ({ children, className = "" }) => {
  return (
    <div className={`flex items-center justify-end gap-2 flex-nowrap ${className}`}>
      {children}
    </div>
  );
};
