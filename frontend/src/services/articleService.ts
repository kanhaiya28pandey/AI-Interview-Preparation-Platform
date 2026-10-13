import api from "@/lib/api";
import { Article, ArticleQAItem, mockArticles } from "@/mocks/articleData";
import { progressService } from "./progressService";

const STORAGE_KEY = "ai_interview_prep_articles_cms_v2";

function getStoredArticles(): Article[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to parse stored articles:", e);
  }
  // Initialize with seed mock articles
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockArticles));
  return mockArticles;
}

function saveStoredArticles(articles: Article[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    window.dispatchEvent(new Event("articles-updated"));
  } catch (e) {
    console.warn("Failed to save articles to storage:", e);
  }
}

function getSessionToken(): string {
  try {
    let token = sessionStorage.getItem("ai_interview_session_token");
    if (!token) {
      token = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("ai_interview_session_token", token);
    }
    return token;
  } catch {
    return `session-${Date.now()}`;
  }
}

export const articleService = {
  async getArticles(includeDrafts = false): Promise<Article[]> {
    const list = getStoredArticles();
    if (includeDrafts) {
      return list;
    }
    return list.filter((a) => a.status === "PUBLISHED" || !a.status);
  },

  async getArticleById(id: string): Promise<Article | undefined> {
    const list = getStoredArticles();
    return list.find((a) => a.id === id || a.slug === id);
  },

  // Record Real View: 1 view per student/session token, increments view count and awards XP
  async recordRealView(id: string, userId?: string | null): Promise<number> {
    const list = getStoredArticles();
    const idx = list.findIndex((a) => a.id === id || a.slug === id);
    if (idx === -1) return 0;

    const userToken = userId || getSessionToken();
    const article = { ...list[idx] };
    const viewedUsers = Array.isArray(article.viewedByUsers) ? [...article.viewedByUsers] : [];

    if (!viewedUsers.includes(userToken)) {
      viewedUsers.push(userToken);
      article.viewedByUsers = viewedUsers;
      article.viewsCount = viewedUsers.length;
      list[idx] = article;
      saveStoredArticles(list);

      // Award reading progress and XP if real user
      if (userId) {
        progressService.awardXP(userId, 15);
        progressService.incrementStat(userId, "articlesRead");
        progressService.syncMasterStudentRecord(userId, { activityDelta: 2 });
      }
    }

    return article.viewsCount;
  },

  // Toggle Like: 1 Student = 1 Like strictly enforced
  async toggleLikeArticle(id: string, userId?: string | null): Promise<{ likesCount: number; isLiked: boolean }> {
    const list = getStoredArticles();
    const idx = list.findIndex((a) => a.id === id || a.slug === id);
    if (idx === -1) return { likesCount: 0, isLiked: false };

    const userToken = userId || getSessionToken();
    const article = { ...list[idx] };
    const likedUsers = Array.isArray(article.likedByUsers) ? [...article.likedByUsers] : [];

    let isLiked = false;
    if (likedUsers.includes(userToken)) {
      // Unlike
      article.likedByUsers = likedUsers.filter((u) => u !== userToken);
      article.likesCount = Math.max(0, article.likedByUsers.length);
      isLiked = false;
    } else {
      // Like
      likedUsers.push(userToken);
      article.likedByUsers = likedUsers;
      article.likesCount = likedUsers.length;
      isLiked = true;
    }

    list[idx] = article;
    saveStoredArticles(list);
    return { likesCount: article.likesCount, isLiked };
  },

  // Check if student has liked an article
  hasUserLiked(article: Article, userId?: string | null): boolean {
    const userToken = userId || getSessionToken();
    return Array.isArray(article.likedByUsers) && article.likedByUsers.includes(userToken);
  },

  // Admin CMS: Create Article
  async createArticle(data: Partial<Article>): Promise<Article> {
    const list = getStoredArticles();
    const id = `art-${Date.now()}`;
    const slug = (data.title || "placement-guide")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newArticle: Article = {
      id,
      title: data.title || "Untitled Placement Guide",
      slug: data.slug || `${slug}-${Date.now().toString().slice(-4)}`,
      summary: data.summary || "Comprehensive placement guide covering key architectural concepts.",
      content: data.content || "# Guide Content\n\nWrite guide content here...",
      category: data.category || "Backend & Systems",
      domainSlug: data.domainSlug || "backend",
      topic: data.topic || "Core Principles",
      author: data.author || {
        name: "Admin Editorial Team",
        role: "Senior Engineering Staff",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      readTimeMinutes: data.readTimeMinutes || 8,
      publishedDate: new Date().toISOString().split("T")[0],
      status: data.status || "PUBLISHED",
      tags: data.tags || [data.category || "Interview Prep", "Guide"],
      viewsCount: 0,
      likesCount: 0,
      likedByUsers: [],
      viewedByUsers: [],
      featured: Boolean(data.featured),
      interviewQA: Array.isArray(data.interviewQA) ? data.interviewQA : [],
    };

    const updated = [newArticle, ...list];
    saveStoredArticles(updated);
    return newArticle;
  },

  // Admin CMS: Update Article
  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const list = getStoredArticles();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Article not found");

    const existing = list[idx];
    const updated: Article = {
      ...existing,
      ...updates,
      tags: updates.tags || existing.tags,
      interviewQA: updates.interviewQA || existing.interviewQA,
    };

    list[idx] = updated;
    saveStoredArticles(list);
    return updated;
  },

  // Admin CMS: Delete Article
  async deleteArticle(id: string): Promise<boolean> {
    const list = getStoredArticles();
    const filtered = list.filter((a) => a.id !== id);
    saveStoredArticles(filtered);
    return true;
  },

  // Admin CMS: Toggle Status (PUBLISHED / DRAFT)
  async toggleArticleStatus(id: string): Promise<Article> {
    const list = getStoredArticles();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Article not found");

    const art = list[idx];
    art.status = art.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    list[idx] = art;
    saveStoredArticles(list);
    return art;
  },

  // AI Placement Guide Generator
  async generateAIArticle(params: {
    topic: string;
    domain: string;
    targetRole?: string;
  }): Promise<{
    title: string;
    summary: string;
    content: string;
    readTimeMinutes: number;
    tags: string[];
    interviewQA: ArticleQAItem[];
  }> {
    try {
      const aiBase = import.meta.env.VITE_AI_SERVICE_URL || "/api/ai";
      const response = await fetch(`${aiBase}/article/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: params.topic,
          domain: params.domain,
          targetRole: params.targetRole || "Software Engineer",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.warn("AI service call failed, generating via algorithmic fallback:", e);
    }

    // High quality fallback
    return {
      title: `${params.topic}: High-Yield Placement Guide & Architecture Deep-Dive`,
      summary: `Master the core concepts, common interview trade-offs, and critical system design patterns for ${params.topic} in ${params.domain}.`,
      readTimeMinutes: 8,
      tags: [params.domain, params.topic, "Interview Prep", "Architecture"],
      content: `
# Mastering ${params.topic} for Tier-1 Technical Interviews

When evaluating candidates on **${params.topic}**, top tech interviewers look for deep conceptual rigor, clear awareness of scalability constraints, and practical production experience.

---

## 1. Core Architectural Pillars
- **Foundational Concepts**: Why ${params.topic} is chosen over alternative approaches.
- **Latency & Throughput Trade-offs**: How data movement, network hops, and locking behavior affect system SLA.
- **Resilience**: Handling timeouts, retry storms, and cascade failures cleanly.

## 2. Production Patterns & Anti-Patterns
1. **Never ignore error boundaries**: Ensure graceful degradation when downstream services timeout.
2. **Telemetry first**: Build structured metrics and trace spans before shipping code.
3. **Idempotency**: Protect against duplicate requests with deterministic idempotency keys.
      `,
      interviewQA: [
        {
          id: `qa-${Date.now()}-1`,
          question: `What is the primary architectural trade-off when implementing ${params.topic}?`,
          answer: `The central trade-off involves balancing operational simplicity against high-throughput scalability. Introducing complex caching or distributed sharding prematurely creates synchronization overhead and debugging latency.`,
          keyPoints: [
            "Evaluate read-to-write ratios before choosing storage models",
            "Simplicity and observability trump premature complexity",
            "Always quantify expected throughput limits before scaling out"
          ]
        },
        {
          id: `qa-${Date.now()}-2`,
          question: `How do you diagnose and resolve latency bottlenecks in ${params.topic}?`,
          answer: `Inspect distributed traces (OpenTelemetry) to distinguish between network wait time, database lock contention, and CPU serialization bottlenecks. Examine connection pool saturation and query execution plans.`,
          keyPoints: [
            "Use trace-first diagnostics across microservice boundaries",
            "Monitor P99 latency rather than deceptive averages",
            "Check database indexing and thread pool utilization"
          ]
        },
        {
          id: `qa-${Date.now()}-3`,
          question: `How do you handle edge cases and concurrency anomalies in ${params.topic}?`,
          answer: `Implement optimistic locking with version columns to prevent lost updates, validate input boundaries at API boundaries, and configure circuit breakers to isolate cascading failures.`,
          keyPoints: [
            "Optimistic concurrency control prevents race conditions",
            "Circuit breakers prevent cascade outages",
            "Comprehensive integration testing for boundary states"
          ]
        },
        {
          id: `qa-${Date.now()}-4`,
          question: `How do you explain the transition of ${params.topic} from a prototype to production scale?`,
          answer: `Begin with a modular monolith to clearly identify domain boundaries. Decouple components into asynchronous event-driven pipelines only when independent scaling, deployment cadence, or team ownership boundaries mandate it.`,
          keyPoints: [
            "Modular architecture before microservice distribution",
            "Asynchronous message queues (Kafka) decouple high-traffic bursts",
            "Continuous automated regression tests ensure deployment velocity"
          ]
        }
      ]
    };
  }
};
