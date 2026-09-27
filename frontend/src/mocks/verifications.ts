export type VerificationStatus =
  | "Pending Verification"
  | "Verified"
  | "Rejected"
  | "Resubmission Required"
  | "Unverified";

export interface VerificationSubmission {
  verificationId: string;
  userId: string;
  studentName: string;
  email: string;
  collegeName: string;
  rollNumber: string;
  courseBranch: string;
  yearSemester: string;
  idCardFrontUrl: string;
  idCardBackUrl?: string;
  selfieUrl?: string;
  submittedAt: string;
  status: VerificationStatus;
  rejectionCategory?: string;
  rejectionNotes?: string;
  reviewedAt?: string;
}

export interface CollegeDomainInfo {
  domain: string;
  collegeName: string;
  shortCode: string;
}

export const KNOWN_COLLEGE_DOMAINS: CollegeDomainInfo[] = [
  { domain: "srmist.edu.in", collegeName: "SRM Institute of Science and Technology", shortCode: "SRMIST" },
  { domain: "vit.ac.in", collegeName: "Vellore Institute of Technology", shortCode: "VIT" },
  { domain: "bits-pilani.ac.in", collegeName: "BITS Pilani", shortCode: "BITS" },
  { domain: "iitd.ac.in", collegeName: "Indian Institute of Technology Delhi", shortCode: "IITD" },
  { domain: "iitb.ac.in", collegeName: "Indian Institute of Technology Bombay", shortCode: "IITB" },
  { domain: "nitt.edu", collegeName: "National Institute of Technology Tiruchirappalli", shortCode: "NITT" },
  { domain: "mit.edu", collegeName: "Massachusetts Institute of Technology", shortCode: "MIT" },
  { domain: "stanford.edu", collegeName: "Stanford University", shortCode: "STANFORD" },
  { domain: "du.ac.in", collegeName: "University of Delhi", shortCode: "DU" },
  { domain: "amity.edu", collegeName: "Amity University", shortCode: "AMITY" },
];

/**
 * Suggests college name based on email domain
 */
export function suggestCollegeFromEmail(email: string): string | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1].toLowerCase().trim();
  const match = KNOWN_COLLEGE_DOMAINS.find((item) => domain.endsWith(item.domain));
  if (match) return match.collegeName;

  // Generic heuristic for .edu or .ac.in emails
  if (domain.endsWith(".edu.in") || domain.endsWith(".ac.in")) {
    const mainPart = domain.split(".")[0];
    return mainPart.toUpperCase() + " College of Engineering";
  }
  return null;
}

/**
 * Checks if user's entered college matches their email domain
 */
export function validateCollegeDomainMatch(email: string, enteredCollege: string): { matches: boolean; suggested?: string } {
  const suggested = suggestCollegeFromEmail(email);
  if (!suggested) return { matches: true }; // No domain mapping constraint
  
  const normalizedEntered = enteredCollege.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedSuggested = suggested.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  const isMatch = normalizedEntered.includes(normalizedSuggested) || normalizedSuggested.includes(normalizedEntered);
  return { matches: isMatch, suggested };
}

export const INITIAL_MOCK_VERIFICATIONS: VerificationSubmission[] = [
  {
    verificationId: "VER-2026-00101",
    userId: "usr-student-01",
    studentName: "Kanhaiya Pandey",
    email: "student@srmist.edu.in",
    collegeName: "SRM Institute of Science and Technology",
    rollNumber: "RA2111003010452",
    courseBranch: "B.Tech Computer Science and Engineering",
    yearSemester: "Year 4 / Semester 7",
    idCardFrontUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
    selfieUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    submittedAt: "2026-09-26T10:15:00Z",
    status: "Verified",
    reviewedAt: "2026-09-26T11:30:00Z",
  },
  {
    verificationId: "VER-2026-00102",
    userId: "usr-student-02",
    studentName: "Rohan Sharma",
    email: "rohan.s@vit.ac.in",
    collegeName: "Vellore Institute of Technology",
    rollNumber: "21BCE0491",
    courseBranch: "B.Tech Information Technology",
    yearSemester: "Year 3 / Semester 6",
    idCardFrontUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    submittedAt: "2026-09-26T18:40:00Z",
    status: "Pending Verification",
  },
  {
    verificationId: "VER-2026-00103",
    userId: "usr-student-03",
    studentName: "Priya Patel",
    email: "priya@iitd.ac.in",
    collegeName: "Indian Institute of Technology Delhi",
    rollNumber: "2022CS1042",
    courseBranch: "B.Tech Artificial Intelligence",
    yearSemester: "Year 2 / Semester 4",
    idCardFrontUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    submittedAt: "2026-09-25T14:20:00Z",
    status: "Rejected",
    rejectionCategory: "Image unclear or low quality",
    rejectionNotes: "The registration number on the ID card is blurred and unreadable. Please upload a high-resolution photo under good lighting.",
    reviewedAt: "2026-09-25T16:00:00Z",
  },
];
