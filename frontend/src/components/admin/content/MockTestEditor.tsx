import React, { useState } from "react";
import { Plus, Trash2, Clock, CheckCircle2, Layers, BookOpen, Code2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface MockTestSection {
  id: string;
  title: string;
  sectionType: "APTITUDE" | "TECHNICAL_MCQ" | "CODING";
  questionSource: "BANK_FILTER" | "HAND_PICKED";
  questionCount: number;
  timeLimitMinutes: number;
  marksPerQuestion: number;
  passCutoff: number;
}

interface MockTestEditorProps {
  sections: MockTestSection[];
  overallPassMark: number;
  onSectionsChange: (sections: MockTestSection[]) => void;
  onOverallPassMarkChange: (mark: number) => void;
}

export const MockTestEditor: React.FC<MockTestEditorProps> = ({
  sections,
  overallPassMark,
  onSectionsChange,
  onOverallPassMarkChange,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"APTITUDE" | "TECHNICAL_MCQ" | "CODING">("TECHNICAL_MCQ");
  const [newCount, setNewCount] = useState(15);
  const [newTime, setNewTime] = useState(25);
  const [newMarks, setNewMarks] = useState(1);
  const [newCutoff, setNewCutoff] = useState(10);

  const handleAddSection = () => {
    if (!newTitle.trim()) return;

    const newSec: MockTestSection = {
      id: `sec-${Date.now()}`,
      title: newTitle.trim(),
      sectionType: newType,
      questionSource: "BANK_FILTER",
      questionCount: newCount,
      timeLimitMinutes: newTime,
      marksPerQuestion: newMarks,
      passCutoff: newCutoff,
    };

    onSectionsChange([...sections, newSec]);
    setNewTitle("");
    setNewCount(15);
    setNewTime(25);
    setNewCutoff(10);
  };

  const handleRemoveSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
  };

  const totalTime = sections.reduce((acc, s) => acc + s.timeLimitMinutes, 0);
  const totalQuestions = sections.reduce((acc, s) => acc + s.questionCount, 0);
  const totalMarks = sections.reduce((acc, s) => acc + s.questionCount * s.marksPerQuestion, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-semibold text-text-primary">Multi-Section Mock Test Builder</h3>
        <p className="text-xs text-text-muted">
          Define custom assessment stages (e.g. Aptitude, Technical Core, Hands-on Coding) with dedicated sectional timers and cutoffs.
        </p>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-raised border border-border p-4 rounded-xl">
        <div>
          <span className="text-[11px] text-text-muted uppercase tracking-wider block">Total Sections</span>
          <span className="text-lg font-bold text-text-primary font-mono">{sections.length}</span>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase tracking-wider block">Total Questions</span>
          <span className="text-lg font-bold text-cyan-400 font-mono">{totalQuestions}</span>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase tracking-wider block">Total Duration</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">{totalTime} mins</span>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase tracking-wider block">Total Max Marks</span>
          <span className="text-lg font-bold text-amber-400 font-mono">{totalMarks} pts</span>
        </div>
      </div>

      {/* Add New Section Panel */}
      <div className="p-5 bg-surface-raised border border-border rounded-xl space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Configure New Section</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Section Title *</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Technical Computer Science MCQ"
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Section Category</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
            >
              <option value="APTITUDE">Aptitude & Logical Reasoning</option>
              <option value="TECHNICAL_MCQ">Technical Domain MCQ</option>
              <option value="CODING">Hands-on Coding Arena</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Question Count</label>
            <input
              type="number"
              min={1}
              value={newCount}
              onChange={(e) => setNewCount(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Time Limit (mins)</label>
            <input
              type="number"
              min={1}
              value={newTime}
              onChange={(e) => setNewTime(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Marks / Question</label>
            <input
              type="number"
              min={1}
              value={newMarks}
              onChange={(e) => setNewMarks(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Section Cutoff (pts)</label>
            <input
              type="number"
              min={0}
              value={newCutoff}
              onChange={(e) => setNewCutoff(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleAddSection}
            disabled={!newTitle.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Section to Mock Test
          </Button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Configured Sections ({sections.length})
        </span>

        {sections.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-text-muted text-xs">
            No sections defined yet. Add Aptitude, Technical, and Coding sections using the form above.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 bg-surface-raised border border-border rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-text-primary truncate">{sec.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border text-cyan-300">
                        {sec.sectionType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1">
                      <span>{sec.questionCount} Questions</span>
                      <span>•</span>
                      <span>{sec.timeLimitMinutes} Mins</span>
                      <span>•</span>
                      <span>{sec.marksPerQuestion} Pts each</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Cutoff: {sec.passCutoff} pts</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSection(sec.id)}
                  className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Cutoff Settings */}
      <div className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-text-primary">Overall Pass Mark (%)</h4>
          <p className="text-[11px] text-text-muted">Minimum aggregate score required to pass the complete mock test.</p>
        </div>
        <div className="w-32">
          <input
            type="number"
            min={1}
            max={100}
            value={overallPassMark}
            onChange={(e) => onOverallPassMarkChange(parseInt(e.target.value, 10) || 60)}
            className="w-full px-3 py-1.5 text-xs text-right bg-surface-raised border border-border rounded-lg text-text-primary font-mono"
          />
        </div>
      </div>
    </div>
  );
};
