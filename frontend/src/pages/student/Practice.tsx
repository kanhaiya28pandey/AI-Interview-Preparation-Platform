import React, { useState, useEffect } from "react";
import { practiceService } from "@/services/practiceService";
import { PracticeTopic, PracticeQuestion } from "@/mocks/practiceData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Dialog } from "@/components/ui/Dialog";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { Search, BookOpen, Layers, Coffee, Users, Code, Database, Cloud, ChevronRight, CheckCircle2 } from "lucide-react";

export const Practice: React.FC = () => {
  const [topics, setTopics] = useState<PracticeTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");

  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null);
  const [topicQuestions, setTopicQuestions] = useState<PracticeQuestion[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    practiceService.getTopics().then((data) => {
      setTopics(data);
      setLoading(false);
    });
  }, []);

  const openTopicModal = async (topic: PracticeTopic) => {
    setSelectedTopic(topic);
    setModalLoading(true);
    const questions = await practiceService.getQuestionsByTopic(topic.id);
    setTopicQuestions(questions);
    setModalLoading(false);
  };

  const filteredTopics = topics.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesDiff = selectedDifficulty === "ALL" || t.difficulty.toUpperCase() === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Layers": return <Layers className="w-5 h-5 text-cyan-400" />;
      case "Coffee": return <Coffee className="w-5 h-5 text-cyan-400" />;
      case "Users": return <Users className="w-5 h-5 text-cyan-400" />;
      case "Code": return <Code className="w-5 h-5 text-cyan-400" />;
      case "Database": return <Database className="w-5 h-5 text-cyan-400" />;
      case "Cloud": return <Cloud className="w-5 h-5 text-cyan-400" />;
      default: return <BookOpen className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">Practice Tracks</h2>
          <p className="text-xs text-text-secondary">Master technical domains through structured question banks and AI hints.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search tracks or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex bg-surface-raised border border-border p-1 rounded-lg text-xs font-mono overflow-x-auto shrink-0">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded transition-colors shrink-0 ${
                  selectedDifficulty === diff ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-[#0d1321] font-semibold" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredTopics.length === 0 ? (
        <EmptyState
          title="No tracks found"
          description="Try clearing your search query or selecting a different difficulty filter."
          actionText="Clear Filters"
          onAction={() => { setSearch(""); setSelectedDifficulty("ALL"); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-colors group space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-surface-raised border border-border rounded-xl">
                    {renderIcon(topic.icon)}
                  </div>
                  <Badge variant={topic.difficulty.toLowerCase() as any}>
                    {topic.difficulty}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-medium text-text-primary group-hover:text-cyan-400 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{topic.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topic.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono bg-surface-raised border border-border text-text-muted px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-xs font-mono text-text-muted">
                  <span>Progress</span>
                  <span>{topic.completedCount} / {topic.questionsCount} Qs</span>
                </div>
                <Progress value={(topic.completedCount / topic.questionsCount) * 100} color="accent" />

                <Button variant="outline" size="sm" className="w-full justify-between" onClick={() => openTopicModal(topic)}>
                  <span>Practice Questions</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <Dialog
          isOpen={!!selectedTopic}
          onClose={() => setSelectedTopic(null)}
          title={selectedTopic.title}
          description={`${selectedTopic.category} Track · ${selectedTopic.questionsCount} Total Questions`}
          maxWidthClass="max-w-3xl"
        >
          <div className="space-y-4">
            {modalLoading ? (
              <div className="py-8 text-center text-xs font-mono text-text-muted">Loading question bank...</div>
            ) : topicQuestions.length === 0 ? (
              <p className="text-sm text-text-secondary py-4 text-center">No questions uploaded for this track yet.</p>
            ) : (
              topicQuestions.map((q) => (
                <div key={q.id} className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-base font-medium text-text-primary">{q.title}</h4>
                    <Badge variant={q.difficulty.toLowerCase() as any}>{q.difficulty}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{q.prompt}</p>

                  <div className="space-y-1.5 bg-surface p-3 rounded-lg border border-border">
                    <span className="text-[11px] font-mono text-accent font-semibold block">Key Architectural Points to Cover:</span>
                    <ul className="text-xs text-text-muted space-y-1 list-disc list-inside font-mono">
                      {q.keyPoints.map((kp, idx) => (
                        <li key={idx}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
};
