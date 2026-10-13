export interface Topic {
  id: string;
  name: string;
  slug: string;
  subtopics?: string[];
  weekNumber?: number;
}

export interface RoadmapTask {
  id: string;
  label: string;
  type: "PRACTICE" | "QUIZ" | "CODING" | "INTERVIEW" | "READING";
  linkUrl: string;
  estimatedMinutes: number;
  topicSlug?: string;
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  focus: string;
  tasks: RoadmapTask[];
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  durationWeeks?: number;
  totalHours?: number;
  level?: string;
  isCustom?: boolean;
  topics: Topic[];
  weeks: RoadmapWeek[];
}

export const BASE_DOMAINS: Domain[] = [
  {
    id: "dom-dsa",
    name: "Data Structures & Algorithms",
    slug: "dsa",
    icon: "Binary",
    color: "#38bdf8",
    level: "Beginner to FAANG Placement",
    description: "Complete algorithmic mastery curriculum: from Big-O foundations, arrays, and recursion to trees, graphs, and dynamic programming.",
    durationWeeks: 8,
    totalHours: 90,
    topics: [
      { id: "top-arrays", name: "Arrays & Two Pointers", slug: "arrays", weekNumber: 2, subtopics: ["Prefix Sum", "Two Pointers", "Sliding Window", "Kadane's Algorithm"] },
      { id: "top-strings", name: "Strings & Pattern Matching", slug: "strings", weekNumber: 2, subtopics: ["Two Pointers", "Anagrams", "KMP Algorithm", "Trie"] },
      { id: "top-binarysearch", name: "Binary Search", slug: "binary-search", weekNumber: 3, subtopics: ["Rotated Sorted Array", "Search on Answer", "Lower & Upper Bounds"] },
      { id: "top-linkedlist", name: "Linked List", slug: "linked-list", weekNumber: 4, subtopics: ["Fast & Slow Pointers", "Reversal", "Cycle Detection", "Doubly Linked List"] },
      { id: "top-stackqueue", name: "Stack & Queue", slug: "stack-queue", weekNumber: 3, subtopics: ["Monotonic Stack", "Sliding Window Maximum", "Deque", "Priority Queue"] },
      { id: "top-trees", name: "Trees & BST", slug: "trees", weekNumber: 5, subtopics: ["Binary Tree Traversals", "Lowest Common Ancestor", "BST Validation", "Segment Trees"] },
      { id: "top-graphs", name: "Graphs", slug: "graphs", weekNumber: 6, subtopics: ["BFS & DFS", "Dijkstra's Shortest Path", "Topological Sort", "Disjoint Set Union (DSU)"] },
      { id: "top-dp", name: "Dynamic Programming", slug: "dynamic-programming", weekNumber: 7, subtopics: ["1D DP (House Robber)", "2D Grid DP", "0/1 Knapsack", "LCS & LIS"] },
      { id: "top-recursion", name: "Recursion & Backtracking", slug: "recursion-backtracking", weekNumber: 4, subtopics: ["Subsets", "Permutations", "N-Queens", "Sudoku Solver"] },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1: Algorithmic Foundations, Big-O & Bit Manipulation",
        focus: "Asymptotic notation (Time & Space complexity), recurrence relations, Bitwise operations, and number theory fundamentals.",
        tasks: [
          { id: "dsa-w1-1", label: "Read Guide: Big-O Asymptotics & Space Complexity Invariants", type: "READING", linkUrl: "/articles", estimatedMinutes: 25 },
          { id: "dsa-w1-2", label: "Solve 4 Bit Manipulation & Fast Exponentiation problems", type: "CODING", linkUrl: "/coding", estimatedMinutes: 75 },
          { id: "dsa-w1-3", label: "Take Time Complexity & Big-O Precision Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 2,
        title: "Week 2: Arrays, Two Pointers & Sliding Window",
        focus: "Prefix sum arrays, two-pointer inward search, and dynamic sliding window substring patterns.",
        tasks: [
          { id: "dsa-w2-1", label: "Solve 5 Benchmark Two-Pointer & Sliding Window challenges", type: "CODING", linkUrl: "/coding", estimatedMinutes: 90 },
          { id: "dsa-w2-2", label: "Practice Kadane's Algorithm & Subarray Sum Equals K", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 45 },
          { id: "dsa-w2-3", label: "Take Arrays & Hashing Placement Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 3,
        title: "Week 3: Binary Search on Answer & Monotonic Stacks",
        focus: "Searching on rotated arrays, search on monotonic answer space, Next Greater Element, and histogram area.",
        tasks: [
          { id: "dsa-w3-1", label: "Solve 4 Binary Search on Monotonic Answer Space problems", type: "CODING", linkUrl: "/coding", estimatedMinutes: 80 },
          { id: "dsa-w3-2", label: "Solve 4 Monotonic Stack & Queue benchmark challenges", type: "CODING", linkUrl: "/coding", estimatedMinutes: 75 },
          { id: "dsa-w3-3", label: "Take Stacks, Queues & Searching Concepts Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 4,
        title: "Week 4: Linked Lists & Recursion Backtracking",
        focus: "Floyd's cycle detection, list reversal, recursion tree call stack analysis, and subset/permutation generation.",
        tasks: [
          { id: "dsa-w4-1", label: "Solve 5 Linked List reversal & fast-slow pointer challenges", type: "CODING", linkUrl: "/coding", estimatedMinutes: 85 },
          { id: "dsa-w4-2", label: "Practice Backtracking: Subsets, Permutations & Combination Sum", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "dsa-w4-3", label: "Take Recursion & Backtracking Diagnostics Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 5,
        title: "Week 5: Trees, BST, Lowest Common Ancestor & Heaps",
        focus: "Tree DFS/BFS traversals, BST balance invariants, LCA computation, and Priority Queue Top-K patterns.",
        tasks: [
          { id: "dsa-w5-1", label: "Solve 5 Binary Tree Traversals, Path Sum & LCA problems", type: "CODING", linkUrl: "/coding", estimatedMinutes: 90 },
          { id: "dsa-w5-2", label: "Solve 3 Priority Queue & Top-K Frequent Elements problems", type: "CODING", linkUrl: "/coding", estimatedMinutes: 60 },
          { id: "dsa-w5-3", label: "Take Binary Trees & Heap Internals Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 6,
        title: "Week 6: Graph Algorithms, Shortest Paths & DSU",
        focus: "Connected components, cycle detection, Dijkstra's algorithm, Kahn's Topological Sort, and Disjoint Set Union.",
        tasks: [
          { id: "dsa-w6-1", label: "Solve 5 Graph Traversals, Shortest Path & Topological Sort challenges", type: "CODING", linkUrl: "/coding", estimatedMinutes: 110 },
          { id: "dsa-w6-2", label: "Practice Disjoint Set Union (DSU) & Minimum Spanning Tree", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 45 },
          { id: "dsa-w6-3", label: "Take Graph Theory & Search Algorithms Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
        ],
      },
      {
        weekNumber: 7,
        title: "Week 7: Dynamic Programming: 1D, 2D, Knapsack & Subsequences",
        focus: "Overlapping subproblems, state transitions, memoization vs tabulation, 0/1 Knapsack, LCS, and LIS.",
        tasks: [
          { id: "dsa-w7-1", label: "Solve 6 Core Dynamic Programming challenges (1D & 2D)", type: "CODING", linkUrl: "/coding", estimatedMinutes: 130 },
          { id: "dsa-w7-2", label: "Read Guide: Mastering DP Transitions & State Machine Patterns", type: "READING", linkUrl: "/articles", estimatedMinutes: 25 },
          { id: "dsa-w7-3", label: "Take Dynamic Programming Architectural Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
        ],
      },
      {
        weekNumber: 8,
        title: "Week 8: Advanced Data Structures & Mock Placement Rounds",
        focus: "Trie prefix matching, full algorithmic interview simulation under real pressure.",
        tasks: [
          { id: "dsa-w8-1", label: "Solve 3 Trie Prefix Search & Word Break challenges", type: "CODING", linkUrl: "/coding", estimatedMinutes: 60 },
          { id: "dsa-w8-2", label: "Complete SDE Full Algorithmic Mock Interview Room", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 60 },
          { id: "dsa-w8-3", label: "Attempt Full Timed Algorithmic Live Benchmark Test", type: "CODING", linkUrl: "/live-tests", estimatedMinutes: 90 },
        ],
      },
    ],
  },
  {
    id: "dom-frontend",
    name: "Frontend Development",
    slug: "frontend",
    icon: "Layout",
    color: "#06b6d4",
    level: "Beginner to Production Engineer",
    description: "Modern client-side web engineering: HTML5/CSS3 semantics, modern JS engine internals, TypeScript, React 19, web performance, and frontend system design.",
    durationWeeks: 7,
    totalHours: 80,
    topics: [
      { id: "top-htmlcss", name: "HTML5, CSS3 & Responsive Design", slug: "html-css", weekNumber: 1, subtopics: ["Semantic HTML", "Flexbox & Grid", "Tailwind CSS", "Responsive Media Queries"] },
      { id: "top-js", name: "JavaScript Deep Dive", slug: "javascript-deep-dive", weekNumber: 2, subtopics: ["Event Loop", "Closures & Scope", "Promises & Async/Await", "Prototypes & V8"] },
      { id: "top-ts", name: "TypeScript", slug: "typescript", weekNumber: 3, subtopics: ["Generics", "Utility Types", "Type Narrowing", "Discriminated Unions"] },
      { id: "top-react", name: "React 19 & Hooks", slug: "react", weekNumber: 4, subtopics: ["Fiber Architecture", "Custom Hooks", "Context API", "React Server Components"] },
      { id: "top-statemgmt", name: "State Management & Routing", slug: "state-management", weekNumber: 5, subtopics: ["Zustand", "Redux Toolkit", "TanStack Query", "Client-Side Routing"] },
      { id: "top-webperf", name: "Web Performance & Core Web Vitals", slug: "web-performance", weekNumber: 6, subtopics: ["LCP/INP/CLS", "Code Splitting", "Bundle Optimization", "Critical Path"] },
      { id: "top-fesysdesign", name: "Frontend System Design", slug: "frontend-system-design", weekNumber: 7, subtopics: ["Component Design Systems", "WebSockets Sync", "Offline First", "Micro-frontends"] },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1: Semantic HTML5, CSS3, Flexbox & Grid Systems",
        focus: "Accessible HTML semantics, CSS Box Model, CSS Flexbox & 2D Grid layouts, and mobile-first responsive architecture.",
        tasks: [
          { id: "fe-w1-1", label: "Read Guide: Modern Responsive Web Architecture & Grid Standards", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "fe-w1-2", label: "Build 2 Production-Grade Responsive UI Layouts", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "fe-w1-3", label: "Take HTML5 Semantics & Responsive Layout Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 2,
        title: "Week 2: JavaScript Engine Internals, Closures & Event Loop",
        focus: "Call stack, Web APIs, Microtask vs Macrotask queue, Closures, Lexical scope, Prototype chains, and Polyfills.",
        tasks: [
          { id: "fe-w2-1", label: "Read Deep Dive: JavaScript V8 Engine & Event Loop Internals", type: "READING", linkUrl: "/articles", estimatedMinutes: 25 },
          { id: "fe-w2-2", label: "Practice Implementing Polyfills (Promise.all, debounce, throttle)", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "fe-w2-3", label: "Take JavaScript Core & Async Event Loop Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 3,
        title: "Week 3: TypeScript Mastery for Production Applications",
        focus: "Generics, Utility Types (Partial, Pick, Omit), Type Narrowing, Discriminated Unions, and strict type safety.",
        tasks: [
          { id: "fe-w3-1", label: "Solve 3 Frontend Algorithmic challenges using TypeScript", type: "CODING", linkUrl: "/coding", estimatedMinutes: 70 },
          { id: "fe-w3-2", label: "Practice Advanced Generics & Discriminated Union Patterns", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "fe-w3-3", label: "Take TypeScript Type System & Strictness Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 4,
        title: "Week 4: React 19 Core, Hooks Lifecycle & Virtual DOM",
        focus: "Fiber architecture, reconciliation, useState, useEffect, useMemo, useCallback, useRef, and robust custom hooks.",
        tasks: [
          { id: "fe-w4-1", label: "Build 3 Custom React Hooks (useDebounce, useFetch, useIntersection)", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 75 },
          { id: "fe-w4-2", label: "Read Guide: React 19 Compiler, Actions & Server Components", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "fe-w4-3", label: "Take React Virtual DOM & Hooks Lifecycle Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 5,
        title: "Week 5: State Management, TanStack Query & Client Routing",
        focus: "Client state (Zustand/Redux) vs Server cache (TanStack Query), cache invalidation, and declarative routing.",
        tasks: [
          { id: "fe-w5-1", label: "Implement Global State Store with Optimistic UI updates", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "fe-w5-2", label: "Complete Frontend Technical Mock Interview Round 1", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 45 },
          { id: "fe-w5-3", label: "Take State Management & Cache Architecture Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 6,
        title: "Week 6: Web Performance, Critical Rendering Path & CWV",
        focus: "Core Web Vitals (LCP, INP, CLS), dynamic imports, code-splitting, tree-shaking, and asset optimization.",
        tasks: [
          { id: "fe-w6-1", label: "Read Guide: High-Performance Web Apps & Critical Rendering Path", type: "READING", linkUrl: "/articles", estimatedMinutes: 25 },
          { id: "fe-w6-2", label: "Practice Web Performance Profiling & Lighthouse optimization", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "fe-w6-3", label: "Take Core Web Vitals & Web Performance Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 7,
        title: "Week 7: Frontend System Design & Placement Assessment",
        focus: "Designing scalable web apps (Newsfeed, Auto-complete, Chat UI), offline-first caching, and final evaluation.",
        tasks: [
          { id: "fe-w7-1", label: "Practice Frontend System Design: Infinite Scroll & Realtime Chat", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "fe-w7-2", label: "Complete Senior Frontend Engineering Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 50 },
          { id: "fe-w7-3", label: "Attempt Full Frontend Placement Benchmark Test", type: "CODING", linkUrl: "/live-tests", estimatedMinutes: 90 },
        ],
      },
    ],
  },
  {
    id: "dom-backend",
    name: "Backend Development",
    slug: "backend",
    icon: "Server",
    color: "#10b981",
    level: "Beginner to Enterprise Architect",
    description: "Robust server-side engineering roadmap: REST/gRPC protocols, Java/Spring Boot & Node.js, database indexing, distributed caching, message queues, and high-concurrency architecture.",
    durationWeeks: 7,
    totalHours: 85,
    topics: [
      { id: "top-restapi", name: "APIs, HTTP Protocols & Security", slug: "rest-api", weekNumber: 1, subtopics: ["HTTP/1.1 vs HTTP/2", "REST Principles", "JWT Auth", "Rate Limiting"] },
      { id: "top-databases", name: "Databases, SQL & Query Optimization", slug: "databases", weekNumber: 2, subtopics: ["PostgreSQL", "B-Tree Indexes", "EXPLAIN ANALYZE", "ACID Transactions"] },
      { id: "top-springboot", name: "Spring Boot & Enterprise Architecture", slug: "spring-boot", weekNumber: 3, subtopics: ["Dependency Injection", "Spring Data JPA", "Hibernate N+1", "Spring Security"] },
      { id: "top-redis", name: "Distributed Caching (Redis)", slug: "caching-redis", weekNumber: 4, subtopics: ["Cache-Aside", "Write-Through", "Cache Stampede", "TTL Eviction"] },
      { id: "top-kafka", name: "Message Queues & Event Streaming", slug: "kafka-messaging", weekNumber: 5, subtopics: ["Kafka Brokers", "Consumer Groups", "Partitioning", "Idempotent Processing"] },
      { id: "top-microservices", name: "Microservices & Distributed Systems", slug: "microservices", weekNumber: 6, subtopics: ["Service Discovery", "API Gateway", "Circuit Breaker", "Distributed Tracing"] },
      { id: "top-concurrency", name: "Concurrency & High Availability", slug: "concurrency", weekNumber: 7, subtopics: ["Thread Pools", "HikariCP Connection Tuning", "k6 Load Testing", "Fault Tolerance"] },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1: Protocols, RESTful Standards & API Security",
        focus: "HTTP/1.1 vs HTTP/2 vs HTTP/3, status codes, idempotent methods, JWT refresh tokens, CORS, and rate limiting.",
        tasks: [
          { id: "be-w1-1", label: "Read Guide: Networking for Backend Developers: TCP, TLS & HTTP/3", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "be-w1-2", label: "Practice Designing Idempotent REST API Endpoints with Auth", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "be-w1-3", label: "Take Backend API Security & JWT Authentication Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 2,
        title: "Week 2: Relational Databases, SQL & Indexing Internals",
        focus: "PostgreSQL/MySQL storage engines, B-Trees vs Hash indexes, EXPLAIN ANALYZE, transaction isolation levels, and locks.",
        tasks: [
          { id: "be-w2-1", label: "Solve 5 Complex SQL Queries, Joins & Aggregations", type: "CODING", linkUrl: "/coding", estimatedMinutes: 80 },
          { id: "be-w2-2", label: "Read Guide: Storage Engines: B-Trees vs LSM Trees in Production", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "be-w2-3", label: "Take Relational Databases & Query Optimization Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 3,
        title: "Week 3: Spring Boot & Enterprise Backend Architecture",
        focus: "IoC/DI container, Spring Data JPA, solving Hibernate N+1 queries, DTO validation, and transaction boundaries.",
        tasks: [
          { id: "be-w3-1", label: "Practice Spring Boot Service Layer, DTO & Exception Handling", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "be-w3-2", label: "Complete Backend Technical Mock Interview Round 1", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 45 },
          { id: "be-w3-3", label: "Take Spring Boot & Enterprise JPA Optimization Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 4,
        title: "Week 4: Distributed Caching with Redis",
        focus: "Redis data structures (Hashes, Sets, Sorted Sets), Cache-Aside, Write-Through, cache penetration, and TTL eviction.",
        tasks: [
          { id: "be-w4-1", label: "Practice Distributed Caching & Rate Limiting using Redis", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 55 },
          { id: "be-w4-2", label: "Read Guide: Distributed Systems Caching Strategies & Stampede Defense", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "be-w4-3", label: "Take Redis & Distributed Caching Invariants Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 5,
        title: "Week 5: Asynchronous Messaging & Apache Kafka",
        focus: "Event-driven architecture, Kafka topics, partitions, consumer offset commits, dead letter queues, and idempotency.",
        tasks: [
          { id: "be-w5-1", label: "Practice Event Streaming & Consumer Group Rebalancing", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "be-w5-2", label: "Take Kafka & Asynchronous Message Brokers Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
          { id: "be-w5-3", label: "Read Guide: Designing Fault-Tolerant Distributed Message Queues", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 6,
        title: "Week 6: Microservices, API Gateways & Resiliency Patterns",
        focus: "Service discovery, API Gateway routing, Circuit Breakers (Resilience4j), Saga distributed transactions, and tracing.",
        tasks: [
          { id: "be-w6-1", label: "Practice Microservices Resiliency: Circuit Breaker & Fallbacks", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "be-w6-2", label: "Complete Backend System Design Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 50 },
          { id: "be-w6-3", label: "Take Microservices & Distributed Transactions Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 7,
        title: "Week 7: High Concurrency, Database Pools & Placement Benchmark",
        focus: "Multithreading, thread safety, HikariCP connection tuning, k6 stress testing, and final placement exam.",
        tasks: [
          { id: "be-w7-1", label: "Take Concurrency, Multithreading & Database Pools Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
          { id: "be-w7-2", label: "Complete Senior Backend Architect Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 60 },
          { id: "be-w7-3", label: "Attempt Full Backend Placement Benchmark Test", type: "CODING", linkUrl: "/live-tests", estimatedMinutes: 90 },
        ],
      },
    ],
  },
  {
    id: "dom-genai",
    name: "Generative AI & LLM Engineer",
    slug: "genai",
    icon: "BrainCircuit",
    color: "#8b5cf6",
    level: "Foundational to Applied AI Engineer",
    description: "Cutting-edge GenAI curriculum: Transformer mechanics, Prompt Engineering, RAG with Vector DBs, LangChain/LlamaIndex agents, LLM evaluation, and fine-tuning.",
    durationWeeks: 6,
    totalHours: 75,
    topics: [
      { id: "top-transformers", name: "Transformers & Attention Mechanism", slug: "transformers", weekNumber: 1, subtopics: ["Self-Attention", "Query-Key-Value", "Tokenization (BPE)", "Embeddings"] },
      { id: "top-prompting", name: "Prompt Engineering & Structured Outputs", slug: "prompt-engineering", weekNumber: 2, subtopics: ["Chain-of-Thought", "Few-Shot Prompting", "JSON Mode", "Function Calling"] },
      { id: "top-vectordb", name: "Vector Databases & Search", slug: "vector-databases", weekNumber: 3, subtopics: ["Pinecone & Chroma", "HNSW & Cosine Metric", "Hybrid Search", "Chunking Strategies"] },
      { id: "top-rag", name: "Production RAG Pipelines", slug: "rag-systems", weekNumber: 4, subtopics: ["Retrieval-Augmented Generation", "Re-ranking", "Context Window Management", "Guardrails"] },
      { id: "top-agents", name: "AI Agents & Autonomous Workflows", slug: "ai-agents", weekNumber: 5, subtopics: ["ReAct Framework", "LangChain & LangGraph", "Tool Integration", "Multi-Agent Systems"] },
      { id: "top-finetuning", name: "Evaluation, Fine-Tuning & Deployment", slug: "finetuning-eval", weekNumber: 6, subtopics: ["RAGAS Metrics", "LoRA / QLoRA", "Quantization", "vLLM Serving"] },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1: AI Math Foundations & Transformer Architecture",
        focus: "Vectors, dot products, embeddings, self-attention mechanics, Query/Key/Value projections, and positional encoding.",
        tasks: [
          { id: "ai-w1-1", label: "Read Guide: Attention Is All You Need: Step-by-Step Architecture", type: "READING", linkUrl: "/articles", estimatedMinutes: 25 },
          { id: "ai-w1-2", label: "Practice Vector Cosine Similarity & Matrix Dot-Products in Python", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "ai-w1-3", label: "Take Transformer Mechanics & Self-Attention Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 2,
        title: "Week 2: Prompt Engineering, Tool Use & Structured Outputs",
        focus: "Few-shot prompting, Chain-of-Thought (CoT), Pydantic schema validation, tool definitions, and function calling.",
        tasks: [
          { id: "ai-w2-1", label: "Practice Advanced Prompt Crafting & Tool Calling with Pydantic", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "ai-w2-2", label: "Take Prompt Engineering & Tool Calling Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "ai-w2-3", label: "Complete AI/ML Technical Screen Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 40 },
        ],
      },
      {
        weekNumber: 3,
        title: "Week 3: Vector Databases, HNSW Indexing & Hybrid Search",
        focus: "Vector embeddings, Chroma/Pinecone storage, approximate nearest neighbor search (HNSW), BM25 + Vector hybrid search.",
        tasks: [
          { id: "ai-w3-1", label: "Practice Document Chunking & Vector Ingestion into ChromaDB", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "ai-w3-2", label: "Read Guide: Vector Databases: HNSW vs IVFFlat Algorithms in Scale", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "ai-w3-3", label: "Take Vector Search & Embeddings Architecture Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 4,
        title: "Week 4: Production RAG & Hallucination Mitigation",
        focus: "Document loaders, contextual re-ranking with cross-encoders, citation grounding, and prompt defense against hallucination.",
        tasks: [
          { id: "ai-w4-1", label: "Practice Building an End-to-End RAG Knowledge System", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 70 },
          { id: "ai-w4-2", label: "Complete Generative AI Engineering Mock Interview Round", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 45 },
          { id: "ai-w4-3", label: "Take RAG Architecture & Context Retrieval Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 5,
        title: "Week 5: AI Agents, Workflows & Tool Orchestration",
        focus: "ReAct loop (Reasoning + Acting), LangGraph stateful agents, memory persistence, and multi-agent coordination.",
        tasks: [
          { id: "ai-w5-1", label: "Practice Building an Autonomous Multi-Tool Research Agent", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 75 },
          { id: "ai-w5-2", label: "Read Guide: Multi-Agent Systems: Planning, Reflection & Verification", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "ai-w5-3", label: "Take Agentic AI & Tool Orchestration Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 6,
        title: "Week 6: Evaluation (RAGAS), Fine-Tuning (LoRA) & Deployment",
        focus: "RAGAS faithfulness metrics, LLM-as-a-judge, LoRA parameter-efficient fine-tuning, quantization, and vLLM serving.",
        tasks: [
          { id: "ai-w6-1", label: "Take LLM Fine-Tuning & Evaluation Metrics Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 25 },
          { id: "ai-w6-2", label: "Complete Senior Generative AI Placement Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 50 },
          { id: "ai-w6-3", label: "Attempt Full GenAI Placement Benchmark Test", type: "CODING", linkUrl: "/live-tests", estimatedMinutes: 90 },
        ],
      },
    ],
  },
  {
    id: "dom-data-analyst",
    name: "Data Analyst",
    slug: "data-analyst",
    icon: "BarChart3",
    color: "#f59e0b",
    level: "Beginner to Placement Ready",
    description: "Complete placement roadmap for Data Analysts: Advanced SQL, Python data wrangling (Pandas/NumPy), EDA, statistical testing, PowerBI/Tableau dashboards, and product case interviews.",
    durationWeeks: 6,
    totalHours: 65,
    topics: [
      { id: "top-sql-adv", name: "Advanced SQL & Joins", slug: "sql-advanced", weekNumber: 1, subtopics: ["Multi-table JOINs", "GROUP BY & HAVING", "CTEs", "Subqueries"] },
      { id: "top-window", name: "SQL Window Functions & Cohorts", slug: "sql-window-functions", weekNumber: 2, subtopics: ["ROW_NUMBER", "DENSE_RANK", "LEAD & LAG", "Retention Cohorts"] },
      { id: "top-pandas", name: "Python Data Analysis (Pandas & NumPy)", slug: "python-pandas", weekNumber: 3, subtopics: ["Data Cleaning", "Imputation", "GroupBy Aggregations", "Pivot Tables"] },
      { id: "top-stats", name: "Statistics, Probability & A/B Testing", slug: "statistics-ab-testing", weekNumber: 4, subtopics: ["Hypothesis Testing", "p-values", "Normal Distribution", "Sample Sizing"] },
      { id: "top-bi", name: "BI Dashboards & Executive Storytelling", slug: "bi-dashboards", weekNumber: 5, subtopics: ["Power BI", "Tableau", "LTV & CAC Metrics", "Dimensional Modeling"] },
      { id: "top-case-studies", name: "Product Analytics & Metric Drop Diagnostics", slug: "product-analytics", weekNumber: 6, subtopics: ["Root Cause Analysis", "Funnel Drop-off", "Churn Analysis", "Executive Reports"] },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1: Advanced SQL for Analytics & Data Manipulation",
        focus: "Complex multi-table joins, subqueries, Common Table Expressions (CTEs), and aggregation rollups.",
        tasks: [
          { id: "da-w1-1", label: "Solve 5 Advanced SQL Queries & CTE Manipulation challenges", type: "CODING", linkUrl: "/coding", estimatedMinutes: 75 },
          { id: "da-w1-2", label: "Take SQL Joins, Aggregations & CTEs Placement Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "da-w1-3", label: "Read Guide: Advanced SQL for Analysts: Real-world Business Queries", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 2,
        title: "Week 2: SQL Window Functions, Ranking & Cohort Analysis",
        focus: "DENSE_RANK, LEAD/LAG rolling averages, customer retention cohort matrices, and month-over-month growth.",
        tasks: [
          { id: "da-w2-1", label: "Solve 5 SQL Window Functions & Moving Average problems", type: "CODING", linkUrl: "/coding", estimatedMinutes: 80 },
          { id: "da-w2-2", label: "Practice Calculating Customer Retention Cohorts in SQL", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "da-w2-3", label: "Take SQL Window Functions Mastery Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 3,
        title: "Week 3: Python Data Wrangling (Pandas & NumPy)",
        focus: "Handling missing data, vector calculations with NumPy, DataFrame reshaping, merging, and exploratory data analysis.",
        tasks: [
          { id: "da-w3-1", label: "Practice Exploratory Data Analysis & Outlier Detection in Pandas", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "da-w3-2", label: "Take Python Pandas & Data Wrangling Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "da-w3-3", label: "Complete Data Analyst Technical Interview Round 1", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 40 },
        ],
      },
      {
        weekNumber: 4,
        title: "Week 4: Applied Business Statistics & A/B Testing",
        focus: "Central limit theorem, hypothesis testing (t-test, chi-square), p-values, and designing statistically valid A/B experiments.",
        tasks: [
          { id: "da-w4-1", label: "Practice A/B Test Statistical Significance & Sample Sizing", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "da-w4-2", label: "Read Guide: A/B Testing Framework for Product Analytics & Growth", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "da-w4-3", label: "Take Applied Business Statistics & A/B Testing Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 5,
        title: "Week 5: Business Intelligence, KPI Metrics & Dashboards",
        focus: "Power BI / Tableau modeling, Star schema, executive KPI design (LTV, CAC, Retention, DAU/MAU), and storytelling.",
        tasks: [
          { id: "da-w5-1", label: "Practice Designing an Executive Revenue & Churn Dashboard", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "da-w5-2", label: "Read Guide: Building Executive-Ready Dashboards & Narrative Storytelling", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "da-w5-3", label: "Take Business Intelligence & Metric Decomposition Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 6,
        title: "Week 6: Product Metric Drop Case Studies & Placement Benchmark",
        focus: "Root-cause analysis on metric drops (e.g. 15% drop in checkout conversion), business presentations, and final placement test.",
        tasks: [
          { id: "da-w6-1", label: "Practice Metric Drop Root-Cause Investigation Framework", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "da-w6-2", label: "Complete Full Data Analyst Placement Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 45 },
          { id: "da-w6-3", label: "Attempt Full Data Analytics Placement Live Test", type: "CODING", linkUrl: "/live-tests", estimatedMinutes: 90 },
        ],
      },
    ],
  },
  {
    id: "dom-devops-cloud",
    name: "DevOps and Cloud",
    slug: "devops-cloud",
    icon: "Cloud",
    color: "#3b82f6",
    level: "Beginner to Production SRE",
    description: "End-to-end cloud engineering & operations syllabus: Linux administration, Git CI/CD automation, Docker containerization, Kubernetes cluster orchestration, Terraform IaC, AWS/GCP architecture, and SRE observability.",
    durationWeeks: 6,
    totalHours: 75,
    topics: [
      { id: "top-linux", name: "Linux Administration & Bash Scripting", slug: "linux-bash", weekNumber: 1, subtopics: ["Permissions (chmod/chown)", "Systemd Services", "Networking (DNS, SSH)", "Process Management"] },
      { id: "top-cicd", name: "Git & CI/CD Pipeline Automation", slug: "git-cicd", weekNumber: 2, subtopics: ["GitHub Actions", "GitLab CI", "Automated Testing", "Artifact Registries"] },
      { id: "top-docker", name: "Docker & Container Architecture", slug: "docker", weekNumber: 3, subtopics: ["Multi-stage Builds", "Layer Caching", "Docker Compose", "Container Networking"] },
      { id: "top-k8s", name: "Kubernetes Cluster Orchestration", slug: "kubernetes", weekNumber: 4, subtopics: ["Pods & Deployments", "Services & Ingress", "ConfigMaps & Secrets", "Helm Charts"] },
      { id: "top-terraform", name: "Infrastructure as Code (Terraform)", slug: "terraform", weekNumber: 5, subtopics: ["Terraform HCL", "State Management (S3/DynamoDB)", "Modules", "AWS/GCP Cloud Architecture"] },
      { id: "top-observability", name: "Observability (Prometheus, Grafana) & SRE", slug: "observability", weekNumber: 6, subtopics: ["Prometheus Metrics", "Grafana Dashboards", "OpenTelemetry Traces", "SLA/SLO/SLI"] },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1: Linux CLI, Bash Scripting & Networking Fundamentals",
        focus: "File permissions, Systemd daemon processes, cron jobs, SSH tunneling, DNS resolution, and bash automation scripts.",
        tasks: [
          { id: "ops-w1-1", label: "Read Guide: Production Linux Troubleshooting & Shell Automation Mastery", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "ops-w1-2", label: "Practice Linux Shell Scripting & Server Health Automation", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "ops-w1-3", label: "Take Linux Administration & Systems Networking Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 2,
        title: "Week 2: Version Control & CI/CD Pipeline Automation",
        focus: "Git branching strategies, multi-stage GitHub Actions workflows, secrets management, automated unit tests, and canary deployment.",
        tasks: [
          { id: "ops-w2-1", label: "Practice Writing Multi-Stage GitHub Actions CI/CD Pipeline", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "ops-w2-2", label: "Read Guide: Zero-Downtime Deployment Strategies: Blue-Green & Canary", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "ops-w2-3", label: "Take CI/CD Principles & Continuous Delivery Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 3,
        title: "Week 3: Containerization with Docker & Multi-Stage Builds",
        focus: "Dockerfile optimization, multi-stage compilation builds, image vulnerability scanning, bridge networks, and Compose files.",
        tasks: [
          { id: "ops-w3-1", label: "Practice Containerizing Full-Stack App with Optimized Multi-Stage Dockerfile", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "ops-w3-2", label: "Complete DevOps Engineering Technical Screen Round", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 45 },
          { id: "ops-w3-3", label: "Take Docker Containerization & Security Best Practices Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 4,
        title: "Week 4: Kubernetes Cluster Architecture & Orchestration",
        focus: "Control plane components, Pod lifecycle, Deployments, ClusterIP/NodePort/LoadBalancer Services, Ingress, and Helm charts.",
        tasks: [
          { id: "ops-w4-1", label: "Practice Writing Kubernetes Manifests, Ingress & Helm Chart", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 65 },
          { id: "ops-w4-2", label: "Read Guide: Production Kubernetes: Pod Scheduling, Quotas & Rolling Updates", type: "READING", linkUrl: "/articles", estimatedMinutes: 25 },
          { id: "ops-w4-3", label: "Take Kubernetes Architecture & Operations Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 5,
        title: "Week 5: Infrastructure as Code (Terraform) & Cloud Architecture",
        focus: "Terraform declarative syntax, state locking with DynamoDB, reusable modules, AWS VPC, subnets, and IAM least privilege.",
        tasks: [
          { id: "ops-w5-1", label: "Practice Modular Terraform Scripts for Multi-Tier Cloud Architecture", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "ops-w5-2", label: "Read Guide: Cloud Security Best Practices & IAM Least Privilege Governance", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "ops-w5-3", label: "Take Terraform & Cloud Infrastructure Architecture Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 6,
        title: "Week 6: Observability (Prometheus/Grafana), SRE & Placement Round",
        focus: "Metrics scrapers, AlertManager rules, Grafana visualization, SLA/SLO calculation, blameless post-mortems, and placement test.",
        tasks: [
          { id: "ops-w6-1", label: "Practice SRE Observability: Prometheus Alerts & Grafana Metrics", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "ops-w6-2", label: "Complete Cloud & DevOps Senior Engineer Mock Interview", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 50 },
          { id: "ops-w6-3", label: "Attempt Full DevOps Placement Benchmark Assessment", type: "CODING", linkUrl: "/live-tests", estimatedMinutes: 90 },
        ],
      },
    ],
  },
  {
    id: "dom-aptitude",
    name: "Placement Aptitude",
    slug: "aptitude",
    icon: "Zap",
    color: "#14b8a6",
    level: "Speed & Accuracy Foundations to Company Drives",
    description: "Thorough campus recruitment & corporate benchmark roadmap: Quantitative ability, Logical reasoning, Verbal comprehension, Data interpretation, and timed speed tests for top placement drives.",
    durationWeeks: 5,
    totalHours: 55,
    topics: [
      { id: "top-quant-fund", name: "Quantitative Math (Percentages & Profit)", slug: "quant-foundations", weekNumber: 1, subtopics: ["Percentages", "Profit & Loss", "Simple & Compound Interest", "Ratios & Mixtures"] },
      { id: "top-speed-work", name: "Time, Speed, Distance & Work", slug: "time-speed-work", weekNumber: 2, subtopics: ["Time and Work", "Pipes & Cisterns", "Speed, Distance & Time", "Boats & Streams"] },
      { id: "top-adv-quant", name: "Advanced Quant: Permutations & Probability", slug: "advanced-quant", weekNumber: 3, subtopics: ["Permutations & Combinations", "Probability", "Number Theory", "Sequences (AP/GP)"] },
      { id: "top-logical", name: "Logical Reasoning & Puzzles", slug: "logical-reasoning", weekNumber: 4, subtopics: ["Blood Relations", "Seating Arrangement", "Syllogisms", "Direction Sense", "Clocks & Calendars"] },
      { id: "top-verbal-di", name: "Verbal Ability & Data Interpretation", slug: "verbal-data-interpretation", weekNumber: 5, subtopics: ["Reading Comprehension", "Sentence Correction", "Bar & Pie Charts", "Table Caselets"] },
    ],
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1: Quantitative Foundations: Percentages, Profit & Ratios",
        focus: "Percentage shortcuts, successive discounts, profit & loss margin calculations, and ratio/alligation formulas.",
        tasks: [
          { id: "apt-w1-1", label: "Read Guide: Shortcut Techniques for Fast Quantitative Calculations", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "apt-w1-2", label: "Practice 15 Quantitative Problems on Percentages & Profit/Loss", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "apt-w1-3", label: "Take Percentages, Profit & Interest Aptitude Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 2,
        title: "Week 2: Time, Speed, Distance & Work Calculations",
        focus: "Unitary methods in work, efficiency ratios, relative speed of passing trains, and upstream/downstream formulas.",
        tasks: [
          { id: "apt-w2-1", label: "Practice Time, Work & Relative Speed Benchmark Problems", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 55 },
          { id: "apt-w2-2", label: "Take Time, Speed & Work Placement Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "apt-w2-3", label: "Attempt Placement Speed Assessment Round 1", type: "CODING", linkUrl: "/live-tests", estimatedMinutes: 45 },
        ],
      },
      {
        weekNumber: 3,
        title: "Week 3: Advanced Quant: Permutations, Probability & Number Theory",
        focus: "Circular permutations, conditional probability, dice and card problems, remainder theorems, and AP/GP series.",
        tasks: [
          { id: "apt-w3-1", label: "Practice Permutations, Probability & Number Systems Problems", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 55 },
          { id: "apt-w3-2", label: "Take Permutations, Probability & Number Theory Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "apt-w3-3", label: "Complete Campus Placement Screening Mock Round", type: "INTERVIEW", linkUrl: "/mock-interview", estimatedMinutes: 35 },
        ],
      },
      {
        weekNumber: 4,
        title: "Week 4: Logical Reasoning, Seating Puzzles & Syllogisms",
        focus: "Linear & circular seating arrangements, multi-generation family trees (blood relations), Venn diagram syllogisms, and coding-decoding.",
        tasks: [
          { id: "apt-w4-1", label: "Practice Seating Arrangement & Logical Deductions Puzzles", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 60 },
          { id: "apt-w4-2", label: "Read Guide: Logical Deductions & Seating Arrangement Solving Strategies", type: "READING", linkUrl: "/articles", estimatedMinutes: 20 },
          { id: "apt-w4-3", label: "Take Logical Reasoning & Analytical Puzzles Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
        ],
      },
      {
        weekNumber: 5,
        title: "Week 5: Verbal Ability, Data Interpretation & Grand Placement Test",
        focus: "Critical reading comprehension, grammatical error detection, bar/pie/table data interpretation, and timed grand assessment.",
        tasks: [
          { id: "apt-w5-1", label: "Practice Data Interpretation (Bar, Pie & Table Caselets)", type: "PRACTICE", linkUrl: "/practice", estimatedMinutes: 50 },
          { id: "apt-w5-2", label: "Take Verbal Ability & Sentence Correction Quiz", type: "QUIZ", linkUrl: "/quiz", estimatedMinutes: 20 },
          { id: "apt-w5-3", label: "Attempt Grand Campus Placement Timed Aptitude Live Test", type: "CODING", linkUrl: "/live-tests", estimatedMinutes: 60 },
        ],
      },
    ],
  },
];

export const TAXONOMY_DOMAINS = BASE_DOMAINS;

export const LEGACY_DOMAIN_MAPPING: Record<string, { domainSlug: string; defaultTopic: string }> = {
  java: { domainSlug: "backend", defaultTopic: "Spring Boot & Enterprise Architecture" },
  dsa: { domainSlug: "dsa", defaultTopic: "Arrays & Two Pointers" },
  algorithms: { domainSlug: "dsa", defaultTopic: "Dynamic Programming" },
  "system design": { domainSlug: "backend", defaultTopic: "Microservices & Distributed Systems" },
  "system-design": { domainSlug: "backend", defaultTopic: "Microservices & Distributed Systems" },
  frontend: { domainSlug: "frontend", defaultTopic: "React 19 & Hooks" },
  react: { domainSlug: "frontend", defaultTopic: "React 19 & Hooks" },
  javascript: { domainSlug: "frontend", defaultTopic: "JavaScript Deep Dive" },
  "full stack": { domainSlug: "frontend", defaultTopic: "React 19 & Hooks" },
  mern: { domainSlug: "frontend", defaultTopic: "React 19 & Hooks" },
  backend: { domainSlug: "backend", defaultTopic: "APIs, HTTP Protocols & Security" },
  dbms: { domainSlug: "backend", defaultTopic: "Databases, SQL & Query Optimization" },
  sql: { domainSlug: "data-analyst", defaultTopic: "Advanced SQL & Joins" },
  database: { domainSlug: "backend", defaultTopic: "Databases, SQL & Query Optimization" },
  os: { domainSlug: "devops-cloud", defaultTopic: "Linux Administration & Bash Scripting" },
  "operating systems": { domainSlug: "devops-cloud", defaultTopic: "Linux Administration & Bash Scripting" },
  behavioral: { domainSlug: "aptitude", defaultTopic: "Logical Reasoning & Puzzles" },
  hr: { domainSlug: "aptitude", defaultTopic: "Logical Reasoning & Puzzles" },
  aptitude: { domainSlug: "aptitude", defaultTopic: "Quantitative Math (Percentages & Profit)" },
  genai: { domainSlug: "genai", defaultTopic: "Transformers & Attention Mechanism" },
  ai: { domainSlug: "genai", defaultTopic: "Transformers & Attention Mechanism" },
  "machine learning": { domainSlug: "genai", defaultTopic: "Transformers & Attention Mechanism" },
  "data analyst": { domainSlug: "data-analyst", defaultTopic: "Advanced SQL & Joins" },
  "data-analytics": { domainSlug: "data-analyst", defaultTopic: "Advanced SQL & Joins" },
  devops: { domainSlug: "devops-cloud", defaultTopic: "Linux Administration & Bash Scripting" },
  cloud: { domainSlug: "devops-cloud", defaultTopic: "Infrastructure as Code (Terraform)" },
};

export function getDomains(): Domain[] {
  return BASE_DOMAINS;
}

export function getTopics(domainSlug?: string): Topic[] {
  if (!domainSlug || domainSlug === "ALL") {
    return BASE_DOMAINS.flatMap((d) => d.topics);
  }
  const clean = domainSlug.toLowerCase();
  const found = BASE_DOMAINS.find(
    (d) => d.slug === clean || d.name.toLowerCase() === clean
  );
  return found ? found.topics : [];
}

export function getSubtopics(topicSlug: string): string[] {
  const clean = topicSlug.toLowerCase();
  for (const d of BASE_DOMAINS) {
    const t = d.topics.find(
      (top) => top.slug === clean || top.name.toLowerCase() === clean
    );
    if (t && t.subtopics) return t.subtopics;
  }
  return [];
}

export function findDomainByTopic(topicSlugOrName: string): Domain | undefined {
  const clean = topicSlugOrName.toLowerCase();
  return BASE_DOMAINS.find((d) =>
    d.topics.some((t) => t.slug === clean || t.name.toLowerCase() === clean)
  );
}
