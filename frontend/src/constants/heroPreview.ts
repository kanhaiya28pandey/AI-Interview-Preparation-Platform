export interface RolePreview {
  skills: string[];
  sampleQuestion: string;
  avgScore: number;
}

export const ROLE_PREVIEWS: Record<string, RolePreview> = {
  frontend: {
    skills: ["React 19", "TypeScript", "Accessibility", "State Systems"],
    sampleQuestion: "Explain how React 19 Fiber reconciles concurrent priority updates.",
    avgScore: 92,
  },
  backend: {
    skills: ["Spring Boot 4", "Microservices", "PostgreSQL", "Kafka Events"],
    sampleQuestion: "Design an idempotent distributed payment transaction pipeline.",
    avgScore: 89,
  },
  fullstack: {
    skills: ["Next.js", "Node.js", "GraphQL", "Redis Caching"],
    sampleQuestion: "How do you architect SSR caching with optimistic mutations?",
    avgScore: 91,
  },
  "data-analyst": {
    skills: ["SQL Optimization", "Tableau", "Python Pandas", "A/B Testing"],
    sampleQuestion: "Analyze user retention cohort drop-offs using window functions.",
    avgScore: 88,
  },
  "ai-ml": {
    skills: ["PyTorch", "LLM Fine-Tuning", "RAG Systems", "Vector DBs"],
    sampleQuestion: "Explain cosine similarity vs dot product in dense embedding retrieval.",
    avgScore: 94,
  },
  devops: {
    skills: ["Kubernetes", "CI/CD Pipelines", "Terraform", "Docker"],
    sampleQuestion: "Implement zero-downtime blue-green canary deployment rollouts.",
    avgScore: 90,
  },
  cloud: {
    skills: ["AWS / GCP", "Serverless Lambda", "IAM Security", "CloudFront CDN"],
    sampleQuestion: "Design multi-region disaster recovery with sub-second RTO/RPO.",
    avgScore: 87,
  },
  android: {
    skills: ["Kotlin Coroutines", "Jetpack Compose", "Clean Architecture", "Room DB"],
    sampleQuestion: "Optimize cold app startup time and frame render latency in Compose.",
    avgScore: 89,
  },
  qa: {
    skills: ["Playwright", "Jest / Vitest", "Cypress", "Load Testing"],
    sampleQuestion: "Structure automated end-to-end regression suites for high-concurrency apps.",
    avgScore: 93,
  },
  cybersecurity: {
    skills: ["OWASP Top 10", "OAuth2 / JWT", "Penetration Testing", "Zero Trust"],
    sampleQuestion: "Prevent SSRF and JWT token replay vulnerabilities in modern APIs.",
    avgScore: 91,
  },
};
