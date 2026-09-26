export interface SubScores {
  keywordMatch: number;
  formatting: number;
  experienceRelevance: number;
  skillsMatch: number;
  educationMatch: number;
  actionVerbUsage: number;
}

export interface MissingSkillDetail {
  name: string;
  importance: "High" | "Medium" | "Critical";
  tooltip: string;
}

export interface FormattingItem {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
}

export interface SectionAnalysis {
  name: string;
  status: "good" | "needs-improvement" | "missing";
  score: number;
  extractedContent: string;
  suggestions: string[];
}

export interface KeywordDetail {
  keyword: string;
  present: boolean;
  count: number;
  importance: "Critical" | "Recommended" | "Bonus";
}

export interface SuggestionDetail {
  id: string;
  section: "Summary" | "Experience" | "Skills" | "Projects" | "Education";
  priority: "High" | "Medium" | "Low";
  text: string;
  whyItMatters: string;
}

export interface RoleFitItem {
  roleName: string;
  score: number;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  role: string;
  score: number;
  fileName: string;
}

export interface ResumeAnalysisResult {
  role: string;
  field: string;
  fileName: string;
  analyzedAt: string;
  atsScore: number;
  verdict: string;
  subScores: SubScores;
  matchedSkills: string[];
  missingSkills: MissingSkillDetail[];
  suggestions: SuggestionDetail[];
  keywords: KeywordDetail[];
  formattingChecklist: FormattingItem[];
  sections: SectionAnalysis[];
  roleFitComparison: RoleFitItem[];
  history: AnalysisHistoryItem[];
}

export interface MissingSkillStat {
  name: string;
  count: number;
  percentage: number;
}

export interface RoleDistributionStat {
  role: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AdminResumeAnalytics {
  avgAtsScore: number;
  scoreTrend: string;
  totalResumesAnalyzed: number;
  topMissingSkills: MissingSkillStat[];
  roleDistribution: RoleDistributionStat[];
}

export const mockAdminResumeAnalytics: AdminResumeAnalytics = {
  avgAtsScore: 79.4,
  scoreTrend: "+4.2% vs last month",
  totalResumesAnalyzed: 1420,
  topMissingSkills: [
    { name: "Microservices Architecture", count: 480, percentage: 34 },
    { name: "Next.js (App Router)", count: 410, percentage: 29 },
    { name: "Jest & Automated Testing", count: 350, percentage: 25 },
    { name: "Spring Security & JWT", count: 290, percentage: 20 },
    { name: "Cloud Warehouses (BigQuery)", count: 220, percentage: 15 },
  ],
  roleDistribution: [
    { role: "Frontend Dev", count: 540, percentage: 38, color: "#22d3ee" },
    { role: "Backend Dev", count: 398, percentage: 28, color: "#14b8a6" },
    { role: "Data Analyst", count: 255, percentage: 18, color: "#818cf8" },
    { role: "Full Stack Dev", count: 142, percentage: 10, color: "#f59e0b" },
    { role: "Others", count: 85, percentage: 6, color: "#94a3b8" },
  ],
};

export const mockResumeAnalyses: Record<string, Omit<ResumeAnalysisResult, "fileName" | "role" | "field" | "analyzedAt">> = {
  "Frontend Developer": {
    atsScore: 84,
    verdict: "Strong match for Frontend Developer roles with modern React & Tailwind stack.",
    subScores: {
      keywordMatch: 88,
      formatting: 92,
      experienceRelevance: 82,
      skillsMatch: 86,
      educationMatch: 90,
      actionVerbUsage: 78,
    },
    matchedSkills: [
      "React.js",
      "TypeScript",
      "Tailwind CSS",
      "JavaScript (ES6+)",
      "HTML5/CSS3",
      "Git/GitHub",
      "REST APIs",
      "State Management (Zustand/Redux)",
    ],
    missingSkills: [
      {
        name: "Next.js (App Router)",
        importance: "Critical",
        tooltip: "Modern product companies mandate SSR/SSG framework experience for scalable web apps.",
      },
      {
        name: "Jest & React Testing Library",
        importance: "High",
        tooltip: "Automated unit and component testing is required for senior frontend screening.",
      },
      {
        name: "GraphQL & Apollo Client",
        importance: "Medium",
        tooltip: "Used heavily in micro-frontend environments to fetch schema-typed data.",
      },
      {
        name: "Web Vitals & Performance",
        importance: "High",
        tooltip: "Recruiters look for optimization metrics like LCP, CLS, and lazy-loading experience.",
      },
    ],
    suggestions: [
      {
        id: "s1",
        section: "Experience",
        priority: "High",
        text: "Add explicit metrics to project descriptions (e.g., 'Improved initial page load time by 35% via code splitting').",
        whyItMatters: "Quantified metrics prove business impact to recruiters and ATS scoring algorithms.",
      },
      {
        id: "s2",
        section: "Skills",
        priority: "High",
        text: "List component testing tools like Jest or Cypress to boost your testing & QA match score.",
        whyItMatters: "Testing frameworks are high-frequency keywords in modern frontend job descriptions.",
      },
      {
        id: "s3",
        section: "Summary",
        priority: "Medium",
        text: "Highlight full-stack awareness and SSR framework experience (e.g. Next.js) in your summary.",
        whyItMatters: "A 3-line impact summary catches the recruiter's eye within the first 6 seconds.",
      },
      {
        id: "s4",
        section: "Experience",
        priority: "Medium",
        text: "Replace passive verbs with strong action verbs like 'Architected', 'Spearheaded', and 'Engineered'.",
        whyItMatters: "Strong action verbs raise your action-verb usage sub-score from 78% to 90%+.",
      },
      {
        id: "s5",
        section: "Projects",
        priority: "Low",
        text: "Include live demo URLs and GitHub repository links for top 2 frontend web apps.",
        whyItMatters: "Clickable links allow recruiters to visually audit your UI quality and code architecture.",
      },
    ],
    keywords: [
      { keyword: "React.js", present: true, count: 6, importance: "Critical" },
      { keyword: "TypeScript", present: true, count: 4, importance: "Critical" },
      { keyword: "Tailwind CSS", present: true, count: 3, importance: "Recommended" },
      { keyword: "Next.js", present: false, count: 0, importance: "Critical" },
      { keyword: "Jest / RTL", present: false, count: 0, importance: "Recommended" },
      { keyword: "REST API", present: true, count: 3, importance: "Critical" },
      { keyword: "GraphQL", present: false, count: 0, importance: "Bonus" },
      { keyword: "Web Performance", present: true, count: 1, importance: "Recommended" },
      { keyword: "Git / GitHub", present: true, count: 2, importance: "Critical" },
    ],
    formattingChecklist: [
      { id: "f1", label: "Single-column ATS readable layout", passed: true, tip: "No columns scrambling ATS reading order." },
      { id: "f2", label: "Standard section headers (Work Experience, Education, Skills)", passed: true, tip: "Matches standard parser regex." },
      { id: "f3", label: "No tables or graphic elements blocking text parser", passed: true, tip: "Text flows cleanly without nested tables." },
      { id: "f4", label: "Consistent bullet point structure", passed: true, tip: "Standard bullet lists detected across all entries." },
      { id: "f5", label: "ATS-friendly standard typography (Inter/Arial/Helvetica)", passed: true, tip: "Clean font without custom glyphs." },
      { id: "f6", label: "No key info hidden in header/footer margin area", passed: true, tip: "Name and contact info are in the body text area." },
      { id: "f7", label: "Optimal page length (1-2 pages)", passed: true, tip: "1 page length ideal for entry to mid-level roles." },
      { id: "f8", label: "No embedded photo or graphic images", passed: true, tip: "Free of images that confuse parser OCR." },
    ],
    sections: [
      {
        name: "Summary",
        status: "good",
        score: 85,
        extractedContent: "Passionate Frontend Developer with 2+ years experience building responsive web apps in React and TypeScript.",
        suggestions: ["Mention state management and API integration strengths in summary."],
      },
      {
        name: "Experience",
        status: "needs-improvement",
        score: 78,
        extractedContent: "Frontend Engineer Intern - Built UI components with React & Tailwind, collaborated with backend team for API integration.",
        suggestions: ["Add numerical achievements (e.g., 'Reduced render lag by 20%')."],
      },
      {
        name: "Skills",
        status: "good",
        score: 92,
        extractedContent: "Languages: JavaScript, TypeScript, HTML5, CSS3. Frameworks: React, Tailwind CSS, Redux. Tools: Git, Vite, Webpack.",
        suggestions: ["Add testing libraries (Jest, Cypress)."],
      },
      {
        name: "Education",
        status: "good",
        score: 90,
        extractedContent: "B.Tech in Computer Science - SRM Institute of Science & Technology (2021-2025), GPA: 8.8/10",
        suggestions: ["Formatting is clear and complete."],
      },
      {
        name: "Projects",
        status: "good",
        score: 84,
        extractedContent: "AI Interview Platform: Developed interactive code editor & real-time chat widgets with React & Tailwind.",
        suggestions: ["Add live deployment link and GitHub repo link."],
      },
      {
        name: "Certifications",
        status: "missing",
        score: 40,
        extractedContent: "No explicit certifications detected.",
        suggestions: ["Add Meta Frontend Developer or AWS Cloud Practitioner certification."],
      },
    ],
    roleFitComparison: [
      { roleName: "Frontend Developer", score: 84 },
      { roleName: "Full Stack Developer", score: 72 },
      { roleName: "UI/UX Designer", score: 65 },
      { roleName: "Backend Developer", score: 48 },
    ],
    history: [
      { id: "h1", date: "2 days ago", role: "Frontend Developer", score: 74, fileName: "Resume_v1.pdf" },
      { id: "h2", date: "Yesterday", role: "Frontend Developer", score: 79, fileName: "Resume_v2.pdf" },
      { id: "h3", date: "Today (Current)", role: "Frontend Developer", score: 84, fileName: "Resume_Final.pdf" },
    ],
  },
  "Backend Developer": {
    atsScore: 76,
    verdict: "Good backend foundation, but needs microservices & security keywords.",
    subScores: {
      keywordMatch: 74,
      formatting: 85,
      experienceRelevance: 78,
      skillsMatch: 75,
      educationMatch: 88,
      actionVerbUsage: 72,
    },
    matchedSkills: [
      "Java 17",
      "Spring Boot",
      "RESTful APIs",
      "PostgreSQL",
      "Git",
      "Docker",
      "Maven",
    ],
    missingSkills: [
      {
        name: "Microservices Architecture",
        importance: "Critical",
        tooltip: "Enterprise backend roles expect experience with distributed service communications.",
      },
      {
        name: "Redis / Caching",
        importance: "High",
        tooltip: "Caching strategies are critical for high-throughput API design interviews.",
      },
      {
        name: "Kafka / Message Queues",
        importance: "High",
        tooltip: "Asynchronous event handling is required for scalable backend architectures.",
      },
      {
        name: "Spring Security & JWT",
        importance: "Critical",
        tooltip: "Authentication and RBAC implementation are expected skills in backend engineering.",
      },
    ],
    suggestions: [
      {
        id: "sb1",
        section: "Skills",
        priority: "High",
        text: "Add Spring Security, OAuth2, and JWT authentication details under backend projects.",
        whyItMatters: "Security keywords are mandatory filters for Java backend positions.",
      },
      {
        id: "sb2",
        section: "Experience",
        priority: "High",
        text: "Quantify backend performance gains (e.g., 'Reduced DB query latency by 45% via indexing').",
        whyItMatters: "DB query optimization metrics prove deep database engineering capabilities.",
      },
      {
        id: "sb3",
        section: "Summary",
        priority: "Medium",
        text: "Specify target backend stack (Java/Spring Boot) and API scale handled.",
        whyItMatters: "Helps recruiters instantly match you with open Java development requisitions.",
      },
    ],
    keywords: [
      { keyword: "Java 17", present: true, count: 5, importance: "Critical" },
      { keyword: "Spring Boot", present: true, count: 4, importance: "Critical" },
      { keyword: "Microservices", present: false, count: 0, importance: "Critical" },
      { keyword: "PostgreSQL", present: true, count: 3, importance: "Critical" },
      { keyword: "Redis", present: false, count: 0, importance: "Recommended" },
      { keyword: "Kafka", present: false, count: 0, importance: "Recommended" },
      { keyword: "Spring Security", present: false, count: 0, importance: "Critical" },
      { keyword: "Docker", present: true, count: 2, importance: "Recommended" },
    ],
    formattingChecklist: [
      { id: "f1", label: "Single-column ATS readable layout", passed: true, tip: "Clean readable structure." },
      { id: "f2", label: "Standard section headers", passed: true, tip: "Standard header regex match." },
      { id: "f3", label: "No tables or graphic elements", passed: false, tip: "Replace two-column table in skills section with simple comma list." },
      { id: "f4", label: "Consistent bullet point structure", passed: true, tip: "Bullet lists parsed properly." },
      { id: "f5", label: "ATS-friendly standard typography", passed: true, tip: "Clean font." },
      { id: "f6", label: "No key info hidden in header/footer", passed: true, tip: "Contact details in main body." },
      { id: "f7", label: "Optimal page length (1-2 pages)", passed: true, tip: "1 page length." },
      { id: "f8", label: "No photo or graphic images", passed: true, tip: "No image obstruction." },
    ],
    sections: [
      {
        name: "Summary",
        status: "needs-improvement",
        score: 70,
        extractedContent: "Backend enthusiast with interest in Java and APIs.",
        suggestions: ["Expand to include Spring Boot, database design, and REST APIs."],
      },
      {
        name: "Experience",
        status: "needs-improvement",
        score: 74,
        extractedContent: "Java Developer Intern - Created Spring REST endpoints, wrote SQL queries for PostgreSQL database.",
        suggestions: ["Include database query execution time improvements."],
      },
      {
        name: "Skills",
        status: "good",
        score: 82,
        extractedContent: "Java, Spring Boot, REST APIs, SQL, PostgreSQL, Maven, Git, Docker.",
        suggestions: ["Add Redis, Kafka, and Spring Security."],
      },
      {
        name: "Education",
        status: "good",
        score: 90,
        extractedContent: "B.Tech Computer Science (2021-2025)",
        suggestions: ["Format is clear."],
      },
      {
        name: "Projects",
        status: "needs-improvement",
        score: 72,
        extractedContent: "E-commerce Backend Service: Built Spring Boot REST API for order processing.",
        suggestions: ["Detail authentication (JWT) and API response benchmarks."],
      },
      {
        name: "Certifications",
        status: "missing",
        score: 40,
        extractedContent: "No certifications listed.",
        suggestions: ["Consider Oracle Certified Professional Java SE or AWS Developer Associate."],
      },
    ],
    roleFitComparison: [
      { roleName: "Backend Developer", score: 76 },
      { roleName: "Full Stack Developer", score: 70 },
      { roleName: "DevOps Engineer", score: 62 },
      { roleName: "Frontend Developer", score: 45 },
    ],
    history: [
      { id: "h1", date: "3 days ago", role: "Backend Developer", score: 68, fileName: "Backend_Draft.pdf" },
      { id: "h2", date: "Today (Current)", role: "Backend Developer", score: 76, fileName: "Backend_Resume.pdf" },
    ],
  },
  "Data Analyst": {
    atsScore: 91,
    verdict: "Exceptional match for Data Analyst roles! Excellent SQL & visualization score.",
    subScores: {
      keywordMatch: 94,
      formatting: 95,
      experienceRelevance: 89,
      skillsMatch: 92,
      educationMatch: 90,
      actionVerbUsage: 88,
    },
    matchedSkills: [
      "Python (Pandas, NumPy)",
      "SQL (PostgreSQL, MySQL)",
      "Power BI",
      "Tableau",
      "Excel (VLOOKUP, Pivot Tables)",
      "Data Cleaning",
      "Exploratory Data Analysis (EDA)",
    ],
    missingSkills: [
      {
        name: "Cloud Data Warehouses (Snowflake/BigQuery)",
        importance: "Medium",
        tooltip: "Modern data teams prefer cloud analytics warehouse experience.",
      },
      {
        name: "A/B Testing & Hypothesis Testing",
        importance: "High",
        tooltip: "Statistical decision making is crucial for product analyst roles.",
      },
    ],
    suggestions: [
      {
        id: "sd1",
        section: "Projects",
        priority: "Medium",
        text: "Add links to Tableau Public dashboard interactive demos or GitHub notebooks.",
        whyItMatters: "Visual proof of interactive dashboards impresses data hiring managers.",
      },
      {
        id: "sd2",
        section: "Skills",
        priority: "Low",
        text: "Mention statistical methods (t-tests, ANOVA, regression modeling).",
        whyItMatters: "Pushes your profile from Junior Analyst to Product Data Analyst tier.",
      },
    ],
    keywords: [
      { keyword: "SQL", present: true, count: 8, importance: "Critical" },
      { keyword: "Python", present: true, count: 6, importance: "Critical" },
      { keyword: "Power BI", present: true, count: 4, importance: "Recommended" },
      { keyword: "Tableau", present: true, count: 3, importance: "Recommended" },
      { keyword: "Data Cleaning", present: true, count: 4, importance: "Critical" },
      { keyword: "BigQuery", present: false, count: 0, importance: "Bonus" },
      { keyword: "A/B Testing", present: false, count: 0, importance: "Recommended" },
    ],
    formattingChecklist: [
      { id: "f1", label: "Single-column ATS readable layout", passed: true, tip: "Perfect parse rate." },
      { id: "f2", label: "Standard section headers", passed: true, tip: "Standard header names detected." },
      { id: "f3", label: "No tables or graphic elements", passed: true, tip: "No image graphs blocking scanner." },
      { id: "f4", label: "Consistent bullet point structure", passed: true, tip: "Consistently formatted bullets." },
      { id: "f5", label: "ATS-friendly standard typography", passed: true, tip: "ATS friendly font." },
      { id: "f6", label: "No key info hidden in header/footer", passed: true, tip: "Header area clean." },
      { id: "f7", label: "Optimal page length (1-2 pages)", passed: true, tip: "1 page length." },
      { id: "f8", label: "No photo or graphic images", passed: true, tip: "No photo issues." },
    ],
    sections: [
      {
        name: "Summary",
        status: "good",
        score: 92,
        extractedContent: "Results-driven Data Analyst with 2+ years experience writing complex SQL queries, building Power BI dashboards, and conducting Python EDA.",
        suggestions: ["Summary is punchy and metric-rich."],
      },
      {
        name: "Experience",
        status: "good",
        score: 90,
        extractedContent: "Data Analyst Intern - Optimized SQL queries reducing execution time by 40%, built automated Power BI executive reporting dashboards.",
        suggestions: ["Great metric usage!"],
      },
      {
        name: "Skills",
        status: "good",
        score: 95,
        extractedContent: "SQL, Python, Pandas, NumPy, Power BI, Tableau, Advanced Excel, Statistics.",
        suggestions: ["Add BigQuery or Snowflake."],
      },
      {
        name: "Education",
        status: "good",
        score: 90,
        extractedContent: "B.Tech CS / Data Science specialization (2021-2025)",
        suggestions: ["Clear degree info."],
      },
    ],
    roleFitComparison: [
      { roleName: "Data Analyst", score: 91 },
      { roleName: "Business Analyst", score: 85 },
      { roleName: "ML Engineer", score: 68 },
      { roleName: "Backend Developer", score: 55 },
    ],
    history: [
      { id: "h1", date: "4 days ago", role: "Data Analyst", score: 82, fileName: "Analyst_v1.pdf" },
      { id: "h2", date: "Today (Current)", role: "Data Analyst", score: 91, fileName: "Analyst_Final.pdf" },
    ],
  },
};
