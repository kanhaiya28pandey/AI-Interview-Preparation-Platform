export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "USER";
  status: "ACTIVE" | "BLOCKED" | "PENDING";
  joinedDate: string;
  lastActive: string;
  interviewsCompleted: number;
}

export interface TopicConfig {
  name: string;
  questionCount: number;
  weightage: number;
}

export interface AdminCodingTest {
  id: string;
  title: string;
  domain: string;
  topics: TopicConfig[];
  difficulty: "Easy" | "Medium" | "Hard";
  submissionsCount: number;
  passRate: string;
  status: "ACTIVE" | "DRAFT" | "IN_PROGRESS" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  createdAt: string;
  cancelReason?: string;
}

export interface AdminMockInterviewConfig {
  id: string;
  roleTitle: string;
  domain: string;
  topics: TopicConfig[];
  category: string;
  questionsCount: number;
  durationMinutes: number;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED";
  cancelReason?: string;
}

export interface AdminReportData {
  userGrowth: { date: string; users: number; active: number }[];
  interviewStats: { category: string; count: number; avgScore: number }[];
  difficultyDistribution: { name: string; value: number }[];
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: "usr-1",
    name: "Kanhaiya Pandey",
    email: "kanhaiya@srmist.edu.in",
    role: "STUDENT",
    status: "ACTIVE",
    joinedDate: "2026-08-15",
    lastActive: "2 minutes ago",
    interviewsCompleted: 11,
  },
  {
    id: "usr-2",
    name: "Ananya Sharma",
    email: "ananya@iitm.ac.in",
    role: "ADMIN",
    status: "ACTIVE",
    joinedDate: "2026-07-10",
    lastActive: "Just now",
    interviewsCompleted: 24,
  },
  {
    id: "usr-3",
    name: "Rahul Verma",
    email: "rahul@vit.ac.in",
    role: "STUDENT",
    status: "BLOCKED",
    joinedDate: "2026-09-01",
    lastActive: "3 days ago",
    interviewsCompleted: 2,
  },
  {
    id: "usr-4",
    name: "Sneha Kapur",
    email: "sneha@bits.edu",
    role: "STUDENT",
    status: "ACTIVE",
    joinedDate: "2026-09-05",
    lastActive: "1 hour ago",
    interviewsCompleted: 8,
  },
];

export const mockAdminCodingTests: AdminCodingTest[] = [
  {
    id: "test-1",
    title: "Java Core & Multithreading Benchmark",
    domain: "Java",
    topics: [
      { name: "OOP Principles", questionCount: 2, weightage: 30 },
      { name: "Collections Framework", questionCount: 2, weightage: 30 },
      { name: "Multithreading & Executor", questionCount: 1, weightage: 40 },
    ],
    difficulty: "Easy",
    submissionsCount: 1420,
    passRate: "68.4%",
    status: "ACTIVE",
    createdAt: "2026-08-01",
  },
  {
    id: "test-2",
    title: "Distributed Systems & LRU Cache",
    domain: "System Design",
    topics: [
      { name: "Distributed Caching", questionCount: 1, weightage: 50 },
      { name: "Database Sharding", questionCount: 1, weightage: 50 },
    ],
    difficulty: "Hard",
    submissionsCount: 520,
    passRate: "41.2%",
    status: "IN_PROGRESS",
    createdAt: "2026-08-10",
  },
  {
    id: "test-3",
    title: "Array & Dynamic Programming Assessment",
    domain: "DSA",
    topics: [
      { name: "Sliding Window", questionCount: 2, weightage: 40 },
      { name: "Dynamic Programming", questionCount: 2, weightage: 60 },
    ],
    difficulty: "Medium",
    submissionsCount: 890,
    passRate: "54.7%",
    status: "ACTIVE",
    createdAt: "2026-08-18",
  },
  {
    id: "test-4",
    title: "React Hooks & Web Security Assessment",
    domain: "Frontend",
    topics: [
      { name: "React Hooks & State", questionCount: 3, weightage: 50 },
      { name: "DOM & Async JS", questionCount: 2, weightage: 50 },
    ],
    difficulty: "Medium",
    submissionsCount: 650,
    passRate: "72.1%",
    status: "ACTIVE",
    createdAt: "2026-09-02",
  },
];

export const mockAdminMockInterviews: AdminMockInterviewConfig[] = [
  {
    id: "int-1",
    roleTitle: "Senior Frontend Engineer (React/TypeScript)",
    domain: "Frontend",
    topics: [
      { name: "React Architecture", questionCount: 2, weightage: 50 },
      { name: "Performance Optimization", questionCount: 2, weightage: 50 },
    ],
    category: "Frontend",
    questionsCount: 4,
    durationMinutes: 25,
    status: "ACTIVE",
  },
  {
    id: "int-2",
    roleTitle: "Java Spring Boot Microservices Developer",
    domain: "Java",
    topics: [
      { name: "Spring Boot & REST", questionCount: 3, weightage: 60 },
      { name: "JVM Tuning", questionCount: 2, weightage: 40 },
    ],
    category: "Backend",
    questionsCount: 5,
    durationMinutes: 30,
    status: "ACTIVE",
  },
  {
    id: "int-3",
    roleTitle: "Full Stack MERN Developer",
    domain: "MERN",
    topics: [
      { name: "MongoDB Indexing", questionCount: 2, weightage: 40 },
      { name: "Express & Node.js", questionCount: 3, weightage: 60 },
    ],
    category: "Full Stack",
    questionsCount: 5,
    durationMinutes: 30,
    status: "ACTIVE",
  },
];

export const mockAdminReports: AdminReportData = {
  userGrowth: [
    { date: "Sep 1", users: 120, active: 85 },
    { date: "Sep 5", users: 210, active: 160 },
    { date: "Sep 10", users: 340, active: 270 },
    { date: "Sep 15", users: 490, active: 380 },
    { date: "Sep 20", users: 680, active: 540 },
    { date: "Sep 25", users: 950, active: 810 },
  ],
  interviewStats: [
    { category: "Frontend", count: 420, avgScore: 84 },
    { category: "Backend Java", count: 310, avgScore: 78 },
    { category: "Full Stack MERN", count: 540, avgScore: 82 },
    { category: "System Design", count: 280, avgScore: 75 },
    { category: "Behavioral", count: 610, avgScore: 88 },
  ],
  difficultyDistribution: [
    { name: "Easy", value: 35 },
    { name: "Medium", value: 45 },
    { name: "Hard", value: 20 },
  ],
};
