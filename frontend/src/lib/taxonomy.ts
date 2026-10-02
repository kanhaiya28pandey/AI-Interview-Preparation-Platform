export interface Topic {
  id: string;
  name: string;
  slug: string;
  subtopics?: string[];
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  topics: Topic[];
}

export const BASE_DOMAINS: Domain[] = [
  {
    id: "dom-dsa",
    name: "Data Structures & Algorithms",
    slug: "dsa",
    icon: "Binary",
    color: "#38bdf8",
    description: "Core algorithms, data structures, and computational problem solving.",
    topics: [
      { id: "top-arrays", name: "Arrays", slug: "arrays", subtopics: ["Prefix Sum", "Two Pointers", "Sliding Window"] },
      { id: "top-strings", name: "Strings", slug: "strings", subtopics: ["Pattern Matching", "Anagrams", "Trie"] },
      { id: "top-linkedlist", name: "Linked List", slug: "linked-list", subtopics: ["Singly Linked List", "Doubly Linked List", "Fast & Slow Pointers"] },
      { id: "top-stackqueue", name: "Stack & Queue", slug: "stack-queue", subtopics: ["Monotonic Stack", "Priority Queue", "Deque"] },
      { id: "top-trees", name: "Trees", slug: "trees", subtopics: ["Binary Tree Traversals", "BST", "Segment Tree"] },
      { id: "top-graphs", name: "Graphs", slug: "graphs", subtopics: ["BFS/DFS", "Dijkstra", "Topological Sort", "Disjoint Set Union"] },
      { id: "top-dp", name: "Dynamic Programming", slug: "dynamic-programming", subtopics: ["1D DP", "2D DP", "Knapsack", "LCS & LIS"] },
      { id: "top-recursion", name: "Recursion & Backtracking", slug: "recursion-backtracking", subtopics: ["Subsets", "Permutations", "N-Queens"] },
    ],
  },
  {
    id: "dom-java",
    name: "Java Development",
    slug: "java",
    icon: "Code2",
    color: "#f97316",
    description: "Core Java, OOP principles, Collections, Multithreading, and Spring Boot enterprise ecosystem.",
    topics: [
      { id: "top-oop", name: "OOP Principles", slug: "oop-principles", subtopics: ["Encapsulation", "Polymorphism", "Abstraction", "Inheritance"] },
      { id: "top-collections", name: "Collections Framework", slug: "collections-framework", subtopics: ["List vs Set", "HashMap Internals", "Concurrent Collections"] },
      { id: "top-multithreading", name: "Multithreading & Executor", slug: "multithreading", subtopics: ["Thread Lifecycle", "Locks & Synchronization", "CompletableFuture", "Virtual Threads"] },
      { id: "top-streams", name: "Streams & Lambdas", slug: "streams-lambdas", subtopics: ["Functional Interfaces", "Stream Pipelines", "Collectors"] },
      { id: "top-jvm", name: "JVM Memory & GC", slug: "jvm-memory-gc", subtopics: ["Stack vs Heap", "Garbage Collectors", "Memory Leaks"] },
      { id: "top-spring", name: "Spring Boot", slug: "spring-boot", subtopics: ["IoC & Dependency Injection", "Spring Data JPA", "Spring Security"] },
      { id: "top-hibernate", name: "Hibernate ORM", slug: "hibernate-orm", subtopics: ["Entity Mappings", "N+1 Problem", "Caching"] },
      { id: "top-patterns", name: "Design Patterns", slug: "design-patterns", subtopics: ["Singleton", "Factory", "Observer", "Builder"] },
    ],
  },
  {
    id: "dom-systemdesign",
    name: "System Design",
    slug: "system-design",
    icon: "Server",
    color: "#a855f7",
    description: "Scalable distributed architecture, microservices, load balancing, and fault tolerance.",
    topics: [
      { id: "top-lld", name: "Low Level Design", slug: "low-level-design", subtopics: ["SOLID Principles", "Class Diagrams", "Schema Design"] },
      { id: "top-hld", name: "High Level Design", slug: "high-level-design", subtopics: ["Client-Server", "API Gateway", "Monolith vs Microservices"] },
      { id: "top-scalability", name: "Scalability", slug: "scalability", subtopics: ["Horizontal vs Vertical", "Database Sharding", "Partitioning"] },
      { id: "top-loadbalancing", name: "Load Balancing", slug: "load-balancing", subtopics: ["Round Robin", "Consistent Hashing", "Health Checks"] },
      { id: "top-caching", name: "Caching Strategies", slug: "caching-strategies", subtopics: ["Redis", "Cache Aside", "Write Through", "Eviction Policies"] },
      { id: "top-cdn", name: "CDN", slug: "cdn", subtopics: ["Edge Servers", "Cache Invalidation", "Anycast"] },
      { id: "top-ratelimiter", name: "Rate Limiter", slug: "rate-limiter", subtopics: ["Token Bucket", "Leaky Bucket", "Sliding Window Log"] },
      { id: "top-microservices", name: "Microservices", slug: "microservices", subtopics: ["Service Discovery", "Message Queues (Kafka)", "Circuit Breaker"] },
    ],
  },
  {
    id: "dom-frontend",
    name: "Frontend Engineering",
    slug: "frontend",
    icon: "Layout",
    color: "#22d3ee",
    description: "Modern client-side web engineering, React internals, TypeScript, and performance optimization.",
    topics: [
      { id: "top-htmlcss", name: "HTML & CSS", slug: "html-css", subtopics: ["Semantic HTML", "Flexbox & Grid", "Tailwind CSS", "Responsive Design"] },
      { id: "top-js", name: "JavaScript Deep Dive", slug: "javascript-deep-dive", subtopics: ["Event Loop", "Closures & Scope", "Promises & Async/Await", "Prototypes"] },
      { id: "top-ts", name: "TypeScript", slug: "typescript", subtopics: ["Generics", "Utility Types", "Type Narrowing", "Union Types"] },
      { id: "top-react", name: "React", slug: "react", subtopics: ["Hooks Lifecycle", "Virtual DOM", "Context API", "Fiber Architecture"] },
      { id: "top-nextjs", name: "Next.js", slug: "nextjs", subtopics: ["App Router", "SSR vs SSG", "Server Actions"] },
      { id: "top-statemgmt", name: "State Management", slug: "state-management", subtopics: ["Redux Toolkit", "Zustand", "TanStack Query"] },
      { id: "top-webperf", name: "Web Performance", slug: "web-performance", subtopics: ["Core Web Vitals", "Code Splitting", "Lazy Loading"] },
    ],
  },
  {
    id: "dom-mern",
    name: "Full Stack (MERN)",
    slug: "mern",
    icon: "Zap",
    color: "#10b981",
    description: "End-to-end full stack development with MongoDB, Express, React, and Node.js.",
    topics: [
      { id: "top-mern-react", name: "React", slug: "mern-react", subtopics: ["Component Architecture", "Custom Hooks"] },
      { id: "top-node", name: "Node.js & Express", slug: "nodejs-express", subtopics: ["Middleware", "Routing", "Streams & Buffers"] },
      { id: "top-mongodb", name: "MongoDB", slug: "mongodb", subtopics: ["Mongoose Models", "Aggregation Pipeline", "Indexing"] },
      { id: "top-rest", name: "REST API Design", slug: "rest-api-design", subtopics: ["HTTP Methods", "Status Codes", "Version Control"] },
      { id: "top-auth", name: "Authentication (JWT, OAuth)", slug: "authentication", subtopics: ["JWT Tokens", "Refresh Tokens", "Bcrypt Hashing"] },
    ],
  },
  {
    id: "dom-dbms",
    name: "Database Management (DBMS)",
    slug: "dbms",
    icon: "Database",
    color: "#6366f1",
    description: "Relational database modeling, SQL querying, transactions, ACID properties, and indexing.",
    topics: [
      { id: "top-sql", name: "SQL", slug: "sql", subtopics: ["Joins & Subqueries", "Window Functions", "GROUP BY & HAVING"] },
      { id: "top-mysql", name: "MySQL", slug: "mysql", subtopics: ["Storage Engines", "Execution Plans", "Replication"] },
      { id: "top-postgres", name: "PostgreSQL", slug: "postgresql", subtopics: ["JSONB", "Connection Pooling", "Extensions"] },
      { id: "top-acid", name: "Transactions & ACID", slug: "transactions-acid", subtopics: ["Isolation Levels", "Deadlocks", "WAL"] },
      { id: "top-indexing", name: "Indexing & Query Optimization", slug: "indexing-optimization", subtopics: ["B-Trees", "Composite Indexes", "EXPLAIN ANALYZE"] },
    ],
  },
  {
    id: "dom-os",
    name: "Operating Systems",
    slug: "os",
    icon: "Cpu",
    color: "#ec4899",
    description: "Core OS principles, process scheduling, concurrency, virtual memory, and file systems.",
    topics: [
      { id: "top-os-core", name: "Operating Systems", slug: "operating-systems", subtopics: ["Kernel Architecture", "System Calls", "Interrupts"] },
      { id: "top-sync", name: "Process Synchronization", slug: "process-synchronization", subtopics: ["Semaphores & Mutex", "Deadlock Prevention", "Critical Section"] },
      { id: "top-memory", name: "Memory Management", slug: "memory-management", subtopics: ["Paging & Segmentation", "Page Replacement (LRU)", "Virtual Memory"] },
      { id: "top-fs", name: "File Systems", slug: "file-systems", subtopics: ["Inodes", "File Allocation Tables", "Journaling"] },
    ],
  },
  {
    id: "dom-behavioral",
    name: "Behavioral & HR",
    slug: "behavioral",
    icon: "Users",
    color: "#eab308",
    description: "Campus placement HR rounds, leadership qualities, STAR methodology, and workplace conflict resolution.",
    topics: [
      { id: "top-star", name: "STAR Method", slug: "star-method", subtopics: ["Situation", "Task", "Action", "Result"] },
      { id: "top-intro", name: "Tell Me About Yourself", slug: "tell-me-about-yourself", subtopics: ["Elevator Pitch", "Highlighting Strengths"] },
      { id: "top-sw", name: "Strengths & Weaknesses", slug: "strengths-weaknesses", subtopics: ["Constructive Vulnerability", "Continuous Growth"] },
      { id: "top-conflict", name: "Conflict & Teamwork", slug: "conflict-teamwork", subtopics: ["De-escalation", "Alignment", "Empathy"] },
      { id: "top-leadership", name: "Leadership", slug: "leadership", subtopics: ["Ownership", "Mentorship", "Delivering Under Pressure"] },
    ],
  },
  {
    id: "dom-aptitude",
    name: "Quantitative Aptitude",
    slug: "aptitude",
    icon: "BarChart3",
    color: "#14b8a6",
    description: "Quantitative, logical, and verbal reasoning tests for campus recruitment benchmarks.",
    topics: [
      { id: "top-quant", name: "Quantitative Aptitude", slug: "quantitative-aptitude", subtopics: ["Time and Work", "Percentages & Profit", "Speed & Distance", "Permutations & Probability"] },
      { id: "top-logical", name: "Logical Reasoning", slug: "logical-reasoning", subtopics: ["Blood Relations", "Seating Arrangement", "Syllogisms", "Coding-Decoding"] },
      { id: "top-verbal", name: "Verbal Ability", slug: "verbal-ability", subtopics: ["Reading Comprehension", "Sentence Correction", "Vocabulary in Context"] },
      { id: "top-di", name: "Data Interpretation", slug: "data-interpretation", subtopics: ["Bar Charts", "Pie Charts", "Tables & Caselets"] },
    ],
  },
];

export const TAXONOMY_DOMAINS = BASE_DOMAINS;

export const LEGACY_DOMAIN_MAPPING: Record<string, { domainSlug: string; defaultTopic: string }> = {
  java: { domainSlug: "java", defaultTopic: "OOP Principles" },
  dsa: { domainSlug: "dsa", defaultTopic: "Arrays" },
  algorithms: { domainSlug: "dsa", defaultTopic: "Dynamic Programming" },
  "system design": { domainSlug: "system-design", defaultTopic: "Scalability" },
  frontend: { domainSlug: "frontend", defaultTopic: "React" },
  react: { domainSlug: "frontend", defaultTopic: "React" },
  javascript: { domainSlug: "frontend", defaultTopic: "JavaScript Deep Dive" },
  "full stack": { domainSlug: "mern", defaultTopic: "REST API Design" },
  mern: { domainSlug: "mern", defaultTopic: "Node.js & Express" },
  dbms: { domainSlug: "dbms", defaultTopic: "SQL" },
  sql: { domainSlug: "dbms", defaultTopic: "SQL" },
  database: { domainSlug: "dbms", defaultTopic: "Transactions & ACID" },
  os: { domainSlug: "os", defaultTopic: "Operating Systems" },
  "operating systems": { domainSlug: "os", defaultTopic: "Operating Systems" },
  behavioral: { domainSlug: "behavioral", defaultTopic: "STAR Method" },
  hr: { domainSlug: "behavioral", defaultTopic: "STAR Method" },
  aptitude: { domainSlug: "aptitude", defaultTopic: "Quantitative Aptitude" },
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
