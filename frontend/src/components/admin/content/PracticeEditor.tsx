import React, { useState } from "react";
import { Plus, Trash2, GitFork, ArrowDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface PracticeSubTopic {
  id: string;
  title: string;
  order: number;
  prerequisiteId?: string;
  estimatedMinutes: number;
  questionCount: number;
}

export interface PracticeEditorData {
  subTopics?: PracticeSubTopic[];
  trackDifficulty?: string;
  badgeReward?: string;
}

interface PracticeEditorProps {
  data: PracticeEditorData;
  subject: string;
  onChange: (updated: PracticeEditorData) => void;
}

export const PracticeEditor: React.FC<PracticeEditorProps> = ({
  data,
  subject,
  onChange,
}) => {
  const [subTitle, setSubTitle] = useState("");
  const [estMinutes, setEstMinutes] = useState(20);
  const [qCount, setQCount] = useState(5);
  const [prereqId, setPrereqId] = useState("");

  const subTopics = data.subTopics || [];

  const handleAddSubTopic = () => {
    if (!subTitle.trim()) return;

    const newSub: PracticeSubTopic = {
      id: `sub-${Date.now()}`,
      title: subTitle.trim(),
      order: subTopics.length + 1,
      prerequisiteId: prereqId || undefined,
      estimatedMinutes: estMinutes,
      questionCount: qCount,
    };

    onChange({
      ...data,
      subTopics: [...subTopics, newSub],
    });

    setSubTitle("");
    setEstMinutes(20);
    setQCount(5);
    setPrereqId("");
  };

  const handleRemoveSubTopic = (id: string) => {
    onChange({
      ...data,
      subTopics: subTopics.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-semibold text-text-primary">Practice Track & Curriculum Structure</h3>
        <p className="text-xs text-text-muted">
          Arrange topics, progression hierarchy, and module prerequisites for guided student learning.
        </p>
      </div>

      {/* Add Sub Topic Form */}
      <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Add Practice Module
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Module Title *</label>
            <input
              type="text"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="e.g. Array Reversals & Two Pointers"
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Prerequisite Module</label>
            <select
              value={prereqId}
              onChange={(e) => setPrereqId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
            >
              <option value="">None (Entry Point)</option>
              {subTopics.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Target Duration (mins)</label>
            <input
              type="number"
              min={5}
              value={estMinutes}
              onChange={(e) => setEstMinutes(parseInt(e.target.value, 10) || 20)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Questions Included</label>
            <input
              type="number"
              min={1}
              value={qCount}
              onChange={(e) => setQCount(parseInt(e.target.value, 10) || 5)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleAddSubTopic}
            disabled={!subTitle.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Practice Module
          </Button>
        </div>
      </div>

      {/* Ordered Track Hierarchy */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Learning Path Progression ({subTopics.length} Modules)
        </span>

        {subTopics.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-text-muted text-xs">
            No practice modules added. Create modules using the form above to build the track roadmap.
          </div>
        ) : (
          <div className="space-y-2">
            {subTopics.map((sub, idx) => (
              <div
                key={sub.id}
                className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{sub.title}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {sub.questionCount} Questions • {sub.estimatedMinutes} Mins
                      {sub.prerequisiteId && (
                        <span className="ml-2 text-cyan-300">
                          (Prereq: {subTopics.find((x) => x.id === sub.prerequisiteId)?.title || "Module"})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSubTopic(sub.id)}
                  className="p-1.5 text-text-muted hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
