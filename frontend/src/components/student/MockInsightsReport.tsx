import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Video, Mic, CheckCircle2, AlertTriangle, Sparkles, Activity } from "lucide-react";

export interface MockInsightsReportProps {
  answerLengthWords?: number;
  fillerWordCount?: number;
  starMethodUsed?: boolean;
  confidenceScore?: number;
  topImprovements?: string[];
}

export const MockInsightsReport: React.FC<MockInsightsReportProps> = ({
  answerLengthWords = 145,
  fillerWordCount = 2,
  starMethodUsed = true,
  confidenceScore = 88,
  topImprovements = [
    "Quantify measurable business metrics (e.g. latency reduction %, user throughput).",
    "Elaborate on edge-case fallback strategies when third-party APIs time out.",
    "Maintain steady eye contact and reduce hesitation pauses during initial 10 seconds.",
  ],
}) => {
  return (
    <Card className="p-6 bg-surface border-cyan-400/30 space-y-4 shadow-soft">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="p-2 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-text-primary">Post-Session Audio & Behavioral Speech Insights</h3>
          <p className="text-[11px] text-text-muted font-mono">Fine-grained delivery metrics analyzed by AI Speech Evaluator.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
          <span className="text-text-muted text-[10px] uppercase block">Avg Answer Length</span>
          <span className="text-cyan-400 font-bold text-base">{answerLengthWords} words</span>
        </div>

        <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
          <span className="text-text-muted text-[10px] uppercase block">Filler Words (um/like)</span>
          <span className="text-live font-bold text-base">{fillerWordCount} detected</span>
        </div>

        <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
          <span className="text-text-muted text-[10px] uppercase block">STAR Method Check</span>
          <Badge variant={starMethodUsed ? "active" : "medium"} className="text-[10px]">
            {starMethodUsed ? "✓ Structured" : "Needs Structure"}
          </Badge>
        </div>

        <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1">
          <span className="text-text-muted text-[10px] uppercase block">Voice Confidence</span>
          <span className="text-amber-400 font-bold text-base">{confidenceScore}%</span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <span className="font-mono text-cyan-400 font-semibold uppercase text-[11px] block">
          Top 3 Target Actions to Reach 95%+ Placement Grade:
        </span>
        <ol className="space-y-1.5 list-decimal list-inside font-mono text-[11px] text-text-secondary">
          {topImprovements.map((imp, idx) => (
            <li key={idx} className="p-2.5 bg-surface-raised border border-border rounded-xl">
              <span className="text-text-primary">{imp}</span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
};
