import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ContextualHelpTooltip } from "@/components/common/ContextualHelpTooltip";
import {
  FileText,
  UploadCloud,
  FileCheck2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Target,
  Building2,
  Brain,
  ArrowRight,
  RefreshCw,
  Award,
  Printer,
  ExternalLink,
  Info,
  TrendingUp,
  Search,
  Check,
  Zap,
  BarChart3,
  Layers,
  HelpCircle,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { useAuth } from "@/context/AuthContext";
import { resumeService } from "@/services/resumeService";
import { notificationService } from "@/services/notificationService";
import {
  ResumeAnalysisResult,
  SuggestionDetail,
  KeywordDetail,
  SectionAnalysis,
  MissingSkillDetail,
} from "@/mocks/resumeAnalysis";

const TARGET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "ML Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "QA Engineer",
];

const TARGET_FIELDS = [
  "IT Services",
  "Product/Startup",
  "Core Engineering",
  "Finance/Banking Tech",
];

const SCANNING_STEPS = [
  "Extracting document text and parsing layout structure...",
  "Matching technical skills with target role requirements...",
  "Scoring experience relevance & action verb impact...",
  "Generating ATS optimization feedback & formatting report...",
];

export const ResumeAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<string>("Frontend Developer");
  const [targetField, setTargetField] = useState<string>("IT Services");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [showJdInput, setShowJdInput] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Scanning & Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);

  // Results View State
  const [keywordQuery, setKeywordQuery] = useState<string>("");
  const [keywordFilter, setKeywordFilter] = useState<"all" | "present" | "missing">("all");
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("Summary");
  const [activeTooltipSkill, setActiveTooltipSkill] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate scanning text during analysis
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnalyzing) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % SCANNING_STEPS.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const validateAndSetFile = (selectedFile: File) => {
    setFileError(null);
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
    const isValidExt = fileExt === "pdf" || fileExt === "docx" || fileExt === "doc";

    if (!validTypes.includes(selectedFile.type) && !isValidExt) {
      setFileError("Invalid file type. Please upload a PDF (.pdf) or Word Document (.docx) file.");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSizeInBytes) {
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setFileError(`File size exceeds 5MB limit (${sizeMB} MB). Please select a compressed file.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file || !targetRole) return;
    setIsAnalyzing(true);
    setFileError(null);

    try {
      const result = await resumeService.analyzeResume(
        file,
        targetRole,
        targetField,
        jobDescription
      );
      setAnalysisResult(result);

      if (user?.userId) {
        notificationService.notifyUser(user.userId, {
          audience: "STUDENT",
          type: "resume",
          title: "Resume Analysis Completed",
          message: `ATS score for ${result.fileName}: ${result.atsScore}% (${result.role}).`,
          link: "/resume-analyzer",
          priority: result.atsScore >= 75 ? "success" : "warning",
        }).catch((e) => console.warn(e));
      }
    } catch (err: any) {
      setFileError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Helper score color
  const getScoreColor = (score: number) => {
    if (score >= 75) return { stroke: "#22d3ee", text: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/30" };
    if (score >= 50) return { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" };
    return { stroke: "#f2867b", text: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" };
  };

  // Data mapping for radar chart
  const subScoreChartData = analysisResult
    ? [
        { metric: "Keywords", score: analysisResult.subScores.keywordMatch },
        { metric: "Formatting", score: analysisResult.subScores.formatting },
        { metric: "Experience", score: analysisResult.subScores.experienceRelevance },
        { metric: "Skills Match", score: analysisResult.subScores.skillsMatch },
        { metric: "Education", score: analysisResult.subScores.educationMatch },
        { metric: "Action Verbs", score: analysisResult.subScores.actionVerbUsage },
      ]
    : [];

  // Filtered keywords
  const filteredKeywords = analysisResult?.keywords.filter((kw) => {
    const matchesText = kw.keyword.toLowerCase().includes(keywordQuery.toLowerCase());
    if (keywordFilter === "present") return matchesText && kw.present;
    if (keywordFilter === "missing") return matchesText && !kw.present;
    return matchesText;
  }) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6 text-text-primary">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          aside, nav, header, button, .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
              <Brain className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              AI Resume Analyzer
            </h1>
            <Badge variant="accent" className="font-mono text-[10px] uppercase">
              Phase 2 ATS
            </Badge>
          </div>
          <p className="text-sm text-text-muted mt-1.5">
            Evaluate ATS readiness, technical skill gaps, and role-fit benchmark metrics.
          </p>
        </div>

        {analysisResult && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Re-analyze
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="w-3.5 h-3.5" />
              Download Report
            </Button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <AnimatePresence mode="wait">
        {/* SCANNING STATE */}
        {isAnalyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-16 text-center"
          >
            <Card className="max-w-xl mx-auto p-8 border-cyan-400/30 bg-surface-raised/80 backdrop-blur shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 animate-pulse" />

              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50"
                />
                <motion.div
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="w-16 h-16 rounded-full bg-cyan-400/15 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-glow"
                >
                  <Sparkles className="w-8 h-8 animate-bounce" />
                </motion.div>
              </div>

              <h2 className="font-serif text-xl font-semibold text-text-primary mb-2">
                Analyzing Your Resume
              </h2>
              <p className="text-xs font-mono text-cyan-400 mb-6 bg-cyan-400/10 py-1.5 px-3 rounded-full inline-block border border-cyan-400/20">
                Target Role: {targetRole}
              </p>

              {/* Progress status line */}
              <div className="min-h-[48px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-text-secondary font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                    <span>{SCANNING_STEPS[currentStepIndex]}</span>
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="w-full bg-surface-raised rounded-full h-2 mt-6 overflow-hidden border border-border">
                <motion.div
                  className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full"
                  initial={{ width: "10%" }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* FULL RESULTS DASHBOARD (PHASE 2) */}
        {!isAnalyzing && analysisResult && (
          <motion.div
            key="results-dashboard"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            className="space-y-8"
          >
            {/* SECTION 1: HEADER & HISTORY BANNER */}
            <Card className="p-6 border-cyan-400/30 bg-surface-raised/40 print-card">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h2 className="font-serif text-xl font-bold text-text-primary">
                      {analysisResult.fileName}
                    </h2>
                  </div>
                  <p className="text-xs text-text-muted mt-1 font-mono">
                    Analyzed on {analysisResult.analyzedAt} &bull; Target: <span className="text-cyan-400 font-semibold">{analysisResult.role}</span> ({analysisResult.field})
                  </p>
                </div>

                {/* In-Session History List */}
                {analysisResult.history && analysisResult.history.length > 0 && (
                  <div className="flex items-center gap-3 bg-surface p-2.5 rounded-xl border border-border shrink-0">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <div className="text-xs">
                      <span className="text-text-muted font-mono block text-[10px]">Attempt History</span>
                      <div className="flex items-center gap-2 font-mono">
                        {analysisResult.history.map((h, idx) => (
                          <span
                            key={h.id || idx}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                              idx === analysisResult.history.length - 1
                                ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/40"
                                : "bg-surface-raised text-text-muted"
                            }`}
                          >
                            #{idx + 1}: {h.score}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: ATS SCORE HERO */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Circular Gauge Ring */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-r-0 md:border-r border-border pr-0 md:pr-6">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-surface-raised"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke={getScoreColor(analysisResult.atsScore).stroke}
                        strokeWidth="10"
                        strokeDasharray={314}
                        initial={{ strokeDashoffset: 314 }}
                        animate={{
                          strokeDashoffset: 314 - (314 * analysisResult.atsScore) / 100,
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-4xl font-extrabold font-mono ${getScoreColor(analysisResult.atsScore).text}`}
                      >
                        {analysisResult.atsScore}
                      </motion.span>
                      <span className="text-[11px] font-mono text-text-muted uppercase">out of 100</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-mono border ${getScoreColor(analysisResult.atsScore).bg} ${getScoreColor(analysisResult.atsScore).text} ${getScoreColor(analysisResult.atsScore).border}`}>
                      {analysisResult.atsScore >= 75 ? "Excellent ATS Readiness" : analysisResult.atsScore >= 50 ? "Moderate Match" : "Action Required"}
                    </span>
                  </div>
                </div>

                {/* Verdict & Highlights */}
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Verdict</span>
                    <ContextualHelpTooltip
                      title="ATS Score Calculation"
                      content="Evaluates keyword density, formatting, single-column structure, and action verb impact."
                      faqId="res-1"
                    />
                  </div>
                  <VerdictHeadline
                    prefix="ATS Match Score is "
                    score={analysisResult.atsScore}
                    size="lg"
                  />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Evaluated for <strong>{analysisResult.role}</strong> positions in <strong>{analysisResult.field}</strong>. Your document scored high in <strong>Formatting ({analysisResult.subScores.formatting}%)</strong> and <strong>Keywords ({analysisResult.subScores.keywordMatch}%)</strong>, but has actionable gaps in <strong>Action Verbs ({analysisResult.subScores.actionVerbUsage}%)</strong>.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Badge variant="accent">
                      {analysisResult.matchedSkills.length} Matched Skills
                    </Badge>
                    <Badge variant="blocked">
                      {analysisResult.missingSkills.length} Missing Gaps
                    </Badge>
                    <Badge variant="outline">
                      {analysisResult.formattingChecklist.filter((f) => f.passed).length}/{analysisResult.formattingChecklist.length} ATS Checks
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* SECTION 3: SCORE BREAKDOWN (RADAR & MINI PROGRESS BARS) */}
            <Card className="p-6 space-y-6 print-card">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-serif text-lg font-semibold">Sub-Score Breakdown</h3>
                </div>
                <span className="text-xs font-mono text-text-muted">6 Key ATS Metrics</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Radar Chart */}
                <div className="lg:col-span-5 h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={subScoreChartData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                      <Radar name="Score" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress Bars */}
                <div className="lg:col-span-7 space-y-3.5">
                  {[
                    { label: "Keyword Match", score: analysisResult.subScores.keywordMatch, desc: "Frequency and density of role-specific keywords." },
                    { label: "Formatting & Readability", score: analysisResult.subScores.formatting, desc: "ATS text extraction accuracy & clean single-column structure." },
                    { label: "Experience Relevance", score: analysisResult.subScores.experienceRelevance, desc: "Alignment of past project responsibilities with target role." },
                    { label: "Skills Match", score: analysisResult.subScores.skillsMatch, desc: "Match rate of technical tools, libraries, and frameworks." },
                    { label: "Education Match", score: analysisResult.subScores.educationMatch, desc: "Degree, major, and graduation year compliance." },
                    { label: "Action-Verb Usage", score: analysisResult.subScores.actionVerbUsage, desc: "Strong leadership action verbs at start of bullet points." },
                  ].map((sub, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-primary">{sub.label}</span>
                        <span className="font-mono font-bold text-cyan-400">{sub.score}%</span>
                      </div>
                      <div className="w-full bg-surface-raised rounded-full h-2 border border-border/60 overflow-hidden">
                        <motion.div
                          className="bg-cyan-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${sub.score}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                        />
                      </div>
                      <p className="text-[11px] text-text-muted">{sub.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* SECTION 4: SKILLS SECTION (MATCHED & MISSING) */}
            <Card className="p-6 space-y-6 print-card">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal-400" />
                  <h3 className="font-serif text-lg font-semibold">Role Skill Match Analysis</h3>
                </div>
                <span className="text-xs font-mono text-text-muted">Target: {analysisResult.role}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="space-y-3 p-4 rounded-xl bg-surface border border-teal-400/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Matched Skills ({analysisResult.matchedSkills.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-400/10 text-teal-300 border border-teal-400/30"
                      >
                        <Check className="w-3 h-3 text-teal-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-3 p-4 rounded-xl bg-surface border border-red-400/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Missing Skills & Gaps ({analysisResult.missingSkills.length})
                    </h4>
                  </div>
                  <div className="space-y-2.5">
                    {analysisResult.missingSkills.map((skill: MissingSkillDetail, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-surface-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">{skill.name}</span>
                            <span className="text-[10px] text-text-muted font-mono">{skill.tooltip}</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/practice?topic=${encodeURIComponent(skill.name)}`)}
                          className="text-[11px] h-7 px-2 text-cyan-400 hover:bg-cyan-400/10 shrink-0 gap-1 self-end sm:self-auto"
                        >
                          Practice this
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* SECTION 5: AI SUGGESTIONS PANEL */}
            <Card className="p-6 space-y-6 print-card">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-serif text-lg font-semibold">AI Improvement Action Plan</h3>
                </div>
                <span className="text-xs font-mono text-text-muted">{analysisResult.suggestions.length} Action Items</span>
              </div>

              <div className="space-y-3">
                {analysisResult.suggestions.map((sug: SuggestionDetail) => {
                  const isExpanded = expandedSuggestion === sug.id;
                  const priorityColor =
                    sug.priority === "High"
                      ? "bg-red-400/15 text-red-400 border-red-400/30"
                      : sug.priority === "Medium"
                      ? "bg-cyan-400/15 text-cyan-400 border-cyan-400/30"
                      : "bg-surface-raised text-text-muted border-border";

                  return (
                    <div
                      key={sug.id}
                      className="border border-border rounded-xl p-4 bg-surface hover:border-cyan-400/40 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border shrink-0 mt-0.5 ${priorityColor}`}>
                            {sug.priority} Priority
                          </span>
                          <div>
                            <span className="text-xs font-mono text-text-muted uppercase block">{sug.section} Section</span>
                            <p className="text-sm font-medium text-text-primary mt-0.5">{sug.text}</p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSuggestion(isExpanded ? null : sug.id)}
                          className="p-1 h-auto text-text-muted shrink-0"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-border/60 text-xs text-text-secondary bg-surface-raised/40 p-3 rounded-lg"
                        >
                          <span className="font-semibold text-cyan-400 block mb-1">Why this matters:</span>
                          <p>{sug.whyItMatters}</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* SECTION 6: KEYWORD DENSITY TABLE */}
            <Card className="p-6 space-y-6 print-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-serif text-lg font-semibold">Keyword Density & ATS Frequency</h3>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search keywords..."
                      value={keywordQuery}
                      onChange={(e) => setKeywordQuery(e.target.value)}
                      className="pl-8 pr-3 py-1 bg-surface border border-border rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <select
                    value={keywordFilter}
                    onChange={(e: any) => setKeywordFilter(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Keywords</option>
                    <option value="present">Present Only</option>
                    <option value="missing">Missing Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border text-text-muted uppercase text-[10px]">
                      <th className="py-2.5 px-3">Keyword</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Frequency Count</th>
                      <th className="py-2.5 px-3">Importance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredKeywords.map((kw: KeywordDetail, idx: number) => (
                      <tr key={idx} className="hover:bg-surface-raised/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-text-primary">{kw.keyword}</td>
                        <td className="py-2.5 px-3">
                          {kw.present ? (
                            <span className="text-teal-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Present
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Missing
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary">{kw.count} occurrences</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              kw.importance === "Critical"
                                ? "bg-red-400/10 text-red-400 border border-red-400/30"
                                : kw.importance === "Recommended"
                                ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                                : "bg-surface-raised text-text-muted"
                            }`}
                          >
                            {kw.importance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* SECTION 7: FORMATTING CHECKLIST */}
            <Card className="p-6 space-y-6 print-card">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-teal-400" />
                  <h3 className="font-serif text-lg font-semibold">ATS Formatting Checklist</h3>
                </div>
                <span className="text-xs font-mono text-text-muted">
                  Passed {analysisResult.formattingChecklist.filter((f) => f.passed).length} of {analysisResult.formattingChecklist.length} Checks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.formattingChecklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                      item.passed
                        ? "bg-teal-400/5 border-teal-400/20 text-text-primary"
                        : "bg-red-400/5 border-red-400/20 text-text-primary"
                    }`}
                  >
                    {item.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-semibold">{item.label}</h4>
                      <p className="text-[11px] text-text-muted mt-0.5">{item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* SECTION 8: SECTION-BY-SECTION BREAKDOWN */}
            <Card className="p-6 space-y-6 print-card">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-serif text-lg font-semibold">Section-by-Section Breakdown</h3>
                </div>
                <span className="text-xs font-mono text-text-muted">Interactive Analysis</span>
              </div>

              <div className="space-y-3">
                {analysisResult.sections.map((sec: SectionAnalysis, idx: number) => {
                  const isOpen = expandedSection === sec.name;
                  return (
                    <div key={idx} className="border border-border rounded-xl bg-surface overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedSection(isOpen ? null : sec.name)}
                        className="w-full p-4 flex items-center justify-between hover:bg-surface-raised transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-text-primary">{sec.name}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                              sec.status === "good"
                                ? "bg-teal-400/10 text-teal-400 border-teal-400/30"
                                : sec.status === "needs-improvement"
                                ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                                : "bg-red-400/10 text-red-400 border-red-400/30"
                            }`}
                          >
                            {sec.status.replace("-", " ")} ({sec.score}%)
                          </span>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                      </button>

                      {isOpen && (
                        <div className="p-4 border-t border-border/60 bg-surface-raised/40 space-y-3 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-text-muted uppercase block mb-1">Parsed Resume Content Snippet</span>
                            <div className="p-3 rounded-lg bg-surface border border-border font-mono text-[11px] text-text-secondary">
                              "{sec.extractedContent}"
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1">Recommended Edits</span>
                            <ul className="list-disc list-inside space-y-1 text-text-primary">
                              {sec.suggestions.map((s, sIdx) => (
                                <li key={sIdx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* SECTION 9: ROLE-FIT COMPARISON CHART */}
            <Card className="p-6 space-y-6 print-card">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  <h3 className="font-serif text-lg font-semibold">Role-Fit Comparison Benchmark</h3>
                </div>
                <span className="text-xs font-mono text-text-muted">ATS Score Across Roles</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisResult.roleFitComparison} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                    <Bar dataKey="score" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    <XAxis dataKey="roleName" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {/* INPUT & UPLOAD FORM VIEW */}
        {!isAnalyzing && !analysisResult && (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* EMPTY STATE BENEFIT BANNER */}
            <Card className="p-6 border-cyan-400/20 bg-gradient-to-r from-surface-raised via-surface to-surface-raised relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* SVG Illustration */}
                <div className="md:col-span-4 flex justify-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl" />
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="relative z-10 drop-shadow-md"
                    >
                      <rect x="25" y="15" width="70" height="90" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <path d="M40 35H80" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
                      <path d="M40 50H70" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                      <path d="M40 62H75" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                      <path d="M40 74H60" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="85" cy="85" r="18" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
                      <path d="M80 85L83.5 88.5L90 81.5" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="95" cy="30" r="3" fill="#14b8a6" />
                    </svg>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-text-primary">
                      Ready to Benchmark Your Placement Resume?
                    </h2>
                    <p className="text-xs text-text-muted mt-1">
                      Our AI scanner evaluates your CV against company ATS filters and role expectations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-surface border border-border/80 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary">Instant ATS Scoring</h4>
                        <p className="text-[11px] text-text-muted">Get a score based on formatting & keywords.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface border border-border/80 flex items-start gap-2.5">
                      <Target className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary">Find Missing Skills</h4>
                        <p className="text-[11px] text-text-muted">Discover missing tools for target roles.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface border border-border/80 flex items-start gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary">AI Suggestions</h4>
                        <p className="text-[11px] text-text-muted">Get bullet-point edits for recruiters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* FORM CARD */}
            <Card className="p-6 md:p-8 space-y-6">
              {/* Target Role & Industry Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="target-role" className="block text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    Target Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="target-role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  >
                    {TARGET_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="target-field" className="block text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    Target Field / Industry
                  </label>
                  <select
                    id="target-field"
                    value={targetField}
                    onChange={(e) => setTargetField(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  >
                    {TARGET_FIELDS.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* UPLOAD ZONE */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                  Upload Resume (PDF or DOCX) <span className="text-red-400">*</span>
                </label>

                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload file drop area. Press enter or space to select a file."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                      isDragging
                        ? "border-cyan-400 bg-cyan-400/10 scale-[1.01]"
                        : "border-border hover:border-cyan-400/60 bg-surface-raised/40 hover:bg-surface-raised"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      className="sr-only"
                    />

                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>

                    <p className="text-sm font-semibold text-text-primary mb-1">
                      Drag & drop your resume here, or{" "}
                      <span className="text-cyan-400 underline underline-offset-2">browse files</span>
                    </p>
                    <p className="text-xs text-text-muted">
                      Supports PDF (.pdf) or Word (.docx) up to 5MB
                    </p>

                    <Button
                      type="button"
                      variant="accent-soft"
                      size="sm"
                      className="mt-4 pointer-events-none"
                      aria-hidden="true"
                    >
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-raised border border-cyan-400/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-lg bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-xs font-mono text-text-muted">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs h-8 px-2.5"
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-xs h-8 w-8 p-0 text-text-muted hover:text-red-400"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                )}

                {/* Inline Error Message */}
                {fileError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-red-400 font-medium bg-red-400/10 border border-red-400/20 p-3 rounded-lg mt-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fileError}</span>
                  </motion.div>
                )}
              </div>

              {/* Collapsible Optional Job Description */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-surface-raised/30">
                <button
                  type="button"
                  onClick={() => setShowJdInput((prev) => !prev)}
                  className="w-full px-4 py-3 text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center justify-between hover:bg-surface-raised transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-text-muted" />
                    Paste Target Job Description (Optional)
                  </span>
                  {showJdInput ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </button>

                {showJdInput && (
                  <div className="p-4 pt-0 border-t border-border/60">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description text here to get tailored skill matching and ATS relevance alignment..."
                      rows={4}
                      className="w-full bg-surface border border-border rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all font-sans"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={!file || !targetRole || isAnalyzing}
                  className="w-full sm:w-auto min-w-[200px] gap-2 font-semibold text-sm shadow-nav"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Resume
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
