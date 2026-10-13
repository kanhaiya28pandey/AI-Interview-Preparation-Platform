export interface MotivationalQuote {
  id: number;
  text: string;
  author: string;
  category: "Coding" | "Consistency" | "Discipline" | "Confidence" | "Growth" | "Perseverance" | "Success" | "Focus" | "Interviews";
  theme?: string; // Backwards compatibility
}

export const motivationalQuotes: MotivationalQuote[] = [
  // --- Existing Quotes (Preserving IDs 1-40 for user favorites) ---
  { id: 1, text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "Coding", theme: "Coding" },
  { id: 2, text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Growth", theme: "Growth" },
  { id: 3, text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "Coding", theme: "Coding" },
  { id: 4, text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", category: "Coding", theme: "Coding" },
  { id: 5, text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra", category: "Coding", theme: "Coding" },
  { id: 6, text: "The best error message is the one that never shows up.", author: "Thomas Fuchs", category: "Coding", theme: "Coding" },
  { id: 7, text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House", category: "Coding", theme: "Coding" },
  { id: 8, text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", category: "Coding", theme: "Coding" },
  { id: 9, text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "Coding", theme: "Coding" },
  { id: 10, text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde", category: "Growth", theme: "Growth" },
  { id: 11, text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein", category: "Perseverance", theme: "Perseverance" },
  { id: 12, text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", category: "Consistency", theme: "Consistency" },
  { id: 13, text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "Discipline", theme: "Discipline" },
  { id: 14, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Confidence", theme: "Confidence" },
  { id: 15, text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Consistency", theme: "Consistency" },
  { id: 16, text: "Quality is not an act, it is a habit.", author: "Aristotle", category: "Discipline", theme: "Discipline" },
  { id: 17, text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "Consistency", theme: "Consistency" },
  { id: 18, text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "Success", theme: "Success" },
  { id: 19, text: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford", category: "Growth", theme: "Growth" },
  { id: 20, text: "Confidence comes not from always being right, but from not fearing to be wrong.", author: "Peter T. McIntyre", category: "Confidence", theme: "Confidence" },
  { id: 21, text: "Clean code always looks like it was written by someone who cares.", author: "Robert C. Martin", category: "Coding", theme: "Coding" },
  { id: 22, text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Perseverance", theme: "Perseverance" },
  { id: 23, text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", category: "Focus", theme: "Focus" },
  { id: 24, text: "Energy and persistence conquer all things.", author: "Benjamin Franklin", category: "Perseverance", theme: "Perseverance" },
  { id: 25, text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "Perseverance", theme: "Perseverance" },
  { id: 26, text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", category: "Discipline", theme: "Discipline" },
  { id: 27, text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius", category: "Consistency", theme: "Consistency" },
  { id: 28, text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "Discipline", theme: "Discipline" },
  { id: 29, text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "Confidence", theme: "Confidence" },
  { id: 30, text: "Premature optimization is the root of all evil in programming.", author: "Donald Knuth", category: "Coding", theme: "Coding" },
  { id: 31, text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison", category: "Perseverance", theme: "Perseverance" },
  { id: 32, text: "Focus is a muscle. Practice saying no to distractions.", author: "AI Interview Prep", category: "Focus", theme: "Focus" },
  { id: 33, text: "Your only competition in the placement hall is your past self.", author: "AI Interview Prep", category: "Confidence", theme: "Confidence" },
  { id: 34, text: "Debug with curiosity, not frustration.", author: "AI Interview Prep", category: "Coding", theme: "Coding" },
  { id: 35, text: "One solved problem today is better than twenty planned for tomorrow.", author: "AI Interview Prep", category: "Consistency", theme: "Consistency" },
  { id: 36, text: "An interview is not an interrogation; it's a technical conversation.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 37, text: "The optimal time complexity begins with clear thought.", author: "AI Interview Prep", category: "Coding", theme: "Coding" },
  { id: 38, text: "Mock interviews turn nervous energy into structured reasoning.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 39, text: "Every rejected resume is feedback pointing to the next keyword to master.", author: "AI Interview Prep", category: "Growth", theme: "Growth" },
  { id: 40, text: "Master the edge cases in practice, and you'll shine in the live contest.", author: "AI Interview Prep", category: "Coding", theme: "Coding" },

  // --- Quotes 41 to 125 (Expanded categories & student-tailored wisdom) ---
  // Category: Coding & Algorithms
  { id: 41, text: "Any fool can write code that a computer understands. Good programmers write code humans understand.", author: "Martin Fowler", category: "Coding", theme: "Coding" },
  { id: 42, text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson", category: "Coding", theme: "Coding" },
  { id: 43, text: "Bad programmers worry about code. Good programmers worry about data structures.", author: "Linus Torvalds", category: "Coding", theme: "Coding" },
  { id: 44, text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan", category: "Coding", theme: "Coding" },
  { id: 45, text: "The most important property of a program is whether it accomplishes the intention of its user.", author: "C.A.R. Hoare", category: "Coding", theme: "Coding" },
  { id: 46, text: "When solving a problem on a whiteboard, speak your invariants before writing loops.", author: "AI Interview Prep", category: "Coding", theme: "Coding" },
  { id: 47, text: "A brute force solution today is the foundation for an optimal two-pointer tomorrow.", author: "AI Interview Prep", category: "Coding", theme: "Coding" },
  { id: 48, text: "Time complexity isn't just theory; it's what separates production software from a freeze.", author: "AI Interview Prep", category: "Coding", theme: "Coding" },
  { id: 49, text: "Don't fear dynamic programming. Break the state space down to simple base cases.", author: "AI Interview Prep", category: "Coding", theme: "Coding" },
  { id: 50, text: "A clean variable name is worth a hundred lines of comments in an interview.", author: "AI Interview Prep", category: "Coding", theme: "Coding" },

  // Category: Interviews & Placement Prep
  { id: 51, text: "Interviewers look for problem solvers, not walking compilers.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 52, text: "When stuck in a mock round, vocalize your thoughts. Communication reveals intuition.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 53, text: "The STAR method turns casual stories into compelling proof of impact.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 54, text: "Recruiters test how you handle failure as much as how you celebrate success.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 55, text: "A strong candidate asks questions that reveal understanding of system trade-offs.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 56, text: "Never guess in an interview. State your assumptions, test them, and verify.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 57, text: "Treat behavioral questions with the same architectural rigor as system design.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 58, text: "Your resume gets you through the screening; your structured mindset lands the offer.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 59, text: "When asked about a project, focus on decisions, metrics, and lessons learned.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },
  { id: 60, text: "Every mock round reduces the adrenaline spike of the real technical screening.", author: "AI Interview Prep", category: "Interviews", theme: "Interviews" },

  // Category: Consistency & Daily Routine
  { id: 61, text: "We do not rise to the level of our expectations, we fall to the level of our training.", author: "Archilochus", category: "Consistency", theme: "Consistency" },
  { id: 62, text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Consistency", theme: "Consistency" },
  { id: 63, text: "Long-term consistency trumps short-term intensity every single time.", author: "Bruce Lee", category: "Consistency", theme: "Consistency" },
  { id: 64, text: "Drip by drip the pitcher fills.", author: "Buddha", category: "Consistency", theme: "Consistency" },
  { id: 65, text: "Two DSA problems every morning build more confidence than ten on Sunday night.", author: "AI Interview Prep", category: "Consistency", theme: "Consistency" },
  { id: 66, text: "Consistency transforms average talent into extraordinary technical capability.", author: "AI Interview Prep", category: "Consistency", theme: "Consistency" },
  { id: 67, text: "Show up to your IDE even when inspiration hasn't.", author: "AI Interview Prep", category: "Consistency", theme: "Consistency" },
  { id: 68, text: "The compound interest of daily problem solving creates placement champions.", author: "AI Interview Prep", category: "Consistency", theme: "Consistency" },
  { id: 69, text: "Maintain your day streak. Momentum is the programmer's greatest ally.", author: "AI Interview Prep", category: "Consistency", theme: "Consistency" },
  { id: 70, text: "Small commits every day build scalable careers.", author: "AI Interview Prep", category: "Consistency", theme: "Consistency" },

  // Category: Discipline & Habits
  { id: 71, text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "Discipline", theme: "Discipline" },
  { id: 72, text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "Discipline", theme: "Discipline" },
  { id: 73, text: "Self-discipline begins with the mastery of your thoughts.", author: "Napoleon Hill", category: "Discipline", theme: "Discipline" },
  { id: 74, text: "The cost of discipline is always less than the price of regret.", author: "Nido Qubein", category: "Discipline", theme: "Discipline" },
  { id: 75, text: "Discipline turns 2:00 AM exam stress into confident 9:00 AM interview execution.", author: "AI Interview Prep", category: "Discipline", theme: "Discipline" },
  { id: 76, text: "Shut down social media for ninety minutes. Your dream company deserves deep work.", author: "AI Interview Prep", category: "Discipline", theme: "Discipline" },
  { id: 77, text: "The hardest line of code to write is the one when you feel tired. Push through.", author: "AI Interview Prep", category: "Discipline", theme: "Discipline" },
  { id: 78, text: "Discipline is practicing edge cases even when the sample tests already pass.", author: "AI Interview Prep", category: "Discipline", theme: "Discipline" },
  { id: 79, text: "Create a study ritual. When your environment cues focus, code flows effortlessly.", author: "AI Interview Prep", category: "Discipline", theme: "Discipline" },
  { id: 80, text: "Your daily discipline today writes the offer letter you unwrap tomorrow.", author: "AI Interview Prep", category: "Discipline", theme: "Discipline" },

  // Category: Confidence & Self-Belief
  { id: 81, text: "Whether you think you can or think you can't, you are right.", author: "Henry Ford", category: "Confidence", theme: "Confidence" },
  { id: 82, text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt", category: "Confidence", theme: "Confidence" },
  { id: 83, text: "With realization of one's own potential and self-confidence, one can build a better world.", author: "Dalai Lama", category: "Confidence", theme: "Confidence" },
  { id: 84, text: "Imposter syndrome is just proof that you are operating at the edge of your growth.", author: "AI Interview Prep", category: "Confidence", theme: "Confidence" },
  { id: 85, text: "You belong in the tech room just as much as anyone who started earlier.", author: "AI Interview Prep", category: "Confidence", theme: "Confidence" },
  { id: 86, text: "Confidence is quiet; insecurity is loud. Know your foundational concepts deeply.", author: "AI Interview Prep", category: "Confidence", theme: "Confidence" },
  { id: 87, text: "Walk into every technical round knowing you prepared with integrity.", author: "AI Interview Prep", category: "Confidence", theme: "Confidence" },
  { id: 88, text: "Trust the hours you spent grinding LeetCode when the timer starts ticking.", author: "AI Interview Prep", category: "Confidence", theme: "Confidence" },
  { id: 89, text: "You don't need to know every framework; you need confidence in how you learn.", author: "AI Interview Prep", category: "Confidence", theme: "Confidence" },
  { id: 90, text: "Your unique projects set you apart far more than a GPA ever could.", author: "AI Interview Prep", category: "Confidence", theme: "Confidence" },

  // Category: Growth & Learning Mindset
  { id: 91, text: "Anyone who has never made a mistake has never tried anything new.", author: "Albert Einstein", category: "Growth", theme: "Growth" },
  { id: 92, text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "Growth", theme: "Growth" },
  { id: 93, text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert", category: "Growth", theme: "Growth" },
  { id: 94, text: "Every expert was once a beginner who refused to quit.", author: "Helen Hayes", category: "Growth", theme: "Growth" },
  { id: 95, text: "A bug is not a defeat; it's an invitation to understand the computer's logic deeper.", author: "AI Interview Prep", category: "Growth", theme: "Growth" },
  { id: 96, text: "Celebrate when a hard problem takes hours. That friction is where synapses form.", author: "AI Interview Prep", category: "Growth", theme: "Growth" },
  { id: 97, text: "Feedback from an interviewer is free coaching for your next round.", author: "AI Interview Prep", category: "Growth", theme: "Growth" },
  { id: 98, text: "Growth mindset means replacing 'I can't solve this' with 'I can't solve this yet.'", author: "AI Interview Prep", category: "Growth", theme: "Growth" },
  { id: 99, text: "Read the editorial only after exhausting your own whiteboard sketches.", author: "AI Interview Prep", category: "Growth", theme: "Growth" },
  { id: 100, text: "The greatest engineers are the ones who stay students forever.", author: "AI Interview Prep", category: "Growth", theme: "Growth" },

  // Category: Perseverance & Resilience
  { id: 101, text: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "Perseverance", theme: "Perseverance" },
  { id: 102, text: "When you feel like quitting, remember why you started.", author: "Unknown", category: "Perseverance", theme: "Perseverance" },
  { id: 103, text: "Tough times never last, but tough people do.", author: "Robert H. Schuller", category: "Perseverance", theme: "Perseverance" },
  { id: 104, text: "A river cuts through rock not because of its power, but because of its persistence.", author: "Jim Watkins", category: "Perseverance", theme: "Perseverance" },
  { id: 105, text: "Rejection letters are merely redirections toward the team where you truly belong.", author: "AI Interview Prep", category: "Perseverance", theme: "Perseverance" },
  { id: 106, text: "The hardest test passes when you give yourself permission to try one more time.", author: "AI Interview Prep", category: "Perseverance", theme: "Perseverance" },
  { id: 107, text: "Placement season is a marathon of mental endurance, not a 100-meter sprint.", author: "AI Interview Prep", category: "Perseverance", theme: "Perseverance" },
  { id: 108, text: "When your code throws a Runtime Error on test case 49, smile and inspect your bounds.", author: "AI Interview Prep", category: "Perseverance", theme: "Perseverance" },
  { id: 109, text: "Ten companies may say no before the eleventh offers your dream SDE role.", author: "AI Interview Prep", category: "Perseverance", theme: "Perseverance" },
  { id: 110, text: "Resilience is the strongest skill you will ever put on your engineering resume.", author: "AI Interview Prep", category: "Perseverance", theme: "Perseverance" },

  // Category: Success & Achievement
  { id: 111, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Success", theme: "Success" },
  { id: 112, text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Success", theme: "Success" },
  { id: 113, text: "Opportunities don't happen. You create them.", author: "Chris Grosser", category: "Success", theme: "Success" },
  { id: 114, text: "Success isn't about luck; it's about preparation meeting the right opportunity.", author: "Seneca", category: "Success", theme: "Success" },
  { id: 115, text: "Your dream tech package is built one optimized loop at a time.", author: "AI Interview Prep", category: "Success", theme: "Success" },
  { id: 116, text: "True success is looking at a complex distributed system and knowing how to scale it.", author: "AI Interview Prep", category: "Success", theme: "Success" },
  { id: 117, text: "The day you sign your placement offer, thank the late nights you spent coding.", author: "AI Interview Prep", category: "Success", theme: "Success" },

  // Category: Focus & Priority
  { id: 118, text: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell", category: "Focus", theme: "Focus" },
  { id: 119, text: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.", author: "Leo Babauta", category: "Focus", theme: "Focus" },
  { id: 120, text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "Focus", theme: "Focus" },
  { id: 121, text: "Master one language and its core libraries before juggling five others.", author: "AI Interview Prep", category: "Focus", theme: "Focus" },
  { id: 122, text: "When preparing for interviews, depth in core topics beats surface skimming.", author: "AI Interview Prep", category: "Focus", theme: "Focus" },
  { id: 123, text: "Turn off notifications during mock tests. True engineering requires unbroken attention.", author: "AI Interview Prep", category: "Focus", theme: "Focus" },
  { id: 124, text: "Focus on the problem before you reach for the keyboard.", author: "AI Interview Prep", category: "Focus", theme: "Focus" },
  { id: 125, text: "Your daily focus determines your placement trajectory. Guard it fiercely.", author: "AI Interview Prep", category: "Focus", theme: "Focus" },
];

/**
 * Deterministically pick today's featured quote based on day-of-year index
 */
export function getTodaysQuote(): MotivationalQuote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % motivationalQuotes.length;
  return motivationalQuotes[index];
}
