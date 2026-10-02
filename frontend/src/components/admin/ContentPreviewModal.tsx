import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ContentItem } from "@/services/adminContentService";
import { Eye, Clock, CheckCircle2, AlertCircle, FileText, Code2, Video, Sparkles } from "lucide-react";

export interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Student View Preview: ${item.title}`} description="Live preview of assessment layout experienced by student candidates">
      <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1 font-sans">
        {/* Banner Card */}
        <Card className="p-6 bg-gradient-to-r from-surface via-surface-raised to-surface border border-cyan-400/30 space-y-3 shadow-2xl">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="accent">{item.type}</Badge>
                <Badge variant="medium">{item.subject}</Badge>
                <Badge variant="active">{item.difficulty}</Badge>
              </div>
              <h2 className="font-serif text-2xl font-bold text-text-primary">{item.title}</h2>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/30">
              ⏱ {item.durationMinutes} Mins
            </span>
          </div>
          <p className="text-text-secondary leading-relaxed">{item.description}</p>
        </Card>

        {/* Payload Content Preview */}
        {item.type === "Article" ? (
          <Card className="p-6 bg-surface border border-border space-y-4">
            <h3 className="font-serif text-lg font-bold text-text-primary">Article & Learning Guide</h3>
            <div className="p-4 bg-surface-raised border border-border rounded-xl font-mono leading-relaxed whitespace-pre-wrap">
              {item.payload?.articleMarkdown || item.description}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Question Paper / Assessment Room ({item.questionsCount} Items)
              </h3>
              <span className="font-mono text-text-muted text-[11px]">Pass Cutoff: {item.passMarkPercent || 70}%</span>
            </div>

            {item.payload?.mcqQuestions && item.payload.mcqQuestions.length > 0 ? (
              <div className="space-y-3">
                {item.payload.mcqQuestions.map((q, idx) => (
                  <Card key={q.id} className="p-5 bg-surface border border-border space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-cyan-400 font-bold text-sm">
                        Q{idx + 1}. {q.questionText}
                      </span>
                    </div>

                    {q.codeSnippet && (
                      <pre className="p-3 bg-surface-raised border border-border rounded-xl font-mono text-[11px] overflow-x-auto text-text-primary">
                        {q.codeSnippet}
                      </pre>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border font-mono text-xs flex items-center justify-between ${
                            oIdx === q.correctOptionIndex
                              ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold"
                              : "bg-surface-raised border-border text-text-secondary"
                          }`}
                        >
                          <span>
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </span>
                          {oIdx === q.correctOptionIndex && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-text-muted bg-surface-raised border border-border/60 p-2.5 rounded-lg font-mono">
                        <span className="text-cyan-400 font-semibold">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-text-muted font-mono bg-surface-raised rounded-2xl border border-border">
                Standard questions pack rendered in candidate view.
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
