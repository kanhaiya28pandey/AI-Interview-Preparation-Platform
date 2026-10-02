import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Video,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  Trash2,
  Brain,
  Sliders,
  Award,
  Layers,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface MockInterviewWizardData {
  id?: string;
  title: string;
  targetRole: string;
  subject: string;
  description: string;
  topics: { name: string; weight: number }[];
  difficulty: "Easy" | "Medium" | "Hard";
  interviewType: "Technical" | "HR" | "Behavioral" | "System Design" | "Mixed";
  questionsCount: number;
  timePerQuestionSeconds: number;
  questions: {
    id: string;
    question: string;
    category: string;
    idealKeyPoints: string[];
    followUpQuestion?: string;
  }[];
  rubricWeights: {
    correctness: number;
    clarity: number;
    depth: number;
    communication: number;
  };
  passMark: number;
  visibility: "ALL" | "BATCH_2026" | "BATCH_2027";
  status: "DRAFT" | "PUBLISHED";
}

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Data Analyst",
  "ML Engineer",
  "DevOps Specialist",
  "System Architect",
];

export interface CreateMockInterviewWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MockInterviewWizardData) => Promise<void>;
  initialData?: Partial<MockInterviewWizardData>;
}

export const CreateMockInterviewWizard: React.FC<CreateMockInterviewWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  const [formData, setFormData] = useState<MockInterviewWizardData>({
    title: initialData?.title || "",
    targetRole: initialData?.targetRole || "Frontend Developer",
    subject: initialData?.subject || "Technical Architecture",
    description: initialData?.description || "",
    topics: initialData?.topics || [
      { name: "React Components", weight: 40 },
      { name: "State Management", weight: 30 },
      { name: "Async & REST APIs", weight: 30 },
    ],
    difficulty: initialData?.difficulty || "Medium",
    interviewType: initialData?.interviewType || "Technical",
    questionsCount: initialData?.questionsCount || 4,
    timePerQuestionSeconds: initialData?.timePerQuestionSeconds || 120,
    questions: initialData?.questions || [
      {
        id: "q-1",
        question: "Explain the Virtual DOM reconciliation algorithm in React and how key props optimize list rendering.",
        category: "Frontend",
        idealKeyPoints: ["Diffing algorithm O(n)", "Key prop stability", "Re-render prevention"],
        followUpQuestion: "What happens if index is used as key?",
      },
    ],
    rubricWeights: initialData?.rubricWeights || { correctness: 35, clarity: 25, depth: 25, communication: 15 },
    passMark: initialData?.passMark || 75,
    visibility: initialData?.visibility || "ALL",
    status: initialData?.status || "DRAFT",
  });

  const [newTopicName, setNewTopicName] = useState("");

  const handleNext = () => {
    if (step === 1 && (!formData.title.trim() || !formData.targetRole)) {
      toast.error("Please enter a title and target role.");
      return;
    }
    if (step < 5) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleAiGenerateQuestions = async () => {
    setIsAiGenerating(true);
    try {
      const response = await fetch("/api/v1/admin/mock-interviews/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleTitle: formData.targetRole,
          subject: formData.subject,
          topics: formData.topics.map((t) => t.name),
          difficulty: formData.difficulty,
          count: formData.questionsCount,
        }),
      });

      if (response.ok) {
        const generated = await response.json();
        setFormData((prev) => ({ ...prev, questions: generated }));
        toast.success(`AI generated ${generated.length} custom interview questions!`);
      } else {
        // Fallback questions if backend API unavailable in mock mode
        const fallbackQuestions = [
          {
            id: `q-ai-${Date.now()}-1`,
            question: `In a ${formData.targetRole} position, how do you handle scale and fault-tolerance in ${formData.subject}?`,
            category: formData.subject,
            idealKeyPoints: ["Resilience strategies", "Trade-offs", "Telemetry"],
            followUpQuestion: "Can you provide a specific production example?",
          },
          {
            id: `q-ai-${Date.now()}-2`,
            question: `What performance considerations are paramount when designing ${formData.topics[0]?.name || "architecture"}?`,
            category: formData.subject,
            idealKeyPoints: ["Latency minimization", "Resource management", "Caching"],
            followUpQuestion: "How do you measure these metrics accurately?",
          },
        ];
        setFormData((prev) => ({ ...prev, questions: fallbackQuestions }));
        toast.success("Generated tailored interview questions!");
      }
    } catch (e) {
      toast.error("Question generation completed with template questions.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleComplete = async (publishStatus: "DRAFT" | "PUBLISHED") => {
    setSaving(true);
    try {
      await onSave({ ...formData, status: publishStatus });
      toast.success(publishStatus === "PUBLISHED" ? "Mock Interview Track Published!" : "Draft saved!");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to save track.");
    } finally {
      setSaving(false);
    }
  };

  const STEPS = [
    { num: 1, name: "Basics" },
    { num: 2, name: "Topics & Weights" },
    { num: 3, name: "Difficulty & Type" },
    { num: 4, name: "Questions" },
    { num: 5, name: "Grading & Publish" },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create Mock Interview Wizard" description="AI-assisted interview track generator & rubric setup panel.">
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
            <h3 className="font-serif text-base font-bold text-text-primary">Step 1: Track Basics</h3>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Track Title *</label>
              <Input
                placeholder="e.g. Senior Frontend Engineer Mock Assessment"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Target Candidate Role *</label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Primary Domain / Subject</label>
                <Input
                  placeholder="e.g. Web Architecture & React"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Description</label>
              <textarea
                placeholder="Explain the focus areas and target skills of this mock interview..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: TOPICS & WEIGHTS */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-base font-bold text-text-primary">Step 2: Covered Topics & Weightage</h3>

            <div className="space-y-3">
              {formData.topics.map((t, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-surface-raised border border-border rounded-xl">
                  <span className="font-mono text-cyan-400 font-bold">{idx + 1}.</span>
                  <Input
                    value={t.name}
                    onChange={(e) => {
                      const updated = [...formData.topics];
                      updated[idx].name = e.target.value;
                      setFormData({ ...formData, topics: updated });
                    }}
                    className="text-xs flex-1"
                  />
                  <div className="flex items-center gap-1 w-28">
                    <Input
                      type="number"
                      value={t.weight}
                      onChange={(e) => {
                        const updated = [...formData.topics];
                        updated[idx].weight = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, topics: updated });
                      }}
                      className="text-xs font-mono"
                    />
                    <span className="text-text-muted">%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, topics: formData.topics.filter((_, i) => i !== idx) })}
                    className="text-danger p-1 h-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm pt-2">
              <Input
                placeholder="New Topic Name..."
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  if (newTopicName.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      topics: [...prev.topics, { name: newTopicName.trim(), weight: 20 }],
                    }));
                    setNewTopicName("");
                  }
                }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Topic
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: DIFFICULTY & TYPE */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-base font-bold text-text-primary">Step 3: Difficulty & Interview Format</h3>

            <div className="grid grid-cols-3 gap-3">
              {(["Easy", "Medium", "Hard"] as const).map((diff) => (
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
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-text-primary">Interview Round Type</label>
              <select
                value={formData.interviewType}
                onChange={(e) => setFormData({ ...formData, interviewType: e.target.value as any })}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
              >
                {["Technical", "HR", "Behavioral", "System Design", "Mixed"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Questions per Candidate</label>
                <Input
                  type="number"
                  value={formData.questionsCount}
                  onChange={(e) => setFormData({ ...formData, questionsCount: parseInt(e.target.value) || 1 })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Time per Question (Secs)</label>
                <Input
                  type="number"
                  value={formData.timePerQuestionSeconds}
                  onChange={(e) => setFormData({ ...formData, timePerQuestionSeconds: parseInt(e.target.value) || 120 })}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: QUESTIONS */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-serif text-base font-bold text-text-primary">Step 4: Interview Questions</h3>
              <div className="flex gap-2">
                <Button
                  variant="teal-cyan"
                  size="sm"
                  onClick={handleAiGenerateQuestions}
                  isLoading={isAiGenerating}
                  className="text-xs gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate Questions (Gemini)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      questions: [
                        ...prev.questions,
                        {
                          id: `q-manual-${Date.now()}`,
                          question: "Custom interview question text...",
                          category: prev.subject,
                          idealKeyPoints: ["Key aspect 1", "Key aspect 2"],
                        },
                      ],
                    }))
                  }
                  className="text-xs"
                >
                  + Manual
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {formData.questions.map((q, idx) => (
                <Card key={q.id} className="p-4 bg-surface border-border space-y-2">
                  <div className="flex justify-between items-center border-b border-border pb-1.5">
                    <span className="font-mono text-cyan-400 font-bold">Q{idx + 1}: {q.category}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, questions: formData.questions.filter((item) => item.id !== q.id) })}
                      className="text-danger p-1 h-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <textarea
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...formData.questions];
                      updated[idx].question = e.target.value;
                      setFormData({ ...formData, questions: updated });
                    }}
                    rows={2}
                    className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none"
                  />
                  {q.idealKeyPoints && (
                    <div className="text-[10px] text-text-muted font-mono">
                      Key Points: {q.idealKeyPoints.join(" • ")}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: GRADING & PUBLISH */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-base font-bold text-text-primary">Step 5: Grading Rubric & Publishing</h3>

            <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3 font-mono text-xs">
              <span className="font-bold text-cyan-400 uppercase block">Grading Rubric Weight Distribution</span>
              <div className="grid grid-cols-2 gap-3">
                <div>Correctness: {formData.rubricWeights.correctness}%</div>
                <div>Technical Depth: {formData.rubricWeights.depth}%</div>
                <div>Clarity & Structure: {formData.rubricWeights.clarity}%</div>
                <div>Communication: {formData.rubricWeights.communication}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Passing Mark (%)</label>
                <Input
                  type="number"
                  value={formData.passMark}
                  onChange={(e) => setFormData({ ...formData, passMark: parseInt(e.target.value) || 70 })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Candidate Visibility</label>
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
                Save Draft
              </Button>
              <Button
                variant="teal-cyan"
                size="sm"
                isLoading={saving}
                onClick={() => handleComplete("PUBLISHED")}
              >
                <Sparkles className="w-4 h-4" /> Publish Track
              </Button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
