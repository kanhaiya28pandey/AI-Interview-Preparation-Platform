import api from "@/lib/api";
import { LeaderboardUser } from "@/mocks/leaderboardData";
import { progressService } from "@/services/progressService";

function computeBadge(score: number): "Gold" | "Silver" | "Bronze" | "Master" | "Pro" {
  if (score >= 2500) return "Master";
  if (score >= 2000) return "Gold";
  if (score >= 1200) return "Silver";
  if (score >= 600) return "Bronze";
  return "Pro";
}

export const leaderboardService = {
  async getLeaderboard(filter: "all" | "weekly" | "college" = "all"): Promise<LeaderboardUser[]> {
    let currentUser: { userId?: string; name?: string; email?: string; college?: string; role?: string } | null = null;
    try {
      const raw = localStorage.getItem("ai_interview_prep_user");
      if (raw) currentUser = JSON.parse(raw);
    } catch {
      // ignore
    }

    const localStats = progressService.getStatsSnapshot(currentUser?.userId);

    let candidates: LeaderboardUser[] = [];
    let backendSuccess = false;

    try {
      const res = await api.get<any[]>(`/api/v1/leaderboard?filter=${encodeURIComponent(filter)}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        backendSuccess = true;
        candidates = res.data.map((item, index) => {
          const isMe =
            Boolean(item.isCurrentUser) ||
            Boolean(item.currentUser) ||
            (Boolean(currentUser?.userId) && currentUser?.userId === item.userId) ||
            (Boolean(currentUser?.email) && item.email && item.email.toLowerCase() === currentUser?.email?.toLowerCase());

          const finalScore = isMe ? Math.max(item.score || 0, localStats.totalXP) : item.score || 0;
          const finalStreak = isMe ? Math.max(item.streakDays || 0, localStats.currentStreak) : item.streakDays || 0;
          const finalSolved = isMe ? Math.max(item.problemsSolved || 0, localStats.codingProblemsSolved) : item.problemsSolved || 0;
          const finalInterviews = isMe ? Math.max(item.mockInterviewsCount || 0, localStats.mockInterviewsCompleted) : item.mockInterviewsCount || 0;
          const finalRating = isMe && localStats.overallRating ? localStats.overallRating : item.avgInterviewScore || 80;

          return {
            rank: item.rank || index + 1,
            userId: item.userId,
            name: item.name || "Student",
            avatar: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "S")}&background=0284c7&color=fff`,
            college: item.college || "SRM Institute of Science and Technology",
            score: finalScore,
            streakDays: finalStreak,
            problemsSolved: finalSolved,
            mockInterviewsCount: finalInterviews,
            avgInterviewScore: finalRating,
            badge: computeBadge(finalScore),
            isCurrentUser: Boolean(isMe),
          };
        });

        // Ensure current active student is represented if missing from backend list
        const hasCurrentUser = candidates.some((c) => c.isCurrentUser);
        if (!hasCurrentUser && currentUser?.userId) {
          const userCollege = currentUser.college || "SRM Institute of Science and Technology";
          candidates.push({
            rank: 999,
            userId: currentUser.userId,
            name: currentUser.name || "Student",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || "S")}&background=0284c7&color=fff`,
            college: userCollege,
            score: localStats.totalXP,
            streakDays: localStats.currentStreak,
            problemsSolved: localStats.codingProblemsSolved,
            mockInterviewsCount: localStats.mockInterviewsCompleted,
            avgInterviewScore: localStats.overallRating || 82,
            badge: computeBadge(localStats.totalXP),
            isCurrentUser: true,
          });
        }
      }
    } catch (err) {
      console.warn("Backend leaderboard unavailable, falling back to synchronized dataset:", err);
    }

    // Fallback if backend is unavailable or returned empty
    if (!backendSuccess || candidates.length === 0) {
      try {
        const rawMaster = localStorage.getItem("ai_interview_prep_master_students_v2");
        if (rawMaster) {
          const masterList = JSON.parse(rawMaster);
          if (Array.isArray(masterList) && masterList.length > 0) {
            candidates = masterList
              .filter((m: any) => m.role === "STUDENT")
              .map((m: any, idx: number) => {
                const isMe =
                  (currentUser?.userId && (m.id === currentUser.userId || m.userId === currentUser.userId)) ||
                  (currentUser?.email && m.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
                  (m.id === "usr-student-01" && (currentUser?.userId?.includes("demo") || currentUser?.userId?.includes("student-01")));

                const computedXP = isMe
                  ? Math.max(m.totalXp || 0, localStats.totalXP)
                  : m.totalXp || (m.problemsSolved || 0) * 50 + (m.interviewsCompleted || 0) * 150 + 200;

                const streak = isMe ? Math.max(m.streakDays || 0, localStats.currentStreak) : m.streakDays || 1;
                const solved = isMe ? Math.max(m.problemsSolved || 0, localStats.codingProblemsSolved) : m.problemsSolved || 0;
                const interviews = isMe ? Math.max(m.interviewsCompleted || 0, localStats.mockInterviewsCompleted) : m.interviewsCompleted || 0;
                const rating = isMe && localStats.overallRating ? localStats.overallRating : m.avgInterviewScore || 82;

                return {
                  rank: idx + 1,
                  userId: m.id,
                  name: m.name,
                  avatar: m.selfieUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0284c7&color=fff`,
                  college: m.college || "SRM Institute of Science and Technology",
                  score: computedXP,
                  streakDays: streak,
                  problemsSolved: solved,
                  mockInterviewsCount: interviews,
                  avgInterviewScore: rating,
                  badge: computeBadge(computedXP),
                  isCurrentUser: Boolean(isMe),
                };
              });
          }
        }
      } catch (e) {
        console.warn("Failed reading master students for leaderboard fallback:", e);
      }
    }

    // Safety fallback if still empty
    if (candidates.length === 0 && currentUser?.userId) {
      candidates.push({
        rank: 1,
        userId: currentUser.userId,
        name: currentUser.name || "Student",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || "S")}&background=0284c7&color=fff`,
        college: currentUser.college || "SRM Institute of Science and Technology",
        score: localStats.totalXP,
        streakDays: localStats.currentStreak,
        problemsSolved: localStats.codingProblemsSolved,
        mockInterviewsCount: localStats.mockInterviewsCompleted,
        avgInterviewScore: localStats.overallRating || 80,
        badge: computeBadge(localStats.totalXP),
        isCurrentUser: true,
      });
    }

    // Apply strict filtering
    let filtered = [...candidates];
    if (filter === "college") {
      const myCollege = (currentUser?.college || "SRM").toLowerCase();
      filtered = filtered.filter((u) => u.college && u.college.toLowerCase().includes(myCollege));
      // If none matched, show at least the current user or SRM candidates
      if (filtered.length === 0) {
        filtered = candidates.filter((u) => u.isCurrentUser || (u.college && u.college.toLowerCase().includes("srm")));
      }
    }

    // Strictly sort based on filter mode
    if (filter === "weekly") {
      // Highest Streak mode: streak primary, score secondary
      filtered.sort((a, b) => (b.streakDays !== a.streakDays ? b.streakDays - a.streakDays : b.score - a.score));
    } else {
      // All Campuses or My Campus: score (Total XP) primary, streak secondary
      filtered.sort((a, b) => (b.score !== a.score ? b.score - a.score : b.streakDays - a.streakDays));
    }

    // Reassign ranks sequentially 1..N
    return filtered.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  },
};
