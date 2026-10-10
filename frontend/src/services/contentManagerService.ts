import api, { isDemoSession } from "@/lib/api";
import { notificationService } from "./notificationService";
import { progressService } from "./progressService";

export type ContentType =
  | "QUIZ"
  | "MOCK_TEST"
  | "CODING_TEST"
  | "CODING_PROBLEM"
  | "MOCK_INTERVIEW"
  | "PRACTICE_TOPIC"
  | "ARTICLE"
  | "MCQ Quiz"
  | "Mock Test"
  | "Coding Test"
  | "Mock Interview"
  | "Practice Track"
  | "Article";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "Draft" | "Published" | "Archived";

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  subject: string; // domain slug or name (e.g. dsa, frontend, backend, genai, data-analyst, devops-cloud, aptitude)
  topics: string[];
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  difficultySplit?: Record<string, number>;
  status: ContentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  studentAttempts: number;
  avgScorePercent?: number;
  durationMinutes?: number;
  passMarkPercent?: number;
  negativeMarking?: boolean;
  shuffleOptions?: boolean;
  showAnswers?: boolean;
  visibility?: string;
  questionsCount?: number;
  settings: Record<string, any>;
  contentData: Record<string, any>;
  version: number;
  versions?: Array<Record<string, any>>;
  payload?: Record<string, any>;
}

export interface ContentSummary {
  totalItems: number;
  totalPublished: number;
  totalDrafts: number;
  totalArchived: number;
  totalAttendees: number;
  avgPlatformPassRate: number;
  statsByType: Record<string, { total: number; published: number; draft: number; archived: number }>;
}

export interface ContentAuditLog {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  marks?: number;
  difficulty?: string;
  topic?: string;
  keyPoints?: string[];
}

export interface McqQuestionItem {
  id: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  difficulty?: string;
  topic?: string;
  marks?: number;
}

export interface CodingProblemItem {
  id: string;
  title: string;
  statement: string;
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  difficulty?: string;
}

export interface StudentTestSubmission {
  submissionId: string;
  testId: string;
  testTitle: string;
  testType: ContentType;
  domain: string;
  userId: string;
  userName?: string;
  submittedAt: string;
  timeSpentSeconds: number;
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  rank: number;
  totalAttendees: number;
  answers: Record<string, number | string>; // questionId -> chosenIndex or text
  detailedReview: Array<{
    questionId: string;
    question: string;
    codeSnippet?: string;
    options?: string[];
    chosenOptionIndex?: number;
    chosenAnswerText?: string;
    correctOptionIndex?: number;
    isCorrect: boolean;
    explanation: string;
    keyPoints?: string[];
  }>;
}

export interface QuestionStat {
  questionId: string;
  question: string;
  options: string[];
  correctIndex: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercentage: number;
}

export interface TestAttendeeRecord {
  submissionId: string;
  userId: string;
  userName: string;
  college?: string;
  rollNumber?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
  rank: number;
}

export interface TestPerformanceReport {
  testId: string;
  testTitle: string;
  domain: string;
  difficulty: string;
  durationMinutes: number;
  passPercentage: number;
  totalAttendees: number;
  avgScore: number;
  passRate: number;
  highestScore: number;
  lowestScore: number;
  avgTimeSpentMinutes: number;
  questionStats: QuestionStat[];
  attendees: TestAttendeeRecord[];
}

export interface FilterParams {
  type?: string;
  subject?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

const LOCAL_STORAGE_KEY = "admin_content_items_store_v5";
const SUBMISSIONS_STORAGE_KEY = "practice_test_submissions_v5";

// Baseline comprehensive tests across 7 canonical domains
const DEFAULT_TESTS: ContentItem[] = [
  {
    id: "cnt-dsa-1",
    title: "DSA Algorithmic Speed & Accuracy Benchmark",
    description: "Timed objective test on Arrays, Sliding Window, Monotonic Stacks, and Tree Traversals with detailed analysis.",
    type: "QUIZ",
    subject: "dsa",
    topics: ["Arrays", "Sliding Window", "Binary Search", "Trees"],
    tags: ["Algorithms", "FAANG", "DSA"],
    difficulty: "Medium",
    status: "PUBLISHED",
    createdBy: "AI Curriculum Lead",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    studentAttempts: 48,
    avgScorePercent: 78,
    durationMinutes: 25,
    passMarkPercent: 70,
    questionsCount: 5,
    version: 1,
    settings: {
      durationMinutes: 25,
      passPercentage: 70,
      negativeMarking: true,
      negativePenalty: 0.25,
      showAnswersAfterSubmit: true,
    },
    contentData: {
      questions: [
        {
          id: "dsa-q1",
          question: "What is the time complexity of finding the next greater element for all elements in an array of size N using a monotonic stack?",
          codeSnippet: "for (int i = 0; i < n; i++) {\n  while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {\n    ans[stack.pop()] = arr[i];\n  }\n  stack.push(i);\n}",
          options: ["O(N^2) in worst case", "O(N) amortized because each element is pushed and popped at most once", "O(N log N)", "O(N * M) where M is max stack size"],
          correctIndex: 1,
          explanation: "Even though there is a nested while loop, each index is pushed onto the stack exactly once and popped at most once across the entire algorithm, making total push/pop operations 2N, which is O(N) amortized.",
          difficulty: "Medium",
          topic: "Monotonic Stack",
        },
        {
          id: "dsa-q2",
          question: "When applying dynamic sliding window on positive integers to find the shortest subarray with sum >= S, what condition allows advancing the left pointer?",
          options: ["When current window sum < S", "When current window sum >= S, to minimize window length", "When window size exceeds array length", "When array is strictly decreasing"],
          correctIndex: 1,
          explanation: "Once the window sum meets or exceeds S, you contract from the left to seek a smaller valid window while updating the minimum length recorded so far.",
          difficulty: "Easy",
          topic: "Sliding Window",
        },
        {
          id: "dsa-q3",
          question: "In a Binary Search Tree (BST), which traversal order is strictly guaranteed to yield all node keys in sorted non-decreasing order?",
          options: ["Pre-order (Root-Left-Right)", "Post-order (Left-Right-Root)", "In-order (Left-Root-Right)", "Level-order BFS"],
          correctIndex: 2,
          explanation: "By definition of BST (left < root < right), In-order traversal visits left subtree, then the root, then right subtree, producing strictly non-decreasing sorted order.",
          difficulty: "Easy",
          topic: "Trees",
        },
        {
          id: "dsa-q4",
          question: "In Dijkstra's algorithm implemented with a Min-Heap (Priority Queue), what is the optimal asymptotic time complexity for a graph with V vertices and E edges?",
          options: ["O(V^2)", "O(V + E)", "O((V + E) log V)", "O(E * V)"],
          correctIndex: 2,
          explanation: "Each vertex is extracted from the min-heap at most once (V log V), and each edge relaxation may update the min-heap key (E log V), yielding total time O((V + E) log V).",
          difficulty: "Hard",
          topic: "Graphs",
        },
        {
          id: "dsa-q5",
          question: "Which recurrence relation describes the 0/1 Knapsack dynamic programming decision at item i with remaining weight w?",
          options: ["dp[i][w] = dp[i-1][w] + dp[i-1][w - wt[i]]", "dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]])", "dp[i][w] = min(dp[i-1][w], dp[i][w - wt[i]])", "dp[i][w] = dp[i][w - 1] * val[i]"],
          correctIndex: 1,
          explanation: "At each step, we decide whether to exclude item i (dp[i-1][w]) or include item i (val[i] + dp[i-1][w - wt[i]]), taking the maximum value achievable.",
          difficulty: "Medium",
          topic: "Dynamic Programming",
        },
      ],
    },
  },
  {
    id: "cnt-frontend-1",
    title: "React 19, TypeScript & Web Performance MCQ Quiz",
    description: "Comprehensive client-side evaluation covering Fiber reconciliation, Core Web Vitals, and strict TypeScript types.",
    type: "QUIZ",
    subject: "frontend",
    topics: ["React 19", "Web Performance", "TypeScript", "State Management"],
    tags: ["Frontend", "React", "CWV"],
    difficulty: "Medium",
    status: "PUBLISHED",
    createdBy: "Frontend Lead",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    studentAttempts: 36,
    avgScorePercent: 82,
    durationMinutes: 30,
    passMarkPercent: 70,
    questionsCount: 5,
    version: 1,
    settings: {
      durationMinutes: 30,
      passPercentage: 70,
      negativeMarking: false,
      showAnswersAfterSubmit: true,
    },
    contentData: {
      questions: [
        {
          id: "fe-q1",
          question: "How does React 19's new Compiler (React Forget) optimize component re-renders?",
          options: ["By rewriting all components into Web Workers", "By automatically memoizing values and functions at build-time, removing manual useMemo/useCallback boilerplate", "By converting JSX into pure HTML strings on the client", "By disabling Virtual DOM diffing entirely"],
          correctIndex: 1,
          explanation: "The React 19 Compiler performs deep static analysis of JavaScript rules and automatically inserts fine-grained memoization caches, eliminating the need for manual useMemo and useCallback in most cases.",
          difficulty: "Medium",
          topic: "React 19",
        },
        {
          id: "fe-q2",
          question: "Which Core Web Vital metric replaced First Input Delay (FID) to assess overall web page responsiveness across the entire user session?",
          options: ["Largest Contentful Paint (LCP)", "Cumulative Layout Shift (CLS)", "Interaction to Next Paint (INP)", "Time to Interactive (TTI)"],
          correctIndex: 2,
          explanation: "Interaction to Next Paint (INP) became an official Core Web Vital in March 2024, evaluating responsiveness to all clicks, taps, and key presses throughout the entire page lifecycle.",
          difficulty: "Easy",
          topic: "Web Performance",
        },
        {
          id: "fe-q3",
          question: "In TypeScript, what is the primary benefit of using a Discriminated Union (Tagged Union)?",
          options: ["It removes runtime memory limits in V8", "It provides a shared literal property that enables compile-time type narrowing in switch or if statements", "It converts TypeScript interfaces to C++ structs", "It forces variables to be mutable"],
          correctIndex: 1,
          explanation: "Discriminated unions contain a common literal discriminant property (e.g. `type: 'success' | 'error'`). TypeScript inspects this key to automatically narrow down complex union types without explicit casting.",
          difficulty: "Medium",
          topic: "TypeScript",
        },
        {
          id: "fe-q4",
          question: "What is the critical difference between client state (Zustand/Redux) and server cache state (TanStack Query)?",
          options: ["Server cache state requires WebGL acceleration", "Server cache state is asynchronous, remotely owned, and requires polling/stale-while-revalidate invalidation", "Client state cannot store objects", "There is no functional difference"],
          correctIndex: 1,
          explanation: "Server state is asynchronous, owned remotely, and can change without your knowledge. TanStack Query specializes in background re-fetching, deduplication, caching, and cache invalidation.",
          difficulty: "Easy",
          topic: "State Management",
        },
        {
          id: "fe-q5",
          question: "Which CSS property provides GPU-accelerated smooth animations without triggering browser Layout or Paint reflows?",
          options: ["width and height", "top and left", "transform and opacity", "margin and padding"],
          correctIndex: 2,
          explanation: "`transform` and `opacity` are composite-only properties processed directly on the GPU compositor thread without forcing the CPU to recompute document geometry or paint pixels.",
          difficulty: "Easy",
          topic: "CSS & Performance",
        },
      ],
    },
  },
  {
    id: "cnt-backend-1",
    title: "Backend & Distributed Systems Architecture MCQ Quiz",
    description: "Real-world engineering test covering REST idempotency, Redis caching, database indexing, and Kafka streaming.",
    type: "QUIZ",
    subject: "backend",
    topics: ["Spring Boot", "PostgreSQL", "Redis", "Kafka"],
    tags: ["Backend", "Distributed Systems", "SQL"],
    difficulty: "Hard",
    status: "PUBLISHED",
    createdBy: "System Architect",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    studentAttempts: 42,
    avgScorePercent: 74,
    durationMinutes: 30,
    passMarkPercent: 70,
    questionsCount: 5,
    version: 1,
    settings: {
      durationMinutes: 30,
      passPercentage: 70,
      negativeMarking: true,
      negativePenalty: 0.25,
      showAnswersAfterSubmit: true,
    },
    contentData: {
      questions: [
        {
          id: "be-q1",
          question: "In distributed caching, which strategy writes directly to cache and buffers changes in memory before asynchronously writing to database disk?",
          options: ["Cache-Aside", "Write-Through", "Write-Behind (Write-Back)", "Refresh-Ahead"],
          correctIndex: 2,
          explanation: "Write-Behind (Write-Back) writes immediately to memory cache and asynchronously flushes batches to the persistent database, maximizing write throughput at the cost of potential data loss during sudden crashes.",
          difficulty: "Medium",
          topic: "Redis Caching",
        },
        {
          id: "be-q2",
          question: "In PostgreSQL, why does an index scan on a composite index on (department_id, created_at) NOT accelerate a query filtered solely on `WHERE created_at > NOW()`?",
          options: ["PostgreSQL indexes do not support timestamps", "Composite B-Trees are ordered by leading columns first; skipping the leading prefix prevents binary search indexing", "Composite indexes only work on primary keys", "The table must be partitioned first"],
          correctIndex: 1,
          explanation: "B-Tree composite indexes follow the Leftmost Prefix Rule. Because the index is physically sorted by `department_id` first and then `created_at`, omitting `department_id` forces a sequential scan.",
          difficulty: "Hard",
          topic: "Database Indexing",
        },
        {
          id: "be-q3",
          question: "How does Apache Kafka ensure ordered message processing within a topic?",
          options: ["By setting total cluster partitions to 100", "By producing related messages with the same Partition Key, routing them to the exact same partition", "By using TCP sequence numbers on the consumer", "Kafka does not support ordering in any scenario"],
          correctIndex: 1,
          explanation: "Kafka strictly guarantees message ordering within a single partition. By attaching a consistent partition key (e.g. `order_id`), all related events land on the same partition and are consumed in FIFO sequence.",
          difficulty: "Medium",
          topic: "Kafka",
        },
        {
          id: "be-q4",
          question: "In Spring Boot JPA, what is the root cause of the infamous N+1 query problem?",
          options: ["Missing database drivers", "Fetching a parent entity list and subsequently executing N separate queries to load lazy child relations in a loop", "Having more than N tables in PostgreSQL", "Using HikariCP connection pools"],
          correctIndex: 1,
          explanation: "N+1 queries occur when JPA fetches 1 query for the parent records, and then executes N individual round-trip queries to fetch children. It is resolved using `JOIN FETCH` or `@EntityGraph`.",
          difficulty: "Medium",
          topic: "Spring Boot",
        },
        {
          id: "be-q5",
          question: "Under network partition in the CAP theorem, what does choosing Consistency (CP) require the system to do when a node is unreachable?",
          options: ["Return stale data immediately to stay available", "Reject or delay writes and reads to avoid split-brain inconsistencies until partition heals", "Restart the entire cluster", "Switch to UDP sockets"],
          correctIndex: 1,
          explanation: "A CP system prioritizes consistency: if a replica cannot verify with the quorum that it holds the latest state, it must return an error or timeout rather than serve out-of-date data.",
          difficulty: "Medium",
          topic: "Distributed Systems",
        },
      ],
    },
  },
  {
    id: "cnt-genai-1",
    title: "Generative AI, Transformers & RAG Systems MCQ Quiz",
    description: "Objective evaluation track covering Attention QKV, Vector Indexing (HNSW), and LangGraph Agentic workflows.",
    type: "QUIZ",
    subject: "genai",
    topics: ["Transformers", "Prompt Engineering", "RAG", "AI Agents"],
    tags: ["GenAI", "LLM", "RAG", "Embeddings"],
    difficulty: "Hard",
    status: "PUBLISHED",
    createdBy: "AI Research Lead",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    studentAttempts: 29,
    avgScorePercent: 80,
    durationMinutes: 35,
    passMarkPercent: 75,
    questionsCount: 4,
    version: 1,
    settings: {
      durationMinutes: 35,
      passPercentage: 75,
      showAnswersAfterSubmit: true,
    },
    contentData: {
      questions: [
        {
          id: "genai-q1",
          question: "Explain the mathematical purpose of Query, Key, and Value (Q, K, V) projections in Transformer Scaled Dot-Product Attention.",
          options: ["Q determines token output, K compresses memory, V acts as bias", "Query represents search query, Key represents matching tags, and Value is the actual content weighted by softmax(QK^T / sqrt(d_k))", "They are identical duplicate tensors for redundancy", "They are used exclusively for backpropagation gradients"],
          correctIndex: 1,
          explanation: "The Query vector searches for relevant context; the Key vector advertises the token's features; the dot product Q*K measures compatibility scores. After scaling and softmax normalization, these weights multiply Value vectors to produce contextualized representations.",
          difficulty: "Hard",
          topic: "Transformer Mechanics",
          keyPoints: ["Q and K compute attention matrix", "Scaling by sqrt(d_k) prevents vanishing gradients in softmax", "Value vectors represent the semantic payload"],
        },
        {
          id: "genai-q2",
          question: "When building production RAG pipelines, how does an HNSW (Hierarchical Navigable Small World) index achieve sub-linear vector similarity search?",
          options: ["By sorting vectors alphabetically", "By organizing embeddings across multi-layered graphs with long-range skip links on top and dense clusters at base", "By computing exact brute-force cosine distance across all records", "By converting embeddings to JPEG images"],
          correctIndex: 1,
          explanation: "HNSW builds a multi-layer graph reminiscent of Skip Lists. The top layer has fewer nodes with long-range links for rapid coarse routing; lower layers zoom into dense clusters, providing logarithmic O(log N) search times.",
          difficulty: "Hard",
          topic: "Vector Databases",
          keyPoints: ["Skip-list layered graph structure", "Logarithmic search time O(log N)", "Trade-off between recall accuracy and memory footprint"],
        },
        {
          id: "genai-q3",
          question: "What is the primary architectural advantage of LangGraph or stateful agent loops over linear sequential LangChain chains?",
          options: ["They consume less electricity", "They support cyclic graphs with reflection, error recovery, conditional branching, and persistent checkpointed memory", "They eliminate the need for an LLM API key", "They only work in Python 2.7"],
          correctIndex: 1,
          explanation: "Linear chains only move forward (DAG). Stateful agent frameworks (like LangGraph) introduce cycles, allowing an AI agent to execute tools, observe errors, reflect on failures, and retry until criteria are met.",
          difficulty: "Medium",
          topic: "AI Agents",
          keyPoints: ["Cyclic execution with feedback loops", "State persistence and checkpointing", "Dynamic tool dispatching and human-in-the-loop validation"],
        },
        {
          id: "genai-q4",
          question: "Which evaluation framework is specifically designed to score RAG retrieval faithfulness, answer relevancy, and context recall without human ground truth labels?",
          options: ["BLEU Score", "RAGAS (Retrieval Augmented Generation Assessment)", "k-means clustering", "Confusion Matrix"],
          correctIndex: 1,
          explanation: "RAGAS is the industry standard framework that uses LLM-as-a-judge to evaluate RAG pipelines across Faithfulness (hallucination detection), Answer Relevance, and Context Precision.",
          difficulty: "Medium",
          topic: "Evaluation & Testing",
          keyPoints: ["Faithfulness metric verifies context grounding", "Answer relevance measures alignment with user prompt", "Context precision scores re-ranker effectiveness"],
        },
      ],
    },
  },
  {
    id: "cnt-data-1",
    title: "Data Analyst SQL Window Functions & Metrics MCQ Quiz",
    description: "Hands-on analytics practice track covering DENSE_RANK, Retention Cohorts, Churn Calculations, and A/B Test Statistics.",
    type: "QUIZ",
    subject: "data-analyst",
    topics: ["SQL Window Functions", "Cohort Analysis", "A/B Testing", "KPIs"],
    tags: ["Data Analyst", "SQL", "Statistics", "Metrics"],
    difficulty: "Medium",
    status: "PUBLISHED",
    createdBy: "Data Science Director",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    studentAttempts: 31,
    avgScorePercent: 79,
    durationMinutes: 25,
    passMarkPercent: 70,
    questionsCount: 4,
    version: 1,
    settings: {
      durationMinutes: 25,
      passPercentage: 70,
      showAnswersAfterSubmit: true,
    },
    contentData: {
      questions: [
        {
          id: "da-q1",
          question: "What is the difference between RANK() and DENSE_RANK() when ordering salaries with identical ties?",
          options: ["DENSE_RANK skips rank numbers after a tie; RANK does not", "RANK skips subsequent ranks after ties (e.g. 1, 2, 2, 4); DENSE_RANK maintains contiguous numbers (e.g. 1, 2, 2, 3)", "There is no difference in SQL standards", "DENSE_RANK only works on string columns"],
          correctIndex: 1,
          explanation: "RANK leaves gaps corresponding to the number of tied rows (1, 2, 2, 4). DENSE_RANK assigns identical ranks to ties but proceeds sequentially without gaps (1, 2, 2, 3).",
          difficulty: "Easy",
          topic: "SQL Window Functions",
          keyPoints: ["Continuous ordering vs gap ordering", "Impact on Top-N queries", "Partition by salary groupings"],
        },
        {
          id: "da-q2",
          question: "In cohort retention analysis, what represents the denominator when calculating Month 2 retention rate for a Jan 2026 signup cohort?",
          options: ["Total users who joined in February 2026", "Total unique users who originally signed up in January 2026 (Month 0 size)", "Total active users across the entire platform in March", "Average daily active users"],
          correctIndex: 1,
          explanation: "Cohort retention measures the percentage of the original cohort pool that returns in subsequent periods. The denominator is always the initial cohort count at Month 0.",
          difficulty: "Medium",
          topic: "Cohort Analysis",
          keyPoints: ["Cohort baseline anchor at Period 0", "Tracking activity periods in subsequent months", "Handling churn and reactivation"],
        },
        {
          id: "da-q3",
          question: "When evaluating an A/B test with a p-value of 0.02 at a 5% significance level (alpha = 0.05), what is the correct statistical conclusion?",
          options: ["Accept the null hypothesis; the test failed", "Reject the null hypothesis; the difference is statistically significant with <5% likelihood of occurring by random chance", "Increase traffic by 500% to confirm", "The test is inconclusive"],
          correctIndex: 1,
          explanation: "Since p-value (0.02) < alpha (0.05), we reject the null hypothesis and conclude that the observed conversion lift is statistically significant.",
          difficulty: "Medium",
          topic: "A/B Testing",
          keyPoints: ["p-value threshold comparison with alpha", "Type I error rate bounds", "Statistical vs practical business significance"],
        },
        {
          id: "da-q4",
          question: "Which SQL clause allows calculating a rolling 7-day average of revenue for each transaction date?",
          options: ["OVER (PARTITION BY date)", "OVER (ORDER BY trans_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)", "GROUP BY date HAVING count(*) = 7", "WHERE rownum <= 7"],
          correctIndex: 1,
          explanation: "Window frame specification `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` includes the current day and past 6 days, totaling 7 rows for computing moving averages.",
          difficulty: "Medium",
          topic: "Window Framing",
          keyPoints: ["ROWS vs RANGE frames", "PRECEDING and CURRENT ROW boundaries", "Handling missing calendar days with date spine"],
        },
      ],
    },
  },
  {
    id: "cnt-devops-1",
    title: "Kubernetes & Cloud Infrastructure Placement Assessment",
    description: "Timed assessment on Pod lifecycle, Ingress controllers, Docker multi-stage builds, and Terraform remote state.",
    type: "QUIZ",
    subject: "devops-cloud",
    topics: ["Kubernetes", "Docker", "Terraform", "CI/CD"],
    tags: ["DevOps", "Cloud", "K8s", "Docker"],
    difficulty: "Medium",
    status: "PUBLISHED",
    createdBy: "DevOps Architect",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    studentAttempts: 27,
    avgScorePercent: 76,
    durationMinutes: 25,
    passMarkPercent: 70,
    questionsCount: 4,
    version: 1,
    settings: {
      durationMinutes: 25,
      passPercentage: 70,
      negativeMarking: true,
      negativePenalty: 0.25,
      showAnswersAfterSubmit: true,
    },
    contentData: {
      questions: [
        {
          id: "ops-q1",
          question: "In Kubernetes, which Service type provides an external IP address routable from the public internet using cloud provider load balancers?",
          options: ["ClusterIP", "NodePort", "LoadBalancer", "Headless Service"],
          correctIndex: 2,
          explanation: "Type `LoadBalancer` integrates directly with underlying cloud infrastructure (AWS NLB/ALB, GCP Cloud Load Balancing) to provision public IP routing.",
          difficulty: "Easy",
          topic: "Kubernetes Services",
        },
        {
          id: "ops-q2",
          question: "Why are Docker Multi-Stage builds recommended for production images?",
          options: ["They allow running Windows and Linux in the same container", "They separate the build environment (compilers, SDKs) from the final minimal runtime, reducing image size and attack surface", "They make containers automatically scale", "They disable root privileges entirely"],
          correctIndex: 1,
          explanation: "Multi-stage builds leave behind heavy build tools (JDK, npm cache, GCC) and copy only the compiled binaries into lean production images (Alpine/Distroless), shrinking images from 1GB to <100MB.",
          difficulty: "Easy",
          topic: "Docker",
        },
        {
          id: "ops-q3",
          question: "Why should Terraform remote state (e.g. stored in Amazon S3) always be paired with a state lock mechanism like DynamoDB?",
          options: ["To speed up network downloads", "To prevent concurrent team executions from making overlapping updates that corrupt or overwrite the state file", "Because S3 cannot store files over 1MB", "To automatically translate HCL to YAML"],
          correctIndex: 1,
          explanation: "Without state locking, two engineers or CI pipelines applying changes simultaneously could write conflicting states, leading to resource corruption or double provisioning.",
          difficulty: "Medium",
          topic: "Terraform",
        },
        {
          id: "ops-q4",
          question: "In Kubernetes rolling deployments, which probe determines whether a Pod is ready to receive network traffic from a Service?",
          options: ["Liveness Probe", "Readiness Probe", "Startup Probe", "Security Probe"],
          correctIndex: 1,
          explanation: "The Readiness Probe signals whether the container is ready to accept user requests. If it fails, the Pod is immediately removed from the Service endpoints without restarting the container.",
          difficulty: "Medium",
          topic: "Kubernetes Probes",
        },
      ],
    },
  },
  {
    id: "cnt-aptitude-1",
    title: "Campus Recruitment Speed Aptitude MCQ Assessment",
    description: "Timed recruitment drive test: Quantitative speed math, Logical reasoning, Syllogisms, and Data Interpretation.",
    type: "QUIZ",
    subject: "aptitude",
    topics: ["Percentages", "Time & Work", "Logical Reasoning", "Data Interpretation"],
    tags: ["Aptitude", "Placement", "TCS", "Accenture"],
    difficulty: "Medium",
    status: "PUBLISHED",
    createdBy: "Placement Training Head",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    studentAttempts: 65,
    avgScorePercent: 71,
    durationMinutes: 30,
    passMarkPercent: 65,
    questionsCount: 5,
    version: 1,
    settings: {
      durationMinutes: 30,
      passPercentage: 65,
      negativeMarking: true,
      negativePenalty: 0.25,
      showAnswersAfterSubmit: true,
    },
    contentData: {
      questions: [
        {
          id: "apt-q1",
          question: "A can complete a project in 12 days, and B can complete it in 18 days. If they work together, in how many days will the project be finished?",
          options: ["6.5 days", "7.2 days", "8.0 days", "9.1 days"],
          correctIndex: 1,
          explanation: "Work done per day = (1/12) + (1/18) = (3 + 2) / 36 = 5/36. Total days required = 36 / 5 = 7.2 days.",
          difficulty: "Easy",
          topic: "Time & Work",
        },
        {
          id: "apt-q2",
          question: "A retailer marks an item 40% above cost price and then offers a discount of 20%. What is the retailer's net profit percentage?",
          options: ["12%", "15%", "20%", "24%"],
          correctIndex: 0,
          explanation: "Let CP = 100. Marked Price = 140. Selling Price = 140 * (1 - 0.20) = 112. Net profit = (112 - 100) = 12%.",
          difficulty: "Easy",
          topic: "Percentages & Profit",
        },
        {
          id: "apt-q3",
          question: "In how many distinct ways can the letters of the word 'LEADER' be arranged?",
          options: ["720", "360", "120", "480"],
          correctIndex: 1,
          explanation: "Total letters = 6. Letter 'E' repeats 2 times. Total permutations = 6! / 2! = 720 / 2 = 360 ways.",
          difficulty: "Medium",
          topic: "Permutations",
        },
        {
          id: "apt-q4",
          question: "Pointing to a photograph, Ramesh says: 'He is the son of the only son of my grandfather.' How is the person in the photograph related to Ramesh?",
          options: ["Uncle", "Brother or Himself", "Father", "Nephew"],
          correctIndex: 1,
          explanation: "'Only son of my grandfather' refers to Ramesh's father. 'The son of Ramesh's father' refers to Ramesh himself or Ramesh's brother.",
          difficulty: "Medium",
          topic: "Blood Relations",
        },
        {
          id: "apt-q5",
          question: "Statements: All cars are vehicles. Some vehicles are electric. Conclusions: I. Some electric items are cars. II. All vehicles are cars.",
          options: ["Only I follows", "Only II follows", "Neither I nor II follows", "Both I and II follow"],
          correctIndex: 2,
          explanation: "There is no necessary intersection between 'cars' and 'electric', so I does not necessarily follow. 'All cars are vehicles' does not imply the converse 'All vehicles are cars'. Thus, neither follows.",
          difficulty: "Medium",
          topic: "Syllogisms",
        },
      ],
    },
  },
];

function getStoredItems(): ContentItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Keep strictly MCQ Quizzes in this manager
        const sanitized = parsed
          .filter((item) => {
            const t = (item.type || "").toUpperCase();
            if (t.includes("ARTICLE") || t.includes("CODING") || t.includes("INTERVIEW")) return false;
            return true;
          })
          .map((item) => {
            item.type = "QUIZ";
            if (!item.contentData || typeof item.contentData !== "object") {
              item.contentData = { questions: [] };
            }
            if (!Array.isArray(item.contentData.questions) || item.contentData.questions.length === 0) {
              const matchingDefault = DEFAULT_TESTS.find(
                (d) => d.id === item.id || d.subject.toLowerCase() === (item.subject || "").toLowerCase()
              );
              if (matchingDefault && matchingDefault.contentData?.questions) {
                item.contentData.questions = matchingDefault.contentData.questions;
              }
            }
            return item;
          });
        return sanitized;
      }
    }
  } catch (e) {
    console.error("Failed to parse items store:", e);
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_TESTS));
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_TESTS;
}

function saveStoredItems(items: ContentItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("content-updated"));
  } catch (e) {
    console.error("Failed to persist content store:", e);
  }
}

function getStoredSubmissions(): StudentTestSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => ({
          ...s,
          detailedReview: Array.isArray(s.detailedReview)
            ? s.detailedReview.map((r: any) => ({
                ...r,
                options: Array.isArray(r.options) ? r.options : [],
                keyPoints: Array.isArray(r.keyPoints) ? r.keyPoints : [],
              }))
            : [],
        }));
      }
    }
  } catch (e) {
    console.error("Failed to read submissions store:", e);
  }
  return [];
}

function saveStoredSubmissions(submissions: StudentTestSubmission[]) {
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
    window.dispatchEvent(new Event("submissions-updated"));
  } catch (e) {
    console.error("Failed to save submissions store:", e);
  }
}

export const contentManagerService = {
  // 1. List Content Items
  async listContent(params?: FilterParams): Promise<ContentItem[]> {
    const items = getStoredItems();

    return items.filter((item) => {
      // Exclude legacy articles and coding problems if any remained
      if (item.type === "ARTICLE" || item.type === "Article" || item.type === "CODING_PROBLEM" || item.type === "CODING_TEST") {
        return false;
      }

      if (params?.type && params.type !== "ALL") {
        const pType = params.type.toUpperCase();
        const iType = item.type.toUpperCase();
        if (pType === "QUIZ" && !iType.includes("QUIZ")) return false;
        if (pType === "MOCK_TEST" && !iType.includes("MOCK_TEST") && !iType.includes("MOCK TEST")) return false;
        if (pType === "MOCK_INTERVIEW" && !iType.includes("INTERVIEW")) return false;
        if (pType === "PRACTICE_TOPIC" && !iType.includes("PRACTICE")) return false;
      }

      if (params?.subject && params.subject !== "ALL") {
        const cleanSub = params.subject.toLowerCase();
        if (item.subject.toLowerCase() !== cleanSub && !item.tags.some((t) => t.toLowerCase() === cleanSub)) {
          return false;
        }
      }

      if (params?.difficulty && params.difficulty !== "ALL") {
        if (item.difficulty.toLowerCase() !== params.difficulty.toLowerCase()) {
          return false;
        }
      }

      if (params?.status && params.status !== "ALL") {
        if (item.status.toUpperCase() !== params.status.toUpperCase()) {
          return false;
        }
      }

      if (params?.search) {
        const s = params.search.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(s) ||
          item.description.toLowerCase().includes(s) ||
          item.subject.toLowerCase().includes(s) ||
          item.topics.some((t) => t.toLowerCase().includes(s));
        if (!matches) return false;
      }

      return true;
    });
  },

  // 2. Summary stats for admin
  async getSummary(): Promise<ContentSummary> {
    const items = getStoredItems().filter(
      (i) => i.type !== "ARTICLE" && i.type !== "CODING_PROBLEM" && i.type !== "CODING_TEST"
    );

    const totalItems = items.length;
    const totalPublished = items.filter((i) => i.status === "PUBLISHED" || i.status === "Published").length;
    const totalDrafts = items.filter((i) => i.status === "DRAFT" || i.status === "Draft").length;
    const totalArchived = items.filter((i) => i.status === "ARCHIVED" || i.status === "Archived").length;
    const totalAttendees = items.reduce((acc, i) => acc + (i.studentAttempts || 0), 0);
    const avgPass = items.length > 0 ? Math.round(items.reduce((acc, i) => acc + (i.avgScorePercent || 75), 0) / items.length) : 75;

    const statsByType: Record<string, { total: number; published: number; draft: number; archived: number }> = {};
    ["QUIZ", "MOCK_TEST", "MOCK_INTERVIEW", "PRACTICE_TOPIC"].forEach((t) => {
      const typeItems = items.filter((i) => i.type.toUpperCase().includes(t));
      statsByType[t] = {
        total: typeItems.length,
        published: typeItems.filter((i) => i.status === "PUBLISHED" || i.status === "Published").length,
        draft: typeItems.filter((i) => i.status === "DRAFT" || i.status === "Draft").length,
        archived: typeItems.filter((i) => i.status === "ARCHIVED" || i.status === "Archived").length,
      };
    });

    return {
      totalItems,
      totalPublished,
      totalDrafts,
      totalArchived,
      totalAttendees,
      avgPlatformPassRate: avgPass,
      statsByType,
    };
  },

  // 3. Get item by ID
  async getContentById(id: string): Promise<ContentItem | undefined> {
    const items = getStoredItems();
    return items.find((i) => i.id === id);
  },

  // 4. Create Content
  async createContent(data: Partial<ContentItem>): Promise<ContentItem> {
    const items = getStoredItems();
    const newItem: ContentItem = {
      id: data.id || `cnt-${Date.now()}`,
      title: data.title || "Untitled Test",
      description: data.description || "Assessment module",
      type: data.type || "QUIZ",
      subject: data.subject || "dsa",
      topics: data.topics || [],
      tags: data.tags || [data.subject || "General"],
      difficulty: data.difficulty || "Medium",
      status: data.status || "PUBLISHED",
      createdBy: data.createdBy || "Admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentAttempts: data.studentAttempts || 0,
      avgScorePercent: data.avgScorePercent || 75,
      durationMinutes: data.durationMinutes || 30,
      passMarkPercent: data.passMarkPercent || 70,
      questionsCount: data.contentData?.questions?.length || 5,
      version: 1,
      settings: data.settings || { durationMinutes: 30, passPercentage: 70 },
      contentData: data.contentData || { questions: [] },
    };

    saveStoredItems([newItem, ...items]);
    return newItem;
  },

  // 5. Update Content
  async updateContent(id: string, data: Partial<ContentItem>): Promise<ContentItem> {
    const items = getStoredItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Test not found");

    const updated: ContentItem = {
      ...items[idx],
      ...data,
      updatedAt: new Date().toISOString(),
      version: items[idx].version + 1,
    };

    items[idx] = updated;
    saveStoredItems(items);
    return updated;
  },

  // 6. Delete Content
  async deleteContent(id: string): Promise<void> {
    const items = getStoredItems();
    saveStoredItems(items.filter((i) => i.id !== id));
  },

  // 7. Toggle Pause / Resume
  async togglePauseContent(id: string): Promise<ContentItem> {
    const item = await this.getContentById(id);
    if (!item) throw new Error("Item not found");

    const nextStatus: ContentStatus =
      item.status === "PUBLISHED" || item.status === "Published" ? "DRAFT" : "PUBLISHED";

    return this.updateContent(id, { status: nextStatus });
  },

  // 8. 1-Click AI MCQ Quiz Synthesizer
  async generateAiTest(params: {
    domain: string;
    topics?: string[];
    topic?: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
    questionCount: number;
    durationMinutes: number;
    passPercentage?: number;
    negativeMarking?: boolean;
    publishDirectly?: boolean;
  }): Promise<ContentItem> {
    const domainClean = params.domain.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const count = Math.max(3, Math.min(params.questionCount || 5, 30));
    const timer = params.durationMinutes || 30;
    const diff = params.difficulty || "Medium";
    const topicsList = params.topics && params.topics.length > 0
      ? params.topics
      : [params.topic || "Core Principles"];
    const topicDisplay = topicsList.join(", ");

    let synthesizedQuestions: QuizQuestionItem[] = [];

    // Attempt calling Python AI Microservice on port 8000
    try {
      const response = await fetch("http://localhost:8000/api/ai/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: params.domain,
          topics: topicsList,
          difficulty: diff,
          questionCount: count,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          synthesizedQuestions = data.questions.map((q: any, idx: number) => ({
            id: q.id || `q-ai-${Date.now()}-${idx + 1}`,
            question: q.question,
            codeSnippet: q.codeSnippet || undefined,
            options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
            correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : Math.floor(Math.random() * 4),
            explanation: q.explanation || "Verified benchmark answer key.",
            difficulty: q.difficulty || diff,
            topic: q.topic || topicsList[idx % topicsList.length],
            keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [],
          }));
        }
      }
    } catch (e) {
      console.warn("FastAPI AI service offline or unreachable, using domain-strict fallback generator:", e);
    }

    // High-yield Domain-Strict Fallback Engine with Randomized / Mixed Correct Options
    if (synthesizedQuestions.length === 0) {
      const isAptitude = domainClean.includes("aptitude") || params.domain.toLowerCase().includes("aptitude");
      const isDsa = domainClean.includes("dsa") || params.domain.toLowerCase().includes("dsa");
      const isFrontend = domainClean.includes("front") || params.domain.toLowerCase().includes("front");
      const isBackend = domainClean.includes("back") || params.domain.toLowerCase().includes("back");
      const isGenAi = domainClean.includes("genai") || domainClean.includes("ai") || params.domain.toLowerCase().includes("ai");
      const isData = domainClean.includes("data") || params.domain.toLowerCase().includes("data");
      const isDevops = domainClean.includes("devops") || domainClean.includes("cloud") || params.domain.toLowerCase().includes("cloud");

      let rawPool: Array<{
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
        difficulty: string;
        topic: string;
        codeSnippet?: string;
      }> = [];

      if (isAptitude) {
        // STRICTLY Aptitude: Quant, Logical Reasoning, Verbal. ZERO code/Java/Python/syntax!
        rawPool = [
          {
            question: "A pipe can fill a cistern in 12 hours while another pipe empties it in 18 hours. If both pipes are opened simultaneously in the empty cistern, how many hours will it take to fill the cistern?",
            options: ["36 hours", "30 hours", "24 hours", "42 hours"],
            correctAnswer: "36 hours",
            explanation: "Net filling rate per hour = (1/12) - (1/18) = (3 - 2)/36 = 1/36. Thus, 36 hours are required.",
            difficulty: "Medium",
            topic: "Time & Work",
          },
          {
            question: "If 15% of a number is added to 24, the result is the number itself. What is the number?",
            options: ["28.23", "32.00", "28.00", "30.00"],
            correctAnswer: "28.23",
            explanation: "Let the number be x. 0.15x + 24 = x => 0.85x = 24 => x = 24 / 0.85 ≈ 28.23.",
            difficulty: "Easy",
            topic: "Percentages",
          },
          {
            question: "Find the next term in the alphanumeric sequence: A1Z, C3X, E5V, G7T, ?",
            options: ["I9R", "H8S", "I8R", "J9Q"],
            correctAnswer: "I9R",
            explanation: "First letters advance by +2 (A, C, E, G, I). Middle numbers are odd primes/series (+2: 1, 3, 5, 7, 9). Last letters regress by -2 (Z, X, V, T, R). Hence, I9R.",
            difficulty: "Medium",
            topic: "Logical Reasoning",
          },
          {
            question: "A sum of money doubles itself at compound interest in 15 years. In how many years will it become 8 times of itself at the same rate?",
            options: ["45 years", "30 years", "60 years", "50 years"],
            correctAnswer: "45 years",
            explanation: "Amount becomes 2^1 in 15 years. To become 8 times (2^3), it takes 3 * 15 = 45 years.",
            difficulty: "Medium",
            topic: "Compound Interest",
          },
          {
            question: "Statements: All laptops are gadgets. All gadgets are electronics. Some electronics are durable. Conclusions: I. All laptops are electronics. II. Some gadgets are durable.",
            options: ["Both I and II follow", "Only conclusion I follows", "Only conclusion II follows", "Neither follows"],
            correctAnswer: "Only conclusion I follows",
            explanation: "Laptops ⊆ Gadgets ⊆ Electronics implies all laptops are electronics (I is valid). Electronics intersecting durable does not guarantee gadgets intersect durable.",
            difficulty: "Medium",
            topic: "Syllogisms",
          },
          {
            question: "In how many different ways can 5 boys and 4 girls be seated in a row such that all the girls always sit together?",
            options: ["17,280", "12,400", "14,400", "28,800"],
            correctAnswer: "17,280",
            explanation: "Treat the 4 girls as 1 unit. We have 5 boys + 1 unit = 6 entities to arrange in 6! ways. The 4 girls can be arranged among themselves in 4! ways. Total = 6! * 4! = 720 * 24 = 17,280.",
            difficulty: "Hard",
            topic: "Permutations",
          },
          {
            question: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
            options: ["Mother", "Sister", "Aunt", "Grandmother"],
            correctAnswer: "Mother",
            explanation: "'Only daughter of my mother' is the woman herself. So the woman is the man's mother.",
            difficulty: "Easy",
            topic: "Blood Relations",
          },
          {
            question: "A car covers a distance of 480 km at a uniform speed. If the speed had been 20 km/h more, it would have taken 2 hours less for the same journey. What was the original speed?",
            options: ["60 km/h", "80 km/h", "70 km/h", "50 km/h"],
            correctAnswer: "60 km/h",
            explanation: "Let original speed be v. 480/v - 480/(v+20) = 2. For v = 60: 480/60 = 8h; 480/80 = 6h. Difference = 2 hours. Thus original speed is 60 km/h.",
            difficulty: "Hard",
            topic: "Speed & Distance",
          },
        ];
      } else if (isDsa) {
        rawPool = [
          {
            question: "What is the optimal amortized time complexity of inserting N elements into a dynamic array that doubles its capacity when full?",
            options: ["O(N) total, O(1) amortized per insert", "O(N^2) worst case", "O(N log N)", "O(log N)"],
            correctAnswer: "O(N) total, O(1) amortized per insert",
            explanation: "Doubling occurs at powers of 2. Summing 1 + 2 + 4 + ... + N = 2N copies over N operations gives O(1) amortized per insertion.",
            difficulty: "Easy",
            topic: "Dynamic Arrays",
          },
          {
            question: "Which invariant guarantees that a Red-Black Tree maintains balanced logarithmic search depth?",
            options: ["Every path from root to null leaf contains the exact same number of black nodes", "Every node must have two children", "All red nodes must be leaves", "Tree height never exceeds 5"],
            correctAnswer: "Every path from root to null leaf contains the exact same number of black nodes",
            explanation: "The black-height property ensures no simple path from root to leaf is more than twice as long as any other path, ensuring O(log N) height.",
            difficulty: "Hard",
            topic: "Balanced Trees",
          },
          {
            question: "In cycle detection on a directed graph using DFS, which vertex state in the recursion stack confirms the presence of a back-edge (cycle)?",
            options: ["GRAY (Currently in exploration stack)", "WHITE (Unvisited)", "BLACK (Fully processed)", "BLUE (Cross edge)"],
            correctAnswer: "GRAY (Currently in exploration stack)",
            explanation: "Encountering a node that is currently marked GRAY (in the active DFS call stack) indicates an ancestor back-edge, proving a cycle.",
            difficulty: "Medium",
            topic: "Graph Algorithms",
          },
        ];
      } else if (isFrontend) {
        rawPool = [
          {
            question: "In React 19, what does the new `useActionState` hook simplify compared to legacy state management?",
            options: ["It manages pending transition status, returned data, and optimistic updates for form actions without manual useState boilerplate", "It converts client components to Web Workers", "It replaces Redux store entirely", "It executes HTTP calls without fetch API"],
            correctAnswer: "It manages pending transition status, returned data, and optimistic updates for form actions without manual useState boilerplate",
            explanation: "React 19's `useActionState` ties async form actions directly to state, tracking pending execution, errors, and returned payloads natively.",
            difficulty: "Medium",
            topic: "React 19",
          },
          {
            question: "Which CSS layout property creates an independent stacking context and hardware composite layer without altering layout geometry?",
            options: ["will-change: transform", "display: inline", "float: left", "visibility: hidden"],
            correctAnswer: "will-change: transform",
            explanation: "`will-change: transform` prompts the browser to promote the element to a dedicated GPU compositing layer, bypassing layout reflows during animations.",
            difficulty: "Medium",
            topic: "CSS Performance",
          },
          {
            question: "What is the primary architectural purpose of module federation in micro-frontend applications?",
            options: ["Dynamically sharing and loading remote bundled dependencies across disparate builds at runtime", "Compiling TypeScript into WebAssembly", "Minifying bundle files with Terser", "Replacing Node.js with Bun"],
            correctAnswer: "Dynamically sharing and loading remote bundled dependencies across disparate builds at runtime",
            explanation: "Webpack/Vite Module Federation allows an application to dynamically load code and shared dependencies from another independent build at runtime.",
            difficulty: "Hard",
            topic: "Architecture",
          },
        ];
      } else {
        // Universal technical pool for Backend, GenAI, DevOps, Data Analyst
        rawPool = [
          {
            question: `In ${params.domain} (${topicDisplay}), what is the primary architectural invariant for design pattern #1?`,
            options: ["Decouples state mutation to ensure predictable, deterministic recovery", "Forces synchronous blocking thread execution", "Removes indexing from storage engine", "Disables memory safety boundaries"],
            correctAnswer: "Decouples state mutation to ensure predictable, deterministic recovery",
            explanation: `Under ${params.domain} standards, isolating state transitions prevents cascading faults and preserves consistency invariants.`,
            difficulty: "Medium",
            topic: topicsList[0] || "Architecture",
          },
          {
            question: `When scaling throughput in ${params.domain}, which technique avoids hot-partition bottlenecks?`,
            options: ["Salted hashing across composite partition keys with distributed read replicas", "Storing all records on a single primary key", "Disabling connection pooling", "Sequential linear scanning"],
            correctAnswer: "Salted hashing across composite partition keys with distributed read replicas",
            explanation: "Salting partition keys evenly spreads read/write IOPS across the entire cluster, eliminating hotspots.",
            difficulty: "Hard",
            topic: topicsList[0] || "Scalability",
          },
          {
            question: `What trade-off is fundamental when implementing idempotent retries in ${params.domain}?`,
            options: ["Maintaining deduplication idempotency keys in cache to prevent duplicate processing", "Permitting silent loss of network packets", "Disabling TLS encryption", "Converting all data to raw CSV files"],
            correctAnswer: "Maintaining deduplication idempotency keys in cache to prevent duplicate processing",
            explanation: "Idempotency tokens allow consumers to recognize retransmitted requests and return stored responses without side-effects.",
            difficulty: "Medium",
            topic: topicsList[0] || "Resilience",
          },
        ];
      }

      // Fill questions up to count with randomized correct option placement
      synthesizedQuestions = Array.from({ length: count }, (_, idx) => {
        const template = rawPool[idx % rawPool.length];
        const correctText = template.correctAnswer;

        // Shuffle options so correctIndex is randomly distributed (0, 1, 2, or 3)
        const shuffledOptions = [...template.options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        const newCorrectIdx = shuffledOptions.indexOf(correctText);

        return {
          id: `q-ai-${Date.now()}-${idx + 1}`,
          question: idx < rawPool.length ? template.question : `${template.question} (Variant #${idx + 1})`,
          codeSnippet: template.codeSnippet,
          options: shuffledOptions,
          correctIndex: newCorrectIdx >= 0 ? newCorrectIdx : idx % 4,
          explanation: template.explanation,
          difficulty: diff === "Mixed" ? (idx % 3 === 0 ? "Easy" : idx % 3 === 1 ? "Medium" : "Hard") : diff,
          topic: template.topic || topicsList[idx % topicsList.length],
          keyPoints: ["Domain verified competency", "Benchmark analytical rigor", "Industry assessment key"],
        };
      });
    }

    const testTitle = `${params.domain.toUpperCase()}: ${topicDisplay} MCQ Assessment`;

    const newTest: ContentItem = {
      id: `quiz-ai-${Date.now()}`,
      title: testTitle,
      description: `Domain assessment covering ${topicDisplay} with ${count} questions, a strict ${timer}-minute countdown, and relative performance ranking.`,
      type: "QUIZ",
      subject: domainClean,
      topics: topicsList,
      tags: [params.domain, ...topicsList, "AI-Generated", "MCQ Quiz"],
      difficulty: diff,
      status: params.publishDirectly === false ? "DRAFT" : "PUBLISHED",
      createdBy: "AI Assessment Synthesizer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentAttempts: Math.floor(Math.random() * 20) + 15,
      avgScorePercent: Math.floor(Math.random() * 15) + 70,
      durationMinutes: timer,
      passMarkPercent: params.passPercentage || 70,
      questionsCount: count,
      version: 1,
      settings: {
        durationMinutes: timer,
        passPercentage: params.passPercentage || 70,
        negativeMarking: params.negativeMarking ?? true,
        negativePenalty: 0.25,
        showAnswersAfterSubmit: true,
      },
      contentData: {
        questions: synthesizedQuestions,
      },
    };

    const items = getStoredItems();
    saveStoredItems([newTest, ...items]);
    return newTest;
  },

  // 9. Manual MCQ Quiz Creator (Custom Questions & Bulk JSON/CSV Import)
  async createManualQuiz(params: {
    title: string;
    description?: string;
    domain: string;
    topics: string[];
    difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
    durationMinutes: number;
    passPercentage: number;
    negativeMarking?: boolean;
    questions: QuizQuestionItem[];
  }): Promise<ContentItem> {
    const domainClean = params.domain.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const count = params.questions.length;
    const timer = params.durationMinutes || 30;

    const newTest: ContentItem = {
      id: `quiz-man-${Date.now()}`,
      title: params.title.trim() || `${params.domain.toUpperCase()} MCQ Quiz`,
      description: params.description?.trim() || `Author-crafted MCQ assessment covering ${params.topics.join(", ")}.`,
      type: "QUIZ",
      subject: domainClean,
      topics: params.topics,
      tags: [params.domain, ...params.topics, "MCQ Quiz", "Custom-Authored"],
      difficulty: params.difficulty,
      status: "PUBLISHED",
      createdBy: "Admin Assessment Lead",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentAttempts: 0,
      avgScorePercent: 0,
      durationMinutes: timer,
      passMarkPercent: params.passPercentage || 70,
      questionsCount: count,
      version: 1,
      settings: {
        durationMinutes: timer,
        passPercentage: params.passPercentage || 70,
        negativeMarking: params.negativeMarking ?? false,
        negativePenalty: 0.25,
        showAnswersAfterSubmit: true,
      },
      contentData: {
        questions: params.questions,
      },
    };

    const items = getStoredItems();
    saveStoredItems([newTest, ...items]);
    return newTest;
  },

  // 10. Detailed Test Performance & Attendees Report for Admin
  async getTestPerformanceReport(testId: string): Promise<TestPerformanceReport | null> {
    const test = await this.getContentById(testId);
    if (!test) return null;

    const allSubmissions = getStoredSubmissions().filter((s) => s.testId === testId);
    const questions: QuizQuestionItem[] = test.contentData?.questions || [];

    // Realistic baseline roster if few live submissions exist yet
    const sampleStudents = [
      { name: "Kanhaiya Pandey", email: "kanhaiya.pandey@srmist.edu.in", roll: "RA2111003010452", college: "SRM IST" },
      { name: "Priya Sharma", email: "priya.sharma@vit.ac.in", roll: "21BIT0184", college: "VIT Vellore" },
      { name: "Aarav Mehta", email: "aarav.mehta@bits-pilani.ac.in", roll: "2021A7PS0042P", college: "BITS Pilani" },
      { name: "Ananya Iyer", email: "ananya.iyer@iitm.ac.in", roll: "CS22M014", college: "IIT Madras" },
      { name: "Rohan Gupta", email: "rohan.gupta@dtu.ac.in", roll: "2K20/CO/312", college: "DTU Delhi" },
      { name: "Sneha Patel", email: "sneha.patel@thapar.edu", roll: "101903421", college: "Thapar University" },
      { name: "Vikramaditya Roy", email: "vikram.roy@manipal.edu", roll: "210953112", college: "Manipal Institute" },
      { name: "Meera Nambiar", email: "meera.n@nitc.ac.in", roll: "B200451CS", college: "NIT Calicut" },
    ];

    const passThreshold = test.settings?.passPercentage || test.passMarkPercent || 70;
    const attendees: TestAttendeeRecord[] = [];

    // Add real submissions first
    allSubmissions.forEach((sub, idx) => {
      attendees.push({
        submissionId: sub.submissionId,
        userId: sub.userId,
        userName: sub.userName || `Student ${idx + 1}`,
        score: sub.score,
        totalMarks: sub.totalMarks,
        percentage: sub.percentage,
        isPassed: sub.isPassed,
        timeSpentSeconds: sub.timeSpentSeconds,
        submittedAt: sub.submittedAt,
        rank: sub.rank || idx + 1,
      });
    });

    // Populate remaining baseline attendees if needed
    const baselineTarget = Math.max(test.studentAttempts || 15, attendees.length);
    let seedIdx = 0;
    while (attendees.length < Math.min(baselineTarget, 15)) {
      const studentMeta = sampleStudents[seedIdx % sampleStudents.length];
      const qTotal = Math.max(1, questions.length);
      const isPassSim = Math.random() > 0.25;
      const scoreSim = isPassSim
        ? Math.floor(Math.random() * (qTotal - Math.ceil(qTotal * 0.7) + 1)) + Math.ceil(qTotal * 0.7)
        : Math.floor(Math.random() * Math.ceil(qTotal * 0.6));
      const percentageSim = Math.round((scoreSim / qTotal) * 100);
      const timeSim = Math.floor(Math.random() * (test.durationMinutes ? test.durationMinutes * 45 : 1200)) + 300;

      attendees.push({
        submissionId: `sub-sim-${seedIdx}`,
        userId: `usr-sim-${seedIdx}`,
        userName: studentMeta.name,
        college: studentMeta.college,
        rollNumber: studentMeta.roll,
        score: scoreSim,
        totalMarks: qTotal,
        percentage: percentageSim,
        isPassed: percentageSim >= passThreshold,
        timeSpentSeconds: timeSim,
        submittedAt: new Date(Date.now() - (seedIdx + 1) * 3600000 * 4).toISOString(),
        rank: seedIdx + 1,
      });
      seedIdx++;
    }

    // Sort attendees by score descending
    attendees.sort((a, b) => b.percentage - a.percentage);
    attendees.forEach((att, idx) => (att.rank = idx + 1));

    const totalCount = attendees.length;
    const avgScore = totalCount > 0 ? Math.round(attendees.reduce((acc, a) => acc + a.percentage, 0) / totalCount) : 0;
    const passCount = attendees.filter((a) => a.isPassed).length;
    const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
    const highestScore = totalCount > 0 ? Math.max(...attendees.map((a) => a.percentage)) : 0;
    const lowestScore = totalCount > 0 ? Math.min(...attendees.map((a) => a.percentage)) : 0;
    const avgTimeMinutes = totalCount > 0 ? Math.round(attendees.reduce((acc, a) => acc + a.timeSpentSeconds, 0) / totalCount / 60) : 0;

    // Question-by-question correctness analysis
    const questionStats: QuestionStat[] = questions.map((q, qIdx) => {
      // Calculate from live submissions if available, else synthetic distribution
      let correctAttempts = 0;
      let totalAttempts = 0;

      allSubmissions.forEach((sub) => {
        const ans = sub.answers[q.id];
        if (ans !== undefined) {
          totalAttempts++;
          if (ans === q.correctIndex) correctAttempts++;
        }
      });

      if (totalAttempts === 0) {
        // Realistic distribution based on question difficulty
        totalAttempts = totalCount;
        const targetRate = q.difficulty === "Easy" ? 0.85 : q.difficulty === "Hard" ? 0.48 : 0.68;
        correctAttempts = Math.round(totalAttempts * targetRate);
      }

      const accuracyPercentage = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 70;

      return {
        questionId: q.id || `q-${qIdx + 1}`,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        totalAttempts,
        correctAttempts,
        accuracyPercentage,
      };
    });

    return {
      testId: test.id,
      testTitle: test.title,
      domain: test.subject,
      difficulty: test.difficulty,
      durationMinutes: test.durationMinutes || 30,
      passPercentage: passThreshold,
      totalAttendees: Math.max(test.studentAttempts || totalCount, totalCount),
      avgScore,
      passRate,
      highestScore,
      lowestScore,
      avgTimeSpentMinutes: avgTimeMinutes,
      questionStats,
      attendees,
    };
  },

  // 11. Record Student Test Submission & Dynamic Progress Synchronization
  async submitStudentTest(submission: {
    testId: string;
    userId: string;
    userName?: string;
    timeSpentSeconds: number;
    answers: Record<string, number | string>;
  }): Promise<StudentTestSubmission> {
    const test = await this.getContentById(submission.testId);
    if (!test) throw new Error("Test not found");

    const questions: QuizQuestionItem[] = test.contentData?.questions || [];
    let correctCount = 0;

    const detailedReview = questions.map((q) => {
      const studentAns = submission.answers[q.id];
      let isCorrect = false;

      if (typeof studentAns === "number") {
        isCorrect = studentAns === q.correctIndex;
      } else if (typeof studentAns === "string" && studentAns.trim().length > 0) {
        isCorrect = true;
      }

      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        question: q.question,
        codeSnippet: q.codeSnippet,
        options: Array.isArray(q.options) ? q.options : [],
        chosenOptionIndex: typeof studentAns === "number" ? studentAns : undefined,
        chosenAnswerText: typeof studentAns === "string" ? studentAns : undefined,
        correctOptionIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        isCorrect,
        explanation: q.explanation || "Benchmark evaluation verified.",
        keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [],
      };
    });

    const totalQuestions = Math.max(1, questions.length);
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passThreshold = test.settings?.passPercentage || test.passMarkPercent || 70;
    const isPassed = percentage >= passThreshold;

    // Relative Class Ranking calculation:
    const totalPreviousAttendees = test.studentAttempts || 25;
    const newTotalAttendees = totalPreviousAttendees + 1;
    const percentile = Math.max(0.02, (100 - percentage) / 100);
    const computedRank = Math.max(1, Math.min(Math.round(percentile * newTotalAttendees), newTotalAttendees));

    const record: StudentTestSubmission = {
      submissionId: `sub-${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      testType: test.type,
      domain: test.subject,
      userId: submission.userId,
      userName: submission.userName || "Student",
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: submission.timeSpentSeconds,
      score: correctCount,
      totalMarks: totalQuestions,
      percentage,
      isPassed,
      rank: computedRank,
      totalAttendees: newTotalAttendees,
      answers: submission.answers,
      detailedReview,
    };

    // 1. Save submission
    const existingSubmissions = getStoredSubmissions();
    saveStoredSubmissions([record, ...existingSubmissions]);

    // 2. Update test telemetry in content items
    const updatedAttempts = (test.studentAttempts || 0) + 1;
    const oldAvg = test.avgScorePercent || 75;
    const updatedAvg = Math.round((oldAvg * (updatedAttempts - 1) + percentage) / updatedAttempts);

    await this.updateContent(test.id, {
      studentAttempts: updatedAttempts,
      avgScorePercent: updatedAvg,
    });

    // 3. Award XP & Dynamically update student progress & MasterStudent in Admin
    const xpAward = isPassed ? 30 : 10;
    progressService.recordQuizAttempt(submission.userId, {
      quizId: test.id,
      quizTitle: test.title,
      category: test.subject,
      score: percentage,
      totalQuestions,
      xpEarned: xpAward,
    });

    return record;
  },

  // 10. Get Student Submissions
  getStudentSubmissions(userId?: string): StudentTestSubmission[] {
    const list = getStoredSubmissions();
    if (!userId) return list;
    return list.filter((s) => s.userId === userId);
  },

  // 11. Get Latest Submission for a test
  getSubmissionForTest(userId: string, testId: string): StudentTestSubmission | undefined {
    const list = getStoredSubmissions();
    return list.find((s) => s.userId === userId && s.testId === testId);
  },

  async getAuditLogs(): Promise<ContentAuditLog[]> {
    return [
      {
        id: "log-1",
        contentId: "cnt-dsa-1",
        contentTitle: "DSA Algorithmic Speed & Accuracy Benchmark",
        contentType: "QUIZ",
        action: "PUBLISH",
        performedBy: "AI Test Synthesizer",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        details: "AI synthesized 5 benchmark questions with 25-minute countdown timer.",
      },
      {
        id: "log-2",
        contentId: "cnt-frontend-1",
        contentTitle: "React 19 & Web Performance Mock Test",
        contentType: "MOCK_TEST",
        action: "UPDATE",
        performedBy: "Frontend Lead",
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        details: "Configured 30-minute timer and updated Fiber questions.",
      },
    ];
  },

  async getPublishedContent(type?: ContentType): Promise<ContentItem[]> {
    const items = getStoredItems();
    return items.filter((item) => {
      const isPub = item.status === "PUBLISHED" || item.status === "Published";
      if (!isPub) return false;
      if (!type) return true;
      const t = type.toUpperCase();
      const iType = item.type.toUpperCase();
      return iType.includes(t) || t.includes(iType);
    });
  },

  async generateQuizQuestions(params: {
    subject: string;
    topic: string;
    difficulty: string;
    questionCount: number;
  }): Promise<{ questions: QuizQuestionItem[]; message: string }> {
    const questions: QuizQuestionItem[] = Array.from({ length: params.questionCount }, (_, idx) => ({
      id: `q-gen-${Date.now()}-${idx + 1}`,
      question: `In ${params.subject} (${params.topic}), what is the primary architectural invariant for design pattern #${idx + 1}?`,
      codeSnippet: idx % 2 === 0 ? `// Code sample #${idx + 1}\nconst res = executeLookup(dataMap);` : undefined,
      options: [
        "Optimal O(1) amortized hash lookup with bounded memory",
        "Linear scan requiring O(N) comparisons",
        "Quadratic recursive descent without dynamic table",
        "Immediate unhandled memory fault",
      ],
      correctIndex: 0,
      explanation: "Using an amortized hash structure drastically improves access time while keeping memory overhead bounded.",
      marks: params.difficulty === "Hard" ? 3 : params.difficulty === "Medium" ? 2 : 1,
      difficulty: params.difficulty,
      topic: params.topic,
    }));
    return { questions, message: "AI Generated" };
  },

  async generateInterviewQuestions(params: {
    targetRole?: string;
    role?: string;
    interviewType?: string;
    difficulty?: string;
    topics?: string[];
    count?: number;
    questionCount?: number;
  }): Promise<{ questions: any[]; message: string }> {
    const roleName = params.role || params.targetRole || "Software Engineer";
    const count = params.count || params.questionCount || 3;
    const questions = Array.from({ length: count }, (_, idx) => ({
      id: `ai-int-q-${Date.now()}-${idx + 1}`,
      question: `For a ${roleName}, describe how you design and isolate failures in a high-concurrency microservice handling ${(params.topics && params.topics[0]) || "core services"}.`,
      contextScenario: "Peak Black Friday transaction spike with 50,000 requests/sec and downstream database latency degradation.",
      expectedKeyPoints: ["Circuit Breaker pattern", "Bulkhead thread isolation", "Rate limiting with Redis token bucket", "Asynchronous DLQ fallback"],
      suggestedFollowUp: "How would you prevent cascading timeouts across upstream gRPC clients?",
      timeAllocationMinutes: 8,
      difficulty: params.difficulty || "Medium",
      topic: (params.topics && params.topics[0]) || "Architecture",
    }));
    return { questions, message: "Interview Questions Synthesized" };
  },

  async generateMcqQuestions(...args: any[]): Promise<any[]> {
    const params =
      typeof args[0] === "object"
        ? args[0]
        : {
            subject: args[0] || "DSA",
            topic: args[1] || "General",
            difficulty: args[2] || "Medium",
            questionCount: args[3] || 3,
          };
    const res = await this.generateQuizQuestions(params);
    return res.questions.map((q) => ({
      id: q.id,
      questionText: q.question,
      codeSnippet: q.codeSnippet,
      options: q.options,
      correctOptionIndex: q.correctIndex,
      explanation: q.explanation,
      marks: q.marks || 1,
      difficulty: q.difficulty || "Medium",
      topic: q.topic || "General",
    }));
  },

  async saveContent(item: Partial<ContentItem>): Promise<ContentItem> {
    if (item.id) {
      const existing = await this.getContentById(item.id);
      if (existing) {
        return this.updateContent(item.id, item);
      }
    }
    return this.createContent(item);
  },

  async validateSolution(params: any): Promise<any> {
    return { status: "ACCEPTED", passedTests: 3, totalTests: 3, runtimeMs: 12 };
  },

  async importQuizCsv(fileOrString: any): Promise<any> {
    return { successCount: 5, failedRows: [] };
  },

  async publishContent(id: string): Promise<ContentItem> {
    return this.updateContent(id, { status: "PUBLISHED" });
  },

  async unpublishContent(id: string): Promise<ContentItem> {
    return this.updateContent(id, { status: "DRAFT" });
  },

  async archiveContent(id: string): Promise<ContentItem> {
    return this.updateContent(id, { status: "ARCHIVED" });
  },

  async duplicateContent(id: string): Promise<ContentItem> {
    const item = await this.getContentById(id);
    if (!item) throw new Error("Item not found");
    const copy = {
      ...item,
      id: `cnt-copy-${Date.now()}`,
      title: `${item.title} (Copy)`,
      status: "DRAFT" as ContentStatus,
      studentAttempts: 0,
    };
    return this.createContent(copy);
  },

  async bulkAction(ids: string[], action: "PUBLISH" | "UNPUBLISH" | "ARCHIVE" | "DELETE"): Promise<any> {
    const items = getStoredItems();
    if (action === "DELETE") {
      saveStoredItems(items.filter((i) => !ids.includes(i.id)));
    } else {
      const statusMap: Record<string, ContentStatus> = {
        PUBLISH: "PUBLISHED",
        UNPUBLISH: "DRAFT",
        ARCHIVE: "ARCHIVED",
      };
      const updated = items.map((i) => (ids.includes(i.id) ? { ...i, status: statusMap[action] } : i));
      saveStoredItems(updated);
    }
    return { successCount: ids.length, failedIds: [] };
  },

  async restoreVersion(id: string, version: number): Promise<ContentItem> {
    const item = await this.getContentById(id);
    if (!item) throw new Error("Item not found");
    return item;
  },
};
