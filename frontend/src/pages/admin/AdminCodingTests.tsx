import React, { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { AdminCodingTest, TopicConfig } from "@/mocks/adminData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { TopicManager } from "@/components/admin/TopicManager";
import {
  TaxonomySelect,
  TaxonomySelectOption,
} from "@/components/ui/TaxonomySelect";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import {
  Plus,
  Edit2,
  Code2,
  Search,
  Copy,
  Archive,
  Trash2,
  Filter,
  Ban,
  RotateCw,
  AlertCircle,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export const AdminCodingTests: React.FC = () => {
  const { domains, getTopicsForDomain, normalizeDomain } = useTaxonomy();

  const [tests, setTests] = useState<AdminCodingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    is403: boolean;
    isNetworkError: boolean;
  } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomainFilter, setSelectedDomainFilter] = useState("ALL");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("ALL");
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] =
    useState("ALL");

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] =
    useState<Partial<AdminCodingTest> | null>(null);
  const [saving, setSaving] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [testToCancel, setTestToCancel] =
    useState<AdminCodingTest | null>(null);
  const [cancelReason, setCancelReason] = useState(
    "Schedule conflict / Maintenance"
  );
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
      const isNetworkError =
        !err?.response || err?.code === "ERR_NETWORK";

      let message = "An error occurred while loading coding tests.";

      if (isNetworkError) {
        message =
          "Could not reach the server. Make sure the backend is running.";
      } else if (is403) {
        message = "You do not have permission to view this page.";
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }

      setError({
        message,
        is403,
        isNetworkError,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Filter tests
  const filteredTests = tests.filter((test) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      test.title.toLowerCase().includes(query) ||
      (test.domain || "").toLowerCase().includes(query);

    const testDomainSlug = normalizeDomain(test.domain || "");

    const matchesDomain =
      selectedDomainFilter === "ALL" ||
      testDomainSlug === selectedDomainFilter ||
      (test.domain &&
        test.domain.toLowerCase() === selectedDomainFilter.toLowerCase()) ||
      domains.find((domain) => domain.slug === selectedDomainFilter)?.name
        .toLowerCase() === (test.domain || "").toLowerCase();

    const matchesTopic =
      selectedTopicFilter === "ALL" ||
      (test.topics &&
        test.topics.some(
          (topic) =>
            topic.name.toLowerCase() ===
            selectedTopicFilter.toLowerCase()
        ));

    const matchesDifficulty =
      selectedDifficultyFilter === "ALL" ||
      test.difficulty.toUpperCase() === selectedDifficultyFilter;

    return (
      matchesSearch &&
      matchesDomain &&
      matchesTopic &&
      matchesDifficulty
    );
  });

  const handleDomainFilterChange = (domainValue: string) => {
    setSelectedDomainFilter(domainValue);

    if (domainValue === "ALL") {
      return;
    }

    const validTopics = getTopicsForDomain(domainValue).map((topic) =>
      topic.name.toLowerCase()
    );

    if (
      selectedTopicFilter !== "ALL" &&
      !validTopics.includes(selectedTopicFilter.toLowerCase())
    ) {
      setSelectedTopicFilter("ALL");
    }
  };

  const handleOpenCreate = () => {
    setEditingTest({
      title: "",
      domain: "Java",
      topics: [
        {
          name: "OOP Principles",
          questionCount: 2,
          weightage: 50,
        },
        {
          name: "Collections Framework",
          questionCount: 2,
          weightage: 50,
        },
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
      topics:
        test.topics || [
          {
            name: "Core Fundamentals",
            questionCount: 2,
            weightage: 100,
          },
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

    if (!editingTest.domain?.trim()) {
      toast.error("Please select a domain.");
      return;
    }

    if (!editingTest.topics || editingTest.topics.length === 0) {
      setTopicError("At least one topic must be selected.");
      toast.error("At least one topic must be chosen.");
      return;
    }

    setSaving(true);

    try {
      const saved = await adminService.saveCodingTest(
        editingTest as AdminCodingTest
      );

      setTests((previous) => {
        const exists = previous.some((test) => test.id === saved.id);

        return exists
          ? previous.map((test) =>
              test.id === saved.id ? saved : test
            )
          : [saved, ...previous];
      });

      toast.success("Coding test configured & saved successfully!");
      setModalOpen(false);
      setEditingTest(null);
    } catch (err) {
      console.error("Failed to save coding test:", err);
      toast.error("Error saving coding test.");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (
    test: AdminCodingTest,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    try {
      const duplicateData: Partial<AdminCodingTest> = {
        title: `${test.title} (Copy)`,
        domain: test.domain,
        topics: test.topics,
        difficulty: test.difficulty,
        status: "DRAFT",
        submissionsCount: 0,
        passRate: "0%",
      };

      const saved = await adminService.saveCodingTest(duplicateData);

      setTests((previous) => [saved, ...previous]);

      toast.success(`Duplicated test: ${saved.title}`);
    } catch (err) {
      console.error("Failed to duplicate coding test:", err);
      toast.error("Failed to duplicate test.");
    }
  };

  const handleArchive = async (
    test: AdminCodingTest,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    try {
      const newStatus =
        test.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";

      const updated = await adminService.saveCodingTest({
        ...test,
        status: newStatus,
      });

      setTests((previous) =>
        previous.map((item) =>
          item.id === test.id ? updated : item
        )
      );

      toast.success(`Test status changed to ${newStatus}`);
    } catch (err) {
      console.error("Failed to change test status:", err);
      toast.error("Failed to change status.");
    }
  };

  const handleDelete = async (
    test: AdminCodingTest,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${test.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await adminService.deleteCodingTest(test.id);

      setTests((previous) =>
        previous.filter((item) => item.id !== test.id)
      );

      toast.success(`Deleted test: ${test.title}`);
    } catch (err) {
      console.error("Failed to delete coding test:", err);
      toast.error("Failed to delete test.");
    }
  };

  const handleOpenCancel = (test: AdminCodingTest) => {
    setTestToCancel(test);
    setCancelReason("Schedule conflict / Maintenance");
    setCancelNote("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!testToCancel) {
      return;
    }

    const originalTest = { ...testToCancel };

    const updatedTest: AdminCodingTest = {
      ...testToCancel,
      status: "CANCELLED",
      cancelReason: `${cancelReason}${
        cancelNote ? `: ${cancelNote}` : ""
      }`,
    };

    setTests((previous) =>
      previous.map((test) =>
        test.id === testToCancel.id ? updatedTest : test
      )
    );

    setCancelModalOpen(false);
    setTestToCancel(null);

    toast.success(
      `Test "${testToCancel.title}" has been cancelled.`,
      {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            setTests((previous) =>
              previous.map((test) =>
                test.id === originalTest.id
                  ? originalTest
                  : test
              )
            );

            toast.info(
              `Cancelled test "${originalTest.title}" restored.`
            );
          },
        },
      }
    );
  };

  const domainOptions: TaxonomySelectOption[] = [
    {
      value: "ALL",
      label: "All Domains",
    },
    ...domains.map((domain) => ({
      value: domain.slug,
      label: domain.name,
    })),
  ];

  const topicOptions: TaxonomySelectOption[] =
    selectedDomainFilter === "ALL"
      ? [
          {
            value: "ALL",
            label: "All Topics",
          },
          ...domains.flatMap((domain) =>
            domain.topics.map((topic) => ({
              value: topic.name,
              label: topic.name,
              group: domain.name,
            }))
          ),
        ]
      : (() => {
          const currentDomain = domains.find(
            (domain) =>
              domain.slug === selectedDomainFilter ||
              domain.name.toLowerCase() ===
                selectedDomainFilter.toLowerCase()
          );

          return [
            {
              value: "ALL",
              label: `All ${currentDomain?.name || ""} Topics`,
            },
            ...(currentDomain?.topics || []).map((topic) => ({
              value: topic.name,
              label: topic.name,
              sublabel:
                topic.subtopics && topic.subtopics.length > 0
                  ? `${topic.subtopics.length} subtopics`
                  : undefined,
            })),
          ];
        })();

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            Assessment Management
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
            Coding Tests & Topic Management
          </h2>

          <p className="text-xs text-text-secondary">
            Create multi-topic coding benchmarks, configure
            weightages, and control test life-cycle.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          className="shrink-0 font-semibold"
        >
          <Plus className="w-4 h-4" />
          Create Multi-Topic Test
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-surface border-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />

            <input
              type="text"
              placeholder="Search tests by title or domain..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              className="w-full pl-9 pr-3 py-2 bg-surface-raised border border-border rounded-lg text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <TaxonomySelect
              options={domainOptions}
              value={selectedDomainFilter}
              onChange={handleDomainFilterChange}
              placeholder="Filter by Domain"
              ariaLabel="Filter tests by domain"
            />
          </div>

          <div>
            <TaxonomySelect
              options={topicOptions}
              value={selectedTopicFilter}
              onChange={(value) =>
                setSelectedTopicFilter(value)
              }
              placeholder="Filter by Topic"
              ariaLabel="Filter tests by topic"
              grouped={selectedDomainFilter === "ALL"}
            />
          </div>

          <div>
            <select
              value={selectedDifficultyFilter}
              onChange={(event) =>
                setSelectedDifficultyFilter(event.target.value)
              }
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
                  ? "Backend service at http://localhost:8080 is unreachable. Verify that backend is running."
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
            <RotateCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Tests Table */}
      <Card className="p-0 overflow-hidden bg-surface border-border">
        {error ? (
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
              <RotateCw className="w-3.5 h-3.5" />
              Retry Request
            </Button>
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 bg-surface-raised">
                    Domain & Title
                  </th>

                  <th className="p-4 bg-surface-raised">
                    Configured Topics & Weightage
                  </th>

                  <th className="p-4 bg-surface-raised">
                    Difficulty
                  </th>

                  <th className="p-4 bg-surface-raised">
                    Submissions
                  </th>

                  <th className="p-4 bg-surface-raised">
                    Pass Rate
                  </th>

                  <th className="p-4 bg-surface-raised">
                    Status
                  </th>

                  <th className="p-4 bg-surface-raised text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredTests.map((test) => (
                  <tr
                    key={test.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="p-4 font-semibold text-text-primary space-y-1 max-w-xs">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                        {test.domain || "General"}
                      </span>

                      <span className="block font-medium truncate">
                        {test.title}
                      </span>
                    </td>

                    <td className="p-4 max-w-md">
                      <div className="flex flex-wrap gap-1.5">
                        {test.topics && test.topics.length > 0 ? (
                          test.topics.map(
                            (topic: TopicConfig, index) => (
                              <span
                                key={`${topic.name}-${index}`}
                                className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"
                                title={`${topic.name}: ${topic.questionCount} Qs (${topic.weightage}% weight)`}
                              >
                                <Tag className="w-2.5 h-2.5 text-cyan-400" />
                                <span>{topic.name}</span>
                                <span className="opacity-75">
                                  ({topic.weightage}%)
                                </span>
                              </span>
                            )
                          )
                        ) : (
                          <span className="text-text-muted text-[11px] italic">
                            No topics tagged
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={test.difficulty.toLowerCase() as any}
                      >
                        {test.difficulty}
                      </Badge>
                    </td>

                    <td className="p-4 font-mono text-text-secondary">
                      {test.submissionsCount}
                    </td>

                    <td className="p-4 font-mono text-live font-semibold">
                      {test.passRate}
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          test.status === "ACTIVE"
                            ? "active"
                            : test.status === "IN_PROGRESS"
                            ? "live"
                            : test.status === "CANCELLED"
                            ? "danger"
                            : "outline"
                        }
                      >
                        {test.status}
                      </Badge>

                      {test.cancelReason && (
                        <p className="text-[10px] font-mono text-danger line-clamp-1 mt-0.5">
                          {test.cancelReason}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(test)}
                        className="text-xs h-8"
                        title="Edit Test"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) =>
                          handleDuplicate(test, event)
                        }
                        title="Duplicate Test"
                      >
                        <Copy className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) =>
                          handleArchive(test, event)
                        }
                        title={
                          test.status === "ARCHIVED"
                            ? "Unarchive Test"
                            : "Archive Test"
                        }
                      >
                        <Archive className="w-3.5 h-3.5 text-amber-400" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) =>
                          handleDelete(test, event)
                        }
                        title="Delete Test"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>

                      {test.status !== "CANCELLED" &&
                        test.status !== "LIVE" &&
                        test.status !== "ARCHIVED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleOpenCancel(test)
                            }
                            className="text-xs h-8 text-danger hover:bg-danger-bg/50"
                            title="Cancel test"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </Button>
                        )}
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
              <p className="text-sm font-semibold text-text-primary">
                No coding tests found matching filters
              </p>

              <p className="text-xs text-text-muted font-mono mt-1">
                Try adjusting your domain or topic filter
                criteria, or create a new test.
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs py-1.5 px-4 mx-auto flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Test
            </Button>
          </div>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      {modalOpen && editingTest && (
        <Dialog
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            editingTest.id
              ? "Edit Coding Test Configuration"
              : "Create New Multi-Topic Coding Test"
          }
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={saving}
              >
                Save Test Configuration
              </Button>
            </>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Test Title"
              value={editingTest.title || ""}
              onChange={(event) =>
                setEditingTest({
                  ...editingTest,
                  title: event.target.value,
                })
              }
              placeholder="e.g. Java Streams & Multithreading Benchmark"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Difficulty Level
                </label>

                <select
                  value={editingTest.difficulty || "Easy"}
                  onChange={(event) =>
                    setEditingTest({
                      ...editingTest,
                      difficulty: event.target.value as
                        | "Easy"
                        | "Medium"
                        | "Hard",
                    })
                  }
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Status
                </label>

                <select
                  value={editingTest.status || "ACTIVE"}
                  onChange={(event) =>
                    setEditingTest({
                      ...editingTest,
                      status: event.target.value as AdminCodingTest["status"],
                    })
                  }
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="LIVE">LIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            <TopicManager
              domain={editingTest.domain || "Java"}
              onChangeDomain={(domain) =>
                setEditingTest({
                  ...editingTest,
                  domain,
                })
              }
              topics={editingTest.topics || []}
              onChangeTopics={(topics) => {
                setTopicError(null);

                setEditingTest({
                  ...editingTest,
                  topics,
                });
              }}
              error={topicError}
            />
          </div>
        </Dialog>
      )}

      {/* Cancel Test Dialog */}
      {cancelModalOpen && testToCancel && (
        <Dialog
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Test: ${testToCancel.title}`}
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCancelModalOpen(false)}
              >
                Keep Active
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancel}
                className="bg-danger hover:bg-danger/80"
              >
                <Ban className="w-4 h-4" />
                Confirm Cancel Test
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-danger-bg border border-danger/40 rounded-xl text-danger text-xs space-y-1">
              <span className="font-semibold block">
                ⚠️ Are you sure you want to cancel this test?
              </span>

              <p className="text-[11px] leading-relaxed">
                Cancelling will update status to "CANCELLED" and
                notify all registered participants. You can undo
                this action immediately after.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Cancellation Reason
              </label>

              <select
                value={cancelReason}
                onChange={(event) =>
                  setCancelReason(event.target.value)
                }
                className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="Schedule conflict / Maintenance">
                  Schedule conflict / Maintenance
                </option>

                <option value="Question error or typo fix needed">
                  Question error or typo fix needed
                </option>

                <option value="Test window postponed by instructor">
                  Test window postponed by instructor
                </option>

                <option value="Duplicate or test entry error">
                  Duplicate or test entry error
                </option>

                <option value="Other / Custom Reason">
                  Other / Custom Reason
                </option>
              </select>
            </div>

            <Input
              label="Optional Note to Students"
              placeholder="e.g. Rescheduled to tomorrow 4 PM due to server upgrade..."
              value={cancelNote}
              onChange={(event) =>
                setCancelNote(event.target.value)
              }
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};