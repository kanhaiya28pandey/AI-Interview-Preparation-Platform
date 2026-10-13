export interface MotivationalQuote {
  id: number;
  text: string;
  author: string;
  theme?: string;
}

export const motivationalQuotes: MotivationalQuote[] = [
  {
    id: 1,
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    theme: "coding"
  },
  {
    id: 2,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    theme: "growth mindset"
  },
  {
    id: 3,
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    theme: "coding"
  },
  {
    id: 4,
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    theme: "coding"
  },
  {
    id: 5,
    text: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    theme: "coding"
  },
  {
    id: 6,
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
    theme: "coding"
  },
  {
    id: 7,
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    theme: "coding"
  },
  {
    id: 8,
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    theme: "coding"
  },
  {
    id: 9,
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    theme: "coding"
  },
  {
    id: 10,
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    theme: "consistency"
  },
  {
    id: 11,
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    theme: "growth mindset"
  },
  {
    id: 12,
    text: "Continuous effort—not strength or intelligence—is the key to unlocking our potential.",
    author: "Winston Churchill",
    theme: "discipline"
  },
  {
    id: 13,
    text: "An interview is not an interrogation; it is a conversation between future colleagues.",
    author: "AI Interview Prep",
    theme: "confidence in interviews"
  },
  {
    id: 14,
    text: "Every rejected interview is a free consultation on what to improve next.",
    author: "AI Interview Prep",
    theme: "learning from failure"
  },
  {
    id: 15,
    text: "Confusion is the sweat of learning. Embrace the bugs.",
    author: "AI Interview Prep",
    theme: "growth mindset"
  },
  {
    id: 16,
    text: "You don't need to know every algorithm. You just need the discipline to master one pattern at a time.",
    author: "AI Interview Prep",
    theme: "discipline"
  },
  {
    id: 17,
    text: "Consistency beats intensity. One problem solved today is worth ten crammed tomorrow.",
    author: "AI Interview Prep",
    theme: "consistency"
  },
  {
    id: 18,
    text: "Confidence comes not from always being right, but from not fearing to be wrong.",
    author: "Peter T. McIntyre",
    theme: "confidence in interviews"
  },
  {
    id: 19,
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    theme: "consistency"
  },
  {
    id: 20,
    text: "It is not that I'm so smart. But I stay with the questions much longer.",
    author: "Albert Einstein",
    theme: "growth mindset"
  },
  {
    id: 21,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    theme: "learning from failure"
  },
  {
    id: 22,
    text: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
    theme: "learning from failure"
  },
  {
    id: 23,
    text: "Debugging is twice as hard as writing the code in the first place.",
    author: "Brian W. Kernighan",
    theme: "coding"
  },
  {
    id: 24,
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
    theme: "confidence in interviews"
  },
  {
    id: 25,
    text: "Great code is like poetry: concise, purposeful, and elegant.",
    author: "AI Interview Prep",
    theme: "coding"
  },
  {
    id: 26,
    text: "Before you optimize the time complexity, make sure your brute force actually solves the problem.",
    author: "AI Interview Prep",
    theme: "coding"
  },
  {
    id: 27,
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    theme: "discipline"
  },
  {
    id: 28,
    text: "Doubt kills more dreams than failure ever will.",
    author: "Suzy Kassem",
    theme: "confidence in interviews"
  },
  {
    id: 29,
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    theme: "consistency"
  },
  {
    id: 30,
    text: "Your dream company is looking for problem solvers, not memorizers.",
    author: "AI Interview Prep",
    theme: "confidence in interviews"
  },
  {
    id: 31,
    text: "Don't measure yourself by where you started; measure yourself by how much you learned this week.",
    author: "AI Interview Prep",
    theme: "growth mindset"
  },
  {
    id: 32,
    text: "Clean code always looks like it was written by someone who cares.",
    author: "Robert C. Martin",
    theme: "coding"
  },
  {
    id: 33,
    text: "Walking on water and developing software from a specification are easy if both are frozen.",
    author: "Edward V. Berard",
    theme: "coding"
  },
  {
    id: 34,
    text: "It always seems impossible until it is done.",
    author: "Nelson Mandela",
    theme: "learning from failure"
  },
  {
    id: 35,
    text: "Stay curious, stay humble, and keep refactoring your mindset.",
    author: "AI Interview Prep",
    theme: "growth mindset"
  },
  {
    id: 36,
    text: "Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    theme: "coding"
  },
  {
    id: 37,
    text: "In interviews, communicating your thought process is just as important as the code you write.",
    author: "AI Interview Prep",
    theme: "confidence in interviews"
  },
  {
    id: 38,
    text: "Hard problems don't become easy overnight; you just become stronger by wrestling with them.",
    author: "AI Interview Prep",
    theme: "discipline"
  },
  {
    id: 39,
    text: "Perseverance is failing 19 times and succeeding the 20th.",
    author: "Julie Andrews",
    theme: "learning from failure"
  },
  {
    id: 40,
    text: "The master has failed more times than the beginner has even tried.",
    author: "Stephen McCranie",
    theme: "learning from failure"
  },
  {
    id: 41,
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    theme: "confidence in interviews"
  },
  {
    id: 42,
    text: "Every master of data structures started by struggling with their first linked list.",
    author: "AI Interview Prep",
    theme: "growth mindset"
  },
  {
    id: 43,
    text: "Opportunities don't happen. You create them through preparation.",
    author: "Chris Grosser",
    theme: "discipline"
  },
  {
    id: 44,
    text: "Treat every coding test as a stepping stone, never a verdict on your intelligence.",
    author: "AI Interview Prep",
    theme: "growth mindset"
  }
];

export default motivationalQuotes;
