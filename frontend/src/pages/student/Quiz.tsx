import React, { useState, useEffect } from "react";
import { quizService } from "@/services/quizService";
import { QuizTopic, QuizQuestion } from "@/mocks/quizData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from "lucide-react";

export const Quiz: React.FC = () => {
  const [topics, setTopics] = useState<QuizTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTopic, setActiveTopic] = useState<QuizTopic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    quizService.getQuizTopics().then((data) => {
      setTopics(data);
      setLoading(false);
    });
  }, []);

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

  const calculateScore = () => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx]?.correctIndex) score++;
    });
    return score;
  };

  if (loading) return <CardSkeleton />;

  // TOPIC SELECT VIEW
  if (!activeTopic) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">MCQ Quizzes</h2>
          <p className="text-xs text-text-secondary">Quick 10-minute multiple choice tests to evaluate core CS concepts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topics.map((t) => (
            <Card key={t.id} className="p-6 space-y-4 hover:border-cyan-400/50 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-2.5 bg-surface-raised border border-border rounded-xl text-cyan-400 inline-block">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">{t.title}</h3>
                <p className="text-xs text-text-secondary">{t.description}</p>
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
      </div>
    );
  }

  // QUIZ RESULT VIEW
  if (quizFinished) {
    const finalScore = calculateScore();
    const percent = Math.round((finalScore / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center text-xs font-mono text-text-muted">
        <span>{activeTopic.title}</span>
        <span>Question {currentIndex + 1} of {questions.length}</span>
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
    </div>
  );
};
