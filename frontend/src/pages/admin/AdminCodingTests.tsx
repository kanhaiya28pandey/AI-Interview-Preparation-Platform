import React from "react";
import { OnlineQuestionExplorer } from "@/components/admin/OnlineQuestionExplorer";
import { Code2, Globe } from "lucide-react";

export const AdminCodingTests: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
              Coding Tests & Question Management
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1 max-w-3xl">
            Search live questions from LeetCode, GeeksforGeeks, and Codeforces via real-time APIs, publish directly to student arenas with 1-click, and manage active platform problems.
          </p>
        </div>
      </div>

      {/* Online Question Explorer and Platform Question Bank */}
      <OnlineQuestionExplorer />
    </div>
  );
};

export default AdminCodingTests;
