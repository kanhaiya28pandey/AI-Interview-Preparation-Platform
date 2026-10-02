import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Sparkles, CheckCircle2, Circle, ArrowRight, Calendar, BookOpen, Code2, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface TaskItem {
  id: string;
  day: number;
  title: string;
  topic: string;
  type: "Coding" | "Quiz" | "Practice";
  link: string;
  completed: boolean;
}

export const StudyPlanWidget: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: "sp-1", day: 1, title: "Solve Two Sum & Hash Map problems", topic: "Arrays & Hashing", type: "Coding", link: "/coding", completed: true },
    { id: "sp-2", day: 2, title: "Take DBMS SQL Joins Quiz", topic: "DBMS", type: "Quiz", link: "/quizzes", completed: true },
    { id: "sp-3", day: 3, title: "Review Operating Systems Process Scheduling", topic: "OS", type: "Practice", link: "/practice", completed: false },
    { id: "sp-4", day: 4, title: "Solve Binary Tree Inorder Traversal", topic: "Trees", type: "Coding", link: "/coding", completed: false },
    { id: "sp-5", day: 5, title: "Take Web Development REST API Quiz", topic: "Web Dev", type: "Quiz", link: "/quizzes", completed: false },
  ]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = !t.completed;
          if (updated) toast.success(`Completed Task: ${t.title}`);
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  return (
    <Card className="p-6 bg-surface border-border space-y-4 shadow-soft">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-text-primary">AI 30-Day Placement Study Plan</h3>
            <p className="text-[11px] text-text-muted font-mono">Personalized day-by-day roadmap targeting weak domains.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400 font-bold">{progressPercent}% Done</span>
        </div>
      </div>

      <Progress value={progressPercent} color="accent" className="h-2" />

      <div className="space-y-2.5">
        {tasks.map((task) => {
          const Icon = task.type === "Coding" ? Code2 : task.type === "Quiz" ? HelpCircle : BookOpen;

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                task.completed
                  ? "bg-live/10 border-live/30 text-text-muted line-through"
                  : "bg-surface-raised border-border text-text-primary hover:border-cyan-400/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <button type="button" className="p-0.5">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-live" />
                  ) : (
                    <Circle className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <span className="font-mono text-cyan-400 text-[10px]">Day {task.day}:</span>
                    <span>{task.title}</span>
                  </div>
                  <div className="text-[10px] text-text-muted font-mono flex items-center gap-2 mt-0.5">
                    <span>{task.topic}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-text-secondary">
                      <Icon className="w-3 h-3 text-cyan-400" /> {task.type}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(task.link);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] p-1 h-auto"
              >
                Go <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
