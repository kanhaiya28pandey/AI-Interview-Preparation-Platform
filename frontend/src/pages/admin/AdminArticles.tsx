import React, { useState, useEffect } from "react";
import { articleService } from "@/services/articleService";
import { Article, ArticleQAItem } from "@/mocks/articleData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { RowActions } from "@/components/common/RowActions";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  FileText,
  Eye,
  ThumbsUp,
  Clock,
  HelpCircle,
  CheckCircle2,
  Layers,
  Search,
  Check,
  X,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const AdminArticles: React.FC = () => {
  const { domains } = useTaxonomy();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");

  // Editor Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Article>>({});
  const [editorTab, setEditorTab] = useState<"edit" | "preview" | "qa">("edit");

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  // AI Generator Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    domain: "Backend & Systems",
    topic: "",
    targetRole: "Software Engineer",
  });

  const loadArticles = () => {
    articleService.getArticles(true).then((data) => {
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

  const handleCreate = () => {
    setEditing({
      title: "",
      category: "Backend & Systems",
      domainSlug: "backend",
      topic: "",
      summary: "",
      content: "# Title\n\n## Introduction\nExplain the foundational concepts here.\n\n## Implementation & Architecture\nProvide code or system diagrams.\n\n## Trade-offs & Production Considerations\nExplain common failure modes and trade-offs.",
      readTimeMinutes: 8,
      status: "PUBLISHED",
      tags: ["Guide", "Placement Prep"],
      interviewQA: [
        {
          id: `qa-${Date.now()}-1`,
          question: "What is the primary architectural trade-off here?",
          answer: "Explain latency, throughput, and operational complexity trade-offs.",
          keyPoints: ["Point 1", "Point 2"],
        },
      ],
    });
    setEditorTab("edit");
    setModalOpen(true);
  };

  const handleEdit = (art: Article) => {
    setEditing({
      ...art,
      interviewQA: Array.isArray(art.interviewQA) ? [...art.interviewQA] : [],
    });
    setEditorTab("edit");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing.title?.trim()) {
      toast.error("Article title is required.");
      return;
    }

    try {
      if (editing.id) {
        await articleService.updateArticle(editing.id, editing);
        toast.success("Placement guide updated successfully.");
      } else {
        await articleService.createArticle(editing);
        toast.success("New placement guide published to student portal.");
      }
      setModalOpen(false);
      loadArticles();
    } catch (e: any) {
      toast.error(e.message || "Failed to save article.");
    }
  };

  const handleToggleStatus = async (artId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await articleService.toggleArticleStatus(artId);
      toast.success(`Article moved to ${updated.status}.`);
      loadArticles();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await articleService.deleteArticle(deleteTarget.id);
      toast.success("Placement guide deleted.");
      setDeleteTarget(null);
      loadArticles();
    } catch {
      toast.error("Failed to delete article.");
    }
  };

  // AI Generator Handler
  const handleGenerateAI = async () => {
    if (!aiForm.topic.trim()) {
      toast.error("Please enter a topic to generate.");
      return;
    }

    setAiGenerating(true);
    try {
      const generated = await articleService.generateAIArticle({
        topic: aiForm.topic,
        domain: aiForm.domain,
        targetRole: aiForm.targetRole,
      });

      // Match domainSlug
      const matchedDomain = domains.find(
        (d) => d.name.toLowerCase() === aiForm.domain.toLowerCase() || d.slug.includes(aiForm.domain.toLowerCase())
      );

      setEditing({
        title: generated.title,
        summary: generated.summary,
        content: generated.content,
        category: aiForm.domain,
        domainSlug: matchedDomain ? matchedDomain.slug : "backend",
        topic: aiForm.topic,
        readTimeMinutes: generated.readTimeMinutes || 8,
        tags: generated.tags || [aiForm.domain, aiForm.topic, "Interview Prep"],
        status: "PUBLISHED",
        interviewQA: generated.interviewQA || [],
      });

      setAiModalOpen(false);
      setEditorTab("edit");
      setModalOpen(true);
      toast.success("AI Placement Guide generated! Review and publish below.");
    } catch (err) {
      toast.error("AI Generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Q&A Item Manipulation inside Editor
  const handleAddQA = () => {
    const current = Array.isArray(editing.interviewQA) ? [...editing.interviewQA] : [];
    current.push({
      id: `qa-${Date.now()}-${current.length + 1}`,
      question: "Sample Interview Question?",
      answer: "Model interview answer explaining rationale and trade-offs.",
      keyPoints: ["Key evaluation criteria point 1"],
    });
    setEditing({ ...editing, interviewQA: current });
  };

  const handleUpdateQA = (index: number, field: keyof ArticleQAItem, value: any) => {
    const current = Array.isArray(editing.interviewQA) ? [...editing.interviewQA] : [];
    if (!current[index]) return;
    current[index] = { ...current[index], [field]: value };
    setEditing({ ...editing, interviewQA: current });
  };

  const handleRemoveQA = (index: number) => {
    const current = Array.isArray(editing.interviewQA) ? [...editing.interviewQA] : [];
    current.splice(index, 1);
    setEditing({ ...editing, interviewQA: current });
  };

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      (a.topic && a.topic.toLowerCase().includes(q)) ||
      (Array.isArray(a.tags) && a.tags.some((t) => t.toLowerCase().includes(q)));

    const matchDomain =
      domainFilter === "ALL" ||
      a.domainSlug === domainFilter ||
      a.category.toLowerCase().includes(domainFilter.toLowerCase());

    return matchSearch && matchDomain;
  });

  const totalViews = articles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
  const totalLikes = articles.reduce((acc, a) => acc + (a.likesCount || 0), 0);
  const publishedCount = articles.filter((a) => a.status === "PUBLISHED" || !a.status).length;
  const draftCount = articles.filter((a) => a.status === "DRAFT").length;

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-medium text-text-primary">Articles & Placement Guides CMS</h2>
            <Badge variant="accent" className="text-[10px] font-mono">
              Editorial Studio
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Create, edit, draft, publish, and AI-generate comprehensive placement guides and interview Q&As for students.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiModalOpen(true)}
            className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 mr-1.5" />
            AI Generate with Gemini
          </Button>

          <Button variant="primary" size="sm" onClick={handleCreate} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Publish New Guide
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-3.5 bg-surface border-border">
          <span className="text-[10px] font-mono text-text-muted uppercase block">Total Articles</span>
          <span className="font-serif font-bold text-xl text-text-primary block mt-0.5">{articles.length}</span>
        </Card>
        <Card className="p-3.5 bg-surface border-border">
          <span className="text-[10px] font-mono text-emerald-400 uppercase block">Published Live</span>
          <span className="font-serif font-bold text-xl text-emerald-400 block mt-0.5">{publishedCount}</span>
        </Card>
        <Card className="p-3.5 bg-surface border-border">
          <span className="text-[10px] font-mono text-amber-400 uppercase block">Drafts</span>
          <span className="font-serif font-bold text-xl text-amber-400 block mt-0.5">{draftCount}</span>
        </Card>
        <Card className="p-3.5 bg-surface border-border">
          <span className="text-[10px] font-mono text-cyan-400 uppercase block flex items-center gap-1">
            <Eye className="w-3 h-3 text-cyan-400" /> Real Views
          </span>
          <span className="font-serif font-bold text-xl text-cyan-400 block mt-0.5">{totalViews}</span>
        </Card>
        <Card className="p-3.5 bg-surface border-border">
          <span className="text-[10px] font-mono text-live uppercase block flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-live" /> Student Likes
          </span>
          <span className="font-serif font-bold text-xl text-text-primary block mt-0.5">{totalLikes}</span>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-3.5 bg-surface border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by title, topic, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="bg-surface-raised border border-border rounded-lg text-xs font-mono px-3 py-1.5 text-text-primary focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Domains ({articles.length})</option>
            <option value="dsa">DSA</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend & Systems</option>
            <option value="genai-llm">Generative AI & LLM</option>
            <option value="devops-cloud">DevOps & Cloud</option>
            <option value="placement-aptitude">Placement Aptitude & HR</option>
          </select>
        </div>
      </Card>

      {/* Articles Management Table */}
      <Card className="p-0 overflow-hidden bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 bg-surface-raised">Guide Title & Topic</th>
                <th className="p-4 bg-surface-raised">Domain</th>
                <th className="p-4 bg-surface-raised">Status</th>
                <th className="p-4 bg-surface-raised text-center">Real Views</th>
                <th className="p-4 bg-surface-raised text-center">Upvotes</th>
                <th className="p-4 bg-surface-raised">Q&A Count</th>
                <th className="p-4 bg-surface-raised">Read Time</th>
                <th className="p-4 bg-surface-raised text-right w-[160px] min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted font-mono text-xs">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((art) => {
                  const isPublished = art.status === "PUBLISHED" || !art.status;
                  const qaCount = Array.isArray(art.interviewQA) ? art.interviewQA.length : 0;

                  return (
                    <tr key={art.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-text-primary block text-sm">{art.title}</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-text-muted font-mono text-[11px]">
                          {art.topic && <span className="text-cyan-400 font-semibold">{art.topic}</span>}
                          {art.topic && <span>•</span>}
                          <span>by {art.author.name}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant="accent" className="text-[10px]">
                          {art.category}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(art.id, e)}
                          title="Click to toggle Published / Draft"
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors border",
                            isPublished
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                          )}
                        >
                          {isPublished ? "PUBLISHED" : "DRAFT"}
                        </button>
                      </td>

                      <td className="p-4 font-mono text-center text-text-primary font-bold">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" /> {art.viewsCount}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-center text-text-primary font-bold">
                        <span className="inline-flex items-center gap-1 text-live">
                          <ThumbsUp className="w-3.5 h-3.5 text-live" /> {art.likesCount}
                        </span>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px]">
                          {qaCount} Q&As
                        </span>
                      </td>

                      <td className="p-4 font-mono text-text-muted">
                        {art.readTimeMinutes} min
                      </td>

                      <td className="p-4 text-right w-[160px] min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(art)}
                            className="h-8 px-2.5 text-xs text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/10"
                            title="Edit Guide"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(art)}
                            className="h-8 px-2 text-xs"
                            title="Delete Guide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Editor Dialog (Create / Edit Article) */}
      {modalOpen && (
        <Dialog
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing.id ? `Edit Placement Guide: ${editing.title}` : "Publish New Placement Guide"}
          maxWidthClass="max-w-4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-mono">Status:</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditing({ ...editing, status: editing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })
                  }
                  className={cn(
                    "text-xs px-2.5 py-1 rounded font-mono font-bold border",
                    editing.status === "PUBLISHED"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  )}
                >
                  {editing.status || "PUBLISHED"} (Click to Toggle)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  Save & Publish Guide
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Top metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Guide Title"
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="e.g. Sliding Window & Two Pointer Masterclass"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Domain</label>
                <select
                  value={editing.category || "Backend & Systems"}
                  onChange={(e) => {
                    const matched = domains.find((d) => d.name === e.target.value);
                    setEditing({
                      ...editing,
                      category: e.target.value,
                      domainSlug: matched?.slug || "backend",
                    });
                  }}
                  className="w-full bg-surface-raised border border-border rounded-lg text-xs font-sans px-3 py-2 text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Frontend Engineering">Frontend Engineering</option>
                  <option value="Backend & Systems">Backend & Systems</option>
                  <option value="Generative AI & LLM">Generative AI & LLM</option>
                  <option value="DevOps & Cloud Infrastructure">DevOps & Cloud Infrastructure</option>
                  <option value="Placement Aptitude">Placement Aptitude</option>
                  <option value="HR & Behavioral">HR & Behavioral</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Target Topic"
                value={editing.topic || ""}
                onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                placeholder="e.g. Arrays, Sliding Window & Frequency Counters"
              />

              <Input
                label="Read Time (Minutes)"
                type="number"
                value={editing.readTimeMinutes || 8}
                onChange={(e) => setEditing({ ...editing, readTimeMinutes: Number(e.target.value) || 5 })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Executive Summary</label>
              <textarea
                value={editing.summary || ""}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                className="w-full h-16 p-2.5 bg-surface-raised border border-border rounded-lg text-xs font-sans text-text-primary focus:outline-none focus:border-cyan-400"
                placeholder="2-3 sentence overview of this guide..."
              />
            </div>

            {/* Editor Tabs: Content vs Live Preview vs Q&A */}
            <div className="flex border-b border-border text-xs font-mono">
              <button
                type="button"
                onClick={() => setEditorTab("edit")}
                className={cn(
                  "px-4 py-2 font-semibold border-b-2 transition-colors",
                  editorTab === "edit" ? "border-cyan-400 text-cyan-400" : "border-transparent text-text-muted"
                )}
              >
                Markdown Content
              </button>
              <button
                type="button"
                onClick={() => setEditorTab("preview")}
                className={cn(
                  "px-4 py-2 font-semibold border-b-2 transition-colors",
                  editorTab === "preview" ? "border-cyan-400 text-cyan-400" : "border-transparent text-text-muted"
                )}
              >
                Live Preview
              </button>
              <button
                type="button"
                onClick={() => setEditorTab("qa")}
                className={cn(
                  "px-4 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
                  editorTab === "qa" ? "border-cyan-400 text-cyan-400" : "border-transparent text-text-muted"
                )}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Interview Q&As ({Array.isArray(editing.interviewQA) ? editing.interviewQA.length : 0})
              </button>
            </div>

            {/* Tab: Markdown Edit */}
            {editorTab === "edit" && (
              <div>
                <textarea
                  value={editing.content || ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="w-full h-64 p-3 bg-surface-raised border border-border rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400 leading-relaxed custom-scrollbar"
                  placeholder="# Markdown Content..."
                />
              </div>
            )}

            {/* Tab: Live Preview */}
            {editorTab === "preview" && (
              <div className="max-h-64 overflow-y-auto p-4 bg-surface rounded-lg border border-border custom-scrollbar">
                <MarkdownRenderer content={editing.content || "*No content provided.*"} />
              </div>
            )}

            {/* Tab: Interview Q&As */}
            {editorTab === "qa" && (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted font-mono">
                    Frequently Asked Technical & Behavioral Interview Questions attached to this guide
                  </span>
                  <Button variant="outline" size="sm" onClick={handleAddQA} className="text-xs h-7">
                    <Plus className="w-3 h-3 mr-1" /> Add Question
                  </Button>
                </div>

                {(!editing.interviewQA || editing.interviewQA.length === 0) ? (
                  <div className="p-6 text-center text-text-muted font-mono text-xs border border-dashed border-border rounded-lg">
                    No interview questions added yet. Click &quot;Add Question&quot; to build the Q&A section.
                  </div>
                ) : (
                  editing.interviewQA.map((qa, qIdx) => (
                    <div key={qa.id || qIdx} className="p-3.5 rounded-lg border border-border bg-surface space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">Question #{qIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQA(qIdx)}
                          className="text-rose-400 hover:text-rose-300 text-xs font-mono"
                        >
                          Remove
                        </button>
                      </div>

                      <Input
                        label="Interview Question"
                        value={qa.question}
                        onChange={(e) => handleUpdateQA(qIdx, "question", e.target.value)}
                        placeholder="e.g. How does this architecture handle network partitions?"
                      />

                      <div>
                        <label className="block text-[11px] font-medium text-text-secondary mb-1">
                          Model Interview Answer
                        </label>
                        <textarea
                          value={qa.answer}
                          onChange={(e) => handleUpdateQA(qIdx, "answer", e.target.value)}
                          className="w-full h-16 p-2 bg-surface-raised border border-border rounded-lg text-xs font-sans text-text-primary focus:outline-none focus:border-cyan-400"
                          placeholder="Comprehensive model answer..."
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* AI Guide Generator Dialog */}
      {aiModalOpen && (
        <Dialog
          isOpen={aiModalOpen}
          onClose={() => !aiGenerating && setAiModalOpen(false)}
          title="AI Placement Guide Generator (Powered by Gemini)"
          maxWidthClass="max-w-lg"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" disabled={aiGenerating} onClick={() => setAiModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" disabled={aiGenerating} onClick={handleGenerateAI}>
                {aiGenerating ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> Generating Guide...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Generate Placement Guide
                  </span>
                )}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              Gemini will generate a full architectural placement guide complete with code snippets, core trade-offs, and 4 high-yield interview Q&As tailored to your target domain.
            </p>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Target Domain</label>
              <select
                value={aiForm.domain}
                onChange={(e) => setAiForm({ ...aiForm, domain: e.target.value })}
                className="w-full bg-surface-raised border border-border rounded-lg text-xs font-sans px-3 py-2 text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                <option value="Frontend Engineering">Frontend Engineering</option>
                <option value="Backend & Systems">Backend & Systems</option>
                <option value="Generative AI & LLM">Generative AI & LLM</option>
                <option value="DevOps & Cloud Infrastructure">DevOps & Cloud Infrastructure</option>
                <option value="Placement Aptitude">Placement Aptitude</option>
                <option value="HR & Behavioral">HR & Behavioral</option>
              </select>
            </div>

            <Input
              label="Topic or Focus Area"
              value={aiForm.topic}
              onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
              placeholder="e.g. Distributed Caching with Redis & Cache Invalidation"
            />

            <Input
              label="Target Role Level"
              value={aiForm.targetRole}
              onChange={(e) => setAiForm({ ...aiForm, targetRole: e.target.value })}
              placeholder="e.g. Software Engineer (Campus & Lateral)"
            />
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Dialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Placement Guide"
          maxWidthClass="max-w-md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete Permanently
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-text-primary">
              Are you sure you want to delete the guide: <strong>&quot;{deleteTarget.title}&quot;</strong>?
            </p>
            <p className="text-text-muted">
              This will remove the guide, its {deleteTarget.viewsCount} reader views, and its {Array.isArray(deleteTarget.interviewQA) ? deleteTarget.interviewQA.length : 0} interview Q&As from the student portal.
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
};
