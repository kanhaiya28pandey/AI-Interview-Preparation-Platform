export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio: string;
  college: string;
  graduationYear: string;
  degree: string;
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  targetRoles: string[];
  stats: {
    totalPracticeSessions: number;
    codingProblemsSolved: number;
    mockInterviewsCompleted: number;
    quizzesCompleted: number;
    overallRating: number;
    currentStreak: number;
    totalXP: number;
  };
}

export const mockUserProfile: UserProfile = {
  userId: "usr-student-01",
  name: "Kanhaiya Pandey",
  email: "student@srmist.edu.in",
  role: "STUDENT",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  bio: "Passionate Computer Science student specializing in Full Stack Web Development, distributed systems, and AI-driven mock interviews.",
  college: "SRM Institute of Science and Technology",
  graduationYear: "2026",
  degree: "B.Tech Computer Science and Engineering",
  skills: ["React", "TypeScript", "Node.js", "Spring Boot", "MongoDB", "Tailwind CSS", "Data Structures"],
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  targetRoles: ["Full Stack Engineer", "Frontend Developer", "Software Development Engineer (SDE)"],
  stats: {
    totalPracticeSessions: 42,
    codingProblemsSolved: 95,
    mockInterviewsCompleted: 11,
    quizzesCompleted: 18,
    overallRating: 88,
    currentStreak: 12,
    totalXP: 2240,
  },
};
