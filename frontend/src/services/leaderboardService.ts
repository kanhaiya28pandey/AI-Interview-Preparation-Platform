import { mockLeaderboardData, LeaderboardUser } from "@/mocks/leaderboardData";
import { authService } from "./authService";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const leaderboardService = {
  async getLeaderboard(filter: "all" | "weekly" | "college" = "all"): Promise<LeaderboardUser[]> {
    await delay(150);
    let currentUser: { userId?: string; name?: string; college?: string; role?: string } | null = null;
    let isDemo = false;
    try {
      const raw = localStorage.getItem("ai_interview_prep_user");
      if (raw) currentUser = JSON.parse(raw);
      isDemo = localStorage.getItem("ai_interview_prep_demo") === "true" || currentUser?.userId === "demo-usr-student-01";
    } catch {
      // ignore
    }

    let realUserProfile: { name?: string; college?: string; avatar?: string; stats?: { totalXP?: number; currentStreak?: number; codingProblemsSolved?: number; mockInterviewsCompleted?: number; overallRating?: number } } | null = null;
    if (currentUser?.userId && !isDemo) {
      try {
        const pRaw = localStorage.getItem(`ai_interview_prep_profile_${currentUser.userId}`);
        if (pRaw) {
          realUserProfile = JSON.parse(pRaw);
        }
      } catch {
        // ignore
      }
    }

    const realXP = realUserProfile?.stats?.totalXP || 0;
    const realStreak = realUserProfile?.stats?.currentStreak || 0;
    const realSolved = realUserProfile?.stats?.codingProblemsSolved || 0;
    const realMocks = realUserProfile?.stats?.mockInterviewsCompleted || 0;
    const realRating = realUserProfile?.stats?.overallRating || 0;

    let list: LeaderboardUser[] = mockLeaderboardData.map((item) => ({
      ...item,
      isCurrentUser: isDemo ? item.userId === "usr-105" : false,
    }));

    if (!isDemo && currentUser?.userId && realXP > 0) {
      // User has earned XP, include them in the leaderboard
      const badge: "Gold" | "Silver" | "Bronze" | "Master" | "Pro" =
        realXP > 2500 ? "Master" : realXP > 2000 ? "Gold" : realXP > 1500 ? "Silver" : "Pro";

      const realUserEntry: LeaderboardUser = {
        rank: 0,
        userId: currentUser.userId,
        name: realUserProfile?.name || currentUser.name || "Student",
        avatar: realUserProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(realUserProfile?.name || currentUser.name || "S")}&background=0284c7&color=fff`,
        college: realUserProfile?.college || currentUser.college || "Engineering Campus",
        score: realXP,
        streakDays: realStreak,
        problemsSolved: realSolved,
        mockInterviewsCount: realMocks,
        avgInterviewScore: realRating,
        badge: badge,
        isCurrentUser: true,
      };

      list.push(realUserEntry);
    }

    if (filter === "college") {
      const userCollege = (realUserProfile?.college || currentUser?.college || "SRM").toLowerCase();
      list = list.filter((u) => u.college.toLowerCase().includes(userCollege) || (isDemo && u.college.includes("SRM")));
    } else if (filter === "weekly") {
      list = [...list].sort((a, b) => b.streakDays - a.streakDays || b.score - a.score);
    } else {
      list = [...list].sort((a, b) => b.score - a.score);
    }

    return list.map((item, index) => ({ ...item, rank: index + 1 }));
  },
};
