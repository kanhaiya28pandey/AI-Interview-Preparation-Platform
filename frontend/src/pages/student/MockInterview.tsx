import React, { useState, useEffect } from "react";
import { interviewService } from "@/services/interviewService";
import { InterviewRole, InterviewQuestion, InterviewFeedback } from "@/mocks/interviewData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { CardSkeleton } from "@/components/common/Skeletons";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { Video, Mic, Clock, Sparkles, CheckCircle2, ArrowRight, Award, AlertCircle, RefreshCw, Volume2, X, AlertTriangle, Users } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { toast } from "sonner";
import { MockInsightsReport } from "@/components/student/MockInsightsReport";
import { PeerMockMatchingModal } from "@/components/student/PeerMockMatchingModal";

export const MockInterview: React.FC = () => {
  const [roles, setRoles] = useState<InterviewRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Flow State: 'select' | 'interview' | 'feedback'
  const [flowState, setFlowState] = useState<"select" | "interview" | "feedback">("select");
  const [activeRole, setActiveRole] = useState<InterviewRole | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Candidate Answer
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isRecordingWaveform, setIsRecordingWaveform] = useState(false);

  // Cancel & Feedback State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPeerModal, setShowPeerModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  useEffect(() => {
    interviewService.getRoles().then((data) => {
      setRoles(data);
      setLoading(false);
    });
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (flowState === "interview" && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [flowState, timerSeconds]);

  // Handle browser tab exit / back button warning when interview is active
  useEffect(() => {
    if (flowState !== "interview") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your mock interview session will be cancelled.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [flowState]);

  const startInterviewRoom = async (role: InterviewRole) => {
    setActiveRole(role);
    setLoading(true);
    const qList = await interviewService.getQuestions(role.id);
    setQuestions(qList);
    setCurrentQuestionIndex(0);
    setCandidateAnswer("");
    setTimerSeconds(300);
    setFlowState("interview");
    setLoading(false);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setSubmittingAnswer(true);
      await interviewService.submitAnswer(activeRole!.id, questions[currentQuestionIndex].id, candidateAnswer);
      setSubmittingAnswer(false);
      setCurrentQuestionIndex((prev) => prev + 1);
      setCandidateAnswer("");
      setTimerSeconds(300);
    } else {
      setSubmittingAnswer(true);
      await interviewService.submitAnswer(activeRole!.id, questions[currentQuestionIndex].id, candidateAnswer);
      const fbData = await interviewService.getFeedback("session-" + Date.now());
      setFeedback(fbData);
      setSubmittingAnswer(false);
      setFlowState("feedback");
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await fetch(`/api/v1/interview/sessions/mock-session-${Date.now()}/cancel`, { method: "POST" }).catch(() => {});
      toast.info("Mock interview cancelled. Session was not saved.");
      setFlowState("select");
      setActiveRole(null);
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <CardSkeleton />;

  // SCREEN 1: Role Selection
  if (flowState === "select") {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-medium text-text-primary flex items-center gap-2">
              <Video className="w-6 h-6 text-cyan-400" /> AI Mock Interview Rooms
            </h2>
            <p className="text-xs text-text-secondary">Select your target engineering domain for a 3-round simulated placement interview.</p>
          </div>
          <Button
            variant="teal-cyan"
            size="sm"
            onClick={() => setShowPeerModal(true)}
            className="gap-2 text-xs font-semibold shadow-glow self-start sm:self-auto"
          >
            <Users className="w-4 h-4" /> Peer Mock Matching (1-on-1)
          </Button>
        </div>

        <PeerMockMatchingModal isOpen={showPeerModal} onClose={() => setShowPeerModal(false)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="p-6 space-y-4 hover:border-cyan-400/50 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-surface-raised border border-border rounded-xl text-cyan-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <Badge variant="accent">{role.difficulty}</Badge>
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">{role.title}</h3>
                <p className="text-xs text-text-secondary">{role.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-xs font-mono text-text-muted">
                  <span>{role.totalQuestions || 3} Questions</span>
                  <span>⏱ {role.durationMinutes} Mins</span>
                </div>
                <Button variant="primary" size="sm" className="w-full" onClick={() => startInterviewRoom(role)}>
                  Enter Assessment Room <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // SCREEN 3: Detailed Feedback Report
  if (flowState === "feedback" && feedback) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <span className="font-mono text-xs text-cyan-400 uppercase font-semibold">Evaluation Report</span>
            <h2 className="font-serif text-3xl font-medium text-text-primary">{feedback.roleTitle}</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setFlowState("select")}>
            <RefreshCw className="w-4 h-4 mr-1" /> New Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-4 bg-surface border-border flex flex-col items-center justify-center">
            <VerdictHeadline prefix="Overall Grade " score={feedback.overallScore} size="xl" />
            <p className="text-xs text-text-secondary">Based on technical accuracy, clarity, problem solving, and confidence.</p>
          </Card>

          <Card className="md:col-span-2 p-6 space-y-3 bg-surface border-border">
            <h3 className="font-serif text-base font-bold text-text-primary">Domain Score Breakdown</h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 bg-surface-raised border border-border rounded-xl">
                <span className="text-text-muted block">Technical Accuracy</span>
                <span className="text-xl font-serif font-bold text-cyan-400">{feedback.scores.technicalAccuracy}%</span>
              </div>
              <div className="p-3 bg-surface-raised border border-border rounded-xl">
                <span className="text-text-muted block">Problem Solving</span>
                <span className="text-xl font-serif font-bold text-live">{feedback.scores.problemSolving}%</span>
              </div>
              <div className="p-3 bg-surface-raised border border-border rounded-xl">
                <span className="text-text-muted block">Communication</span>
                <span className="text-xl font-serif font-bold text-amber-400">{feedback.scores.communicationClarity}%</span>
              </div>
              <div className="p-3 bg-surface-raised border border-border rounded-xl">
                <span className="text-text-muted block">Confidence</span>
                <span className="text-xl font-serif font-bold text-indigo-400">{feedback.scores.confidence}%</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 space-y-4 bg-surface border-border">
          <h3 className="font-serif text-lg font-bold text-text-primary">Detailed AI Evaluator Feedback</h3>
          <p className="text-xs text-text-secondary leading-relaxed bg-surface-raised border border-border p-4 rounded-xl font-sans">
            {feedback.detailedFeedback}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="space-y-2">
              <span className="font-mono text-live font-semibold block uppercase">Key Strengths:</span>
              <ul className="list-disc list-inside space-y-1 text-text-secondary font-mono">
                {feedback.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-amber-400 font-semibold block uppercase">Areas for Growth:</span>
              <ul className="list-disc list-inside space-y-1 text-text-secondary font-mono">
                {feedback.areasForImprovement.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Feature D: Audio & Speech Insights Report */}
        <MockInsightsReport
          confidenceScore={feedback.scores.confidence}
          topImprovements={feedback.areasForImprovement}
        />
      </div>
    );
  }

  // SCREEN 2: ACTIVE INTERVIEW ROOM FLOW
  const currentQ = questions[currentQuestionIndex];
  if (!currentQ || !activeRole) return <CardSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in relative font-sans">
      {/* Spotlight Beam Visual Effect */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-400/10 dark:bg-cyan-400/20 opacity-30 dark:opacity-100 rounded-full blur-3xl pointer-events-none" />

      {/* Question Progress Dots Bar */}
      <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl z-10 relative">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-live animate-pulse-live" />
          <div>
            <h3 className="font-serif text-base font-medium text-text-primary">{activeRole.title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              {questions.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    idx === currentQuestionIndex ? "bg-cyan-400 ring-2 ring-cyan-400/40" : idx < currentQuestionIndex ? "bg-live" : "bg-surface-raised border border-border"
                  }`}
                />
              ))}
              <span className="text-[11px] font-mono text-text-muted ml-2">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-sm px-3 py-1.5 bg-surface-raised border border-border rounded-lg text-cyan-400 font-semibold">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timerSeconds)}</span>
          </div>

          {/* Outlined Red Cancel Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-danger border-danger/40 hover:bg-danger/10 text-xs px-2.5 py-1.5"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        </div>
      </div>

      {/* Question Prompt */}
      <Card className="p-6 space-y-4 bg-surface border-cyan-400/40 relative z-10 shadow-soft">
        <div className="flex justify-between items-center">
          <Badge variant="accent">{currentQ.category}</Badge>
          <span className="text-xs font-mono text-text-muted">Round {currentQuestionIndex + 1}</span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-medium text-text-primary leading-snug">
          "{currentQ.question}"
        </h3>

        <div className="p-3 bg-surface-raised border border-border rounded-lg text-xs font-mono text-text-secondary space-y-1">
          <span className="text-cyan-400 font-semibold block">AI Evaluator Focus:</span>
          <ul className="list-disc list-inside space-y-0.5 text-text-muted">
            {currentQ.idealKeyPoints.map((kp, idx) => (
              <li key={idx}>{kp}</li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Candidate Answer & Waveform Simulation */}
      <Card className="p-6 space-y-4 bg-surface border-border relative z-10">
        <div className="flex items-center justify-between">
          <label className="font-mono text-xs text-text-secondary font-semibold uppercase tracking-wider flex items-center gap-2">
            <Mic className="w-4 h-4 text-cyan-400" /> Candidate Speech / Response
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRecordingWaveform(!isRecordingWaveform)}
            className="text-xs text-cyan-400"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isRecordingWaveform ? "Pause Voice Waveform" : "Simulate Voice Input"}
          </Button>
        </div>

        <textarea
          placeholder="Type or speak your technical answer..."
          value={candidateAnswer}
          onChange={(e) => setCandidateAnswer(e.target.value)}
          rows={5}
          className="w-full bg-surface-raised border border-border rounded-xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400/50 transition-colors"
        />

        <div className="flex justify-end pt-2">
          <Button
            variant="teal-cyan"
            size="md"
            onClick={handleNextQuestion}
            isLoading={submittingAnswer}
            disabled={!candidateAnswer.trim()}
            className="gap-2 text-xs font-semibold shadow-glow"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Next Question <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Finish & Evaluate Interview
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* CONFIRM CANCEL MODAL */}
      <Dialog
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Mock Interview Session?"
        description="Discard active interview assessment room."
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-text-primary space-y-1">
            <p className="font-semibold text-danger flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              Cancel this attempt?
            </p>
            <p className="leading-relaxed">
              Your progress will not be saved. This attempt will not count towards your score, streak, leaderboard, or session history.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>
              Keep Going
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel} isLoading={isCancelling}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
