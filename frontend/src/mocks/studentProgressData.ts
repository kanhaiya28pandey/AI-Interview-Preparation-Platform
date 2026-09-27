export interface TeacherNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface MockInterviewRecord {
  id: string;
  date: string;
  track: string;
  type: string;
  score: number;
  durationMinutes: number;
  feedbackSummary: string;
}

export interface CodingHistoryRecord {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "SOLVED" | "SOLVED_WITH_HELP" | "ATTEMPTED";
  attempts: number;
  lastAttemptDate: string;
}

export interface QuizHistoryRecord {
  id: string;
  topic: string;
  scorePct: number;
  questions: number;
  date: string;
  timeTaken: string;
}

export interface ResumeHistoryRecord {
  id: string;
  date: string;
  targetRole: string;
  atsScore: number;
  feedbackSummary: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface TopicScore {
  topic: string;
  score: number;
  questionsSolved: number;
}

export interface StudentProgress {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  avatarUrl?: string;
  college: string;
  course: string; // E.g. "B.Tech", "B.E.", "BCA", "B.Sc", "BBA", "Diploma", "M.Tech", "M.E.", "MCA", "M.Sc", "MBA", "PhD / Doctorate"
  branch: string;
  year: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED" | "UNVERIFIED";
  activityScore: number; // 0-100
  riskLevel: "Active" | "At Risk" | "Inactive";
  riskReason?: string;
  joinedDate: string;
  lastActive: string;
  daysInactive: number;
  streakDays: number;
  problemsSolved: number;
  problemsSolvedWithHelp: number;
  problemsAttempted: number;
  interviewsCompleted: number;
  avgInterviewScore: number;
  quizzesTaken: number;
  avgQuizScore: number;
  articlesRead: number;
  resumeAnalyses: number;
  bestAtsScore: number;
  leaderboardRank: number;
  activityHistory30d: { date: string; score: number; count: number }[];
  topicBreakdown: TopicScore[];
  interviewHistory: MockInterviewRecord[];
  codingHistory: CodingHistoryRecord[];
  quizHistory: QuizHistoryRecord[];
  resumeHistory: ResumeHistoryRecord[];
  heatmapData: HeatmapDay[];
  teacherNotes: TeacherNote[];
}

export interface CohortAnalytics {
  totalStudents: number;
  avgActivityScore: number;
  verifiedPercentage: number;
  atRiskCount: number;
  inactiveCount: number;
  courseAverages: { course: string; avgScore: number; studentCount: number }[];
  branchAverages: { branch: string; avgScore: number; studentCount: number }[];
  topStruggledTopics: { topic: string; strugglePct: number; studentCount: number }[];
  interviewRatingDistribution: { range: string; count: number }[];
  topPerformers: { id: string; name: string; course: string; score: number; rank: number }[];
}

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function generateTrend(baseScore: number, isDeclining = false) {
  const res = [];
  for (let i = 29; i >= 0; i--) {
    const factor = isDeclining ? Math.max(0, 1 - i * 0.02) : 1 + (Math.random() * 0.3 - 0.15);
    const score = Math.min(100, Math.max(10, Math.round(baseScore * factor)));
    res.push({
      date: getPastDate(i),
      score: score,
      count: Math.max(0, Math.floor(score / 15)),
    });
  }
  return res;
}

function generateHeatmap(activeLevel: number) {
  const res: HeatmapDay[] = [];
  for (let i = 89; i >= 0; i--) {
    const prob = activeLevel / 100;
    const count = Math.random() < prob ? Math.floor(Math.random() * 6) + 1 : 0;
    res.push({
      date: getPastDate(i),
      count: count,
    });
  }
  return res;
}

export const mockStudentsProgress: StudentProgress[] = [
  {
    id: "usr-1",
    name: "Aarav Sharma",
    rollNumber: "21BCE0412",
    email: "aarav.sharma@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    year: "Year 3",
    verificationStatus: "VERIFIED",
    activityScore: 94,
    riskLevel: "Active",
    joinedDate: "2025-08-15",
    lastActive: "12 mins ago",
    daysInactive: 0,
    streakDays: 24,
    problemsSolved: 48,
    problemsSolvedWithHelp: 3,
    problemsAttempted: 54,
    interviewsCompleted: 12,
    avgInterviewScore: 89,
    quizzesTaken: 18,
    avgQuizScore: 92,
    articlesRead: 14,
    resumeAnalyses: 5,
    bestAtsScore: 91,
    leaderboardRank: 1,
    activityHistory30d: generateTrend(90),
    topicBreakdown: [
      { topic: "Arrays & Hashing", score: 95, questionsSolved: 14 },
      { topic: "Two Pointers & DP", score: 88, questionsSolved: 10 },
      { topic: "System Design", score: 86, questionsSolved: 8 },
      { topic: "Behavioral & HR", score: 92, questionsSolved: 12 },
      { topic: "Graphs & Trees", score: 84, questionsSolved: 6 },
    ],
    interviewHistory: [
      { id: "int-101", date: "2026-09-25", track: "Senior SDE Track", type: "DSA & System Design", score: 91, durationMinutes: 45, feedbackSummary: "Excellent grasp of hash map optimizations and sliding window algorithms." },
    ],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(90),
    teacherNotes: [],
  },
  {
    id: "usr-2",
    name: "Rohan Gupta",
    rollNumber: "21BEE0789",
    email: "rohan.gupta@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "B.E.",
    branch: "Electrical & Electronics Engineering",
    year: "Year 3",
    verificationStatus: "VERIFIED",
    activityScore: 32,
    riskLevel: "At Risk",
    riskReason: "No activity for 9 days & declining interview scores",
    joinedDate: "2025-09-01",
    lastActive: "9 days ago",
    daysInactive: 9,
    streakDays: 0,
    problemsSolved: 6,
    problemsSolvedWithHelp: 4,
    problemsAttempted: 18,
    interviewsCompleted: 3,
    avgInterviewScore: 58,
    quizzesTaken: 4,
    avgQuizScore: 55,
    articlesRead: 3,
    resumeAnalyses: 1,
    bestAtsScore: 62,
    leaderboardRank: 18,
    activityHistory30d: generateTrend(40, true),
    topicBreakdown: [
      { topic: "Arrays & Hashing", score: 60, questionsSolved: 4 },
      { topic: "Two Pointers & DP", score: 30, questionsSolved: 1 },
      { topic: "System Design", score: 40, questionsSolved: 1 },
      { topic: "Behavioral & HR", score: 55, questionsSolved: 2 },
    ],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(30),
    teacherNotes: [],
  },
  {
    id: "usr-3",
    name: "Priya Sundaram",
    rollNumber: "22BCA0105",
    email: "priya.sundaram@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "BCA",
    branch: "Software Application Development",
    year: "Year 2",
    verificationStatus: "VERIFIED",
    activityScore: 88,
    riskLevel: "Active",
    joinedDate: "2025-10-10",
    lastActive: "2 hours ago",
    daysInactive: 0,
    streakDays: 19,
    problemsSolved: 32,
    problemsSolvedWithHelp: 2,
    problemsAttempted: 38,
    interviewsCompleted: 9,
    avgInterviewScore: 85,
    quizzesTaken: 14,
    avgQuizScore: 88,
    articlesRead: 11,
    resumeAnalyses: 4,
    bestAtsScore: 88,
    leaderboardRank: 3,
    activityHistory30d: generateTrend(85),
    topicBreakdown: [
      { topic: "Arrays & Hashing", score: 90, questionsSolved: 10 },
      { topic: "Behavioral & HR", score: 94, questionsSolved: 10 },
    ],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(85),
    teacherNotes: [],
  },
  {
    id: "usr-4",
    name: "Neelam Rani",
    rollNumber: "23BSC0018",
    email: "neelam.r@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "B.Sc",
    branch: "Computer Science & Analytics",
    year: "Year 2",
    verificationStatus: "VERIFIED",
    activityScore: 78,
    riskLevel: "Active",
    joinedDate: "2025-11-01",
    lastActive: "1 day ago",
    daysInactive: 1,
    streakDays: 12,
    problemsSolved: 24,
    problemsSolvedWithHelp: 1,
    problemsAttempted: 29,
    interviewsCompleted: 6,
    avgInterviewScore: 81,
    quizzesTaken: 10,
    avgQuizScore: 84,
    articlesRead: 7,
    resumeAnalyses: 3,
    bestAtsScore: 82,
    leaderboardRank: 7,
    activityHistory30d: generateTrend(77),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(77),
    teacherNotes: [],
  },
  {
    id: "usr-5",
    name: "Rishi Patel",
    rollNumber: "22BBA0092",
    email: "rishi.p@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "BBA",
    branch: "Business Analytics & IT",
    year: "Year 2",
    verificationStatus: "VERIFIED",
    activityScore: 72,
    riskLevel: "Active",
    joinedDate: "2025-09-15",
    lastActive: "3 hours ago",
    daysInactive: 0,
    streakDays: 8,
    problemsSolved: 16,
    problemsSolvedWithHelp: 3,
    problemsAttempted: 22,
    interviewsCompleted: 5,
    avgInterviewScore: 79,
    quizzesTaken: 8,
    avgQuizScore: 80,
    articlesRead: 12,
    resumeAnalyses: 2,
    bestAtsScore: 85,
    leaderboardRank: 10,
    activityHistory30d: generateTrend(70),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(70),
    teacherNotes: [],
  },
  {
    id: "usr-6",
    name: "Gaurav Deshmukh",
    rollNumber: "23DIP0041",
    email: "gaurav.d@srmist.edu.in",
    college: "SRM Polytechnic Institute",
    course: "Diploma",
    branch: "Polytechnic Computer Engineering",
    year: "Year 3",
    verificationStatus: "VERIFIED",
    activityScore: 65,
    riskLevel: "Active",
    joinedDate: "2025-10-01",
    lastActive: "2 days ago",
    daysInactive: 2,
    streakDays: 6,
    problemsSolved: 18,
    problemsSolvedWithHelp: 4,
    problemsAttempted: 26,
    interviewsCompleted: 4,
    avgInterviewScore: 74,
    quizzesTaken: 7,
    avgQuizScore: 75,
    articlesRead: 5,
    resumeAnalyses: 2,
    bestAtsScore: 76,
    leaderboardRank: 14,
    activityHistory30d: generateTrend(65),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(65),
    teacherNotes: [],
  },
  {
    id: "usr-7",
    name: "Kavya Nambiar",
    rollNumber: "23MCE0012",
    email: "kavya.n@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "M.Tech",
    branch: "Software Engineering & Architecture",
    year: "Year 1",
    verificationStatus: "VERIFIED",
    activityScore: 86,
    riskLevel: "Active",
    joinedDate: "2025-09-10",
    lastActive: "1 day ago",
    daysInactive: 1,
    streakDays: 14,
    problemsSolved: 38,
    problemsSolvedWithHelp: 2,
    problemsAttempted: 44,
    interviewsCompleted: 8,
    avgInterviewScore: 87,
    quizzesTaken: 13,
    avgQuizScore: 89,
    articlesRead: 16,
    resumeAnalyses: 4,
    bestAtsScore: 92,
    leaderboardRank: 4,
    activityHistory30d: generateTrend(85),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(85),
    teacherNotes: [],
  },
  {
    id: "usr-8",
    name: "Siddharth Nair",
    rollNumber: "23ME0004",
    email: "siddharth.n@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "M.E.",
    branch: "Embedded Systems & IoT",
    year: "Year 2",
    verificationStatus: "VERIFIED",
    activityScore: 81,
    riskLevel: "Active",
    joinedDate: "2025-08-01",
    lastActive: "5 hours ago",
    daysInactive: 0,
    streakDays: 11,
    problemsSolved: 30,
    problemsSolvedWithHelp: 3,
    problemsAttempted: 36,
    interviewsCompleted: 7,
    avgInterviewScore: 83,
    quizzesTaken: 11,
    avgQuizScore: 85,
    articlesRead: 9,
    resumeAnalyses: 3,
    bestAtsScore: 88,
    leaderboardRank: 6,
    activityHistory30d: generateTrend(80),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(80),
    teacherNotes: [],
  },
  {
    id: "usr-9",
    name: "Sameer Joshi",
    rollNumber: "22MCA0055",
    email: "sameer.j@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "MCA",
    branch: "Computer Applications",
    year: "Year 2",
    verificationStatus: "VERIFIED",
    activityScore: 90,
    riskLevel: "Active",
    joinedDate: "2025-07-20",
    lastActive: "30 mins ago",
    daysInactive: 0,
    streakDays: 21,
    problemsSolved: 44,
    problemsSolvedWithHelp: 1,
    problemsAttempted: 48,
    interviewsCompleted: 10,
    avgInterviewScore: 88,
    quizzesTaken: 16,
    avgQuizScore: 91,
    articlesRead: 13,
    resumeAnalyses: 5,
    bestAtsScore: 89,
    leaderboardRank: 2,
    activityHistory30d: generateTrend(89),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(89),
    teacherNotes: [],
  },
  {
    id: "usr-10",
    name: "Diya Bhatt",
    rollNumber: "23MSC0022",
    email: "diya.b@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "M.Sc",
    branch: "Data Science & Big Data Analytics",
    year: "Year 1",
    verificationStatus: "VERIFIED",
    activityScore: 83,
    riskLevel: "Active",
    joinedDate: "2025-09-05",
    lastActive: "1 day ago",
    daysInactive: 1,
    streakDays: 13,
    problemsSolved: 33,
    problemsSolvedWithHelp: 2,
    problemsAttempted: 39,
    interviewsCompleted: 7,
    avgInterviewScore: 84,
    quizzesTaken: 12,
    avgQuizScore: 86,
    articlesRead: 10,
    resumeAnalyses: 3,
    bestAtsScore: 87,
    leaderboardRank: 5,
    activityHistory30d: generateTrend(82),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(82),
    teacherNotes: [],
  },
  {
    id: "usr-11",
    name: "Tanvi Mehta",
    rollNumber: "22MBA0088",
    email: "tanvi.m@srmist.edu.in",
    college: "SRM School of Management",
    course: "MBA",
    branch: "Technology Management & HR",
    year: "Year 2",
    verificationStatus: "VERIFIED",
    activityScore: 85,
    riskLevel: "Active",
    joinedDate: "2025-08-10",
    lastActive: "4 hours ago",
    daysInactive: 0,
    streakDays: 15,
    problemsSolved: 14,
    problemsSolvedWithHelp: 2,
    problemsAttempted: 20,
    interviewsCompleted: 11,
    avgInterviewScore: 92,
    quizzesTaken: 15,
    avgQuizScore: 90,
    articlesRead: 22,
    resumeAnalyses: 6,
    bestAtsScore: 93,
    leaderboardRank: 8,
    activityHistory30d: generateTrend(84),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(84),
    teacherNotes: [],
  },
  {
    id: "usr-12",
    name: "Dr. Sagnik Bose",
    rollNumber: "20PHD0003",
    email: "sagnik.b@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "PhD / Doctorate",
    branch: "Artificial Intelligence & Distributed Systems",
    year: "Year 3",
    verificationStatus: "VERIFIED",
    activityScore: 96,
    riskLevel: "Active",
    joinedDate: "2024-07-01",
    lastActive: "15 mins ago",
    daysInactive: 0,
    streakDays: 30,
    problemsSolved: 62,
    problemsSolvedWithHelp: 1,
    problemsAttempted: 66,
    interviewsCompleted: 15,
    avgInterviewScore: 95,
    quizzesTaken: 22,
    avgQuizScore: 96,
    articlesRead: 35,
    resumeAnalyses: 8,
    bestAtsScore: 96,
    leaderboardRank: 1,
    activityHistory30d: generateTrend(95),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(95),
    teacherNotes: [
      { id: "note-1201", author: "Research Director", date: "2026-09-01", text: "Outstanding candidate for R&D lab roles and senior systems architect placements." },
    ],
  },
  {
    id: "usr-13",
    name: "Vikram Malhotra",
    rollNumber: "20BCE0199",
    email: "vikram.m@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    year: "Year 4",
    verificationStatus: "VERIFIED",
    activityScore: 91,
    riskLevel: "Active",
    joinedDate: "2025-07-01",
    lastActive: "1 day ago",
    daysInactive: 1,
    streakDays: 16,
    problemsSolved: 42,
    problemsSolvedWithHelp: 5,
    problemsAttempted: 50,
    interviewsCompleted: 11,
    avgInterviewScore: 88,
    quizzesTaken: 15,
    avgQuizScore: 89,
    articlesRead: 19,
    resumeAnalyses: 6,
    bestAtsScore: 94,
    leaderboardRank: 2,
    activityHistory30d: generateTrend(88),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(88),
    teacherNotes: [],
  },
  {
    id: "usr-14",
    name: "Sneha Reddy",
    rollNumber: "22BDS0044",
    email: "sneha.reddy@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "B.Tech",
    branch: "Data Science",
    year: "Year 2",
    verificationStatus: "PENDING",
    activityScore: 18,
    riskLevel: "Inactive",
    riskReason: "Inactive for 14+ days. ID Verification pending approval.",
    joinedDate: "2026-01-15",
    lastActive: "14 days ago",
    daysInactive: 14,
    streakDays: 0,
    problemsSolved: 2,
    problemsSolvedWithHelp: 1,
    problemsAttempted: 9,
    interviewsCompleted: 1,
    avgInterviewScore: 48,
    quizzesTaken: 2,
    avgQuizScore: 45,
    articlesRead: 1,
    resumeAnalyses: 1,
    bestAtsScore: 54,
    leaderboardRank: 22,
    activityHistory30d: generateTrend(20, true),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(15),
    teacherNotes: [],
  },
  {
    id: "usr-15",
    name: "Manish Kumar",
    rollNumber: "22BCE0330",
    email: "manish.k@srmist.edu.in",
    college: "SRM Institute of Science and Technology",
    course: "B.Tech",
    branch: "Information Technology",
    year: "Year 2",
    verificationStatus: "REJECTED",
    activityScore: 24,
    riskLevel: "At Risk",
    riskReason: "ID Verification Rejected (blurry ID card scan). Zero practice in 8 days.",
    joinedDate: "2026-02-01",
    lastActive: "8 days ago",
    daysInactive: 8,
    streakDays: 0,
    problemsSolved: 4,
    problemsSolvedWithHelp: 2,
    problemsAttempted: 12,
    interviewsCompleted: 2,
    avgInterviewScore: 52,
    quizzesTaken: 3,
    avgQuizScore: 50,
    articlesRead: 2,
    resumeAnalyses: 1,
    bestAtsScore: 58,
    leaderboardRank: 20,
    activityHistory30d: generateTrend(25, true),
    topicBreakdown: [],
    interviewHistory: [],
    codingHistory: [],
    quizHistory: [],
    resumeHistory: [],
    heatmapData: generateHeatmap(25),
    teacherNotes: [],
  }
];
