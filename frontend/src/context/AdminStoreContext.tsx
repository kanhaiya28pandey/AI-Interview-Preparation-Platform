import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_MOCK_VERIFICATIONS, VerificationSubmission } from "@/mocks/verifications";
import { mockStudentsProgress, StudentProgress } from "@/mocks/studentProgressData";
import { mockAdminUsers, AdminUser } from "@/mocks/adminData";
import { verificationService } from "@/services/verificationService";
import api from "@/lib/api";

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
  deleteStudent: (id: string, email?: string) => Promise<void> | void;
  bulkDeleteStudents: (ids: string[]) => Promise<void> | void;
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

  useEffect(() => {
    let isMounted = true;
    const fetchRealPlatformData = async () => {
      try {
        const [studentsRes, verifsRes, auditRes] = await Promise.allSettled([
          api.get("/api/v1/admin/students").catch(() => api.get("/api/v1/admin/users")),
          api.get("/api/v1/admin/verifications"),
          api.get("/api/v1/admin/content/audit-logs"),
        ]);

        if (!isMounted) return;

        const verifList = verifsRes.status === "fulfilled" && Array.isArray(verifsRes.value.data) ? verifsRes.value.data : [];
        const verifMap = new Map<string, any>();
        verifList.forEach((v: any) => {
          if (v.userId) verifMap.set(String(v.userId).toLowerCase(), v);
          if (v.email) verifMap.set(String(v.email).toLowerCase(), v);
        });

        if (studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value.data) && studentsRes.value.data.length > 0) {
          const realStudents: MasterStudent[] = studentsRes.value.data
            .filter((u: any) => u.role !== "ADMIN" && !u.email?.includes("admin"))
            .map((u: any) => {
              const v = verifMap.get(String(u.id || "").toLowerCase()) ||
                        verifMap.get(String(u.userId || "").toLowerCase()) ||
                        verifMap.get(String(u.email || "").toLowerCase());
              return {
                id: u.id || u.userId,
                userId: u.userId || u.id,
                name: u.name || "Student",
                email: u.email,
                phone: u.phone || "+91 98765 43210",
                college: u.college || v?.collegeName || "SRM Institute of Science and Technology",
                course: u.course || "B.Tech",
                branch: u.branch || "Computer Science",
                yearSemester: u.year || "3rd Year",
                year: u.year || "3rd Year",
                rollNumber: u.rollNumber || v?.rollNumber || "RA2111003010452",
                idCardFrontUrl: v?.idCardFrontUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
                selfieUrl: v?.selfieUrl,
                registeredAt: u.joinedDate || u.createdAt || new Date().toISOString(),
                verificationStatus: (v?.status === "Verified" ? "Verified" : v?.status === "Rejected" ? "Rejected" : "Pending Verification") as any,
                role: "STUDENT",
                status: (u.status === "BLOCKED" ? "BLOCKED" : "ACTIVE") as any,
                profileCompletion: u.activityScore ? Math.min(100, u.activityScore + 10) : 85,
                activityScore: u.activityScore || 80,
                riskLevel: (u.riskLevel === "At Risk" ? "At Risk" : u.riskLevel === "Inactive" ? "Inactive" : "On Track") as any,
                streakDays: u.streakDays || 1,
                problemsSolved: u.problemsSolved || 0,
                interviewsCompleted: u.interviewsCompleted || 0,
                avgInterviewScore: u.avgInterviewScore || 80,
                avgQuizScore: u.avgQuizScore || 85,
                bestAtsScore: u.bestAtsScore || 80,
                lastActive: u.lastActive || "Recently",
              };
            });

          if (realStudents.length > 0) {
            setStudents(realStudents);
            saveToStorage(realStudents);
          }
        }

        if (auditRes.status === "fulfilled" && Array.isArray(auditRes.value.data) && auditRes.value.data.length > 0) {
          const realAudits: AdminAuditEntry[] = auditRes.value.data.map((l: any) => ({
            id: l.id || `audit-${Math.random()}`,
            action: (l.action?.toUpperCase() || "UPDATE") as any,
            adminName: l.performedBy || "Administrator",
            adminEmail: "admin@aiinterviewprep.com",
            targetCount: 1,
            targets: [l.title || l.contentId || "Content Item"],
            timestamp: l.timestamp || new Date().toISOString(),
            details: l.details || `${l.action} on ${l.title || "item"}`,
          }));
          setAuditLogs(realAudits);
          localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(realAudits));
        }
      } catch (err) {
        console.warn("Real admin store data sync notice:", err);
      }
    };

    fetchRealPlatformData();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const deleteStudent = async (id: string, email?: string): Promise<void> => {
    const target = students.find(
      (s) =>
        s.id === id ||
        s.userId === id ||
        (email && s.email.toLowerCase() === email.toLowerCase())
    );
    const targetEmail = email || target?.email;
    const targetUserId = target?.userId || target?.id || id;

    const updatedList = students.filter(
      (s) =>
        s.id !== id &&
        s.userId !== id &&
        (!targetEmail || s.email.toLowerCase() !== targetEmail.toLowerCase())
    );
    saveToStorage(updatedList);

    // Clean up local verification cache if any
    try {
      const storedVerifs = localStorage.getItem("ai_interview_prep_verifications");
      if (storedVerifs) {
        const parsed = JSON.parse(storedVerifs);
        const filtered = parsed.filter(
          (v: any) =>
            v.id !== id &&
            v.verificationId !== id &&
            v.userId !== targetUserId &&
            (!targetEmail || v.email?.toLowerCase() !== targetEmail.toLowerCase())
        );
        localStorage.setItem("ai_interview_prep_verifications", JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn("Error cleaning local verifications:", e);
    }

    // Call backend API to permanently purge user from database by BOTH email and ID
    const deleteCalls: Promise<any>[] = [];
    if (targetEmail) {
      deleteCalls.push(api.delete(`/api/v1/admin/users/${encodeURIComponent(targetEmail)}`).catch(() => {}));
      deleteCalls.push(api.delete(`/api/v1/admin/verifications/${encodeURIComponent(targetEmail)}`).catch(() => {}));
    }
    if (targetUserId && targetUserId !== targetEmail) {
      deleteCalls.push(api.delete(`/api/v1/admin/users/${encodeURIComponent(targetUserId)}`).catch(() => {}));
      deleteCalls.push(api.delete(`/api/v1/admin/verifications/${encodeURIComponent(targetUserId)}`).catch(() => {}));
    }
    await Promise.allSettled(deleteCalls);

    // Clear local auth session if the deleted user is currently cached in this browser
    try {
      const storedUserStr = localStorage.getItem("ai_interview_prep_user");
      if (storedUserStr) {
        const parsedUser = JSON.parse(storedUserStr);
        if (targetEmail && parsedUser.email?.toLowerCase() === targetEmail.toLowerCase()) {
          localStorage.removeItem("ai_interview_prep_user");
          localStorage.removeItem("ai_interview_prep_token");
        }
      }
    } catch {}

    if (target) {
      addAuditLog({
        action: "DELETE_STUDENT",
        adminName: "Administrator",
        adminEmail: "admin@aiprep.com",
        targetCount: 1,
        targets: [target.name || target.email],
        details: `Permanently deleted candidate record and database profile for ${target.name} (${target.email})`,
      });
    }
  };

  const bulkDeleteStudents = async (ids: string[]): Promise<void> => {
    const targets = students.filter((s) => ids.includes(s.id) || ids.includes(s.userId));
    const updatedList = students.filter((s) => !ids.includes(s.id) && !ids.includes(s.userId));
    saveToStorage(updatedList);

    try {
      const storedVerifs = localStorage.getItem("ai_interview_prep_verifications");
      if (storedVerifs) {
        const parsed = JSON.parse(storedVerifs);
        const filtered = parsed.filter((v: any) => {
          const matches = targets.some(
            (t) =>
              v.id === t.id ||
              v.verificationId === t.id ||
              v.userId === t.id ||
              v.userId === t.userId ||
              (t.email && v.email?.toLowerCase() === t.email.toLowerCase())
          );
          return !matches;
        });
        localStorage.setItem("ai_interview_prep_verifications", JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn("Error cleaning local verifications:", e);
    }

    await Promise.allSettled(
      targets.flatMap((t) => {
        const calls: Promise<any>[] = [];
        if (t.email) {
          calls.push(api.delete(`/api/v1/admin/users/${encodeURIComponent(t.email)}`).catch(() => {}));
          calls.push(api.delete(`/api/v1/admin/verifications/${encodeURIComponent(t.email)}`).catch(() => {}));
        }
        if (t.id && t.id !== t.email) {
          calls.push(api.delete(`/api/v1/admin/users/${encodeURIComponent(t.id)}`).catch(() => {}));
        }
        if (t.userId && t.userId !== t.email && t.userId !== t.id) {
          calls.push(api.delete(`/api/v1/admin/users/${encodeURIComponent(t.userId)}`).catch(() => {}));
        }
        return calls;
      })
    );

    if (targets.length > 0) {
      addAuditLog({
        action: "BULK_DELETE_STUDENTS",
        adminName: "Administrator",
        adminEmail: "admin@aiprep.com",
        targetCount: targets.length,
        targets: targets.map((t) => t.name || t.email),
        details: `Permanently bulk deleted ${targets.length} candidate account(s) and database profiles`,
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
      status: "ACTIVE",
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
          status: "ACTIVE" as const,
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
