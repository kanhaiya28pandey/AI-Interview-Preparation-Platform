import api from "@/lib/api";
import { LeaderboardUser } from "@/mocks/leaderboardData";

export const leaderboardService = {
  async getLeaderboard(filter: "all" | "weekly" | "college" = "all"): Promise<LeaderboardUser[]> {
    let currentUser: { userId?: string; name?: string; college?: string; role?: string } | null = null;
    try {
      const raw = localStorage.getItem("ai_interview_prep_user");
      if (raw) currentUser = JSON.parse(raw);
    } catch {
      // ignore
    }

    try {
      const res = await api.get<any[]>(`/api/v1/leaderboard?filter=${encodeURIComponent(filter)}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((item, index) => {
          const isMe = item.isCurrentUser ?? item.currentUser ?? (currentUser?.userId === item.userId);
          return {
            rank: item.rank || index + 1,
            userId: item.userId,
            name: item.name || "Student",
            avatar: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "S")}&background=0284c7&color=fff`,
            college: item.college || "Engineering College",
            score: item.score || 0,
            streakDays: item.streakDays || 0,
            problemsSolved: item.problemsSolved || 0,
            mockInterviewsCount: item.mockInterviewsCount || 0,
            avgInterviewScore: item.avgInterviewScore || 0,
            badge: item.badge || "Pro",
            isCurrentUser: Boolean(isMe),
          };
        });
      }
    } catch (err) {
      console.warn("Backend leaderboard unavailable, attempting local profile fallback:", err);
    }

    // Fallback only if backend completely unreachable: return current user entry
    if (currentUser?.userId) {
      return [
        {
          rank: 1,
          userId: currentUser.userId,
          name: currentUser.name || "Student",
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || "S")}&background=0284c7&color=fff`,
          college: currentUser.college || "Engineering College",
          score: 100,
          streakDays: 1,
          problemsSolved: 1,
          mockInterviewsCount: 0,
          avgInterviewScore: 80,
          badge: "Pro",
          isCurrentUser: true,
        },
      ];
    }

    return [];
  },
};
