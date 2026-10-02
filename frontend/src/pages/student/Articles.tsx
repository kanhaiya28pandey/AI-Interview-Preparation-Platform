import React, { useState, useEffect } from "react";
import { articleService } from "@/services/articleService";
import { Article } from "@/mocks/articleData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { TaxonomySelect, TaxonomySelectOption } from "@/components/ui/TaxonomySelect";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Search, FileText, ThumbsUp, Eye, Clock, ArrowLeft, Share2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const Articles: React.FC = () => {
  const { domains, getTopicsForDomain, normalizeDomain } = useTaxonomy();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  useEffect(() => {
    articleService.getArticles().then((data) => {
      setArticles(data);
      setLoading(false);
    });
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

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikes = await articleService.likeArticle(id);
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likesCount: newLikes } : a))
    );
    if (activeArticle && activeArticle.id === id) {
      setActiveArticle({ ...activeArticle, likesCount: newLikes });
    }
  };

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));

    const aDomain = (a as any).domainSlug || normalizeDomain(a.category);
    const matchDomain =
      selectedDomain === "ALL" ||
      aDomain === selectedDomain ||
      a.category.toLowerCase().includes(selectedDomain.toLowerCase()) ||
      domains.find((d) => d.slug === selectedDomain)?.name.toLowerCase() === a.category.toLowerCase();

    const matchTopic =
      selectedTopic === "ALL" ||
      a.title.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(selectedTopic.toLowerCase()));

    return matchSearch && matchDomain && matchTopic;
  });

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">Articles & Placement Guides</h2>
          <p className="text-xs text-text-secondary">Curated guides on STAR framework, system design architecture, and tech resume tips.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

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
          title="No articles found"
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
        {filtered.map((art) => (
          <Card
            key={art.id}
            className="p-6 space-y-4 hover:border-cyan-400/50 transition-colors cursor-pointer flex flex-col justify-between"
            onClick={() => setActiveArticle(art)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="accent">{art.category}</Badge>
                <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> {art.readTimeMinutes} min read
                </span>
              </div>

              <h3 className="font-serif text-lg font-medium text-text-primary hover:text-cyan-400 transition-colors line-clamp-2">
                {art.title}
              </h3>
              <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">{art.summary}</p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <img src={art.author.avatar} alt={art.author.name} className="w-6 h-6 rounded-full object-cover border border-border" />
                <span className="truncate max-w-[100px]">{art.author.name}</span>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {art.viewsCount}</span>
                <button
                  onClick={(e) => handleLike(art.id, e)}
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> {art.likesCount}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* Article Detail View Modal */}
      {activeArticle && (
        <Dialog
          isOpen={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
          description={`Published on ${formatDate(activeArticle.publishedDate)} · ${activeArticle.readTimeMinutes} min read`}
          maxWidthClass="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-surface-raised p-3.5 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <img src={activeArticle.author.avatar} alt={activeArticle.author.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                <div>
                  <h4 className="text-xs font-semibold text-text-primary">{activeArticle.author.name}</h4>
                  <p className="text-[11px] text-text-muted">{activeArticle.author.role}</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={(e) => handleLike(activeArticle.id, e)} className="text-accent hover:text-accent-bright">
                <ThumbsUp className="w-4 h-4" /> {activeArticle.likesCount} Likes
              </Button>
            </div>

            <MarkdownRenderer content={activeArticle.content} />
          </div>
        </Dialog>
      )}
    </div>
  );
};
