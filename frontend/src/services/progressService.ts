import { getScopedItem, setScopedItem } from "@/lib/userScope";

export interface UserPracticeProgress {
  completedQuestions: Record<string, string[]>;
  lastPracticedTopic?: { id: string; title: string; category: string };
}

export interface UserCodingSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  difficulty: string;
  language: string;
  status: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED";
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  xpEarned: number;
  submittedAt: string;
}

export interface UserQuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  category: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  completedAt: string;
}

export interface UserInterviewSession {
  id: string;
  roleId: string;
  roleTitle: string;
  overallScore: number;
  date: string;
  technicalAccuracy: number;
  communicationClarity: number;
  problemSolving: number;
  confidence: number;
}

export interface UserResumeRecord {
  id: string;
  fileName: string;
  targetRole: string;
  atsScore: number;
  analyzedAt: string;
}

export interface UserStatsSnapshot {
  totalPracticeSessions: number;
  codingProblemsSolved: number;
  mockInterviewsCompleted: number;
  quizzesCompleted: number;
  overallRating: number;
  currentStreak: number;
  totalXP: number;
}

const DEMO_PRACTICE_COMPLETED: Record<string, string[]> = {
  "mern-1": ["q-1", "q-mern-1", "q-mern-2", "q-mern-3", "q-mern-4", "q-mern-5", "q-mern-6", "q-mern-7", "q-mern-8"],
  "java-1": ["q-2", "q-java-1", "q-java-2", "q-java-3", "q-java-4", "q-java-5", "q-java-6", "q-java-7", "q-java-8", "q-java-9", "q-java-10", "q-java-11"],
  "behavioral-1": ["q-beh-1", "q-beh-2", "q-beh-3", "q-beh-4", "q-beh-5", "q-beh-6", "q-beh-7", "q-beh-8"],
  "dsa-1": ["q-dsa-1", "q-dsa-2", "q-dsa-3", "q-dsa-4", "q-dsa-5", "q-dsa-6", "q-dsa-7", "q-dsa-8", "q-dsa-9", "q-dsa-10", "q-dsa-11", "q-dsa-12", "q-dsa-13", "q-dsa-14", "q-dsa-15", "q-dsa-16", "q-dsa-17", "q-dsa-18"],
  "db-1": ["q-db-1", "q-db-2", "q-db-3", "q-db-4", "q-db-5"],
  "cloud-1": ["q-cl-1", "q-cl-2", "q-cl-3", "q-cl-4"],
};

export const isDemoUserCheck = (userId?: string | null): boolean => {
  if (!userId) {
    try {
      const isDemoFlag = localStorage.getItem("ai_interview_prep_demo") === "true";
      const rawUser = localStorage.getItem("ai_interview_prep_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        return isDemoFlag || u.userId === "demo-usr-student-01" || u.email?.includes("demo");
      }
      return isDemoFlag;
    } catch {
      return false;
    }
  }
  return userId === "demo-usr-student-01" || userId === "usr-student-01" || userId.includes("demo");
};

export const progressService = {
  // Practice Tracks
  getPracticeProgress(userId?: string | null): UserPracticeProgress {
    const isDemo = isDemoUserCheck(userId);
    const defaultData: UserPracticeProgress = isDemo
      ? { completedQuestions: DEMO_PRACTICE_COMPLETED }
      : { completedQuestions: {} };

    return getScopedItem<UserPracticeProgress>(userId, "practice_progress", defaultData);
  },

  getCompletedQuestionsForTopic(userId: string | null | undefined, topicId: string): string[] {
    const prog = this.getPracticeProgress(userId);
    return prog.completedQuestions[topicId] || [];
  },

  togglePracticeQuestion(userId: string | null | undefined, topicId: string, questionId: string): boolean {
    const prog = this.getPracticeProgress(userId);
    const currentList = prog.completedQuestions[topicId] || [];
    const isCompleted = currentList.includes(questionId);

    const nextList = isCompleted
      ? currentList.filter((id) => id !== questionId)
      : [...currentList, questionId];

    const updatedProg: UserPracticeProgress = {
      ...prog,
      completedQuestions: {
        ...prog.completedQuestions,
        [topicId]: nextList,
      },
    };

    setScopedItem(userId, "practice_progress", updatedProg);

    if (!isCompleted) {
      this.awardXP(userId, 10);
      this.incrementStat(userId, "totalPracticeSessions");
    }

    return !isCompleted;
  },

  getCompletedQuestionsCount(userId?: string | null): number {
    const prog = this.getPracticeProgress(userId);
    return Object.values(prog.completedQuestions).reduce((acc, qIds) => acc + qIds.length, 0);
  },

  getCodingProblemsSolvedCount(userId?: string | null): number {
    const subs = this.getCodingSubmissions(userId);
    const solvedSet = new Set(subs.filter((s) => s.status === "ACCEPTED").map((s) => s.problemId));
    return solvedSet.size;
  },

  // Coding Arena Submissions
  getCodingSubmissions(userId?: string | null): UserCodingSubmission[] {
    const isDemo = isDemoUserCheck(userId);
    const defaultList: UserCodingSubmission[] = isDemo
      ? [
          {
            id: "sub-demo-1",
            problemId: "prob-two-sum",
            problemTitle: "Two Sum Target Indices",
            difficulty: "Easy",
            language: "javascript",
            status: "ACCEPTED",
            passedTests: 4,
            totalTests: 4,
            runtimeMs: 48,
            xpEarned: 50,
            submittedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          },
        ]
      : [];
    return getScopedItem<UserCodingSubmission[]>(userId, "coding_submissions", defaultList);
  },

  recordCodingSubmission(
    userId: string | null | undefined,
    submission: Omit<UserCodingSubmission, "id" | "submittedAt">
  ): UserCodingSubmission {
    const list = this.getCodingSubmissions(userId);
    const newEntry: UserCodingSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    const isFirstSolve =
      submission.status === "ACCEPTED" &&
      !list.some((s) => s.problemId === submission.problemId && s.status === "ACCEPTED");

    const updatedList = [newEntry, ...list];
    setScopedItem(userId, "coding_submissions", updatedList);

    if (isFirstSolve) {
      this.awardXP(userId, submission.xpEarned || 50);
      this.incrementStat(userId, "codingProblemsSolved");
    }

    return newEntry;
  },

  // Quizzes
  getQuizAttempts(userId?: string | null): UserQuizAttempt[] {
    const isDemo = isDemoUserCheck(userId);
    const defaultList: UserQuizAttempt[] = isDemo
      ? [
          {
            id: "quiz-demo-1",
            quizId: "quiz-js",
            quizTitle: "JavaScript Core & Event Loop",
            category: "Frontend",
            score: 90,
            totalQuestions: 10,
            xpEarned: 90,
            completedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
          },
        ]
      : [];
    return getScopedItem<UserQuizAttempt[]>(userId, "quiz_attempts", defaultList);
  },

  recordQuizAttempt(
    userId: string | null | undefined,
    attempt: Omit<UserQuizAttempt, "id" | "completedAt">
  ): UserQuizAttempt {
    const list = this.getQuizAttempts(userId);
    const newEntry: UserQuizAttempt = {
      ...attempt,
      id: `quiz-att-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };

    const updatedList = [newEntry, ...list];
    setScopedItem(userId, "quiz_attempts", updatedList);

    this.awardXP(userId, attempt.xpEarned || 50);
    this.incrementStat(userId, "quizzesCompleted");

    return newEntry;
  },

  // Mock Interviews
  getInterviewSessions(userId?: string | null): UserInterviewSession[] {
    const isDemo = isDemoUserCheck(userId);
    const defaultList: UserInterviewSession[] = isDemo
      ? [
          {
            id: "mock-demo-1",
            roleId: "frontend-dev",
            roleTitle: "Frontend Engineer (React / TypeScript)",
            overallScore: 88,
            date: new Date(Date.now() - 3600 * 1000 * 24).toLocaleDateString(),
            technicalAccuracy: 90,
            communicationClarity: 86,
            problemSolving: 88,
            confidence: 85,
          },
        ]
      : [];
    return getScopedItem<UserInterviewSession[]>(userId, "interview_sessions", defaultList);
  },

  recordInterviewSession(
    userId: string | null | undefined,
    session: Omit<UserInterviewSession, "id" | "date">
  ): UserInterviewSession {
    const list = this.getInterviewSessions(userId);
    const newEntry: UserInterviewSession = {
      ...session,
      id: `mock-sess-${Date.now()}`,
      date: new Date().toLocaleDateString(),
    };

    const updatedList = [newEntry, ...list];
    setScopedItem(userId, "interview_sessions", updatedList);

    this.awardXP(userId, 100);
    this.incrementStat(userId, "mockInterviewsCompleted");

    // Recalculate average interview rating
    const totalScore = updatedList.reduce((acc, s) => acc + s.overallScore, 0);
    const avgScore = Math.round(totalScore / updatedList.length);
    this.updateStatValue(userId, "overallRating", avgScore);

    return newEntry;
  },

  // Resume Analyzer
  getResumeAnalyses(userId?: string | null): UserResumeRecord[] {
    const isDemo = isDemoUserCheck(userId);
    const defaultList: UserResumeRecord[] = isDemo
      ? [
          {
            id: "res-demo-1",
            fileName: "Resume_Kanhaiya_Pandey.pdf",
            targetRole: "Full Stack Engineer",
            atsScore: 88,
            analyzedAt: "Yesterday",
          },
        ]
      : [];
    return getScopedItem<UserResumeRecord[]>(userId, "resume_analyses", defaultList);
  },

  recordResumeAnalysis(
    userId: string | null | undefined,
    record: Omit<UserResumeRecord, "id" | "analyzedAt">
  ): UserResumeRecord {
    const list = this.getResumeAnalyses(userId);
    const newEntry: UserResumeRecord = {
      ...record,
      id: `res-rec-${Date.now()}`,
      analyzedAt: "Just now",
    };

    const updatedList = [newEntry, ...list];
    setScopedItem(userId, "resume_analyses", updatedList);

    this.awardXP(userId, 25);
    return newEntry;
  },

  // Global XP & Stats Synchronization
  awardXP(userId: string | null | undefined, amount: number): number {
    const isDemo = isDemoUserCheck(userId);
    const currentXP = getScopedItem<number>(userId, "user_xp", isDemo ? 2240 : 0);
    const nextXP = currentXP + amount;
    setScopedItem(userId, "user_xp", nextXP);

    // Sync to user profile stats
    this.updateStatValue(userId, "totalXP", nextXP);
    this.touchStreak(userId);

    return nextXP;
  },

  touchStreak(userId: string | null | undefined): number {
    const isDemo = isDemoUserCheck(userId);
    const lastActive = getScopedItem<string | null>(userId, "user_last_active_date", null);
    const currentStreak = getScopedItem<number>(userId, "user_streak", isDemo ? 12 : 0);

    const todayStr = new Date().toISOString().split("T")[0];
    if (lastActive === todayStr) {
      return currentStreak || 1;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const nextStreak = lastActive === yesterdayStr ? (currentStreak || 0) + 1 : 1;
    setScopedItem(userId, "user_last_active_date", todayStr);
    setScopedItem(userId, "user_streak", nextStreak);

    this.updateStatValue(userId, "currentStreak", nextStreak);
    return nextStreak;
  },

  incrementStat(userId: string | null | undefined, statKey: keyof UserStatsSnapshot): void {
    if (!userId) return;
    try {
      const userKey = `ai_interview_prep_profile_${userId}`;
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.stats) parsed.stats = {};
        parsed.stats[statKey] = (parsed.stats[statKey] || 0) + 1;
        parsed.updatedAt = new Date().toISOString();
        localStorage.setItem(userKey, JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn("Failed to increment user profile stat:", e);
    }
  },

  updateStatValue(userId: string | null | undefined, statKey: keyof UserStatsSnapshot, value: number): void {
    if (!userId) return;
    try {
      const userKey = `ai_interview_prep_profile_${userId}`;
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.stats) parsed.stats = {};
        parsed.stats[statKey] = value;
        parsed.updatedAt = new Date().toISOString();
        localStorage.setItem(userKey, JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn("Failed to update user profile stat:", e);
    }
  },
};
