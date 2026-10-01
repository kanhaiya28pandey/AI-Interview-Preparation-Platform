import React, { useState } from "react";
import { TopicConfig } from "@/mocks/adminData";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, X, ArrowUp, ArrowDown, Tag, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { TAXONOMY_DOMAINS } from "@/lib/taxonomy";

// Dynamic map populated from centralized taxonomy for backward-compatibility
export const PREDEFINED_DOMAINS_TOPICS: Record<string, string[]> = TAXONOMY_DOMAINS.reduce(
  (acc: Record<string, string[]>, d) => {
    acc[d.name] = d.topics.map((t) => t.name);
    return acc;
  },
  {
    Java: ["OOP Principles", "Collections Framework", "Multithreading & Executor", "Streams & Lambdas", "JVM Memory & GC", "Spring Boot", "Hibernate ORM", "Design Patterns"],
    DSA: ["Arrays", "Strings", "Linked List", "Stack & Queue", "Trees", "Graphs", "Dynamic Programming", "Recursion & Backtracking"],
    "System Design": ["Low Level Design", "High Level Design", "Scalability", "Load Balancing", "Caching Strategies", "CDN", "Rate Limiter", "Microservices"],
    Frontend: ["HTML & CSS", "JavaScript Deep Dive", "TypeScript", "React", "Next.js", "State Management", "Web Performance"],
    MERN: ["React", "Node.js & Express", "MongoDB", "REST API Design", "Authentication (JWT, OAuth)"],
    Behavioral: ["STAR Method", "Tell Me About Yourself", "Strengths & Weaknesses", "Conflict & Teamwork", "Leadership"],
    DBMS: ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Transactions & ACID", "Indexing & Query Optimization"],
    OS: ["Operating Systems", "Process Synchronization", "Memory Management", "File Systems"],
    Aptitude: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation"],
  } as Record<string, string[]>
);

export interface TopicManagerProps {
  domain: string;
  onChangeDomain: (domain: string) => void;
  topics: TopicConfig[];
  onChangeTopics: (topics: TopicConfig[]) => void;
  error?: string | null;
}

export const TopicManager: React.FC<TopicManagerProps> = ({
  domain,
  onChangeDomain,
  topics,
  onChangeTopics,
  error,
}) => {
  const { domains, getTopicsForDomain } = useTaxonomy();
  const [customTopicInput, setCustomTopicInput] = useState("");

  const suggestedTopics = getTopicsForDomain(domain).map((t) => t.name);

  const handleAddTopic = (topicName: string) => {
    const trimmed = topicName.trim();
    if (!trimmed) return;
    if (topics.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`Topic "${trimmed}" is already added.`);
      return;
    }
    const newTopics = [
      ...topics,
      { name: trimmed, questionCount: 2, weightage: Math.round(100 / (topics.length + 1)) },
    ];
    // Rebalance weightage evenly
    const balanced = rebalanceWeightage(newTopics);
    onChangeTopics(balanced);
    setCustomTopicInput("");
  };

  const handleRemoveTopic = (index: number) => {
    const filtered = topics.filter((_, idx) => idx !== index);
    const balanced = rebalanceWeightage(filtered);
    onChangeTopics(balanced);
  };

  const handleMoveTopic = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === topics.length - 1) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const copy = [...topics];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChangeTopics(copy);
  };

  const handleUpdateTopicField = (index: number, field: "questionCount" | "weightage", val: number) => {
    const copy = [...topics];
    copy[index] = { ...copy[index], [field]: Math.max(0, val) };
    onChangeTopics(copy);
  };

  const rebalanceWeightage = (topicList: TopicConfig[]): TopicConfig[] => {
    if (topicList.length === 0) return [];
    const equalShare = Math.floor(100 / topicList.length);
    const remainder = 100 - equalShare * topicList.length;
    return topicList.map((t, idx) => ({
      ...t,
      weightage: equalShare + (idx === 0 ? remainder : 0),
    }));
  };

  const totalWeightage = topics.reduce((acc, t) => acc + (t.weightage || 0), 0);
  const totalQuestions = topics.reduce((acc, t) => acc + (t.questionCount || 0), 0);

  return (
    <div className="space-y-4 border border-border bg-surface-raised/50 p-4 rounded-xl">
      {/* Domain Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-cyan-400" /> Primary Category / Domain
        </label>
        <select
          value={domain || "Java"}
          onChange={(e) => {
            const newDomain = e.target.value;
            onChangeDomain(newDomain);
            // Auto add top 2 topics of new domain if empty
            if (topics.length === 0 && PREDEFINED_DOMAINS_TOPICS[newDomain]) {
              const defaults = PREDEFINED_DOMAINS_TOPICS[newDomain].slice(0, 2);
              onChangeTopics(
                defaults.map((t, idx) => ({
                  name: t,
                  questionCount: 2,
                  weightage: idx === 0 ? 50 : 50,
                }))
              );
            }
          }}
          className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
        >
          {domains.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
          <option value="Other / General">Other / General</option>
        </select>
      </div>

      {/* Topic Suggestions Chips */}
      {suggestedTopics.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-text-muted block">
            Suggested Topics for {domain} (Click to toggle):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedTopics.map((topName) => {
              const isSelected = topics.some((t) => t.name.toLowerCase() === topName.toLowerCase());
              return (
                <button
                  key={topName}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      const idx = topics.findIndex((t) => t.name.toLowerCase() === topName.toLowerCase());
                      handleRemoveTopic(idx);
                    } else {
                      handleAddTopic(topName);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-cyan-400 text-black font-semibold shadow-xs"
                      : "bg-surface border border-border text-text-secondary hover:border-cyan-400/50"
                  }`}
                >
                  <span>{topName}</span>
                  {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Topic Input */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Add custom topic (e.g. Streams & Lambdas)..."
          value={customTopicInput}
          onChange={(e) => setCustomTopicInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTopic(customTopicInput);
            }
          }}
          className="text-xs font-mono py-1.5"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddTopic(customTopicInput)}
          className="text-xs shrink-0 font-mono text-cyan-400 border-cyan-400/40"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      {/* Topic List Table / Order & Weightage */}
      {topics.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="font-semibold text-text-primary">
              Selected Topics ({topics.length})
            </span>
            <div className="flex items-center gap-3">
              <span className="text-text-muted">Total Questions: <strong className="text-cyan-400">{totalQuestions}</strong></span>
              <span className={`font-semibold ${totalWeightage === 100 ? "text-live" : "text-amber-400"}`}>
                Weightage: {totalWeightage}% {totalWeightage !== 100 && "(Will auto-normalize)"}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {topics.map((t, idx) => (
              <div
                key={`${t.name}-${idx}`}
                className="p-2.5 bg-surface border border-border rounded-lg flex items-center justify-between gap-3 text-xs"
              >
                {/* Reorder & Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveTopic(idx, "UP")}
                      className="p-0.5 text-text-muted hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-text-muted"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === topics.length - 1}
                      onClick={() => handleMoveTopic(idx, "DOWN")}
                      className="p-0.5 text-text-muted hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-text-muted"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-semibold font-mono text-cyan-300 truncate">
                    {idx + 1}. {t.name}
                  </span>
                </div>

                {/* Question Count Input */}
                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                  <span className="text-[10px] text-text-muted">Qs:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={t.questionCount || 1}
                    onChange={(e) => handleUpdateTopicField(idx, "questionCount", parseInt(e.target.value) || 1)}
                    className="w-14 bg-surface-raised border border-border rounded px-1.5 py-1 text-xs text-center text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Weightage % Input */}
                <div className="flex items-center gap-1 shrink-0 font-mono">
                  <span className="text-[10px] text-text-muted">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={t.weightage || 0}
                    onChange={(e) => handleUpdateTopicField(idx, "weightage", parseInt(e.target.value) || 0)}
                    className="w-14 bg-surface-raised border border-border rounded px-1.5 py-1 text-xs text-center text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-text-muted text-[11px]">%</span>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(idx)}
                  className="p-1 text-danger hover:bg-danger-bg rounded text-xs"
                  title="Remove topic"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>At least one topic must be selected for this test.</span>
        </div>
      )}

      {error && <p className="text-xs text-danger font-mono mt-1">{error}</p>}
    </div>
  );
};
