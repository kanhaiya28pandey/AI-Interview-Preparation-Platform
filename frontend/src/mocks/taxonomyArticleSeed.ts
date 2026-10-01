import { Article } from "./articleData";

export interface SeedArticle extends Article {
  domainSlug: string;
  source: "local-seed";
}

export const SEED_ARTICLES: SeedArticle[] = [
  // 1. Data Structures & Algorithms
  {
    id: "art-seed-dsa-sliding-window",
    title: "The Comprehensive Sliding Window Invariant Blueprint",
    slug: "sliding-window-algorithmic-invariant-blueprint",
    summary: "Master dynamic and fixed sliding window patterns with template code, shrink condition analysis, and common edge cases.",
    category: "Coding Advice",
    domainSlug: "dsa",
    author: {
      name: "Devendra Patel",
      role: "Principal Algorithms Instructor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 7,
    publishedDate: "2026-09-24",
    tags: ["DSA", "TwoPointers", "SlidingWindow", "Algorithms"],
    viewsCount: 1850,
    likesCount: 420,
    featured: true,
    source: "local-seed",
    content: `# The Comprehensive Sliding Window Invariant Blueprint

The Sliding Window technique transforms brute-force $O(N^2)$ contiguous subarray algorithms into linear $O(N)$ solutions by maintaining state across incremental window slides.

## 1. Fixed Window Pattern
When the problem constraint specifies an exact window length $K$:
\`\`\`ts
function fixedSlidingWindow(arr: number[], k: number): number {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;

  for (let right = k; right < arr.length; right++) {
    windowSum += arr[right] - arr[right - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
\`\`\`

## 2. Dynamic Shrinkable Window Pattern
When finding the minimum or maximum subarray satisfying a dynamic constraint:
\`\`\`ts
function dynamicSlidingWindow(arr: number[], targetSum: number): number {
  let left = 0;
  let currentSum = 0;
  let minLen = Infinity;

  for (let right = 0; right < arr.length; right++) {
    currentSum += arr[right];
    while (currentSum >= targetSum) {
      minLen = Math.min(minLen, right - left + 1);
      currentSum -= arr[left++];
    }
  }
  return minLen === Infinity ? 0 : minLen;
}
\`\`\`

## Key Takeaway
Always formulate your window invariant explicitly: What does \`arr[left...right]\` represent, and under what exact condition must \`left\` advance?
`,
  },

  // 2. System Design
  {
    id: "art-seed-sd-distributed-cache",
    title: "Designing Distributed Caches at Scale: Invalidation & Stampedes",
    slug: "distributed-caching-architecture-stampede-mitigation",
    summary: "Architecting multi-tier Redis and Memcached layers, mitigating cache stampedes with probabilistic early expiration, and replication topologies.",
    category: "System Design",
    domainSlug: "system-design",
    author: {
      name: "Vikram Sengupta",
      role: "Staff Infrastructure Architect",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 9,
    publishedDate: "2026-09-26",
    tags: ["SystemDesign", "Redis", "DistributedSystems", "Caching"],
    viewsCount: 2210,
    likesCount: 512,
    featured: true,
    source: "local-seed",
    content: `# Designing Distributed Caches at Scale

Caching is the primary lever for sub-millisecond read latency and protecting downstream relational databases from saturation.

## Caching Topologies
- **Cache-Aside (Lazy Loading)**: The application checks cache first. On miss, it queries the database and populates the cache.
- **Write-Through**: The application writes to the cache layer, which synchronously updates the database.
- **Write-Back (Write-Behind)**: The application writes to the cache, and an asynchronous queue writes batched updates to the database.

## Mitigating Cache Stampede (Thundering Herd)
When a high-traffic cache key expires, thousands of concurrent threads simultaneously query the database:
1. **Distributed Mutex Lock**: Only one thread acquires the lock to query the DB; others wait or return stale cache data.
2. **XFetch Probabilistic Early Expiration**: Recomputes the cache value in the background before it officially expires based on read frequency and computation time.
`,
  },

  // 3. Frontend Development
  {
    id: "art-seed-fe-react19",
    title: "React 19 Actions, Server Components & The New Asset Loading Model",
    slug: "react-19-actions-server-components-architecture",
    summary: "A practical guide to the new Actions paradigm, useActionState, useOptimistic, and avoiding legacy useEffect data fetching anti-patterns.",
    category: "Interview Prep",
    domainSlug: "frontend-development",
    author: {
      name: "Pooja Reddy",
      role: "Lead Frontend Engineer",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 8,
    publishedDate: "2026-09-28",
    tags: ["Frontend", "React", "TypeScript", "Performance"],
    viewsCount: 1690,
    likesCount: 395,
    featured: false,
    source: "local-seed",
    content: `# React 19 Actions & The New Component Architecture

React 19 formalizes async data transitions into first-class Actions, dramatically simplifying form handling, pending indicators, and optimistic rollbacks.

## 1. The \`useActionState\` Hook
Replaces manual \`isSubmitting\` and error state trackers:
\`\`\`tsx
const [state, formAction, isPending] = useActionState(
  async (prevState, formData) => {
    const error = await updateProfile(formData);
    if (error) return { error };
    return { success: true };
  },
  initialState
);
\`\`\`

## 2. Instant Feedback with \`useOptimistic\`
Renders the predicted state immediately while the async network request is in flight, automatically rolling back if an error occurs.
`,
  },

  // 4. DevOps & Cloud
  {
    id: "art-seed-devops-k8s-arch",
    title: "Kubernetes Production Readiness: Probes, Requests & Graceful Shutdown",
    slug: "kubernetes-production-readiness-probes-graceful-shutdown",
    summary: "Critical configurations for zero-downtime rolling updates: Liveness vs Readiness vs Startup probes, PreStop hooks, and SIGTERM draining.",
    category: "System Design",
    domainSlug: "devops-cloud",
    author: {
      name: "Arjun Nair",
      role: "Site Reliability Director",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 8,
    publishedDate: "2026-09-30",
    tags: ["DevOps", "Kubernetes", "Docker", "SRE"],
    viewsCount: 1340,
    likesCount: 290,
    featured: false,
    source: "local-seed",
    content: `# Kubernetes Production Readiness Guide

Zero-downtime rolling updates require orchestrating the interplay between the Ingress controller, kube-proxy iptables, and container shutdown handlers.

## 1. Probe Separation
- **Startup Probe**: Prevents premature liveness kills during slow application initializations (JVM warming, large model loading).
- **Readiness Probe**: Controls whether the Pod receives traffic from the Kubernetes Service endpoint pool.
- **Liveness Probe**: Restarts the container only if the process is completely frozen or deadlocked.

## 2. The Graceful Termination Lifecycle
When a Pod is deleted:
1. Pod status becomes \`Terminating\`; kubelet removes it from Service Endpoints.
2. \`preStop\` hook executes (e.g. \`sleep 10\`), allowing in-flight proxy routing to clear.
3. Kubelet sends \`SIGTERM\` to container process.
4. Process stops accepting new connections, flushes buffers, and exits.
5. If process does not exit within \`terminationGracePeriodSeconds\`, \`SIGKILL\` is issued.
`,
  },

  // 5. HR & Behavioral
  {
    id: "art-seed-hr-salary-negotiation",
    title: "Engineering Salary Negotiation: Tactics for Campus & Lateral Hires",
    slug: "engineering-salary-negotiation-tactics",
    summary: "How to anchor compensation discussions, counter lowball offers without aggression, and optimize base salary versus stock equity packages.",
    category: "Career & Resume",
    domainSlug: "hr-behavioral",
    author: {
      name: "Ananya Sharma",
      role: "Ex-Google Staff Recruiter",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 6,
    publishedDate: "2026-10-01",
    tags: ["HR", "Career", "Negotiation", "Salary"],
    viewsCount: 2750,
    likesCount: 680,
    featured: true,
    source: "local-seed",
    content: `# Engineering Salary Negotiation: A Candid Framework

Negotiation is not a confrontation; it is a collaborative alignment of value between engineering talent and business requirements.

## 1. The Power of Information Anchoring
- Research verified market percentiles using levels.fyi and local peer networks.
- Never state your current compensation first; deflect politely: *"I'm focused on finding the right technical fit and expect compensation in line with competitive market rates for this role."*

## 2. Expanding the Package Beyond Base Salary
If base salary has a rigid band limit, negotiate flexible levers:
- **Sign-on Bonus**: One-time cost to company, easy for hiring managers to approve.
- **RSU Equity Grant**: High leverage for high-growth tech companies.
- **Performance Review Horizon**: Negotiate an accelerated 6-month compensation review milestone.
`,
  },
];
