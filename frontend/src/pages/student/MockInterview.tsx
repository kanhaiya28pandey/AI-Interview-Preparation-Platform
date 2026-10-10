import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { interviewService, MockInterviewAnswerPayload } from "@/services/interviewService";
import { progressService } from "@/services/progressService";
import { notificationService } from "@/services/notificationService";
import { InterviewRole, InterviewQuestion, InterviewFeedback, QuestionReviewItem } from "@/mocks/interviewData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { TaxonomySelect, TaxonomySelectOption } from "@/components/ui/TaxonomySelect";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import {
  Video,
  Mic,
  MicOff,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Award,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Download,
  Brain,
  Radio,
  FileText,
  Lightbulb,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { toast } from "sonner";

export const MockInterview: React.FC = () => {
  const { user } = useAuth();
  const { domains, getTopicsForDomain, normalizeDomain } = useTaxonomy();
  const [roles, setRoles] = useState<InterviewRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  // Flow State: 'select' | 'interview' | 'analyzing' | 'feedback'
  const [flowState, setFlowState] = useState<"select" | "interview" | "analyzing" | "feedback">("select");
  const [activeRole, setActiveRole] = useState<InterviewRole | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Candidate Answers Accumulated
  const [answeredQuestions, setAnsweredQuestions] = useState<MockInterviewAnswerPayload[]>([]);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBars, setAudioBars] = useState<number[]>(new Array(16).fill(8));
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [expandedQuestionReview, setExpandedQuestionReview] = useState<number | null>(null);

  // Audio & Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Feedback State
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const loadRoles = async () => {
    try {
      const data = await interviewService.getRoles();
      setRoles(data);
    } catch (e) {
      console.warn("Failed to load interview roles:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    const handleSync = () => loadRoles();
    window.addEventListener("mock_interviews_changed", handleSync);
    return () => window.removeEventListener("mock_interviews_changed", handleSync);
  }, []);

  // Check speech recognition capability
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSpeechSupported(false);
    }
  }, []);

  // Timer countdown during interview
  useEffect(() => {
    let interval: any = null;
    if (flowState === "interview" && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [flowState, timerSeconds]);

  // Clean up voice recording on unmount or question change
  useEffect(() => {
    return () => {
      stopVoiceRecording();
    };
  }, [currentQuestionIndex, flowState]);

  // -------------------------
  // Real Voice Recording Logic
  // -------------------------
  const startVoiceRecording = async () => {
    try {
      // 1. Setup Audio Visualizer via Web Audio API
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const updateBars = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          const bars: number[] = [];
          const step = Math.max(1, Math.floor(dataArray.length / 16));
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * step] || 0;
            // Scale between 8px and 44px
            bars.push(Math.max(8, Math.round((val / 255) * 40 + 8)));
          }
          setAudioBars(bars);
          animationFrameRef.current = requestAnimationFrame(updateBars);
        };
        updateBars();
      }

      // 2. Setup Speech Recognition
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        let currentBaseText = candidateAnswer;

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript + " ";
            } else {
              interim += transcript;
            }
          }

          if (final) {
            currentBaseText = (currentBaseText ? currentBaseText.trim() + " " : "") + final.trim();
          }
          const fullText = (currentBaseText ? currentBaseText.trim() + " " : "") + interim;
          setCandidateAnswer(fullText.trim());
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          if (err.error === "not-allowed") {
            toast.error("Microphone access denied. Please enable microphone permissions.");
            stopVoiceRecording();
          }
        };

        recognition.onend = () => {
          if (isRecording) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);
      toast.success("Microphone active! Speak your answer clearly.");
    } catch (err: any) {
      console.warn("Microphone access failed:", err);
      toast.error("Could not access microphone. You can type or use sample speech input.");
      // Fallback animated bars
      simulateVisualizer();
      setIsRecording(true);
    }
  };

  const simulateVisualizer = () => {
    const interval = setInterval(() => {
      setAudioBars((prev) => prev.map(() => Math.floor(Math.random() * 32) + 8));
    }, 120);
    (window as any).__simWaveInterval = interval;
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if ((window as any).__simWaveInterval) {
      clearInterval((window as any).__simWaveInterval);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioBars(new Array(16).fill(8));
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      toast.info("Recording paused. You can edit text or resume speaking.");
    } else {
      startVoiceRecording();
    }
  };

  // -------------------------
  // Interview Navigation & Actions
  // -------------------------
  const startInterviewRoom = async (role: InterviewRole) => {
    setActiveRole(role);
    setLoading(true);
    const qList = await interviewService.getQuestions(role.id);
    setQuestions(qList);
    setCurrentQuestionIndex(0);
    setCandidateAnswer("");
    setAnsweredQuestions([]);
    setTimerSeconds(role.durationMinutes ? role.durationMinutes * 60 : 300);
    setFlowState("interview");
    setLoading(false);
  };

  const handleNextQuestion = async () => {
    if (!candidateAnswer.trim()) {
      toast.error("Please provide or speak your answer before proceeding.");
      return;
    }

    stopVoiceRecording();
    setSubmittingAnswer(true);

    const currentQ = questions[currentQuestionIndex];
    // Immediate AI evaluation for this question
    const evaluation = await interviewService.submitAnswer(
      activeRole!.id,
      currentQ.id,
      candidateAnswer,
      currentQ.question,
      activeRole!.title
    );

    const record: MockInterviewAnswerPayload = {
      questionId: currentQ.id,
      questionNumber: currentQuestionIndex + 1,
      questionText: currentQ.question,
      category: currentQ.category,
      answerText: candidateAnswer,
      score: evaluation.score,
      aiFeedback: evaluation.aiFeedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      sampleAnswer: evaluation.sampleAnswer,
    };

    const updatedAnswers = [...answeredQuestions, record];
    setAnsweredQuestions(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCandidateAnswer("");
      setTimerSeconds(300);
      setSubmittingAnswer(false);
      toast.success(`Question ${currentQuestionIndex + 1} scored: ${evaluation.score}/100`);
    } else {
      // Completed all questions -> Transition to Analyzing Screen then Scorecard
      setFlowState("analyzing");
      setSubmittingAnswer(false);

      const sessionId = `session-${Date.now()}`;
      const finalFeedback = await interviewService.synthesizeSessionFeedback(
        sessionId,
        activeRole!.title,
        updatedAnswers
      );

      // Save to sessions history
      await interviewService.saveCompletedSession({
        sessionId,
        roleId: activeRole!.id,
        roleTitle: activeRole!.title,
        userEmail: user?.email || "candidate@platform.local",
        date: finalFeedback.date,
        overallScore: finalFeedback.overallScore,
        performanceBand: finalFeedback.performanceBand,
        feedback: finalFeedback,
      });

      // Update student profile stats
      progressService.recordInterviewSession(user?.userId, {
        roleId: activeRole!.id,
        roleTitle: activeRole!.title,
        overallScore: finalFeedback.overallScore,
        technicalAccuracy: finalFeedback.scores.technicalAccuracy,
        communicationClarity: finalFeedback.scores.communicationClarity,
        problemSolving: finalFeedback.scores.problemSolving,
        confidence: finalFeedback.scores.confidence,
      });

      // Notify candidate
      if (user?.userId) {
        notificationService.notifyUser(user.userId, {
          audience: "STUDENT",
          type: "interview",
          title: "AI Mock Interview Evaluation Ready",
          message: `${activeRole?.title}: Overall Score ${finalFeedback.overallScore}/100 (${finalFeedback.performanceBand}).`,
          link: "/mock-interview",
          priority: finalFeedback.overallScore >= 80 ? "success" : "info",
        }).catch(() => {});
      }

      // Small delay for seamless visual immersion
      setTimeout(() => {
        setFeedback(finalFeedback);
        setFlowState("feedback");
      }, 1500);
    }
  };

  const handleAutoFillSample = () => {
    const samples = [
      "In my previous project, I solved this by isolating compute-heavy transformations and caching hot query aggregates in Redis. We structured the API with idempotent request keys and exponential backoff retries, which reduced latency by 45% and prevented cascading service failures.",
      "I follow a modular architecture with strict separation of concerns. In React 19, I leverage useTransition to deprioritize non-urgent renders and keep the user interface responsive. For state management, I colocated state and introduced memoized selectors to eliminate duplicate re-renders.",
      "When evaluating this trade-off, I considered read-heavy vs write-heavy patterns. Because our workload was 90% reads, we partitioned the database with read-replicas and implemented an asynchronous event queue with Apache Kafka to absorb burst write traffic reliably.",
    ];
    const picked = samples[currentQuestionIndex % samples.length];
    setCandidateAnswer(picked);
    toast.info("Sample candidate response loaded.");
  };

  if (loading) return <CardSkeleton />;

  // Cascading filters
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

  const filteredRoles = roles.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);

    const rDomainSlug = (r as any).domainSlug || normalizeDomain(r.category);
    const matchesDomain =
      selectedDomain === "ALL" ||
      rDomainSlug === selectedDomain ||
      r.category.toLowerCase() === selectedDomain.toLowerCase() ||
      domains.find((d) => d.slug === selectedDomain)?.name.toLowerCase() === r.category.toLowerCase();

    const matchesTopic =
      selectedTopic === "ALL" ||
      r.title.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      r.description.toLowerCase().includes(selectedTopic.toLowerCase());

    const matchesDiff =
      selectedDifficulty === "ALL" || r.difficulty.toUpperCase() === selectedDifficulty.toUpperCase();

    const matchesType =
      selectedType === "ALL" || r.category.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesDomain && matchesTopic && matchesDiff && matchesType;
  });

  // ==========================================
  // SCREEN 1: Role Selection
  // ==========================================
  if (flowState === "select") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary flex items-center gap-2.5">
              <Video className="w-7 h-7 text-cyan-400" /> AI Voice Mock Interview Rooms
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Real-time voice-interactive interview simulations. Answer verbally into your mic and receive instant AI recognition, multi-dimensional scorecards, and senior engineer benchmark feedback.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 bg-surface border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search interview roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-raised border border-border rounded-lg text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <TaxonomySelect
                options={domainOptions}
                value={selectedDomain}
                onChange={handleDomainChange}
                placeholder="Domain"
                ariaLabel="Filter interview domain"
              />
            </div>

            <div>
              <TaxonomySelect
                options={topicOptions}
                value={selectedTopic}
                onChange={(val) => setSelectedTopic(val)}
                placeholder="Topic"
                ariaLabel="Filter interview topic"
                grouped={selectedDomain === "ALL"}
              />
            </div>

            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Levels</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral (STAR)</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>
        </Card>

        {filteredRoles.length === 0 ? (
          <EmptyState
            title="No mock interview roles match your filters"
            description="Try selecting a different domain, difficulty level, or search keyword."
            actionText="Reset Filters"
            onAction={() => {
              setSearch("");
              setSelectedDomain("ALL");
              setSelectedTopic("ALL");
              setSelectedDifficulty("ALL");
              setSelectedType("ALL");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoles.map((role) => (
              <Card
                key={role.id}
                className="p-5 space-y-4 hover:border-cyan-400/50 hover:shadow-lg transition-all flex flex-col justify-between group bg-surface border-border"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 group-hover:scale-105 transition-transform">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="accent" className="text-[10px] font-mono">
                        {role.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {role.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-medium text-text-primary group-hover:text-cyan-400 transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-text-muted pt-2 border-t border-border">
                    <span className="flex items-center gap-1">⏱ {role.durationMinutes} mins</span>
                    <span className="flex items-center gap-1">❓ {role.totalQuestions || 4} Questions</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-2 font-medium"
                  onClick={() => startInterviewRoom(role)}
                >
                  <Radio className="w-4 h-4 text-cyan-200 animate-pulse" />
                  <span>Enter Voice Room</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: Active Voice Interview Room
  // ==========================================
  if (flowState === "interview" && activeRole && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const wordCount = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6 relative">
        {/* Spotlight Beam Visual Effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-400/10 dark:bg-cyan-400/20 opacity-30 dark:opacity-100 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl z-10 relative">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-semibold text-text-primary">{activeRole.title}</h3>
                <Badge variant="accent" className="text-[10px] font-mono">{activeRole.difficulty}</Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {questions.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentQuestionIndex
                        ? "w-6 bg-cyan-400 ring-2 ring-cyan-400/40"
                        : idx < currentQuestionIndex
                        ? "w-2.5 bg-emerald-500"
                        : "w-2.5 bg-surface-raised border border-border"
                    }`}
                  />
                ))}
                <span className="text-[11px] font-mono text-text-muted ml-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-sm px-3.5 py-1.5 bg-surface-raised border border-border rounded-lg text-cyan-400 font-semibold shadow-inner">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to exit the interview room? Progress will be lost.")) {
                  stopVoiceRecording();
                  setFlowState("select");
                }
              }}
              className="text-xs text-text-muted hover:text-red-400"
            >
              Exit
            </Button>
          </div>
        </div>

        {/* Question Prompt Card */}
        <Card className="p-6 space-y-4 bg-surface border-cyan-400/30 relative z-10 shadow-soft">
          <div className="flex justify-between items-center">
            <Badge variant="accent" className="text-xs font-mono">{currentQ.category}</Badge>
            <span className="text-xs font-mono text-text-muted">Round {currentQuestionIndex + 1}</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-medium text-text-primary leading-snug">
            "{currentQ.question}"
          </h3>

          {/* AI Evaluator Focus Guidelines */}
          <div className="p-3.5 bg-surface-raised border border-border rounded-xl text-xs font-mono text-text-secondary space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Lightbulb className="w-4 h-4" />
              <span>AI Evaluation Focus:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-text-muted list-disc list-inside">
              {currentQ.idealKeyPoints.map((kp, idx) => (
                <li key={idx} className="truncate">{kp}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Voice Recording & Transcription Console */}
        <Card className="p-6 space-y-4 bg-surface border-border relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isRecording ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-surface-raised text-cyan-400"}`}>
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary block">
                  {isRecording ? "Voice Recording Active (Listening...)" : "Voice Response & Transcript"}
                </span>
                <span className="text-[11px] text-text-muted font-sans">
                  {isRecording ? "Speak naturally. Your voice is transcribed live." : "Click Record to speak, or edit text directly."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isRecording ? "danger" : "primary"}
                size="sm"
                onClick={toggleRecording}
                className="font-semibold text-xs shadow-md"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 mr-1" /> Pause Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 mr-1" /> Speak / Record Answer
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Dynamic Audio Waveform Visualizer */}
          {isRecording && (
            <div className="p-4 bg-surface-raised border border-red-500/30 rounded-xl flex flex-col items-center justify-center gap-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Live Audio Waveform (Microphone Input)
              </div>
              <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-md">
                {audioBars.map((height, i) => (
                  <span
                    key={i}
                    className="w-2 bg-gradient-to-t from-cyan-500 to-red-400 rounded-full transition-all duration-100 ease-out"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Live Transcript / Candidate Textarea */}
          <div className="relative">
            <textarea
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Click 'Speak / Record Answer' to start speaking, or type your answer here..."
              className="w-full h-44 p-4 bg-surface-raised border border-border rounded-xl text-text-primary placeholder:text-text-muted font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 resize-none transition-all duration-200"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-3 text-[11px] font-mono text-text-muted pointer-events-none">
              <span>{wordCount} words</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAutoFillSample}
                className="text-xs text-text-muted hover:text-cyan-400"
              >
                Auto-fill Sample Speech
              </Button>
              {candidateAnswer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCandidateAnswer("")}
                  className="text-xs text-text-muted hover:text-red-400"
                >
                  Clear Transcript
                </Button>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleNextQuestion}
              isLoading={submittingAnswer}
              disabled={candidateAnswer.trim().length === 0}
              className="w-full sm:w-auto font-semibold px-6 shadow-md"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  <span>Save & Next Question</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-1 text-cyan-300" />
                  <span>Submit Final Interview (Get AI Scorecard)</span>
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ==========================================
  // SCREEN 3: Analyzing Screen (Transition)
  // ==========================================
  if (flowState === "analyzing") {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin mx-auto" />
          <Brain className="w-10 h-10 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
            AI Speech Recognition & Evaluation in Progress
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
            Analyzing spoken transcripts, technical correctness, architectural depth, STAR delivery, and communication clarity...
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-raised border border-border rounded-full text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Synthesizing Multi-dimensional Performance Band...
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 4: Feedback Summary Scorecard & Deep Review
  // ==========================================
  if (flowState === "feedback" && feedback) {
    const isPass = feedback.overallScore >= 75;
    const bandColor =
      feedback.performanceBand === "Strong Hire"
        ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
        : feedback.performanceBand === "Hire"
        ? "text-cyan-400 border-cyan-500/40 bg-cyan-500/10"
        : "text-amber-400 border-amber-500/40 bg-amber-500/10";

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Top Header & Verdict */}
        <div className="text-center space-y-3">
          <div className="p-4 bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 rounded-full inline-block shadow-lg">
            <Award className="w-12 h-12" />
          </div>
          <div>
            <span className={`text-xs font-mono px-3 py-1 rounded-full border uppercase tracking-wider inline-block mb-2 font-semibold ${bandColor}`}>
              {feedback.performanceBand || (isPass ? "Hire" : "Needs Practice")}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-text-primary">
              Interview Evaluation: {feedback.overallScore}/100
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {feedback.roleTitle} &bull; Completed {feedback.date}
            </p>
          </div>
        </div>

        {/* Executive Summary Card */}
        <Card className="p-6 bg-surface border-cyan-400/30 space-y-3 shadow-soft">
          <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" /> AI Executive Verdict & Summary
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
            {feedback.detailedFeedback}
          </p>
        </Card>

        {/* Multi-Dimensional Competency Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(
            feedback.dimensionScores || {
              "Technical Accuracy": feedback.scores.technicalAccuracy,
              "Communication": feedback.scores.communicationClarity,
              "Problem Solving": feedback.scores.problemSolving,
              "Confidence": feedback.scores.confidence,
            }
          ).map(([dim, score]) => (
            <Card key={dim} className="p-4 text-center space-y-2 bg-surface border-border">
              <span className="text-[11px] font-mono text-text-muted uppercase block truncate" title={dim}>
                {dim}
              </span>
              <div className="font-serif text-2xl font-bold text-cyan-400">{score}%</div>
              <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Strengths & Improvements Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 bg-surface border-emerald-500/30">
            <h3 className="font-serif text-lg font-medium text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> What Landed Well (Key Strengths)
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary font-sans">
              {feedback.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 space-y-3 bg-surface border-amber-500/30">
            <h3 className="font-serif text-lg font-medium text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> What to Sharpen (Actionable Insights)
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary font-sans">
              {feedback.areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Question-by-Question Detailed Review Audit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-medium text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" /> Question-by-Question Audit & Model Answers
            </h3>
            <span className="text-xs font-mono text-text-muted">
              {feedback.questionReviews?.length || answeredQuestions.length} Questions Evaluated
            </span>
          </div>

          <div className="space-y-4">
            {(feedback.questionReviews && feedback.questionReviews.length > 0
              ? feedback.questionReviews
              : answeredQuestions.map((q) => ({
                  questionId: q.questionId,
                  questionNumber: q.questionNumber,
                  question: q.questionText,
                  category: q.category,
                  candidateAnswer: q.answerText,
                  score: q.score || 80,
                  aiFeedback: q.aiFeedback || "Good articulation.",
                  sampleAnswer: q.sampleAnswer,
                  strengths: q.strengths,
                  improvements: q.improvements,
                }))
            ).map((item, index) => {
              const isExpanded = expandedQuestionReview === index;
              return (
                <Card
                  key={index}
                  className="p-5 bg-surface border-border hover:border-cyan-400/40 transition-colors space-y-4"
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    onClick={() => setExpandedQuestionReview(isExpanded ? null : index)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="accent" className="text-[10px] font-mono">
                          Question {item.questionNumber}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {item.category}
                        </Badge>
                      </div>
                      <h4 className="font-serif text-base font-medium text-text-primary">
                        {item.question}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-mono text-text-muted block">Score</span>
                        <span className="font-serif text-lg font-bold text-cyan-400">{item.score}/100</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-border space-y-4 animate-fade-in text-xs">
                      {/* Candidate Voice Transcript */}
                      <div className="p-3.5 bg-surface-raised border border-border rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-cyan-400">
                          <Mic className="w-3.5 h-3.5" />
                          <span>Candidate Spoken Response (Voice Transcript):</span>
                        </div>
                        <p className="text-text-primary font-mono leading-relaxed pl-5">
                          "{item.candidateAnswer || "(No spoken response recorded)"}"
                        </p>
                      </div>

                      {/* AI Evaluation */}
                      <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-cyan-300">
                          <Brain className="w-3.5 h-3.5" />
                          <span>AI Feedback & Critique:</span>
                        </div>
                        <p className="text-text-secondary leading-relaxed pl-5">
                          {item.aiFeedback}
                        </p>
                      </div>

                      {/* Model / Benchmark Answer */}
                      {item.sampleAnswer && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
                          <div className="flex items-center gap-1.5 font-mono font-semibold text-emerald-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Senior Benchmark Model Answer:</span>
                          </div>
                          <p className="text-text-secondary leading-relaxed font-sans pl-5">
                            {item.sampleAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-border">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              if (activeRole) startInterviewRoom(activeRole);
            }}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Retake This Interview
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setFlowState("select")}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Practice Another Domain
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
