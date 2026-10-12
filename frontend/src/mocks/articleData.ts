export interface ArticleQAItem {
  id: string;
  question: string;
  answer: string;
  keyPoints?: string[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  domainSlug?: string;
  topic?: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  readTimeMinutes: number;
  publishedDate: string;
  status?: "PUBLISHED" | "DRAFT";
  tags: string[];
  viewsCount: number;
  likesCount: number;
  likedByUsers?: string[];
  viewedByUsers?: string[];
  featured?: boolean;
  interviewQA?: ArticleQAItem[];
}

export const mockArticles: Article[] = [
  {
    id: "art-1",
    title: "Sliding Window & Two Pointer Masterclass for FAANG Technical Rounds",
    slug: "sliding-window-two-pointer-masterclass",
    summary: "Systematic breakdown of fixed vs dynamic window patterns, frequency counters, and optimal $O(N)$ linear scans with common pitfalls.",
    category: "Data Structures & Algorithms",
    domainSlug: "dsa",
    topic: "Arrays, Pointers & Sliding Window",
    author: {
      name: "Ananya Sharma",
      role: "Staff Algorithms Engineer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 7,
    publishedDate: "2026-10-04",
    status: "PUBLISHED",
    tags: ["DSA", "Sliding Window", "Two Pointers", "Arrays", "FAANG"],
    viewsCount: 24,
    likesCount: 6,
    likedByUsers: ["usr-sample-1", "usr-sample-2"],
    viewedByUsers: ["usr-sample-1", "usr-sample-2", "usr-sample-3"],
    featured: true,
    content: `
# Mastering Sliding Window & Two Pointer Algorithms

Sliding Window is one of the most frequently tested algorithmic patterns in Tier-1 software engineering interviews. It converts brute-force $O(N^2)$ contiguous subarray searches into smooth $O(N)$ linear time solutions.

---

## 1. Fixed vs Dynamic Windows
- **Fixed Window**: The window size $K$ is invariant (e.g., maximum sum subarray of size $K$). Maintain a running sum by subtracting \`nums[left]\` and adding \`nums[right]\`.
- **Dynamic Window**: The window expands by advancing \`right\` until a constraint is violated, then contracts by advancing \`left\` until validity is restored (e.g., Longest Substring Without Repeating Characters).

\`\`\`typescript
// Dynamic Window Pattern in TypeScript
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0, maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (lastSeen.has(char) && lastSeen.get(char)! >= left) {
      left = lastSeen.get(char)! + 1;
    }
    lastSeen.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}
\`\`\`

## 2. Common Pitfalls to Avoid
1. **Off-by-one window lengths**: Remember window length is always \`right - left + 1\`, not \`right - left\`.
2. **Negative elements**: Sliding window requires monotonic properties. If numbers can be negative, use prefix sums with HashMaps instead.
    `,
    interviewQA: [
      {
        id: "qa-1-1",
        question: "How do you determine whether a problem requires Two Pointers or Sliding Window?",
        answer: "Two Pointers typically operate from both array ends moving inward (e.g., sorted Two Sum, Container With Most Water, Palindrome verification). Sliding Window operates on contiguous subarrays or substrings where both pointers move unidirectionally forward.",
        keyPoints: [
          "Inward converging pointers = Two Pointers (often sorted arrays)",
          "Forward expanding/shrinking pointers = Sliding Window (contiguous intervals)",
          "Monotonic property must hold for linear window guarantees"
        ]
      },
      {
        id: "qa-1-2",
        question: "What is the amortized time complexity when a while loop exists inside the for loop?",
        answer: "The amortized time complexity remains O(N). Although the inner while loop executes, each element is added to the window at most once by the right pointer and removed at most once by the left pointer, resulting in at most 2N total pointer operations.",
        keyPoints: [
          "Each element visited at most twice across entire loop",
          "Amortized cost per element is O(1)",
          "Overall time complexity is strictly linear O(N)"
        ]
      },
      {
        id: "qa-1-3",
        question: "Can Sliding Window find the maximum subarray sum if the array contains negative numbers?",
        answer: "No. Sliding window relies on the property that expanding the window monotonically increases or maintains predictable constraint metrics. With negative numbers, expanding might decrease the sum. For negative numbers, Kadane's Algorithm or Prefix Sum with HashMaps (O(N)) must be used.",
        keyPoints: [
          "Negative values break monotonicity assumptions",
          "Use Kadane's Algorithm for max contiguous subarray",
          "Use Prefix Sum + HashMap for target subarray sum with negatives"
        ]
      },
      {
        id: "qa-1-4",
        question: "How do you optimize auxiliary space when tracking character frequencies?",
        answer: "If the input alphabet is constrained to ASCII or English lowercase letters, replace a generic HashMap with a fixed-size integer array of length 26 or 128 (e.g., int[] freq = new int[128]). This reduces lookup overhead to O(1) cache-friendly memory.",
        keyPoints: [
          "Fixed size array eliminates HashMap collision and hashing overhead",
          "Space complexity becomes O(1) auxiliary",
          "Direct indexing via char - 'a' provides fastest runtime"
        ]
      }
    ]
  },
  {
    id: "art-2",
    title: "System Design 101: Designing a Scalable URL Shortener (TinyURL)",
    slug: "system-design-tinyurl-architectural-guide",
    summary: "Step-by-step breakdown of functional requirements, 500M URLs/month capacity math, Base62 encoding, Key Generation Service, and Redis caching.",
    category: "Backend & Systems",
    domainSlug: "backend",
    topic: "System Design & Distributed Storage",
    author: {
      name: "Kanhaiya Pandey",
      role: "Lead Systems Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 12,
    publishedDate: "2026-10-02",
    status: "PUBLISHED",
    tags: ["System Design", "Distributed Systems", "Redis", "Base62", "TinyURL"],
    viewsCount: 31,
    likesCount: 8,
    likedByUsers: ["usr-sample-1"],
    viewedByUsers: ["usr-sample-1", "usr-sample-4"],
    featured: true,
    content: `
# Designing TinyURL: High-Throughput System Design Walkthrough

URL shorteners are among the most classic system design questions for mid and senior engineering interviews.

---

## 1. Requirements & Scope
- **Functional**: Convert long URLs into 7-character short codes. Redirect short codes to target URLs in under 50ms.
- **Non-Functional**: 99.99% availability, fault tolerance, read-heavy traffic (10:1 read-to-write ratio).

## 2. Capacity Estimation
- 500 Million new URLs created per month:
  $$\\text{Writes/sec} = \\frac{500 \\times 10^6}{30 \\times 86400} \\approx 193 \\text{ writes/sec}$$
  $$\\text{Reads/sec} = 193 \\times 10 \\approx 1930 \\text{ reads/sec}$$
- **Storage for 5 years**:
  $$500\\text{M} \\times 12 \\times 5 = 30 \\text{ Billion URLs}$$
  Assuming 500 bytes per record: $30\\text{B} \\times 500\\text{B} \\approx 15 \\text{ Terabytes}$.

## 3. High-Level Architecture
1. **API Gateway / Load Balancer**: NGINX / Cloudflare for rate limiting and TLS termination.
2. **Application Servers**: Stateless Node.js / Go / Spring Boot microservices.
3. **Key Generation Service (KGS)**: Pre-computes random 7-character Base62 keys in a standalone database to eliminate hashing collision loops.
4. **Cache Layer**: Redis cluster storing hot 20% URLs (80/20 Pareto principle).
5. **Database**: Cassandra or DynamoDB distributed NoSQL store partitioned by short key hash.
    `,
    interviewQA: [
      {
        id: "qa-2-1",
        question: "Why is Base62 encoding chosen over Base64 or standard MD5/SHA256?",
        answer: "Base62 uses [a-z, A-Z, 0-9] which are URL-safe characters that do not require URL escaping. Base64 includes '+' and '/' which can break URL route parsers or query parameters. With 7 Base62 characters, 62^7 = ~3.52 Trillion unique URLs can be generated.",
        keyPoints: [
          "Base62 contains only alphanumeric characters (no URL escaping needed)",
          "62^7 provides ~3.5 Trillion unique identifiers",
          "Clean, memorable short URLs without reserved symbol collisions"
        ]
      },
      {
        id: "qa-2-2",
        question: "How does a Key Generation Service (KGS) prevent race conditions without table locks?",
        answer: "The KGS pre-generates unique 62^7 keys in advance and stores them in two tables: 'unused_keys' and 'used_keys'. When an app server starts up, it loads a batch of 1,000 unused keys into memory. If an app server crashes, unused keys are simply discarded, preventing blocking and lock contention.",
        keyPoints: [
          "Pre-generated keys eliminate collision detection on write path",
          "App servers fetch batch allocations into local memory",
          "Zero locks required on the user-facing write path"
        ]
      },
      {
        id: "qa-2-3",
        question: "What is the difference between returning HTTP 301 Permanent vs HTTP 302/307 Temporary redirects?",
        answer: "HTTP 301 causes client browsers to cache the destination URL indefinitely, bypassing the URL shortener on subsequent clicks, which drastically reduces analytics accuracy. HTTP 302 or 307 forces every click to hit the server first, enabling click counting, geographic telemetry, and fraud detection.",
        keyPoints: [
          "301 Permanent Redirect: Browser caches, lower server load, NO analytics",
          "302/307 Temporary Redirect: Every visit hits server, accurate analytics tracking",
          "For enterprise analytics platforms, 302/307 is mandatory"
        ]
      },
      {
        id: "qa-2-4",
        question: "How would you handle Cache Stampede if an ultra-viral link expires from Redis?",
        answer: "Use Mutex / Distributed Locking (e.g. Redlock) so only the first request queries the primary database and repopulates the Redis cache while other requests wait, or implement Probabilistic Early Expiration (XFetch algorithm) to refresh the cache in the background before expiry.",
        keyPoints: [
          "Distributed lock on cache miss prevents DB overwhelming",
          "Background refresh before TTL expires (probabilistic early expiration)",
          "Stale-while-revalidate caching header pattern"
        ]
      }
    ]
  },
  {
    id: "art-3",
    title: "Top React 19 Architecture, Server Actions & Compiler Patterns",
    slug: "top-react-19-interview-questions-2026",
    summary: "From the new React Compiler automatic memoization to Server Actions, the use() hook, and optimizing Core Web Vitals (INP/LCP).",
    category: "Frontend Engineering",
    domainSlug: "frontend",
    topic: "React 19 & Next.js",
    author: {
      name: "Rohan Verma",
      role: "Senior Frontend Lead",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 8,
    publishedDate: "2026-10-01",
    status: "PUBLISHED",
    tags: ["React", "JavaScript", "Frontend", "Next.js", "React 19"],
    viewsCount: 19,
    likesCount: 5,
    likedByUsers: [],
    viewedByUsers: ["usr-sample-2"],
    featured: false,
    content: `
# React 19 Architecture in Enterprise Interviews

React 19 revolutionizes frontend architecture by transforming how memoization, data fetching, and forms are managed.

---

## 1. Automatic Memoization with React Compiler
Historically, candidates had to meticulously tune \`useMemo\`, \`useCallback\`, and \`React.memo\` to prevent excessive re-renders. The React 19 Compiler transforms code at compile time, memoizing values and components automatically based on dependency change analysis.

## 2. Server Actions & Form Status
React 19 introduces native support for Async Transitions via \`useActionState\`, \`useFormStatus\`, and \`useOptimistic\`. Forms can now trigger asynchronous server mutations directly without boilerplate dispatchers.

\`\`\`tsx
import { useOptimistic } from "react";

function CommentList({ comments, onAddComment }: Props) {
  const [optimisticComments, setOptimistic] = useOptimistic(
    comments,
    (state, newComment: string) => [...state, { text: newComment, pending: true }]
  );

  async function formAction(formData: FormData) {
    const text = formData.get("comment") as string;
    setOptimistic(text);
    await onAddComment(text);
  }

  return (
    <form action={formAction}>
      <input name="comment" required />
      <button type="submit">Post Comment</button>
    </form>
  );
}
\`\`\`
    `,
    interviewQA: [
      {
        id: "qa-3-1",
        question: "How does the React 19 Compiler eliminate the need for manual useMemo and useCallback?",
        answer: "The React Compiler parses JavaScript AST and computes precise dependency graphs at build time. It inserts fine-grained memoization directly into the compiled output whenever inputs remain referentially stable, preventing unnecessary downstream virtual DOM re-evaluations without manual code annotations.",
        keyPoints: [
          "Compile-time memoization eliminates human dependency array errors",
          "Fine-grained caching of component render outputs and props",
          "useMemo and useCallback become legacy optimization techniques"
        ]
      },
      {
        id: "qa-3-2",
        question: "What is the difference between React Server Components (RSC) and Client Components?",
        answer: "RSC execute exclusively on the server during the build or request time, shipping zero JavaScript bundle size to the browser. Client Components (marked with 'use client') execute on the server for SSR and hydrate on the browser, having full access to state, effects, and DOM event listeners.",
        keyPoints: [
          "RSC have 0 KB client bundle cost and direct database access",
          "Client components enable interactivity, useState, and browser APIs",
          "Props passed from RSC to Client Components must be serializable"
        ]
      },
      {
        id: "qa-3-3",
        question: "How does the useOptimistic hook provide seamless perceived performance?",
        answer: "useOptimistic allows the UI to render the expected successful state instantly before the asynchronous network request completes. If the server request succeeds, the real data replaces it; if it fails, React automatically rolls back the optimistic state.",
        keyPoints: [
          "Zero-latency visual feedback for user interactions",
          "Automatic state rollback if asynchronous action rejects",
          "Built-in synchronization with React transitions"
        ]
      },
      {
        id: "qa-3-4",
        question: "What is Interaction to Next Paint (INP) and how do you optimize it in React?",
        answer: "INP measures the longest user interaction latency (click, tap, keypress) across the entire session until the next frame renders. Optimize INP by yielding main thread execution via useTransition, debouncing input state, and breaking long tasks into smaller microtasks.",
        keyPoints: [
          "INP replaced First Input Delay (FID) as a core Web Vital",
          "useTransition defers non-urgent rendering to keep input responsive",
          "Avoid expensive computations synchronously inside event handlers"
        ]
      }
    ]
  },
  {
    id: "art-4",
    title: "Spring Boot Microservices: Distributed Transactions via Saga Pattern",
    slug: "spring-boot-microservices-saga-pattern",
    summary: "Complete guide on Orchestration vs Choreography, compensating rollback transactions, and the Transactional Outbox pattern with Kafka.",
    category: "Backend & Systems",
    domainSlug: "backend",
    topic: "Microservices & Distributed Systems",
    author: {
      name: "Vikram Malhotra",
      role: "Principal Backend Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 9,
    publishedDate: "2026-09-29",
    status: "PUBLISHED",
    tags: ["Java", "Spring Boot", "Microservices", "Kafka", "Saga Pattern"],
    viewsCount: 16,
    likesCount: 4,
    likedByUsers: [],
    viewedByUsers: ["usr-sample-1"],
    featured: false,
    content: `
# Managing Distributed Transactions in Microservices

In distributed microservices architectures, relational ACID transactions cannot span multiple independent service databases without introducing severe latency and blocking risks.

---

## 1. Why Two-Phase Commit (2PC) Fails in Cloud Systems
Two-Phase Commit requires all distributed databases to hold locks during the prepare and commit phases. In high-traffic cloud environments, network partitions or a slow node freeze the entire system, violating availability (CAP theorem).

## 2. The Saga Solution
A Saga is a sequence of local transactions where each local transaction updates the database and publishes an event. If a step fails, the Saga executes **compensating transactions** to reverse previously applied changes.

### Orchestration vs Choreography
- **Choreography**: Each service listens to events and decides when to act. Best for simple 2-3 step workflows.
- **Orchestration**: A centralized coordinator (e.g., Temporal or custom Spring state machine) commands each service explicitly. Highly recommended for complex order/payment/fulfillment flows.
    `,
    interviewQA: [
      {
        id: "qa-4-1",
        question: "What is a compensating transaction and how does it differ from a database rollback?",
        answer: "A database rollback undoes uncommitted changes using transaction redo/undo logs. In a Saga, previous steps were already committed to independent databases. A compensating transaction is a new forward transaction that semantically offsets the previous action (e.g., refunding a charged credit card or releasing reserved stock).",
        keyPoints: [
          "Compensating actions are explicit semantic reversals",
          "Previous local transactions are already permanently committed",
          "Must be designed to be idempotent and retryable"
        ]
      },
      {
        id: "qa-4-2",
        question: "Explain the Transactional Outbox Pattern and why dual-writing is dangerous.",
        answer: "Dual-writing (e.g. updating a DB table and publishing to Kafka in the same method) is susceptible to partial failure: the DB update succeeds but the network fails before Kafka publishes. The Outbox Pattern writes both the business entity and the outgoing event into the same database atomically in one transaction, and an external process (CDC like Debezium or polling poller) safely streams the events.",
        keyPoints: [
          "Prevents event loss during message broker network partitions",
          "Guarantees at-least-once message delivery to downstream consumers",
          "CDC (Change Data Capture) tailing database transaction logs is optimal"
        ]
      },
      {
        id: "qa-4-3",
        question: "How do you achieve idempotency in distributed event consumers?",
        answer: "Consumers should store processed event IDs in an idempotent table (e.g. processed_events) within the consumer's local database transaction. If the consumer receives a duplicated message due to network retries, it checks the table and skips execution without re-applying the mutation.",
        keyPoints: [
          "Unique event ID checked before applying state change",
          "Database unique constraint on event_id provides race protection",
          "Essential for at-least-once delivery guarantees"
        ]
      },
      {
        id: "qa-4-4",
        question: "When should you choose Saga Orchestration over Choreography?",
        answer: "Choose Orchestration when the workflow spans 4 or more microservices, requires strict auditing and step visibility, or involves cyclical dependencies. Choreography becomes difficult to trace and debug as services become tightly coupled through complex event loops.",
        keyPoints: [
          "Orchestration centralizes business workflow logic in one place",
          "Clear audit trail of which step failed and which compensation triggered",
          "Choreography is only recommended for lightweight 2-service workflows"
        ]
      }
    ]
  },
  {
    id: "art-5",
    title: "Production RAG Architectures: Chunking, Vector Search & Re-ranking",
    slug: "production-rag-architectures-vector-search",
    summary: "Comprehensive guide to building production Retrieval-Augmented Generation: semantic chunking, HNSW vector search, hybrid retrieval, and cross-encoders.",
    category: "Generative AI & LLM",
    domainSlug: "genai-llm",
    topic: "RAG & Vector Databases",
    author: {
      name: "Dr. Elena Rostova",
      role: "Lead AI Research Scientist",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 11,
    publishedDate: "2026-09-27",
    status: "PUBLISHED",
    tags: ["GenAI", "LLM", "RAG", "Vector Search", "Embeddings"],
    viewsCount: 22,
    likesCount: 7,
    likedByUsers: ["usr-sample-1"],
    viewedByUsers: ["usr-sample-1", "usr-sample-3"],
    featured: true,
    content: `
# Building Enterprise-Grade Retrieval-Augmented Generation (RAG)

Naive RAG (chunk document -> embed with OpenAI -> cosine similarity search in Pinecone/Milvus -> dump into prompt) fails frequently in production due to precision loss and context hallucination.

---

## 1. Advanced Chunking Strategies
- **Fixed Size with Overlap**: Standard baseline (e.g. 512 tokens with 50 token overlap). Can split critical tables or code syntax across chunks.
- **Semantic Chunking**: Computes cosine distances between consecutive sentence embeddings and places split points where thematic distance spikes.
- **Hierarchical Parent-Document Retrieval**: Search over small 128-token sentence chunks for pinpoint vector matching, but inject the full 1024-token parent document into the LLM context.

## 2. Hybrid Search (Dense + Sparse)
Dense embeddings capture broad semantic intent but often fail on exact keyword lookups like part numbers, error codes, or function names. Combine Dense Vector Search (HNSW) with Sparse Keyword Search (BM25) using **Reciprocal Rank Fusion (RRF)**.
    `,
    interviewQA: [
      {
        id: "qa-5-1",
        question: "Why does Naive RAG fail and how does Hybrid Search solve it?",
        answer: "Naive vector search (dense embeddings) understands broad conceptual similarities but often fails on exact keyword matching (e.g. error codes like 'ERR_403_AUTH' or part IDs). Hybrid search combines dense semantic vectors with BM25 sparse keyword indices, merging top results via Reciprocal Rank Fusion (RRF).",
        keyPoints: [
          "Dense vectors excel at semantic meaning and synonymous queries",
          "BM25 sparse vectors excel at exact keywords and unique identifiers",
          "RRF (Reciprocal Rank Fusion) normalizes disparate score scales"
        ]
      },
      {
        id: "qa-5-2",
        question: "What is the difference between a Bi-Encoder and a Cross-Encoder?",
        answer: "Bi-Encoders embed query and document independently into vectors for fast vector index searches (O(1) retrieval). Cross-Encoders pass both query and document together into the transformer attention mechanism simultaneously, computing rich cross-attention scores. Cross-encoders are too slow for millions of docs but ideal as re-rankers on the top 20 candidates.",
        keyPoints: [
          "Bi-Encoder: Fast, pre-computable embeddings, lower accuracy",
          "Cross-Encoder: High accuracy full cross-attention, computationally expensive",
          "Standard pattern: Bi-Encoder retrieves top 50 -> Cross-Encoder re-ranks to top 5"
        ]
      },
      {
        id: "qa-5-3",
        question: "How do you evaluate RAG pipelines in production without human labeled test sets?",
        answer: "Use automated LLM-as-a-Judge frameworks such as Ragas or TruLens, evaluating along three core dimensions: 1. Faithfulness (is the answer grounded strictly in retrieved context?), 2. Answer Relevance (does it address the user prompt?), and 3. Context Recall (did retrieval capture all necessary facts?).",
        keyPoints: [
          "Faithfulness detects model hallucinations",
          "Answer Relevance measures prompt alignment",
          "Context Precision/Recall audits retrieval quality"
        ]
      },
      {
        id: "qa-5-4",
        question: "What is the 'Lost in the Middle' phenomenon in LLM context windows?",
        answer: "Research demonstrates that transformer models attend much more strongly to facts positioned at the very beginning and very end of their input context window. Information placed in the middle of long prompts suffers significant degradation in recall. Place the most relevant retrieved chunks at the start and end of the prompt.",
        keyPoints: [
          "U-shaped attention curve in long context windows",
          "Sort re-ranked chunks so top scoring context sits at top and bottom",
          "Minimize extraneous token noise in system prompts"
        ]
      }
    ]
  },
  {
    id: "art-6",
    title: "Zero-Downtime Deployments with Docker, Kubernetes & Canary Releases",
    slug: "zero-downtime-deployments-docker-kubernetes",
    summary: "Mastering Rolling Updates, Blue-Green environments, Readiness probes, and traffic routing with Istio and Argo Rollouts.",
    category: "DevOps & Cloud Infrastructure",
    domainSlug: "devops-cloud",
    topic: "Docker & Kubernetes",
    author: {
      name: "Sameer Joshi",
      role: "Staff Site Reliability Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 9,
    publishedDate: "2026-09-24",
    status: "PUBLISHED",
    tags: ["DevOps", "Kubernetes", "Docker", "CI/CD", "SRE"],
    viewsCount: 14,
    likesCount: 3,
    likedByUsers: [],
    viewedByUsers: ["usr-sample-4"],
    featured: false,
    content: `
# Zero-Downtime Deployment Strategies in Kubernetes

High-availability web applications must deploy multiple times per day without dropping in-flight user connections or returning HTTP 502/503 errors.

---

## 1. Rolling Updates vs Blue-Green vs Canary
- **Rolling Update**: Replaces pods one by one. Low resource footprint, but old and new versions run concurrently, requiring strict database backward compatibility.
- **Blue-Green**: Two identical environments. Switch 100% traffic at the router level. Instant rollback, but requires 2x cluster hardware capacity.
- **Canary**: Shift 5% of real traffic to the new version. Monitor telemetry (error rate, latency) before graduating to 100%.

## 2. The Lifeline: Liveness vs Readiness Probes
- \`readinessProbe\`: Tells the Service load balancer when the pod is warmed up and ready to accept traffic.
- \`livenessProbe\`: Tells Kubelet if the application has deadlocked and needs a container restart.
    `,
    interviewQA: [
      {
        id: "qa-6-1",
        question: "What happens if a pod only defines a liveness probe without a readiness probe?",
        answer: "Kubernetes assumes the pod is ready to receive traffic the instant the container process boots up. If the application takes 15 seconds to connect to the database and initialize caches, all incoming user traffic routed to the pod during those 15 seconds will fail with connection refused or HTTP 502 errors.",
        keyPoints: [
          "Liveness probe restarts broken containers; it does not gate traffic",
          "Readiness probe keeps the pod out of the Service endpoints until healthy",
          "Both probes must be configured with appropriate initialDelaySeconds"
        ]
      },
      {
        id: "qa-6-2",
        question: "How do you handle database schema migrations during zero-downtime rolling updates?",
        answer: "Follow the Expand/Contract (Parallel Run) pattern. In phase 1 (Expand), deploy non-breaking DB changes (e.g. add new nullable column). In phase 2, deploy code writing to both columns. In phase 3, backfill historical data. In phase 4 (Contract), remove old column once all old pods are terminated.",
        keyPoints: [
          "Never rename or delete active columns in a single release",
          "Database changes must be backward compatible with previous pod versions",
          "Expand and Contract pattern enables seamless continuous delivery"
        ]
      },
      {
        id: "qa-6-3",
        question: "What is a Pod Disruption Budget (PDB) and why is it essential?",
        answer: "A PDB limits the number of replicated pods that can be down simultaneously during voluntary disruptions (such as node upgrades, cluster autoscaling, or draining). Setting 'minAvailable: 80%' ensures cluster maintenance never takes down all service replicas.",
        keyPoints: [
          "Prevents outages during node drains and cluster autoscaling events",
          "Configures minimum available replicas or maximum allowed down replicas",
          "Essential for meeting 99.99% SLA availability targets"
        ]
      },
      {
        id: "qa-6-4",
        question: "How does graceful shutdown work in Kubernetes with preStop hooks?",
        answer: "When a pod is terminated, Kubernetes sends SIGTERM, but network routing rules take a few hundred milliseconds to remove the pod from endpoint tables. A preStop hook with 'sleep 5' ensures the container keeps listening while the load balancer deregisters it, preventing dropped requests.",
        keyPoints: [
          "preStop hook delays SIGTERM until endpoints deregister",
          "Application drains in-flight HTTP connections cleanly",
          "terminationGracePeriodSeconds must accommodate slow transactions"
        ]
      }
    ]
  },
  {
    id: "art-7",
    title: "Campus Aptitude Speed Math: Fast Calculations, Percentages & Profit-Loss",
    slug: "campus-aptitude-speed-math-shortcuts",
    summary: "Vedic math shortcuts, fractional conversion tables, alligation mixtures, and work-time efficiency formulas for campus placement tests.",
    category: "Placement Aptitude",
    domainSlug: "placement-aptitude",
    topic: "Quantitative Speed Math",
    author: {
      name: "Pooja Chawla",
      role: "Head of Quantitative Training",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 8,
    publishedDate: "2026-09-22",
    status: "PUBLISHED",
    tags: ["Aptitude", "Quantitative", "Speed Math", "Placement Rounds", "TCS/Infosys"],
    viewsCount: 28,
    likesCount: 9,
    likedByUsers: ["usr-sample-2"],
    viewedByUsers: ["usr-sample-1", "usr-sample-2", "usr-sample-4"],
    featured: false,
    content: `
# Cracking Campus Placement Quantitative Rounds in Record Time

Written rounds from companies like TCS, Infosys, Wipro, and Accenture reject over 65% of applicants. The differentiator is calculation speed.

---

## 1. Percentage-to-Fraction Memorization Matrix
- $1/6 = 16.66\\%$
- $1/7 = 14.28\\%$
- $1/8 = 12.5\\%$
- $1/9 = 11.11\\%$
- $1/12 = 8.33\\%$
- $1/16 = 6.25\\%$

Instead of calculating $37.5\\%$ of $480$, immediately convert $37.5\\% = 3 \\times 12.5\\% = 3/8$.
$$\\frac{3}{8} \\times 480 = 3 \\times 60 = 180$$

## 2. Alligation & Mixtures Shortcut
Whenever two ingredients at different prices/percentages are mixed to form a middle price, the ratio is:
$$\\frac{\\text{Quantity of Cheaper}}{\\text{Quantity of Dearer}} = \\frac{\\text{Dearer Price} - \\text{Mean Price}}{\\text{Mean Price} - \\text{Cheaper Price}}$$
    `,
    interviewQA: [
      {
        id: "qa-7-1",
        question: "How do you calculate compound interest for 2 years without using the traditional long formula?",
        answer: "Use the effective percentage rate formula: Effective Rate = 2r + (r^2 / 100). For example, at 8% per annum for 2 years, Effective Rate = 2(8) + (64/100) = 16.64%. Simply compute 16.64% of the Principal directly in one step.",
        keyPoints: [
          "Effective rate: 2r + (r^2 / 100) for 2-year compounding",
          "Eliminates bracket exponents and fractions",
          "Calculates difference between CI and SI as exactly P * (r/100)^2"
        ]
      },
      {
        id: "qa-7-2",
        question: "If A is 40% more efficient than B, and B takes 28 days alone, how fast do they finish together?",
        answer: "Let B's daily work = 100 units. Then A's daily work = 140 units. Total work = 28 days * 100 = 2800 units. Combined daily rate = 140 + 100 = 240 units/day. Days required together = 2800 / 240 = 280 / 24 = 35 / 3 = 11.67 days.",
        keyPoints: [
          "Assign standard unit values (100 units) to efficiency baselines",
          "Total Work = Efficiency * Days",
          "Combined days = Total Work / (Efficiency A + Efficiency B)"
        ]
      },
      {
        id: "qa-7-3",
        question: "How does the net percentage change formula work when successive increases and decreases occur?",
        answer: "The net change formula is A + B + (AB / 100). If the price of an item increases by 20% and sales decrease by 10%, Net Change = 20 - 10 + (20 * -10 / 100) = 10 - 2 = +8% increase in revenue.",
        keyPoints: [
          "Net change = A + B + (AB / 100)",
          "Maintain proper sign (+ for increase, - for decrease)",
          "Applies directly to 2D geometric dimensions (length & breadth)"
        ]
      },
      {
        id: "qa-7-4",
        question: "What is the shortcut for finding the remainder when 2^50 is divided by 7?",
        answer: "Find the cycle of powers of 2 modulo 7: 2^1 = 2, 2^2 = 4, 2^3 = 8 = 1 (mod 7). The cycle length is 3. Divide the exponent 50 by 3: 50 = 3 * 16 + 2 (remainder 2). Therefore, 2^50 mod 7 = 2^2 mod 7 = 4.",
        keyPoints: [
          "Modular cyclicity pattern repeats periodically",
          "Identify when power reaches 1 mod N (Euler / Fermat theorem)",
          "Evaluate remainder of the exponent relative to cycle period"
        ]
      }
    ]
  },
  {
    id: "art-8",
    title: "Mastering 'Tell Me About a Time You Failed' with the STAR Method",
    slug: "star-method-behavioral-failure-question",
    summary: "The definitive guide to framing technical setbacks, resolving architectural trade-offs, and demonstrating rapid accountability in leadership interviews.",
    category: "HR & Behavioral",
    domainSlug: "placement-aptitude",
    topic: "HR & Behavioral Rounds",
    author: {
      name: "Ananya Sharma",
      role: "Ex-Google Staff Recruiter",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 6,
    publishedDate: "2026-09-18",
    status: "PUBLISHED",
    tags: ["Behavioral", "HR", "STAR Method", "Interview Skills"],
    viewsCount: 35,
    likesCount: 11,
    likedByUsers: ["usr-sample-1", "usr-sample-3"],
    viewedByUsers: ["usr-sample-1", "usr-sample-2", "usr-sample-3", "usr-sample-4"],
    featured: true,
    content: `
# Mastering Behavioral Questions: The STAR Framework

Behavioral interview questions are designed to uncover how you react under pressure, resolve conflict, and learn from past project setbacks.

---

## The STAR Blueprint
- **Situation**: Set the scene and give necessary context (15% of response time).
- **Task**: Describe your responsibility in the scenario (10% of response time).
- **Action**: Explain exactly what steps *you* took to address the issue (55% of response time).
- **Result**: Share the outcomes, quantified with data where possible (20% of response time).

### What Interviewers Look For
1. **Extreme Ownership**: Never blame teammates, managers, or external libraries.
2. **Speed of Pivot**: How quickly did you detect the problem and mitigate customer impact?
3. **Institutional Learning**: What automated tests, monitoring alerts, or architecture changes did you put in place to ensure this failure never happens again?
    `,
    interviewQA: [
      {
        id: "qa-8-1",
        question: "What are the fatal mistakes candidates make when answering the failure question?",
        answer: "The three fatal mistakes are: 1. Saying 'I have never really failed' (shows lack of self-awareness or experience), 2. Using a humble-brag disguise like 'I worked too hard' (disingenuous), and 3. Blaming team members or external dependencies instead of taking personal ownership.",
        keyPoints: [
          "Claiming zero failures is an immediate red flag for interviewers",
          "Never use humble-brag clichés",
          "Always take unambiguous personal accountability"
        ]
      },
      {
        id: "qa-8-2",
        question: "How do you select a safe failure scenario that does not disqualify your technical abilities?",
        answer: "Choose an authentic past project failure where the root cause was an estimation error, premature optimization, or missing integration test—NOT fundamental negligence or ethics. Ensure the outcome highlights a concrete system improvement you personally designed.",
        keyPoints: [
          "Select early-career or capstone project trade-off mistakes",
          "Ensure root cause is an engineering trade-off, not negligence",
          "Focus 70% of the narrative on the remediation and permanent safeguards"
        ]
      },
      {
        id: "qa-8-3",
        question: "How should you structure your response if asked: 'Tell me about a disagreement with a team lead'?",
        answer: "Focus on the technical disagreement and data-driven resolution. Explain the conflicting viewpoints objectively, how you collected benchmark data or ran a proof-of-concept to test hypotheses, and how you aligned collaboratively with the team's final decision under 'Disagree and Commit'.",
        keyPoints: [
          "Never make disagreement personal; focus on architecture and data",
          "Demonstrate prototyping or A/B testing to resolve ambiguity",
          "Highlight 'Disagree and Commit' to preserve team velocity"
        ]
      },
      {
        id: "qa-8-4",
        question: "Why do top tech companies prioritize behavioral rounds alongside DSA?",
        answer: "Senior engineering output is determined by team leverage, communication clarity, and resilience. A brilliant coder who creates friction, refuses code reviews, or conceals production bugs degrades the entire team's productivity.",
        keyPoints: [
          "High performers multiply team effectiveness through constructive collaboration",
          "Psychological safety and blameless post-mortems protect system stability",
          "Behavioral performance is an equal bar-raiser in hiring committee reviews"
        ]
      }
    ]
  }
];
