import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Code2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Clock,
  Award,
  Sliders,
  Calendar,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface CodingTestWizardData {
  id?: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  topics: string[];
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  mixedSplit: { easy: number; medium: number; hard: number };
  problemCount: number;
  timeLimitMinutes: number;
  totalPoints: number;
  problems: {
    id: string;
    title: string;
    statement: string;
    inputFormat: string;
    outputFormat: string;
    sampleInput: string;
    sampleOutput: string;
    difficulty: "Easy" | "Medium" | "Hard";
  }[];
  durationMinutes: number;
  attemptsAllowed: number;
  scheduleStart: string;
  scheduleEnd: string;
  visibility: "ALL" | "BATCH_2026" | "BATCH_2027";
  negativeMarking: boolean;
  shuffleQuestions: boolean;
  status: "DRAFT" | "PUBLISHED";
}

const SUBJECT_OPTIONS = [
  "DSA",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "System Design",
  "Web Development",
  "OOP",
  "AI/ML",
  "Custom",
];

const PRESET_TOPICS: Record<string, string[]> = {
  DSA: ["Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Recursion", "Sorting & Searching"],
  DBMS: ["SQL Joins", "Indexing", "Transactions", "Normalization", "ER Diagrams"],
  "Operating Systems": ["Process Management", "Deadlocks", "Memory Management", "Paging", "Threads & Concurrency"],
  "Computer Networks": ["TCP/IP", "HTTP/HTTPS", "DNS", "Subnetting", "OSI Model"],
  "System Design": ["Load Balancing", "Caching", "Sharding", "API Gateways", "Rate Limiting"],
  "Web Development": ["DOM Manipulation", "REST APIs", "Event Loop", "Promises & Async", "CSS Flex/Grid"],
  OOP: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction", "Design Patterns"],
  "AI/ML": ["Linear Regression", "Neural Networks", "Gradient Descent", "Feature Scaling", "NLP Basics"],
};

export interface CreateCodingTestWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CodingTestWizardData) => Promise<void>;
  initialData?: Partial<CodingTestWizardData>;
}

export const CreateCodingTestWizard: React.FC<CreateCodingTestWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<CodingTestWizardData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    subject: initialData?.subject || "DSA",
    tags: initialData?.tags || ["Placement Prep", "Core"],
    topics: initialData?.topics || ["Arrays", "Strings"],
    difficulty: initialData?.difficulty || "Medium",
    mixedSplit: initialData?.mixedSplit || { easy: 30, medium: 50, hard: 20 },
    problemCount: initialData?.problemCount || 3,
    timeLimitMinutes: initialData?.timeLimitMinutes || 45,
    totalPoints: initialData?.totalPoints || 100,
    problems: initialData?.problems || [
      {
        id: "p-w-1",
        title: "Two Sum Target Match",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        inputFormat: "nums array and target integer",
        outputFormat: "Array of 2 indices",
        sampleInput: "[2, 7, 11, 15], target = 9",
        sampleOutput: "[0, 1]",
        difficulty: "Easy",
      },
    ],
    durationMinutes: initialData?.durationMinutes || 60,
    attemptsAllowed: initialData?.attemptsAllowed || 1,
    scheduleStart: initialData?.scheduleStart || "",
    scheduleEnd: initialData?.scheduleEnd || "",
    visibility: initialData?.visibility || "ALL",
    negativeMarking: initialData?.negativeMarking ?? false,
    shuffleQuestions: initialData?.shuffleQuestions ?? true,
    status: initialData?.status || "DRAFT",
  });

  const [customTopicInput, setCustomTopicInput] = useState("");
  const [customTagInput, setCustomTagInput] = useState("");

  const handleNext = () => {
    if (step === 1 && !formData.title.trim()) {
      toast.error("Please enter a title for the test.");
      return;
    }
    if (step < 5) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const toggleTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  const addCustomTopic = () => {
    if (!customTopicInput.trim()) return;
    if (!formData.topics.includes(customTopicInput.trim())) {
      setFormData((prev) => ({ ...prev, topics: [...prev.topics, customTopicInput.trim()] }));
    }
    setCustomTopicInput("");
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    if (!formData.tags.includes(customTagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, customTagInput.trim()] }));
    }
    setCustomTagInput("");
  };

  const handleComplete = async (publishStatus: "DRAFT" | "PUBLISHED") => {
    setSaving(true);
    try {
      await onSave({ ...formData, status: publishStatus });
      toast.success(publishStatus === "PUBLISHED" ? "Test published successfully!" : "Draft saved!");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to save test.");
    } finally {
      setSaving(false);
    }
  };

  const STEPS = [
    { num: 1, name: "Basics" },
    { num: 2, name: "Topics" },
    { num: 3, name: "Difficulty" },
    { num: 4, name: "Problems" },
    { num: 5, name: "Settings & Publish" },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create Coding Test Wizard" description="Step-by-step test design and publishing panel.">
      <div className="space-y-6 text-xs max-h-[80vh] overflow-y-auto pr-1 font-sans">
        {/* STEPPER HEADER */}
        <div className="flex items-center justify-between border-b border-border pb-3 overflow-x-auto">
          {STEPS.map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              className={cn(
                "flex items-center gap-1.5 cursor-pointer transition-colors px-2 py-1 rounded-lg shrink-0",
                step === s.num
                  ? "bg-cyan-400/15 text-cyan-400 font-bold border border-cyan-400/30"
                  : step > s.num
                  ? "text-live font-medium"
                  : "text-text-muted"
              )}
            >
              <span className="w-5 h-5 rounded-full bg-surface-raised border border-border flex items-center justify-center font-mono text-[10px]">
                {step > s.num ? <CheckCircle2 className="w-3.5 h-3.5 text-live" /> : s.num}
              </span>
              <span>{s.name}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-base font-bold text-text-primary">Step 1: Basic Information</h3>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Test Title *</label>
              <Input
                placeholder="e.g. Mid-Term Placement Coding Assessment 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Description & Instructions</label>
              <textarea
                placeholder="Explain instructions, guidelines, and scoring criteria..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Subject / Domain</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value, topics: [] })}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    className="text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={addCustomTag} type="button">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] gap-1">
                      {t}
                      <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== t) })} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TOPICS */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-base font-bold text-text-primary">
              Step 2: Topic Selection ({formData.subject})
            </h3>
            <p className="text-text-muted">Multi-select topics to include in this assessment round.</p>

            <div className="flex flex-wrap gap-2">
              {(PRESET_TOPICS[formData.subject] || ["General Concepts", "Algorithms"]).map((topic) => {
                const isSelected = formData.topics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5",
                      isSelected
                        ? "bg-cyan-400/20 text-cyan-400 border-cyan-400/50 font-bold"
                        : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    {topic}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 space-y-1.5 border-t border-border">
              <label className="font-semibold text-text-primary">Add Custom Topic</label>
              <div className="flex gap-2 max-w-sm">
                <Input
                  placeholder="e.g. Trie Data Structure"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  className="text-xs"
                />
                <Button variant="outline" size="sm" onClick={addCustomTopic} type="button">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DIFFICULTY */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-base font-bold text-text-primary">Step 3: Difficulty & Weightage</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["Easy", "Medium", "Hard", "Mixed"] as const).map((diff) => (
                <div
                  key={diff}
                  onClick={() => setFormData({ ...formData, difficulty: diff })}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer text-center space-y-1 transition-all",
                    formData.difficulty === diff
                      ? "bg-cyan-400/15 border-cyan-400 text-cyan-400 font-bold shadow-soft"
                      : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                  )}
                >
                  <span className="block font-serif text-sm">{diff}</span>
                  <span className="text-[10px] font-mono text-text-muted block">
                    {diff === "Mixed" ? "Custom Split %" : `${diff} questions`}
                  </span>
                </div>
              ))}
            </div>

            {formData.difficulty === "Mixed" && (
              <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3 font-mono text-xs">
                <span className="font-semibold text-text-primary block">Percentage Split Configuration</span>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Easy: {formData.mixedSplit.easy}%</span>
                    <span>Medium: {formData.mixedSplit.medium}%</span>
                    <span>Hard: {formData.mixedSplit.hard}%</span>
                  </div>
                  <div className="w-full bg-surface h-3 rounded-full flex overflow-hidden border border-border">
                    <div style={{ width: `${formData.mixedSplit.easy}%` }} className="bg-emerald-400" />
                    <div style={{ width: `${formData.mixedSplit.medium}%` }} className="bg-cyan-400" />
                    <div style={{ width: `${formData.mixedSplit.hard}%` }} className="bg-amber-400" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Problem Count</label>
                <Input
                  type="number"
                  value={formData.problemCount}
                  onChange={(e) => setFormData({ ...formData, problemCount: parseInt(e.target.value) || 1 })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Time Limit (Mins)</label>
                <Input
                  type="number"
                  value={formData.timeLimitMinutes}
                  onChange={(e) => setFormData({ ...formData, timeLimitMinutes: parseInt(e.target.value) || 30 })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Total Points</label>
                <Input
                  type="number"
                  value={formData.totalPoints}
                  onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) || 100 })}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PROBLEMS */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-base font-bold text-text-primary">Step 4: Problem Statement Bank</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    problems: [
                      ...prev.problems,
                      {
                        id: `p-${Date.now()}`,
                        title: "New Problem Statement",
                        statement: "Problem description...",
                        inputFormat: "Standard Input",
                        outputFormat: "Standard Output",
                        sampleInput: "1 2",
                        sampleOutput: "3",
                        difficulty: "Medium",
                      },
                    ],
                  }))
                }
                className="text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Problem
              </Button>
            </div>

            <div className="space-y-3">
              {formData.problems.map((p, idx) => (
                <Card key={p.id} className="p-4 bg-surface border-border space-y-2">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="font-mono text-cyan-400 font-bold">Problem #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, problems: formData.problems.filter((pr) => pr.id !== p.id) })}
                      className="text-danger hover:bg-danger/10 p-1 h-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Problem Title..."
                    value={p.title}
                    onChange={(e) => {
                      const updated = [...formData.problems];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, problems: updated });
                    }}
                    className="text-xs font-semibold"
                  />
                  <textarea
                    placeholder="Problem Statement..."
                    value={p.statement}
                    onChange={(e) => {
                      const updated = [...formData.problems];
                      updated[idx].statement = e.target.value;
                      setFormData({ ...formData, problems: updated });
                    }}
                    rows={2}
                    className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none"
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: SETTINGS & PUBLISH */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-base font-bold text-text-primary">Step 5: Assessment Settings & Publish</h3>

            <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
              <span className="font-mono text-xs text-cyan-400 font-bold block uppercase">Live Summary Card</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-text-secondary">
                <div>Title: <span className="text-text-primary font-bold">{formData.title}</span></div>
                <div>Domain: <span className="text-cyan-400">{formData.subject}</span></div>
                <div>Difficulty: <span className="text-amber-400">{formData.difficulty}</span></div>
                <div>Topics: <span className="text-text-primary">{formData.topics.join(", ") || "General"}</span></div>
                <div>Duration: <span className="text-text-primary">{formData.durationMinutes} mins</span></div>
                <div>Problems: <span className="text-text-primary">{formData.problems.length} items</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Student Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                >
                  <option value="ALL">All Students</option>
                  <option value="BATCH_2026">Batch 2026</option>
                  <option value="BATCH_2027">Batch 2027</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Attempts Allowed</label>
                <Input
                  type="number"
                  value={formData.attemptsAllowed}
                  onChange={(e) => setFormData({ ...formData, attemptsAllowed: parseInt(e.target.value) || 1 })}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION FOOTER */}
        <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
          <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 1 || saving}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          {step < 5 ? (
            <Button variant="primary" size="sm" onClick={handleNext}>
              Next Step <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                isLoading={saving}
                onClick={() => handleComplete("DRAFT")}
              >
                Save as Draft
              </Button>
              <Button
                variant="teal-cyan"
                size="sm"
                isLoading={saving}
                onClick={() => handleComplete("PUBLISHED")}
              >
                <Sparkles className="w-4 h-4" /> Publish Assessment
              </Button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
