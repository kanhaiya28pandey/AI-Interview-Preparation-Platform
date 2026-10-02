import React, { useState, useEffect } from "react";
import { interviewService } from "@/services/interviewService";
import { InterviewRole, InterviewQuestion, InterviewFeedback } from "@/mocks/interviewData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { TaxonomySelect, TaxonomySelectOption } from "@/components/ui/TaxonomySelect";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Video, Mic, Clock, Sparkles, CheckCircle2, ArrowRight, Award, AlertCircle, RefreshCw, Volume2, Search } from "lucide-react";
import { formatTime } from "@/lib/utils";

export const MockInterview: React.FC = () => {
  const { domains, getTopicsForDomain, normalizeDomain } = useTaxonomy();
  const [roles, setRoles] = useState<InterviewRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

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

  // Feedback State
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

  // SCREEN 1: Role Selection
  if (flowState === "select") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary flex items-center gap-2">
            <Video className="w-6 h-6 text-cyan-400" /> AI Mock Interview Rooms
          </h2>
          <p className="text-xs text-text-secondary">
            Select your target engineering domain and role for a simulated technical placement round.
          </p>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 bg-surface border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search roles..."
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
                <option value="ALL">All Interview Types</option>
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Product">Product</option>
              </select>
            </div>
          </div>
        </Card>

        {filteredRoles.length === 0 ? (
          <EmptyState
            title="No mock interview roles match your filters"
            description="Try selecting a different domain, difficulty level, or interview type."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRoles.map((role) => (
              <Card
                key={role.id}
                className="p-6 space-y-4 hover:border-cyan-400/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-surface-raised border border-border rounded-xl text-cyan-400">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="accent" className="text-[10px]">
                        {role.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {role.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl font-medium text-text-primary">
                      {role.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-text-muted pt-1">
                    <span>⏱ {role.durationMinutes} mins</span>
                    <span>❓ {role.totalQuestions} Questions</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-4"
                  onClick={() => startInterviewRoom(role)}
                >
                  <span>Enter Interview Room</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // SCREEN 2: Active Interview Room
  if (flowState === "interview" && activeRole && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    return (
      <div className="max-w-4xl mx-auto space-y-6 relative">
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

          <div className="flex items-center gap-2 font-mono text-sm px-3.5 py-1.5 bg-surface-raised border border-border rounded-lg text-cyan-400 font-semibold">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timerSeconds)}</span>
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

          {/* Fake Voice Waveform Bar */}
          {isRecordingWaveform && (
            <div className="flex items-center justify-center gap-1.5 py-3 bg-surface-raised border border-border rounded-lg">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{ height: `${Math.floor(Math.random() * 24) + 6}px`, animationDelay: `${i * 0.05}s` }}
                />
              ))}
              <span className="text-xs font-mono text-cyan-400 ml-3">Listening to response...</span>
            </div>
          )}

          <textarea
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            placeholder="Type your candidate response here or click 'Simulate Voice Input'..."
            className="w-full h-44 p-4 bg-surface-raised border border-border rounded-xl text-text-primary placeholder:text-text-muted font-mono text-xs leading-relaxed focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none transition-all duration-200"
          />

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCandidateAnswer(
                  "I would structure the solution by isolating the main execution thread, utilizing useTransition in React 19 to keep micro-interactions responsive..."
                )
              }
            >
              Auto-fill sample response
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleNextQuestion}
              isLoading={submittingAnswer}
              disabled={candidateAnswer.trim().length === 0}
            >
              {currentQuestionIndex < questions.length - 1 ? "Submit & Next Round" : "Submit & Finish (Get Scorecard)"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // SCREEN 3: Feedback Summary Scorecard
  if (flowState === "feedback" && feedback) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="p-4 bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 rounded-full inline-block">
            <Award className="w-10 h-10" />
          </div>
          <VerdictHeadline prefix="Your Interview was " score={feedback.overallScore} size="xl" />
          <p className="text-sm text-text-secondary">{feedback.roleTitle} &bull; {feedback.date}</p>
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-5 text-center space-y-1 bg-surface border-cyan-400/50 shadow-soft">
            <span className="text-xs font-mono text-text-muted uppercase">Overall Score</span>
            <div className="font-serif text-4xl font-bold text-cyan-400">{feedback.overallScore}%</div>
          </Card>
          <Card className="p-5 text-center space-y-1">
            <span className="text-xs font-mono text-text-muted uppercase">Tech Accuracy</span>
            <div className="font-serif text-3xl font-semibold text-live">{feedback.scores.technicalAccuracy}%</div>
          </Card>
          <Card className="p-5 text-center space-y-1">
            <span className="text-xs font-mono text-text-muted uppercase">Communication</span>
            <div className="font-serif text-3xl font-semibold text-text-primary">{feedback.scores.communicationClarity}%</div>
          </Card>
          <Card className="p-5 text-center space-y-1">
            <span className="text-xs font-mono text-text-muted uppercase">Problem Solving</span>
            <div className="font-serif text-3xl font-semibold text-text-primary">{feedback.scores.problemSolving}%</div>
          </Card>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 bg-surface border-border">
            <h3 className="font-serif text-lg font-medium text-live flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> What Landed Well
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary list-disc list-inside font-sans">
              {feedback.strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 space-y-3 bg-surface border-border">
            <h3 className="font-serif text-lg font-medium text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> What to Tighten
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary list-disc list-inside font-sans">
              {feedback.areasForImprovement.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="primary" size="md" onClick={() => setFlowState("select")}>
            <RefreshCw className="w-4 h-4" /> Practice Another Domain
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
