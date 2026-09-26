export interface QuizTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  questionCount: number;
  timeLimitMinutes: number;
  icon: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const mockQuizTopics: QuizTopic[] = [
  {
    id: "quiz-js",
    title: "JavaScript & ES6+ Fundamentals",
    description: "Test your knowledge of closures, prototypes, event loops, async/await, and modern ECMAScript features.",
    category: "Language",
    questionCount: 5,
    timeLimitMinutes: 10,
    icon: "FileCode",
  },
  {
    id: "quiz-dsa",
    title: "Data Structures & Time Complexity",
    description: "Questions covering Big-O analysis, HashTables, Trees, Heaps, and Graph algorithms.",
    category: "Algorithms",
    questionCount: 5,
    timeLimitMinutes: 10,
    icon: "Binary",
  },
  {
    id: "quiz-web",
    title: "Web Security & HTTP Protocols",
    description: "CORS, CSRF, XSS, OAuth 2.0, JWT, HTTPS TLS handshake, and header security.",
    category: "Security",
    questionCount: 5,
    timeLimitMinutes: 10,
    icon: "ShieldAlert",
  },
];

export const mockQuizQuestions: Record<string, QuizQuestion[]> = {
  "quiz-js": [
    {
      id: "q-1",
      question: "What will `console.log(typeof typeof 1)` output?",
      options: ["'number'", "'string'", "'undefined'", "'object'"],
      correctIndex: 1,
      explanation: "`typeof 1` returns `'number'`. `typeof 'number'` returns `'string'`.",
    },
    {
      id: "q-2",
      question: "Which of the following is true regarding `Promise.all` vs `Promise.allSettled`?",
      options: [
        "Promise.all rejects immediately if any promise rejects; Promise.allSettled waits for all promises to settle regardless of outcome.",
        "Promise.allSettled rejects as soon as one promise rejects.",
        "Both functions throw an unhandled exception on rejection.",
        "Promise.all returns an array of objects with status 'fulfilled' or 'rejected'.",
      ],
      correctIndex: 0,
      explanation: "`Promise.all` is fail-fast and rejects upon the first rejected promise, whereas `Promise.allSettled` waits for all promises to resolve or reject.",
    },
    {
      id: "q-3",
      question: "What is the primary benefit of using `WeakMap` over `Map` in JavaScript?",
      options: [
        "WeakMap allows primitive values as keys.",
        "WeakMap keys are weakly held, allowing garbage collection when no other references exist.",
        "WeakMap has faster iteration methods.",
        "WeakMap preserves insertion order guaranteed across execution contexts.",
      ],
      correctIndex: 1,
      explanation: "Keys in a `WeakMap` must be objects and are held weakly, preventing memory leaks if the key object is deleted elsewhere.",
    },
    {
      id: "q-4",
      question: "What does the `useCallback` hook return in React?",
      options: [
        "The evaluated result of the passed callback function.",
        "A memoized version of the callback function that only changes if dependencies change.",
        "A mutable ref object with a `.current` property.",
        "A DOM element reference bound to the current lifecycle.",
      ],
      correctIndex: 1,
      explanation: "`useCallback` returns a memoized function instance to prevent unnecessary sub-tree re-renders.",
    },
    {
      id: "q-5",
      question: "Which HTTP status code signifies that the server received a valid request but refuses to authorize it?",
      options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "400 Bad Request"],
      correctIndex: 1,
      explanation: "`403 Forbidden` indicates the server understood the request but client authentication/authorization is insufficient.",
    },
  ],
  "quiz-dsa": [
    {
      id: "qd-1",
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(N log N)", "O(N^2)", "O(N)", "O(log N)"],
      correctIndex: 1,
      explanation: "QuickSort exhibits O(N^2) worst-case time complexity when the pivot selection consistently chooses the largest or smallest element (e.g., sorted array with bad pivot).",
    },
  ],
  "quiz-web": [
    {
      id: "qw-1",
      question: "What header is primarily used to prevent Clickjacking attacks?",
      options: ["X-Frame-Options", "Content-Security-Policy", "Both A and B", "X-XSS-Protection"],
      correctIndex: 2,
      explanation: "Both `X-Frame-Options` and `Content-Security-Policy: frame-ancestors` prevent site embedding inside iframes.",
    },
  ],
};
