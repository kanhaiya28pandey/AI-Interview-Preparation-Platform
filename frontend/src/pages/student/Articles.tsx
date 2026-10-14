import React, { useState, useEffect } from "react";
import { articleService } from "@/services/articleService";
import { Article, ArticleQAItem } from "@/mocks/articleData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { TaxonomySelect, TaxonomySelectOption } from "@/components/ui/TaxonomySelect";
import { PageHeader, StatTile, Highlight } from "@/components/common/PageHeader";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  BookOpen,
  FileText,
  ThumbsUp,
  Eye,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

export const Articles: React.FC = () => {
  const { user } = useAuth();
  const { domains, getTopicsForDomain, normalizeDomain } = useTaxonomy();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<"guide" | "qa">("guide");
  const [expandedQA, setExpandedQA] = useState<Record<string, boolean>>({});

  const loadArticles = () => {
    articleService.getArticles(false).then((data) => {
      setArticles(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadArticles();
    const handleUpdate = () => loadArticles();
    window.addEventListener("articles-updated", handleUpdate);
    return () => window.removeEventListener("articles-updated", handleUpdate);
  }, []);

  const handleDomainChange = (val: string) => {
    setSelectedDomain(val);
    if (val !== "ALL") {
      const validTopics = getTopicsForDomain(val).map((t) => t.name.toLowerCase());
      if (selectedTopic !== "ALL" && !validTopics.includes(selectedTopic.toLowerCase())) {
        setSelectedTopic("ALL");
      }
    }
  };

  const domainOptions: TaxonomySelectOption[] = [
    { value: "ALL", label: "All Domains" },
    ...domains.map((d) => ({
      value: d.slug,
      label: d.name,
    })),
  ];

  const topicOptions: TaxonomySelectOption[] =
    selectedDomain === "ALL"
      ? [
          { value: "ALL", label: "All Topics" },
          ...domains.flatMap((d) =>
            d.topics.map((t) => ({
              value: t.name,
              label: t.name,
              group: d.name,
            }))
          ),
        ]
      : (() => {
          const currentDomain = domains.find(
            (d) => d.slug === selectedDomain || d.name.toLowerCase() === selectedDomain.toLowerCase()
          );
          return [
            { value: "ALL", label: `All ${currentDomain?.name || ""} Topics` },
            ...(currentDomain?.topics || []).map((t) => ({
              value: t.name,
              label: t.name,
            })),
          ];
        })();

  // 1 Student = 1 Like Toggle
  const handleToggleLike = async (artId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { likesCount, isLiked } = await articleService.toggleLikeArticle(artId, user?.userId);

    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === artId) {
          const currentLiked = a.likedByUsers || [];
          const userToken = user?.userId || "guest";
          const updatedLiked = isLiked
            ? [...currentLiked, userToken]
            : currentLiked.filter((u) => u !== userToken);
          return { ...a, likesCount, likedByUsers: updatedLiked };
        }
        return a;
      })
    );

    if (activeArticle && activeArticle.id === artId) {
      const currentLiked = activeArticle.likedByUsers || [];
      const userToken = user?.userId || "guest";
      const updatedLiked = isLiked
        ? [...currentLiked, userToken]
        : currentLiked.filter((u) => u !== userToken);
      setActiveArticle({ ...activeArticle, likesCount, likedByUsers: updatedLiked });
    }

    if (isLiked) {
      toast.success("Helpful article upvoted!");
    } else {
      toast.info("Upvote removed.");
    }
  };

  // Open Article & Record Real View
  const handleOpenArticle = async (art: Article) => {
    setActiveArticle(art);
    setActiveTab("guide");

    // Automatically expand the first Q&A item
    if (art.interviewQA && art.interviewQA.length > 0) {
      setExpandedQA({ [art.interviewQA[0].id]: true });
    } else {
      setExpandedQA({});
    }

    const updatedViews = await articleService.recordRealView(art.id, user?.userId);
    setArticles((prev) =>
      prev.map((a) => (a.id === art.id ? { ...a, viewsCount: updatedViews } : a))
    );
    setActiveArticle((prev) => (prev && prev.id === art.id ? { ...prev, viewsCount: updatedViews } : prev));
  };

  const toggleQA = (qaId: string) => {
    setExpandedQA((prev) => ({
      ...prev,
      [qaId]: !prev[qaId],
    }));
  };

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      (Array.isArray(a.tags) && a.tags.some((t) => t.toLowerCase().includes(q)));

    const aDomain = a.domainSlug || normalizeDomain(a.category);
    const matchDomain =
      selectedDomain === "ALL" ||
      aDomain === selectedDomain ||
      a.category.toLowerCase().includes(selectedDomain.toLowerCase()) ||
      domains.find((d) => d.slug === selectedDomain)?.name.toLowerCase() === a.category.toLowerCase();

    const matchTopic =
      selectedTopic === "ALL" ||
      (a.topic && a.topic.toLowerCase().includes(selectedTopic.toLowerCase())) ||
      a.title.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      (Array.isArray(a.tags) && a.tags.some((t) => t.toLowerCase().includes(selectedTopic.toLowerCase())));

    return matchSearch && matchDomain && matchTopic;
  });

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <PageHeader
        icon={BookOpen}
        title="Placement Guides & Articles"
        subtitle="Curated engineering interview breakdowns, system design case studies, speed math, and high-yield interview Q&As."
        badge={`${articles.length} GUIDES`}
        accent="cyan"
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search guides, patterns, questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        }
      />

      {/* Filter Bar */}
      <Card className="p-3 bg-surface border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <TaxonomySelect
            options={domainOptions}
            value={selectedDomain}
            onChange={handleDomainChange}
            placeholder="Filter by Domain"
            ariaLabel="Filter articles by domain"
          />
        </div>
        <div>
          <TaxonomySelect
            options={topicOptions}
            value={selectedTopic}
            onChange={(val) => setSelectedTopic(val)}
            placeholder="Filter by Topic"
            ariaLabel="Filter articles by topic"
            grouped={selectedDomain === "ALL"}
          />
        </div>
      </Card>

      {/* Article Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No placement guides match your filter"
          description="Try clearing your search query or selecting another domain."
          actionText="Reset Filters"
          onAction={() => {
            setSearch("");
            setSelectedDomain("ALL");
            setSelectedTopic("ALL");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => {
            const isLiked = articleService.hasUserLiked(art, user?.userId);
            const qaCount = Array.isArray(art.interviewQA) ? art.interviewQA.length : 0;

            return (
              <Card
                key={art.id}
                className="p-6 space-y-4 hover:border-cyan-400/50 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
                onClick={() => handleOpenArticle(art)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="accent" className="text-[10px]">
                      {art.category}
                    </Badge>
                    <span className="text-[11px] font-mono text-text-muted flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-cyan-400" /> {art.readTimeMinutes} min read
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-text-primary group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>

                  {/* Highlights Bar */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {art.topic && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised border border-border text-cyan-400 truncate max-w-[180px]">
                        {art.topic}
                      </span>
                    )}
                    {qaCount > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> {qaCount} Q&As
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={art.author.avatar}
                      alt={art.author.name}
                      className="w-6 h-6 rounded-full object-cover border border-border shrink-0"
                    />
                    <span className="truncate max-w-[110px] font-sans">{art.author.name}</span>
                  </div>

                  {/* Real Views & 1-Student 1-Like Button */}
                  <div className="flex items-center gap-3 font-mono shrink-0">
                    <span className="flex items-center gap-1 text-text-muted" title={`${art.viewsCount} real readers`}>
                      <Eye className="w-3.5 h-3.5" /> {art.viewsCount}
                    </span>
                    <button
                      onClick={(e) => handleToggleLike(art.id, e)}
                      title={isLiked ? "You upvoted this (Click to remove)" : "Upvote this guide (1 student = 1 like)"}
                      className={cn(
                        "flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded",
                        isLiked
                          ? "text-cyan-400 bg-cyan-400/10 font-bold"
                          : "hover:text-cyan-400 text-text-muted"
                      )}
                    >
                      <ThumbsUp className={cn("w-3.5 h-3.5", isLiked ? "fill-cyan-400 text-cyan-400" : "")} />
                      <span>{art.likesCount}</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reader Modal: Guide & Interview Q&A */}
      {activeArticle && (
        <Dialog
          isOpen={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
          description={`Published on ${formatDate(activeArticle.publishedDate)} · ${activeArticle.readTimeMinutes} min read · +15 XP earned`}
          maxWidthClass="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-raised p-4 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <img
                  src={activeArticle.author.avatar}
                  alt={activeArticle.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
                <div>
                  <h4 className="text-xs font-semibold text-text-primary">{activeArticle.author.name}</h4>
                  <p className="text-[11px] text-text-muted">{activeArticle.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-muted flex items-center gap-1 mr-2">
                  <Eye className="w-3.5 h-3.5" /> {activeArticle.viewsCount} Views
                </span>
                <Button
                  variant={articleService.hasUserLiked(activeArticle, user?.userId) ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleToggleLike(activeArticle.id)}
                  className="text-xs"
                >
                  <ThumbsUp
                    className={cn(
                      "w-3.5 h-3.5 mr-1.5",
                      articleService.hasUserLiked(activeArticle, user?.userId) ? "fill-current" : ""
                    )}
                  />
                  {activeArticle.likesCount} {articleService.hasUserLiked(activeArticle, user?.userId) ? "Upvoted" : "Upvote"}
                </Button>
              </div>
            </div>

            {/* Navigation Tabs (Guide vs Interview Q&As) */}
            <div className="flex border-b border-border text-xs font-mono">
              <button
                onClick={() => setActiveTab("guide")}
                className={cn(
                  "px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 border-b-2",
                  activeTab === "guide"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-text-muted hover:text-text-primary"
                )}
              >
                <FileText className="w-4 h-4" /> Full Guide
              </button>
              <button
                onClick={() => setActiveTab("qa")}
                className={cn(
                  "px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 border-b-2",
                  activeTab === "qa"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-text-muted hover:text-text-primary"
                )}
              >
                <HelpCircle className="w-4 h-4" /> Frequently Asked Interview Q&A (
                {Array.isArray(activeArticle.interviewQA) ? activeArticle.interviewQA.length : 0})
              </button>
            </div>

            {/* Tab 1: Full Guide */}
            {activeTab === "guide" && (
              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">
                    Executive Summary
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    {activeArticle.summary}
                  </p>
                </div>
                <MarkdownRenderer content={activeArticle.content} />
              </div>
            )}

            {/* Tab 2: Interview Questions & Answers */}
            {activeTab === "qa" && (
              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                {(!activeArticle.interviewQA || activeArticle.interviewQA.length === 0) ? (
                  <div className="p-8 text-center text-text-muted font-mono text-xs">
                    No specific interview questions cataloged for this guide yet.
                  </div>
                ) : (
                  activeArticle.interviewQA.map((qa: ArticleQAItem, qIdx: number) => {
                    const isExpanded = Boolean(expandedQA[qa.id]);
                    return (
                      <div
                        key={qa.id || qIdx}
                        className="rounded-xl border border-border bg-surface overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleQA(qa.id)}
                          className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-surface-raised/50 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {qIdx + 1}
                            </span>
                            <span className="font-semibold text-xs text-text-primary font-sans leading-snug">
                              {qa.question}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-text-muted shrink-0 mt-1" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/50 bg-surface-raised/40">
                            <div>
                              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                                Model Interview Answer
                              </span>
                              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                                {qa.answer}
                              </p>
                            </div>

                            {Array.isArray(qa.keyPoints) && qa.keyPoints.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-mono text-text-muted uppercase block">
                                  Interviewer Key Evaluation Criteria & Takeaways
                                </span>
                                <ul className="space-y-1">
                                  {qa.keyPoints.map((pt, ptIdx) => (
                                    <li
                                      key={ptIdx}
                                      className="text-[11px] text-text-muted font-sans flex items-start gap-2"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                      <span>{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
};
