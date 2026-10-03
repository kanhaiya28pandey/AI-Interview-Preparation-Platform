import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_MOCK_VERIFICATIONS, VerificationSubmission } from "@/mocks/verifications";
import { mockStudentsProgress, StudentProgress } from "@/mocks/studentProgressData";
import { mockAdminUsers, AdminUser } from "@/mocks/adminData";
import { verificationService } from "@/services/verificationService";

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
  status: "ACTIVE" | "BLOCKED" | "PENDING" | "INACTIVE";
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

export interface AdminAuditEntry {
  id: string;
  action: "DELETE_STUDENT" | "BULK_DELETE_STUDENTS" | "DEACTIVATE_STUDENT" | "REACTIVATE_STUDENT" | "APPROVE_VERIFICATION" | "REJECT_VERIFICATION";
  adminName: string;
  adminEmail: string;
  targetCount: number;
  targets: string[];
  timestamp: string;
  details: string;
}

interface AdminStoreContextType {
  students: MasterStudent[];
  auditLogs: AdminAuditEntry[];
  addStudent: (studentData: Partial<MasterStudent>) => MasterStudent;
  updateStudent: (id: string, updates: Partial<MasterStudent>) => void;
  deleteStudent: (id: string) => void;
  bulkDeleteStudents: (ids: string[]) => void;
  restoreStudent: (student: MasterStudent) => void;
  restoreStudents: (students: MasterStudent[]) => void;
  deactivateStudent: (id: string) => void;
  reactivateStudent: (id: string) => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string, category: string, notes: string) => void;
  bulkApproveVerifications: (ids: string[]) => void;
  bulkRejectVerifications: (ids: string[], category: string, notes: string) => void;
  toggleBlockUser: (id: string) => void;
  addAuditLog: (entry: Omit<AdminAuditEntry, "id" | "timestamp">) => void;
  resetToDefault: () => void;
}

const AUDIT_STORAGE_KEY = "ai_interview_prep_admin_audit_logs";

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

  const [auditLogs, setAuditLogs] = useState<AdminAuditEntry[]>(() => {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const addAuditLog = (entry: Omit<AdminAuditEntry, "id" | "timestamp">) => {
    const newEntry: AdminAuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => {
      const next = [newEntry, ...prev].slice(0, 100);
      try {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

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
      profileCompletion: studentData.profileCompletion !== undefined ? studentData.profileCompletion : 0,
      activityScore: studentData.activityScore !== undefined ? studentData.activityScore : 0,
      riskLevel: studentData.riskLevel || "On Track",
      streakDays: studentData.streakDays !== undefined ? studentData.streakDays : 0,
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
    const target = students.find((s) => s.id === id || s.userId === id);
    const updatedList = students.filter((s) => s.id !== id && s.userId !== id);
    saveToStorage(updatedList);
    if (target) {
      addAuditLog({
        action: "DELETE_STUDENT",
        adminName: "Administrator",
        adminEmail: "admin@aiprep.com",
        targetCount: 1,
        targets: [target.name || target.email],
        details: `Deleted candidate record for ${target.name} (${target.email})`,
      });
    }
  };

  const bulkDeleteStudents = (ids: string[]) => {
    const targets = students.filter((s) => ids.includes(s.id) || ids.includes(s.userId));
    const updatedList = students.filter((s) => !ids.includes(s.id) && !ids.includes(s.userId));
    saveToStorage(updatedList);
    if (targets.length > 0) {
      addAuditLog({
        action: "BULK_DELETE_STUDENTS",
        adminName: "Administrator",
        adminEmail: "admin@aiprep.com",
        targetCount: targets.length,
        targets: targets.map((t) => t.name || t.email),
        details: `Bulk deleted ${targets.length} candidate account(s)`,
      });
    }
  };

  const restoreStudent = (student: MasterStudent) => {
    setStudents((prev) => {
      if (prev.some((s) => s.id === student.id || s.userId === student.userId)) {
        return prev;
      }
      const next = [student, ...prev];
      saveToStorage(next);
      return next;
    });
  };

  const restoreStudents = (restoredList: MasterStudent[]) => {
    setStudents((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const toAdd = restoredList.filter((s) => !existingIds.has(s.id));
      const next = [...toAdd, ...prev];
      saveToStorage(next);
      return next;
    });
  };

  const deactivateStudent = (id: string) => {
    const student = students.find((s) => s.id === id || s.userId === id);
    updateStudent(id, { status: "BLOCKED", riskLevel: "Inactive" });
    if (student) {
      addAuditLog({
        action: "DEACTIVATE_STUDENT",
        adminName: "Administrator",
        adminEmail: "admin@aiprep.com",
        targetCount: 1,
        targets: [student.name || student.email],
        details: `Deactivated candidate account for ${student.name} (${student.email})`,
      });
    }
  };

  const reactivateStudent = (id: string) => {
    const student = students.find((s) => s.id === id || s.userId === id);
    updateStudent(id, { status: "ACTIVE", riskLevel: "On Track" });
    if (student) {
      addAuditLog({
        action: "REACTIVATE_STUDENT",
        adminName: "Administrator",
        adminEmail: "admin@aiprep.com",
        targetCount: 1,
        targets: [student.name || student.email],
        details: `Reactivated candidate account for ${student.name} (${student.email})`,
      });
    }
  };

  const approveVerification = (id: string) => {
    const student = students.find((s) => s.id === id || s.userId === id);
    updateStudent(id, {
      verificationStatus: "Verified",
      status: "ACTIVE",
      rejectionCategory: undefined,
      rejectionNotes: undefined,
    });
    if (student) {
      verificationService
        .reviewVerificationByStudent(student.userId || student.id, student.email, "APPROVE")
        .catch((e) => console.warn("Sync verification error on approve:", e));
    }
  };

  const rejectVerification = (id: string, category: string, notes: string) => {
    const student = students.find((s) => s.id === id || s.userId === id);
    updateStudent(id, {
      verificationStatus: "Rejected",
      status: "BLOCKED",
      rejectionCategory: category,
      rejectionNotes: notes,
    });
    if (student) {
      verificationService
        .reviewVerificationByStudent(student.userId || student.id, student.email, "REJECT", category, notes)
        .catch((e) => console.warn("Sync verification error on reject:", e));
    }
  };

  const bulkApproveVerifications = (ids: string[]) => {
    const updatedList = students.map((s) => {
      if (ids.includes(s.id) || ids.includes(s.userId)) {
        verificationService
          .reviewVerificationByStudent(s.userId || s.id, s.email, "APPROVE")
          .catch((e) => console.warn("Sync verification error on bulk approve:", e));
        return {
          ...s,
          verificationStatus: "Verified" as const,
          status: "ACTIVE" as const,
          rejectionCategory: undefined,
          rejectionNotes: undefined,
        };
      }
      return s;
    });
    saveToStorage(updatedList);
  };

  const bulkRejectVerifications = (ids: string[], category: string, notes: string) => {
    const updatedList = students.map((s) => {
      if (ids.includes(s.id) || ids.includes(s.userId)) {
        verificationService
          .reviewVerificationByStudent(s.userId || s.id, s.email, "REJECT", category, notes)
          .catch((e) => console.warn("Sync verification error on bulk reject:", e));
        return {
          ...s,
          verificationStatus: "Rejected" as const,
          status: "BLOCKED" as const,
          rejectionCategory: category,
          rejectionNotes: notes,
        };
      }
      return s;
    });
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
        auditLogs,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkDeleteStudents,
        restoreStudent,
        restoreStudents,
        deactivateStudent,
        reactivateStudent,
        approveVerification,
        rejectVerification,
        bulkApproveVerifications,
        bulkRejectVerifications,
        toggleBlockUser,
        addAuditLog,
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
