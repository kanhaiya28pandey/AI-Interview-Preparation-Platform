export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpfulCount: number;
  unhelpfulCount: number;
  tags: string[];
}

export interface FAQCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  items: FAQItem[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "New user orientation, platform navigation, and initial setup.",
    iconName: "Rocket",
    items: [
      {
        id: "faq-gs-1",
        category: "Getting Started",
        question: "How do I complete my student profile to reach 100%?",
        answer:
          "To reach 100% completion, complete all 5 profile weighting criteria: upload a custom profile photo (20%), enter your headline and bio (20%), add degree and school records (20%), add at least 3 skills and 1 project (20%), and set target placement roles + LinkedIn URL (20%). Use the interactive Resume Wizard at /onboarding for a step-by-step walkthrough.",
        helpfulCount: 42,
        unhelpfulCount: 2,
        tags: ["profile", "completion", "onboarding", "wizard"],
      },
      {
        id: "faq-gs-2",
        category: "Getting Started",
        question: "What is the recommended daily practice schedule for placement prep?",
        answer:
          "We recommend solving 2 algorithm benchmarks in the Coding Arena, taking 1 MCQ quiz, and completing at least 1 AI Mock Interview round every 2 days to maintain your daily streak and top 5% campus standing.",
        helpfulCount: 38,
        unhelpfulCount: 1,
        tags: ["schedule", "streak", "practice", "routine"],
      },
      {
        id: "faq-gs-3",
        category: "Getting Started",
        question: "How do I toggle between Dark and Light visual themes?",
        answer:
          "Click the Sun/Moon theme toggle icon in the topbar (or press Ctrl+K and type 'theme'). The app immediately transitions all surface tokens, charts, and glow effects to match your system or chosen preference.",
        helpfulCount: 29,
        unhelpfulCount: 0,
        tags: ["theme", "dark mode", "light mode", "appearance"],
      },
      {
        id: "faq-gs-4",
        category: "Getting Started",
        question: "Is the platform fully responsive on mobile devices?",
        answer:
          "Yes! The entire application is built for 360px+ mobile screens up to 4K displays. Use the mobile menu drawer in the topbar to navigate between Practice, Coding, Resume Analyzer, and Settings.",
        helpfulCount: 31,
        unhelpfulCount: 3,
        tags: ["mobile", "responsive", "phone", "touch"],
      },
    ],
  },
  {
    id: "account-profile",
    title: "Account & Profile",
    description: "Managing personal information, credentials, and recruiter visibility.",
    iconName: "User",
    items: [
      {
        id: "faq-ap-1",
        category: "Account & Profile",
        question: "Why is my profile completion percentage not updating after editing?",
        answer:
          "Make sure you click 'Save Changes' at the top-right of each edit section in /profile. The progress ring updates dynamically upon save. If it doesn't change, verify that required fields like Bio (min 15 chars) or Skills (min 3 tags) meet minimum criteria.",
        helpfulCount: 45,
        unhelpfulCount: 4,
        tags: ["profile", "save", "completion", "edit"],
      },
      {
        id: "faq-ap-2",
        category: "Account & Profile",
        question: "How does the Public Recruiter View work?",
        answer:
          "Clicking 'Public Recruiter View' on /profile opens a verified candidate preview modal simulating what hiring managers and campus recruiters see when reviewing your profile, certifications, and benchmark ratings.",
        helpfulCount: 27,
        unhelpfulCount: 1,
        tags: ["recruiter", "preview", "public profile", "verification"],
      },
      {
        id: "faq-ap-3",
        category: "Account & Profile",
        question: "How do I reset or update my account password?",
        answer:
          "Go to /settings or log out and click 'Forgot Password' on the login screen. You will receive an instant password reset token link.",
        helpfulCount: 22,
        unhelpfulCount: 2,
        tags: ["password", "reset", "security", "login"],
      },
      {
        id: "faq-ap-4",
        category: "Account & Profile",
        question: "How are initial avatar letters generated when no photo is uploaded?",
        answer:
          "If no custom avatar photo is uploaded, the avatar completion ring automatically generates high-contrast initials from your full name (e.g., 'KP' for Kanhaiya Pandey).",
        helpfulCount: 19,
        unhelpfulCount: 0,
        tags: ["avatar", "photo", "initials", "ring"],
      },
    ],
  },
  {
    id: "practice-coding",
    title: "Practice & Coding",
    description: "Coding arena benchmarks, language runtimes, and memory profiling.",
    iconName: "Code2",
    items: [
      {
        id: "faq-pc-1",
        category: "Practice & Coding",
        question: "Why didn't my coding test score update on the leaderboard?",
        answer:
          "Leaderboard scores update when you click 'Submit Solution' and achieve an ACCEPTED status with 100% test case pass rate. Running test cases via 'Run Test' only validates sample cases without updating XP.",
        helpfulCount: 56,
        unhelpfulCount: 3,
        tags: ["coding", "submit", "leaderboard", "xp"],
      },
      {
        id: "faq-pc-2",
        category: "Practice & Coding",
        question: "Which programming languages are supported in the Coding Arena?",
        answer:
          "The Coding Arena supports JavaScript (Node 20), Python 3.12, Java 21, and C++ 20 with real-time syntax highlighting, custom test case input, and runtime execution profiling.",
        helpfulCount: 34,
        unhelpfulCount: 1,
        tags: ["languages", "python", "java", "cpp", "javascript"],
      },
      {
        id: "faq-pc-3",
        category: "Practice & Coding",
        question: "What should I do if the code editor hangs or fails to execute?",
        answer:
          "Check your internet connection and click the 'Reset Code' or language switch button. You can also run the System Check tool under Troubleshooting to verify browser local storage health.",
        helpfulCount: 28,
        unhelpfulCount: 2,
        tags: ["editor", "troubleshoot", "execution", "error"],
      },
      {
        id: "faq-pc-4",
        category: "Practice & Coding",
        question: "How are runtime speed and memory consumption measured?",
        answer:
          "Execution runtime is reported in milliseconds (ms) and memory footprint is measured in Megabytes (MB) based on simulated benchmark passes against hidden edge cases.",
        helpfulCount: 21,
        unhelpfulCount: 0,
        tags: ["runtime", "memory", "profiling", "benchmark"],
      },
    ],
  },
  {
    id: "mock-interviews",
    title: "Mock Interviews & Quizzes",
    description: "AI interview evaluations, voice simulation, and topic quizzes.",
    iconName: "Video",
    items: [
      {
        id: "faq-mi-1",
        category: "Mock Interviews & Quizzes",
        question: "How does the AI evaluate my mock interview responses?",
        answer:
          "The AI evaluator analyzes technical accuracy, communication clarity, problem-solving methodology, and key concept usage against ideal answer rubrics for your target role.",
        helpfulCount: 50,
        unhelpfulCount: 2,
        tags: ["ai", "interview", "evaluation", "scorecard"],
      },
      {
        id: "faq-mi-2",
        category: "Mock Interviews & Quizzes",
        question: "Can I simulate voice audio input during a mock interview?",
        answer:
          "Yes! Click 'Simulate Voice Input' in the interview room to activate the live audio waveform visualization and speak or auto-fill your candidate response.",
        helpfulCount: 33,
        unhelpfulCount: 1,
        tags: ["voice", "waveform", "mic", "speech"],
      },
      {
        id: "faq-mi-3",
        category: "Mock Interviews & Quizzes",
        question: "Are MCQ quiz scores stored in my performance trend graph?",
        answer:
          "Yes, completing MCQ quizzes increases your overall practice count and updates the performance trend chart on your student dashboard.",
        helpfulCount: 26,
        unhelpfulCount: 1,
        tags: ["quiz", "mcq", "dashboard", "trend"],
      },
      {
        id: "faq-mi-4",
        category: "Mock Interviews & Quizzes",
        question: "What happens if the interview timer runs out before I finish?",
        answer:
          "If the timer reaches 0:00, your current response is submitted automatically to the AI evaluator to generate your performance scorecard.",
        helpfulCount: 24,
        unhelpfulCount: 0,
        tags: ["timer", "timeout", "auto-submit"],
      },
    ],
  },
  {
    id: "resume-analyzer",
    title: "Resume Analyzer",
    description: "ATS score optimization, keyword matching, and PDF exports.",
    iconName: "FileText",
    items: [
      {
        id: "faq-ra-1",
        category: "Resume Analyzer",
        question: "How is my ATS match score calculated?",
        answer:
          "The ATS score (0-100) is a weighted calculation across 4 core dimensions: Formatting Readiness (25%), Keyword Match (35%), Action Verbs (20%), and Section Structure (20%).",
        helpfulCount: 64,
        unhelpfulCount: 3,
        tags: ["ats", "resume", "score", "weighting"],
      },
      {
        id: "faq-ra-2",
        category: "Resume Analyzer",
        question: "Which file formats are supported for resume analysis?",
        answer:
          "The Resume Analyzer supports PDF (.pdf) and Microsoft Word (.docx, .doc) files up to 5MB in size.",
        helpfulCount: 41,
        unhelpfulCount: 1,
        tags: ["pdf", "docx", "upload", "size limit"],
      },
      {
        id: "faq-ra-3",
        category: "Resume Analyzer",
        question: "How do I download a clean printable report of my ATS analysis?",
        answer:
          "Click the 'Download Report' button at the top-right of the results screen. This opens a print-optimized, clean stylesheet view ready to save as PDF.",
        helpfulCount: 37,
        unhelpfulCount: 0,
        tags: ["pdf", "report", "download", "print"],
      },
      {
        id: "faq-ra-4",
        category: "Resume Analyzer",
        question: "What are 'Missing Skill Gaps' and how do I address them?",
        answer:
          "Missing skill gaps represent industry-standard keywords for your target role that were not found in your resume. Click any skill chip for suggestions on where to incorporate it.",
        helpfulCount: 30,
        unhelpfulCount: 2,
        tags: ["skills", "gaps", "keywords", "missing"],
      },
    ],
  },
  {
    id: "leaderboard-scoring",
    title: "Leaderboard & Scoring",
    description: "XP calculations, campus rankings, and streak tracking.",
    iconName: "Trophy",
    items: [
      {
        id: "faq-ls-1",
        category: "Leaderboard & Scoring",
        question: "How are total XP points and daily streaks calculated?",
        answer:
          "XP is awarded for completing quizzes (+50 XP), coding benchmarks (+100 XP), and mock interviews (+150 XP). Logging in and completing 1 practice item daily extends your streak.",
        helpfulCount: 48,
        unhelpfulCount: 2,
        tags: ["xp", "streak", "leaderboard", "points"],
      },
      {
        id: "faq-ls-2",
        category: "Leaderboard & Scoring",
        question: "Why is my campus rank different from the overall leaderboard?",
        answer:
          "The overall leaderboard ranks all engineering students platform-wide, while the 'My Campus' filter scopes rankings specifically to students from your institution (e.g. SRM IST).",
        helpfulCount: 29,
        unhelpfulCount: 1,
        tags: ["campus", "filter", "rank", "srm"],
      },
      {
        id: "faq-ls-3",
        category: "Leaderboard & Scoring",
        question: "What are Verdict Headlines on my scorecard?",
        answer:
          "Verdict Headlines highlight your score using bold Fraunces typography and score-band colors (e.g., 'Your Profile is Excellent!'). Green = 90-100%, Cyan = 75-89%, Amber = 40-74%, Red = <40%.",
        helpfulCount: 23,
        unhelpfulCount: 0,
        tags: ["verdict", "headline", "color", "scorecard"],
      },
    ],
  },
  {
    id: "technical-issues",
    title: "Technical Issues & Diagnostics",
    description: "Browser compatibility, local storage, and client diagnostics.",
    iconName: "Wrench",
    items: [
      {
        id: "faq-ti-1",
        category: "Technical Issues",
        question: "The page looks misaligned or dark mode didn't toggle cleanly?",
        answer:
          "Try refreshing the browser page (Ctrl+F5 or Cmd+R) to clear cached CSS tokens. You can also run the System Check tool below to verify browser compatibility.",
        helpfulCount: 39,
        unhelpfulCount: 3,
        tags: ["css", "theme", "refresh", "cache"],
      },
      {
        id: "faq-ti-2",
        category: "Technical Issues",
        question: "How do I run a system check before submitting a support ticket?",
        answer:
          "Scroll down to the 'System Check' diagnostic panel on this Help page. It automatically checks browser type, online status, screen resolution, and local storage read/write access.",
        helpfulCount: 35,
        unhelpfulCount: 1,
        tags: ["system check", "diagnostic", "browser", "storage"],
      },
      {
        id: "faq-ti-3",
        category: "Technical Issues",
        question: "What keyboard shortcuts are available across the app?",
        answer:
          "Press Ctrl+K (or Cmd+K) to open the Command Palette from anywhere. Use Esc to close modals, Arrow keys for quizzes, and Ctrl+Enter to submit code in the editor.",
        helpfulCount: 31,
        unhelpfulCount: 0,
        tags: ["keyboard", "shortcuts", "command palette", "keys"],
      },
    ],
  },
];

export const ADMIN_FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-admin-1",
    category: "Admin Platform Operations",
    question: "How do I monitor platform-wide student ATS resume scores?",
    answer:
      "Go to /admin or /admin/reports to view aggregate student ATS score averages, top missing skill gaps across campuses, and target role distributions.",
    helpfulCount: 18,
    unhelpfulCount: 0,
    tags: ["admin", "ats", "analytics", "reports"],
  },
  {
    id: "faq-admin-2",
    category: "Admin Platform Operations",
    question: "How do I toggle between Student View and Admin Panel?",
    answer:
      "If you are logged in as an Admin user, click the 'Student View' / 'Admin Panel' pill button in the topbar to switch views instantly.",
    helpfulCount: 15,
    unhelpfulCount: 1,
    tags: ["admin", "switch", "role", "topbar"],
  },
  {
    id: "faq-admin-3",
    category: "Admin Platform Operations",
    question: "Where can I view submitted student support tickets?",
    answer:
      "Support tickets submitted by students are stored locally and accessible via the Support Ticket Management panel on the Admin Help Center.",
    helpfulCount: 12,
    unhelpfulCount: 0,
    tags: ["tickets", "support", "admin", "management"],
  },
];
