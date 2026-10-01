export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  isCurrentlyStudying: boolean;
  grade: string;
  coursework: string[];
  yearSemester?: string;
}

export interface SchoolEducation {
  board10th: string;
  school10th: string;
  year10th: string;
  percentage10th: string;
  board12th: string;
  school12th: string;
  year12th: string;
  percentage12th: string;
}

export interface SkillItem {
  name: string;
  category: "Technical" | "Tools" | "Soft Skills";
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface WorkExperienceEntry {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  techStack: string[];
  description: string;
  link: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  dateIssued: string;
  credentialUrl: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  preferredName?: string;
  email: string;
  role: string;
  avatar: string;
  isCustomAvatar: boolean;
  photoChecklist: {
    clearFace: boolean;
    plainBackground: boolean;
    noGlasses: boolean;
    goodLighting: boolean;
  };
  headline: string;
  bio: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  location: string;
  languages: string[];
  college: string;
  graduationYear: string;
  degree: string;
  educationEntries: EducationEntry[];
  schoolEducation: SchoolEducation;
  skillsList: SkillItem[];
  skills: string[];
  workExperience: WorkExperienceEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  targetRoles: string[];
  preferredLocation: string;
  openToRelocation: boolean;
  employmentType: "Full-Time" | "Internship" | "Both";
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  codingPlatformHandle?: string;
  resumeUrl?: string;
  onboardingComplete: boolean;
  verificationStatus?: "Pending Verification" | "Verified" | "Rejected" | "Resubmission Required" | "Unverified";
  verificationReason?: string;
  verificationId?: string;
  updatedAt?: string;
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
  preferredName: "Kanhaiya",
  email: "student@srmist.edu.in",
  role: "STUDENT",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  isCustomAvatar: true,
  photoChecklist: {
    clearFace: true,
    plainBackground: true,
    noGlasses: true,
    goodLighting: true,
  },
  headline: "Aspiring Full Stack Engineer | MCA / B.Tech CS Student",
  bio: "Passionate Computer Science student specializing in React, TypeScript, Spring Boot, microservices architecture, and distributed web applications.",
  phone: "+91 98765 43210",
  dateOfBirth: "2003-08-15",
  gender: "Male",
  location: "Chennai, Tamil Nadu, India",
  languages: ["English", "Hindi", "Tamil"],
  college: "SRM Institute of Science and Technology",
  graduationYear: "2026",
  degree: "B.Tech Computer Science and Engineering",
  educationEntries: [
    {
      id: "edu-1",
      degree: "B.Tech Computer Science and Engineering",
      institution: "SRM Institute of Science and Technology",
      fieldOfStudy: "Computer Science & Engineering",
      startYear: "2022",
      endYear: "2026",
      isCurrentlyStudying: true,
      grade: "8.85 / 10 CGPA",
      coursework: ["Data Structures & Algorithms", "Database Management", "Operating Systems", "Web Technologies", "Distributed Systems"],
    },
  ],
  schoolEducation: {
    board10th: "CBSE",
    school10th: "Delhi Public School",
    year10th: "2020",
    percentage10th: "94.2%",
    board12th: "CBSE",
    school12th: "Delhi Public School",
    year12th: "2022",
    percentage12th: "92.8%",
  },
  skillsList: [
    { name: "React", category: "Technical", proficiency: "Advanced" },
    { name: "TypeScript", category: "Technical", proficiency: "Advanced" },
    { name: "Node.js", category: "Technical", proficiency: "Intermediate" },
    { name: "Spring Boot", category: "Technical", proficiency: "Intermediate" },
    { name: "Tailwind CSS", category: "Technical", proficiency: "Expert" },
    { name: "Git & GitHub", category: "Tools", proficiency: "Advanced" },
    { name: "Docker", category: "Tools", proficiency: "Intermediate" },
    { name: "Problem Solving", category: "Soft Skills", proficiency: "Advanced" },
    { name: "Team Communication", category: "Soft Skills", proficiency: "Expert" },
  ],
  skills: ["React", "TypeScript", "Node.js", "Spring Boot", "Tailwind CSS", "Git & GitHub", "Docker"],
  workExperience: [
    {
      id: "exp-1",
      role: "Frontend Engineer Intern",
      company: "TechPulse Solutions",
      duration: "May 2025 - Aug 2025",
      description: "Developed interactive dashboards using React, TypeScript, and Tailwind CSS. Reduced page load times by 30%.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "AI Interview Preparation Platform",
      techStack: ["React", "Vite", "TypeScript", "Tailwind CSS", "Spring Boot"],
      description: "Full-stack web application offering real-time AI mock interviews, coding practice, and ATS resume analysis.",
      link: "https://github.com/kanhaiya28pandey/AI-Interview-Preparation-Platform",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Meta Frontend Developer Professional Certificate",
      issuer: "Coursera / Meta",
      dateIssued: "2025",
      credentialUrl: "https://coursera.org/verify/meta-frontend",
    },
  ],
  targetRoles: ["Frontend Developer", "Full Stack Developer", "Backend Developer"],
  preferredLocation: "Bengaluru, Chennai, Hyderabad",
  openToRelocation: true,
  employmentType: "Both",
  githubUrl: "https://github.com/kanhaiya28pandey",
  linkedinUrl: "https://linkedin.com/in/kanhaiya-pandey",
  portfolioUrl: "https://kanhaiyapandey.dev",
  codingPlatformHandle: "kanhaiya_coder",
  resumeUrl: "Resume_Kanhaiya_Pandey.pdf",
  onboardingComplete: true,
  updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(), // 4 hours ago
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

export function getProfileVerdict(score: number): { label: "Incomplete" | "Good" | "Great" | "Excellent"; colorClass: string; hex: string } {
  if (score >= 90) return { label: "Excellent", colorClass: "text-[#4ade80]", hex: "#4ade80" };
  if (score >= 75) return { label: "Great", colorClass: "text-[#22d3ee]", hex: "#22d3ee" };
  if (score >= 40) return { label: "Good", colorClass: "text-[#f59e0b]", hex: "#f59e0b" };
  return { label: "Incomplete", colorClass: "text-[#f2867b]", hex: "#f2867b" };
}

export function getProfileNudge(profile: Partial<UserProfile>): string {
  if (!profile) return "Complete your profile details.";
  if (!profile.avatar || !profile.isCustomAvatar) return "Upload a professional profile photo.";
  if (!profile.headline || profile.headline.trim().length === 0) return "Add a professional headline/tagline.";
  if (!profile.bio || profile.bio.trim().length < 15) return "Add a brief bio about your career goals.";
  if (!profile.educationEntries || profile.educationEntries.length === 0) return "Add your college degree details.";
  if (!profile.skillsList || profile.skillsList.length < 3) return "Add 3 or more technical & soft skills.";
  if (!profile.targetRoles || profile.targetRoles.length === 0) return "Select your target placement job roles.";
  if (!profile.linkedinUrl || profile.linkedinUrl.trim().length === 0) return "Add your LinkedIn or GitHub profile link.";
  return "Profile is 100% complete and recruiter-ready!";
}

export const calculateProfileCompletion = (profile: Partial<UserProfile>): number => {
  let score = 0;

  // Section 1: Photo & Checklist (20%)
  if (profile.isCustomAvatar || (profile.avatar && !profile.avatar.includes("default"))) score += 10;
  const checklistCount = profile.photoChecklist
    ? Object.values(profile.photoChecklist).filter(Boolean).length
    : 0;
  if (checklistCount >= 2) score += 10;

  // Section 2: Personal Info (20%)
  if (profile.headline && profile.headline.trim().length > 0) score += 5;
  if (profile.bio && profile.bio.trim().length >= 15) score += 5;
  if (profile.location && profile.location.trim().length > 0) score += 4;
  if (profile.phone && profile.phone.trim().length > 0) score += 3;
  if (profile.languages && profile.languages.length > 0) score += 3;

  // Section 3: Education (20%)
  if (profile.educationEntries && profile.educationEntries.length > 0) score += 15;
  if (
    profile.schoolEducation &&
    (profile.schoolEducation.board10th || profile.schoolEducation.board12th)
  )
    score += 5;

  // Section 4: Skills & Experience (20%)
  const skillsCount = (profile.skillsList && profile.skillsList.length) || (profile.skills && profile.skills.length) || 0;
  if (skillsCount >= 3) score += 10;
  if ((profile.projects && profile.projects.length > 0) || (profile.workExperience && profile.workExperience.length > 0)) score += 5;
  if (profile.certifications && profile.certifications.length > 0) score += 5;

  // Section 5: Preferences & Links (20%)
  if (profile.targetRoles && profile.targetRoles.length > 0) score += 8;
  if (profile.preferredLocation && profile.preferredLocation.trim().length > 0) score += 4;
  if (
    (profile.linkedinUrl && profile.linkedinUrl.trim().length > 0) ||
    (profile.githubUrl && profile.githubUrl.trim().length > 0)
  )
    score += 8;

  return Math.min(100, score);
};
