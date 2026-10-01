import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { Sparkles, CheckCircle2, AlertCircle, FileText, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

export const JdMatcher: React.FC = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    matchPercent: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestedBullets: string[];
  } | null>(null);

  const handleRunMatch = () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first.");
      return;
    }
    setIsMatching(true);
    setTimeout(() => {
      setMatchResult({
        matchPercent: 78,
        matchedSkills: ["React.js", "TypeScript", "Node.js", "REST APIs", "Git"],
        missingSkills: ["Docker & Kubernetes", "AWS S3 / CloudFront", "GraphQL", "Redis Caching"],
        suggestedBullets: [
          "• Engineered high-concurrency Node.js microservices with Redis caching, reducing API response latency by 35%.",
          "• Containerized frontend React applications using Docker and deployed via CI/CD pipelines to AWS ECS.",
          "• Designed GraphQL queries alongside REST endpoints to optimize payload size for mobile client consumption.",
        ],
      });
      setIsMatching(false);
      toast.success("Job Description Match completed!");
    }, 1200);
  };

  return (
    <Card className="p-6 bg-surface border-border space-y-4 shadow-soft">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="p-2 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-text-primary">Job Description Keyword & Bullet Matcher</h3>
          <p className="text-[11px] text-text-muted font-mono">Compare your resume against specific target recruiter job postings.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-semibold text-xs text-text-primary">Paste Target Job Description (JD)</label>
        <textarea
          placeholder="Paste job requirements, responsibilities, and technical skills listed in the job posting..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
          className="w-full bg-surface-raised border border-border rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-cyan-400/50"
        />
        <Button
          variant="teal-cyan"
          size="sm"
          onClick={handleRunMatch}
          isLoading={isMatching}
          className="gap-1.5 text-xs shadow-glow"
        >
          <Sparkles className="w-3.5 h-3.5" /> Analyze JD Match % & Bullet Rewrites
        </Button>
      </div>

      {matchResult && (
        <div className="space-y-4 animate-fade-in pt-3 border-t border-border text-xs">
          <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
            <div>
              <span className="text-text-muted font-mono block text-[10px] uppercase">Match Score</span>
              <VerdictHeadline prefix="JD Alignment: " score={matchResult.matchPercent} size="md" />
            </div>
            <Badge variant="medium" className="font-mono">{matchResult.matchPercent}% Match</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[11px]">
            <div className="p-3 bg-live/10 border border-live/30 rounded-xl space-y-1.5">
              <span className="text-live font-bold block uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords ({matchResult.matchedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {matchResult.matchedSkills.map((s) => (
                  <Badge key={s} variant="active" className="text-[10px]">{s}</Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
              <span className="text-amber-400 font-bold block uppercase flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Missing Recruiter Keywords ({matchResult.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {matchResult.missingSkills.map((s) => (
                  <Badge key={s} variant="blocked" className="text-[10px]">{s}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-cyan-400 font-semibold uppercase text-[11px] block">
              Suggested ATS Bullet Point Rewrites (Copy to Resume):
            </span>
            <div className="space-y-2 font-mono text-[11px]">
              {matchResult.suggestedBullets.map((bullet, idx) => (
                <div key={idx} className="p-3 bg-surface-raised border border-border rounded-xl flex justify-between items-start gap-2">
                  <p className="text-text-primary leading-relaxed">{bullet}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(bullet);
                      toast.success("Bullet copied to clipboard!");
                    }}
                    className="text-cyan-400 p-1 h-auto shrink-0"
                    title="Copy Bullet"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
