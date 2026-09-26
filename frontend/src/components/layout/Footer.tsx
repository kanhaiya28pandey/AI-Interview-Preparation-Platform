import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border py-6 px-8 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted gap-4">
      <div className="flex items-center gap-2 font-mono">
        <span>AI Interview Preparation · Placement Prep for Colleges</span>
      </div>
      <div className="flex items-center gap-6 font-mono text-[11px]">
        <span>Status: <strong className="text-live">Online</strong></span>
        <span>Spring Boot + React 19</span>
      </div>
    </footer>
  );
};
