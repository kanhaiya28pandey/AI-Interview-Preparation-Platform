import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Building2, ArrowRight, CheckCircle2, Layers, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PrepTracksWidget: React.FC = () => {
  const navigate = useNavigate();

  const tracks = [
    {
      id: "track-1",
      title: "Service-Based Tier-1 Track",
      target: "TCS Ninja / Wipro / Infosys / Cognizant",
      pattern: "Speed Aptitude, Foundation DSA, SQL Queries & Verbal Reasoning",
      accent: "border-cyan-400/40",
      link: "/practice",
    },
    {
      id: "track-2",
      title: "Product-Based Unicorn Track",
      target: "Amazon / Microsoft / Google / Atlassian",
      pattern: "Hard DP & Graphs, Low-Level Design, System Scalability",
      accent: "border-emerald-400/40",
      link: "/coding",
    },
    {
      id: "track-3",
      title: "Fast-Paced Startup Track",
      target: "Y Combinator / FinTech Startups",
      pattern: "Full-Stack Project Architecture, Live Code Pairing, REST APIs",
      accent: "border-amber-400/40",
      link: "/mock-interview",
    },
  ];

  return (
    <Card className="p-6 bg-surface border-border space-y-4 shadow-soft">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="p-2 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-text-primary">Company-Specific Placement Tracks</h3>
          <p className="text-[11px] text-text-muted font-mono">Curated preparation roadmaps tailored to company hiring patterns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tracks.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border bg-surface-raised space-y-3 ${t.accent} hover:border-cyan-400 transition-colors flex flex-col justify-between`}
          >
            <div className="space-y-2">
              <span className="font-serif text-base font-bold text-text-primary block">{t.title}</span>
              <Badge variant="accent" className="text-[10px]">{t.target}</Badge>
              <p className="text-xs text-text-secondary leading-relaxed pt-1">{t.pattern}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(t.link)}
              className="w-full text-xs font-mono gap-1.5 mt-2"
            >
              Start Recommended Path <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
