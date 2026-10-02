import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { practiceService } from "@/services/practiceService";
import { progressService } from "@/services/progressService";
import { PracticeTopic, PracticeQuestion } from "@/mocks/practiceData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Dialog } from "@/components/ui/Dialog";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useAuth } from "@/context/AuthContext";
import { getScopedItem, setScopedItem } from "@/lib/userScope";
import {
  Search,
  BookOpen,
  Layers,
  Coffee,
  Users,
  Code,
  Database,
  Cloud,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Flame,
  Layout,
  Binary,
} from "lucide-react";

export const Practice: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDomain = searchParams.get("domain") || "ALL";

  const { domains, normalizeDomain } = useTaxonomy();
  const { user } = useAuth();

  const [topics, setTopics] = useState<PracticeTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");

  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null);
  const [topicQuestions, setTopicQuestions] = useState<PracticeQuestion[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // User scoped "Continue where you left off" state
  const [lastPracticed, setLastPracticed] = useState<{ id: string; title: string; category: string } | null>(null);

  useEffect(() => {
    practiceService.getTopics().then((data) => {
      setTopics(data);
      setLoading(false);
    });

    const storedLast = getScopedItem<{ id: string; title: string; category: string } | null>(
      user?.userId,
      "last_practiced_topic",
      null
    );
    if (storedLast) {
      setLastPracticed(storedLast);
    }
  }, [user]);

  useEffect(() => {
    const urlDomain = searchParams.get("domain");
    if (urlDomain && urlDomain !== selectedDomain) {
      setSelectedDomain(urlDomain);
    }
  }, [searchParams]);

  const handleSelectDomain = (slug: string) => {
    setSelectedDomain(slug);
    if (slug === "ALL") {
      searchParams.delete("domain");
    } else {
      searchParams.set("domain", slug);
    }
    setSearchParams(searchParams);
  };

  const openTopicModal = async (topic: PracticeTopic) => {
    setSelectedTopic(topic);
    setModalLoading(true);

    // Save to user scoped continue where you left off
    const tracker = { id: topic.id, title: topic.title, category: topic.category };
    setScopedItem(user?.userId, "last_practiced_topic", tracker);
    setLastPracticed(tracker);

    const questions = await practiceService.getQuestionsByTopic(topic.id);
    setTopicQuestions(questions);
    setModalLoading(false);
  };

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesDiff =
      selectedDifficulty === "ALL" || t.difficulty.toUpperCase() === selectedDifficulty;

    const topicDomainSlug = (t as any).domainSlug || normalizeDomain(t.category);
    const matchesDomain =
      selectedDomain === "ALL" ||
      topicDomainSlug === selectedDomain ||
      t.category.toLowerCase() === selectedDomain.toLowerCase() ||
      domains.find((d) => d.slug === selectedDomain)?.name.toLowerCase() === t.category.toLowerCase();

    return matchesSearch && matchesDiff && matchesDomain;
  });

  // Calculate domain progress stats
  const getDomainStats = (domainSlug: string) => {
    const domainTopics = topics.filter(
      (t) =>
        (t as any).domainSlug === domainSlug ||
        normalizeDomain(t.category) === domainSlug ||
        domains.find((d) => d.slug === domainSlug)?.name.toLowerCase() === t.category.toLowerCase()
    );
    const totalQ = domainTopics.reduce((acc, t) => acc + t.questionsCount, 0);
    const completedQ = domainTopics.reduce((acc, t) => acc + (t.completedCount || 0), 0);
    const percent = totalQ > 0 ? Math.round((completedQ / totalQ) * 100) : 0;
    return { count: domainTopics.length, totalQ, completedQ, percent };
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Layers":
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case "Coffee":
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case "Users":
        return <Users className="w-5 h-5 text-purple-400" />;
      case "Code":
        return <Code className="w-5 h-5 text-emerald-400" />;
      case "Database":
        return <Database className="w-5 h-5 text-blue-400" />;
      case "Cloud":
        return <Cloud className="w-5 h-5 text-sky-400" />;
      case "Layout":
        return <Layout className="w-5 h-5 text-cyan-400" />;
      case "Binary":
        return <Binary className="w-5 h-5 text-indigo-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">
            Curated Practice Tracks
          </h2>
          <p className="text-xs text-text-secondary">
            Master multi-domain engineering concepts with questions, answers, and architectural insights.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search tracks, tags, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex bg-surface-raised border border-border p-1 rounded-lg text-xs font-mono overflow-x-auto shrink-0">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded transition-colors shrink-0 ${
                  selectedDifficulty === diff
                    ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-[#0d1321] font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Where You Left Off Banner */}
      {lastPracticed && (
        <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-surface to-surface-raised border border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                Continue Where You Left Off
              </span>
              <h4 className="text-sm font-semibold text-text-primary">
                {lastPracticed.title}
              </h4>
              <p className="text-xs text-text-muted">{lastPracticed.category}</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const matched = topics.find((t) => t.id === lastPracticed.id);
              if (matched) openTopicModal(matched);
            }}
            className="shrink-0 text-xs flex items-center gap-1.5"
          >
            <span>Resume Track</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Domain Cards with Circular Progress Rings */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
            Explore by Domain
          </span>
          <button
            onClick={() => handleSelectDomain("ALL")}
            className={`text-xs font-mono ${
              selectedDomain === "ALL" ? "text-cyan-400 font-semibold" : "text-text-muted hover:text-text-primary"
            }`}
          >
            View All ({topics.length})
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 custom-scrollbar">
          {domains.map((d) => {
            const stats = getDomainStats(d.slug);
            const isSelected = selectedDomain === d.slug;
            // SVG circular progress math
            const radius = 14;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (stats.percent / 100) * circumference;

            return (
              <button
                key={d.id}
                onClick={() => handleSelectDomain(isSelected ? "ALL" : d.slug)}
                className={`p-3.5 rounded-xl border text-left min-w-[200px] shrink-0 transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-surface-raised border-cyan-400 shadow-md ring-1 ring-cyan-400/20"
                    : "bg-surface border-border hover:border-cyan-500/40 hover:bg-surface-raised/40"
                }`}
              >
                <div className="space-y-1 truncate">
                  <h4 className="text-xs font-semibold text-text-primary truncate">
                    {d.name}
                  </h4>
                  <p className="text-[11px] font-mono text-text-muted">
                    {stats.count} tracks · {d.topics.length} topics
                  </p>
                </div>

                {/* Circular Progress Ring */}
                <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r={radius}
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-border"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r={radius}
                      fill="transparent"
                      stroke={d.color || "#06b6d4"}
                      strokeWidth="3"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-mono text-text-primary font-bold">
                    {stats.percent}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredTopics.length === 0 ? (
        <EmptyState
          title="No tracks found"
          description="Try clearing your search query or selecting a different domain or difficulty."
          actionText="Reset Filters"
          onAction={() => {
            setSearch("");
            setSelectedDifficulty("ALL");
            handleSelectDomain("ALL");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-colors group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-surface-raised border border-border rounded-xl">
                    {renderIcon(topic.icon)}
                  </div>
                  <Badge variant={topic.difficulty.toLowerCase() as any}>
                    {topic.difficulty}
                  </Badge>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-cyan-400 block mb-0.5">
                    {topic.category}
                  </span>
                  <h3 className="font-serif text-lg font-medium text-text-primary group-hover:text-cyan-400 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-xs font-mono text-text-muted">
                  <span>Progress</span>
                  <span>
                    {topic.completedCount} / {topic.questionsCount} Qs
                  </span>
                </div>
                <Progress
                  value={
                    topic.questionsCount > 0
                      ? (topic.completedCount / topic.questionsCount) * 100
                      : 0
                  }
                  color="accent"
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => openTopicModal(topic)}
                >
                  <span>Practice Questions</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <Dialog
          isOpen={!!selectedTopic}
          onClose={() => setSelectedTopic(null)}
          title={selectedTopic.title}
          description={`${selectedTopic.category} Track · ${selectedTopic.questionsCount} Core Questions`}
          maxWidthClass="max-w-3xl"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {modalLoading ? (
              <div className="py-8 text-center text-xs font-mono text-text-muted">
                Loading question bank...
              </div>
            ) : topicQuestions.length === 0 ? (
              <p className="text-sm text-text-secondary py-4 text-center">
                No questions uploaded for this track yet.
              </p>
            ) : (
              topicQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-4 bg-surface-raised border border-border rounded-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-base font-medium text-text-primary">
                      {idx + 1}. {q.title}
                    </h4>
                    <Badge variant={q.difficulty.toLowerCase() as any}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {q.prompt}
                  </p>

                  <div className="space-y-1.5 bg-surface p-3 rounded-lg border border-border">
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold block">
                      Key Architectural Points to Cover:
                    </span>
                    <ul className="text-xs text-text-muted space-y-1 list-disc list-inside font-mono">
                      {q.keyPoints.map((kp, kIdx) => (
                        <li key={kIdx}>{kp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    {(() => {
                      const completedIds = progressService.getCompletedQuestionsForTopic(user?.userId, selectedTopic.id);
                      const isCompleted = completedIds.includes(q.id);

                      return (
                        <Button
                          type="button"
                          variant={isCompleted ? "outline" : "teal-cyan"}
                          size="sm"
                          onClick={() => {
                            progressService.togglePracticeQuestion(user?.userId, selectedTopic.id, q.id);
                            // Refresh topics list to update completedCount on cards
                            practiceService.getTopics(user?.userId).then((res) => setTopics(res));
                          }}
                          className="text-xs gap-1.5 font-mono"
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? "text-live" : "text-ink"}`} />
                          <span>{isCompleted ? "Practiced (Completed)" : "Mark as Practiced (+10 XP)"}</span>
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
};
