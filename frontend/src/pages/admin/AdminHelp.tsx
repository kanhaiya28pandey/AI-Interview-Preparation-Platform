import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { ADMIN_FAQ_ITEMS } from "@/mocks/faqs";
import { supportService, SupportTicket, HelpArticle } from "@/services/supportService";
import {
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  Ticket,
  CheckCircle2,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  MessageSquare,
  AlertTriangle,
  Paperclip,
  Clock,
  Check,
  Eye,
  X,
  Filter,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  HelpCircle,
  User,
  Sparkles,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export const AdminHelp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tickets" | "articles" | "guide">("tickets");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false);
  const [resolutionStatus, setResolutionStatus] = useState<"Open" | "In Review" | "Resolved">("Resolved");
  const [resolutionPriority, setResolutionPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [adminReply, setAdminReply] = useState<string>("");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [isSavingResolution, setIsSavingResolution] = useState<boolean>(false);

  // Articles State
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState<boolean>(true);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleCategory, setArticleCategory] = useState("Getting Started");
  const [customCategory, setCustomCategory] = useState("");
  const [articleAnswer, setArticleAnswer] = useState("");
  const [articleTags, setArticleTags] = useState("");
  const [isSavingArticle, setIsSavingArticle] = useState(false);

  // Admin FAQs expand
  const [expandedAdminFaqId, setExpandedAdminFaqId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await supportService.getTickets();
      setTickets(data);
    } catch {
      toast.error("Failed to load support tickets");
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const data = await supportService.getArticles();
      setArticles(data);
    } catch {
      toast.error("Failed to load help articles");
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchArticles();

    const handleTicketsUpdated = (e: any) => {
      if (e.detail) setTickets(e.detail);
    };
    const handleArticlesUpdated = (e: any) => {
      if (e.detail) setArticles(e.detail);
    };

    window.addEventListener("support-tickets-updated", handleTicketsUpdated);
    window.addEventListener("help-articles-updated", handleArticlesUpdated);
    return () => {
      window.removeEventListener("support-tickets-updated", handleTicketsUpdated);
      window.removeEventListener("help-articles-updated", handleArticlesUpdated);
    };
  }, []);

  // Quick Status change
  const handleQuickStatusChange = async (ticketId: string, nextStatus: "Open" | "In Review" | "Resolved") => {
    try {
      const updated = await supportService.updateTicketStatus(ticketId, nextStatus);
      if (updated) {
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
        toast.success(`Ticket ${ticketId} moved to '${nextStatus}'`);
      }
    } catch {
      toast.error("Failed to update ticket status");
    }
  };

  // Open detailed resolution modal
  const handleOpenResolveModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResolutionStatus(ticket.status);
    setResolutionPriority(ticket.priority || "Medium");
    setAdminReply(ticket.adminReply || "");
    setResolutionNotes(ticket.resolutionNotes || "");
    setIsResolveModalOpen(true);
  };

  // Save Resolution & Reply
  const handleSaveResolution = async () => {
    if (!selectedTicket) return;
    setIsSavingResolution(true);
    try {
      const updated = await supportService.updateTicketStatus(
        selectedTicket.id,
        resolutionStatus,
        resolutionNotes,
        adminReply,
        resolutionPriority
      );
      if (updated) {
        setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updated : t)));
        toast.success(`Ticket ${selectedTicket.id} updated & student notified!`);
        setIsResolveModalOpen(false);
      }
    } catch {
      toast.error("Failed to save ticket resolution");
    } finally {
      setIsSavingResolution(false);
    }
  };

  // Delete ticket
  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ticket ${ticketId}?`)) return;
    try {
      const ok = await supportService.deleteTicket(ticketId);
      if (ok) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        toast.success(`Ticket ${ticketId} deleted`);
      }
    } catch {
      toast.error("Failed to delete ticket");
    }
  };

  // Open Create Article Modal
  const handleOpenCreateArticle = () => {
    setEditingArticle(null);
    setArticleTitle("");
    setArticleCategory("Getting Started");
    setCustomCategory("");
    setArticleAnswer("");
    setArticleTags("");
    setIsArticleModalOpen(true);
  };

  // Open Edit Article Modal
  const handleOpenEditArticle = (article: HelpArticle) => {
    setEditingArticle(article);
    setArticleTitle(article.question);
    setArticleCategory(article.category);
    setCustomCategory("");
    setArticleAnswer(article.answer);
    setArticleTags(article.tags.join(", "));
    setIsArticleModalOpen(true);
  };

  // Save Article (Create or Edit)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleAnswer.trim()) {
      toast.error("Please provide both an article title and content.");
      return;
    }

    const finalCategory = articleCategory === "Custom"
      ? (customCategory.trim() || "General")
      : articleCategory;

    const tagsArray = articleTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    setIsSavingArticle(true);
    try {
      if (editingArticle) {
        const updated = await supportService.updateArticle(editingArticle.id, {
          question: articleTitle.trim(),
          category: finalCategory,
          answer: articleAnswer.trim(),
          tags: tagsArray,
        });
        setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? updated : a)));
        toast.success("Help article updated successfully!");
      } else {
        const created = await supportService.createArticle({
          question: articleTitle.trim(),
          category: finalCategory,
          answer: articleAnswer.trim(),
          tags: tagsArray,
        });
        setArticles((prev) => [created, ...prev]);
        toast.success("New help article published to Student Help Center!");
      }
      setIsArticleModalOpen(false);
    } catch {
      toast.error("Failed to save help article");
    } finally {
      setIsSavingArticle(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (articleId: string, title: string) => {
    if (!window.confirm(`Delete article "${title}"? Students will no longer see this in the Help Center.`)) {
      return;
    }
    try {
      const ok = await supportService.deleteArticle(articleId);
      if (ok) {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
        toast.success("Help article deleted.");
      }
    } catch {
      toast.error("Failed to delete help article");
    }
  };

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !searchQuery.trim() ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.userName && t.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || t.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === "all" || (t.priority && t.priority.toLowerCase() === priorityFilter.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || t.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Filtered Articles
  const categoriesList = Array.from(new Set(articles.map((a) => a.category))).filter(Boolean);

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      !searchQuery.trim() ||
      a.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || a.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Counts
  const openTicketsCount = tickets.filter((t) => t.status === "Open").length;
  const inReviewTicketsCount = tickets.filter((t) => t.status === "In Review").length;
  const resolvedTicketsCount = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-text-primary">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Help & Support Management
            </h1>
            <Badge variant="accent" className="font-mono text-[10px] uppercase">
              Admin Control Center
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
            Monitor real-time student support tickets, draft resolution responses, and author Help Center articles.
          </p>
        </div>

        {activeTab === "articles" ? (
          <Button
            variant="teal-cyan"
            size="sm"
            onClick={handleOpenCreateArticle}
            className="gap-1.5 text-xs shadow-glow self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Create New Help Article
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            className="gap-1.5 text-xs font-mono self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("tickets");
            setSearchQuery("");
            setCategoryFilter("all");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === "tickets"
              ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 font-semibold"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Student Support Tickets</span>
          {openTicketsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40 animate-pulse">
              {openTicketsCount} Open
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("articles");
            setSearchQuery("");
            setCategoryFilter("all");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === "articles"
              ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 font-semibold"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Knowledge Base & Articles</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-raised border border-border text-text-muted">
            {articles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("guide");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === "guide"
              ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 font-semibold"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Admin Operations Guide</span>
        </button>
      </div>

      {/* ================= TAB 1: SUPPORT TICKETS ================= */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-surface border-border space-y-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">Total Inquiries</span>
              <p className="text-2xl font-bold font-serif text-text-primary">{tickets.length}</p>
              <span className="text-[11px] text-text-secondary font-sans">All submitted queries</span>
            </Card>

            <Card className="p-4 bg-surface border-amber-400/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Open Issues
              </span>
              <p className="text-2xl font-bold font-serif text-amber-400">{openTicketsCount}</p>
              <span className="text-[11px] text-text-secondary font-sans">Awaiting admin review</span>
            </Card>

            <Card className="p-4 bg-surface border-cyan-400/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> In Review
              </span>
              <p className="text-2xl font-bold font-serif text-cyan-400">{inReviewTicketsCount}</p>
              <span className="text-[11px] text-text-secondary font-sans">Under investigation</span>
            </Card>

            <Card className="p-4 bg-surface border-emerald-400/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resolved
              </span>
              <p className="text-2xl font-bold font-serif text-emerald-400">{resolvedTicketsCount}</p>
              <span className="text-[11px] text-text-secondary font-sans">Closed with student feedback</span>
            </Card>
          </div>

          {/* Filter and Search Bar */}
          <Card className="p-4 bg-surface border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Ticket ID, Student name, email, or issue keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-raised border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Statuses ({tickets.length})</option>
                <option value="open">Open ({openTicketsCount})</option>
                <option value="in review">In Review ({inReviewTicketsCount})</option>
                <option value="resolved">Resolved ({resolvedTicketsCount})</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </Card>

          {/* Tickets List */}
          {loadingTickets ? (
            <div className="p-12 text-center text-text-muted font-mono text-xs">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3" />
              Loading student support tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card className="p-12 text-center bg-surface border-border space-y-2">
              <Ticket className="w-10 h-10 text-text-muted mx-auto" />
              <h3 className="font-bold text-sm text-text-primary">No Tickets Found</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No tickets match the selected filters. Try clearing your search parameters."
                  : "All student support requests have been resolved or none have been submitted yet."}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const isCritical = ticket.priority === "Critical";
                const isHigh = ticket.priority === "High";
                const isResolved = ticket.status === "Resolved";
                const isInReview = ticket.status === "In Review";

                return (
                  <Card
                    key={ticket.id}
                    className={`p-5 bg-surface border transition-all ${
                      isResolved
                        ? "border-border/60 opacity-90"
                        : isCritical
                        ? "border-red-500/40 bg-red-950/5"
                        : isInReview
                        ? "border-cyan-400/40"
                        : "border-amber-400/40"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Ticket Content */}
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                          <span className="font-bold text-cyan-400">{ticket.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isCritical
                                ? "bg-red-400/10 text-red-400 border-red-400/30"
                                : isHigh
                                ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                                : "bg-cyan-400/10 text-cyan-400 border-cyan-400/30"
                            }`}
                          >
                            {ticket.priority || "Medium"} Priority
                          </span>
                          <Badge variant="outline">{ticket.category}</Badge>
                          <span className="text-[11px] text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()} at{" "}
                            {new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {/* Student Info */}
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <User className="w-3.5 h-3.5 text-text-muted" />
                          <span className="font-semibold text-text-primary">{ticket.userName || "Student User"}</span>
                          <span>&bull;</span>
                          <span className="text-text-muted font-mono">{ticket.userEmail || "No email"}</span>
                          {ticket.userId && (
                            <>
                              <span>&bull;</span>
                              <span className="text-[10px] font-mono text-cyan-400/80">UID: {ticket.userId}</span>
                            </>
                          )}
                        </div>

                        {/* Subject & Description */}
                        <div>
                          <h3 className="font-serif text-sm md:text-base font-bold text-text-primary">
                            {ticket.subject}
                          </h3>
                          <p className="text-xs text-text-secondary leading-relaxed mt-1 whitespace-pre-wrap bg-surface-raised/40 p-3 rounded-lg border border-border">
                            {ticket.description}
                          </p>
                        </div>

                        {/* Attachment Link if present */}
                        {ticket.attachmentDataUrl && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs font-mono text-text-muted flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-cyan-400" />
                              Attachment:
                            </span>
                            <a
                              href={ticket.attachmentDataUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={ticket.attachmentName || "ticket-attachment"}
                              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              {ticket.attachmentName || "View Uploaded File"}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Existing Admin Response / Notes */}
                        {(ticket.adminReply || ticket.resolutionNotes) && (
                          <div className="mt-3 p-3.5 rounded-xl bg-teal-400/5 border border-teal-400/20 text-xs font-sans space-y-1.5">
                            <div className="flex items-center justify-between font-mono text-[10px] text-teal-400 font-semibold uppercase">
                              <span>Admin Reply / Resolution Response</span>
                              {ticket.resolvedAt && (
                                <span className="text-text-muted">
                                  {new Date(ticket.resolvedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {ticket.adminReply && (
                              <p className="text-text-primary text-xs italic">
                                &ldquo;{ticket.adminReply}&rdquo;
                              </p>
                            )}
                            {ticket.resolutionNotes && (
                              <p className="text-[11px] text-text-muted font-mono pt-1 border-t border-teal-400/20">
                                Internal Note: {ticket.resolutionNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                            isResolved
                              ? "bg-teal-400/15 text-teal-400 border-teal-400/30"
                              : isInReview
                              ? "bg-cyan-400/15 text-cyan-400 border-cyan-400/30"
                              : "bg-amber-400/15 text-amber-400 border-amber-400/30"
                          }`}
                        >
                          {ticket.status}
                        </span>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenResolveModal(ticket)}
                            className="gap-1.5 text-xs shadow-glow"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {isResolved ? "Edit Response" : "Resolve & Reply"}
                          </Button>

                          {!isResolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickStatusChange(ticket.id, "In Review")}
                              disabled={isInReview}
                              className="text-xs"
                            >
                              Mark Review
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 h-auto"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: KNOWLEDGE BASE ARTICLES ================= */}
      {activeTab === "articles" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-surface border-border space-y-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">Published Guides</span>
              <p className="text-2xl font-bold font-serif text-text-primary">{articles.length}</p>
              <span className="text-[11px] text-text-secondary font-sans">Active student knowledge base items</span>
            </Card>

            <Card className="p-4 bg-surface border-border space-y-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">Topic Categories</span>
              <p className="text-2xl font-bold font-serif text-cyan-400">{categoriesList.length}</p>
              <span className="text-[11px] text-text-secondary font-sans">From onboarding to live tests</span>
            </Card>

            <Card className="p-4 bg-surface border-border space-y-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">Total Helpful Votes</span>
              <p className="text-2xl font-bold font-serif text-emerald-400">
                {articles.reduce((acc, curr) => acc + (curr.helpfulCount || 0), 0)}
              </p>
              <span className="text-[11px] text-text-secondary font-sans">Positive student feedback count</span>
            </Card>
          </div>

          {/* Search & Category Filter */}
          <Card className="p-4 bg-surface border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search knowledge base articles, questions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-raised border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Categories ({articles.length})</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Articles List */}
          {loadingArticles ? (
            <div className="p-12 text-center text-text-muted font-mono text-xs">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3" />
              Loading Help Center articles...
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card className="p-12 text-center bg-surface border-border space-y-3">
              <BookOpen className="w-10 h-10 text-text-muted mx-auto" />
              <h3 className="font-bold text-sm text-text-primary">No Articles Found</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                No help articles matched your query. Click &quot;Create New Help Article&quot; to publish a new guide.
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenCreateArticle} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Publish New Article
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map((article) => {
                const isExpanded = expandedArticleId === article.id;
                return (
                  <Card
                    key={article.id}
                    className="p-5 bg-surface border-border hover:border-cyan-400/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="accent" className="text-[10px] uppercase font-mono">
                            {article.category}
                          </Badge>
                          <span className="text-[10px] font-mono text-text-muted">
                            Author: {article.author || "Platform Admin"}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-text-primary">{article.question}</h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                          <ThumbsUp className="w-3 h-3" /> {article.helpfulCount || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditArticle(article)}
                          className="gap-1 text-xs"
                          title="Edit Article"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteArticle(article.id, article.question)}
                          className="text-red-400 hover:text-red-300 p-2 h-auto"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                          className="p-2 h-auto text-text-muted hover:text-text-primary"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Preview / Expanded Answer */}
                    <p className={`text-xs text-text-secondary leading-relaxed ${isExpanded ? "whitespace-pre-wrap pt-2 border-t border-border" : "line-clamp-2"}`}>
                      {article.answer}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-raised border border-border text-text-muted"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ADMIN OPERATIONS GUIDE ================= */}
      {activeTab === "guide" && (
        <Card className="p-6 bg-surface border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <h2 className="font-serif text-lg font-bold text-text-primary">Admin Platform Operations FAQs</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search admin guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-surface-raised border border-border rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-3">
            {ADMIN_FAQ_ITEMS.filter(
              (item) =>
                !searchQuery.trim() ||
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((faq) => {
              const isExpanded = expandedAdminFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="p-4 bg-surface-raised border border-border rounded-xl space-y-2 cursor-pointer"
                  onClick={() => setExpandedAdminFaqId(isExpanded ? null : faq.id)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs text-text-primary">{faq.question}</h3>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </div>
                  {isExpanded && (
                    <p className="text-xs text-text-secondary font-sans leading-relaxed pt-2 border-t border-border">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ================= MODAL 1: TICKET RESOLUTION & REPLY ================= */}
      <Dialog
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title={`Resolve Ticket: ${selectedTicket?.id}`}
        description={`Respond to ${selectedTicket?.userName} (${selectedTicket?.userEmail})`}
      >
        {selectedTicket && (
          <div className="space-y-4 pt-2">
            {/* Ticket Summary Box */}
            <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-1.5 text-xs font-sans">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-bold text-cyan-400">{selectedTicket.category}</span>
                <span className="text-text-muted">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
              <h4 className="font-bold text-text-primary text-xs">{selectedTicket.subject}</h4>
              <p className="text-text-secondary leading-relaxed text-xs max-h-32 overflow-y-auto">
                {selectedTicket.description}
              </p>
              {selectedTicket.attachmentDataUrl && (
                <div className="pt-2 border-t border-border">
                  <a
                    href={selectedTicket.attachmentDataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Paperclip className="w-3 h-3" /> View Uploaded Attachment
                  </a>
                </div>
              )}
            </div>

            {/* Status & Priority Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-text-secondary">Resolution Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e: any) => setResolutionStatus(e.target.value)}
                  className="w-full p-2.5 bg-surface-raised border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  <option value="Open">Open</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-text-secondary">Priority Level</label>
                <select
                  value={resolutionPriority}
                  onChange={(e: any) => setResolutionPriority(e.target.value)}
                  className="w-full p-2.5 bg-surface-raised border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Response to Student */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-cyan-400 font-semibold flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Official Reply to Student (Visible in Help Center)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. We have deployed a fix for this compiler issue. Please refresh your browser or re-test your code..."
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                className="w-full p-3 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Internal Resolution Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-text-muted">
                Internal Root Cause / Engineering Notes
              </label>
              <textarea
                rows={2}
                placeholder="Internal notes for ops team record..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-2.5 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveResolution}
                isLoading={isSavingResolution}
                className="gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Save & Notify Student
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ================= MODAL 2: CREATE / EDIT HELP ARTICLE ================= */}
      <Dialog
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        title={editingArticle ? "Edit Help Center Article" : "Create New Help Article"}
        description={
          editingArticle
            ? "Modify this knowledge base guide to reflect platform changes."
            : "Publish a new FAQ or guide to help students master the platform."
        }
      >
        <form onSubmit={handleSaveArticle} className="space-y-4 pt-2">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-text-secondary">Category *</label>
            <select
              value={articleCategory}
              onChange={(e) => setArticleCategory(e.target.value)}
              className="w-full p-2.5 bg-surface-raised border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
            >
              <option value="Getting Started">Getting Started</option>
              <option value="Account & Profile">Account & Profile</option>
              <option value="Practice & Coding">Practice & Coding</option>
              <option value="Mock Interviews">Mock Interviews</option>
              <option value="Live Tests">Live Tests</option>
              <option value="Platform Guidelines">Platform Guidelines</option>
              <option value="Custom">+ Create New Category...</option>
            </select>
            {articleCategory === "Custom" && (
              <Input
                label="Custom Category Name"
                placeholder="e.g. System Requirements"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Question / Title */}
          <Input
            label="Article Title / Question *"
            placeholder="e.g. How do I request a contest time accommodation?"
            value={articleTitle}
            onChange={(e) => setArticleTitle(e.target.value)}
            required
          />

          {/* Detailed Content / Answer */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-text-secondary">
              Comprehensive Answer / Solution *
            </label>
            <textarea
              rows={5}
              placeholder="Provide clear step-by-step instructions or explanations for students..."
              value={articleAnswer}
              onChange={(e) => setArticleAnswer(e.target.value)}
              className="w-full p-3 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400 leading-relaxed"
              required
            />
          </div>

          {/* Tags */}
          <Input
            label="Search Tags (Comma-separated)"
            placeholder="e.g. live tests, contest, timing, timer"
            value={articleTags}
            onChange={(e) => setArticleTags(e.target.value)}
          />

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsArticleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingArticle}
              className="gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {editingArticle ? "Save Changes" : "Publish Article"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
