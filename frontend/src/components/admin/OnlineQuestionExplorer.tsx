import React, { useState, useEffect } from "react";
import { adminService, ExternalProblemSummary } from "@/services/adminService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Database,
  Code2,
  Layers,
  Filter,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface OnlineQuestionExplorerProps {
  onPlatformUpdated?: () => void;
}

export const OnlineQuestionExplorer: React.FC<OnlineQuestionExplorerProps> = ({ onPlatformUpdated }) => {
  // Search & Filter state
  const [source, setSource] = useState<string>("ALL");
  const [domain, setDomain] = useState<string>("ALL");
  const [difficulty, setDifficulty] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Results & Loading states
  const [searchResults, setSearchResults] = useState<ExternalProblemSummary[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Live platform questions (active for students)
  const [platformProblems, setPlatformProblems] = useState<any[]>([]);
  const [isLoadingPlatform, setIsLoadingPlatform] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [platformSearch, setPlatformSearch] = useState<string>("");

  const loadPlatformProblems = async () => {
    setIsLoadingPlatform(true);
    try {
      const data = await adminService.getPlatformCodingProblems();
      setPlatformProblems(data);
    } catch (e) {
      console.warn("Could not load platform problems", e);
    } finally {
      setIsLoadingPlatform(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      const data = await adminService.searchExternalProblems({
        source,
        domain: domain !== "ALL" ? domain : undefined,
        difficulty: difficulty !== "ALL" ? difficulty : undefined,
        query: searchQuery.trim() || undefined,
        limit: 24,
      });

      // Cross reference with platform problems to see if already imported
      const platformIds = new Set(platformProblems.map((p) => p.id?.toLowerCase()));
      const updated = data.map((item) => ({
        ...item,
        isAlreadyImported: item.isAlreadyImported || platformIds.has(item.slug?.toLowerCase()) || platformIds.has(item.id?.toLowerCase()),
      }));

      setSearchResults(updated);
      if (updated.length === 0) {
        toast.info("No questions found matching your filter criteria. Try broader terms.");
      }
    } catch (err: any) {
      console.warn("External question search notice:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadPlatformProblems();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [source, domain, difficulty]);

  const handleImport = async (item: ExternalProblemSummary) => {
    setImportingId(item.id);
    try {
      await adminService.importExternalProblem({
        source: item.source,
        slug: item.slug,
        title: item.title,
        difficulty: item.difficulty,
        category: item.category,
        tags: item.topicTags,
      });

      toast.success(`"${item.title}" is now live for all students!`, {
        description: "Problem parsed with starter code in JS, Python, Java & C++ and added to Coding Arena.",
      });

      // Update local states
      setSearchResults((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, isAlreadyImported: true } : p))
      );
      await loadPlatformProblems();
      if (onPlatformUpdated) onPlatformUpdated();
    } catch (err: any) {
      toast.error("Failed to import problem: " + (err.response?.data?.message || err.message));
    } finally {
      setImportingId(null);
    }
  };

  const handleDelete = async (problemId: string, problemTitle: string) => {
    if (!window.confirm(`Are you sure you want to remove "${problemTitle}" from the student arena and question bank?`)) {
      return;
    }

    setDeletingId(problemId);
    try {
      await adminService.deletePlatformCodingProblem(problemId);
      toast.success(`"${problemTitle}" deleted from student arena.`);
      setPlatformProblems((prev) => prev.filter((p) => p.id !== problemId));

      // Update search result badge if currently displayed
      setSearchResults((prev) =>
        prev.map((p) =>
          p.id === problemId || p.slug === problemId ? { ...p, isAlreadyImported: false } : p
        )
      );
      if (onPlatformUpdated) onPlatformUpdated();
    } catch (err: any) {
      toast.error("Failed to delete question: " + (err.message || "Server error"));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPlatformProblems = platformProblems.filter((p) => {
    if (!platformSearch.trim()) return true;
    const q = platformSearch.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Search & Fetch Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-surface-raised via-surface to-surface-raised border border-border/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Globe className="w-5 h-5" />
              </span>
              <h3 className="font-serif text-xl font-medium text-text-primary">
                Live Online Question Fetcher (LeetCode, GFG, Codeforces)
              </h3>
              <Badge variant="active" className="font-mono text-[10px]">
                100% Free Questions
              </Badge>
            </div>
            <p className="text-xs text-text-secondary max-w-2xl">
              Search real-time coding problems from official online repositories without hardcoding files.
              One-click publish to students with automated starter templates and test cases.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="shrink-0 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSearching ? "animate-spin" : ""}`} />
            Refresh Feed
          </Button>
        </div>

        {/* Filters Grid */}
        <form onSubmit={handleSearch} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name (e.g. Subarray, Two Sum, Salary)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            />
          </div>

          {/* Source Selector */}
          <div className="lg:col-span-3">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="ALL">All Platforms (LeetCode, GFG, CF)</option>
              <option value="LEETCODE">LeetCode (Public GraphQL)</option>
              <option value="GEEKSFORGEEKS">GeeksforGeeks Curated</option>
              <option value="CODEFORCES">Codeforces (Official REST)</option>
            </select>
          </div>

          {/* Domain / Topic Category */}
          <div className="lg:col-span-3">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="ALL">All Domains (DSA, Database...)</option>
              <option value="DSA">Data Structures & Algorithms</option>
              <option value="Database">Database & SQL Queries</option>
              <option value="Dynamic Programming">Dynamic Programming (DP)</option>
              <option value="Trees">Trees & Binary Search Trees</option>
              <option value="Graphs">Graphs & BFS/DFS</option>
              <option value="Stacks">Stacks & Queues</option>
              <option value="Two Pointers">Two Pointers & Sliding Window</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="lg:col-span-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </form>
      </Card>

      {/* Online Search Results Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-medium text-text-primary">
              Online Questions ({searchResults.length} Results)
            </h4>
          </div>
          {isSearching && (
            <span className="text-xs text-cyan-400 flex items-center gap-1.5 animate-pulse font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching live via API...
            </span>
          )}
        </div>

        {isSearching && searchResults.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-surface/50 animate-pulse space-y-3">
                <div className="h-4 bg-border/60 rounded w-3/4" />
                <div className="h-3 bg-border/40 rounded w-1/2" />
                <div className="h-8 bg-border/30 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <Card className="p-8 text-center text-text-muted border-dashed border-border">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-text-muted/60" />
            <p className="text-sm">No external problems found. Adjust your keyword or category filter.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 group"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                        item.source === "LEETCODE"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : item.source === "CODEFORCES"
                          ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {item.source}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        item.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : item.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  </div>

                  {/* Title & Link */}
                  <div>
                    <h5 className="text-sm font-medium text-text-primary group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-text-muted mt-0.5 font-mono">
                      Category: <span className="text-text-secondary">{item.category || "Algorithms"}</span>
                      {item.acceptance && item.acceptance !== "N/A" && ` • Acceptance ${item.acceptance}`}
                    </p>
                  </div>

                  {/* Topic Tags */}
                  {item.topicTags && item.topicTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.topicTags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-surface-raised px-1.5 py-0.5 rounded text-text-muted border border-border/50 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.topicTags.length > 3 && (
                        <span className="text-[10px] text-text-muted font-mono self-center">
                          +{item.topicTags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  {item.externalUrl ? (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-text-muted hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Origin
                    </a>
                  ) : (
                    <span />
                  )}

                  {item.isAlreadyImported ? (
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Added to Arena
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleImport(item)}
                      disabled={importingId === item.id}
                      className="text-xs h-7 px-2.5 font-semibold"
                    >
                      {importingId === item.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" /> Add to Students
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Active Platform Questions List (Available to Students) */}
      <div className="space-y-4 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-medium text-text-primary">
                Live Platform Question Bank ({platformProblems.length} Active in Student Arena)
              </h4>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              These questions are currently available to all registered students in the Coding Arena.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Filter active questions..."
              value={platformSearch}
              onChange={(e) => setPlatformSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        {isLoadingPlatform ? (
          <div className="p-6 text-center text-text-muted text-xs font-mono animate-pulse">
            Loading active platform questions...
          </div>
        ) : filteredPlatformProblems.length === 0 ? (
          <Card className="p-6 text-center text-text-muted text-xs">
            No platform questions found matching "{platformSearch}".
          </Card>
        ) : (
          <Card className="overflow-hidden border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-raised/70 border-b border-border text-text-muted font-mono">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Problem ID & Title</th>
                    <th className="py-2.5 px-4 font-medium">Domain / Category</th>
                    <th className="py-2.5 px-4 font-medium">Difficulty</th>
                    <th className="py-2.5 px-4 font-medium">Test Cases</th>
                    <th className="py-2.5 px-4 font-medium">Languages</th>
                    <th className="py-2.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPlatformProblems.map((prob) => (
                    <tr key={prob.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-text-primary">{prob.title}</div>
                        <div className="text-[10px] text-text-muted font-mono">{prob.id}</div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary font-mono">
                        {prob.category || "Algorithms"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            prob.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : prob.difficulty === "Medium"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-text-muted">
                        {prob.testCases?.length || 2} automated
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 text-[9px] font-mono text-cyan-400">
                          <span className="bg-cyan-500/10 px-1 rounded">JS</span>
                          <span className="bg-cyan-500/10 px-1 rounded">PY</span>
                          <span className="bg-cyan-500/10 px-1 rounded">JAVA</span>
                          <span className="bg-cyan-500/10 px-1 rounded">C++</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(prob.id, prob.title)}
                          disabled={deletingId === prob.id}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2 font-mono text-[11px]"
                        >
                          {deletingId === prob.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="w-3 h-3 mr-1" />
                          )}
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
