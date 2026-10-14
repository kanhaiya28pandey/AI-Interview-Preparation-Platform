import React from "react";
import { OnlineQuestionExplorer } from "@/components/admin/OnlineQuestionExplorer";
import { Code2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export const AdminCodingTests: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={Code2}
        title="Coding Tests & Question Management"
        subtitle="Search live questions from LeetCode, GeeksforGeeks, and Codeforces via real-time APIs, publish directly to student arenas with 1-click, and manage active platform problems."
        badge="PROBLEM BANK"
        accent="emerald"
      />

      {/* Online Question Explorer and Platform Question Bank */}
      <OnlineQuestionExplorer />
    </div>
  );
};

export default AdminCodingTests;
