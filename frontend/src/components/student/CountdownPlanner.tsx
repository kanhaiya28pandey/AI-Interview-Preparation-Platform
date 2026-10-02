import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Progress } from "@/components/ui/Progress";
import { Calendar, CheckSquare, Sparkles, Building2, Clock, Award, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

import amazonLogo from "@/assets/logos/amazon.svg";
import atlassianLogo from "@/assets/logos/atlassian.svg";
import flipkartLogo from "@/assets/logos/flipkart.svg";
import googleLogo from "@/assets/logos/google.svg";
import microsoftLogo from "@/assets/logos/microsoft.svg";
import oracleLogo from "@/assets/logos/oracle.svg";
import zomatoLogo from "@/assets/logos/zomato.svg";

interface Company {
  id: string;
  name: string;
  logo: string;
}

const COMPANIES: Company[] = [
  { id: "amazon", name: "Amazon", logo: amazonLogo },
  { id: "google", name: "Google", logo: googleLogo },
  { id: "microsoft", name: "Microsoft", logo: microsoftLogo },
  { id: "atlassian", name: "Atlassian", logo: atlassianLogo },
  { id: "flipkart", name: "Flipkart", logo: flipkartLogo },
  { id: "oracle", name: "Oracle", logo: oracleLogo },
  { id: "zomato", name: "Zomato", logo: zomatoLogo },
];

import { isDemoUser, scopedKey } from "@/lib/userScope";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY_BASE = "ai_prep_target_planner";

interface PlannerData {
  companyId: string;
  targetDate: string; // ISO date format YYYY-MM-DD
  checklist: { [key: string]: boolean };
  lastCheckedDate: string; // YYYY-MM-DD to reset daily
}

export const CountdownPlanner: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.userId;
  const storageKey = scopedKey(STORAGE_KEY_BASE, userId);

  const [planner, setPlanner] = useState<PlannerData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const today = new Date().toISOString().split("T")[0];
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reset checklist if it's a new day
        if (parsed.lastCheckedDate !== today) {
          return {
            ...parsed,
            checklist: { coding: false, quiz: false, mock: false },
            lastCheckedDate: today,
          };
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    const defaultTarget = new Date();
    defaultTarget.setDate(defaultTarget.getDate() + 30); // 30 days from now
    return {
      companyId: "amazon",
      targetDate: defaultTarget.toISOString().split("T")[0],
      checklist: { coding: false, quiz: false, mock: false },
      lastCheckedDate: new Date().toISOString().split("T")[0],
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(planner));
    } catch (e) {
      console.error(e);
    }
  }, [planner, storageKey]);

  const selectedCompany = COMPANIES.find((c) => c.id === planner.companyId) || COMPANIES[0];

  const calculateDaysLeft = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(planner.targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft();

  const dailyTasks = [
    { id: "coding", title: "1 Coding Arena challenge", subtitle: "LeetCode medium / hard DSA problem" },
    { id: "quiz", title: "1 MCQ Technical Quiz", subtitle: "Domain specific technical concepts" },
    { id: "mock", title: "1 AI Mock Interview round", subtitle: "Speech + behavioral response feedback" },
  ];

  const checkedCount = Object.values(planner.checklist).filter(Boolean).length;
  const totalTasks = dailyTasks.length;
  const progressPercent = Math.round((checkedCount / totalTasks) * 100);

  const toggleTask = (taskId: string) => {
    const nextChecklist = {
      ...planner.checklist,
      [taskId]: !planner.checklist[taskId],
    };
    const nextCheckedCount = Object.values(nextChecklist).filter(Boolean).length;

    setPlanner((prev) => ({
      ...prev,
      checklist: nextChecklist,
    }));

    if (nextCheckedCount === totalTasks && checkedCount !== totalTasks) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(`🎉 Today's preparation goal for ${selectedCompany.name} is complete!`);
    }
  };

  return (
    <>
      <Card className="p-6 bg-surface border-border space-y-4">
        {/* Header with Target Company & Config button */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border p-1.5 flex items-center justify-center shrink-0">
              <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider block">
                Target Target Drive
              </span>
              <h3 className="font-serif text-lg font-bold text-text-primary flex items-center gap-2">
                {selectedCompany.name} Recruitment Drive
              </h3>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-mono gap-1"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Change Goal</span>
          </Button>
        </div>

        {/* Countdown Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-surface-raised border border-border rounded-xl gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-text-muted font-mono block">Countdown to Interview</span>
              <span className="text-xl font-bold font-mono text-text-primary">
                {daysLeft} {daysLeft === 1 ? "Day" : "Days"} Remaining
              </span>
            </div>
          </div>

          <div className="w-full sm:w-48 space-y-1 text-right">
            <div className="flex justify-between text-[11px] font-mono text-text-muted">
              <span>Today's Plan</span>
              <span className="text-cyan-400 font-bold">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>
        </div>

        {/* Daily Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span className="uppercase text-[10px] tracking-wider font-semibold">Today's Micro-Goals</span>
            <span>{checkedCount} / {totalTasks} Completed</span>
          </div>

          <div className="space-y-2">
            {dailyTasks.map((task) => {
              const isDone = !!planner.checklist[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isDone
                      ? "bg-cyan-500/10 border-cyan-500/30 text-text-primary"
                      : "bg-surface-raised/40 border-border hover:bg-surface-raised hover:border-cyan-400/30"
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    isDone ? "bg-cyan-400 text-black" : "border border-text-muted text-transparent"
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium transition-all ${isDone ? "line-through text-text-muted" : "text-text-primary"}`}>
                      {task.title}
                    </p>
                    <p className="text-[10px] text-text-muted truncate">{task.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Target Config Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Target Company & Date"
        description="Pick your dream target company and interview timeline"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="space-y-2">
            <label className="text-xs font-mono text-text-secondary uppercase">Select Target Company</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMPANIES.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => setPlanner((prev) => ({ ...prev, companyId: comp.id }))}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    planner.companyId === comp.id
                      ? "bg-cyan-400/15 border-cyan-400 text-cyan-400 font-bold shadow-sm"
                      : "bg-surface-raised border-border text-text-secondary hover:border-cyan-400/30"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-medium">{comp.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-secondary uppercase">Target Interview Date</label>
            <input
              type="date"
              value={planner.targetDate}
              onChange={(e) => setPlanner((prev) => ({ ...prev, targetDate: e.target.value }))}
              className="w-full p-2.5 bg-surface-raised border border-border rounded-xl text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsModalOpen(false);
              toast.success("Target company and date updated!");
            }}
            className="w-full mt-2"
          >
            Save Target Goal
          </Button>
        </div>
      </Dialog>
    </>
  );
};
