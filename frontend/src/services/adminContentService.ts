export interface McqQuestionItem {
  id: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points?: number;
}

export interface CodingProblemItem {
  id: string;
  title: string;
  statement: string;
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points?: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "MCQ Quiz" | "Mock Test" | "Coding Test" | "Mock Interview" | "Practice Track" | "Article";
  subject: string;
  topics: string[];
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  status: "Draft" | "Published" | "Archived";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  studentAttemptsCount: number;
  questionsCount: number;
  durationMinutes: number;
  passMarkPercent?: number;
  negativeMarking?: boolean;
  shuffleOptions?: boolean;
  showAnswers?: boolean;
  scheduleStart?: string;
  scheduleEnd?: string;
  visibility?: string;
  payload?: {
    mcqQuestions?: McqQuestionItem[];
    codingProblems?: CodingProblemItem[];
    articleMarkdown?: string;
    mixedDifficultySplit?: { easy: number; medium: number; hard: number };
    interviewRubric?: { correctness: number; clarity: number; depth: number; communication: number };
  };
}

const STORAGE_KEY = "ai_interview_prep_admin_content_items";

const INITIAL_MOCK_CONTENT: ContentItem[] = [
  {
    id: "cnt-1",
    title: "Data Structures & Algorithms Master Quiz",
    description: "Comprehensive MCQ test covering Arrays, Linked Lists, Trees & Dynamic Programming.",
    type: "MCQ Quiz",
    subject: "DSA",
    topics: ["Arrays", "Trees", "DP"],
    difficulty: "Medium",
    status: "Published",
    createdBy: "Admin",
    createdAt: "2026-09-15T10:00:00",
    updatedAt: "2026-09-20T14:30:00",
    studentAttemptsCount: 142,
    questionsCount: 15,
    durationMinutes: 30,
    passMarkPercent: 70,
    negativeMarking: true,
    shuffleOptions: true,
    showAnswers: true,
    visibility: "All",
    payload: {
      mcqQuestions: [
        {
          id: "q1",
          questionText: "What is the worst-case time complexity of Quick Sort?",
          options: ["O(N log N)", "O(N^2)", "O(N)", "O(1)"],
          correctOptionIndex: 1,
          explanation: "In worst case (already sorted with bad pivot choice), Quick Sort degrades to O(N^2).",
        },
        {
          id: "q2",
          questionText: "Which data structure uses LIFO (Last In First Out) principle?",
          options: ["Queue", "Stack", "Heap", "Binary Tree"],
          correctOptionIndex: 1,
          explanation: "Stack operates on Last In First Out order.",
        },
      ],
    },
  },
  {
    id: "cnt-2",
    title: "Full-Stack Assessment Mock Test 2026",
    description: "Combined 60-min test with 10 React/Java MCQs and 2 Coding Problems.",
    type: "Mock Test",
    subject: "Web Dev",
    topics: ["React.js", "Java", "SQL"],
    difficulty: "Mixed",
    status: "Published",
    createdBy: "Admin",
    createdAt: "2026-09-18T11:00:00",
    updatedAt: "2026-09-22T09:15:00",
    studentAttemptsCount: 88,
    questionsCount: 12,
    durationMinutes: 60,
    passMarkPercent: 75,
    visibility: "All",
    payload: {
      mixedDifficultySplit: { easy: 30, medium: 50, hard: 20 },
      mcqQuestions: [],
      codingProblems: [],
    },
  },
  {
    id: "cnt-3",
    title: "System Design & Microservices Round",
    description: "AI-guided template simulating technical architecture interview.",
    type: "Mock Interview",
    subject: "System Design",
    topics: ["Load Balancers", "Caching", "Sharding"],
    difficulty: "Hard",
    status: "Draft",
    createdBy: "Admin",
    createdAt: "2026-09-25T16:20:00",
    updatedAt: "2026-09-28T18:45:00",
    studentAttemptsCount: 0,
    questionsCount: 4,
    durationMinutes: 45,
    visibility: "Batch 2026",
  },
  {
    id: "cnt-4",
    title: "Java Spring Boot & Hibernate Deep Dive",
    description: "Practice questions & code walkthroughs for Spring Boot enterprise applications.",
    type: "Practice Track",
    subject: "OOP",
    topics: ["Dependency Injection", "JPA Repository", "AOP"],
    difficulty: "Medium",
    status: "Published",
    createdBy: "Admin",
    createdAt: "2026-09-10T08:30:00",
    updatedAt: "2026-09-24T12:00:00",
    studentAttemptsCount: 215,
    questionsCount: 20,
    durationMinutes: 40,
    visibility: "All",
  },
  {
    id: "cnt-5",
    title: "How to Crack Top Product Company Coding Interviews",
    description: "Step-by-step roadmap covering 14 patterns, dynamic programming, and system design.",
    type: "Article",
    subject: "DSA",
    topics: ["Two Pointers", "Sliding Window", "Graph BFS"],
    difficulty: "Easy",
    status: "Published",
    createdBy: "Admin",
    createdAt: "2026-09-01T09:00:00",
    updatedAt: "2026-09-29T15:10:00",
    studentAttemptsCount: 430,
    questionsCount: 1,
    durationMinutes: 15,
    visibility: "All",
    payload: {
      articleMarkdown: "# How to Crack Coding Interviews\n\nFocus on understanding core patterns rather than memorizing individual problems...",
    },
  },
];

class AdminContentService {
  private getStoredItems(): ContentItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CONTENT));
      return INITIAL_MOCK_CONTENT;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_CONTENT;
    }
  }

  private saveStoredItems(items: ContentItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  async getContentItems(filters?: {
    type?: string;
    subject?: string;
    difficulty?: string;
    status?: string;
    search?: string;
  }): Promise<ContentItem[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.type && filters.type !== "All") queryParams.append("type", filters.type);
      if (filters?.subject && filters.subject !== "All") queryParams.append("subject", filters.subject);
      if (filters?.difficulty && filters.difficulty !== "All") queryParams.append("difficulty", filters.difficulty);
      if (filters?.status && filters.status !== "All") queryParams.append("status", filters.status);

      const res = await fetch(`/api/v1/admin/content?${queryParams.toString()}`);
      if (res.ok) {
        let items: ContentItem[] = await res.json();
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          items = items.filter(
            (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q)
          );
        }
        return items;
      }
    } catch {
      // Fallback local storage
    }

    let items = this.getStoredItems();
    if (filters?.type && filters.type !== "All") items = items.filter((i) => i.type === filters.type);
    if (filters?.subject && filters.subject !== "All") items = items.filter((i) => i.subject === filters.subject);
    if (filters?.difficulty && filters.difficulty !== "All") items = items.filter((i) => i.difficulty === filters.difficulty);
    if (filters?.status && filters.status !== "All") items = items.filter((i) => i.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q)
      );
    }
    return items;
  }

  async getContentById(id: string): Promise<ContentItem | null> {
    try {
      const res = await fetch(`/api/v1/admin/content/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    const items = this.getStoredItems();
    return items.find((i) => i.id === id) || null;
  }

  async saveContent(item: Partial<ContentItem>): Promise<ContentItem> {
    const isEdit = !!item.id;
    const url = isEdit ? `/api/v1/admin/content/${item.id}` : `/api/v1/admin/content`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) return await res.json();
    } catch {}

    const items = this.getStoredItems();
    if (isEdit) {
      const idx = items.findIndex((i) => i.id === item.id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...item, updatedAt: new Date().toISOString() } as ContentItem;
        this.saveStoredItems(items);
        return items[idx];
      }
    }

    const newItem: ContentItem = {
      id: "cnt-" + Date.now().toString(36),
      title: item.title || "Untitled Content",
      description: item.description || "",
      type: item.type || "MCQ Quiz",
      subject: item.subject || "DSA",
      topics: item.topics || [],
      difficulty: item.difficulty || "Easy",
      status: item.status || "Draft",
      createdBy: "Admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentAttemptsCount: 0,
      questionsCount: item.questionsCount || 1,
      durationMinutes: item.durationMinutes || 30,
      passMarkPercent: item.passMarkPercent || 70,
      negativeMarking: item.negativeMarking ?? true,
      shuffleOptions: item.shuffleOptions ?? true,
      showAnswers: item.showAnswers ?? true,
      visibility: item.visibility || "All",
      payload: item.payload || {},
    };

    items.unshift(newItem);
    this.saveStoredItems(items);
    return newItem;
  }

  async deleteContent(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/v1/admin/content/${id}`, { method: "DELETE" });
      if (res.ok) return { success: true };
      const err = await res.json();
      return { success: false, message: err.message };
    } catch {}

    const items = this.getStoredItems();
    const target = items.find((i) => i.id === id);
    if (target && target.studentAttemptsCount > 0) {
      return {
        success: false,
        message: `Cannot delete item with active student attempts (${target.studentAttemptsCount} attempts). Consider Archiving instead.`,
      };
    }

    const filtered = items.filter((i) => i.id !== id);
    this.saveStoredItems(filtered);
    return { success: true };
  }

  async duplicateContent(id: string): Promise<ContentItem> {
    try {
      const res = await fetch(`/api/v1/admin/content/${id}/duplicate`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch {}

    const items = this.getStoredItems();
    const source = items.find((i) => i.id === id);
    if (!source) throw new Error("Source content not found");

    const copy: ContentItem = {
      ...source,
      id: "cnt-" + Date.now().toString(36),
      title: `${source.title} (Copy)`,
      status: "Draft",
      studentAttemptsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.unshift(copy);
    this.saveStoredItems(items);
    return copy;
  }

  async bulkUpdateStatus(ids: string[], action: "PUBLISH" | "UNPUBLISH" | "ARCHIVE" | "DELETE"): Promise<{ updatedCount: number }> {
    try {
      const res = await fetch(`/api/v1/admin/content/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      if (res.ok) return await res.json();
    } catch {}

    let items = this.getStoredItems();
    let updatedCount = 0;

    if (action === "DELETE") {
      items = items.filter((i) => {
        if (ids.includes(i.id) && i.studentAttemptsCount === 0) {
          updatedCount++;
          return false;
        }
        return true;
      });
    } else {
      items = items.map((i) => {
        if (ids.includes(i.id)) {
          updatedCount++;
          return {
            ...i,
            status: action === "PUBLISH" ? "Published" : action === "UNPUBLISH" ? "Draft" : "Archived",
            updatedAt: new Date().toISOString(),
          };
        }
        return i;
      });
    }

    this.saveStoredItems(items);
    return { updatedCount };
  }

  async generateMcqQuestions(subject: string, topic: string, difficulty: string, count: number): Promise<McqQuestionItem[]> {
    try {
      const res = await fetch(`/api/v1/admin/content/generate-mcq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, difficulty, count }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.questions || [];
      }
    } catch {}

    // Fallback MCQ generation
    const questions: McqQuestionItem[] = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: "gen-q-" + i + "-" + Date.now().toString(36),
        questionText: `Which algorithm concept best optimizes ${topic} operations under ${difficulty} complexity conditions?`,
        codeSnippet: i % 2 === 0 ? `// ${topic} sample snippet\npublic void executeAlgorithm() {\n  // Optimized step\n}` : undefined,
        options: [
          `Dynamic Programming with memoization matrix`,
          `Two-Pointer traversal from head and tail`,
          `Divide and Conquer recursive binary split`,
          `Brute Force nested iteration O(N^2)`,
        ],
        correctOptionIndex: 0,
        explanation: `Dynamic programming eliminates redundant subproblem evaluations for ${topic}, guaranteeing optimal runtime efficiency.`,
      });
    }
    return questions;
  }
}

export const adminContentService = new AdminContentService();
