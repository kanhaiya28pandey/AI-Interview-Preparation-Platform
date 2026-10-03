import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { AdminCodingTest, TopicConfig } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { RowActions } from "@/components/common/RowActions";
import { TopicManager } from "@/components/admin/TopicManager";
import { TaxonomySelect, TaxonomySelectOption } from "@/components/ui/TaxonomySelect";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import {
  Plus,
  Edit2,
  Code2,
  Search,
  Filter,
  Ban,
  RotateCcw,
  AlertCircle,
  Tag,
  Sparkles,
  Layers,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const AdminCodingTests: React.FC = () => {
  const { domains, getTopicsForDomain, normalizeDomain } = useTaxonomy();
  const [tests, setTests] = useState<AdminCodingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; is403: boolean; isNetworkError: boolean } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomainFilter, setSelectedDomainFilter] = useState("ALL");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("ALL");
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState("ALL");

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<AdminCodingTest> | null>(null);
  const [saving, setSaving] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  // Cancel Test Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [testToCancel, setTestToCancel] = useState<AdminCodingTest | null>(null);
  const [cancelReason, setCancelReason] = useState("Schedule conflict / Maintenance");
  const [cancelNote, setCancelNote] = useState("");

  const loadTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getCodingTests();
      setTests(data);
    } catch (err: any) {
      console.error("Failed to load coding tests:", err);
      const is403 = err?.response?.status === 403;
      const isNetworkError = !err?.response || err?.code === "ERR_NETWORK";
      let message = "An error occurred while loading coding tests.";
      if (isNetworkError) {
        message = "Could not reach the server. Make sure the backend is running.";
      } else if (is403) {
        message = "You do not have permission to view this page.";
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      setError({ message, is403, isNetworkError });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Filtered tests with legacy domain mapping support
  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.domain && t.domain.toLowerCase().includes(searchQuery.toLowerCase()));

    const testDomainSlug = normalizeDomain(t.domain || "");
    const matchesDomain =
      selectedDomainFilter === "ALL" ||
      testDomainSlug === selectedDomainFilter ||
      (t.domain && t.domain.toLowerCase() === selectedDomainFilter.toLowerCase()) ||
      domains.find((d) => d.slug === selectedDomainFilter)?.name.toLowerCase() === (t.domain || "").toLowerCase();

    const matchesTopic =
      selectedTopicFilter === "ALL" ||
      (t.topics && t.topics.some((top) => top.name.toLowerCase() === selectedTopicFilter.toLowerCase()));

    const matchesDiff =
      selectedDifficultyFilter === "ALL" || t.difficulty.toUpperCase() === selectedDifficultyFilter.toUpperCase();

    return matchesSearch && matchesDomain && matchesTopic && matchesDiff;
  });

  const handleDomainFilterChange = (domainVal: string) => {
    setSelectedDomainFilter(domainVal);
    if (domainVal === "ALL") {
      // Keep topic filter if still valid
    } else {
      const validTopics = getTopicsForDomain(domainVal).map((top) => top.name.toLowerCase());
      if (selectedTopicFilter !== "ALL" && !validTopics.includes(selectedTopicFilter.toLowerCase())) {
        setSelectedTopicFilter("ALL");
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingTest({
      title: "",
      domain: "Java",
      topics: [
        { name: "OOP Principles", questionCount: 2, weightage: 50 },
        { name: "Collections Framework", questionCount: 2, weightage: 50 },
      ],
      difficulty: "Easy",
      status: "ACTIVE",
      submissionsCount: 0,
      passRate: "0%",
    });
    setTopicError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (test: AdminCodingTest) => {
    setEditingTest({
      ...test,
      topics: test.topics || [
        { name: "Core Fundamentals", questionCount: 2, weightage: 100 },
      ],
    });
    setTopicError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingTest || !editingTest.title?.trim()) {
      toast.error("Please enter a test title.");
      return;
    }
    if (!editingTest.topics || editingTest.topics.length === 0) {
      setTopicError("At least one topic must be selected.");
      toast.error("At least one topic must be chosen.");
      return;
    }

    setSaving(true);
    try {
      const saved = await adminService.saveCodingTest(editingTest as AdminCodingTest);
      setTests((prev) => {
        const exists = prev.some((t) => t.id === saved.id);
        return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev];
      });
      toast.success("Coding test configured & saved successfully!");
      setModalOpen(false);
    } catch (e: any) {
      toast.error("Error saving coding test.");
    } finally {
      setSaving(false);
    }
  };

  // Open Cancel Modal
  const handleOpenCancel = (test: AdminCodingTest) => {
    setTestToCancel(test);
    setCancelReason("Schedule conflict / Maintenance");
    setCancelNote("");
    setCancelModalOpen(true);
  };

  // Confirm Cancel Test with Undo Toast
  const handleConfirmCancel = () => {
    if (!testToCancel) return;

    const originalTest = { ...testToCancel };
    const updatedTest: AdminCodingTest = {
      ...testToCancel,
      status: "CANCELLED",
      cancelReason: `${cancelReason}${cancelNote ? `: ${cancelNote}` : ""}`,
    };

    // Optimistically update status
    setTests((prev) => prev.map((t) => (t.id === testToCancel.id ? updatedTest : t)));
    setCancelModalOpen(false);

    // Show toast with Undo option for 5 seconds
    toast.success(`Test "${testToCancel.title}" has been cancelled.`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          setTests((prev) => prev.map((t) => (t.id === originalTest.id ? originalTest : t)));
          toast.info(`Cancelled test "${originalTest.title}" restored.`);
        },
      },
    });
  };

  if (loading) return <TableSkeleton rows={5} />;

  // Domain options for filter
  const domainOptions: TaxonomySelectOption[] = [
    { value: "ALL", label: "All Domains" },
    ...domains.map((d) => ({
      value: d.slug,
      label: d.name,
    })),
  ];

  // Cascading topic options:
  // If selectedDomainFilter === "ALL", group all topics by domain.
  // If a domain is selected, show only topics for that domain.
  const topicOptions: TaxonomySelectOption[] =
    selectedDomainFilter === "ALL"
      ? [
          { value: "ALL", label: "All Topics" },
          ...domains.flatMap((d) =>
            d.topics.map((t) => ({
              value: t.name,
              label: t.name,
              group: d.name,
            }))
          ),
        ]
      : (() => {
          const currentDomain = domains.find(
            (d) => d.slug === selectedDomainFilter || d.name.toLowerCase() === selectedDomainFilter.toLowerCase()
          );
          return [
            { value: "ALL", label: `All ${currentDomain?.name || ""} Topics` },
            ...(currentDomain?.topics || []).map((t) => ({
              value: t.name,
              label: t.name,
              sublabel: t.subtopics && t.subtopics.length > 0 ? `${t.subtopics.length} subtopics` : undefined,
            })),
          ];
        })();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
            Coding Tests & Topic Management
          </h2>
          <p className="text-xs text-text-secondary">
            Create multi-topic coding benchmarks, configure weightages, and control test life-cycle.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="shrink-0 font-semibold">
          <Plus className="w-4 h-4" /> Create Multi-Topic Test
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-surface border-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search tests by title or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-raised border border-border rounded-lg text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Domain Filter */}
          <div>
            <TaxonomySelect
              options={domainOptions}
              value={selectedDomainFilter}
              onChange={handleDomainFilterChange}
              placeholder="Filter by Domain"
              ariaLabel="Filter tests by domain"
            />
          </div>

          {/* Cascading Topic Filter */}
          <div>
            <TaxonomySelect
              options={topicOptions}
              value={selectedTopicFilter}
              onChange={(val) => setSelectedTopicFilter(val)}
              placeholder="Filter by Topic"
              ariaLabel="Filter tests by topic"
              grouped={selectedDomainFilter === "ALL"}
            />
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficultyFilter}
              onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-red-300">
                {error.isNetworkError
                  ? "Could not reach the server. Make sure the backend is running."
                  : error.is403
                  ? "You do not have permission to view this page."
                  : error.message}
              </p>
              <p className="text-xs text-red-400/80">
                {error.isNetworkError
                  ? "Backend service at http://localhost:8080 is unreachable. Verify that backend is running with ./mvnw.cmd spring-boot:run"
                  : error.is403
                  ? "Administrator privileges required to access coding test management."
                  : "Please check your network connection and retry."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadTests}
            className="border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs shrink-0 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Tests Table */}
      <Card className="p-0 overflow-hidden bg-surface border-border">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={5} />
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-sm font-semibold text-text-primary">
              {error.isNetworkError
                ? "Could not reach the server. Make sure the backend is running."
                : error.is403
                ? "You do not have permission to view this page."
                : error.message}
            </p>
            <Button
              size="sm"
              onClick={loadTests}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs py-1.5 px-3 mx-auto flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Retry Request
            </Button>
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 bg-surface-raised">Domain & Title</th>
                  <th className="p-4 bg-surface-raised">Configured Topics & Weightage</th>
                  <th className="p-4 bg-surface-raised">Difficulty</th>
                  <th className="p-4 bg-surface-raised">Submissions</th>
                  <th className="p-4 bg-surface-raised whitespace-nowrap">Pass Rate</th>
                  <th className="p-4 bg-surface-raised whitespace-nowrap">Status</th>
                  <th className="p-4 bg-surface-raised text-right w-[190px] min-w-[190px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTests.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="p-4 font-semibold text-text-primary space-y-1 max-w-xs">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                        {t.domain || "General"}
                      </span>
                      <span className="block font-medium truncate">{t.title}</span>
                    </td>

                    <td className="p-4 max-w-md">
                      <div className="flex flex-wrap gap-1.5">
                        {t.topics && t.topics.length > 0 ? (
                          t.topics.map((tp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"
                              title={`${tp.name}: ${tp.questionCount} Qs (${tp.weightage}% weight)`}
                            >
                              <Tag className="w-2.5 h-2.5 text-cyan-400" />
                              <span>{tp.name}</span>
                              <span className="opacity-75">({tp.weightage}%)</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted text-[11px] italic">No topics tagged</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge variant={t.difficulty.toLowerCase() as any}>{t.difficulty}</Badge>
                    </td>

                    <td className="p-4 font-mono text-text-secondary">{t.submissionsCount}</td>
                    <td className="p-4 font-mono text-live font-semibold">{t.passRate}</td>

                    <td className="p-4">
                      <Badge
                        variant={
                          t.status === "ACTIVE"
                            ? "active"
                            : t.status === "IN_PROGRESS"
                            ? "live"
                            : t.status === "CANCELLED"
                            ? "danger"
                            : "outline"
                        }
                      >
                        {t.status}
                      </Badge>
                      {t.cancelReason && (
                        <p className="text-[10px] font-mono text-danger line-clamp-1 mt-0.5">
                          {t.cancelReason}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-right w-[190px] min-w-[190px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <RowActions>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(t)}
                          className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/10 hover:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
                          title="Edit Coding Test"
                          aria-label="Edit Coding Test"
                        >
                          <Edit2 className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>

                        {/* Cancel Test Button for in-progress or scheduled non-live tests */}
                        {t.status !== "CANCELLED" && t.status !== "LIVE" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenCancel(t)}
                            className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm border border-red-500/30 text-danger hover:bg-danger-bg/50 hover:border-red-400 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none transition-colors"
                            title="Cancel test and notify participants"
                            aria-label="Cancel test and notify participants"
                          >
                            <Ban className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Cancel</span>
                          </Button>
                        )}
                      </RowActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">No coding tests found matching filters</p>
              <p className="text-xs text-text-muted font-mono mt-1">Try adjusting your domain or topic filter criteria, or create a new test.</p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs py-1.5 px-4 mx-auto flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Test
            </Button>
          </div>
        )}
      </Card>

      {/* CREATE / EDIT DIALOG WITH TOPIC MANAGER */}
      {modalOpen && editingTest && (
        <Dialog
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTest.id ? "Edit Coding Test Configuration" : "Create New Multi-Topic Coding Test"}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
                Save Test Configuration
              </Button>
            </>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Test Title"
              value={editingTest.title || ""}
              onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
              placeholder="e.g. Java Streams & Multithreading Benchmark"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Difficulty Level</label>
                <select
                  value={editingTest.difficulty || "Easy"}
                  onChange={(e) => setEditingTest({ ...editingTest, difficulty: e.target.value as any })}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
                <select
                  value={editingTest.status || "ACTIVE"}
                  onChange={(e) => setEditingTest({ ...editingTest, status: e.target.value as any })}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            {/* Topic Manager Embed */}
            <TopicManager
              domain={editingTest.domain || "Java"}
              onChangeDomain={(d) => setEditingTest({ ...editingTest, domain: d })}
              topics={editingTest.topics || []}
              onChangeTopics={(topList) => {
                setTopicError(null);
                setEditingTest({ ...editingTest, topics: topList });
              }}
              error={topicError}
            />
          </div>
        </Dialog>
      )}

      {/* CANCEL TEST CONFIRMATION MODAL */}
      {cancelModalOpen && testToCancel && (
        <Dialog
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Test: ${testToCancel.title}`}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
                Keep Active
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmCancel} className="bg-danger hover:bg-danger/80">
                <Ban className="w-4 h-4" /> Confirm Cancel Test
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-danger-bg border border-danger/40 rounded-xl text-danger text-xs space-y-1">
              <span className="font-semibold block">⚠️ Are you sure you want to cancel this test?</span>
              <p className="text-[11px] leading-relaxed">
                Cancelling will update status to "CANCELLED" and notify all registered participants. You can undo this action immediately after.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Cancellation Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="Schedule conflict / Maintenance">Schedule conflict / Maintenance</option>
                <option value="Question error or typo fix needed">Question error or typo fix needed</option>
                <option value="Test window postponed by instructor">Test window postponed by instructor</option>
                <option value="Duplicate or test entry error">Duplicate or test entry error</option>
                <option value="Other / Custom Reason">Other / Custom Reason</option>
              </select>
            </div>

            <Input
              label="Optional Note to Students"
              placeholder="e.g. Rescheduled to tomorrow 4 PM due to server upgrade..."
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};
