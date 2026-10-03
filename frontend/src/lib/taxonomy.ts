/**
 * Central Taxonomy Engine - Single Source of Truth for Domains & Topics
 * AI Interview Preparation Platform
 */

export interface Topic {
  id: string;
  name: string;
  slug: string;
  subtopics?: string[];
  description?: string;
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string; // Tailwind accent or hex color representation
  description: string;
  topics: Topic[];
}

export const BASE_DOMAINS: Domain[] = [
  {
    id: "dom-prog-lang",
    name: "Programming Languages",
    slug: "programming-languages",
    icon: "Code2",
    color: "#06b6d4",
    description: "Core programming syntax, runtime mechanics, memory management, and idioms.",
    topics: [
      { id: "top-java", name: "Java", slug: "java", subtopics: ["JVM & Bytecode", "Memory & GC", "Multithreading", "Streams & Lambdas", "Collections Framework", "Generics"] },
      { id: "top-python", name: "Python", slug: "python", subtopics: ["GIL & Concurrency", "Generators & Iterators", "Decorators", "Dunder Methods", "Memory Management", "Asyncio"] },
      { id: "top-c", name: "C", slug: "c", subtopics: ["Pointers & Memory Allocation", "Structs & Unions", "Bitwise Operations", "Preprocessors", "File I/O"] },
      { id: "top-cpp", name: "C++", slug: "cpp", subtopics: ["Pointers & References", "RAII & Smart Pointers", "Templates & STL", "Move Semantics", "Virtual Tables", "Concurrency"] },
      { id: "top-js", name: "JavaScript", slug: "javascript", subtopics: ["Event Loop & Async", "Closures & Scope", "Prototypes & Classes", "ES6+ Features", "Promises & Async/Await", "V8 Engine Internals"] },
      { id: "top-ts", name: "TypeScript", slug: "typescript", subtopics: ["Type Inference", "Generics", "Utility Types", "Decorators", "Type Narrowing", "Declaration Files"] },
      { id: "top-go", name: "Go", slug: "go", subtopics: ["Goroutines & Channels", "Interfaces & Structs", "Memory & Escaping", "Garbage Collection", "Error Handling"] },
      { id: "top-rust", name: "Rust", slug: "rust", subtopics: ["Ownership & Borrowing", "Lifetimes", "Pattern Matching", "Traits", "Concurrency Without Data Races"] },
      { id: "top-csharp", name: "C#", slug: "csharp", subtopics: ["CLR & Assemblies", "LINQ", "Async/Await", "Delegates & Events", "Garbage Collection"] },
      { id: "top-kotlin", name: "Kotlin", slug: "kotlin", subtopics: ["Null Safety", "Coroutines", "Extension Functions", "Data Classes", "Sealed Interfaces"] },
      { id: "top-swift", name: "Swift", slug: "swift", subtopics: ["ARC Memory Management", "Optionals", "Protocols & Extensions", "Closures", "SwiftUI Basics"] },
      { id: "top-php", name: "PHP", slug: "php", subtopics: ["PHP 8 Types", "OPcache", "Composer & Autoloading", "Generators", "Security Best Practices"] },
      { id: "top-shell", name: "Shell/Bash", slug: "shell-bash", subtopics: ["Variables & Loops", "Pipes & Redirection", "Awk & Sed", "Process Management", "Script Debugging"] },
    ],
  },
  {
    id: "dom-dsa",
    name: "Data Structures & Algorithms",
    slug: "dsa",
    icon: "Binary",
    color: "#3b82f6",
    description: "Fundamental and advanced algorithmic problem-solving techniques for competitive coding.",
    topics: [
      { id: "top-arrays", name: "Arrays", slug: "arrays", subtopics: ["Prefix Sum", "Kadane's Algorithm", "Matrix Manipulation", "Dutch National Flag", "In-place Array Mutations"] },
      { id: "top-strings", name: "Strings", slug: "strings", subtopics: ["String Matching (KMP, Rabin-Karp)", "Anagrams", "Palindrome Problems", "Trie Matching"] },
      { id: "top-linked-list", name: "Linked List", slug: "linked-list", subtopics: ["Fast & Slow Pointers", "Reversals", "Cycle Detection", "Merge K Sorted Lists"] },
      { id: "top-stack-queue", name: "Stack & Queue", slug: "stack-queue", subtopics: ["Monotonic Stack", "Queue using Stacks", "LRU/LFU Cache", "Parentheses Validation"] },
      { id: "top-hashing", name: "Hashing", slug: "hashing", subtopics: ["Hash Map Collision Handling", "Subarray Sum Equals K", "Rolling Hash", "Counting Frequencies"] },
      { id: "top-recursion", name: "Recursion & Backtracking", slug: "recursion-backtracking", subtopics: ["Subsets & Permutations", "N-Queens", "Sudoku Solver", "Combinations"] },
      { id: "top-sorting", name: "Sorting & Searching", slug: "sorting-searching", subtopics: ["Merge Sort", "Quick Sort", "Heap Sort", "Counting & Radix Sort"] },
      { id: "top-binary-search", name: "Binary Search", slug: "binary-search", subtopics: ["Search in Rotated Array", "Binary Search on Answer Space", "Lower/Upper Bound", "Median of Two Sorted Arrays"] },
      { id: "top-two-pointers", name: "Two Pointers", slug: "two-pointers", subtopics: ["Opposite Ends", "Fast & Slow", "Trapping Rain Water", "3Sum & 4Sum"] },
      { id: "top-sliding-window", name: "Sliding Window", slug: "sliding-window", subtopics: ["Fixed Window Size", "Dynamic Window Size", "Longest Substring Without Repeating", "Minimum Window Substring"] },
      { id: "top-trees", name: "Trees", slug: "trees", subtopics: ["DFS & BFS Traversals", "Lowest Common Ancestor", "Diameter & Height", "Tree Serialization"] },
      { id: "top-bst", name: "Binary Search Tree", slug: "binary-search-tree", subtopics: ["Validation of BST", "Inorder Successor", "Floor & Ceil", "Balance Checking"] },
      { id: "top-heaps", name: "Heaps & Priority Queue", slug: "heaps-priority-queue", subtopics: ["Top K Elements", "Merge K Sorted Arrays", "Median from Data Stream", "Min-Max Heap"] },
      { id: "top-graphs", name: "Graphs", slug: "graphs", subtopics: ["BFS & DFS", "Dijkstra's Algorithm", "Bellman-Ford", "Topological Sort", "Floyd-Warshall", "MST (Kruskal & Prim)"] },
      { id: "top-tries", name: "Tries", slug: "tries", subtopics: ["Prefix Search", "Word Break Problem", "Maximum XOR Pair", "Autocomplete Engine"] },
      { id: "top-dp", name: "Dynamic Programming", slug: "dynamic-programming", subtopics: ["1D DP", "2D Grid DP", "Knapsack (0/1 & Unbounded)", "LCS & LIS", "DP on Trees", "Digit DP"] },
      { id: "top-greedy", name: "Greedy", slug: "greedy", subtopics: ["Activity Selection", "Huffman Coding", "Jump Game", "Gas Station"] },
      { id: "top-bit-manip", name: "Bit Manipulation", slug: "bit-manipulation", subtopics: ["Bitmasking", "Counting Bits", "Single Number", "Subsets Generation with Bits"] },
      { id: "top-union-find", name: "Union Find", slug: "union-find", subtopics: ["Disjoint Set Union", "Path Compression", "Union by Rank", "Connected Components"] },
      { id: "top-math-number", name: "Math & Number Theory", slug: "math-number-theory", subtopics: ["Sieve of Eratosthenes", "GCD & Euclidean Algorithm", "Fast Modular Exponentiation", "Combinatorics"] },
      { id: "top-complexity", name: "Complexity Analysis", slug: "complexity-analysis", subtopics: ["Big-O, Big-Omega, Big-Theta", "Amortized Analysis", "Master Theorem", "Space-Time Trade-offs"] },
    ],
  },
  {
    id: "dom-cs-fund",
    name: "CS Fundamentals",
    slug: "cs-fundamentals",
    icon: "Cpu",
    color: "#8b5cf6",
    description: "Core university computer science concepts tested in technical interviews.",
    topics: [
      { id: "top-os", name: "Operating Systems", slug: "operating-systems", subtopics: ["Process & Thread Models", "CPU Scheduling", "Virtual Memory & Paging", "Deadlocks & Semaphores", "File Systems & I/O"] },
      { id: "top-dbms-fund", name: "DBMS", slug: "dbms", subtopics: ["ACID Properties", "Relational Algebra", "Normalization (1NF-BCNF)", "Concurrency Control & 2PL", "Crash Recovery (WAL)"] },
      { id: "top-networks", name: "Computer Networks", slug: "computer-networks", subtopics: ["OSI & TCP/IP Stack", "TCP 3-Way Handshake & Congestion Control", "DNS & HTTP/HTTPS Protocols", "Routing Protocols", "Sockets & WebSockets"] },
      { id: "top-oop", name: "OOP", slug: "oop", subtopics: ["Inheritance vs Composition", "Polymorphism (Dynamic & Static)", "Encapsulation & Abstraction", "Abstract Classes vs Interfaces"] },
      { id: "top-comp-arch", name: "Computer Architecture", slug: "computer-architecture", subtopics: ["CPU Pipelining", "Memory Hierarchy & Caches", "Instruction Set Architecture (RISC/CISC)", "Branch Prediction"] },
      { id: "top-compilers", name: "Compilers & Theory of Computation", slug: "compilers-theory-of-computation", subtopics: ["Finite Automata (DFA/NFA)", "Grammars & Parsing (LL/LR)", "Lexical Analysis", "Code Optimization"] },
      { id: "top-design-patterns", name: "Design Patterns", slug: "design-patterns", subtopics: ["Creational (Singleton, Factory)", "Structural (Adapter, Decorator)", "Behavioral (Observer, Strategy)", "Dependency Injection"] },
      { id: "top-solid", name: "SOLID Principles", slug: "solid-principles", subtopics: ["Single Responsibility", "Open/Closed", "Liskov Substitution", "Interface Segregation", "Dependency Inversion"] },
    ],
  },
  {
    id: "dom-frontend",
    name: "Frontend Development",
    slug: "frontend-development",
    icon: "Layout",
    color: "#10b981",
    description: "Modern browser architecture, reactive user interfaces, and state management.",
    topics: [
      { id: "top-html-css", name: "HTML & CSS", slug: "html-css", subtopics: ["Semantic HTML5", "Flexbox & Grid Layouts", "CSS Box Model", "Animations & Transitions", "CSS Specificity"] },
      { id: "top-js-deep", name: "JavaScript Deep Dive", slug: "javascript-deep-dive", subtopics: ["Execution Context & Hoisting", "Prototypal Inheritance", "Debounce & Throttle", "Custom Promise Implementation", "Currying"] },
      { id: "top-ts-fe", name: "TypeScript", slug: "typescript-fe", subtopics: ["Typing React Props & State", "Generic Components", "Discriminated Unions", "Type Assertions"] },
      { id: "top-react", name: "React", slug: "react", subtopics: ["Fiber Reconciler", "Virtual DOM Diffing", "Custom Hooks", "Context API", "Server Components", "Suspense & Concurrent Mode"] },
      { id: "top-nextjs", name: "Next.js", slug: "nextjs", subtopics: ["App Router vs Pages Router", "SSR, SSG & ISR", "API Routes & Server Actions", "Image & Font Optimization"] },
      { id: "top-vue", name: "Vue", slug: "vue", subtopics: ["Composition API", "Reactivity System (Proxy)", "Vue Router & Pinia", "Directives & Slots"] },
      { id: "top-angular", name: "Angular", slug: "angular", subtopics: ["Dependency Injection", "RxJS & Observables", "NgRx State Management", "Signals & Change Detection"] },
      { id: "top-state-mgmt", name: "State Management", slug: "state-management", subtopics: ["Redux Toolkit", "Zustand & Jotai", "Server State (React Query / TanStack Query)", "Immutability"] },
      { id: "top-web-perf", name: "Web Performance", slug: "web-performance", subtopics: ["Core Web Vitals (LCP, INP, CLS)", "Bundle Splitting & Lazy Loading", "Tree Shaking", "Critical Rendering Path"] },
      { id: "top-accessibility", name: "Accessibility", slug: "accessibility", subtopics: ["WCAG 2.1 Guidelines", "ARIA Roles & Attributes", "Keyboard Navigation", "Color Contrast & Screen Readers"] },
      { id: "top-browser-dom", name: "Browser & DOM", slug: "browser-dom", subtopics: ["DOM Traversal & Event Bubbling", "Reflow vs Repaint", "Cookies, LocalStorage & IndexedDB", "Web Workers & Service Workers"] },
      { id: "top-responsive-tailwind", name: "Responsive Design & Tailwind", slug: "responsive-design-tailwind", subtopics: ["Mobile-First Breakpoints", "Fluid Typography", "Tailwind JIT & Custom Utilities", "Container Queries"] },
      { id: "top-fe-testing", name: "Testing (Jest, RTL)", slug: "testing-jest-rtl", subtopics: ["Unit Testing Components", "Integration Testing with User Events", "Mocking API Requests (MSW)", "Snapshot Testing"] },
    ],
  },
  {
    id: "dom-backend",
    name: "Backend Development",
    slug: "backend-development",
    icon: "Server",
    color: "#6366f1",
    description: "Server architecture, distributed request processing, APIs, and microservices.",
    topics: [
      { id: "top-node-express", name: "Node.js & Express", slug: "nodejs-express", subtopics: ["Middleware Architecture", "Cluster Module & Multiprocessing", "Event Emitter & Streams", "Error Handling Pipelines"] },
      { id: "top-spring-boot", name: "Spring Boot", slug: "spring-boot", subtopics: ["IoC Container & Beans", "Spring Security & JWT", "Spring Data JPA & Hibernate", "Actuator & Telemetry", "Spring Cloud"] },
      { id: "top-django-fastapi", name: "Django & FastAPI", slug: "django-fastapi", subtopics: ["Async Request Handling (ASGI)", "Pydantic Models", "Django ORM Optimization", "Dependency Injection in FastAPI"] },
      { id: "top-rest-api", name: "REST API Design", slug: "rest-api-design", subtopics: ["Idempotency & HTTP Methods", "HTTP Status Codes", "Versioning Strategies", "Pagination & Filtering Standards"] },
      { id: "top-graphql", name: "GraphQL", slug: "graphql", subtopics: ["Schema Definition & Resolvers", "N+1 Problem & DataLoader", "Mutations & Subscriptions", "Federation"] },
      { id: "top-auth", name: "Authentication (JWT, OAuth)", slug: "authentication-jwt-oauth", subtopics: ["JWT Claims & Refresh Rotation", "OAuth 2.0 & OIDC Flows", "Session-based vs Token-based Auth", "Role-Based Access Control (RBAC)"] },
      { id: "top-caching-be", name: "Caching", slug: "caching", subtopics: ["Cache-Aside Pattern", "Write-Through & Write-Behind", "Cache Invalidation & Thundering Herd", "Redis Data Structures"] },
      { id: "top-msg-queues", name: "Message Queues", slug: "message-queues", subtopics: ["Kafka Partitions & Consumer Groups", "RabbitMQ Exchanges & Queues", "At-Least-Once Delivery", "Dead Letter Queues (DLQ)"] },
      { id: "top-microservices", name: "Microservices", slug: "microservices", subtopics: ["Service Discovery (Eureka/Consul)", "API Gateway Pattern", "Saga Pattern for Distributed Transactions", "Circuit Breakers (Resilience4j)"] },
      { id: "top-api-security", name: "API Security", slug: "api-security", subtopics: ["Rate Limiting & Throttling", "Input Sanitization & SQLi Prevention", "CORS Configuration", "Secret Management"] },
      { id: "top-websockets", name: "WebSockets", slug: "websockets", subtopics: ["Full-Duplex Communication", "Handshake & Protocol Upgrades", "Heartbeats & Reconnection", "Scaling WebSockets via Redis Pub/Sub"] },
    ],
  },
  {
    id: "dom-databases",
    name: "Databases",
    slug: "databases",
    icon: "Database",
    color: "#f59e0b",
    description: "Relational, document, key-value data stores, and indexing internals.",
    topics: [
      { id: "top-sql", name: "SQL", slug: "sql", subtopics: ["Complex Joins (Inner, Left, Cross)", "Window Functions (Rank, Dense_Rank, Row_Number)", "CTEs & Subqueries", "Aggregations & Group By"] },
      { id: "top-mysql", name: "MySQL", slug: "mysql", subtopics: ["InnoDB Storage Engine", "Clustered vs Secondary Indexes", "Replication & Binlog", "EXPLAIN Query Analysis"] },
      { id: "top-postgres", name: "PostgreSQL", slug: "postgresql", subtopics: ["MVCC (Multi-Version Concurrency Control)", "Vacuum & Autovacuum", "JSONB Querying", "Partial & Expression Indexes"] },
      { id: "top-mongodb", name: "MongoDB", slug: "mongodb", subtopics: ["Document Modeling", "Aggregation Pipelines", "Sharding & Replica Sets", "WiredTiger Engine"] },
      { id: "top-redis", name: "Redis", slug: "redis", subtopics: ["Strings, Hashes, Lists, Sets, Sorted Sets", "Persistence (RDB & AOF)", "Pub/Sub Mechanisms", "Distributed Locks (Redlock)"] },
      { id: "top-indexing-opt", name: "Indexing & Query Optimization", slug: "indexing-query-optimization", subtopics: ["B-Tree & B+ Tree Internals", "Composite Index Column Ordering", "Covering Indexes", "Slow Query Log Profiling"] },
      { id: "top-trans-acid", name: "Transactions & ACID", slug: "transactions-acid", subtopics: ["Isolation Levels (Read Uncommitted to Serializable)", "Phantom Reads & Dirty Reads", "Pessimistic vs Optimistic Locking", "Two-Phase Commit (2PC)"] },
      { id: "top-normalization", name: "Normalization", slug: "normalization", subtopics: ["Functional Dependencies", "1NF, 2NF, 3NF, BCNF", "Denormalization for High Read Workloads"] },
      { id: "top-nosql-concepts", name: "NoSQL Concepts", slug: "nosql-concepts", subtopics: ["CAP Theorem Trade-offs", "Eventual Consistency", "Key-Value, Columnar, Graph, Document DBs", "BASE Properties"] },
      { id: "top-data-modeling", name: "Data Modeling", slug: "data-modeling", subtopics: ["Entity-Relationship (ER) Diagrams", "Schema Migration Strategies", "Polymorphic Associations", "Temporal Data Storage"] },
    ],
  },
  {
    id: "dom-fullstack",
    name: "Full Stack (MERN / MEAN / Java Full Stack)",
    slug: "full-stack",
    icon: "Layers",
    color: "#14b8a6",
    description: "End-to-end full stack architecture connecting client, server, and persistence.",
    topics: [
      { id: "top-mern", name: "MERN Stack", slug: "mern-stack", subtopics: ["React Client to Express API", "Mongoose Schemas & Population", "Authentication Cookie/JWT Flow", "State Hydration"] },
      { id: "top-mean", name: "MEAN Stack", slug: "mean-stack", subtopics: ["Angular Services & Dependency Injection", "Express REST Controllers", "MongoDB Drivers", "End-to-End TypeScript"] },
      { id: "top-java-fs", name: "Java Full Stack", slug: "java-full-stack", subtopics: ["Spring Boot Backend with React Frontend", "DTOs & Model Mapping", "Spring Security CORS with Axios", "H2 / PostgreSQL Integration"] },
      { id: "top-fs-projects", name: "Full Stack Project Questions", slug: "full-stack-project-questions", subtopics: ["Architectural Defense", "Production Debugging Stories", "Handling Scale & Database Bottlenecks", "Third-party Integration"] },
      { id: "top-deployment-basics", name: "Deployment Basics", slug: "deployment-basics", subtopics: ["Environment Variables & Configuration", "Vercel / Netlify for Frontend", "Render / AWS EC2 for Backend", "HTTPS & Custom Domain Setup"] },
    ],
  },
  {
    id: "dom-system-design",
    name: "System Design",
    slug: "system-design",
    icon: "Network",
    color: "#f43f5e",
    description: "High-level distributed systems and low-level modular object design.",
    topics: [
      { id: "top-lld", name: "Low Level Design", slug: "low-level-design", subtopics: ["Class Diagrams & Relationships", "Parking Lot System", "Elevator Control System", "Tic-Tac-Toe / Chess Design", "Movie Ticket Booking System"] },
      { id: "top-hld", name: "High Level Design", slug: "high-level-design", subtopics: ["Back-of-the-envelope Calculations", "Functional & Non-functional Requirements", "Architecture Diagrams", "Data Flow Walkthroughs"] },
      { id: "top-scalability", name: "Scalability", slug: "scalability", subtopics: ["Vertical vs Horizontal Scaling", "Stateless Architecture", "Database Bottlenecks", "Geo-distribution & Latency"] },
      { id: "top-load-balancing", name: "Load Balancing", slug: "load-balancing", subtopics: ["Layer 4 vs Layer 7 Load Balancing", "Round Robin, Weighted, Least Connections", "Consistent Hashing", "Health Checks"] },
      { id: "top-caching-strat", name: "Caching Strategies", slug: "caching-strategies", subtopics: ["Cache Invalidation (TTL, Event-driven)", "Eviction Policies (LRU, LFU, FIFO)", "Thundering Herd Problem", "Distributed Cache Clusters"] },
      { id: "top-cdn", name: "CDN", slug: "cdn", subtopics: ["Edge Locations & PoPs", "Push vs Pull CDN", "Static Asset Caching & Cache-Control", "DDoS Mitigation at CDN Edge"] },
      { id: "top-sharding-rep", name: "Database Sharding & Replication", slug: "database-sharding-replication", subtopics: ["Range-based vs Hash-based Sharding", "Master-Slave vs Master-Master Replication", "Replication Lag", "Re-sharding Challenges"] },
      { id: "top-cap-theorem", name: "CAP Theorem", slug: "cap-theorem", subtopics: ["Consistency vs Availability Under Partition", "PACELC Theorem", "Strong vs Eventual Consistency", "Quorum Reads & Writes"] },
      { id: "top-rate-limiter", name: "Rate Limiter", slug: "rate-limiter", subtopics: ["Token Bucket Algorithm", "Leaky Bucket Algorithm", "Fixed Window & Sliding Window Log", "Distributed Redis Rate Limiter"] },
      { id: "top-notification-sys", name: "Notification System", slug: "notification-system", subtopics: ["Push, Email, SMS Gateways", "Priority Queues", "Deduplication & Throttling", "Message Template Engines"] },
      { id: "top-url-shortener", name: "URL Shortener", slug: "url-shortener", subtopics: ["Base62 Encoding vs MD5 Hash", "Collision Resolution", "High Read Traffic Caching", "Analytics Tracking"] },
      { id: "top-chat-sys", name: "Chat System", slug: "chat-system", subtopics: ["WebSocket Connection Management", "Presence Servers (Online/Offline Status)", "Message Ordering & Delivery Receipts", "Group Chat Fan-out"] },
      { id: "top-dist-systems", name: "Distributed Systems", slug: "distributed-systems", subtopics: ["Consensus Algorithms (Raft, Paxos)", "Vector Clocks & Idempotency Keys", "Distributed Tracing (OpenTelemetry)", "Gossip Protocol"] },
    ],
  },
  {
    id: "dom-devops-cloud",
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    icon: "Cloud",
    color: "#0284c7",
    description: "Cloud infrastructure, containerization, orchestration, and continuous deployment.",
    topics: [
      { id: "top-git-github", name: "Git & GitHub", slug: "git-github", subtopics: ["Merge vs Rebase", "Interactive Rebase & Cherry-pick", "Git Flow & Trunk-Based Development", "Resolving Merge Conflicts"] },
      { id: "top-linux", name: "Linux", slug: "linux", subtopics: ["Process Management (ps, top, kill)", "File Permissions & Chmod/Chown", "Systemd Services", "Networking Commands (netstat, curl, iptables)"] },
      { id: "top-docker", name: "Docker", slug: "docker", subtopics: ["Images vs Containers", "Multi-stage Builds", "Docker Compose", "Layer Caching & Dockerfile Optimization", "Container Networking"] },
      { id: "top-kubernetes", name: "Kubernetes", slug: "kubernetes", subtopics: ["Pods, Deployments, ReplicaSets", "Services (ClusterIP, NodePort, LoadBalancer)", "ConfigMaps & Secrets", "Ingress Controllers", "Horizontal Pod Autoscaler (HPA)"] },
      { id: "top-cicd", name: "CI/CD", slug: "ci-cd", subtopics: ["GitHub Actions Pipelines", "Automated Testing & Linting Gates", "Canary & Blue-Green Deployments", "Semantic Versioning & Release Automation"] },
      { id: "top-aws", name: "AWS", slug: "aws", subtopics: ["EC2, S3, RDS, Lambda", "VPC, Subnets & Security Groups", "IAM Policies & Roles", "CloudFront & Route 53", "Elastic Load Balancing (ALB)"] },
      { id: "top-azure", name: "Azure", slug: "azure", subtopics: ["Azure App Services & Functions", "Azure Virtual Networks", "Azure Blob Storage", "Azure Entra ID (Active Directory)"] },
      { id: "top-gcp", name: "GCP", slug: "gcp", subtopics: ["Google Compute Engine & Cloud Run", "GKE (Google Kubernetes Engine)", "Cloud Storage & BigQuery", "Cloud IAM"] },
      { id: "top-terraform", name: "Terraform & IaC", slug: "terraform-iac", subtopics: ["State Management & Remote Backends", "Providers & Resources", "Modules & Variables", "Terraform Plan & Apply Lifecycle"] },
      { id: "top-monitoring", name: "Monitoring & Logging", slug: "monitoring-logging", subtopics: ["Prometheus & Grafana Metrics", "ELK Stack (Elasticsearch, Logstash, Kibana)", "Alerting & On-Call Rotation", "Distributed Tracing with Jaeger"] },
      { id: "top-nginx", name: "Nginx", slug: "nginx", subtopics: ["Reverse Proxy Configuration", "SSL/TLS Termination", "Gzip Compression & Static Caching", "Upstream Load Balancing"] },
      { id: "top-devops-networking", name: "Networking for DevOps", slug: "networking-for-devops", subtopics: ["Subnets & CIDR Blocks", "NAT Gateways", "VPN & Direct Connect", "BGP & Anycast"] },
    ],
  },
  {
    id: "dom-aiml",
    name: "AI & Machine Learning",
    slug: "ai-machine-learning",
    icon: "Sparkles",
    color: "#a855f7",
    description: "Data-driven statistical modeling, deep neural networks, and modern Generative AI.",
    topics: [
      { id: "top-ml-fund", name: "ML Fundamentals", slug: "ml-fundamentals", subtopics: ["Bias-Variance Tradeoff", "Overfitting & Regularization (L1/L2)", "Feature Scaling & Encoding", "Train-Test-Validation Splits"] },
      { id: "top-sup-learning", name: "Supervised Learning", slug: "supervised-learning", subtopics: ["Linear & Logistic Regression", "Decision Trees & Random Forests", "Gradient Boosting (XGBoost, LightGBM)", "Support Vector Machines (SVM)"] },
      { id: "top-unsup-learning", name: "Unsupervised Learning", slug: "unsupervised-learning", subtopics: ["K-Means Clustering", "Hierarchical Clustering", "PCA (Principal Component Analysis)", "Anomaly Detection"] },
      { id: "top-deep-learning", name: "Deep Learning", slug: "deep-learning", subtopics: ["Neural Network Backpropagation", "Activation Functions (ReLU, GELU, Sigmoid)", "Optimizers (Adam, SGD, RMSprop)", "Vanishing & Exploding Gradients"] },
      { id: "top-nlp", name: "NLP", slug: "nlp", subtopics: ["Tokenization & Word Embeddings (Word2Vec)", "TF-IDF", "RNNs & LSTMs", "Attention Mechanism & Transformers"] },
      { id: "top-cv", name: "Computer Vision", slug: "computer-vision", subtopics: ["Convolutional Neural Networks (CNNs)", "Image Classification (ResNet)", "Object Detection (YOLO)", "Image Segmentation"] },
      { id: "top-llms", name: "Large Language Models", slug: "large-language-models", subtopics: ["Transformer Architecture (Encoder/Decoder)", "Pretraining & Fine-tuning (LoRA, QLoRA)", "Context Window Scaling", "KV Caching"] },
      { id: "top-prompt-eng", name: "Prompt Engineering", slug: "prompt-engineering", subtopics: ["Few-Shot & Zero-Shot Prompting", "Chain-of-Thought (CoT)", "Role-based Prompting", "System Prompts & Guardrails"] },
      { id: "top-rag-vector", name: "RAG & Vector Databases", slug: "rag-vector-databases", subtopics: ["Embedding Generation", "Vector Indexing (HNSW, IVFFlat)", "Pinecone, ChromaDB, pgvector", "Chunking Strategies & Reranking"] },
      { id: "top-langchain-agents", name: "LangChain & AI Agents", slug: "langchain-ai-agents", subtopics: ["ReAct Framework", "Tool Calling & Function Calling", "Agent Memory & Chains", "Multi-Agent Coordination"] },
      { id: "top-gen-ai", name: "Generative AI", slug: "generative-ai", subtopics: ["Diffusion Models", "GANs (Generative Adversarial Networks)", "Text-to-Image & Multimodal Models", "Temperature & Top-p Sampling"] },
      { id: "top-mlops", name: "MLOps", slug: "mlops", subtopics: ["Model Registry (MLflow)", "Feature Stores", "Model Serving (Triton, vLLM)", "Data Drift & Concept Drift Monitoring"] },
      { id: "top-model-eval", name: "Model Evaluation", slug: "model-evaluation", subtopics: ["Precision, Recall & F1-Score", "ROC-AUC Curves", "Confusion Matrix", "Perplexity & BLEU/ROUGE for NLP"] },
      { id: "top-ai-ethics", name: "AI Ethics & Safety", slug: "ai-ethics-safety", subtopics: ["Hallucination Mitigation", "Data Privacy & Copyright", "Toxicity & Bias Detection", "Red Teaming"] },
    ],
  },
  {
    id: "dom-data-analytics",
    name: "Data & Analytics",
    slug: "data-analytics",
    icon: "BarChart3",
    color: "#eab308",
    description: "Statistical analysis, ETL pipelines, BI dashboards, and big data processing.",
    topics: [
      { id: "top-data-analysis", name: "Data Analysis", slug: "data-analysis", subtopics: ["Exploratory Data Analysis (EDA)", "Missing Value Imputation", "Outlier Detection", "Correlation Analysis"] },
      { id: "top-python-data", name: "Python for Data (Pandas, NumPy)", slug: "python-for-data", subtopics: ["DataFrames & Series", "Vectorized Operations", "GroupBy & Pivot Tables", "Time Series Handling"] },
      { id: "top-stats-prob", name: "Statistics & Probability", slug: "statistics-probability", subtopics: ["Descriptive Statistics (Mean, Median, Std)", "Probability Distributions (Normal, Binomial, Poisson)", "Central Limit Theorem", "Hypothesis Testing (p-values, t-test)"] },
      { id: "top-sql-analytics", name: "SQL for Analytics", slug: "sql-for-analytics", subtopics: ["Cohort Analysis Queries", "Retention Rate Calculation", "Rolling Averages & Windowing", "Funnel Analysis"] },
      { id: "top-excel", name: "Excel", slug: "excel", subtopics: ["VLOOKUP, XLOOKUP & INDEX-MATCH", "Pivot Tables & Slicers", "Conditional Formatting", "What-If Analysis & Goal Seek"] },
      { id: "top-bi-tableau", name: "Power BI & Tableau", slug: "power-bi-tableau", subtopics: ["DAX Formulas", "Data Modeling in Power BI", "Calculated Fields & LOD in Tableau", "Interactive Dashboard Design"] },
      { id: "top-data-vis", name: "Data Visualization", slug: "data-visualization", subtopics: ["Matplotlib & Seaborn", "Chart Selection (Scatter, Heatmap, Box)", "Visual Storytelling", "Dashboard UX Best Practices"] },
      { id: "top-etl-pipelines", name: "ETL & Data Pipelines", slug: "etl-data-pipelines", subtopics: ["Batch vs Stream Processing", "Apache Airflow DAGs", "Data Quality Validation", "CDC (Change Data Capture)"] },
      { id: "top-big-data", name: "Big Data (Spark, Hadoop)", slug: "big-data-spark-hadoop", subtopics: ["Spark DataFrames & RDDs", "MapReduce Paradigm", "HDFS Architecture", "Spark Optimization (Partitioning, Broadcast)"] },
      { id: "top-data-warehousing", name: "Data Warehousing", slug: "data-warehousing", subtopics: ["Star Schema & Snowflake Schema", "Fact & Dimension Tables", "Snowflake & Amazon Redshift", "SCD (Slowly Changing Dimensions)"] },
      { id: "top-ab-testing", name: "A/B Testing", slug: "ab-testing", subtopics: ["Sample Size Determination", "Type I and Type II Errors", "Statistical Significance", "Metric Guardrails"] },
    ],
  },
  {
    id: "dom-mobile",
    name: "Mobile Development",
    slug: "mobile-development",
    icon: "Smartphone",
    color: "#ec4899",
    description: "Native and cross-platform mobile application engineering and lifecycle.",
    topics: [
      { id: "top-android", name: "Android (Kotlin)", slug: "android-kotlin", subtopics: ["Activity & Fragment Lifecycle", "Jetpack Compose", "ViewModel & LiveData / StateFlow", "Retrofit & Room Database", "WorkManager"] },
      { id: "top-ios", name: "iOS (Swift)", slug: "ios-swift", subtopics: ["SwiftUI & UIKit", "Combine Framework", "CoreData & SwiftData", "URLSession & Async Networking", "App Transport Security"] },
      { id: "top-flutter", name: "Flutter", slug: "flutter", subtopics: ["Widget Tree & State Management (Bloc, Provider)", "Dart Asynchronous Programming", "Custom Animations", "Platform Channels"] },
      { id: "top-react-native", name: "React Native", slug: "react-native", subtopics: ["Fabric Renderer & TurboModules (New Architecture)", "Bridge Mechanics", "Reanimated 3 & Gesture Handler", "Native Linking"] },
      { id: "top-mobile-arch", name: "Mobile App Architecture", slug: "mobile-app-architecture", subtopics: ["MVVM & Clean Architecture", "Offline-first Sync Engines", "Push Notifications (FCM / APNs)", "Deep Linking & Universal Links"] },
    ],
  },
  {
    id: "dom-cybersecurity",
    name: "Cybersecurity",
    slug: "cybersecurity",
    icon: "ShieldAlert",
    color: "#ef4444",
    description: "Information security, threat modeling, ethical hacking, and secure application code.",
    topics: [
      { id: "top-owasp", name: "OWASP Top 10", slug: "owasp-top-10", subtopics: ["Injection Attacks (SQLi, Command)", "Broken Authentication", "Sensitive Data Exposure", "Security Misconfiguration", "SSRF"] },
      { id: "top-cryptography", name: "Cryptography", slug: "cryptography", subtopics: ["Symmetric vs Asymmetric Encryption (AES vs RSA)", "Hashing (SHA-256, bcrypt)", "Digital Signatures & Certificates", "Public Key Infrastructure (PKI)"] },
      { id: "top-net-security", name: "Network Security", slug: "network-security", subtopics: ["Firewalls & WAF", "TLS Handshake & Cipher Suites", "VPN Protocols", "MitM (Man-in-the-Middle) Attacks"] },
      { id: "top-web-app-sec", name: "Web App Security", slug: "web-app-security", subtopics: ["Cross-Site Scripting (XSS)", "Cross-Site Request Forgery (CSRF)", "Content Security Policy (CSP)", "Clickjacking Protection"] },
      { id: "top-secure-coding", name: "Secure Coding", slug: "secure-coding", subtopics: ["Input Validation & Output Encoding", "Parameterized Queries", "Secure Password Storage", "Dependency Vulnerability Audits"] },
      { id: "top-ethical-hacking", name: "Ethical Hacking Basics", slug: "ethical-hacking-basics", subtopics: ["Reconnaissance & Footprinting", "Vulnerability Scanning (Nmap, Nessus)", "Penetration Testing Methodology", "Buffer Overflow Concepts"] },
      { id: "top-iam", name: "Identity & Access Management", slug: "identity-access-management", subtopics: ["MFA (Multi-Factor Authentication)", "SAML & SSO", "Principle of Least Privilege", "Zero Trust Architecture"] },
    ],
  },
  {
    id: "dom-testing-qa",
    name: "Testing & QA",
    slug: "testing-qa",
    icon: "CheckCircle",
    color: "#22c55e",
    description: "Quality assurance methodologies, test automation frameworks, and end-to-end testing.",
    topics: [
      { id: "top-manual-testing", name: "Manual Testing", slug: "manual-testing", subtopics: ["Test Plan Documentation", "Black Box vs White Box Testing", "Bug Lifecycle & Defect Severity", "Smoke & Sanity Testing"] },
      { id: "top-test-design", name: "Test Case Design", slug: "test-case-design", subtopics: ["Boundary Value Analysis (BVA)", "Equivalence Partitioning (EP)", "Decision Table Testing", "State Transition Testing"] },
      { id: "top-selenium", name: "Selenium", slug: "selenium", subtopics: ["WebDriver Architecture", "Locators (XPath, CSS Selectors)", "Waits (Implicit, Explicit, Fluent)", "Page Object Model (POM)"] },
      { id: "top-cypress-playwright", name: "Cypress & Playwright", slug: "cypress-playwright", subtopics: ["Auto-waiting & Flaky Test Reduction", "Network Interception & Mocking", "Multi-tab & Multi-origin Testing", "Headless CI Execution"] },
      { id: "top-api-testing", name: "API Testing (Postman)", slug: "api-testing-postman", subtopics: ["Status Code Verification", "JSON Schema Validation", "Environment Variables & Pre-request Scripts", "Newman CLI in CI/CD"] },
      { id: "top-unit-testing", name: "Unit Testing", slug: "unit-testing", subtopics: ["Mocking & Stubbing (Mockito, Jest)", "Code Coverage Metrics", "Test Fixtures", "Assertion Libraries"] },
      { id: "top-tdd-bdd", name: "TDD & BDD", slug: "tdd-bdd", subtopics: ["Red-Green-Refactor Cycle", "Cucumber & Gherkin Syntax", "Behavior-Driven Specifications", "Regression Prevention"] },
      { id: "top-perf-testing", name: "Performance Testing", slug: "performance-testing", subtopics: ["JMeter Test Plans", "Load, Stress & Spike Testing", "Throughput & Response Latency Analysis", "k6 Scripting"] },
    ],
  },
  {
    id: "dom-tools",
    name: "Tools & Productivity",
    slug: "tools-productivity",
    icon: "Wrench",
    color: "#64748b",
    description: "Developer tooling, workflow automation, and collaborative workspace utilities.",
    topics: [
      { id: "top-git-workflows", name: "Git Workflows", slug: "git-workflows", subtopics: ["Branch Protection Rules", "Code Review Best Practices", "Git Hooks (Husky)", "Bisect Debugging"] },
      { id: "top-vscode-ides", name: "VS Code & IDEs", slug: "vscode-ides", subtopics: ["Productivity Shortcuts", "Debuggers & Breakpoints", "Remote SSH & Containers", "Extensions Ecosystem"] },
      { id: "top-postman", name: "Postman", slug: "postman", subtopics: ["Collection Runners", "API Documentation Generation", "Mock Servers", "Monitors & Health Checks"] },
      { id: "top-jira-agile", name: "Jira & Agile", slug: "jira-agile", subtopics: ["Scrum Sprints & Kanbans", "Epics, Stories & Story Points", "Velocity Charts & Burndown", "Backlog Grooming"] },
      { id: "top-figma", name: "Figma", slug: "figma", subtopics: ["Inspecting Layouts for Developers", "Design Tokens", "Auto Layout & Constraints", "Component Variants"] },
      { id: "top-docker-desktop", name: "Docker Desktop", slug: "docker-desktop", subtopics: ["Container Inspection", "Volume Mounting", "Resource Allocation", "Port Mapping Debugging"] },
      { id: "top-linux-cli", name: "Linux CLI", slug: "linux-cli", subtopics: ["SSH Key Setup", "Grep, Find & Xargs", "Tmux & Screen", "Tar & Zip Archives"] },
      { id: "top-excel-sheets", name: "Excel & Google Sheets", slug: "excel-google-sheets", subtopics: ["Shortcut Navigation", "Collaboration Features", "Query Function", "Data Cleaning"] },
      { id: "top-notion-docs", name: "Notion & Documentation", slug: "notion-documentation", subtopics: ["Engineering RFCs", "Technical Architecture Wiki", "Runbooks & Incident Post-mortems", "API Spec Maintenance"] },
    ],
  },
  {
    id: "dom-aptitude",
    name: "Aptitude & Reasoning",
    slug: "aptitude-reasoning",
    icon: "BrainCircuit",
    color: "#f97316",
    description: "Mathematical problem-solving, cognitive reasoning, and campus placement evaluations.",
    topics: [
      { id: "top-quant-apt", name: "Quantitative Aptitude", slug: "quantitative-aptitude", subtopics: ["Percentages & Profit-Loss", "Time, Speed & Distance", "Time & Work", "Simple & Compound Interest", "Ratios & Proportions", "Averages & Mixtures"] },
      { id: "top-logical-reasoning", name: "Logical Reasoning", slug: "logical-reasoning", subtopics: ["Syllogisms", "Blood Relations", "Direction Sense", "Seating Arrangements (Linear & Circular)", "Series & Coding-Decoding"] },
      { id: "top-verbal-ability", name: "Verbal Ability", slug: "verbal-ability", subtopics: ["Reading Comprehension", "Sentence Correction", "Para Jumbles", "Vocabulary & Synonyms", "Idioms & Analogies"] },
      { id: "top-data-interp", name: "Data Interpretation", slug: "data-interpretation", subtopics: ["Bar Charts & Line Graphs", "Pie Charts", "Tables & Caselets", "Radar & Mixed Data"] },
      { id: "top-puzzles", name: "Puzzles", slug: "puzzles", subtopics: ["River Crossing Problems", "Weighing Balance Riddles", "Calendar & Clock Puzzles", "Truth-Tellers and Liars"] },
      { id: "top-prob-combinatorics", name: "Probability & Combinatorics", slug: "probability-combinatorics", subtopics: ["Permutations and Combinations", "Conditional Probability", "Bayes' Theorem Applications", "Expected Value Problems"] },
    ],
  },
  {
    id: "dom-hr-behavioral",
    name: "HR & Behavioral",
    slug: "hr-behavioral",
    icon: "Users",
    color: "#db2777",
    description: "Culture fit, leadership attributes, behavioral scenarios, and interview etiquette.",
    topics: [
      { id: "top-intro", name: "Tell Me About Yourself", slug: "tell-me-about-yourself", subtopics: ["Elevator Pitch Formula", "Connecting Past Projects to the Role", "Avoiding Resume Recitation", "Hooking Interviewer Interest"] },
      { id: "top-star-method", name: "STAR Method", slug: "star-method", subtopics: ["Structuring Situation & Task", "Highlighting Concrete Actions", "Quantifying Business Results", "Framing Collaborative Impact"] },
      { id: "top-strengths-weaknesses", name: "Strengths & Weaknesses", slug: "strengths-weaknesses", subtopics: ["Genuine Weaknesses with Improvement Plans", "Authentic Professional Strengths", "Handling Perfectionism Traps"] },
      { id: "top-conflict-teamwork", name: "Conflict & Teamwork", slug: "conflict-teamwork", subtopics: ["Disagreement with Tech Leads", "Cross-functional Collaboration", "Handling Difficult Coworkers", "Reaching Consensus"] },
      { id: "top-leadership", name: "Leadership", slug: "leadership", subtopics: ["Mentoring Junior Engineers", "Taking Initiative on Ambiguous Problems", "Technical Ownership", "Decisiveness Under Pressure"] },
      { id: "top-failure-learning", name: "Failure & Learning Stories", slug: "failure-learning-stories", subtopics: ["Production Outage Reflection", "Missed Deadlines & Post-mortems", "Demonstrating Humility & Resilience", "Constructive Feedback Adaptation"] },
      { id: "top-salary-negotiation", name: "Salary Negotiation", slug: "salary-negotiation", subtopics: ["Researching Market Compensation", "Counter-Offer Strategies", "Evaluating Equity vs Base Salary", "Professional Email Templates"] },
      { id: "top-why-company", name: "Why This Company", slug: "why-this-company", subtopics: ["Company Mission Alignment", "Product Features Analysis", "Tech Stack Enthusiasm", "Industry Challenges Perspective"] },
      { id: "top-communication-skills", name: "Communication Skills", slug: "communication-skills", subtopics: ["Active Listening", "Concise Technical Explanations", "Non-verbal Body Language on Video", "Asking Insightful Questions to the Interviewer"] },
      { id: "top-group-discussion", name: "Group Discussion", slug: "group-discussion", subtopics: ["Initiating & Concluding Discussions", "Adding Substantive Points Without Interruption", "Body Language & Temperament", "Summarizing Differing Viewpoints"] },
    ],
  },
  {
    id: "dom-emerging-tech",
    name: "Emerging Tech",
    slug: "emerging-tech",
    icon: "Zap",
    color: "#84cc16",
    description: "Cutting-edge innovations in decentralized systems, spatial computing, and quantum.",
    topics: [
      { id: "top-blockchain", name: "Blockchain & Web3", slug: "blockchain-web3", subtopics: ["Consensus (PoW vs PoS)", "Smart Contracts (Solidity)", "Ethereum & EVM", "DeFi Architecture", "Gas Optimization"] },
      { id: "top-iot", name: "IoT & Embedded Systems", slug: "iot-embedded-systems", subtopics: ["Microcontrollers (Arduino, ESP32, Raspberry Pi)", "MQTT & CoAP Protocols", "Sensor Interfacing", "Edge Computing & Low Power"] },
      { id: "top-game-dev", name: "Game Development", slug: "game-development", subtopics: ["Game Loop & Frame Updates", "Unity & C#", "Unreal Engine & C++", "Physics Engines & Collision Detection", "Shaders"] },
      { id: "top-ar-vr", name: "AR/VR", slug: "ar-vr", subtopics: ["Spatial Tracking & SLAM", "WebXR Standards", "Rendering Optimization for Headsets", "Interactive 3D User Interfaces"] },
      { id: "top-quantum", name: "Quantum Computing Basics", slug: "quantum-computing-basics", subtopics: ["Qubits & Superposition", "Quantum Entanglement", "Quantum Gates & Circuits", "Shor's and Grover's Algorithms Overview"] },
    ],
  },
  {
    id: "dom-product-biz",
    name: "Product & Business",
    slug: "product-business",
    icon: "Briefcase",
    color: "#f43f5e",
    description: "Product management fundamentals, agile processes, and strategic business reasoning.",
    topics: [
      { id: "top-pm", name: "Product Management", slug: "product-management", subtopics: ["Product Requirements Document (PRD)", "User Persona Definition", "Feature Prioritization (RICE, MoSCoW)", "Product Lifecycle Management"] },
      { id: "top-biz-analysis", name: "Business Analysis", slug: "business-analysis", subtopics: ["Requirements Elicitation", "Stakeholder Management", "SWOT & GAP Analysis", "Process Flow Diagrams (BPMN)"] },
      { id: "top-agile-scrum", name: "Agile & Scrum", slug: "agile-scrum", subtopics: ["Sprint Planning & Retrospectives", "Scrum Master vs Product Owner Roles", "Definition of Ready & Done", "Overcoming Blockers"] },
      { id: "top-case-studies", name: "Case Studies", slug: "case-studies", subtopics: ["Market Entry Framework", "Profitability Diagnostic", "Root Cause Analysis for Metric Drops", "Growth Strategy"] },
      { id: "top-estimation", name: "Estimation Questions", slug: "estimation-questions", subtopics: ["Fermi Problems", "Market Sizing (Top-down & Bottom-up)", "Revenue Projections", "Capacity Planning Estimates"] },
    ],
  },
];

// Helper: Normalize legacy names (e.g. "Java", "DSA", "Frontend", "MERN", "System Design", "DBMS")
export const LEGACY_DOMAIN_MAPPING: Record<string, { domainSlug: string; topicSlug?: string }> = {
  java: { domainSlug: "programming-languages", topicSlug: "java" },
  dsa: { domainSlug: "dsa" },
  frontend: { domainSlug: "frontend-development" },
  mern: { domainSlug: "full-stack", topicSlug: "mern-stack" },
  "full stack": { domainSlug: "full-stack" },
  "system design": { domainSlug: "system-design" },
  behavioral: { domainSlug: "hr-behavioral" },
  hr: { domainSlug: "hr-behavioral" },
  dbms: { domainSlug: "databases" },
  databases: { domainSlug: "databases" },
  os: { domainSlug: "cs-fundamentals", topicSlug: "operating-systems" },
  aptitude: { domainSlug: "aptitude-reasoning" },
  "ai/ml": { domainSlug: "ai-machine-learning" },
  "web dev": { domainSlug: "frontend-development" },
  oop: { domainSlug: "cs-fundamentals", topicSlug: "oop" },
  networks: { domainSlug: "cs-fundamentals", topicSlug: "computer-networks" },
};

/**
 * Returns all base domains
 */
export function getDomains(): Domain[] {
  return BASE_DOMAINS;
}

/**
 * Returns topics for a specific domain slug, or all topics across all domains if domainSlug is omitted or "ALL"
 */
export function getTopics(domainSlug?: string): Topic[] {
  if (!domainSlug || domainSlug === "ALL") {
    return BASE_DOMAINS.flatMap((d) => d.topics);
  }
  const clean = domainSlug.toLowerCase();
  const found = BASE_DOMAINS.find((d) => d.slug === clean || d.name.toLowerCase() === clean);
  if (found) return found.topics;

  // Check legacy mapping
  if (LEGACY_DOMAIN_MAPPING[clean]) {
    const mapped = LEGACY_DOMAIN_MAPPING[clean];
    const d = BASE_DOMAINS.find((dom) => dom.slug === mapped.domainSlug);
    return d ? d.topics : [];
  }

  return [];
}

/**
 * Returns subtopics for a given topic slug
 */
export function getSubtopics(topicSlug: string): string[] {
  const clean = topicSlug.toLowerCase();
  for (const d of BASE_DOMAINS) {
    const t = d.topics.find((top) => top.slug === clean || top.name.toLowerCase() === clean);
    if (t && t.subtopics) return t.subtopics;
  }
  return [];
}

/**
 * Finds the parent domain for a given topic slug or name
 */
export function findDomainByTopic(topicSlugOrName: string): Domain | undefined {
  const clean = topicSlugOrName.toLowerCase();
  return BASE_DOMAINS.find((d) =>
    d.topics.some((t) => t.slug === clean || t.name.toLowerCase() === clean)
  );
}

/**
 * Finds a topic by its slug or name across all domains
 */
export function findTopicBySlug(topicSlugOrName: string): Topic | undefined {
  const clean = topicSlugOrName.toLowerCase();
  for (const d of BASE_DOMAINS) {
    const t = d.topics.find((top) => top.slug === clean || top.name.toLowerCase() === clean);
    if (t) return t;
  }
  return undefined;
}

/**
 * Normalizes an old or variant domain name to a standard modern domain
 */
export function normalizeLegacyDomain(name: string): Domain | undefined {
  const clean = name.trim().toLowerCase();
  const direct = BASE_DOMAINS.find((d) => d.slug === clean || d.name.toLowerCase() === clean);
  if (direct) return direct;

  const mapped = LEGACY_DOMAIN_MAPPING[clean];
  if (mapped) {
    return BASE_DOMAINS.find((d) => d.slug === mapped.domainSlug);
  }
  return undefined;
}

export const DOMAINS = BASE_DOMAINS;
export const TAXONOMY_DOMAINS = BASE_DOMAINS;
