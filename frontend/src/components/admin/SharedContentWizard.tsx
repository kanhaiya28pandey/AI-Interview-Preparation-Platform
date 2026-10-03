import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ContentItem,
  McqQuestionItem,
  CodingProblemItem,
  adminContentService,
} from "@/services/adminContentService";
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Code2,
  Video,
  FileText,
  Clock,
  HelpCircle,
  Eye,
  AlertCircle,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export interface SharedContentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: ContentItem["type"];
  initialData?: ContentItem | null;
}

const SUBJECT_OPTIONS = [
  "DSA",
  "DBMS",
  "OS",
  "Networks",
  "System Design",
  "Web Dev",
  "OOP",
  "AI/ML",
  "Aptitude",
  "HR",
];

const TOPIC_PRESETS: Record<string, string[]> = {
  DSA: ["Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Sorting & Searching"],
  DBMS: ["SQL Joins", "Indexing", "Transactions & ACID", "Normalization", "NoSQL MongoDB"],
  OS: ["Process & Threads", "Deadlocks", "Memory Management", "CPU Scheduling"],
  Networks: ["TCP/IP", "HTTP/HTTPS", "DNS & Routing", "OSI Layer"],
  "System Design": ["Load Balancing", "Caching Redis", "Database Sharding", "Message Queues Kafka"],
  "Web Dev": ["React.js", "TypeScript", "Node.js Express", "REST APIs", "CSS Tailwind"],
  OOP: ["Inheritance", "Polymorphism", "Abstraction", "Encapsulation", "Design Patterns"],
  "AI/ML": ["Linear Regression", "Neural Networks", "NLP", "Prompt Engineering"],
  Aptitude: ["Quantitative Ability", "Logical Reasoning", "Data Interpretation"],
  HR: ["Behavioral STAR", "Strengths & Weaknesses", "Leadership Scenarios"],
};

export const SharedContentWizard: React.FC<SharedContentWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = "MCQ Quiz",
  initialData = null,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Step 1: Basics
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [contentType, setContentType] = useState<ContentItem["type"]>(initialData?.type || initialType);
  const [subject, setSubject] = useState(initialData?.subject || "DSA");
  const [customSubject, setCustomSubject] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.topics || ["Arrays", "Trees"]);
  const [tagInput, setTagInput] = useState("");

  // Step 2: Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialData?.topics || ["Arrays"]);
  const [customTopicInput, setCustomTopicInput] = useState("");

  // Step 3: Difficulty
  const [difficultyMode, setDifficultyMode] = useState<"Easy" | "Medium" | "Hard" | "Mixed">(
    initialData?.difficulty || "Medium"
  );
  const [mixedSplit, setMixedSplit] = useState<{ easy: number; medium: number; hard: number }>({
    easy: initialData?.payload?.mixedDifficultySplit?.easy || 30,
    medium: initialData?.payload?.mixedDifficultySplit?.medium || 50,
    hard: initialData?.payload?.mixedDifficultySplit?.hard || 20,
  });

  // Step 4: Content Payload
  const [mcqQuestions, setMcqQuestions] = useState<McqQuestionItem[]>(
    initialData?.payload?.mcqQuestions || [
      {
        id: "q-1",
        questionText: "What is the average time complexity of searching in a Balanced Binary Search Tree?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        correctOptionIndex: 1,
        explanation: "Balanced BSTs halve the search space at each level, taking O(log N) operations.",
      },
    ]
  );
  const [codingProblems, setCodingProblems] = useState<CodingProblemItem[]>(
    initialData?.payload?.codingProblems || [
      {
        id: "cp-1",
        title: "Two Sum Target Pair",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        inputFormat: "First line contains N. Second line contains N integers. Third line contains target.",
        outputFormat: "Print two 0-indexed integer indices separated by space.",
        sampleInput: "4\n2 7 11 15\n9",
        sampleOutput: "0 1",
        difficulty: "Easy",
      },
    ]
  );
  const [articleMarkdown, setArticleMarkdown] = useState<string>(
    initialData?.payload?.articleMarkdown ||
      "# Technical Placement Guide\n\n### Core Topics to Focus On:\n- Data Structures & Algorithms\n- System Architecture & Clean Code\n"
  );

  // New MCQ Input inline state
  const [newQText, setNewQText] = useState("");
  const [newQCode, setNewQCode] = useState("");
  const [newQOptions, setNewQOptions] = useState(["", "", "", ""]);
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQExplanation, setNewQExplanation] = useState("");

  // Step 5: Settings
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes || 30);
  const [passMarkPercent, setPassMarkPercent] = useState(initialData?.passMarkPercent || 70);
  const [negativeMarking, setNegativeMarking] = useState(initialData?.negativeMarking ?? true);
  const [shuffleOptions, setShuffleOptions] = useState(initialData?.shuffleOptions ?? true);
  const [showAnswers, setShowAnswers] = useState(initialData?.showAnswers ?? true);
  const [visibility, setVisibility] = useState(initialData?.visibility || "All");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setContentType(initialData.type);
      setSubject(initialData.subject);
      setSelectedTopics(initialData.topics || []);
      setDifficultyMode(initialData.difficulty);
      setDurationMinutes(initialData.durationMinutes || 30);
    }
  }, [initialData]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleToggleTopic = (t: string) => {
    if (selectedTopics.includes(t)) {
      setSelectedTopics(selectedTopics.filter((x) => x !== t));
    } else {
      setSelectedTopics([...selectedTopics, t]);
    }
  };

  const handleAddCustomTopic = () => {
    if (customTopicInput.trim() && !selectedTopics.includes(customTopicInput.trim())) {
      setSelectedTopics([...selectedTopics, customTopicInput.trim()]);
      setCustomTopicInput("");
    }
  };

  const handleAddInlineMcq = () => {
    if (!newQText.trim()) {
      toast.error("Please enter question text");
      return;
    }
    if (newQOptions.some((o) => !o.trim())) {
      toast.error("Please fill in all 4 option fields");
      return;
    }

    const newQ: McqQuestionItem = {
      id: "q-" + Date.now().toString(36),
      questionText: newQText,
      codeSnippet: newQCode.trim() || undefined,
      options: [...newQOptions],
      correctOptionIndex: newQCorrect,
      explanation: newQExplanation.trim() || undefined,
    };

    setMcqQuestions([...mcqQuestions, newQ]);
    setNewQText("");
    setNewQCode("");
    setNewQOptions(["", "", "", ""]);
    setNewQExplanation("");
    toast.success("Question added!");
  };

  const handleGenerateAiQuestions = async () => {
    setIsGeneratingAi(true);
    toast.info("Connecting to Gemini AI Generator...");
    try {
      const generated = await adminContentService.generateMcqQuestions(
        subject,
        selectedTopics[0] || "General",
        difficultyMode,
        3
      );
      setMcqQuestions([...mcqQuestions, ...generated]);
      toast.success("Generated 3 AI questions successfully!");
    } catch {
      toast.error("Failed to generate AI questions");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = async (statusToSave: "Draft" | "Published") => {
    if (!title.trim()) {
      toast.error("Please enter a content title");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const activeSubject = customSubject.trim() || subject;
      const finalItem: Partial<ContentItem> = {
        id: initialData?.id,
        title,
        description,
        type: contentType,
        subject: activeSubject,
        topics: selectedTopics.length > 0 ? selectedTopics : ["General"],
        difficulty: difficultyMode,
        status: statusToSave,
        questionsCount: contentType === "Coding Test" ? codingProblems.length : mcqQuestions.length,
        durationMinutes,
        passMarkPercent,
        negativeMarking,
        shuffleOptions,
        showAnswers,
        visibility,
        payload: {
          mcqQuestions,
          codingProblems,
          articleMarkdown,
          mixedDifficultySplit: difficultyMode === "Mixed" ? mixedSplit : undefined,
        },
      };

      await adminContentService.saveContent(finalItem);
      toast.success(`Content ${statusToSave === "Published" ? "Published" : "Saved as Draft"} successfully!`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save content item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTopicPresets = TOPIC_PRESETS[subject] || ["General Concepts", "Advanced Patterns"];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Content Wizard: ${contentType}`} description="Create or modify assessment learning content">
      <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
        {/* Stepper Header */}
        <div className="flex items-center justify-between border-b border-border pb-3 font-mono">
          {[
            { num: 1, label: "1. Basics" },
            { num: 2, label: "2. Topics" },
            { num: 3, label: "3. Difficulty" },
            { num: 4, label: "4. Content" },
            { num: 5, label: "5. Settings" },
          ].map((st) => (
            <div
              key={st.num}
              onClick={() => setStep(st.num as any)}
              className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg transition-all ${
                step === st.num
                  ? "bg-cyan-400/15 text-cyan-400 font-bold border border-cyan-400/40"
                  : step > st.num
                  ? "text-live font-medium"
                  : "text-text-muted"
              }`}
            >
              <span>{st.label}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Content Title *</label>
              <Input
                placeholder="e.g. Master Arrays & Dynamic Programming Assessment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-surface-raised"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full bg-surface-raised border border-border rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  <option value="MCQ Quiz">MCQ Quiz</option>
                  <option value="Mock Test">Mock Test (MCQ + Coding)</option>
                  <option value="Coding Test">Coding Test / Problem Bank</option>
                  <option value="Mock Interview">Mock Interview Template</option>
                  <option value="Practice Track">Practice Track</option>
                  <option value="Article">Article & Guide</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Subject / Engineering Domain</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="Custom">Custom Domain...</option>
                </select>
              </div>
            </div>

            {subject === "Custom" && (
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary">Specify Custom Domain</label>
                <Input
                  placeholder="e.g. Embedded Systems / Cloud Architecture"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="bg-surface-raised"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Description & Instructions</label>
              <textarea
                rows={3}
                placeholder="Brief summary of syllabus covered, prerequisites, and learning objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}

        {/* STEP 2: TOPICS */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h4 className="font-semibold text-text-primary">Select Core Topics for ({subject})</h4>
              <p className="text-text-muted text-[11px]">Click to toggle topics included in this content pack.</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {currentTopicPresets.map((top) => {
                const isSelected = selectedTopics.includes(top);
                return (
                  <Badge
                    key={top}
                    variant={isSelected ? "active" : "medium"}
                    onClick={() => handleToggleTopic(top)}
                    className="cursor-pointer text-xs py-1 px-3 transition-all"
                  >
                    {isSelected ? "✓ " : "+ "}
                    {top}
                  </Badge>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-border">
              <label className="font-semibold text-text-primary">Add Custom Topic</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Red-Black Trees or Microservice Saga Pattern"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  className="bg-surface-raised"
                />
                <Button variant="outline" size="sm" onClick={handleAddCustomTopic} className="shrink-0">
                  <Plus className="w-4 h-4" /> Add Topic
                </Button>
              </div>
            </div>

            {selectedTopics.length > 0 && (
              <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
                <span className="font-mono text-cyan-400 text-[11px] font-semibold block">Selected Topics ({selectedTopics.length}):</span>
                <div className="flex flex-wrap gap-1">
                  {selectedTopics.map((t) => (
                    <Badge key={t} variant="accent" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DIFFICULTY */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h4 className="font-semibold text-text-primary">Select Difficulty Level & Distribution</h4>
              <p className="text-text-muted text-[11px]">Target complexity tier for candidate evaluation.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["Easy", "Medium", "Hard", "Mixed"] as const).map((diff) => (
                <div
                  key={diff}
                  onClick={() => setDifficultyMode(diff)}
                  className={`p-3.5 rounded-xl border cursor-pointer text-center space-y-1 transition-all ${
                    difficultyMode === diff
                      ? "bg-cyan-400/15 border-cyan-400 text-cyan-400 font-bold shadow-soft"
                      : "bg-surface-raised border-border text-text-secondary hover:border-cyan-400/40"
                  }`}
                >
                  <span className="block font-serif text-sm">{diff}</span>
                  <span className="text-[10px] text-text-muted font-mono block">
                    {diff === "Easy" ? "Entry Level" : diff === "Medium" ? "Standard Placement" : diff === "Hard" ? "Top Tech Tier" : "Adaptive % Split"}
                  </span>
                </div>
              ))}
            </div>

            {difficultyMode === "Mixed" && (
              <Card className="p-4 bg-surface-raised border border-border space-y-3">
                <span className="font-mono text-cyan-400 font-semibold block">Mixed Mode Percentage Distribution Split</span>
                <div className="grid grid-cols-3 gap-3 text-center font-mono">
                  <div className="space-y-1">
                    <label className="text-[10px] text-live font-semibold">Easy %</label>
                    <Input
                      type="number"
                      value={mixedSplit.easy}
                      onChange={(e) => setMixedSplit({ ...mixedSplit, easy: Number(e.target.value) })}
                      className="bg-surface text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-amber-400 font-semibold">Medium %</label>
                    <Input
                      type="number"
                      value={mixedSplit.medium}
                      onChange={(e) => setMixedSplit({ ...mixedSplit, medium: Number(e.target.value) })}
                      className="bg-surface text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-danger font-semibold">Hard %</label>
                    <Input
                      type="number"
                      value={mixedSplit.hard}
                      onChange={(e) => setMixedSplit({ ...mixedSplit, hard: Number(e.target.value) })}
                      className="bg-surface text-center"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* STEP 4: TYPE-SPECIFIC CONTENT BUILDER */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            {contentType === "Article" ? (
              <div className="space-y-2">
                <label className="font-semibold text-text-primary">Article Content (Markdown Supported)</label>
                <textarea
                  rows={10}
                  value={articleMarkdown}
                  onChange={(e) => setArticleMarkdown(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-xl p-3 font-mono text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                />
              </div>
            ) : contentType === "Coding Test" ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-semibold text-text-primary">Coding Problems Bank ({codingProblems.length})</span>
                </div>
                {codingProblems.map((cp, idx) => (
                  <Card key={cp.id} className="p-4 bg-surface-raised border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-cyan-400">Problem #{idx + 1}: {cp.title}</span>
                      <Badge variant="accent">{cp.difficulty}</Badge>
                    </div>
                    <p className="text-text-secondary text-[11px] line-clamp-2">{cp.statement}</p>
                  </Card>
                ))}
              </div>
            ) : (
              // MCQ Quiz / Mock Test / Mock Interview Question Builder
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                  <span className="font-semibold text-text-primary">
                    Questions List ({mcqQuestions.length} Questions)
                  </span>
                  <Button
                    variant="teal-cyan"
                    size="sm"
                    onClick={handleGenerateAiQuestions}
                    isLoading={isGeneratingAi}
                    className="gap-1.5 text-xs shadow-glow"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate 3 Questions with Gemini AI
                  </Button>
                </div>

                {/* Inline Question List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {mcqQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-surface-raised border border-border rounded-xl flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono text-cyan-400 font-semibold block text-[11px]">
                          Q{idx + 1}. {q.questionText}
                        </span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-[10px] text-text-muted">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx} className={oIdx === q.correctOptionIndex ? "text-live font-bold" : ""}>
                              {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctOptionIndex && "✓"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMcqQuestions(mcqQuestions.filter((_, i) => i !== idx))}
                        className="text-text-muted hover:text-danger p-1"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Inline Question Card */}
                <Card className="p-4 bg-surface-raised border border-border space-y-3">
                  <span className="font-mono text-cyan-400 font-semibold uppercase block text-[11px]">
                    + Add New Custom MCQ Question
                  </span>
                  <Input
                    placeholder="Enter question prompt..."
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    className="bg-surface"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {newQOptions.map((opt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="correctOpt"
                          checked={newQCorrect === idx}
                          onChange={() => setNewQCorrect(idx)}
                          className="accent-cyan-400"
                        />
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newQOptions];
                            updated[idx] = e.target.value;
                            setNewQOptions(updated);
                          }}
                          className="bg-surface"
                        />
                      </div>
                    ))}
                  </div>
                  <Input
                    placeholder="Explanation for correct answer..."
                    value={newQExplanation}
                    onChange={(e) => setNewQExplanation(e.target.value)}
                    className="bg-surface"
                  />
                  <Button variant="outline" size="sm" onClick={handleAddInlineMcq} className="w-full gap-1.5">
                    <Plus className="w-4 h-4" /> Add Question to Pack
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: SETTINGS & PUBLISH */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Duration (Minutes)</label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="bg-surface-raised"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Passing Cutoff %</label>
                <Input
                  type="number"
                  value={passMarkPercent}
                  onChange={(e) => setPassMarkPercent(Number(e.target.value))}
                  className="bg-surface-raised"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Visibility Target</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  <option value="All">All Registered Students</option>
                  <option value="Batch 2026">Batch 2026 Only</option>
                  <option value="Year 4">Final Year (Year 4)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <label className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between cursor-pointer">
                <span>Negative Marking</span>
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4"
                />
              </label>
              <label className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between cursor-pointer">
                <span>Shuffle Options</span>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4"
                />
              </label>
              <label className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between cursor-pointer">
                <span>Show Answer Keys</span>
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4"
                />
              </label>
            </div>

            {/* Live Summary Card */}
            <Card className="p-4 bg-cyan-400/10 border border-cyan-400/30 space-y-2">
              <span className="font-serif font-bold text-cyan-400 text-sm block">Live Publication Summary</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-text-secondary">
                <div>Title: <span className="text-text-primary font-semibold block truncate">{title || "Untitled"}</span></div>
                <div>Type: <span className="text-text-primary font-semibold block">{contentType}</span></div>
                <div>Subject: <span className="text-text-primary font-semibold block">{subject}</span></div>
                <div>Questions: <span className="text-text-primary font-semibold block">{mcqQuestions.length} Items</span></div>
              </div>
            </Card>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((prev) => Math.max(1, prev - 1) as any)}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex gap-2">
            {step < 5 ? (
              <Button variant="primary" size="sm" onClick={() => setStep((prev) => Math.min(5, prev + 1) as any)}>
                Next Step <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave("Draft")}
                  isLoading={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="teal-cyan"
                  size="sm"
                  onClick={() => handleSave("Published")}
                  isLoading={isSubmitting}
                  className="shadow-glow font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Publish Content Pack
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
