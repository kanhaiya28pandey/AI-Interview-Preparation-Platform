import { PracticeTopic, PracticeQuestion } from "./practiceData";

export interface SeedPracticeTopic extends PracticeTopic {
  domainSlug: string;
  source: "local-seed";
}

export interface SeedPracticeQuestion extends PracticeQuestion {
  domainSlug: string;
  source: "local-seed";
}

export const SEED_PRACTICE_TOPICS: SeedPracticeTopic[] = [
  // 1. Programming Languages
  {
    id: "prac-top-pl-java",
    title: "Java Fundamentals & Modern Features",
    description: "Memory model, JVM GC tuning, Virtual Threads (Project Loom), Stream API, and Records.",
    category: "Programming Languages",
    domainSlug: "programming-languages",
    difficulty: "Medium",
    questionsCount: 6,
    completedCount: 0,
    icon: "Coffee",
    tags: ["Java", "JVM", "Multithreading", "Streams"],
    source: "local-seed",
  },
  {
    id: "prac-top-pl-python",
    title: "Python Under the Hood & AsyncIO",
    description: "GIL mechanics, generator coroutines, asyncio event loop, metaclasses, and memory management.",
    category: "Programming Languages",
    domainSlug: "programming-languages",
    difficulty: "Medium",
    questionsCount: 6,
    completedCount: 0,
    icon: "Code",
    tags: ["Python", "AsyncIO", "GIL", "Generators"],
    source: "local-seed",
  },
  {
    id: "prac-top-pl-ts",
    title: "TypeScript Advanced Type System",
    description: "Conditional types, mapped types, template literal types, distributive unions, and satisfies operator.",
    category: "Programming Languages",
    domainSlug: "programming-languages",
    difficulty: "Hard",
    questionsCount: 5,
    completedCount: 0,
    icon: "Code",
    tags: ["TypeScript", "Generics", "TypeSystem"],
    source: "local-seed",
  },

  // 2. Data Structures & Algorithms
  {
    id: "prac-top-dsa-arrays",
    title: "Arrays, Two Pointers & Sliding Window",
    description: "Contiguous subarray constraints, fast-slow pointers, and sliding window frequency maps.",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    difficulty: "Medium",
    questionsCount: 6,
    completedCount: 0,
    icon: "Layers",
    tags: ["DSA", "Arrays", "TwoPointers", "SlidingWindow"],
    source: "local-seed",
  },
  {
    id: "prac-top-dsa-trees",
    title: "Binary Trees & BST Traversals",
    description: "Tree serializations, lowest common ancestors, boundary traversals, and balanced tree checks.",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    difficulty: "Medium",
    questionsCount: 6,
    completedCount: 0,
    icon: "Layers",
    tags: ["DSA", "Trees", "BST", "DFS"],
    source: "local-seed",
  },
  {
    id: "prac-top-dsa-dp",
    title: "Dynamic Programming & Memoization",
    description: "Subproblem state formulation, 1D/2D recurrence relations, knapsack patterns, and intervals.",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    difficulty: "Hard",
    questionsCount: 6,
    completedCount: 0,
    icon: "Layers",
    tags: ["DSA", "DynamicProgramming", "Memoization"],
    source: "local-seed",
  },

  // 3. CS Fundamentals
  {
    id: "prac-top-cs-os",
    title: "Operating Systems & Concurrency",
    description: "Process vs Thread, virtual memory, paging, page replacement, mutexes, semaphores, and deadlocks.",
    category: "CS Fundamentals",
    domainSlug: "cs-fundamentals",
    difficulty: "Medium",
    questionsCount: 5,
    completedCount: 0,
    icon: "Layers",
    tags: ["OS", "Concurrency", "Paging", "Deadlock"],
    source: "local-seed",
  },
  {
    id: "prac-top-cs-networks",
    title: "Computer Networks & Protocols",
    description: "TCP 3-way handshake, TLS 1.3 handshake, DNS resolution path, HTTP/2 multiplexing, and WebSocket.",
    category: "CS Fundamentals",
    domainSlug: "cs-fundamentals",
    difficulty: "Medium",
    questionsCount: 5,
    completedCount: 0,
    icon: "Layers",
    tags: ["Networks", "TCP", "HTTP", "TLS"],
    source: "local-seed",
  },

  // 4. Frontend Development
  {
    id: "prac-top-fe-react",
    title: "React Internals & Rendering Performance",
    description: "Fiber reconciliation, automatic batching, Concurrent Mode, useTransition, and custom memo hooks.",
    category: "Frontend Development",
    domainSlug: "frontend-development",
    difficulty: "Medium",
    questionsCount: 6,
    completedCount: 0,
    icon: "Code",
    tags: ["React", "Performance", "Fiber", "Hooks"],
    source: "local-seed",
  },

  // 5. Backend Development
  {
    id: "prac-top-be-node",
    title: "Node.js Event Loop & Microservices",
    description: "Libuv thread pool, phases of the event loop, stream piping, backpressure, and clustering.",
    category: "Backend Development",
    domainSlug: "backend-development",
    difficulty: "Hard",
    questionsCount: 6,
    completedCount: 0,
    icon: "Layers",
    tags: ["NodeJS", "EventLoop", "Streams", "Microservices"],
    source: "local-seed",
  },

  // 6. Databases
  {
    id: "prac-top-dbms-sql",
    title: "Relational Indexing & Query Tuning",
    description: "B+ Tree mechanics, composite index leftmost prefix rule, query execution plans, and ACID isolation levels.",
    category: "Databases",
    domainSlug: "databases",
    difficulty: "Medium",
    questionsCount: 6,
    completedCount: 0,
    icon: "Database",
    tags: ["SQL", "Indexing", "ACID", "Postgres"],
    source: "local-seed",
  },

  // 7. Full Stack
  {
    id: "prac-top-fs-mern",
    title: "Full Stack Architecture & Auth Flows",
    description: "JWT with secure httpOnly refresh cookie rotation, CORS preflight, SSR hydration, and atomic transactions.",
    category: "Full Stack (MERN / MEAN / Java Full Stack)",
    domainSlug: "full-stack",
    difficulty: "Medium",
    questionsCount: 6,
    completedCount: 0,
    icon: "Layers",
    tags: ["MERN", "Authentication", "Hydration", "FullStack"],
    source: "local-seed",
  },

  // 8. System Design
  {
    id: "prac-top-sd-scale",
    title: "High Level Scalability & Distributed Systems",
    description: "Consistent hashing, distributed locking (Redlock), CAP theorem tradeoffs, and CDC data pipelines.",
    category: "System Design",
    domainSlug: "system-design",
    difficulty: "Hard",
    questionsCount: 6,
    completedCount: 0,
    icon: "Layers",
    tags: ["SystemDesign", "ConsistentHashing", "DistributedSystems"],
    source: "local-seed",
  },

  // 9. DevOps & Cloud
  {
    id: "prac-top-devops-k8s",
    title: "Docker Containerization & Kubernetes Orchestration",
    description: "Multi-stage builds, cgroups & namespaces, Pod lifecycle, Ingress controllers, and rolling zero-downtime updates.",
    category: "DevOps & Cloud",
    domainSlug: "devops-cloud",
    difficulty: "Hard",
    questionsCount: 6,
    completedCount: 0,
    icon: "Cloud",
    tags: ["Docker", "Kubernetes", "DevOps", "CI/CD"],
    source: "local-seed",
  },

  // 10. AI & Machine Learning
  {
    id: "prac-top-ai-rag",
    title: "LLM Orchestration, RAG & Vector Embeddings",
    description: "Dense vector embeddings, approximate nearest neighbors (HNSW), chunking strategies, and LangChain agents.",
    category: "AI & Machine Learning",
    domainSlug: "ai-machine-learning",
    difficulty: "Hard",
    questionsCount: 6,
    completedCount: 0,
    icon: "Layers",
    tags: ["AI", "LLM", "RAG", "VectorDB"],
    source: "local-seed",
  },

  // 11. Data & Analytics
  {
    id: "prac-top-data-sql",
    title: "Analytical SQL & Window Functions",
    description: "Window partitioning (ROW_NUMBER, DENSE_RANK, LEAD/LAG), CTE aggregations, and star schema modeling.",
    category: "Data & Analytics",
    domainSlug: "data-analytics",
    difficulty: "Medium",
    questionsCount: 5,
    completedCount: 0,
    icon: "Database",
    tags: ["Analytics", "SQL", "WindowFunctions", "ETL"],
    source: "local-seed",
  },

  // 12. Mobile Development
  {
    id: "prac-top-mob-arch",
    title: "Mobile Architecture & State Management",
    description: "Jetpack Compose recomposition, Swift Concurrency (async/await), offline-first SQLite sync, and battery optimization.",
    category: "Mobile Development",
    domainSlug: "mobile-development",
    difficulty: "Medium",
    questionsCount: 5,
    completedCount: 0,
    icon: "Code",
    tags: ["Mobile", "Kotlin", "Swift", "Architecture"],
    source: "local-seed",
  },

  // 13. Cybersecurity
  {
    id: "prac-top-sec-owasp",
    title: "Application Security & OWASP Top 10",
    description: "CSRF token validation, SQL injection prevention, Content Security Policy (CSP), and secure password hashing (Argon2).",
    category: "Cybersecurity",
    domainSlug: "cybersecurity",
    difficulty: "Medium",
    questionsCount: 5,
    completedCount: 0,
    icon: "Layers",
    tags: ["Security", "OWASP", "Cryptography", "Auth"],
    source: "local-seed",
  },

  // 14. Testing & QA
  {
    id: "prac-top-test-auto",
    title: "End-to-End & Integration Testing Patterns",
    description: "Test pyramid balance, flaky test elimination in Playwright/Cypress, mocking external APIs, and contract testing.",
    category: "Testing & QA",
    domainSlug: "testing-qa",
    difficulty: "Medium",
    questionsCount: 5,
    completedCount: 0,
    icon: "Layers",
    tags: ["Testing", "QA", "Playwright", "Jest"],
    source: "local-seed",
  },

  // 15. Tools & Productivity
  {
    id: "prac-top-tools-git",
    title: "Git Internals & Advanced Branching",
    description: "Commit DAG structure, interactive rebase, cherry-pick merge conflict resolution, and git bisect debugging.",
    category: "Tools & Productivity",
    domainSlug: "tools-productivity",
    difficulty: "Easy",
    questionsCount: 5,
    completedCount: 0,
    icon: "Layers",
    tags: ["Git", "Workflows", "Debugging"],
    source: "local-seed",
  },

  // 16. Aptitude & Reasoning
  {
    id: "prac-top-apt-quant",
    title: "Placement Quantitative & Logical Shortcuts",
    description: "Relative speed equations, work & pipes rate formulas, syllogisms, and probability distributions.",
    category: "Aptitude & Reasoning",
    domainSlug: "aptitude-reasoning",
    difficulty: "Easy",
    questionsCount: 5,
    completedCount: 0,
    icon: "Layers",
    tags: ["Aptitude", "Math", "Logic", "Placement"],
    source: "local-seed",
  },

  // 17. HR & Behavioral
  {
    id: "prac-top-hr-star",
    title: "STAR Framework & Engineering Leadership",
    description: "Framing technical disagreements, resolving cross-team dependencies, and articulating ownership of production failures.",
    category: "HR & Behavioral",
    domainSlug: "hr-behavioral",
    difficulty: "Easy",
    questionsCount: 6,
    completedCount: 0,
    icon: "Users",
    tags: ["HR", "Behavioral", "STAR", "Leadership"],
    source: "local-seed",
  },

  // 18. Emerging Tech
  {
    id: "prac-top-et-web3",
    title: "Web3, Blockchain & Consensus Protocols",
    description: "Proof of Stake validator staking, smart contract reentrancy vulnerabilities, EVM gas calculation, and zero knowledge proofs.",
    category: "Emerging Tech",
    domainSlug: "emerging-tech",
    difficulty: "Hard",
    questionsCount: 5,
    completedCount: 0,
    icon: "Layers",
    tags: ["Blockchain", "SmartContracts", "Web3"],
    source: "local-seed",
  },

  // 19. Product & Business
  {
    id: "prac-top-pb-metrics",
    title: "Product Metrics, A/B Testing & Estimation",
    description: "Defining North Star metrics, sample size power calculations, Fermi back-of-the-envelope estimation, and funnel dropoff analysis.",
    category: "Product & Business",
    domainSlug: "product-business",
    difficulty: "Medium",
    questionsCount: 5,
    completedCount: 0,
    icon: "Layers",
    tags: ["Product", "Metrics", "Estimation", "Analytics"],
    source: "local-seed",
  },
];

export const SEED_PRACTICE_QUESTIONS: SeedPracticeQuestion[] = [
  // Java Questions
  {
    id: "prac-q-java-1",
    topicId: "prac-top-pl-java",
    domainSlug: "programming-languages",
    title: "JVM Garbage Collection Generational Hypothesis",
    difficulty: "Medium",
    prompt: "Explain why the JVM heap is split into Young and Old generations, and how Minor GC differs from Major GC in G1/ZGC.",
    keyPoints: [
      "Weak Generational Hypothesis states that most objects die very shortly after allocation.",
      "Young generation (Eden + Survivor spaces S0/S1) uses fast copying collector (Minor GC).",
      "Objects surviving multiple aging cycles (tenuring threshold) get promoted to Old/Tenured space.",
      "Major GC cleans Old generation; G1 partitions heap into equal regions and prioritizes high-garbage regions.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-java-2",
    topicId: "prac-top-pl-java",
    domainSlug: "programming-languages",
    title: "Virtual Threads (Project Loom) vs Platform Threads",
    difficulty: "Hard",
    prompt: "How do Java 21 Virtual Threads achieve high concurrency with minimal memory footprint compared to OS threads?",
    keyPoints: [
      "Virtual threads are managed by the JVM runtime rather than 1:1 mapped to OS kernel threads.",
      "Carrier threads (ForkJoinPool) mount and execute virtual threads.",
      "When a virtual thread blocks on socket/file I/O, the JVM unmounts it from the carrier thread without blocking OS kernel resource.",
      "Stack memory starts at a few hundred bytes dynamically growing, allowing millions of concurrent threads.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-java-3",
    topicId: "prac-top-pl-java",
    domainSlug: "programming-languages",
    title: "Java Memory Model & volatile Semantics",
    difficulty: "Hard",
    prompt: "What guarantees does the 'volatile' keyword provide in Java, and why is it insufficient for compound operations like count++?",
    keyPoints: [
      "Ensures memory visibility: reads and writes bypass CPU L1/L2 caches and interact with main memory.",
      "Establishes Happens-Before ordering, preventing compiler and CPU instruction reordering.",
      "Does NOT provide mutual exclusion/atomicity: count++ is a read-modify-write sequence requiring AtomicInteger or synchronized locks.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-java-4",
    topicId: "prac-top-pl-java",
    domainSlug: "programming-languages",
    title: "ConcurrentHashMap Under the Hood",
    difficulty: "Medium",
    prompt: "How does Java 8+ ConcurrentHashMap achieve thread-safe reads and writes without locking the entire map?",
    keyPoints: [
      "Uses CAS (Compare-And-Swap) for inserting the first node of an empty bucket.",
      "Uses synchronized on the head node of a populated bucket, limiting lock contention to single bins.",
      "Volatile reads on node pointers ensure lock-free concurrent get() queries.",
      "Buckets automatically treeify into Red-Black trees when bin count exceeds 8.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-java-5",
    topicId: "prac-top-pl-java",
    domainSlug: "programming-languages",
    title: "Java Records vs Traditional POJO / Lombok",
    difficulty: "Easy",
    prompt: "What are the structural constraints and compile-time benefits of Java 16+ Records?",
    keyPoints: [
      "Records are transparent, immutable carriers for shallow data; implicitly final and extending java.lang.Record.",
      "Auto-generates canonical constructor, private final fields, accessors, equals, hashCode, and toString.",
      "Compact constructors allow clean invariant validation without boilerplate parameter assignments.",
    ],
    source: "local-seed",
  },

  // DSA Questions
  {
    id: "prac-q-dsa-1",
    topicId: "prac-top-dsa-arrays",
    domainSlug: "dsa",
    title: "Sliding Window Dynamic Shrink Invariant",
    difficulty: "Medium",
    prompt: "Describe the two-pointer sliding window template for finding the minimum length contiguous subarray satisfying a condition.",
    keyPoints: [
      "Expand the right pointer to incorporate elements and satisfy the target constraint.",
      "Once constraint is met, increment the left pointer to find minimum valid window while updating answer.",
      "Ensure overall time complexity is O(N) since each pointer moves from 0 to N at most once.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-dsa-2",
    topicId: "prac-top-dsa-arrays",
    domainSlug: "dsa",
    title: "Dutch National Flag 3-Way Partitioning",
    difficulty: "Medium",
    prompt: "How does the Dutch National Flag algorithm partition an array containing 0s, 1s, and 2s in single-pass O(N) time and O(1) space?",
    keyPoints: [
      "Maintain three pointers: low, mid, and high.",
      "If arr[mid] == 0, swap(arr[low], arr[mid]), increment low and mid.",
      "If arr[mid] == 1, simply increment mid.",
      "If arr[mid] == 2, swap(arr[mid], arr[high]), decrement high without advancing mid.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-dsa-3",
    topicId: "prac-top-dsa-trees",
    domainSlug: "dsa",
    title: "Lowest Common Ancestor in Binary Trees",
    difficulty: "Medium",
    prompt: "Explain how post-order DFS finds the Lowest Common Ancestor (LCA) of nodes p and q in a general binary tree.",
    keyPoints: [
      "Base case: if current node is null, p, or q, return current node.",
      "Recursively evaluate left and right subtrees.",
      "If both left and right return non-null, the current root is the LCA.",
      "Otherwise, return whichever branch is non-null.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-dsa-4",
    topicId: "prac-top-dsa-dp",
    domainSlug: "dsa",
    title: "0/1 Knapsack Space Optimization to 1D Array",
    difficulty: "Hard",
    prompt: "Why must the inner capacity loop iterate backwards from W down to weight[i] when optimizing 0/1 knapsack to a 1D array?",
    keyPoints: [
      "Iterating backwards prevents overwriting states from the previous item's row before they are read.",
      "Forward iteration would cause an item to be included multiple times (unbounded knapsack).",
      "Reduces space complexity from O(N * W) to O(W) while maintaining identical O(N * W) time.",
    ],
    source: "local-seed",
  },

  // CS Fundamentals Questions
  {
    id: "prac-q-cs-1",
    topicId: "prac-top-cs-os",
    domainSlug: "cs-fundamentals",
    title: "Virtual Memory Paging & Page Fault Handling",
    difficulty: "Medium",
    prompt: "Step through the CPU and OS kernel sequence when a process triggers a Page Fault interrupt.",
    keyPoints: [
      "MMU checks page table entry; valid bit is 0 triggering a hardware trap to kernel page fault handler.",
      "OS looks up backing store location on disk/swap space.",
      "OS allocates an available physical frame (or executes LRU eviction if physical RAM is saturated).",
      "Disk I/O loads page into frame, page table updated with valid bit set to 1, and instruction resumes.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-cs-2",
    topicId: "prac-top-cs-networks",
    domainSlug: "cs-fundamentals",
    title: "TCP 3-Way Handshake & SYN Flood Defense",
    difficulty: "Medium",
    prompt: "Explain the TCP handshake exchange and how SYN Cookies protect servers against SYN flood denial of service attacks.",
    keyPoints: [
      "Client sends SYN (seq=x), server responds with SYN-ACK (seq=y, ack=x+1), client returns ACK (ack=y+1).",
      "Under SYN flood, half-open connections exhaust server backlog queue memory.",
      "SYN Cookies encode client IP, port, and timestamp into the server's initial sequence number without allocating TCB in memory until final ACK.",
    ],
    source: "local-seed",
  },

  // Frontend Questions
  {
    id: "prac-q-fe-1",
    topicId: "prac-top-fe-react",
    domainSlug: "frontend-development",
    title: "React Fiber Reconciliation & Priority Lanes",
    difficulty: "Hard",
    prompt: "How did React Fiber solve the stack reconciler blocking issue, and what role do priority lanes play?",
    keyPoints: [
      "Fiber represents a unit of work as a linked list of virtual fiber nodes.",
      "Work can be paused, aborted, or resumed between browser animation frames using time-slicing.",
      "High priority events (typing, clicks) interrupt lower priority transitions (filtering large tables) via lanes.",
    ],
    source: "local-seed",
  },
  {
    id: "prac-q-fe-2",
    topicId: "prac-top-fe-react",
    domainSlug: "frontend-development",
    title: "Hydration Mismatches & Solutions in SSR",
    difficulty: "Medium",
    prompt: "What causes React hydration errors in Next.js/SSR and how do you systematically diagnose and resolve them?",
    keyPoints: [
      "Server HTML and initial client render output differ (e.g. Date.now(), window dimension checks, invalid HTML nesting).",
      "React re-attaches event listeners to existing DOM; mismatched markup forces costly client re-renders.",
      "Use useEffect for client-only state, dynamic imports with ssr: false, or suppressHydrationWarning for benign mismatches.",
    ],
    source: "local-seed",
  },

  // Backend Questions
  {
    id: "prac-q-be-1",
    topicId: "prac-top-be-node",
    domainSlug: "backend-development",
    title: "Node.js Event Loop Microtasks vs Macrotasks",
    difficulty: "Medium",
    prompt: "In what exact order does Node.js drain process.nextTick, Promise.then, setImmediate, and setTimeout callbacks?",
    keyPoints: [
      "process.nextTick queue executes immediately after the current operation finishes, before any other microtasks.",
      "Promise.then/catch microtask queue executes next, before transitioning between event loop phases.",
      "Timers phase runs expired setTimeout/setInterval.",
      "Check phase runs setImmediate callbacks; I/O poll phase handles incoming connections.",
    ],
    source: "local-seed",
  },

  // System Design Questions
  {
    id: "prac-q-sd-1",
    topicId: "prac-top-sd-scale",
    domainSlug: "system-design",
    title: "Consistent Hashing with Virtual Nodes",
    difficulty: "Hard",
    prompt: "How does consistent hashing minimize cache key migrations during server addition or failure, and why are virtual nodes necessary?",
    keyPoints: [
      "Nodes and keys are mapped to a 360-degree hash ring using MD5/MurmurHash.",
      "A key is routed to the first node located clockwise on the ring.",
      "Adding a node only reassigns keys from its immediate successor, rather than full N-modulo rehash.",
      "Virtual nodes (100-200 replicas per physical node) distribute keys uniformly and prevent hotspots.",
    ],
    source: "local-seed",
  },

  // AI & ML Questions
  {
    id: "prac-q-ai-1",
    topicId: "prac-top-ai-rag",
    domainSlug: "ai-machine-learning",
    title: "RAG Chunking Strategy & Hybrid Search",
    difficulty: "Hard",
    prompt: "What are the tradeoffs of fixed-size vs semantic document chunking, and how does hybrid BM25 + vector search boost retrieval recall?",
    keyPoints: [
      "Fixed-size chunking with overlap (e.g. 512 tokens with 50 overlap) is fast but cuts across paragraph semantics.",
      "Semantic chunking splits on heading boundaries and sentence embedding similarity drops.",
      "Dense vector search captures conceptual semantics while BM25 keyword search preserves exact part numbers/acronyms.",
      "Reciprocal Rank Fusion (RRF) combines scores from both channels for optimal contextual recall.",
    ],
    source: "local-seed",
  },

  // HR & Behavioral Questions
  {
    id: "prac-q-hr-1",
    topicId: "prac-top-hr-star",
    domainSlug: "hr-behavioral",
    title: "Structuring Critical Technical Disagreements (STAR)",
    difficulty: "Easy",
    prompt: "How should an engineer structure an answer about disagreeing with a team lead on architecture using the STAR method?",
    keyPoints: [
      "Situation: Describe the high-stakes project context without villainizing team members.",
      "Task: Define your shared technical goal (e.g. reducing API latency under SLA deadlines).",
      "Action: Highlight data-driven benchmark evidence, prototyping, respectful discussion, and willingness to commit.",
      "Result: Detail the tangible metric improvement, post-mortem learning, and preserved team trust.",
    ],
    source: "local-seed",
  },
];
