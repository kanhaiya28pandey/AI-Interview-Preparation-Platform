import { QuizTopic, QuizQuestion } from "./quizData";

export interface SeedQuizTopic extends QuizTopic {
  domainSlug: string;
  source: "local-seed";
}

export const SEED_QUIZ_TOPICS: SeedQuizTopic[] = [
  // Programming Languages
  {
    id: "quiz-seed-pl-java",
    title: "Java Core & Concurrency Assessment",
    description: "10-question benchmark covering JVM memory, garbage collection, Project Loom, and thread safety.",
    category: "Programming Languages",
    domainSlug: "programming-languages",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Coffee",
    source: "local-seed",
  },
  {
    id: "quiz-seed-pl-ts",
    title: "TypeScript Deep Dive & Generics",
    description: "Conditional types, mapped types, variance, and strict compiler flag mechanics.",
    category: "Programming Languages",
    domainSlug: "programming-languages",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "FileCode",
    source: "local-seed",
  },

  // DSA
  {
    id: "quiz-seed-dsa-complexity",
    title: "Algorithm Complexity & Master Theorem",
    description: "Amortized complexity, recurrence tree expansion, space auxiliary overhead, and sorting lower bounds.",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Binary",
    source: "local-seed",
  },
  {
    id: "quiz-seed-dsa-graphs",
    title: "Graphs, Trees & Dynamic Programming",
    description: "Shortest paths, minimum spanning trees, state transition formulations, and topological orderings.",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Layers",
    source: "local-seed",
  },

  // CS Fundamentals
  {
    id: "quiz-seed-cs-os",
    title: "Operating Systems Internals & Memory",
    description: "Paging algorithms, TLB cache hit ratio, context switching, deadlock conditions, and IPC.",
    category: "CS Fundamentals",
    domainSlug: "cs-fundamentals",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Layers",
    source: "local-seed",
  },
  {
    id: "quiz-seed-cs-networks",
    title: "Networking Protocols & TCP/IP Stack",
    description: "TCP flow vs congestion control, TLS handshake, DNS round robin, and HTTP/3 QUIC protocol.",
    category: "CS Fundamentals",
    domainSlug: "cs-fundamentals",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Radio",
    source: "local-seed",
  },

  // Frontend
  {
    id: "quiz-seed-fe-react",
    title: "React 19 & State Architectures",
    description: "Action hooks, Server Actions, useOptimistic, suspense streaming, and microfrontends.",
    category: "Frontend Development",
    domainSlug: "frontend-development",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Layout",
    source: "local-seed",
  },
  {
    id: "quiz-seed-fe-perf",
    title: "Web Performance & Core Web Vitals",
    description: "LCP, INP, CLS optimization, critical rendering path, service workers, and resource hints.",
    category: "Frontend Development",
    domainSlug: "frontend-development",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Zap",
    source: "local-seed",
  },

  // Backend
  {
    id: "quiz-seed-be-arch",
    title: "REST, GraphQL & Backend Architecture",
    description: "Idempotency keys, N+1 query problem in GraphQL, rate limiting algorithms, and gRPC protobufs.",
    category: "Backend Development",
    domainSlug: "backend-development",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Server",
    source: "local-seed",
  },
  {
    id: "quiz-seed-be-auth",
    title: "Authentication, OAuth 2.0 & Session Security",
    description: "PKCE authorization code flow, JWT claim validation, refresh token rotation, and RBAC.",
    category: "Backend Development",
    domainSlug: "backend-development",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "ShieldAlert",
    source: "local-seed",
  },

  // Databases
  {
    id: "quiz-seed-db-acid",
    title: "SQL Indexing, ACID & Query Tuning",
    description: "B-Tree vs LSM trees, Read Committed vs Serializable isolation, index selectivity, and vacuuming.",
    category: "Databases",
    domainSlug: "databases",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Database",
    source: "local-seed",
  },
  {
    id: "quiz-seed-db-nosql",
    title: "NoSQL Concepts & Distributed Data Stores",
    description: "Cassandra wide-column partitioning, MongoDB aggregation pipeline, and Redis data types.",
    category: "Databases",
    domainSlug: "databases",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Database",
    source: "local-seed",
  },

  // Full Stack
  {
    id: "quiz-seed-fs-mern",
    title: "MERN Stack Full Engineering Suite",
    description: "Mongoose middleware, Express error handling, React hydration, and Node event loops.",
    category: "Full Stack (MERN / MEAN / Java Full Stack)",
    domainSlug: "full-stack",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Layers",
    source: "local-seed",
  },

  // System Design
  {
    id: "quiz-seed-sd-hl",
    title: "System Design Patterns & Scale",
    description: "CAP theorem, backpressure, distributed rate limiting, write-ahead logs, and CDN edge caching.",
    category: "System Design",
    domainSlug: "system-design",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Layers",
    source: "local-seed",
  },

  // DevOps & Cloud
  {
    id: "quiz-seed-devops-ci",
    title: "DevOps, Containers & Cloud Deployment",
    description: "Docker multi-stage builds, Kubernetes pods & services, CI/CD pipeline triggers, and Terraform state.",
    category: "DevOps & Cloud",
    domainSlug: "devops-cloud",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Cloud",
    source: "local-seed",
  },

  // AI & ML
  {
    id: "quiz-seed-ai-llm",
    title: "AI, Large Language Models & Prompt Engineering",
    description: "Attention mechanisms, vector similarity metrics (Cosine, Euclidean), hallucination mitigation, and fine-tuning.",
    category: "AI & Machine Learning",
    domainSlug: "ai-machine-learning",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Sparkles",
    source: "local-seed",
  },

  // Data & Analytics
  {
    id: "quiz-seed-data-analytics",
    title: "Data Analytics, SQL & Warehousing",
    description: "Star schema vs Snowflake schema, OLAP aggregations, window partition offsets, and A/B statistical testing.",
    category: "Data & Analytics",
    domainSlug: "data-analytics",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "BarChart3",
    source: "local-seed",
  },

  // Mobile
  {
    id: "quiz-seed-mobile-dev",
    title: "Mobile Architecture & Lifecycle",
    description: "Android Activity lifecycle, iOS UIViewController states, memory leaks in closures, and Flutter widget trees.",
    category: "Mobile Development",
    domainSlug: "mobile-development",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Smartphone",
    source: "local-seed",
  },

  // Cybersecurity
  {
    id: "quiz-seed-cybersec",
    title: "Application Security & Cryptography",
    description: "Symmetric vs Asymmetric encryption, CSP directives, CSRF defense, and timing attack mitigation.",
    category: "Cybersecurity",
    domainSlug: "cybersecurity",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "ShieldAlert",
    source: "local-seed",
  },

  // Testing & QA
  {
    id: "quiz-seed-testing-qa",
    title: "Software Testing, TDD & Automated QA",
    description: "Unit vs Integration testing boundaries, mocking vs stubbing, Playwright locators, and code coverage metrics.",
    category: "Testing & QA",
    domainSlug: "testing-qa",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "CheckCircle",
    source: "local-seed",
  },

  // Tools & Productivity
  {
    id: "quiz-seed-tools-git",
    title: "Developer Tooling, Git & CLI",
    description: "Git reflog recovery, rebase vs merge, Unix piping, and environment variable security.",
    category: "Tools & Productivity",
    domainSlug: "tools-productivity",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Wrench",
    source: "local-seed",
  },

  // Aptitude
  {
    id: "quiz-seed-aptitude",
    title: "Quantitative Aptitude & Logic",
    description: "Probability combinatorics, work-time rate equations, series deduction, and speed-distance calculations.",
    category: "Aptitude & Reasoning",
    domainSlug: "aptitude-reasoning",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Binary",
    source: "local-seed",
  },

  // HR & Behavioral
  {
    id: "quiz-seed-hr-leadership",
    title: "Behavioral Interview Dynamics & Ethics",
    description: "STAR methodology application, handling project regressions, ethical escalations, and executive communication.",
    category: "HR & Behavioral",
    domainSlug: "hr-behavioral",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Users",
    source: "local-seed",
  },

  // Emerging Tech
  {
    id: "quiz-seed-emerging-tech",
    title: "Web3, Blockchain & Emerging Paradigms",
    description: "Byzantine fault tolerance, gas metering, quantum qubit superposition, and edge computing.",
    category: "Emerging Tech",
    domainSlug: "emerging-tech",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Zap",
    source: "local-seed",
  },

  // Product & Business
  {
    id: "quiz-seed-product-mgmt",
    title: "Product Analytics & Agile Delivery",
    description: "Sprint velocity estimation, cohort retention curves, user story mapping, and feature cannibalization analysis.",
    category: "Product & Business",
    domainSlug: "product-business",
    questionCount: 10,
    timeLimitMinutes: 15,
    icon: "Briefcase",
    source: "local-seed",
  },
];

export const SEED_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  "quiz-seed-pl-java": [
    {
      id: "q-java-1",
      question: "Which of the following occurs during a Minor Garbage Collection in the HotSpot JVM?",
      options: [
        "The entire heap is compacted to prevent fragmentation.",
        "Live objects from Eden and the active Survivor space are copied to the alternate Survivor space.",
        "All objects in the Old Generation are scanned and freed.",
        "Metaspace memory is purged of unused ClassLoaders.",
      ],
      correctIndex: 1,
      explanation: "Minor GC targets the Young Generation, copying surviving objects between S0 and S1 spaces before tenuring them.",
    },
    {
      id: "q-java-2",
      question: "What is the primary architectural difference between Java 21 Virtual Threads and standard Platform Threads?",
      options: [
        "Virtual threads execute directly in kernel space without JVM intervention.",
        "Virtual threads are user-mode threads scheduled by the JVM onto a pool of carrier OS threads.",
        "Virtual threads cannot perform network I/O operations.",
        "Virtual threads share a single common execution stack across the entire application.",
      ],
      correctIndex: 1,
      explanation: "Virtual threads (Project Loom) decouple user threads from OS threads via ForkJoinPool carrier threads.",
    },
    {
      id: "q-java-3",
      question: "What does the `volatile` modifier guarantee in Java?",
      options: [
        "Atomic execution of compound statements like counter++.",
        "Read and write visibility directly to/from main memory and instruction reordering barriers.",
        "Automatic acquisition of a reentrant monitor lock on access.",
        "Prevention of Garbage Collection on the referenced instance.",
      ],
      correctIndex: 1,
      explanation: "`volatile` ensures memory visibility across CPU cores and establishes Happens-Before ordering constraints.",
    },
    {
      id: "q-java-4",
      question: "In ConcurrentHashMap (Java 8+), what synchronization mechanism protects the insertion of a new bucket's head node?",
      options: ["ReentrantReadWriteLock", "Compare-And-Swap (CAS)", "Class-level synchronized lock", "Spinlock waiting loop"],
      correctIndex: 1,
      explanation: "Java 8+ ConcurrentHashMap utilizes lock-free CAS instructions to atomically populate empty table bins.",
    },
    {
      id: "q-java-5",
      question: "Which garbage collector in modern OpenJDK is specifically designed for sub-millisecond maximum pause times regardless of heap size?",
      options: ["Parallel GC", "Serial GC", "CMS Collector", "ZGC (Z Garbage Collector)"],
      correctIndex: 3,
      explanation: "ZGC uses colored pointers and load barriers to perform nearly all GC phases concurrently with application threads.",
    },
    {
      id: "q-java-6",
      question: "What happens if an unhandled Exception is thrown inside a Java 8 Stream `map` lambda?",
      options: [
        "The stream silently skips the offending element and processes the rest.",
        "The stream pipeline terminates immediately and propagates the exception.",
        "The stream retries the element three times before failing.",
        "The exception is converted into an Optional.empty() instance.",
      ],
      correctIndex: 1,
      explanation: "Java Streams do not swallow or handle runtime exceptions; the pipeline aborts immediately.",
    },
    {
      id: "q-java-7",
      question: "Which is a valid characteristic of Java Records introduced in Java 16?",
      options: [
        "They can extend any arbitrary abstract class.",
        "Their component fields are mutable by default.",
        "They are implicitly final and all state fields are private and final.",
        "They cannot define custom instance methods.",
      ],
      correctIndex: 2,
      explanation: "Records provide immutable shallow data modeling; they cannot be extended and implicitly extend java.lang.Record.",
    },
    {
      id: "q-java-8",
      question: "What is the consequence of calling `Thread.sleep()` inside a synchronized block?",
      options: [
        "The thread temporarily releases the monitor lock so other threads can enter.",
        "The thread retains the monitor lock throughout the sleep duration.",
        "The JVM throws an IllegalMonitorStateException.",
        "The monitor lock is downgraded to a read-only lock.",
      ],
      correctIndex: 1,
      explanation: "`Thread.sleep()` does NOT release acquired monitor locks. Only `Object.wait()` releases the lock.",
    },
    {
      id: "q-java-9",
      question: "Why should `BigDecimal(double)` constructor generally be avoided in financial applications?",
      options: [
        "It generates a compile-time deprecation warning in Java 17.",
        "Floating point binary representation causes unexpected precision artifacts (e.g. 0.1 becomes 0.1000000000000000055511...).",
        "It allocates memory on the off-heap native buffer.",
        "It cannot perform division operations without throwing ArithmeticException.",
      ],
      correctIndex: 1,
      explanation: "Binary floating-point double approximations yield inaccurate exact decimal values; `BigDecimal.valueOf(0.1)` or `BigDecimal(\"0.1\")` should be used.",
    },
    {
      id: "q-java-10",
      question: "What is the time complexity of searching for an element in a HashMap when all keys produce hash collisions?",
      options: [
        "O(1)",
        "O(N) prior to Java 8, and O(log N) in Java 8+ when treeified into a Red-Black tree",
        "O(N log N)",
        "O(N^2)",
      ],
      correctIndex: 1,
      explanation: "Since Java 8, bins with more than 8 colliding nodes treeify into Red-Black trees with O(log N) worst-case search.",
    },
  ],

  "quiz-seed-dsa-complexity": [
    {
      id: "q-dsa-1",
      question: "According to the Master Theorem, what is the asymptotic solution to the recurrence T(N) = 2T(N/2) + O(N)?",
      options: ["O(N)", "O(N log N)", "O(N^2)", "O(log N)"],
      correctIndex: 1,
      explanation: "With a=2, b=2, log_b(a) = 1. Since f(N) = O(N^1), this is Case 2 where T(N) = Theta(N log N).",
    },
    {
      id: "q-dsa-2",
      question: "What is the amortized cost of inserting an element into a dynamic array (like std::vector or ArrayList) that doubles its capacity?",
      options: ["O(N)", "O(1)", "O(log N)", "O(1/N)"],
      correctIndex: 1,
      explanation: "Even though reallocation takes O(N), doubling ensures N reallocations cost at most 2N work, yielding O(1) amortized.",
    },
    {
      id: "q-dsa-3",
      question: "What is the theoretical lower bound for comparison-based sorting algorithms on an array of N arbitrary elements?",
      options: ["O(N)", "O(N log N)", "O(log N)", "O(N^1.5)"],
      correctIndex: 1,
      explanation: "A decision tree of N! permutations requires height of at least log2(N!) = Omega(N log N) comparisons.",
    },
    {
      id: "q-dsa-4",
      question: "Which data structure provides O(1) expected time for Insert, Delete, and GetRandom with uniform probability?",
      options: ["Binary Search Tree", "Linked List with Hash Table", "Dynamic Array + Hash Table storing indices", "Priority Queue"],
      correctIndex: 2,
      explanation: "Array allows O(1) index-based random access; hash table maps values to array indices. Deletion swaps target with array end.",
    },
    {
      id: "q-dsa-5",
      question: "What is the worst-case time complexity of QuickSelect to find the Kth smallest element with deterministic median-of-medians pivot selection?",
      options: ["O(N)", "O(N log N)", "O(N^2)", "O(K log N)"],
      correctIndex: 0,
      explanation: "Median-of-medians guarantees a balanced partition split, ensuring strict O(N) worst-case time.",
    },
    {
      id: "q-dsa-6",
      question: "What is the space complexity of Depth First Search (DFS) on a balanced binary tree with N nodes?",
      options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
      correctIndex: 1,
      explanation: "The maximum recursion call stack depth equals the height of the balanced tree, which is O(log N).",
    },
    {
      id: "q-dsa-7",
      question: "Which algorithm finds the shortest path in a weighted directed graph that may contain negative edge weights?",
      options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Kruskal's Algorithm", "Breadth First Search"],
      correctIndex: 1,
      explanation: "Bellman-Ford relaxes all edges V-1 times and detects negative weight cycles, running in O(V * E) time.",
    },
    {
      id: "q-dsa-8",
      question: "What is the time complexity to find the Lowest Common Ancestor of two nodes in an arbitrary Binary Tree using RMQ (Range Minimum Query)?",
      options: ["O(N) preprocessing, O(1) query", "O(N log N) preprocessing, O(N) query", "O(log N) preprocessing, O(log N) query", "O(1) preprocessing, O(N) query"],
      correctIndex: 0,
      explanation: "Euler Tour reduction produces an array of depths; Sparse Table RMQ allows O(N) preprocessing and O(1) queries.",
    },
    {
      id: "q-dsa-9",
      question: "How many distinct Binary Search Trees can be formed with N distinct keys?",
      options: ["N!", "2^N", "Catalan Number C_N = (2N)! / ((N+1)! N!)", "N^2"],
      correctIndex: 2,
      explanation: "The number of unique structural BSTs generated by N keys follows the N-th Catalan Number recurrence.",
    },
    {
      id: "q-dsa-10",
      question: "In a Min-Heap containing N elements, what is the time complexity to build the heap from an unsorted array using Floyd's bottom-up algorithm?",
      options: ["O(N log N)", "O(N)", "O(N^2)", "O(log N)"],
      correctIndex: 1,
      explanation: "Floyd's heapify sums (h * N / 2^(h+1)) over all heights h, converging asymptotically to strict O(N) operations.",
    },
  ],

  "quiz-seed-cs-os": [
    {
      id: "q-os-1",
      question: "Which of the following is NOT one of Coffman's four necessary conditions for a Deadlock to occur?",
      options: ["Mutual Exclusion", "Hold and Wait", "Preemption of Resources", "Circular Wait"],
      correctIndex: 2,
      explanation: "No Preemption is the condition. Allowing preemption prevents or breaks deadlock.",
    },
    {
      id: "q-os-2",
      question: "What hardware component caches recent virtual-to-physical address translations to accelerate memory access?",
      options: ["L3 Unified Cache", "Translation Lookaside Buffer (TLB)", "Instruction Register", "DMA Controller"],
      correctIndex: 1,
      explanation: "The TLB is a high-speed associative hardware cache in the MMU storing recent page table entries.",
    },
    {
      id: "q-os-3",
      question: "What causes Thrashing in an operating system?",
      options: [
        "CPU overheating due to heavy floating point calculations.",
        "Excessive page faults causing the system to spend more time swapping pages than executing instructions.",
        "Deadlock between two real-time processes.",
        "Disk fragmentation in ext4 file systems.",
      ],
      correctIndex: 1,
      explanation: "Thrashing occurs when the working sets of active processes exceed available physical RAM.",
    },
    {
      id: "q-os-4",
      question: "What is the primary difference between a process and a thread in Unix systems?",
      options: [
        "Threads have independent virtual address spaces, while processes share memory.",
        "Processes have separate address spaces, file descriptors, and page tables; threads within a process share address space.",
        "Threads cannot be scheduled by the OS kernel.",
        "Processes cannot create sockets or communicate across networks.",
      ],
      correctIndex: 1,
      explanation: "Processes encapsulate isolated resources and address spaces; threads share the heap and code segment of their parent process.",
    },
    {
      id: "q-os-5",
      question: "Which page replacement algorithm suffers from Belady's Anomaly (where increasing page frames increases page faults)?",
      options: ["Least Recently Used (LRU)", "First-In, First-Out (FIFO)", "Optimal Algorithm (OPT)", "Clock Page Replacement"],
      correctIndex: 1,
      explanation: "FIFO is non-stack based and can exhibit Belady's Anomaly under specific page reference strings.",
    },
    {
      id: "q-os-6",
      question: "What is the function of the `fork()` system call in POSIX environments?",
      options: [
        "Replaces the current process image with a new executable.",
        "Creates a child process that is an exact duplicate of the calling parent process with a distinct PID.",
        "Terminates all child processes of the current session.",
        "Suspends execution until an I/O signal arrives.",
      ],
      correctIndex: 1,
      explanation: "`fork()` clones the calling process via copy-on-write memory semantics, returning 0 to the child and the child PID to the parent.",
    },
    {
      id: "q-os-7",
      question: "In CPU scheduling, what is the Convoy Effect?",
      options: [
        "Many short processes wait behind a single CPU-heavy long process in FCFS scheduling.",
        "Processes monopolize network sockets indefinitely.",
        "Context switches overwhelm the kernel scheduler.",
        "Real-time threads starve background batch jobs.",
      ],
      correctIndex: 0,
      explanation: "In First-Come-First-Served (FCFS), a long I/O-bound or CPU-bound process blocks all subsequent short bursts, reducing device utilization.",
    },
    {
      id: "q-os-8",
      question: "What is Priority Inversion and how is it resolved in real-time operating systems?",
      options: [
        "High priority tasks starve low priority tasks; resolved by round-robin scheduling.",
        "A low-priority task holds a resource needed by a high-priority task while a medium-priority task preempts the low-priority one; resolved by Priority Inheritance.",
        "Threads execute in reverse numerical priority; resolved by re-sorting.",
        "Kernel interrupts block user threads; resolved by disabling interrupts.",
      ],
      correctIndex: 1,
      explanation: "Priority Inheritance temporarily elevates the low-priority lock holder to the priority of the waiting high-priority task.",
    },
    {
      id: "q-os-9",
      question: "Why does Copy-On-Write (COW) improve the performance of `fork()` followed by `exec()`?",
      options: [
        "It skips page table creation entirely.",
        "It delays physical page duplication until one of the processes writes to a page, avoiding copying memory that `exec()` immediately discards.",
        "It compresses RAM pages into swap before launching.",
        "It runs the child process inside the parent thread stack.",
      ],
      correctIndex: 1,
      explanation: "COW shares physical frames marked read-only. When `exec()` replaces the memory image, redundant page copying is avoided entirely.",
    },
    {
      id: "q-os-10",
      question: "What happens when a child process terminates before its parent executes `wait()` or `waitpid()`?",
      options: [
        "The child becomes an Orphan process adopted by init (PID 1).",
        "The child becomes a Zombie process retaining an entry in the process table with exit code.",
        "The kernel immediately purges all trace of the child.",
        "The parent process is forcefully terminated with SIGKILL.",
      ],
      correctIndex: 1,
      explanation: "A Zombie process has terminated execution but remains in the process table so the parent can read its exit status.",
    },
  ],
};
