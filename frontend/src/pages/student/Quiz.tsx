import React, { useState, useEffect } from "react";
import { quizService } from "@/services/quizService";
import { QuizTopic, QuizQuestion } from "@/mocks/quizData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { TaxonomySelect, TaxonomySelectOption } from "@/components/ui/TaxonomySelect";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, X, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";

export const Quiz: React.FC = () => {
  const { domains, getTopicsForDomain, normalizeDomain } = useTaxonomy();
  const [topics, setTopics] = useState<QuizTopic[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [selectedTopic, setSelectedTopic] = useState("ALL");

  const [activeTopic, setActiveTopic] = useState<QuizTopic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    quizService.getQuizTopics().then((data) => {
      setTopics(data);
      setLoading(false);
    });
  }, []);

  // Handle browser tab exit / back button warning when quiz is active
  useEffect(() => {
    if (!activeTopic || quizFinished) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your quiz attempt will be cancelled.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeTopic, quizFinished]);

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

  const filteredTopics = topics.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);

    const tDomainSlug = (t as any).domainSlug || normalizeDomain(t.category);
    const matchesDomain =
      selectedDomain === "ALL" ||
      tDomainSlug === selectedDomain ||
      t.category.toLowerCase() === selectedDomain.toLowerCase() ||
      domains.find((d) => d.slug === selectedDomain)?.name.toLowerCase() === t.category.toLowerCase();

    const matchesTopic =
      selectedTopic === "ALL" ||
      t.title.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      t.description.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      t.category.toLowerCase().includes(selectedTopic.toLowerCase());

    return matchesSearch && matchesDomain && matchesTopic;
  });

  const startQuiz = async (topic: QuizTopic) => {
    setActiveTopic(topic);
    setLoading(true);
    const qData = await quizService.getQuestionsByTopic(topic.id);
    setQuestions(qData);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setQuizFinished(false);
    setLoading(false);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await fetch(`/api/v1/quiz/sessions/quiz-session-${Date.now()}/cancel`, { method: "POST" }).catch(() => {});
      toast.info("Quiz attempt cancelled. Progress was not saved.");
      setActiveTopic(null);
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const calculateScore = () => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx]?.correctIndex) score++;
    });
    return score;
  };

  if (loading && !activeTopic) return <CardSkeleton />;

  // TOPIC SELECT VIEW
  if (!activeTopic) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="font-serif text-3xl font-medium text-text-primary">MCQ Practice Quizzes</h2>
          <p className="text-xs text-text-secondary">
            Quick 15-minute conceptual tests to evaluate multi-domain CS and engineering mastery.
          </p>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 bg-surface border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search quizzes by title or topic..."
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
                placeholder="Filter by Domain"
                ariaLabel="Filter quizzes by domain"
              />
            </div>

            <div>
              <TaxonomySelect
                options={topicOptions}
                value={selectedTopic}
                onChange={(val) => setSelectedTopic(val)}
                placeholder="Filter by Topic"
                ariaLabel="Filter quizzes by topic"
                grouped={selectedDomain === "ALL"}
              />
            </div>
          </div>
        </Card>

        {filteredTopics.length === 0 ? (
          <EmptyState
            title="No quizzes match your filters"
            description="Try selecting a different domain or clearing your search query."
            actionText="Reset Filters"
            onAction={() => {
              setSearch("");
              setSelectedDomain("ALL");
              setSelectedTopic("ALL");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTopics.map((t) => (
              <Card
                key={t.id}
                className="p-6 space-y-4 hover:border-cyan-400/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-surface-raised border border-border rounded-xl text-cyan-400 inline-block">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <Badge variant="accent" className="font-mono text-[10px]">
                      {t.category}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-text-primary">{t.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-xs font-mono text-text-muted">
                    <span>{t.questionCount} Questions</span>
                    <span>⏱ {t.timeLimitMinutes} Mins</span>
                  </div>
                  <Button variant="primary" size="sm" className="w-full" onClick={() => startQuiz(t)}>
                    Start Quiz <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // QUIZ RESULT VIEW
  if (quizFinished) {
    const finalScore = calculateScore();
    const percent = Math.round((finalScore / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Card className="p-8 text-center space-y-6 bg-surface border-border">
          <div className="p-4 bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 rounded-full inline-block">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <VerdictHeadline prefix="Your Score is " score={percent} size="xl" />
            <p className="text-sm text-text-secondary">{activeTopic.title}</p>
          </div>

          <div className="py-4 border-y border-border flex justify-around font-mono">
            <div>
              <span className="text-xs text-text-muted uppercase block">Score</span>
              <span className="text-3xl font-serif font-bold text-cyan-400">{finalScore} / {questions.length}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase block">Percentage</span>
              <span className="text-3xl font-serif font-bold text-live">{percent}%</span>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4 text-left pt-4">
            <h3 className="font-serif text-lg font-medium text-text-primary">Question Explanations</h3>
            {questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctIndex;
              return (
                <div key={q.id} className="p-4 bg-surface-raised border border-border rounded-xl space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-text-primary">{idx + 1}. {q.question}</span>
                    {isCorrect ? (
                      <Badge variant="active">Correct</Badge>
                    ) : (
                      <Badge variant="blocked">Incorrect</Badge>
                    )}
                  </div>
                  <p className="text-text-muted font-mono"><strong className="text-cyan-400">Answer:</strong> {q.options[q.correctIndex]}</p>
                  <p className="text-text-secondary font-sans leading-relaxed">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <Button variant="primary" size="md" onClick={() => setActiveTopic(null)}>
            <RotateCcw className="w-4 h-4" /> Try Another Quiz
          </Button>
        </Card>
      </div>
    );
  }

  // ACTIVE QUIZ FLOW
  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center text-xs font-mono text-text-muted">
        <span>{activeTopic.title}</span>
        <div className="flex items-center gap-3">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          {/* Outlined Red Cancel Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-danger border-danger/40 hover:bg-danger/10 text-xs px-2.5 py-1"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        </div>
      </div>

      <Progress value={((currentIndex + 1) / questions.length) * 100} color="accent" />

      <Card className="p-6 space-y-6 bg-surface border-border">
        <h3 className="font-serif text-xl font-medium text-text-primary">{currentQ.question}</h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full p-4 rounded-xl text-left text-sm font-sans border transition-all flex items-center justify-between ${
                selectedOption === idx
                  ? "bg-cyan-400/15 border-cyan-400 text-cyan-400 font-medium"
                  : "bg-surface-raised border-border text-text-primary hover:border-border-strong"
              }`}
            >
              <span>{option}</span>
              <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center font-mono text-xs">
                {String.fromCharCode(65 + idx)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="primary" size="md" onClick={handleNext} disabled={selectedOption === null}>
            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </div>
      </Card>

      {/* CONFIRM CANCEL MODAL */}
      <Dialog
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Quiz Attempt?"
        description="Discard practice quiz progress."
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-text-primary space-y-1">
            <p className="font-semibold text-danger flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              Cancel this attempt?
            </p>
            <p className="leading-relaxed">
              Your progress will not be saved. This attempt will not count towards your score, streak, or history.
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
