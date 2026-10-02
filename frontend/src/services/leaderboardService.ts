import { mockLeaderboardData, LeaderboardUser } from "@/mocks/leaderboardData";
import { isDemoUser } from "@/lib/userScope";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const leaderboardService = {
  async getLeaderboard(filter: "all" | "weekly" | "college" = "all"): Promise<LeaderboardUser[]> {
    await delay(150);
    let data = mockLeaderboardData.map((u) => ({
      ...u,
      isCurrentUser: isDemoUser() ? u.isCurrentUser : false,
    }));
    if (filter === "college") {
      data = data.filter((u) => u.college.includes("SRM"));
    } else if (filter === "weekly") {
      data = [...data].sort((a, b) => b.streakDays - a.streakDays);
    }
    return data.map((item, index) => ({ ...item, rank: index + 1 }));
  },
};
