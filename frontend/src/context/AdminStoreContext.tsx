import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_MOCK_VERIFICATIONS, VerificationSubmission } from "@/mocks/verifications";
import { mockStudentsProgress, StudentProgress } from "@/mocks/studentProgressData";
import { mockAdminUsers, AdminUser } from "@/mocks/adminData";

export interface MasterStudent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  branch: string;
  yearSemester: string;
  year: string;
  rollNumber: string;
  idCardFrontUrl: string;
  selfieUrl?: string;
  registeredAt: string;
  verificationStatus: "Pending Verification" | "Verified" | "Rejected" | "Pending";
  rejectionCategory?: string;
  rejectionNotes?: string;
  role: "STUDENT" | "ADMIN";
  status: "ACTIVE" | "BLOCKED" | "PENDING";
  profileCompletion: number;
  activityScore: number;
  riskLevel: "On Track" | "Needs Attention" | "At Risk" | "Inactive";
  streakDays: number;
  problemsSolved: number;
  interviewsCompleted: number;
  avgInterviewScore: number;
  avgQuizScore: number;
  bestAtsScore: number;
  lastActive: string;
}

const STORAGE_KEY = "ai_interview_prep_master_students_v2";

export const isRegistrationNew = (registeredAt?: string): boolean => {
  if (!registeredAt) return false;
  const regTime = new Date(registeredAt).getTime();
  if (isNaN(regTime)) return false;
  const now = Date.now();
  const diffHours = (now - regTime) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 24;
};

// Initial Seed Data combining verifications, users, and progress
const SEED_STUDENTS: MasterStudent[] = [
  {
    id: "usr-student-01",
    userId: "usr-student-01",
    name: "Kanhaiya Pandey",
    email: "kanhaiya.pandey@srmist.edu.in",
    phone: "+91 98765 43210",
    college: "SRM Institute of Science and Technology",
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    yearSemester: "Year 4 / Sem 7",
    year: "4th Year",
    rollNumber: "RA2111003010452",
    idCardFrontUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
    registeredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hrs ago (NEW)
    verificationStatus: "Verified",
    role: "STUDENT",
    status: "ACTIVE",
    profileCompletion: 95,
    activityScore: 88,
    riskLevel: "On Track",
    streakDays: 14,
    problemsSolved: 42,
    interviewsCompleted: 6,
    avgInterviewScore: 86,
    avgQuizScore: 90,
    bestAtsScore: 92,
    lastActive: "10m ago",
  },
  {
    id: "usr-student-02",
    userId: "usr-student-02",
    name: "Priya Sharma",
    email: "priya.sharma@vit.ac.in",
    phone: "+91 98123 45678",
    college: "Vellore Institute of Technology (VIT)",
    course: "B.Tech",
    branch: "Information Technology",
    yearSemester: "Year 3 / Sem 6",
    year: "3rd Year",
    rollNumber: "21BIT0184",
    idCardFrontUrl: "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=600",
    registeredAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hrs ago (NEW)
    verificationStatus: "Pending Verification",
    role: "STUDENT",
    status: "PENDING",
    profileCompletion: 80,
    activityScore: 74,
    riskLevel: "On Track",
    streakDays: 8,
    problemsSolved: 28,
    interviewsCompleted: 3,
    avgInterviewScore: 78,
    avgQuizScore: 82,
    bestAtsScore: 85,
    lastActive: "1h ago",
  },
  {
    id: "usr-student-03",
    userId: "usr-student-03",
    name: "Aarav Mehta",
    email: "aarav.mehta@bits-pilani.ac.in",
    phone: "+91 97234 56789",
    college: "BITS Pilani",
    course: "B.Tech",
    branch: "Electronics & Communication",
    yearSemester: "Year 4 / Sem 8",
    year: "4th Year",
    rollNumber: "2021A7PS0042P",
    idCardFrontUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600",
    registeredAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hrs ago (NEW)
    verificationStatus: "Rejected",
    rejectionCategory: "Blurry or Unreadable ID Card",
    rejectionNotes: "The roll number text is blurred. Please upload a clear scan.",
    role: "STUDENT",
    status: "BLOCKED",
    profileCompletion: 60,
    activityScore: 45,
    riskLevel: "Needs Attention",
    streakDays: 3,
    problemsSolved: 12,
    interviewsCompleted: 1,
    avgInterviewScore: 62,
    avgQuizScore: 70,
    bestAtsScore: 68,
    lastActive: "1d ago",
  },
  {
    id: "usr-student-04",
    userId: "usr-student-04",
    name: "Ananya Iyer",
    email: "ananya.iyer@iitm.ac.in",
    phone: "+91 96345 67890",
    college: "IIT Madras",
    course: "M.Tech",
    branch: "Computer Science",
    yearSemester: "Year 2 / Sem 3",
    year: "2nd Year",
    rollNumber: "CS22M014",
    idCardFrontUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
    registeredAt: "2026-09-20T10:30:00Z",
    verificationStatus: "Verified",
    role: "STUDENT",
    status: "ACTIVE",
    profileCompletion: 100,
    activityScore: 96,
    riskLevel: "On Track",
    streakDays: 25,
    problemsSolved: 85,
    interviewsCompleted: 12,
    avgInterviewScore: 92,
    avgQuizScore: 95,
    bestAtsScore: 98,
    lastActive: "30m ago",
  },
  {
    id: "usr-admin-01",
    userId: "usr-admin-01",
    name: "Platform Administrator",
    email: "admin@ai-prep.com",
    phone: "+91 90000 00000",
    college: "System Administration",
    course: "N/A",
    branch: "Administration",
    yearSemester: "N/A",
    year: "Staff",
    rollNumber: "ADM-001",
    idCardFrontUrl: "",
    registeredAt: "2026-01-01T00:00:00Z",
    verificationStatus: "Verified",
    role: "ADMIN",
    status: "ACTIVE",
    profileCompletion: 100,
    activityScore: 100,
    riskLevel: "On Track",
    streakDays: 100,
    problemsSolved: 0,
    interviewsCompleted: 0,
    avgInterviewScore: 100,
    avgQuizScore: 100,
    bestAtsScore: 100,
    lastActive: "Active Now",
  },
];

interface AdminStoreContextType {
  students: MasterStudent[];
  addStudent: (studentData: Partial<MasterStudent>) => MasterStudent;
  updateStudent: (id: string, updates: Partial<MasterStudent>) => void;
  deleteStudent: (id: string) => void;
  bulkDeleteStudents: (ids: string[]) => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string, category: string, notes: string) => void;
  bulkApproveVerifications: (ids: string[]) => void;
  bulkRejectVerifications: (ids: string[], category: string, notes: string) => void;
  toggleBlockUser: (id: string) => void;
  resetToDefault: () => void;
}

const AdminStoreContext = createContext<AdminStoreContextType | undefined>(undefined);

export const AdminStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<MasterStudent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse stored master students:", e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_STUDENTS));
    return SEED_STUDENTS;
  });

  const saveToStorage = (items: MasterStudent[]) => {
    setStudents(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save master students:", e);
    }
  };

  const addStudent = (studentData: Partial<MasterStudent>): MasterStudent => {
    const newId = studentData.id || `usr-student-${Date.now()}`;
    const newStudent: MasterStudent = {
      id: newId,
      userId: studentData.userId || newId,
      name: studentData.name || "New Registered Student",
      email: studentData.email || `student_${Date.now()}@college.edu.in`,
      phone: studentData.phone || "+91 98765 00000",
      college: studentData.college || "SRM Institute of Science and Technology",
      course: studentData.course || "B.Tech",
      branch: studentData.branch || "Computer Science & Engineering",
      yearSemester: studentData.yearSemester || "Year 1 / Sem 1",
      year: studentData.year || "1st Year",
      rollNumber: studentData.rollNumber || `REG${Math.floor(100000 + Math.random() * 900000)}`,
      idCardFrontUrl: studentData.idCardFrontUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
      selfieUrl: studentData.selfieUrl,
      registeredAt: studentData.registeredAt || new Date().toISOString(),
      verificationStatus: studentData.verificationStatus || "Pending Verification",
      role: studentData.role || "STUDENT",
      status: studentData.status || "PENDING",
      profileCompletion: studentData.profileCompletion || 75,
      activityScore: studentData.activityScore || 50,
      riskLevel: studentData.riskLevel || "On Track",
      streakDays: studentData.streakDays || 1,
      problemsSolved: studentData.problemsSolved || 0,
      interviewsCompleted: studentData.interviewsCompleted || 0,
      avgInterviewScore: studentData.avgInterviewScore || 0,
      avgQuizScore: studentData.avgQuizScore || 0,
      bestAtsScore: studentData.bestAtsScore || 0,
      lastActive: "Just Registered",
    };

    // Replace if exists by email/id, else prepend
    const existingIdx = students.findIndex(
      (s) => s.id === newStudent.id || s.email.toLowerCase() === newStudent.email.toLowerCase()
    );
    let updatedList: MasterStudent[];
    if (existingIdx !== -1) {
      updatedList = [...students];
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...newStudent };
    } else {
      updatedList = [newStudent, ...students];
    }

    saveToStorage(updatedList);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<MasterStudent>) => {
    const updatedList = students.map((s) => (s.id === id || s.userId === id ? { ...s, ...updates } : s));
    saveToStorage(updatedList);
  };

  const deleteStudent = (id: string) => {
    const updatedList = students.filter((s) => s.id !== id && s.userId !== id);
    saveToStorage(updatedList);
  };

  const bulkDeleteStudents = (ids: string[]) => {
    const updatedList = students.filter((s) => !ids.includes(s.id) && !ids.includes(s.userId));
    saveToStorage(updatedList);
  };

  const approveVerification = (id: string) => {
    updateStudent(id, {
      verificationStatus: "Verified",
      status: "ACTIVE",
      rejectionCategory: undefined,
      rejectionNotes: undefined,
    });
  };

  const rejectVerification = (id: string, category: string, notes: string) => {
    updateStudent(id, {
      verificationStatus: "Rejected",
      status: "BLOCKED",
      rejectionCategory: category,
      rejectionNotes: notes,
    });
  };

  const bulkApproveVerifications = (ids: string[]) => {
    const updatedList = students.map((s) =>
      ids.includes(s.id) || ids.includes(s.userId)
        ? {
            ...s,
            verificationStatus: "Verified" as const,
            status: "ACTIVE" as const,
            rejectionCategory: undefined,
            rejectionNotes: undefined,
          }
        : s
    );
    saveToStorage(updatedList);
  };

  const bulkRejectVerifications = (ids: string[], category: string, notes: string) => {
    const updatedList = students.map((s) =>
      ids.includes(s.id) || ids.includes(s.userId)
        ? {
            ...s,
            verificationStatus: "Rejected" as const,
            status: "BLOCKED" as const,
            rejectionCategory: category,
            rejectionNotes: notes,
          }
        : s
    );
    saveToStorage(updatedList);
  };

  const toggleBlockUser = (id: string) => {
    const target = students.find((s) => s.id === id || s.userId === id);
    if (target) {
      const nextStatus = target.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      updateStudent(id, { status: nextStatus });
    }
  };

  const resetToDefault = () => {
    saveToStorage(SEED_STUDENTS);
  };

  return (
    <AdminStoreContext.Provider
      value={{
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkDeleteStudents,
        approveVerification,
        rejectVerification,
        bulkApproveVerifications,
        bulkRejectVerifications,
        toggleBlockUser,
        resetToDefault,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
};

export const useAdminStore = () => {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) {
    throw new Error("useAdminStore must be used within an AdminStoreProvider");
  }
  return ctx;
};
