import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Circle,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Monitor,
  HardDrive,
  Wifi,
  Maximize2,
  FileCode2,
  Paperclip,
  Send,
  Sparkles,
  Ticket,
  Terminal,
  Info,
  ChevronDown,
  ChevronUp,
  Code2,
  BookOpen,
  Video,
  FileText,
  User,
  Shield,
  Layers,
  Wrench,
  RotateCcw,
  Check,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Progress } from "@/components/ui/Progress";
import { FAQ_CATEGORIES, FAQItem } from "@/mocks/faqs";
import { supportService, SupportTicket } from "@/services/supportService";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/mocks/profileData";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { EmptyState } from "@/components/common/EmptyState";

// Validation schema for Support Ticket form
const ticketSchema = z.object({
  category: z.enum([
    "Bug Report",
    "Feature Request",
    "Account Issue",
    "Feedback",
    "Other",
  ]),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject is too long"),
  description: z
    .string()
    .min(15, "Please provide a detailed description (at least 15 characters)")
    .max(1000, "Description is too long"),
});

type TicketFormInputs = z.infer<typeof ticketSchema>;

export const HelpCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: 'faq' | 'checklist' | 'diagnostics' | 'contact' | 'shortcuts' | 'about'
  const initialTabParam = searchParams.get("tab") || "faq";
  const [activeTab, setActiveTab] = useState<string>(initialTabParam);
  const targetFaqParam = searchParams.get("faq");

  // Search Query State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(
    targetFaqParam || null
  );

  // Tickets & Profile Data
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );

  // Attachment State for Support Ticket Form
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(
    null
  );

  // System Diagnostics State
  const [systemCheckResult, setSystemCheckResult] = useState<{
    browser: string;
    localStorageOk: boolean;
    online: boolean;
    resolution: string;
    version: string;
  } | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormInputs>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: "Bug Report",
      subject: "",
      description: "",
    },
  });

  useEffect(() => {
    // Load initial support data
    supportService.getTickets().then(setTickets);
    setVotes(supportService.getFaqVotes());
    profileService.getProfile().then(setProfile);

    // Run system diagnostics
    runSystemDiagnostics();
  }, []);

  useEffect(() => {
    if (targetFaqParam) {
      setExpandedFaqId(targetFaqParam);
      setActiveTab("faq");
    }
  }, [targetFaqParam]);

  const runSystemDiagnostics = () => {
    const ua = navigator.userAgent;
    let browserName = "Modern Browser";
    if (ua.includes("Chrome")) browserName = "Chrome / Chromium";
    else if (ua.includes("Firefox")) browserName = "Mozilla Firefox";
    else if (ua.includes("Safari")) browserName = "Apple Safari";
    else if (ua.includes("Edg")) browserName = "Microsoft Edge";

    let storageTest = false;
    try {
      localStorage.setItem("__test_storage__", "ok");
      storageTest = localStorage.getItem("__test_storage__") === "ok";
      localStorage.removeItem("__test_storage__");
    } catch {
      storageTest = false;
    }

    setSystemCheckResult({
      browser: browserName,
      localStorageOk: storageTest,
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      resolution: `${window.innerWidth} x ${window.innerHeight} px`,
      version: "v1.0.0 (Production Build)",
    });
  };

  const handleVote = (faqId: string, type: "up" | "down") => {
    const newVotes = supportService.saveFaqVote(faqId, type);
    setVotes({ ...newVotes });
    toast.success(
      type === "up" ? "Feedback recorded! Thanks." : "Thanks for your feedback."
    );
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachmentName(file.name);

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setAttachmentDataUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitTicket = async (data: TicketFormInputs) => {
    try {
      const newTicket = await supportService.createTicket({
        category: data.category,
        subject: data.subject,
        description: data.description,
        attachmentName: attachmentName || undefined,
        attachmentDataUrl: attachmentDataUrl || undefined,
      });

      setTickets((prev) => [newTicket, ...prev]);
      reset();
      setAttachmentName(null);
      setAttachmentDataUrl(null);
      toast.success(
        `Support Ticket ${newTicket.id} submitted! We'll notify you shortly.`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to submit ticket.");
    }
  };

  // Filter FAQs based on category tab & search query
  const allFaqs = FAQ_CATEGORIES.flatMap((cat) => cat.items);
  const filteredFaqs = allFaqs.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase().replace(/\s+/g, "-") === selectedCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Checklist Items Calculation
  const checklistItems = [
    {
      id: "chk-profile",
      title: "Complete your profile to 100%",
      description: "Fill bio, headline, college degree, and target roles",
      completed: profile ? profileService.getCompletionPercentage(profile) >= 100 : false,
      link: "/profile",
      actionText: "Edit Profile",
    },
    {
      id: "chk-quiz",
      title: "Take your first MCQ concept quiz",
      description: "Evaluate core CS concepts in 10-minute quizzes",
      completed: (profile?.stats?.quizzesCompleted || 0) > 0,
      link: "/quiz",
      actionText: "Start Quiz",
    },
    {
      id: "chk-coding",
      title: "Solve a coding benchmark in Coding Arena",
      description: "Run test cases and submit algorithm solutions",
      completed: (profile?.stats?.codingProblemsSolved || 0) > 0,
      link: "/coding",
      actionText: "Open Coding Arena",
    },
    {
      id: "chk-interview",
      title: "Complete an AI Mock Interview round",
      description: "Practice technical questions with voice simulation",
      completed: (profile?.stats?.mockInterviewsCompleted || 0) > 0,
      link: "/mock-interview",
      actionText: "Enter Room",
    },
    {
      id: "chk-resume",
      title: "Analyze your resume with AI ATS Engine",
      description: "Get ATS match score and technical skill gap reports",
      completed: true, // Resume Analyzer available & mock analyzed
      link: "/resume-analyzer",
      actionText: "Analyze Resume",
    },
  ];

  const completedChecklistCount = checklistItems.filter((i) => i.completed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-text-primary">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Student Help & Support Center
            </h1>
            <Badge variant="accent" className="font-mono text-[10px] uppercase">
              24/7 Knowledge Base
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
            Search placement prep FAQs, run diagnostic system checks, submit support tickets, and reference keyboard shortcuts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("contact")}
            className="gap-1.5 text-xs font-mono"
          >
            <Ticket className="w-3.5 h-3.5 text-cyan-400" /> My Support Tickets ({tickets.length})
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto font-mono text-xs">
        {[
          { id: "faq", label: "Knowledge Base FAQs", icon: Search },
          { id: "checklist", label: "Getting Started Guide", icon: CheckCircle2 },
          { id: "diagnostics", label: "System Diagnostics", icon: Wrench },
          { id: "contact", label: "Submit Ticket", icon: Ticket },
          { id: "shortcuts", label: "Keyboard Shortcuts", icon: Terminal },
          { id: "about", label: "About & Changelog", icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                isActive
                  ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 font-semibold"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: KNOWLEDGE BASE FAQs */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          {/* FAQ Search Header Card */}
          <Card className="p-6 bg-gradient-to-r from-surface via-surface-raised to-surface border-cyan-400/30 space-y-4 shadow-soft">
            <h2 className="font-serif text-xl font-bold text-text-primary">
              How can we help you prepare today?
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search FAQs (e.g. 'ATS score', 'coding test', 'profile completion', 'dark mode')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted hover:text-text-primary"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-lg transition-colors shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-semibold"
                    : "bg-surface-raised text-text-muted hover:text-text-primary"
                }`}
              >
                All Categories ({allFaqs.length})
              </button>
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg transition-colors shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-semibold"
                      : "bg-surface-raised text-text-muted hover:text-text-primary"
                  }`}
                >
                  {cat.title} ({cat.items.length})
                </button>
              ))}
            </div>
          </Card>

          {/* FAQ Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                const userVote = votes[faq.id];

                return (
                  <Card
                    key={faq.id}
                    className={`p-4 transition-all bg-surface border-border ${
                      isExpanded ? "border-cyan-400/40 shadow-soft" : "hover:border-border-strong"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full text-left flex items-start justify-between gap-3 focus:outline-none"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                          {faq.category}
                        </span>
                        <h3 className="font-serif text-base font-bold text-text-primary">
                          {faq.question}
                        </h3>
                      </div>
                      <span className="p-1 rounded-lg bg-surface-raised text-text-muted shrink-0 mt-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="pt-3 mt-3 border-t border-border space-y-4 animate-fade-in text-xs font-sans">
                        <p className="text-text-secondary leading-relaxed bg-surface-raised/50 p-3.5 rounded-xl border border-border">
                          {faq.answer}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-text-muted font-mono text-[11px]">Was this answer helpful?</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(faq.id, "up")}
                              className={`gap-1 text-[11px] py-1 px-2.5 ${
                                userVote === "up" ? "bg-cyan-400/20 text-cyan-300 font-semibold" : "text-text-secondary"
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Yes ({faq.helpfulCount + (userVote === "up" ? 1 : 0)})</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(faq.id, "down")}
                              className={`gap-1 text-[11px] py-1 px-2.5 ${
                                userVote === "down" ? "bg-red-400/20 text-red-300 font-semibold" : "text-text-secondary"
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>No</span>
                            </Button>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                            {faq.tags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center space-y-4 bg-surface border-border">
              <div className="p-3 bg-surface-raised border border-border rounded-full inline-block text-text-muted">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-text-primary">No matching FAQs found</h3>
                <p className="text-xs text-text-secondary mt-1">
                  We couldn't find an answer for "{searchQuery}". Submit a support ticket and our team will assist you immediately.
                </p>
              </div>
              <Button variant="primary" size="md" onClick={() => setActiveTab("contact")} className="gap-2 font-mono text-xs">
                <Ticket className="w-4 h-4" /> Submit Support Ticket
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: GETTING STARTED GUIDE CHECKLIST */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <Card className="p-6 bg-surface border-cyan-400/30 space-y-4 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-text-primary">Placement Readiness Walkthrough</h2>
                <p className="text-xs text-text-muted mt-1">
                  Complete these essential onboarding steps to unlock your full placement readiness score.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-serif text-2xl font-bold text-cyan-400">
                  {completedChecklistCount} / {checklistItems.length}
                </span>
                <span className="text-xs font-mono text-text-muted block">Completed</span>
              </div>
            </div>

            <Progress
              value={(completedChecklistCount / checklistItems.length) * 100}
              color="accent"
              className="h-2.5"
            />
          </Card>

          <div className="space-y-3">
            {checklistItems.map((item, idx) => (
              <Card
                key={item.id}
                className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border-border transition-all ${
                  item.completed ? "border-teal-400/40 bg-teal-400/5" : "hover:border-cyan-400/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 shrink-0">
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-live" />
                    ) : (
                      <Circle className="w-6 h-6 text-text-muted" />
                    )}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-muted">Step {idx + 1}</span>
                      <h3 className={`font-serif text-base font-bold ${item.completed ? "text-text-primary" : "text-text-primary"}`}>
                        {item.title}
                      </h3>
                      {item.completed && <Badge variant="active">Completed</Badge>}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{item.description}</p>
                  </div>
                </div>

                <Button
                  variant={item.completed ? "outline" : "primary"}
                  size="sm"
                  onClick={() => navigate(item.link)}
                  className="gap-1.5 text-xs font-mono shrink-0 w-full sm:w-auto"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM DIAGNOSTICS & TROUBLESHOOTING */}
      {activeTab === "diagnostics" && (
        <div className="space-y-6">
          {/* System Check Panel */}
          <Card className="p-6 bg-surface border-cyan-400/30 space-y-4 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <h2 className="font-serif text-xl font-bold text-text-primary">System Health Check</h2>
              </div>
              <Button variant="outline" size="sm" onClick={runSystemDiagnostics} className="gap-1.5 text-xs font-mono">
                <RotateCcw className="w-3.5 h-3.5" /> Re-run Diagnostics
              </Button>
            </div>

            {systemCheckResult && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
                  <span className="text-text-muted text-[10px] uppercase block flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Browser Engine
                  </span>
                  <p className="font-semibold text-text-primary">{systemCheckResult.browser}</p>
                  <span className="text-[10px] text-teal-400 flex items-center gap-1 pt-1">
                    <Check className="w-3 h-3" /> Compatible
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
                  <span className="text-text-muted text-[10px] uppercase block flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> Local Storage Access
                  </span>
                  <p className="font-semibold text-text-primary">
                    {systemCheckResult.localStorageOk ? "Read / Write Operational" : "Blocked"}
                  </p>
                  <span className="text-[10px] text-teal-400 flex items-center gap-1 pt-1">
                    <Check className="w-3 h-3" /> Local Storage Working
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
                  <span className="text-text-muted text-[10px] uppercase block flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Network Status
                  </span>
                  <p className="font-semibold text-text-primary">
                    {systemCheckResult.online ? "Online (Connected)" : "Offline"}
                  </p>
                  <span className="text-[10px] text-teal-400 flex items-center gap-1 pt-1">
                    <Check className="w-3 h-3" /> Socket Active
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
                  <span className="text-text-muted text-[10px] uppercase block flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> Viewport Resolution
                  </span>
                  <p className="font-semibold text-text-primary">{systemCheckResult.resolution}</p>
                  <span className="text-[10px] text-cyan-400 pt-1 block">Responsive Layout</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1 sm:col-span-2 md:col-span-2">
                  <span className="text-text-muted text-[10px] uppercase block flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" /> App Build Version
                  </span>
                  <p className="font-semibold text-text-primary">{systemCheckResult.version}</p>
                  <span className="text-[10px] text-text-muted pt-1 block">Frontend Standalone Bundle (Vite 8 + React 19)</span>
                </div>
              </div>
            )}
          </Card>

          {/* Common Troubleshooting Solutions */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-text-primary">Common Fixes & Recovery</h3>

            {[
              {
                title: "Theme transition looks cached or inconsistent?",
                solution:
                  "Click the Sun/Moon toggle in the topbar or force a hard browser refresh (Ctrl+F5 / Cmd+Shift+R) to reload CSS variables.",
              },
              {
                title: "Coding Arena editor not executing code?",
                solution:
                  "Verify that online network status shows 'Online' in the System Health check above. Try switching language runtimes (e.g. Python to JS) to reset the editor worker.",
              },
              {
                title: "Profile completion percentage ring stuck?",
                solution:
                  "Navigate to /profile, click 'Edit Personal Info', make sure required fields like Bio (15+ chars) and 3+ skills are saved, then click 'Save Changes'.",
              },
            ].map((fix, idx) => (
              <Card key={idx} className="p-4 space-y-2 bg-surface border-border">
                <h4 className="font-bold text-sm text-cyan-400 font-mono">{fix.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">{fix.solution}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONTACT & SUPPORT TICKETS */}
      {activeTab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Submit Ticket Form */}
          <Card className="lg:col-span-7 p-6 bg-surface border-border space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="font-serif text-xl font-bold text-text-primary">Submit a Support Ticket</h2>
              <p className="text-xs text-text-muted mt-1">
                Encountered a bug or need help? Submit a ticket and track its resolution in real time.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitTicket)} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">
                  Ticket Category
                </label>
                <select
                  {...register("category")}
                  className="w-full p-3 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="text-red-400 text-[11px] mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <Input
                  label="Ticket Subject / Summary"
                  placeholder="e.g. Issue with profile completion ring display"
                  {...register("subject")}
                />
                {errors.subject && <p className="text-red-400 text-[11px] mt-1">{errors.subject.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase text-text-secondary">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide clear steps to reproduce the issue or details of your request..."
                  {...register("description")}
                  className="w-full p-3 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono leading-relaxed"
                />
                {errors.description && <p className="text-red-400 text-[11px] mt-1">{errors.description.message}</p>}
              </div>

              {/* Optional Screenshot Attachment */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-mono uppercase text-text-secondary">
                  Attachment (Optional Screenshot)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 rounded-xl bg-surface-raised border border-border hover:border-cyan-400/40 text-cyan-400 text-xs font-mono cursor-pointer flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    <span>{attachmentName ? "Change Image" : "Attach Screenshot"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAttachmentChange}
                      className="hidden"
                    />
                  </label>
                  {attachmentName && (
                    <span className="text-xs font-mono text-teal-400 truncate max-w-[200px]">
                      ✓ {attachmentName}
                    </span>
                  )}
                </div>

                {attachmentDataUrl && (
                  <div className="p-2 bg-surface-raised border border-border rounded-xl inline-block mt-2">
                    <img src={attachmentDataUrl} alt="Preview" className="max-h-24 rounded object-contain" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full gap-2 font-mono text-xs shadow-glow"
              >
                <Send className="w-4 h-4" /> Submit Support Ticket
              </Button>
            </form>
          </Card>

          {/* My Tickets List */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 bg-surface border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-serif text-lg font-bold text-text-primary">My Submitted Tickets</h3>
                <Badge variant="accent" className="font-mono">{tickets.length} Total</Badge>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {tickets.length === 0 ? (
                  <EmptyState
                    title="No Support Tickets Submitted"
                    description="Fill out the form on the left to submit your first ticket to our team."
                    actionText="Create Ticket"
                    onAction={() => {
                      const subjectEl = document.getElementById("ticket-subject-input");
                      if (subjectEl) subjectEl.focus();
                    }}
                  />
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="p-3.5 bg-surface-raised border border-border rounded-xl hover:border-cyan-400/40 cursor-pointer transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-cyan-400">{t.id}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                            t.status === "Resolved"
                              ? "bg-teal-400/20 text-teal-400 border-teal-400/40"
                              : "bg-amber-400/20 text-amber-400 border-amber-400/40"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-text-primary line-clamp-1">{t.subject}</h4>

                      <div className="flex justify-between items-center text-[11px] font-mono text-text-muted pt-1">
                        <span>{t.category}</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 5: KEYBOARD SHORTCUTS REFERENCE */}
      {activeTab === "shortcuts" && (
        <div className="space-y-6">
          <Card className="p-6 bg-surface border-cyan-400/30 space-y-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="font-serif text-xl font-bold text-text-primary">Platform Keyboard Shortcuts</h2>
            </div>
            <p className="text-xs text-text-muted font-mono">
              Speed up your practice workflow using built-in keyboard shortcuts.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                context: "Global Navigation",
                items: [
                  { keys: "Ctrl + K / ⌘K", action: "Open Quick Jump Command Palette" },
                  { keys: "Esc", action: "Close active Dialog Modals, Drawers & Popovers" },
                  { keys: "?", action: "Open Quick Help Center popover" },
                ],
              },
              {
                context: "Coding Arena Benchmarks",
                items: [
                  { keys: "Tab", action: "Indent code in editor pane" },
                  { keys: "Ctrl + Enter", action: "Submit Solution for acceptance" },
                  { keys: "Ctrl + R", action: "Run Test cases against sample input" },
                ],
              },
              {
                context: "MCQ Quizzes",
                items: [
                  { keys: "1 - 4 / A - D", action: "Select multiple choice options" },
                  { keys: "Enter / Space", action: "Proceed to next question" },
                ],
              },
              {
                context: "AI Mock Interview",
                items: [
                  { keys: "Space", action: "Toggle simulated voice speech input" },
                  { keys: "Ctrl + Shift + F", action: "Toggle fullscreen focus" },
                ],
              },
            ].map((section, idx) => (
              <Card key={idx} className="p-5 space-y-3 bg-surface border-border">
                <h3 className="font-serif text-base font-bold text-cyan-400 font-mono border-b border-border pb-2">
                  {section.context}
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-raised border border-border/60">
                      <span className="text-text-secondary">{item.action}</span>
                      <kbd className="px-2 py-1 rounded bg-surface border border-border text-cyan-400 font-bold text-[11px]">
                        {item.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ABOUT PLATFORM & CHANGELOG */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <Card className="p-6 bg-surface border-cyan-400/30 space-y-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-cyan-400/15 border border-cyan-400/40 text-cyan-400 font-serif font-bold text-xl">
                AI
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold text-text-primary">
                  AI Interview Preparation & Placement Platform
                </h2>
                <span className="text-xs font-mono text-cyan-400">Version 1.0.0 (Production Release)</span>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              An end-to-end placement readiness system for engineering students featuring AI ATS Resume Analysis, simulated voice-enabled AI Mock Interview rooms, Coding Arena benchmarks, MCQ quizzes, and live profile completion tracking.
            </p>

            <div className="pt-3 border-t border-border flex flex-wrap gap-2">
              {["React 19", "Vite 8", "Tailwind CSS 4", "TypeScript 5", "Recharts", "Framer Motion", "Lucide Icons"].map((tech) => (
                <Badge key={tech} variant="accent" className="font-mono text-[11px]">
                  {tech}
                </Badge>
              ))}
            </div>

            <p className="text-[11px] font-mono text-text-muted pt-2 border-t border-border/50">
              Note on Security & Identity Verification: Platform identity checks use an institutional document submission and admin review workflow. Future enhancement: integrate a real OCR/face-match verification API on the backend.
            </p>
          </Card>

          {/* Project Changelog */}
          <Card className="p-6 bg-surface border-border space-y-4">
            <h3 className="font-serif text-lg font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Platform Release Changelog
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {[
                {
                  version: "v1.0.0",
                  date: "2026-09-27",
                  highlights: [
                    "Added full Help & Support Center with searchable FAQs, diagnostic System Check, support ticket persistence, and keyboard shortcuts reference.",
                    "Unified profile identity source of truth across Topbar, Sidebar, Dashboard, and Profile header.",
                    "Implemented SVG circular progress arc with drop-shadow glow and animated score count-up pill.",
                    "Built VerdictHeadline reusable typography component across scorecards.",
                    "Built 3-phase AI Resume Analyzer with ATS score gauge, breakdown charts, and printable PDF report.",
                  ],
                },
              ].map((log) => (
                <div key={log.version} className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-400 text-sm">{log.version}</span>
                    <span className="text-text-muted text-[11px]">{log.date}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary font-sans text-xs">
                    {log.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {/* Team / Project Credits */}
          <Card className="p-6 bg-surface border-border space-y-3">
            <h3 className="font-serif text-base font-bold text-text-primary">Project Credits & Team</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border">
                <span className="text-cyan-400 font-semibold block">Member 1 (Frontend Developer)</span>
                <p className="text-text-primary font-bold mt-0.5">Kanhaiya Pandey</p>
                <span className="text-text-muted text-[10px]">React, Vite, Styling, UI/UX Components</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border">
                <span className="text-text-muted font-semibold block">Shared Repository</span>
                <p className="text-text-primary font-bold mt-0.5">SRM IST Placement Division</p>
                <span className="text-text-muted text-[10px]">Academic Capstone Project</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TICKET DETAIL DIALOG */}
      {selectedTicket && (
        <Dialog
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Support Ticket: ${selectedTicket.id}`}
          maxWidthClass="max-w-xl"
        >
          <div className="space-y-4 py-2 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-cyan-400 font-bold">{selectedTicket.category}</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  selectedTicket.status === "Resolved"
                    ? "bg-teal-400/20 text-teal-400 border-teal-400/40"
                    : "bg-amber-400/20 text-amber-400 border-amber-400/40"
                }`}
              >
                {selectedTicket.status}
              </span>
            </div>

            <div>
              <span className="text-text-muted text-[10px] uppercase block">Subject</span>
              <p className="font-bold text-text-primary text-sm mt-0.5">{selectedTicket.subject}</p>
            </div>

            <div>
              <span className="text-text-muted text-[10px] uppercase block">Description</span>
              <p className="text-text-secondary font-sans text-xs leading-relaxed bg-surface-raised p-3 rounded-xl border border-border mt-0.5">
                {selectedTicket.description}
              </p>
            </div>

            {selectedTicket.attachmentName && (
              <div>
                <span className="text-text-muted text-[10px] uppercase block">Attachment</span>
                <p className="text-teal-400 font-bold mt-0.5">✓ {selectedTicket.attachmentName}</p>
              </div>
            )}

            <div className="pt-2 text-[11px] text-text-muted flex justify-between">
              <span>Submitted by: {selectedTicket.userName}</span>
              <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
