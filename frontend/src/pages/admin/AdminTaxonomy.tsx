import React, { useState } from "react";
import {
  Layers,
  Plus,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  CheckCircle2,
  FolderTree,
  ChevronDown,
  ChevronRight,
  Database,
  Code2,
  Cpu,
  Layout,
  Server,
  Cloud,
  BarChart3,
  Smartphone,
  ShieldAlert,
  CheckCircle,
  Wrench,
  BrainCircuit,
  Users,
  Zap,
  Briefcase,
  Network,
  Binary,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { mockCodingProblems } from "@/mocks/codingData";
import { mockPracticeTopics } from "@/mocks/practiceData";
import { mockQuizTopics } from "@/mocks/quizData";
import { mockInterviewRoles } from "@/mocks/interviewData";
import { mockArticles } from "@/mocks/articleData";

export const AdminTaxonomy: React.FC = () => {
  const {
    domains,
    addCustomDomain,
    addCustomTopic,
    toggleHide,
    isHidden,
  } = useTaxonomy();

  const [search, setSearch] = useState("");
  const [expandedDomainSlugs, setExpandedDomainSlugs] = useState<string[]>([
    "dsa",
    "programming-languages",
    "cs-fundamentals",
  ]);

  // Modal States
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");
  const [newDomainDesc, setNewDomainDesc] = useState("");
  const [newDomainColor, setNewDomainColor] = useState("#06b6d4");

  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [targetDomainSlug, setTargetDomainSlug] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newSubtopicsRaw, setNewSubtopicsRaw] = useState("");

  const toggleExpand = (slug: string) => {
    setExpandedDomainSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  // Helper to count usage across mock databases
  const getItemCount = (topicName: string, domainName: string) => {
    const tLower = topicName.toLowerCase();
    const dLower = domainName.toLowerCase();

    let count = 0;
    // Coding problems
    count += mockCodingProblems.filter(
      (p) =>
        p.category.toLowerCase().includes(tLower) ||
        p.category.toLowerCase().includes(dLower) ||
        p.title.toLowerCase().includes(tLower)
    ).length;

    // Practice topics
    count += mockPracticeTopics.filter(
      (pt) =>
        pt.title.toLowerCase().includes(tLower) ||
        pt.category.toLowerCase().includes(dLower) ||
        pt.tags.some((tag) => tag.toLowerCase().includes(tLower))
    ).length;

    // Quizzes
    count += mockQuizTopics.filter(
      (q) =>
        q.title.toLowerCase().includes(tLower) ||
        q.category.toLowerCase().includes(dLower) ||
        q.category.toLowerCase().includes(tLower)
    ).length;

    // Interviews
    count += mockInterviewRoles.filter(
      (r) =>
        r.title.toLowerCase().includes(tLower) ||
        r.category.toLowerCase().includes(dLower) ||
        r.description.toLowerCase().includes(tLower)
    ).length;

    // Articles
    count += mockArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(tLower) ||
        a.category.toLowerCase().includes(dLower) ||
        a.tags.some((tag) => tag.toLowerCase().includes(tLower))
    ).length;

    return Math.max(1, count);
  };

  const handleCreateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;
    addCustomDomain(newDomainName.trim(), newDomainDesc.trim(), "Layers", newDomainColor);
    setNewDomainName("");
    setNewDomainDesc("");
    setShowAddDomainModal(false);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDomainSlug || !newTopicName.trim()) return;
    const subtopics = newSubtopicsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    addCustomTopic(targetDomainSlug, newTopicName.trim(), subtopics);
    setNewTopicName("");
    setNewSubtopicsRaw("");
    setShowAddTopicModal(false);
  };

  const filteredDomains = domains.filter((d) => {
    const matchesDomain =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchesTopics = d.topics.some((t) => t.name.toLowerCase().includes(search.toLowerCase()));
    return matchesDomain || matchesTopics;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Domains & Topics Taxonomy
            </h1>
            <Badge variant="accent" className="font-mono text-xs">
              {domains.length} Domains
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Centralized source of truth for all curriculum categories, learning modules, and assessment tagging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddDomainModal(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Domain
          </Button>
        </div>
      </div>

      {/* LocalStorage Note Alert */}
      <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/25 rounded-2xl flex items-start gap-3 text-xs text-cyan-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold block">Browser Local Storage Synchronized</span>
          <p className="text-[11px] text-cyan-300/80 leading-relaxed">
            Custom items are saved in this browser only until backend support is added. Built-in domains cannot be deleted, but can be hidden from student views.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search domains, topics, or concepts..."
          className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Domains Accordion Tree */}
      <div className="space-y-3">
        {filteredDomains.map((dom) => {
          const isExpanded = expandedDomainSlugs.includes(dom.slug);
          const domainHidden = isHidden(dom.slug);

          return (
            <Card
              key={dom.id}
              className={`border transition-all duration-200 overflow-hidden ${
                domainHidden
                  ? "opacity-60 bg-surface/50 border-border"
                  : "bg-surface border-border hover:border-cyan-500/30"
              }`}
            >
              {/* Domain Header Row */}
              <div
                className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none bg-surface-raised/40 hover:bg-surface-raised/80"
                onClick={() => toggleExpand(dom.slug)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: `${dom.color}20`, color: dom.color, border: `1px solid ${dom.color}40` }}
                  >
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-text-primary">{dom.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                        {dom.slug}
                      </span>
                      {dom.id.startsWith("custom-") && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{dom.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {dom.topics.length} Topics
                  </span>

                  <button
                    type="button"
                    title={domainHidden ? "Unhide domain" : "Hide domain from student filters"}
                    onClick={() => toggleHide(dom.slug)}
                    className="p-1.5 text-text-muted hover:text-cyan-400 hover:bg-surface-raised rounded-lg transition-colors"
                  >
                    {domainHidden ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTargetDomainSlug(dom.slug);
                      setShowAddTopicModal(true);
                    }}
                    className="text-xs py-1 h-7 border-border hover:bg-surface text-cyan-400 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Topic
                  </Button>

                  <div className="p-1 text-text-muted">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Topics Sub-grid */}
              {isExpanded && (
                <div className="p-4 border-t border-border bg-ink/30 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dom.topics.map((top) => {
                      const topicHidden = isHidden(top.slug);
                      const usageCount = getItemCount(top.name, dom.name);

                      return (
                        <div
                          key={top.id}
                          className={`p-3 rounded-xl border transition-all space-y-2 ${
                            topicHidden
                              ? "opacity-50 bg-surface/40 border-border"
                              : "bg-surface border-border hover:border-cyan-500/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-text-primary truncate">
                              {top.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                title="Content items using this topic"
                              >
                                {usageCount} items
                              </span>
                              <button
                                type="button"
                                title={topicHidden ? "Unhide topic" : "Hide topic"}
                                onClick={() => toggleHide(top.slug)}
                                className="text-text-muted hover:text-cyan-400 p-1"
                              >
                                {topicHidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {top.subtopics && top.subtopics.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {top.subtopics.slice(0, 3).map((sub, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-raised text-text-muted border border-border"
                                >
                                  {sub}
                                </span>
                              ))}
                              {top.subtopics.length > 3 && (
                                <span className="text-[10px] text-text-muted font-mono px-1">
                                  +{top.subtopics.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* CREATE DOMAIN MODAL */}
      <Dialog
        isOpen={showAddDomainModal}
        onClose={() => setShowAddDomainModal(false)}
        title="Add Custom Domain"
        description="Expand the curriculum taxonomy with a new high-level engineering domain."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateDomain} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Domain Name *</label>
            <input
              type="text"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              placeholder="e.g. Distributed Database Systems"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
            <textarea
              rows={3}
              value={newDomainDesc}
              onChange={(e) => setNewDomainDesc(e.target.value)}
              placeholder="Scope and interview competencies covered by this domain..."
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Badge Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newDomainColor}
                onChange={(e) => setNewDomainColor(e.target.value)}
                className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-text-muted">{newDomainColor}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddDomainModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4"
            >
              Save Custom Domain
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE TOPIC MODAL */}
      <Dialog
        isOpen={showAddTopicModal}
        onClose={() => setShowAddTopicModal(false)}
        title="Add Topic to Domain"
        description="Define a new topic and its subtopic breakdown."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Topic Name *</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="e.g. Raft Consensus Protocol"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Subtopics (Comma separated)
            </label>
            <textarea
              rows={3}
              value={newSubtopicsRaw}
              onChange={(e) => setNewSubtopicsRaw(e.target.value)}
              placeholder="Leader Election, Log Replication, Safety Invariants, Cluster Membership Changes"
              className="w-full px-3 py-2 text-xs bg-surface-raised border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddTopicModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4"
            >
              Save Topic
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
