export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: "Interview Prep" | "System Design" | "Career & Resume" | "Coding Advice";
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  readTimeMinutes: number;
  publishedDate: string;
  tags: string[];
  viewsCount: number;
  likesCount: number;
  featured?: boolean;
}

export const mockArticles: Article[] = [
  {
    id: "art-1",
    title: "How to Answer 'Tell Me About a Time You Failed' Using the STAR Method",
    slug: "star-method-behavioral-failure-question",
    summary: "Master the classic behavioral trap. Learn how top candidates frame mistakes as high-impact growth opportunities with concrete metrics.",
    category: "Interview Prep",
    author: {
      name: "Ananya Sharma",
      role: "Ex-Google Staff Recruiter",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 6,
    publishedDate: "2026-09-18",
    tags: ["Behavioral", "HR", "STAR Method", "Interview Skills"],
    viewsCount: 1420,
    likesCount: 382,
    featured: true,
    content: `
# Mastering Behavioral Questions: The STAR Framework

Behavioral interview questions are designed to uncover how you react under pressure, resolve conflict, and learn from past project setbacks.

## The STAR Blueprint
- **Situation**: Set the scene and give necessary context.
- **Task**: Describe your responsibility in the scenario.
- **Action**: Explain exactly what steps *you* took to address the issue.
- **Result**: Share the outcomes, quantified with data where possible.

### Example Walkthrough
"During my third year capstone project, our team's MongoDB instance experienced connection pooling exhaustion right before demo day..."
    `,
  },
  {
    id: "art-2",
    title: "System Design 101: Designing a Scalable URL Shortener (TinyURL)",
    slug: "system-design-tinyurl-architectural-guide",
    summary: "Step-by-step breakdown of functional requirements, database schema design, Base62 encoding, caching, and rate limiting.",
    category: "System Design",
    author: {
      name: "Kanhaiya Pandey",
      role: "Lead Systems Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 12,
    publishedDate: "2026-09-21",
    tags: ["System Design", "Distributed Systems", "Redis", "Base62"],
    viewsCount: 2890,
    likesCount: 710,
    featured: true,
    content: `
# Designing TinyURL: A High-Throughput System Design Walkthrough

URL shorteners are standard system design questions for mid and senior engineering interviews.

## 1. Requirement Clarification
- **Functional**: Convert long URLs into 7-character short codes. Redirect short links to original URLs in < 50ms.
- **Non-Functional**: High availability (99.99%), low latency, and collision resistance.

## 2. Capacity Estimation
Assuming 500 million new URLs created per month, at a 10:1 read-to-write ratio...
    `,
  },
  {
    id: "art-3",
    title: "Top 10 React 19 Interview Questions You Need to Know",
    slug: "top-react-19-interview-questions-2026",
    summary: "From Server Actions and the use() hook to compiler automatic memoization and optimistic updates.",
    category: "Coding Advice",
    author: {
      name: "Rohan Verma",
      role: "Senior Frontend Lead",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    readTimeMinutes: 8,
    publishedDate: "2026-09-10",
    tags: ["React", "JavaScript", "Frontend", "Web Dev"],
    viewsCount: 1980,
    likesCount: 425,
    content: `
# Top React 19 Concepts Evaluated in Technical Rounds

React 19 brings massive shifts in how frontend engineering interviews are conducted...
    `,
  },
];
