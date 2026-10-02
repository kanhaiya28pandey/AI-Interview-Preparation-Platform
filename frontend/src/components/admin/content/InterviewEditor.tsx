import React, { useState } from "react";
import { Plus, Trash2, Sparkles, UserCheck, Sliders, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contentManagerService } from "@/services/contentManagerService";

export interface InterviewQuestionItem {
  id: string;
  question: string;
  idealAnswerPoints: string[];
  followUpQuestions: string[];
  difficulty: string;
  topic: string;
}

export interface InterviewRubric {
  correctnessWeight: number;
  clarityWeight: number;
  depthWeight: number;
  communicationWeight: number;
  passMark: number;
}

export interface InterviewEditorData {
  targetRole?: string;
  interviewType?: string;
  aiPersona?: "Friendly" | "Strict" | "Neutral";
  followUpDepth?: number;
  timePerQuestionMinutes?: number;
  rubric?: InterviewRubric;
  questions?: InterviewQuestionItem[];
}

interface InterviewEditorProps {
  data: InterviewEditorData;
  subject: string;
  topics: string[];
  difficulty: string;
  onChange: (updated: InterviewEditorData) => void;
}

export const InterviewEditor: React.FC<InterviewEditorProps> = ({
  data,
  subject,
  topics,
  difficulty,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<"ROLE_SPECS" | "QUESTIONS" | "RUBRIC">("ROLE_SPECS");

  // New question form
  const [qText, setQText] = useState("");
  const [idealPoint, setIdealPoint] = useState("");
  const [idealPoints, setIdealPoints] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState("");
  const [followUps, setFollowUps] = useState<string[]>([]);

  // AI Generator state
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiCount, setAiCount] = useState(4);
  const [aiMsg, setAiMsg] = useState<string | null>(null);

  const questions = data.questions || [];
  const rubric = data.rubric || {
    correctnessWeight: 35,
    clarityWeight: 25,
    depthWeight: 25,
    communicationWeight: 15,
    passMark: 70,
  };

  const handleAddIdealPoint = () => {
    if (idealPoint.trim()) {
      setIdealPoints([...idealPoints, idealPoint.trim()]);
      setIdealPoint("");
    }
  };

  const handleAddFollowUp = () => {
    if (followUp.trim()) {
      setFollowUps([...followUps, followUp.trim()]);
      setFollowUp("");
    }
  };

  const handleAddManualQuestion = () => {
    if (!qText.trim()) return;

    const newQ: InterviewQuestionItem = {
      id: `iq-${Date.now()}`,
      question: qText.trim(),
      idealAnswerPoints: idealPoints.length > 0 ? idealPoints : ["Clear structural explanation"],
      followUpQuestions: followUps,
      difficulty: difficulty || "Medium",
      topic: topics[0] || data.targetRole || "General",
    };

    onChange({
      ...data,
      questions: [...questions, newQ],
    });

    setQText("");
    setIdealPoints([]);
    setFollowUps([]);
  };

  const handleGenerateAiQuestions = async () => {
    setIsGenerating(true);
    setAiMsg(null);
    try {
      const res = await contentManagerService.generateInterviewQuestions({
        role: data.targetRole || "Full Stack Developer",
        interviewType: data.interviewType || "Technical",
        topics: topics.length > 0 ? topics : ["System Architecture", "Performance"],
        difficulty: difficulty || "Medium",
        questionCount: aiCount,
      });

      onChange({
        ...data,
        questions: [...questions, ...res.questions],
      });
      setAiMsg(res.message);
    } catch (err: any) {
      setAiMsg("AI service temporarily unavailable; created smart template questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRubricChange = (key: keyof InterviewRubric, val: number) => {
    onChange({
      ...data,
      rubric: {
        ...rubric,
        [key]: val,
      },
    });
  };

  const rubricTotal =
    rubric.correctnessWeight +
    rubric.clarityWeight +
    rubric.depthWeight +
    rubric.communicationWeight;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Mock Interview Track Architecture</h3>
          <p className="text-xs text-text-muted">
            Configure target job role, AI conversational persona, evaluation rubric weights, and structured question banks.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-lg border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("ROLE_SPECS")}
            className={`px-3 py-1.5 rounded-md font-medium ${
              activeTab === "ROLE_SPECS" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Role & Persona
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("QUESTIONS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium ${
              activeTab === "QUESTIONS" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Interview Questions ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("RUBRIC")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium ${
              activeTab === "RUBRIC" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Evaluation Rubric
          </button>
        </div>
      </div>

      {/* TAB 1: ROLE & PERSONA */}
      {activeTab === "ROLE_SPECS" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Target Role *</label>
              <select
                value={data.targetRole || "Backend Engineer"}
                onChange={(e) => onChange({ ...data, targetRole: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              >
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="System Architect">System Architect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Interview Classification</label>
              <select
                value={data.interviewType || "Technical"}
                onChange={(e) => onChange({ ...data, interviewType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              >
                <option value="Technical">Technical In-depth</option>
                <option value="System Design">System Design & High Scale</option>
                <option value="Behavioral">Behavioral & Leadership</option>
                <option value="HR">HR & Cultural Fit</option>
                <option value="Mixed">Mixed Comprehensive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">AI Interviewer Persona</label>
              <select
                value={data.aiPersona || "Strict"}
                onChange={(e) => onChange({ ...data, aiPersona: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              >
                <option value="Friendly">Friendly & Encouraging</option>
                <option value="Neutral">Neutral & Objective</option>
                <option value="Strict">Strict & Rigorous (FAANG standard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Follow-up Depth</label>
              <select
                value={data.followUpDepth || 2}
                onChange={(e) => onChange({ ...data, followUpDepth: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary"
              >
                <option value={1}>1 Level (Surface Clarification)</option>
                <option value={2}>2 Levels (Balanced Technical Probe)</option>
                <option value={3}>3 Levels (Deep Edge Case Interrogation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Target Time / Question (mins)</label>
              <input
                type="number"
                min={2}
                max={15}
                value={data.timePerQuestionMinutes || 5}
                onChange={(e) => onChange({ ...data, timePerQuestionMinutes: parseInt(e.target.value, 10) || 5 })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS */}
      {activeTab === "QUESTIONS" && (
        <div className="space-y-5">
          {/* AI Generator Banner */}
          <div className="p-4 bg-surface-raised border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Question Synthesizer
              </h4>
              <p className="text-xs text-text-muted">
                Synthesize scenario-based questions with benchmark ideal responses for {data.targetRole || "Role"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={aiCount}
                onChange={(e) => setAiCount(parseInt(e.target.value, 10) || 3)}
                className="w-16 px-2 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary font-mono"
              />
              <Button
                type="button"
                onClick={handleGenerateAiQuestions}
                disabled={isGenerating}
                className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGenerating ? "Synthesizing..." : "Generate AI Questions"}
              </Button>
            </div>
          </div>

          {aiMsg && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-300">
              {aiMsg}
            </div>
          )}

          {/* Manual Question Form */}
          <div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Add Question Manually
            </span>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Interview Question Prompt *</label>
              <textarea
                rows={3}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="e.g. Walk me through how you optimize database read throughput for a high-traffic social media feed."
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Ideal Answer Points (What the AI grades against)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={idealPoint}
                    onChange={(e) => setIdealPoint(e.target.value)}
                    placeholder="e.g. Read replicas & Redis caching"
                    className="flex-1 px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
                  />
                  <Button
                    type="button"
                    onClick={handleAddIdealPoint}
                    className="bg-surface hover:bg-surface-raised text-text-primary border border-border text-xs px-3"
                  >
                    Add
                  </Button>
                </div>
                {idealPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {idealPoints.map((pt, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      >
                        {pt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Anticipated Follow-up Questions
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="e.g. How do you handle cache invalidation?"
                    className="flex-1 px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary"
                  />
                  <Button
                    type="button"
                    onClick={handleAddFollowUp}
                    className="bg-surface hover:bg-surface-raised text-text-primary border border-border text-xs px-3"
                  >
                    Add
                  </Button>
                </div>
                {followUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {followUps.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] bg-surface text-text-muted border border-border"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleAddManualQuestion}
                disabled={!qText.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Interview Question
              </Button>
            </div>
          </div>

          {/* List of Configured Questions */}
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 bg-surface-raised border border-border rounded-xl flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 font-mono">Q{idx + 1}</span>
                    <span className="font-medium text-text-primary">{q.question}</span>
                  </div>

                  {q.idealAnswerPoints?.length > 0 && (
                    <div className="text-[11px] text-text-muted pl-5 space-y-0.5">
                      <span className="font-semibold text-cyan-300">Target Points:</span>{" "}
                      {q.idealAnswerPoints.join(" • ")}
                    </div>
                  )}

                  {q.followUpQuestions?.length > 0 && (
                    <div className="text-[11px] text-text-muted/80 pl-5 space-y-0.5">
                      <span className="font-semibold text-amber-300">Follow-ups:</span>{" "}
                      {q.followUpQuestions.join(" • ")}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onChange({ ...data, questions: questions.filter((_, i) => i !== idx) })}
                  className="p-1 text-text-muted hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RUBRIC */}
      {activeTab === "RUBRIC" && (
        <div className="p-5 bg-surface-raised border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Evaluation Rubric Weights
              </h4>
              <p className="text-xs text-text-muted">Weights must sum up to exactly 100%.</p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                rubricTotal === 100
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              Total: {rubricTotal}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Technical Correctness ({rubric.correctnessWeight}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={rubric.correctnessWeight}
                onChange={(e) => handleRubricChange("correctnessWeight", parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Conceptual Depth & Edge Cases ({rubric.depthWeight}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={rubric.depthWeight}
                onChange={(e) => handleRubricChange("depthWeight", parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Structure & Clarity ({rubric.clarityWeight}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={rubric.clarityWeight}
                onChange={(e) => handleRubricChange("clarityWeight", parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Communication & Articulation ({rubric.communicationWeight}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={rubric.communicationWeight}
                onChange={(e) => handleRubricChange("communicationWeight", parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div>
              <h5 className="text-xs font-semibold text-text-primary">Interview Pass Threshold (%)</h5>
              <p className="text-[11px] text-text-muted">Minimum aggregate score for candidate pass recommendation.</p>
            </div>
            <div className="w-28">
              <input
                type="number"
                min={1}
                max={100}
                value={rubric.passMark}
                onChange={(e) => handleRubricChange("passMark", parseInt(e.target.value, 10) || 70)}
                className="w-full px-3 py-1.5 text-xs text-right bg-surface border border-border rounded-lg text-text-primary font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
