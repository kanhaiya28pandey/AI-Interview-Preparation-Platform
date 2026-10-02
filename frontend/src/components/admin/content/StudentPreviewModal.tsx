import React, { useState } from "react";
import { X, Clock, Award, ShieldAlert, CheckCircle2, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContentItem } from "@/services/contentManagerService";

interface StudentPreviewModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentPreviewModal: React.FC<StudentPreviewModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  if (!isOpen || !item) return null;

  const questions: any[] = item.contentData?.questions || [];
  const duration = item.settings?.durationMinutes || 30;
  const currentQ = questions[activeQuestionIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Topbar / Student Preview Badge */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-raised">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Eye className="w-3.5 h-3.5" /> Student Simulation Mode
            </span>
            <span className="text-xs text-text-muted">Status: {item.status}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assessment Banner Header */}
        <div className="p-6 border-b border-border bg-ink/40 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-text-primary">{item.title}</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-cyan-400 font-mono font-medium">
                <Clock className="w-3.5 h-3.5" /> {duration} Mins
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-mono font-medium">
                <Award className="w-3.5 h-3.5" /> Pass: {item.settings?.passPercentage || 70}%
              </span>
            </div>
          </div>
          <p className="text-xs text-text-muted">{item.description}</p>
        </div>

        {/* Content Body Based on Type */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {item.type === "QUIZ" && questions.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-text-muted border-b border-border/50 pb-2">
                <span>
                  Question {activeQuestionIdx + 1} of {questions.length}
                </span>
                <span>Topic: {currentQ?.topic || item.subject}</span>
              </div>

              {currentQ && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-text-primary leading-relaxed">
                    {currentQ.question}
                  </p>

                  {currentQ.codeSnippet && (
                    <pre className="p-3 bg-ink rounded-lg border border-border text-xs font-mono text-cyan-300 overflow-x-auto">
                      <code>{currentQ.codeSnippet}</code>
                    </pre>
                  )}

                  <div className="space-y-2 pt-2">
                    {currentQ.options?.map((opt: string, optIdx: number) => {
                      const isSelected = selectedAnswers[activeQuestionIdx] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [activeQuestionIdx]: optIdx })}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-medium"
                              : "bg-surface border-border text-text-muted hover:border-cyan-500/20 hover:text-text-primary"
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-mono font-bold text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question Navigation Bubbles */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeQuestionIdx === 0}
                  onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                  className="text-xs"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm px-2">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveQuestionIdx(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        activeQuestionIdx === i
                          ? "bg-cyan-500 text-black font-bold"
                          : selectedAnswers[i] !== undefined
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-surface-raised border border-border text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  disabled={activeQuestionIdx === questions.length - 1}
                  onClick={() => setActiveQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {item.type === "CODING_PROBLEM" && (
            <div className="space-y-4">
              <div className="prose prose-invert prose-sm max-w-none text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
                {item.contentData?.statement || "No statement text written yet."}
              </div>

              {item.contentData?.testCases && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Sample Test Cases</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.contentData.testCases
                      .filter((tc: any) => !tc.isHidden)
                      .map((tc: any, i: number) => (
                        <div key={i} className="p-3 bg-ink rounded-lg border border-border font-mono text-[11px] space-y-1">
                          <div className="text-cyan-400 font-semibold">Sample #{i + 1}</div>
                          <div className="text-text-muted truncate">Input: {tc.inputStr}</div>
                          <div className="text-emerald-400 truncate">Expected: {tc.expectedStr}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {item.type === "ARTICLE" && (
            <div className="space-y-4">
              {item.contentData?.coverImage && (
                <img
                  src={item.contentData.coverImage}
                  alt={item.title}
                  className="w-full h-56 object-cover rounded-xl border border-border"
                />
              )}
              <div className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
                {item.contentData?.markdown || "Article content is empty."}
              </div>
            </div>
          )}

          {item.type === "MOCK_TEST" && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Full-Length Test Section Breakdown
              </h4>
              {item.contentData?.sections?.map((sec: any, i: number) => (
                <div key={i} className="p-3 bg-surface-raised rounded-xl border border-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-text-primary">{sec.title}</span>
                    <span className="ml-2 text-text-muted font-mono">({sec.sectionType})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-text-muted">
                    <span>{sec.questionCount} Questions</span>
                    <span>•</span>
                    <span>{sec.timeLimitMinutes} Mins</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Cutoff: {sec.passCutoff} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {item.type === "MOCK_INTERVIEW" && (
            <div className="space-y-3">
              <div className="p-4 bg-surface-raised rounded-xl border border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">Role: {item.contentData?.targetRole || item.subject}</span>
                  <span className="text-cyan-400 font-mono">Type: {item.contentData?.interviewType || "Technical"}</span>
                </div>
                <p className="text-text-muted">
                  Interviewer Persona: <strong className="text-text-primary">{item.settings?.aiPersona || "Strict"}</strong> •
                  Follow-up Depth: <strong className="text-text-primary">{item.settings?.followUpDepth || 2}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-raised flex items-center justify-between">
          <span className="text-xs text-text-muted">
            Preview is read-only. Student responses are not saved during preview.
          </span>
          <Button onClick={onClose} className="bg-surface hover:bg-surface border border-border text-text-primary text-xs px-4">
            Close Simulation
          </Button>
        </div>
      </div>
    </div>
  );
};
