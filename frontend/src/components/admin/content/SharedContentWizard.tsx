import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Save,
  Send,
  AlertCircle,
  Clock,
  Layers,
  Award,
  Calendar,
  Users,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ContentItem, ContentType, ContentStatus, contentManagerService } from "@/services/contentManagerService";

// Type specific editors
import { QuizEditor } from "./QuizEditor";
import { MockTestEditor } from "./MockTestEditor";
import { CodingEditor } from "./CodingEditor";
import { InterviewEditor } from "./InterviewEditor";
import { PracticeEditor } from "./PracticeEditor";
import { ArticleEditor } from "./ArticleEditor";
import { useTaxonomy } from "@/hooks/useTaxonomy";

const PRESET_SUBJECTS: Record<string, string[]> = {
  DSA: ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Recursion", "Sorting & Searching"],
  DBMS: ["SQL", "Normalization", "Indexing", "Transactions & ACID", "Query Optimization", "NoSQL"],
  OS: ["Processes & Threads", "CPU Scheduling", "Deadlocks", "Memory Management", "File Systems"],
  Networks: ["OSI Model", "TCP/IP", "DNS & HTTP", "Routing Protocols", "Sockets", "Network Security"],
  "System Design": ["Load Balancing", "Caching", "Database Sharding", "Message Queues", "CAP Theorem", "Microservices"],
  "Web Dev": ["React", "TypeScript", "Node.js", "REST APIs", "GraphQL", "State Management", "Tailwind CSS"],
  OOP: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction", "Design Patterns", "SOLID Principles"],
  "AI/ML": ["Supervised Learning", "Deep Learning", "NLP", "Neural Networks", "Feature Engineering", "Evaluation Metrics"],
  Aptitude: ["Quantitative Ability", "Logical Reasoning", "Data Interpretation", "Verbal Ability"],
  HR: ["Behavioral Questions", "Cultural Fit", "Situation-Task-Action-Result", "Conflict Resolution"],
};

interface SharedContentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (item: ContentItem) => void;
  initialType?: ContentType;
  editingItem?: ContentItem | null;
}

export const SharedContentWizard: React.FC<SharedContentWizardProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialType = "QUIZ",
  editingItem = null,
}) => {
  const { domains, getTopicsForDomain } = useTaxonomy();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form State
  const [contentType, setContentType] = useState<ContentType>(editingItem?.type || initialType);
  const [title, setTitle] = useState(editingItem?.title || "");
  const [description, setDescription] = useState(editingItem?.description || "");
  const [subject, setSubject] = useState(editingItem?.subject || "DSA");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(editingItem?.topics || []);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [tags, setTags] = useState<string[]>(editingItem?.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Difficulty State
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">(
    editingItem?.difficulty || "Medium"
  );
  const [difficultySplit, setDifficultySplit] = useState<Record<string, number>>(
    editingItem?.difficultySplit || { Easy: 30, Medium: 50, Hard: 20 }
  );

  // Settings State
  const [durationMinutes, setDurationMinutes] = useState(editingItem?.settings?.durationMinutes || 45);
  const [attemptsAllowed, setAttemptsAllowed] = useState(editingItem?.settings?.attemptsAllowed || 3);
  const [passPercentage, setPassPercentage] = useState(editingItem?.settings?.passPercentage || 70);
  const [negativeMarking, setNegativeMarking] = useState(editingItem?.settings?.negativeMarking || false);
  const [negativePenalty, setNegativePenalty] = useState(editingItem?.settings?.negativePenalty || 0.25);
  const [shuffleQuestions, setShuffleQuestions] = useState(editingItem?.settings?.shuffleQuestions ?? true);
  const [shuffleOptions, setShuffleOptions] = useState(editingItem?.settings?.shuffleOptions ?? true);
  const [startDate, setStartDate] = useState(editingItem?.settings?.startDate || "");
  const [endDate, setEndDate] = useState(editingItem?.settings?.endDate || "");
  const [visibility, setVisibility] = useState(editingItem?.settings?.visibility || "ALL");
  const [batchTarget, setBatchTarget] = useState(editingItem?.settings?.batchTarget || "");
  const [showAnswersAfterSubmit, setShowAnswersAfterSubmit] = useState(
    editingItem?.settings?.showAnswersAfterSubmit ?? true
  );

  // Type-specific Content Data
  const [contentData, setContentData] = useState<Record<string, any>>(editingItem?.contentData || {});

  // Sync when editingItem or initialType changes
  useEffect(() => {
    if (editingItem) {
      setContentType(editingItem.type);
      setTitle(editingItem.title);
      setDescription(editingItem.description);
      setSubject(editingItem.subject);
      setSelectedTopics(editingItem.topics || []);
      setTags(editingItem.tags || []);
      setDifficulty(editingItem.difficulty);
      setDifficultySplit(editingItem.difficultySplit || { Easy: 30, Medium: 50, Hard: 20 });
      setDurationMinutes(editingItem.settings?.durationMinutes || 45);
      setAttemptsAllowed(editingItem.settings?.attemptsAllowed || 3);
      setPassPercentage(editingItem.settings?.passPercentage || 70);
      setNegativeMarking(editingItem.settings?.negativeMarking || false);
      setNegativePenalty(editingItem.settings?.negativePenalty || 0.25);
      setShuffleQuestions(editingItem.settings?.shuffleQuestions ?? true);
      setShuffleOptions(editingItem.settings?.shuffleOptions ?? true);
      setStartDate(editingItem.settings?.startDate || "");
      setEndDate(editingItem.settings?.endDate || "");
      setVisibility(editingItem.settings?.visibility || "ALL");
      setBatchTarget(editingItem.settings?.batchTarget || "");
      setShowAnswersAfterSubmit(editingItem.settings?.showAnswersAfterSubmit ?? true);
      setContentData(editingItem.contentData || {});
      setHasUnsavedChanges(false);
    } else {
      setContentType(initialType);
    }
  }, [editingItem, initialType]);

  // Body scroll lock hook
  useBodyScrollLock(isOpen);

  // Draft autosave to localStorage
  useEffect(() => {
    if (!editingItem && title) {
      const draft = {
        contentType,
        title,
        description,
        subject,
        selectedTopics,
        difficulty,
        settings: { durationMinutes, attemptsAllowed, passPercentage },
        contentData,
      };
      try {
        localStorage.setItem("admin_wizard_autosave", JSON.stringify(draft));
        setHasUnsavedChanges(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, [title, description, selectedTopics, difficulty, contentData]);

  // Keyboard shortcut handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showExitWarning) {
          setShowExitWarning(false);
        } else {
          handleAttemptClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showExitWarning, hasUnsavedChanges]);

  const activeSubject = subject === "Custom" ? customSubject : (subject || "DSA");
  const taxonomyTopics = (getTopicsForDomain(activeSubject) || []).map((t) => t.name);
  const availableTopics =
    subject === "Custom"
      ? []
      : taxonomyTopics.length > 0
      ? taxonomyTopics
      : PRESET_SUBJECTS[subject] || [];

  const handleToggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
    setHasUnsavedChanges(true);
  };

  const handleAddCustomTopic = () => {
    if (customTopicInput.trim() && !selectedTopics.includes(customTopicInput.trim())) {
      setSelectedTopics([...selectedTopics, customTopicInput.trim()]);
      setCustomTopicInput("");
      setHasUnsavedChanges(true);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
    setHasUnsavedChanges(true);
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return title.trim().length >= 3 && (subject !== "Custom" || customSubject.trim().length > 0);
    }
    if (step === 2) {
      return selectedTopics.length > 0;
    }
    if (step === 3) {
      return true;
    }
    if (step === 4) {
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
    }
  };

  const handleSave = async (status: ContentStatus) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<ContentItem> = {
        title: title.trim(),
        description: description.trim(),
        type: contentType,
        subject: activeSubject,
        topics: selectedTopics,
        tags,
        difficulty,
        difficultySplit: difficulty === "Mixed" ? difficultySplit : undefined,
        status,
        settings: {
          durationMinutes,
          attemptsAllowed,
          passPercentage,
          negativeMarking,
          negativePenalty,
          shuffleQuestions,
          shuffleOptions,
          startDate: startDate || null,
          endDate: endDate || null,
          visibility,
          batchTarget: visibility === "BATCH" ? batchTarget : null,
          showAnswersAfterSubmit,
        },
        contentData,
      };

      let saved: ContentItem;
      if (editingItem) {
        saved = await contentManagerService.updateContent(editingItem.id, payload);
      } else {
        saved = await contentManagerService.createContent(payload);
      }

      setHasUnsavedChanges(false);
      localStorage.removeItem("admin_wizard_autosave");
      onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error("Save content failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      setShowExitWarning(true);
    } else {
      onClose();
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-surface border border-border rounded-none sm:rounded-2xl w-full max-w-6xl h-dvh sm:h-auto sm:max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* WIZARD HEADER */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border flex items-center justify-between bg-surface-raised shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 id="wizard-modal-title" className="text-sm font-bold text-text-primary truncate">
                {editingItem ? `Edit Content: ${editingItem.title}` : `Create New ${contentType.replace("_", " ")}`}
              </h2>
              <p className="text-xs text-text-muted truncate">Multi-step Authoring Wizard • Autosaved locally</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            aria-label="Close authoring wizard"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <div className="px-6 py-3 border-b border-border bg-ink/50 flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { num: 1, label: "Basics" },
            { num: 2, label: "Topics" },
            { num: 3, label: "Difficulty" },
            { num: 4, label: "Content Data" },
            { num: 5, label: "Settings & Publish" },
          ].map((s) => {
            const isDone = currentStep > s.num;
            const isCur = currentStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < currentStep || validateStep(currentStep)) setCurrentStep(s.num);
                }}
                className={`flex items-center gap-2 text-xs font-medium py-1 px-3 rounded-lg transition-colors whitespace-nowrap ${
                  isCur
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                    : isDone
                    ? "text-emerald-400 hover:text-emerald-300"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] ${
                    isCur
                      ? "bg-cyan-500 text-black font-bold"
                      : isDone
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-surface border border-border"
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span>{s.label}</span>
                {s.num < 5 && <ChevronRight className="w-3 h-3 text-text-muted/40 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* MAIN BODY (TWO COLUMN: WIZARD WORKSPACE + LIVE SUMMARY CARD) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
          {/* LEFT 2 COLUMNS: ACTIVE STEP WORKSPACE */}
          <div className="lg:col-span-2 space-y-6 min-h-0">
            <ErrorBoundary isModal fallbackTitle="Error in Authoring Step" onReset={() => setCurrentStep(1)}>
            {/* STEP 1: BASICS */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Step 1: Content Identity & Domain</h3>
                  <p className="text-xs text-text-muted">Define the assessment title, subject area, and searchable tags.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary font-medium"
                  >
                    <option value="QUIZ">MCQ Quiz (Timed or Question Bank)</option>
                    <option value="MOCK_TEST">Full-Length Mock Test (Multi-section)</option>
                    <option value="CODING_PROBLEM">Coding Problem</option>
                    <option value="CODING_TEST">Coding Test Assessment</option>
                    <option value="MOCK_INTERVIEW">AI-Led Mock Interview</option>
                    <option value="PRACTICE_TOPIC">Practice Topic Curriculum</option>
                    <option value="ARTICLE">Article & Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. High-Scale Distributed Systems Architecture Quiz"
                    className="w-full px-3 py-2 text-sm bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500 font-semibold"
                  />
                  {title.trim().length > 0 && title.trim().length < 3 && (
                    <span className="text-[11px] text-red-400 mt-1 block">Title must be at least 3 characters</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief overview explaining student prerequisites, targets, or testing scope..."
                    className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Subject / Domain *</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary"
                    >
                      {domains.map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                      {Object.keys(PRESET_SUBJECTS)
                        .filter((sub) => !domains.some((d) => d.name.toLowerCase() === sub.toLowerCase()))
                        .map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      <option value="Custom">Custom Domain</option>
                    </select>
                  </div>

                  {subject === "Custom" && (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">Enter Custom Subject Name *</label>
                      <input
                        type="text"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        placeholder="e.g. Cloud Security"
                        className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Tags (Press Enter or Add)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="e.g. FAANG, SystemDesign, Placement2026"
                      className="flex-1 px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-surface-raised hover:bg-surface border border-border text-xs px-3"
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1"
                        >
                          #{t}
                          <button type="button" onClick={() => handleRemoveTag(t)}>
                            <X className="w-3 h-3 hover:text-red-400" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: TOPICS */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Step 2: Topic Selection ({selectedTopics.length} selected)</h3>
                  <p className="text-xs text-text-muted">
                    Choose core curriculum topics for {activeSubject} or add customized ones.
                  </p>
                </div>

                {availableTopics.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-text-muted uppercase font-semibold tracking-wider">
                      Suggested Topics for {subject}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableTopics.map((top) => {
                        const isSelected = selectedTopics.includes(top);
                        return (
                          <button
                            key={top}
                            type="button"
                            onClick={() => handleToggleTopic(top)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20"
                                : "bg-surface-raised border border-border text-text-muted hover:text-text-primary hover:border-cyan-500/30"
                            }`}
                          >
                            {top}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-2">
                  <label className="block text-xs font-medium text-text-muted">Add Custom Topic</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomTopic();
                        }
                      }}
                      placeholder="e.g. B-Trees & Write Ahead Logging"
                      className="flex-1 px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomTopic}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-3"
                    >
                      Add Topic
                    </Button>
                  </div>
                </div>

                {selectedTopics.length === 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Please pick or add at least 1 topic to proceed.</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DIFFICULTY */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Step 3: Difficulty & Calibration</h3>
                  <p className="text-xs text-text-muted">
                    Set single difficulty level or configure mixed percentage distribution.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["Easy", "Medium", "Hard", "Mixed"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        difficulty === lvl
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-500/10"
                          : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{lvl}</span>
                    </button>
                  ))}
                </div>

                {difficulty === "Mixed" && (
                  <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Difficulty Split Percentage (Total must equal 100%)
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-text-muted mb-1">Easy (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={difficultySplit.Easy}
                          onChange={(e) =>
                            setDifficultySplit({ ...difficultySplit, Easy: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full px-2 py-1 text-xs bg-surface border border-border rounded text-text-primary font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-text-muted mb-1">Medium (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={difficultySplit.Medium}
                          onChange={(e) =>
                            setDifficultySplit({ ...difficultySplit, Medium: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full px-2 py-1 text-xs bg-surface border border-border rounded text-text-primary font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-text-muted mb-1">Hard (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={difficultySplit.Hard}
                          onChange={(e) =>
                            setDifficultySplit({ ...difficultySplit, Hard: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full px-2 py-1 text-xs bg-surface border border-border rounded text-text-primary font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: TYPE SPECIFIC CONTENT */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                {contentType === "QUIZ" && (
                  <QuizEditor
                    subject={activeSubject}
                    topics={selectedTopics}
                    difficulty={difficulty}
                    questions={contentData.questions || []}
                    onChange={(qs) => setContentData({ ...contentData, questions: qs })}
                  />
                )}

                {contentType === "MOCK_TEST" && (
                  <MockTestEditor
                    sections={contentData.sections || []}
                    overallPassMark={passPercentage}
                    onSectionsChange={(sec) => setContentData({ ...contentData, sections: sec })}
                    onOverallPassMarkChange={(mark) => setPassPercentage(mark)}
                  />
                )}

                {(contentType === "CODING_PROBLEM" || contentType === "CODING_TEST") && (
                  <CodingEditor
                    data={contentData}
                    onChange={(updated) => setContentData(updated)}
                  />
                )}

                {contentType === "MOCK_INTERVIEW" && (
                  <InterviewEditor
                    data={contentData}
                    subject={activeSubject}
                    topics={selectedTopics}
                    difficulty={difficulty}
                    onChange={(updated) => setContentData(updated)}
                  />
                )}

                {contentType === "PRACTICE_TOPIC" && (
                  <PracticeEditor
                    data={contentData}
                    subject={activeSubject}
                    onChange={(updated) => setContentData(updated)}
                  />
                )}

                {contentType === "ARTICLE" && (
                  <ArticleEditor
                    data={contentData}
                    subject={activeSubject}
                    tags={tags}
                    onChange={(updated) => setContentData(updated)}
                  />
                )}
              </div>
            )}

            {/* STEP 5: SETTINGS & PUBLISH */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Step 5: Assessment Controls & Visibility</h3>
                  <p className="text-xs text-text-muted">
                    Configure scheduling, time enforcement, pass criteria, and publish to students.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 45)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Attempts Allowed</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={attemptsAllowed}
                      onChange={(e) => setAttemptsAllowed(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Pass Mark (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={passPercentage}
                      onChange={(e) => setPassPercentage(parseInt(e.target.value, 10) || 70)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary font-mono"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-surface-raised border border-border rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-primary">
                    <input
                      type="checkbox"
                      checked={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.checked)}
                      className="accent-cyan-400 rounded"
                    />
                    <span>Negative Marking (-{negativePenalty} mark per wrong answer)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-primary">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={(e) => setShuffleQuestions(e.target.checked)}
                      className="accent-cyan-400 rounded"
                    />
                    <span>Shuffle Question Order per Student</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-primary">
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="accent-cyan-400 rounded"
                    />
                    <span>Shuffle Multiple Choice Options</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-primary">
                    <input
                      type="checkbox"
                      checked={showAnswersAfterSubmit}
                      onChange={(e) => setShowAnswersAfterSubmit(e.target.checked)}
                      className="accent-cyan-400 rounded"
                    />
                    <span>Reveal Explanations After Submission</span>
                  </label>
                </div>

                {/* Scheduling & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Schedule Start Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Schedule End Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-text-primary"
                    />
                  </div>
                </div>

                <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Target Audience</span>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-text-primary">
                      <input
                        type="radio"
                        name="visibility-target"
                        checked={visibility === "ALL"}
                        onChange={() => setVisibility("ALL")}
                        className="accent-cyan-400"
                      />
                      <span>All Enrolled Students</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-text-primary">
                      <input
                        type="radio"
                        name="visibility-target"
                        checked={visibility === "BATCH"}
                        onChange={() => setVisibility("BATCH")}
                        className="accent-cyan-400"
                      />
                      <span>Specific Batch / Year</span>
                    </label>
                  </div>

                  {visibility === "BATCH" && (
                    <input
                      type="text"
                      value={batchTarget}
                      onChange={(e) => setBatchTarget(e.target.value)}
                      placeholder="e.g. 2026 CS Batch - Section A"
                      className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
                    />
                  )}
                </div>
              </div>
            )}
            </ErrorBoundary>
          </div>

          {/* RIGHT 1 COLUMN: LIVE SUMMARY CARD */}
          <div className="space-y-4 min-h-0">
            <div className="bg-surface-raised border border-border rounded-2xl p-4 sm:p-5 lg:sticky lg:top-0 space-y-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block">
                Live Specification Summary
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-text-muted text-[11px] block">Title</span>
                  <span className="font-semibold text-text-primary line-clamp-2">
                    {title || "Untitled Assessment"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-text-muted text-[11px] block">Content Type</span>
                    <span className="font-mono text-cyan-300">{contentType}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[11px] block">Domain</span>
                    <span className="font-semibold text-text-primary">{activeSubject}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-text-muted text-[11px] block">Difficulty</span>
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-text-primary">
                      {difficulty}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[11px] block">Time Limit</span>
                    <span className="font-mono text-text-primary">{durationMinutes} mins</span>
                  </div>
                </div>

                <div>
                  <span className="text-text-muted text-[11px] block mb-1">Topics ({selectedTopics.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedTopics.slice(0, 4).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-surface text-text-muted border border-border">
                        {t}
                      </span>
                    ))}
                    {selectedTopics.length > 4 && (
                      <span className="text-[10px] text-text-muted">+{selectedTopics.length - 4} more</span>
                    )}
                  </div>
                </div>

                {contentType === "QUIZ" && (
                  <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between">
                    <span className="text-text-muted">Questions Configured:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {contentData.questions?.length || 0}
                    </span>
                  </div>
                )}

                {contentType === "MOCK_TEST" && (
                  <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between">
                    <span className="text-text-muted">Sections Configured:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {contentData.sections?.length || 0}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons in Live Summary */}
              <div className="pt-3 border-t border-border space-y-2">
                <Button
                  type="button"
                  onClick={() => handleSave("PUBLISHED")}
                  disabled={isSubmitting || !validateStep(1)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {editingItem ? "Update & Publish" : "Publish to Students"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSave("DRAFT")}
                  disabled={isSubmitting || !validateStep(1)}
                  className="w-full text-xs py-2 border-border hover:bg-surface text-text-muted flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* WIZARD FOOTER NAVIGATION */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-surface-raised flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="text-xs flex items-center gap-1 border-border"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-xs text-text-muted font-mono">
            Step {currentStep} of 5
          </span>

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 flex items-center gap-1"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSave("PUBLISHED")}
              disabled={isSubmitting || !validateStep(1)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Finalize & Publish
            </Button>
          )}
        </div>
      </div>

      {/* UNSAVED CHANGES WARNING MODAL */}
      {showExitWarning && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        >
          <div className="bg-surface border border-border rounded-xl p-5 max-w-md w-full space-y-3 shadow-2xl animate-scale-in">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Discard Unsaved Changes?
            </h4>
            <p className="text-xs text-text-muted">
              You have unsaved changes in this authoring wizard. Your progress will be retained in local draft autosave, but not submitted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitWarning(false)}
                className="text-xs"
              >
                Keep Editing
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowExitWarning(false);
                  onClose();
                }}
                className="bg-red-500 hover:bg-red-400 text-black text-xs font-semibold"
              >
                Discard & Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
