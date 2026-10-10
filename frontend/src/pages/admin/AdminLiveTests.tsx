import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Dialog } from "@/components/ui/Dialog";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useAdminStore } from "@/context/AdminStoreContext";
import api from "@/lib/api";
import {
  liveTestService,
  LiveTestContest,
  LiveTestQuestion,
  LiveTestSection,
  LiveTestSubmission,
} from "@/services/liveTestService";
import {
  Play,
  Pause,
  StopCircle,
  Clock,
  Radio,
  Users,
  Send,
  UserX,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Plus,
  Trash2,
  Edit,
  Download,
  FileSpreadsheet,
  FileCode2,
  ExternalLink,
  Code2,
  HelpCircle,
  Check,
  X,
  Layers,
  Calendar,
  Eye,
  Trophy,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type AdminTab = "MONITOR" | "MANAGEMENT" | "LEADERBOARD" | "SUBMISSIONS" | "EXPORTS";

export interface LiveParticipant {
  id: string;
  name: string;
  role: "STUDENT" | "ADMIN";
  college: string;
  rollNumber: string;
  progress: number;
  timeLeftSeconds: number;
  tabSwitchCount: number;
  status: "Active" | "Idle" | "Warning" | "Submitted" | "Removed";
  lastPing: string;
}

export const AdminLiveTests: React.FC = () => {
  const { students } = useAdminStore();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("MONITOR");
  const [tests, setTests] = useState<LiveTestContest[]>(() => liveTestService.getAllTests());
  const [selectedContestId, setSelectedContestId] = useState<string>("live-test-01");
  const [submissions, setSubmissions] = useState<LiveTestSubmission[]>(() =>
    liveTestService.getAllSubmissions()
  );

  // Monitor Active Test state
  const currentContest = tests.find((t) => t.id === selectedContestId) || tests[0];
  const [timerSeconds, setTimerSeconds] = useState(2700);

  // Modals state
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [extendTimeModalOpen, setExtendTimeModalOpen] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(10);
  const [createContestModalOpen, setCreateContestModalOpen] = useState(false);
  const [editingContestId, setEditingContestId] = useState<string | null>(null);

  // External Problem Import Modal (LeetCode / GFG / Codeforces)
  const [importProblemModalOpen, setImportProblemModalOpen] = useState(false);
  const [externalProblems, setExternalProblems] = useState<any[]>([]);
  const [searchExternalQuery, setSearchExternalQuery] = useState("");
  const [externalSourceFilter, setExternalSourceFilter] = useState("ALL");
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  // Create / Edit Contest Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Full-Stack + Aptitude + Coding");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<LiveTestContest["status"]>("Scheduled");
  const [formScheduledStartTime, setFormScheduledStartTime] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    return new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [formDurationMinutes, setFormDurationMinutes] = useState(60);
  const [formTotalMarks, setFormTotalMarks] = useState(100);
  const [formPassingMarks, setFormPassingMarks] = useState(60);
  const [formProctoring, setFormProctoring] = useState(true);
  const [formMaxTabSwitches, setFormMaxTabSwitches] = useState(2);
  const [formSections, setFormSections] = useState<LiveTestSection[]>([
    {
      id: "sec-1",
      title: "Section 1: Quantitative & Reasoning Aptitude",
      type: "MCQ",
      questions: [],
    },
    {
      id: "sec-2",
      title: "Section 2: Practical Coding Assessment",
      type: "CODING",
      questions: [],
    },
  ]);

  // Active section index when adding question in wizard
  const [targetSectionIndex, setTargetSectionIndex] = useState(0);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leaderboardSearchQuery, setLeaderboardSearchQuery] = useState("");
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<LiveTestSubmission | null>(null);
  const [candidateDetailModalOpen, setCandidateDetailModalOpen] = useState(false);

  // Single participant removal modal
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<LiveParticipant | null>(null);

  // Simulated Live Participants for Monitoring
  const [participants, setParticipants] = useState<LiveParticipant[]>(() => {
    return students.slice(0, 8).map((s, idx) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      college: s.college,
      rollNumber: s.rollNumber,
      progress: Math.min(100, (idx + 1) * 12 + 15),
      timeLeftSeconds: 2700 - idx * 120,
      tabSwitchCount: idx === 2 ? 3 : idx === 4 ? 2 : 0,
      status: idx === 2 ? "Warning" : idx === 6 ? "Submitted" : "Active",
      lastPing: "Just now",
    }));
  });

  // Sync tests from service on mount and storage events
  useEffect(() => {
    const handleUpdate = () => {
      setTests(liveTestService.getAllTests());
      setSubmissions(liveTestService.getAllSubmissions());
    };
    window.addEventListener("live_tests_changed", handleUpdate);
    window.addEventListener("live_test_submissions_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("live_tests_changed", handleUpdate);
      window.removeEventListener("live_test_submissions_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Countdown timer for active monitoring contest
  useEffect(() => {
    let interval: any = null;
    if (currentContest?.status === "Live") {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
        setParticipants((prev) =>
          prev.map((p) => {
            if (p.status === "Removed" || p.status === "Submitted") return p;
            const newTime = Math.max(0, p.timeLeftSeconds - 1);
            const increment = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;
            const newProg = Math.min(100, p.progress + increment);
            const isSub = newProg >= 100 || newTime === 0;

            const randomTab = Math.random() > 0.985;
            const newTabs = randomTab ? p.tabSwitchCount + 1 : p.tabSwitchCount;

            let st: LiveParticipant["status"] = p.status;
            if (isSub) st = "Submitted";
            else if (newTabs >= 3) st = "Warning";

            return {
              ...p,
              progress: newProg,
              timeLeftSeconds: newTime,
              tabSwitchCount: newTabs,
              status: st,
              lastPing: "Just now",
            };
          })
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentContest?.status]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Actions for Live Monitor
  const handleStartLive = (testId: string) => {
    liveTestService.updateTestStatus(testId, "Live");
    toast.success("Live contest started! Participants are monitored in real time.");
  };

  const handlePause = (testId: string) => {
    liveTestService.updateTestStatus(testId, "Paused");
    toast.warning("Test paused for all active participants.");
  };

  const handleComplete = (testId: string) => {
    liveTestService.updateTestStatus(testId, "Completed");
    toast.success("Contest marked as completed. Results are finalized.");
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm("Are you sure you want to delete this contest? All records will be removed.")) {
      liveTestService.deleteTest(testId);
      toast.success("Contest deleted successfully.");
    }
  };

  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return;
    liveTestService.addBroadcast(selectedContestId, broadcastText.trim());
    setBroadcastText("");
    setBroadcastModalOpen(false);
    toast.success("Broadcast message transmitted to all student screens!");
  };

  const handleExtendTime = () => {
    setTimerSeconds((prev) => prev + extendMinutes * 60);
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, timeLeftSeconds: p.timeLeftSeconds + extendMinutes * 60 }))
    );
    liveTestService.addBroadcast(
      selectedContestId,
      `Contest time extended by ${extendMinutes} minutes by platform administration.`
    );
    setExtendTimeModalOpen(false);
    toast.success(`Contest extended by ${extendMinutes} minutes!`);
  };

  const handleRemoveParticipant = (p: LiveParticipant) => {
    setParticipants((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, status: "Removed" } : item))
    );
    setRemoveModalOpen(false);
    toast.error(`Candidate ${p.name} removed and disqualified for cheating violations.`);
  };

  // Toggle Pause / Resume / Start Live from anywhere
  const handleTogglePauseResume = (contest: LiveTestContest) => {
    if (contest.status === "Live") {
      liveTestService.updateTestStatus(contest.id, "Paused");
      toast.warning(`Contest "${contest.title}" paused. Countdown frozen.`);
    } else if (contest.status === "Paused") {
      liveTestService.updateTestStatus(contest.id, "Live");
      toast.success(`Contest "${contest.title}" resumed! Candidates can submit.`);
    } else if (contest.status === "Scheduled") {
      liveTestService.updateTestStatus(contest.id, "Live");
      toast.success(`Contest "${contest.title}" is now LIVE!`);
    }
    setTests(liveTestService.getAllTests());
  };

  // Open Create / Edit Contest Modal
  const openCreateContestModal = () => {
    setEditingContestId(null);
    setFormTitle("National Placement Coding Challenge 2026");
    setFormCategory("Full-Stack + Aptitude + Coding");
    setFormDescription("Proctored campus evaluation with aptitude and coding problems.");
    setFormStatus("Scheduled");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    setFormScheduledStartTime(new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16));
    setFormDurationMinutes(60);
    setFormTotalMarks(100);
    setFormPassingMarks(60);
    setFormProctoring(true);
    setFormMaxTabSwitches(2);
    setFormSections([
      {
        id: `sec-${Date.now()}-1`,
        title: "Section 1: Quantitative & Reasoning Aptitude",
        type: "MCQ",
        questions: [
          {
            id: `q-${Date.now()}-1`,
            type: "MCQ",
            title: "Time & Work Assessment",
            questionText: "If 10 men can complete a project in 15 days, how many men are required to finish it in 10 days?",
            marks: 5,
            negativeMarks: 1,
            category: "Aptitude",
            options: [
              { id: "A", text: "12 men" },
              { id: "B", text: "15 men" },
              { id: "C", text: "18 men" },
              { id: "D", text: "20 men" },
            ],
            correctOptionId: "B",
            explanation: "Men * Days = constant. 10 * 15 = M * 10 => M = 15 men.",
          },
        ],
      },
      {
        id: `sec-${Date.now()}-2`,
        title: "Section 2: Practical Coding Arena",
        type: "CODING",
        questions: [],
      },
    ]);
    setCreateContestModalOpen(true);
  };

  // Open Edit Contest Modal
  const openEditContestModal = (contest: LiveTestContest) => {
    setEditingContestId(contest.id);
    setFormTitle(contest.title);
    setFormCategory(contest.category);
    setFormDescription(contest.description);
    setFormStatus(contest.status || "Scheduled");
    try {
      const d = new Date(contest.scheduledStartTime || Date.now());
      const tzOffset = d.getTimezoneOffset() * 60000;
      setFormScheduledStartTime(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
    } catch {
      setFormScheduledStartTime(new Date().toISOString().slice(0, 16));
    }
    setFormDurationMinutes(contest.durationMinutes);
    setFormTotalMarks(contest.totalMarks || 100);
    setFormPassingMarks(contest.passingMarks || 60);
    setFormProctoring(contest.proctoringEnabled);
    setFormMaxTabSwitches(contest.maxTabSwitchesAllowed || 2);
    setFormSections(JSON.parse(JSON.stringify(contest.sections || [])));
    setCreateContestModalOpen(true);
  };

  // Add Question to Section in Form
  const addMcqQuestionToSection = (secIdx: number) => {
    const newQ: LiveTestQuestion = {
      id: `q-${Date.now()}`,
      type: "MCQ",
      title: "New Concept Question",
      questionText: "Enter the question prompt here...",
      marks: 5,
      negativeMarks: 1,
      category: "Aptitude",
      options: [
        { id: "A", text: "Option A" },
        { id: "B", text: "Option B" },
        { id: "C", text: "Option C" },
        { id: "D", text: "Option D" },
      ],
      correctOptionId: "A",
      explanation: "Add answer explanation here.",
    };

    setFormSections((prev) => {
      const copy = [...prev];
      copy[secIdx].questions.push(newQ);
      return copy;
    });
  };

  // Add Coding Question to Section
  const addCodingQuestionToSection = (secIdx: number) => {
    const newQ: LiveTestQuestion = {
      id: `q-code-${Date.now()}`,
      type: "CODING",
      title: "Two Sum Target Problem",
      difficulty: "Easy",
      marks: 20,
      category: "Coding",
      questionText: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
      constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
      starterCode: {
        java: "class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    return new int[]{};\n  }\n}",
        python: "def twoSum(nums: list[int], target: int) -> list[int]:\n  pass",
        javascript: "function twoSum(nums, target) {\n  return [];\n}",
        cpp: "class Solution {\npublic:\n  vector<int> twoSum(vector<int>& nums, int target) {\n    return {};\n  }\n};",
      },
      sampleTestCases: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }],
    };

    setFormSections((prev) => {
      const copy = [...prev];
      copy[secIdx].questions.push(newQ);
      return copy;
    });
  };

  // Open External Problem Search (LeetCode / GFG / Codeforces)
  const openExternalProblemModal = (secIdx: number) => {
    setTargetSectionIndex(secIdx);
    setSearchExternalQuery("");
    fetchExternalProblems();
    setImportProblemModalOpen(true);
  };

  const fetchExternalProblems = async () => {
    setIsLoadingExternal(true);
    try {
      // Fetch platform problem bank
      const res = await api.get("/api/v1/admin/coding-import/bank");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setExternalProblems(res.data);
      } else {
        // Fallback curated LeetCode/GFG problems list
        setExternalProblems([
          {
            id: "ext-1",
            title: "Subarray Sum Equals K",
            source: "LEETCODE",
            difficulty: "Medium",
            description: "Given an array of integers nums and an integer k, return the total number of continuous subarrays whose sum equals to k.",
            constraints: ["1 <= nums.length <= 2 * 10^4", "-1000 <= nums[i] <= 1000"],
            starterCode: {
              java: "class Solution {\n  public int subarraySum(int[] nums, int k) {\n    return 0;\n  }\n}",
              python: "def subarraySum(nums: list[int], k: int) -> int:\n  return 0",
              javascript: "function subarraySum(nums, k) {\n  return 0;\n}",
            },
            sampleTestCases: [{ input: "nums = [1,1,1], k = 2", output: "2" }],
          },
          {
            id: "ext-2",
            title: "Longest Palindromic Substring",
            source: "LEETCODE",
            difficulty: "Medium",
            description: "Given a string s, return the longest palindromic substring in s.",
            constraints: ["1 <= s.length <= 1000"],
            starterCode: {
              java: "class Solution {\n  public String longestPalindrome(String s) {\n    return \"\";\n  }\n}",
              python: "def longestPalindrome(s: str) -> str:\n  return \"\"",
              javascript: "function longestPalindrome(s) {\n  return \"\";\n}",
            },
            sampleTestCases: [{ input: "s = \"babad\"", output: "\"bab\"" }],
          },
          {
            id: "ext-3",
            title: "Detect Cycle in Directed Graph",
            source: "GFG",
            difficulty: "Medium",
            description: "Given a Directed Graph with V vertices and E edges, check whether it contains any cycle or not.",
            constraints: ["1 <= V, E <= 10^5"],
            starterCode: {
              java: "class Solution {\n  public boolean isCyclic(int V, ArrayList<ArrayList<Integer>> adj) {\n    return false;\n  }\n}",
              python: "def isCyclic(V, adj):\n  return False",
            },
            sampleTestCases: [{ input: "V = 4, E = 4", output: "true" }],
          },
          {
            id: "ext-4",
            title: "Watermelon 4A",
            source: "CODEFORCES",
            difficulty: "Easy",
            description: "One hot summer day Pete and Billy decided to buy a watermelon of weight w. Can they divide it into two parts, each with positive even weight?",
            constraints: ["1 <= w <= 100"],
            starterCode: {
              java: "class Solution {\n  public static String solve(int w) {\n    return w > 2 && w % 2 == 0 ? \"YES\" : \"NO\";\n  }\n}",
              python: "def solve(w):\n  return 'YES' if w > 2 and w % 2 == 0 else 'NO'",
            },
            sampleTestCases: [{ input: "w = 8", output: "YES" }],
          },
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingExternal(false);
    }
  };

  const handleImportProblemSelected = (ext: any) => {
    const importedQ: LiveTestQuestion = {
      id: `q-ext-${Date.now()}`,
      type: "CODING",
      title: ext.title || "External Challenge",
      difficulty: ext.difficulty || "Medium",
      marks: 25,
      category: "Coding",
      source: (ext.source || "LEETCODE") as any,
      questionText: ext.description || "Solve this problem efficiently.",
      constraints: ext.constraints || ["1 <= N <= 10^5"],
      starterCode: ext.starterCode || {
        java: "class Solution {\n  public static Object solve(Object input) {\n    return input;\n  }\n}",
      },
      sampleTestCases: ext.sampleTestCases || [{ input: "Sample input", output: "Sample output" }],
    };

    setFormSections((prev) => {
      const copy = [...prev];
      if (copy[targetSectionIndex]) {
        copy[targetSectionIndex].questions.push(importedQ);
      }
      return copy;
    });

    setImportProblemModalOpen(false);
    toast.success(`Imported "${ext.title}" from ${ext.source || "External Platform"} into section!`);
  };

  // Save Contest (Create or Update)
  const handleSaveContest = () => {
    if (!formTitle.trim()) {
      toast.error("Please provide a valid contest title.");
      return;
    }

    const totalQuestions = formSections.reduce((acc, sec) => acc + sec.questions.length, 0);
    const isoScheduledTime = new Date(formScheduledStartTime).toISOString();

    if (editingContestId) {
      liveTestService.updateTest(editingContestId, {
        title: formTitle,
        category: formCategory,
        description: formDescription,
        status: formStatus,
        scheduledStartTime: isoScheduledTime,
        durationMinutes: formDurationMinutes,
        totalMarks: formTotalMarks,
        passingMarks: formPassingMarks,
        proctoringEnabled: formProctoring,
        maxTabSwitchesAllowed: formMaxTabSwitches,
        totalQuestions,
        sections: formSections,
      });
      toast.success(`Contest "${formTitle}" updated successfully!`);
    } else {
      liveTestService.createTest({
        title: formTitle,
        category: formCategory,
        description: formDescription,
        status: formStatus,
        scheduledStartTime: isoScheduledTime,
        durationMinutes: formDurationMinutes,
        totalQuestions,
        totalMarks: formTotalMarks,
        passingMarks: formPassingMarks,
        allowedLanguages: ["JavaScript", "Python", "Java", "C++", "C"],
        registeredParticipantsCount: 0,
        proctoringEnabled: formProctoring,
        maxTabSwitchesAllowed: formMaxTabSwitches,
        maxWindowResizeAllowed: formMaxTabSwitches,
        broadcasts: [],
        sections: formSections,
        problems: [],
      });
      toast.success(
        formStatus === "Live"
          ? `Live contest "${formTitle}" is now active and accepting submissions!`
          : `Contest "${formTitle}" scheduled for ${new Date(isoScheduledTime).toLocaleString()}!`
      );
    }

    setCreateContestModalOpen(false);
    setTests(liveTestService.getAllTests());
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Live Competitions Control Center
            </span>
            <Badge variant="accent" className="text-[10px] font-mono">
              Admin Proctoring Suite
            </Badge>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2.5 mt-1">
            <Radio className="w-7 h-7 text-rose-500 animate-pulse" /> Live Tests & Contest Management
          </h1>
          <p className="text-xs text-text-secondary mt-0.5 max-w-3xl">
            Control live contests, enforce tab switch restrictions, create combined MCQ + coding assessments, import problems from LeetCode / GFG, and download verified candidate reports.
          </p>
        </div>

        {/* TOP TAB SWITCHER */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-surface-raised border border-border p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveAdminTab("MONITOR")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
                activeAdminTab === "MONITOR"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Radio className="w-3.5 h-3.5" /> Live Monitor
            </button>

            <button
              onClick={() => setActiveAdminTab("MANAGEMENT")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
                activeAdminTab === "MANAGEMENT"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Layers className="w-3.5 h-3.5" /> All Tests ({tests.length})
            </button>

            <button
              onClick={() => setActiveAdminTab("LEADERBOARD")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
                activeAdminTab === "LEADERBOARD"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Leaderboard
            </button>

            <button
              onClick={() => setActiveAdminTab("SUBMISSIONS")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
                activeAdminTab === "SUBMISSIONS"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Users className="w-3.5 h-3.5" /> Submissions ({submissions.length})
            </button>

            <button
              onClick={() => setActiveAdminTab("EXPORTS")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
                activeAdminTab === "EXPORTS"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Download className="w-3.5 h-3.5" /> Export Reports
            </button>
          </div>

          <Button
            variant="teal-cyan"
            size="sm"
            onClick={openCreateContestModal}
            className="text-xs font-bold gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <Plus className="w-4 h-4" /> Create Live Test
          </Button>
        </div>
      </div>

      {/* TAB 1: LIVE MONITOR & REAL-TIME PROCTORING */}
      {activeAdminTab === "MONITOR" && (
        <div className="space-y-6">
          {/* Active Contest Selector & Controls Banner */}
          <Card className="p-6 bg-surface border-border space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <select
                  value={selectedContestId}
                  onChange={(e) => setSelectedContestId(e.target.value)}
                  className="bg-surface-raised border border-border rounded-xl px-3.5 py-2 text-sm font-serif font-bold text-text-primary focus:outline-none"
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.status})
                    </option>
                  ))}
                </select>

                <Badge
                  variant={currentContest?.status === "Live" ? "blocked" : "medium"}
                  className={cn(
                    "text-[10px] font-mono uppercase flex items-center gap-1",
                    currentContest?.status === "Live" && "bg-rose-500 text-white animate-pulse"
                  )}
                >
                  {currentContest?.status === "Live" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  {currentContest?.status || "Live"}
                </Badge>
              </div>

              {/* Action Buttons: Pause, Resume, Extend, Broadcast */}
              <div className="flex items-center gap-2 flex-wrap">
                {currentContest?.status === "Live" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePause(currentContest.id)}
                    className="text-xs font-mono border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                  >
                    <Pause className="w-3.5 h-3.5 mr-1" /> Pause Contest
                  </Button>
                ) : (
                  <Button
                    variant="teal-cyan"
                    size="sm"
                    onClick={() => handleStartLive(currentContest.id)}
                    className="text-xs font-mono bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" /> Resume / Start Live
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExtendTimeModalOpen(true)}
                  className="text-xs font-mono border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Clock className="w-3.5 h-3.5 mr-1" /> Extend Time
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBroadcastModalOpen(true)}
                  className="text-xs font-mono border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Broadcast Alert
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleComplete(currentContest.id)}
                  className="text-xs font-mono border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <StopCircle className="w-3.5 h-3.5 mr-1" /> Finalize Results
                </Button>
              </div>
            </div>

            {/* Live Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
              <div className="p-3 bg-surface-raised border border-border rounded-xl">
                <span className="text-[10px] text-text-muted uppercase block">Clock Remaining</span>
                <span className="text-xl font-bold text-rose-400">{formatTime(timerSeconds)}</span>
              </div>

              <div className="p-3 bg-surface-raised border border-border rounded-xl">
                <span className="text-[10px] text-text-muted uppercase block">Registered</span>
                <span className="text-xl font-bold text-cyan-400">{currentContest?.registeredParticipantsCount || 342}</span>
              </div>

              <div className="p-3 bg-surface-raised border border-border rounded-xl">
                <span className="text-[10px] text-text-muted uppercase block">Active In Arena</span>
                <span className="text-xl font-bold text-emerald-400">
                  {participants.filter((p) => p.status === "Active" || p.status === "Warning").length}
                </span>
              </div>

              <div className="p-3 bg-surface-raised border border-border rounded-xl">
                <span className="text-[10px] text-text-muted uppercase block">Cheating Flags</span>
                <span className="text-xl font-bold text-amber-400">
                  {participants.filter((p) => p.tabSwitchCount >= 2).length}
                </span>
              </div>
            </div>
          </Card>

          {/* Live Candidates Table */}
          <Card className="p-6 bg-surface border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-serif text-lg font-bold text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Real-Time Candidate Proctoring Monitor
              </h3>
              <span className="text-xs font-mono text-text-muted">
                Tab switch warnings: Max 2 (3rd triggers automatic submission)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-text-muted uppercase text-[10px]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">College & Roll</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3 text-center">Tab Switches</th>
                    <th className="py-2.5 px-3 text-center">Proctoring Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-raised/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-sans font-semibold text-text-primary">{p.name}</div>
                        <div className="text-[10px] text-text-muted">{p.role}</div>
                      </td>
                      <td className="py-3 px-3 text-text-secondary">
                        <div>{p.college}</div>
                        <div className="text-[10px] text-text-muted">{p.rollNumber}</div>
                      </td>
                      <td className="py-3 px-3 w-40">
                        <div className="flex items-center gap-2">
                          <Progress value={p.progress} className="h-1.5 flex-1" />
                          <span className="text-[11px] text-text-muted">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded font-bold text-xs",
                            p.tabSwitchCount >= 3
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : p.tabSwitchCount >= 2
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              : "text-text-muted"
                          )}
                        >
                          {p.tabSwitchCount} / 2
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant={
                            p.status === "Active"
                              ? "active"
                              : p.status === "Warning"
                              ? "blocked"
                              : p.status === "Submitted"
                              ? "accent"
                              : "medium"
                          }
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setParticipantToRemove(p);
                            setRemoveModalOpen(true);
                          }}
                          className="h-7 text-xs font-mono text-rose-400 hover:bg-rose-500/10"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" /> Disqualify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: CONTEST MANAGEMENT (ALL TESTS) */}
      {activeAdminTab === "MANAGEMENT" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tests.map((contest) => {
              const contestSubmissions = liveTestService.getSubmissionsForTest(contest.id);
              const isLive = contest.status === "Live";
              const isPaused = contest.status === "Paused";
              const isScheduled = contest.status === "Scheduled";

              return (
                <Card
                  key={contest.id}
                  className={cn(
                    "p-5 bg-surface border flex flex-col justify-between space-y-4 transition-all hover:border-cyan-500/40",
                    isLive ? "border-rose-500/50 shadow-lg shadow-rose-950/20" : "border-border"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant={isLive ? "blocked" : isScheduled ? "medium" : isPaused ? "blocked" : "active"}
                            className={cn(
                              "text-[10px] font-mono uppercase tracking-wider flex items-center gap-1",
                              isLive && "bg-rose-500/20 text-rose-400 border border-rose-500/40",
                              isPaused && "bg-amber-500/20 text-amber-400 border border-amber-500/40",
                              isScheduled && "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                            )}
                          >
                            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
                            {contest.status}
                          </Badge>
                          <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.5 rounded bg-surface-raised border border-border">
                            {contest.category}
                          </span>
                        </div>
                        <h3 className="font-serif text-base font-bold text-text-primary line-clamp-1">{contest.title}</h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 shrink-0 px-2 py-0.5 bg-cyan-950/30 border border-cyan-500/20 rounded">
                        {contest.durationMinutes}m
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2">{contest.description}</p>

                    {/* Schedule Info */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted bg-surface-raised/80 px-2.5 py-1.5 rounded-lg border border-border">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">
                        Start:{" "}
                        <strong className="text-text-primary">
                          {contest.scheduledStartTime
                            ? new Date(contest.scheduledStartTime).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Scheduled"}
                        </strong>
                      </span>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="p-2.5 bg-surface-raised border border-border rounded-xl text-xs font-mono text-text-muted space-y-1">
                      <div className="flex justify-between">
                        <span>Questions / Sections:</span>
                        <span className="text-text-primary font-bold">
                          {contest.totalQuestions} Qs ({contest.sections?.length || 0} Secs)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Marks:</span>
                        <span className="text-emerald-400 font-bold">{contest.totalMarks || 100} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Submissions Recorded:</span>
                        <span className="text-cyan-400 font-bold">{contestSubmissions.length} Students</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Proctoring Limits:</span>
                        <span className="text-amber-400 font-bold">Strict (2 Warnings)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center gap-2">
                      {/* 1-Click State Controls: Pause / Resume / Start Live */}
                      {isLive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePauseResume(contest)}
                          className="flex-1 h-8 text-xs font-mono border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                        >
                          <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                        </Button>
                      ) : isPaused ? (
                        <Button
                          variant="teal-cyan"
                          size="sm"
                          onClick={() => handleTogglePauseResume(contest)}
                          className="flex-1 h-8 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <Play className="w-3.5 h-3.5 mr-1" /> Resume
                        </Button>
                      ) : (
                        <Button
                          variant="teal-cyan"
                          size="sm"
                          onClick={() => handleTogglePauseResume(contest)}
                          className="flex-1 h-8 text-xs font-mono bg-rose-600 hover:bg-rose-500 text-white"
                        >
                          <Play className="w-3.5 h-3.5 mr-1" /> Start Live
                        </Button>
                      )}

                      {/* Jump to Leaderboard for this contest */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContestId(contest.id);
                          setActiveAdminTab("LEADERBOARD");
                        }}
                        className="h-8 px-2.5 text-xs font-mono border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                        title="View Contest Leaderboard"
                      >
                        <Trophy className="w-3.5 h-3.5 mr-1" /> Leaderboard
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditContestModal(contest)}
                          className="h-7 px-2 text-xs text-text-secondary hover:text-cyan-400"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => liveTestService.exportQuestionsJson(contest.id)}
                          className="h-7 px-2 text-xs text-text-secondary hover:text-emerald-400"
                          title="Export Questions as JSON"
                        >
                          <FileCode2 className="w-3.5 h-3.5 mr-1" /> JSON
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTest(contest.id)}
                        className="h-7 px-2 text-xs text-rose-400 hover:bg-rose-500/10"
                        title="Delete Contest"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DEDICATED CONTEST LEADERBOARD */}
      {activeAdminTab === "LEADERBOARD" && (
        <div className="space-y-6">
          {/* Contest Selector Banner */}
          <Card className="p-6 bg-surface border-border space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
                  Contest Performance & Standings
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={selectedContestId}
                    onChange={(e) => setSelectedContestId(e.target.value)}
                    className="bg-surface-raised border border-border rounded-xl px-3.5 py-2 text-sm font-serif font-bold text-text-primary focus:outline-none"
                  >
                    {tests.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.status})
                      </option>
                    ))}
                  </select>

                  <Badge
                    variant={currentContest?.status === "Live" ? "blocked" : "medium"}
                    className={cn(
                      "text-[10px] font-mono uppercase flex items-center gap-1",
                      currentContest?.status === "Live" && "bg-rose-500 text-white animate-pulse"
                    )}
                  >
                    {currentContest?.status === "Live" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    {currentContest?.status || "Live"}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => liveTestService.exportResultsCsv(selectedContestId)}
                  className="text-xs font-mono border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Export Leaderboard (CSV)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => liveTestService.exportQuestionsJson(selectedContestId)}
                  className="text-xs font-mono border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <FileCode2 className="w-3.5 h-3.5 mr-1" /> Questions JSON
                </Button>
              </div>
            </div>

            {/* Contest Stats Calculation */}
            {(() => {
              const contestSubs = submissions.filter((s) => s.testId === selectedContestId);
              const totalSubs = contestSubs.length;
              const highestScore = totalSubs > 0 ? Math.max(...contestSubs.map((s) => s.score)) : 0;
              const avgScore =
                totalSubs > 0
                  ? Math.round((contestSubs.reduce((acc, s) => acc + s.score, 0) / totalSubs) * 10) / 10
                  : 0;
              const passedCount = contestSubs.filter((s) => s.passed).length;
              const passRate = totalSubs > 0 ? Math.round((passedCount / totalSubs) * 100) : 0;
              const flagCount = contestSubs.filter((s) => s.tabSwitchCount >= 2 || s.submissionType === "AUTO_TAB_SWITCH").length;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
                  <div className="p-3 bg-surface-raised border border-border rounded-xl">
                    <span className="text-[10px] text-text-muted uppercase block">Total Submissions</span>
                    <span className="text-xl font-bold text-cyan-400">{totalSubs}</span>
                  </div>
                  <div className="p-3 bg-surface-raised border border-border rounded-xl">
                    <span className="text-[10px] text-text-muted uppercase block">Top Score</span>
                    <span className="text-xl font-bold text-emerald-400">{highestScore} / {currentContest?.totalMarks || 100}</span>
                  </div>
                  <div className="p-3 bg-surface-raised border border-border rounded-xl">
                    <span className="text-[10px] text-text-muted uppercase block">Average Score</span>
                    <span className="text-xl font-bold text-text-primary">{avgScore} pts</span>
                  </div>
                  <div className="p-3 bg-surface-raised border border-border rounded-xl">
                    <span className="text-[10px] text-text-muted uppercase block">Pass Rate</span>
                    <span className="text-xl font-bold text-teal-400">{passRate}%</span>
                  </div>
                  <div className="p-3 bg-surface-raised border border-border rounded-xl">
                    <span className="text-[10px] text-text-muted uppercase block">Cheating Flags</span>
                    <span className="text-xl font-bold text-rose-400">{flagCount}</span>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Leaderboard Table with Search */}
          <Card className="p-6 bg-surface border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-text-primary">
                  Official Ranked Leaderboard
                </h3>
              </div>

              {/* Search Candidate */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input
                  value={leaderboardSearchQuery}
                  onChange={(e) => setLeaderboardSearchQuery(e.target.value)}
                  placeholder="Search candidate or college..."
                  className="pl-8 bg-surface-raised text-xs font-mono"
                />
              </div>
            </div>

            {(() => {
              const contestSubs = submissions
                .filter((s) => s.testId === selectedContestId)
                .filter((s) => {
                  if (!leaderboardSearchQuery.trim()) return true;
                  const q = leaderboardSearchQuery.toLowerCase();
                  return (
                    s.studentName.toLowerCase().includes(q) ||
                    s.email.toLowerCase().includes(q) ||
                    (s.college && s.college.toLowerCase().includes(q))
                  );
                })
                .sort((a, b) => {
                  if (b.score !== a.score) return b.score - a.score;
                  return a.timeTakenSeconds - b.timeTakenSeconds;
                });

              if (contestSubs.length === 0) {
                return (
                  <div className="p-12 text-center border border-dashed border-border rounded-2xl space-y-3">
                    <Trophy className="w-10 h-10 text-text-muted mx-auto opacity-40" />
                    <h4 className="font-serif text-base font-bold text-text-primary">No Submissions Recorded Yet</h4>
                    <p className="text-xs text-text-secondary max-w-md mx-auto">
                      Candidates who take "{currentContest?.title}" will automatically appear on this real-time leaderboard once they submit their test or when timer concludes.
                    </p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-border text-text-muted uppercase text-[10px]">
                        <th className="py-2.5 px-3 text-center">Rank</th>
                        <th className="py-2.5 px-3">Candidate</th>
                        <th className="py-2.5 px-3">College & Roll</th>
                        <th className="py-2.5 px-3 text-center">Score</th>
                        <th className="py-2.5 px-3 text-center">Percentage</th>
                        <th className="py-2.5 px-3 text-center">Time Taken</th>
                        <th className="py-2.5 px-3 text-center">Tab Switches</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {contestSubs.map((s, index) => {
                        const rank = index + 1;
                        return (
                          <tr key={s.id} className="hover:bg-surface-raised/50 transition-colors">
                            <td className="py-3 px-3 text-center">
                              {rank === 1 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                                  <Trophy className="w-3 h-3 text-amber-400" /> 1st
                                </span>
                              ) : rank === 2 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-300/20 text-slate-300 border border-slate-400/40 font-bold">
                                  <Award className="w-3 h-3 text-slate-300" /> 2nd
                                </span>
                              ) : rank === 3 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 font-bold">
                                  <Award className="w-3 h-3 text-amber-600" /> 3rd
                                </span>
                              ) : (
                                <span className="text-text-muted font-bold">#{rank}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-sans font-semibold text-text-primary">{s.studentName}</div>
                              <div className="text-[10px] text-text-muted">{s.email}</div>
                            </td>
                            <td className="py-3 px-3 text-text-secondary">
                              <div>{s.college || "N/A"}</div>
                              <div className="text-[10px] text-text-muted">{s.rollNumber || "N/A"}</div>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-emerald-400">
                              {s.score} / {s.totalMarks}
                            </td>
                            <td className="py-3 px-3 text-center font-bold">
                              <span
                                className={cn(
                                  s.percentage >= 80 ? "text-emerald-400" : s.percentage >= 50 ? "text-cyan-400" : "text-rose-400"
                                )}
                              >
                                {s.percentage}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-text-muted">
                              {Math.floor(s.timeTakenSeconds / 60)}m {s.timeTakenSeconds % 60}s
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded font-bold text-xs",
                                  s.tabSwitchCount >= 3
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                    : s.tabSwitchCount > 0
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                    : "text-emerald-400"
                                )}
                              >
                                {s.tabSwitchCount} / 2
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge
                                variant={
                                  s.submissionType === "AUTO_TAB_SWITCH"
                                    ? "blocked"
                                    : s.passed
                                    ? "active"
                                    : "medium"
                                }
                                className="text-[10px]"
                              >
                                {s.submissionType === "AUTO_TAB_SWITCH"
                                  ? "Disqualified"
                                  : s.passed
                                  ? "Passed"
                                  : "Completed"}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCandidateDetail(s);
                                  setCandidateDetailModalOpen(true);
                                }}
                                className="h-7 px-2 text-xs font-mono text-cyan-400 hover:bg-cyan-500/10"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS & VERIFIED CANDIDATE RECORDS */}
      {activeAdminTab === "SUBMISSIONS" && (
        <Card className="p-6 bg-surface border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Candidate Submissions & Evaluation Records
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Detailed scores, proctoring violations, and pass/fail rankings across all contests.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => liveTestService.exportResultsCsv(selectedContestId)}
              className="text-xs font-mono border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Download Submissions (CSV)
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase text-[10px]">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Contest</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3 text-center">Percentage</th>
                  <th className="py-2.5 px-3 text-center">Time Taken</th>
                  <th className="py-2.5 px-3 text-center">Tab Warnings</th>
                  <th className="py-2.5 px-3 text-center">Submission Type</th>
                  <th className="py-2.5 px-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-raised/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-sans font-semibold text-text-primary">{s.studentName}</div>
                      <div className="text-[10px] text-text-muted">{s.email}</div>
                    </td>
                    <td className="py-3 px-3 text-text-secondary truncate max-w-xs">{s.testTitle}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-400">
                      {s.score} / {s.totalMarks}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-cyan-400">{s.percentage}%</td>
                    <td className="py-3 px-3 text-center text-text-muted">
                      {Math.floor(s.timeTakenSeconds / 60)}m {s.timeTakenSeconds % 60}s
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded font-bold text-xs",
                          s.tabSwitchCount >= 3 ? "text-rose-400" : s.tabSwitchCount > 0 ? "text-amber-400" : "text-emerald-400"
                        )}
                      >
                        {s.tabSwitchCount} / 2
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant={
                          s.submissionType === "AUTO_TAB_SWITCH"
                            ? "blocked"
                            : s.submissionType === "NORMAL"
                            ? "active"
                            : "medium"
                        }
                        className="text-[10px]"
                      >
                        {s.submissionType === "AUTO_TAB_SWITCH"
                          ? "Auto-Submitted (Cheating)"
                          : s.submissionType === "AUTO_TIMEOUT"
                          ? "Time Expired"
                          : "Normal Submit"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCandidateDetail(s);
                          setCandidateDetailModalOpen(true);
                        }}
                        className="h-7 px-2 text-xs font-mono text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: EXPORT & SHARE REPORTS */}
      {activeAdminTab === "EXPORTS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((contest) => (
            <Card key={contest.id} className="p-6 bg-surface border border-border space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-primary">{contest.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{contest.category} • {contest.durationMinutes}m</p>
                </div>
                <Badge variant="medium" className="text-[10px] font-mono">
                  {contest.status}
                </Badge>
              </div>

              <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1.5 text-xs font-mono text-text-muted">
                <div>Total Questions: <strong className="text-text-primary">{contest.totalQuestions}</strong></div>
                <div>Registered Candidates: <strong className="text-cyan-400">{contest.registeredParticipantsCount}</strong></div>
                <div>Completed Submissions: <strong className="text-emerald-400">{liveTestService.getSubmissionsForTest(contest.id).length}</strong></div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => liveTestService.exportQuestionsJson(contest.id)}
                  className="text-xs font-mono flex-1 border-cyan-500/40 text-cyan-400"
                >
                  <FileCode2 className="w-3.5 h-3.5 mr-1" /> Export Questions (JSON)
                </Button>

                <Button
                  variant="teal-cyan"
                  size="sm"
                  onClick={() => liveTestService.exportResultsCsv(contest.id)}
                  className="text-xs font-mono flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Download Results (CSV)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT LIVE CONTEST WIZARD MODAL */}
      <Dialog
        isOpen={createContestModalOpen}
        onClose={() => setCreateContestModalOpen(false)}
        title={editingContestId ? "Edit Live Contest & Questions" : "Create New Proctored Live Test"}
        description="Configure proctoring limits, question sections (MCQs & Coding), and import challenges."
        maxWidthClass="max-w-4xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" size="sm" onClick={() => setCreateContestModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal-cyan" size="sm" onClick={handleSaveContest} className="text-xs font-bold px-5">
              {editingContestId ? "Update Contest" : "Save & Schedule Contest"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 text-xs font-mono">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-text-muted">Contest Title</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. TCS National Grand Challenge 2026"
                  className="bg-surface-raised text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted">Category</label>
                <Input
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Full-Stack + Aptitude"
                  className="bg-surface-raised text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted">Contest Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none"
                >
                  <option value="Scheduled">Scheduled (Upcoming Test)</option>
                  <option value="Live">Live (Active Now in Arena)</option>
                  <option value="Paused">Paused (Temporarily on hold)</option>
                  <option value="Completed">Completed (Past Test)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted">Scheduled Start Time</label>
                <Input
                  type="datetime-local"
                  value={formScheduledStartTime}
                  onChange={(e) => setFormScheduledStartTime(e.target.value)}
                  className="bg-surface-raised text-xs font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted">Contest Description</label>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Comprehensive campus placement assessment..."
                  className="bg-surface-raised text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted">Duration (Minutes)</label>
                <Input
                  type="number"
                  value={formDurationMinutes}
                  onChange={(e) => setFormDurationMinutes(parseInt(e.target.value, 10) || 60)}
                  className="bg-surface-raised text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted">Total Marks</label>
                <Input
                  type="number"
                  value={formTotalMarks}
                  onChange={(e) => setFormTotalMarks(parseInt(e.target.value, 10) || 100)}
                  className="bg-surface-raised text-xs"
                />
              </div>
            </div>

            {/* Proctoring Settings Strip */}
            <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="font-bold text-text-primary">Anti-Cheating Proctoring Protocol</span>
                </div>
                <input
                  type="checkbox"
                  checked={formProctoring}
                  onChange={(e) => setFormProctoring(e.target.checked)}
                  className="rounded border-border text-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-text-secondary text-[11px]">
                <div>
                  <label className="text-text-muted block">Max Tab Switches Allowed Before Auto-Submit</label>
                  <select
                    value={formMaxTabSwitches}
                    onChange={(e) => setFormMaxTabSwitches(parseInt(e.target.value, 10))}
                    className="mt-1 w-full bg-surface border border-border rounded p-1.5 text-xs text-text-primary"
                  >
                    <option value={2}>2 (1 Warning, 2nd Submits)</option>
                    <option value={3}>3 (2 Warnings, 3rd Submits - Recommended)</option>
                    <option value={5}>5 (4 Warnings, 5th Submits)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Window resizing & split-screen strictly prohibited</span>
                </div>
              </div>
            </div>

            {/* Section & Question Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-serif text-base font-bold text-text-primary">
                  Test Sections & Question Bank
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSec: LiveTestSection = {
                      id: `sec-${Date.now()}`,
                      title: `Section ${formSections.length + 1}: Custom Assessment`,
                      type: "MIXED",
                      questions: [],
                    };
                    setFormSections((prev) => [...prev, newSec]);
                  }}
                  className="text-xs h-7"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Section
                </Button>
              </div>

              {formSections.map((sec, secIdx) => (
                <div key={sec.id} className="p-4 bg-surface-raised border border-border rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <Input
                      value={sec.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormSections((prev) => {
                          const copy = [...prev];
                          copy[secIdx].title = val;
                          return copy;
                        });
                      }}
                      className="bg-surface max-w-md font-bold text-xs"
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addMcqQuestionToSection(secIdx)}
                        className="text-xs h-7 text-cyan-400 border-cyan-500/40"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add MCQ
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openExternalProblemModal(secIdx)}
                        className="text-xs h-7 text-emerald-400 border-emerald-500/40"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" /> Import Coding (LeetCode/GFG)
                      </Button>

                      {formSections.length > 1 && (
                        <button
                          onClick={() => {
                            setFormSections((prev) => prev.filter((_, i) => i !== secIdx));
                          }}
                          className="text-text-muted hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Questions in Section */}
                  <div className="space-y-3 pl-3 border-l-2 border-cyan-500/30">
                    {sec.questions.length === 0 ? (
                      <div className="text-xs text-text-muted italic py-2">
                        No questions added to this section yet. Click 'Add MCQ' or 'Import Coding'.
                      </div>
                    ) : (
                      sec.questions.map((q, qIdx) => (
                        <div key={q.id} className="p-3 bg-surface border border-border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={q.type === "CODING" ? "accent" : "medium"} className="text-[10px]">
                                {q.type}
                              </Badge>
                              <strong className="text-text-primary text-xs">{q.title}</strong>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-cyan-400">+{q.marks} pts</span>
                              <button
                                onClick={() => {
                                  setFormSections((prev) => {
                                    const copy = [...prev];
                                    copy[secIdx].questions = copy[secIdx].questions.filter((_, i) => i !== qIdx);
                                    return copy;
                                  });
                                }}
                                className="text-text-muted hover:text-rose-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-text-secondary text-[11px] line-clamp-1">{q.questionText}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </Dialog>

      {/* IMPORT PROBLEM MODAL (LeetCode / GFG / Codeforces) */}
      <Dialog
        isOpen={importProblemModalOpen}
        onClose={() => setImportProblemModalOpen(false)}
        title="Import Problem from LeetCode / GFG / Codeforces"
        description="Select an algorithm or data structures problem to instantly import into this live contest."
        maxWidthClass="max-w-3xl"
      >
        <div className="space-y-4">
          <Input
            value={searchExternalQuery}
            onChange={(e) => setSearchExternalQuery(e.target.value)}
            placeholder="Search problems by name or topic (e.g. Subarray, Graph, Tree)..."
            className="bg-surface-raised text-xs font-mono"
          />

          <div className="space-y-3 font-mono text-xs max-h-96 overflow-y-auto custom-scrollbar">
            {externalProblems
              .filter(
                (p) =>
                  !searchExternalQuery ||
                  p.title.toLowerCase().includes(searchExternalQuery.toLowerCase()) ||
                  p.description?.toLowerCase().includes(searchExternalQuery.toLowerCase())
              )
              .map((prob) => (
                <div
                  key={prob.id}
                  className="p-4 bg-surface-raised border border-border hover:border-cyan-500/50 rounded-xl flex items-start justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="accent" className="text-[10px]">
                        {prob.source || "LEETCODE"}
                      </Badge>
                      <Badge
                        variant={prob.difficulty === "Easy" ? "active" : prob.difficulty === "Hard" ? "blocked" : "medium"}
                        className="text-[10px]"
                      >
                        {prob.difficulty}
                      </Badge>
                      <h4 className="font-serif text-sm font-bold text-text-primary font-sans">{prob.title}</h4>
                    </div>
                    <p className="text-text-secondary text-xs line-clamp-2 font-sans">{prob.description}</p>
                  </div>

                  <Button
                    variant="teal-cyan"
                    size="sm"
                    onClick={() => handleImportProblemSelected(prob)}
                    className="text-xs shrink-0 px-3"
                  >
                    Import Problem
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </Dialog>

      {/* EXTEND TIME MODAL */}
      <Dialog
        isOpen={extendTimeModalOpen}
        onClose={() => setExtendTimeModalOpen(false)}
        title="Extend Live Contest Duration"
        description="Select additional minutes to add to the contest clock for all candidates:"
        maxWidthClass="max-w-sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setExtendTimeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal-cyan" size="sm" onClick={handleExtendTime}>
              Apply Extension
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            {[5, 10, 15, 20, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setExtendMinutes(mins)}
                className={cn(
                  "p-2.5 rounded-lg border text-center font-bold transition-colors",
                  extendMinutes === mins
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500"
                    : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
                )}
              >
                +{mins} Mins
              </button>
            ))}
          </div>
        </div>
      </Dialog>

      {/* BROADCAST ALERT MODAL */}
      <Dialog
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        title="Send Live Contest Broadcast"
        description="This message will appear immediately as a high-priority banner on all candidates' test screens:"
        maxWidthClass="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setBroadcastModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal-cyan" size="sm" onClick={handleSendBroadcast}>
              Transmit Alert
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <textarea
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="e.g. Clarification for Question 3: Array inputs are guaranteed to be sorted in ascending order."
            className="w-full h-24 p-3 bg-surface-raised border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none resize-none"
          />
        </div>
      </Dialog>

      {/* DISQUALIFY PARTICIPANT MODAL */}
      <Dialog
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Disqualify Candidate?"
        maxWidthClass="max-w-sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setRemoveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="teal-cyan"
              size="sm"
              onClick={() => participantToRemove && handleRemoveParticipant(participantToRemove)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Disqualify Candidate
            </Button>
          </div>
        }
      >
        <p className="text-xs font-mono text-text-secondary">
          Are you sure you want to remove <strong>{participantToRemove?.name}</strong> ({participantToRemove?.rollNumber}) from this live contest? Their test will be immediately terminated.
        </p>
      </Dialog>

      {/* CANDIDATE SUBMISSION DETAIL MODAL */}
      <Dialog
        isOpen={candidateDetailModalOpen}
        onClose={() => setCandidateDetailModalOpen(false)}
        title="Candidate Submission & Proctoring Audit"
        description="Comprehensive evaluation breakdown, test case verdicts, and anti-cheat telemetry."
        maxWidthClass="max-w-3xl"
        footer={
          <div className="flex justify-end w-full">
            <Button variant="outline" size="sm" onClick={() => setCandidateDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedCandidateDetail && (
          <div className="space-y-4 text-xs font-mono">
            {/* Header Summary */}
            <div className="p-4 bg-surface-raised border border-border rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-text-muted uppercase block">Candidate</span>
                <span className="font-bold text-text-primary">{selectedCandidateDetail.studentName}</span>
                <span className="text-[10px] text-text-muted block truncate">{selectedCandidateDetail.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">Score / Result</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {selectedCandidateDetail.score} / {selectedCandidateDetail.totalMarks}
                </span>
                <span className="text-[10px] text-cyan-400 block">{selectedCandidateDetail.percentage}% (Rank #{selectedCandidateDetail.rank || 1})</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">Duration</span>
                <span className="font-bold text-text-primary">
                  {Math.floor(selectedCandidateDetail.timeTakenSeconds / 60)}m {selectedCandidateDetail.timeTakenSeconds % 60}s
                </span>
                <span className="text-[10px] text-text-muted block">
                  {new Date(selectedCandidateDetail.submittedAt).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">Proctoring Telemetry</span>
                <span
                  className={cn(
                    "font-bold block",
                    selectedCandidateDetail.tabSwitchCount >= 3
                      ? "text-rose-400"
                      : selectedCandidateDetail.tabSwitchCount > 0
                      ? "text-amber-400"
                      : "text-emerald-400"
                  )}
                >
                  {selectedCandidateDetail.tabSwitchCount} Tab Violations
                </span>
                <span className="text-[10px] text-text-muted block">
                  {selectedCandidateDetail.submissionType === "AUTO_TAB_SWITCH"
                    ? "Terminated (3rd Strike)"
                    : selectedCandidateDetail.submissionType === "AUTO_TIMEOUT"
                    ? "Auto-Submitted (Timer)"
                    : "Normal Submission"}
                </span>
              </div>
            </div>

            {/* Questions Breakdown */}
            <div className="space-y-2">
              <h4 className="font-serif text-sm font-bold text-text-primary">Section & Question Responses</h4>
              {Object.keys(selectedCandidateDetail.answers || {}).length === 0 ? (
                <p className="text-text-muted italic py-3">No individual question answers recorded for this submission.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {Object.entries(selectedCandidateDetail.answers).map(([qId, ans], idx) => (
                    <div key={qId} className="p-3 bg-surface border border-border rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary">Q{idx + 1}:</span>
                          <Badge variant="medium" className="text-[10px]">
                            {ans.type}
                          </Badge>
                          {ans.language && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-[10px]">
                              {ans.language}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">{ans.marksEarned} pts</span>
                          {ans.isCorrect ? (
                            <Badge variant="active" className="text-[10px]">Passed</Badge>
                          ) : (
                            <Badge variant="blocked" className="text-[10px]">Partial / Failed</Badge>
                          )}
                        </div>
                      </div>

                      {ans.type === "MCQ" && (
                        <div className="text-text-secondary">
                          Selected Option: <strong className="text-text-primary">{ans.selectedOptionId || "None"}</strong>
                        </div>
                      )}

                      {ans.type === "CODING" && (
                        <div className="space-y-1.5">
                          {ans.passedTestCases !== undefined && (
                            <div className="text-text-secondary">
                              Test Cases Passed: <strong className="text-text-primary">{ans.passedTestCases} / {ans.totalTestCases || ans.passedTestCases}</strong>
                            </div>
                          )}
                          {ans.code && (
                            <pre className="p-2 bg-background border border-border rounded text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-32">
                              {ans.code}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
