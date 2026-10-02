export interface PracticeTopic {
  id: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  questionsCount: number;
  completedCount: number;
  icon: string;
  tags: string[];
}

export interface PracticeQuestion {
  id: string;
  topicId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  keyPoints: string[];
  sampleAnswer?: string;
}

export const mockPracticeTopics: PracticeTopic[] = [
  {
    id: "mern-1",
    title: "MERN Architecture & Microservices",
    category: "Full Stack",
    difficulty: "Medium",
    description: "Deep dive into Express middleware, React render optimization, Node event loop & MongoDB indexing.",
    questionsCount: 15,
    completedCount: 9,
    icon: "Layers",
    tags: ["React", "Node.js", "Express", "MongoDB"],
  },
  {
    id: "java-1",
    title: "Java Core & Spring Boot Microservices",
    category: "Backend",
    difficulty: "Hard",
    description: "Multi-threading, JVM memory management, Spring Security JWT & JPA Hibernate performance tuning.",
    questionsCount: 20,
    completedCount: 12,
    icon: "Coffee",
    tags: ["Java", "Spring Boot", "JVM", "Hibernate"],
  },
  {
    id: "behavioral-1",
    title: "Behavioral & STAR Method",
    category: "HR & Behavioral",
    difficulty: "Easy",
    description: "Conflict resolution, leadership scenarios, product trade-offs, and project post-mortems.",
    questionsCount: 12,
    completedCount: 8,
    icon: "Users",
    tags: ["HR", "Leadership", "STAR", "Communication"],
  },
  {
    id: "dsa-1",
    title: "Data Structures & Algorithms",
    category: "Problem Solving",
    difficulty: "Hard",
    description: "Dynamic programming patterns, graph traversal algorithms, sliding window & heap applications.",
    questionsCount: 25,
    completedCount: 18,
    icon: "Code",
    tags: ["DP", "Graphs", "Trees", "Sorting"],
  },
  {
    id: "db-1",
    title: "Database Design & SQL Optimization",
    category: "Database",
    difficulty: "Medium",
    description: "ACID properties, index strategies, query execution plans, sharding and replication.",
    questionsCount: 14,
    completedCount: 5,
    icon: "Database",
    tags: ["SQL", "PostgreSQL", "MongoDB", "Sharding"],
  },
  {
    id: "cloud-1",
    title: "System Architecture & DevOps",
    category: "Infrastructure",
    difficulty: "Medium",
    description: "Docker containerization, Kubernetes pod routing, CI/CD pipelines, and AWS cloud basics.",
    questionsCount: 10,
    completedCount: 4,
    icon: "Cloud",
    tags: ["AWS", "Docker", "Kubernetes", "CI/CD"],
  },
];

export const mockPracticeQuestions: PracticeQuestion[] = [
  {
    id: "q-1",
    topicId: "mern-1",
    title: "Explain the Node.js Event Loop and Non-Blocking I/O",
    difficulty: "Medium",
    prompt: "How does Node.js handle concurrency despite being single-threaded? Detail the phases of the Event Loop (Timers, I/O callbacks, Poll, Check, Close).",
    keyPoints: [
      "Single-threaded event loop delegate operations to libuv pool",
      "Phases: Timers -> Pending Callbacks -> Idle/Prepare -> Poll -> Check -> Close Callbacks",
      "process.nextTick() and Microtask queue priority over Macrotask queue",
    ],
    sampleAnswer: "Node.js relies on an event-driven architecture powered by V8 and libuv. Operations like file read/write or network calls are offloaded to OS kernel asynchronous interfaces or libuv's thread pool...",
  },
  {
    id: "q-2",
    topicId: "java-1",
    title: "How does Spring Boot handle Dependency Injection and Bean Lifecycles?",
    difficulty: "Hard",
    prompt: "Walk through the ApplicationContext creation, `@Autowired` resolution, BeanPostProcessor execution, and scope management (Singleton vs Prototype).",
    keyPoints: [
      "Inversion of Control (IoC) Container manages object instantiation",
      "Bean Lifecycle: Instantiate -> Populate Properties -> Name/Factory Aware -> Pre-Initialization -> InitializingBean -> Post-Initialization",
      "Singleton scope is thread-shared; prototype generates new instances on request",
    ],
    sampleAnswer: "Spring Boot uses the IoC container to manage the lifecycle of Java objects known as Beans. When the application context starts, Spring scans `@Component`, `@Service`, and `@Repository` annotations...",
  },
];
