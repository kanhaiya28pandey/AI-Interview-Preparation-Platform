export interface InterviewRole {
  id: string;
  title: string;
  category: string;
  difficulty: "Junior" | "Mid-Level" | "Senior" | "Lead";
  durationMinutes: number;
  description: string;
  icon: string;
  totalQuestions: number;
}

export interface InterviewQuestion {
  id: string;
  roleId: string;
  questionNumber: number;
  question: string;
  category: string;
  idealKeyPoints: string[];
  followUpPrompt: string;
}

export interface InterviewFeedback {
  sessionId: string;
  roleTitle: string;
  date: string;
  overallScore: number;
  scores: {
    technicalAccuracy: number;
    communicationClarity: number;
    problemSolving: number;
    confidence: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  transcripts: {
    speaker: "interviewer" | "candidate";
    text: string;
    timestamp: string;
  }[];
}

export const mockInterviewRoles: InterviewRole[] = [
  {
    id: "behavioral-star",
    title: "HR & STAR Behavioral Round",
    category: "Behavioral",
    difficulty: "Junior",
    durationMinutes: 20,
    description: "Evaluates soft skills, conflict resolution, project failures, and leadership scenarios using the STAR method.",
    icon: "Users",
    totalQuestions: 3,
  },
  {
    id: "frontend-react",
    title: "Senior Frontend Engineer (React/TypeScript)",
    category: "Frontend",
    difficulty: "Senior",
    durationMinutes: 25,
    description: "Evaluates modern React 19 concurrent features, virtual DOM reconciliation, state management patterns & performance profiling.",
    icon: "Layout",
    totalQuestions: 4,
  },
  {
    id: "backend-java",
    title: "Java & Spring Microservices Engineer",
    category: "Backend",
    difficulty: "Mid-Level",
    durationMinutes: 30,
    description: "Focuses on Spring Boot security, multithreading concurrency, REST API design, database transactions and JPA/Hibernate.",
    icon: "Server",
    totalQuestions: 4,
  },
  {
    id: "fullstack-mern",
    title: "Full Stack MERN Developer",
    category: "Full Stack",
    difficulty: "Mid-Level",
    durationMinutes: 30,
    description: "Covers end-to-end web architecture, Node.js event loop, Express middleware, JWT auth & MongoDB aggregation pipelines.",
    icon: "Code2",
    totalQuestions: 5,
  },
  {
    id: "system-design",
    title: "Distributed Systems & System Architecture",
    category: "System Design",
    difficulty: "Lead",
    durationMinutes: 35,
    description: "High availability design for TinyURL, Rate Limiters, Distributed Caching (Redis), Kafka messaging and database sharding.",
    icon: "Layers",
    totalQuestions: 3,
  },
  {
    id: "python-data",
    title: "Python Data Engineering & PySpark",
    category: "Data Science",
    difficulty: "Mid-Level",
    durationMinutes: 25,
    description: "ETL pipeline construction, PySpark dataframes, Pandas optimization, and BigQuery warehouse partitioning.",
    icon: "Binary",
    totalQuestions: 4,
  },
  {
    id: "dbms-sql",
    title: "Database Administration & SQL Optimization",
    category: "Database",
    difficulty: "Mid-Level",
    durationMinutes: 25,
    description: "ACID compliance, B-Tree index lookup overhead, deadlock resolution, PostgreSQL query tuning and normalization.",
    icon: "Database",
    totalQuestions: 4,
  },
  {
    id: "os-networks",
    title: "Operating Systems & Low Level Concurrency",
    category: "Core CS",
    difficulty: "Senior",
    durationMinutes: 30,
    description: "Process vs Thread memory space, semaphores vs mutexes, virtual memory paging, and TCP 3-way handshake mechanics.",
    icon: "Cpu",
    totalQuestions: 4,
  },
];

export const mockInterviewQuestions: Record<string, InterviewQuestion[]> = {
  "behavioral-star": [
    {
      id: "q-star-1",
      roleId: "behavioral-star",
      questionNumber: 1,
      question: "Tell me about a time when a critical bug occurred right before a major product demo. How did you handle it?",
      category: "Conflict & Pressure",
      idealKeyPoints: ["Clear Situation context", "Specific Action steps taken", "Quantified business Result"],
      followUpPrompt: "How did you communicate the issue to non-technical stakeholders during the crisis?",
    }
  ],
  "frontend-react": [
    {
      id: "q-fe-1",
      roleId: "frontend-react",
      questionNumber: 1,
      question: "How does React's fiber architecture enable concurrent rendering, and how would you optimize a high-frequency re-rendering dashboard?",
      category: "React Architecture",
      idealKeyPoints: ["Fiber breaks rendering work into incremental units", "useTransition priorities", "Component memoization & virtualization"],
      followUpPrompt: "How would you diagnose an unexpected re-render chain using React DevTools Profiler?",
    },
  ],
};
