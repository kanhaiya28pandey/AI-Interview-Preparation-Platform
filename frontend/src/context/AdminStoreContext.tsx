import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_MOCK_VERIFICATIONS, VerificationSubmission } from "@/mocks/verifications";
import { mockStudentsProgress, StudentProgress } from "@/mocks/studentProgressData";
import { mockAdminUsers, AdminUser } from "@/mocks/adminData";
import { verificationService } from "@/services/verificationService";
import { isMockMode } from "@/lib/dataMode";

export interface MasterStudent {
  id: string;
  userId: string;
  verificationId?: string;
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

export const mapSubmissionToMasterStudent = (
  sub: VerificationSubmission,
  existing?: MasterStudent
): MasterStudent => {
  const courseParts = (sub.courseBranch || "").split(/[-–—/]/).map((s) => s.trim());
  const course = courseParts[0] || existing?.course || "B.Tech";
  const branch = courseParts.slice(1).join(" - ") || existing?.branch || sub.courseBranch || "CSE";
  const yearParts = (sub.yearSemester || "").split(/[/,]/).map((s) => s.trim());
  const year = yearParts[0] || existing?.year || "1st Year";

  const rawStatus = sub.status || "Pending Verification";
  const verifStatus: MasterStudent["verificationStatus"] =
    rawStatus === "Verified"
      ? "Verified"
      : rawStatus === "Rejected"
      ? "Rejected"
      : "Pending Verification";

  const studentStatus: MasterStudent["status"] =
    verifStatus === "Verified"
      ? "ACTIVE"
      : verifStatus === "Rejected"
      ? "BLOCKED"
      : "PENDING";

  return {
    id: sub.userId || sub.verificationId || existing?.id || `sub-${Date.now()}`,
    userId: sub.userId || existing?.userId || sub.verificationId,
    verificationId: sub.verificationId,
    name: sub.studentName || existing?.name || "Student Candidate",
    email: sub.email || existing?.email || "",
    phone: existing?.phone || "+91 98765 00000",
    college: sub.collegeName || existing?.college || "",
    course,
    branch,
    yearSemester: sub.yearSemester || existing?.yearSemester || "Year 1 / Sem 1",
    year,
    rollNumber: sub.rollNumber || existing?.rollNumber || "",
    idCardFrontUrl: sub.idCardFrontUrl || existing?.idCardFrontUrl || "",
    selfieUrl: sub.selfieUrl || existing?.selfieUrl,
    registeredAt: sub.submittedAt || existing?.registeredAt || new Date().toISOString(),
    verificationStatus: verifStatus,
    rejectionCategory: sub.rejectionCategory || (verifStatus === "Rejected" ? existing?.rejectionCategory : undefined),
    rejectionNotes: sub.rejectionNotes || (verifStatus === "Rejected" ? existing?.rejectionNotes : undefined),
    role: "STUDENT",
    status: existing?.status && existing.status !== "PENDING" && verifStatus !== "Rejected" ? existing.status : studentStatus,
    profileCompletion: existing?.profileCompletion ?? (verifStatus === "Verified" ? 85 : 50),
    activityScore: existing?.activityScore ?? (verifStatus === "Verified" ? 75 : 40),
    riskLevel: existing?.riskLevel || "On Track",
    streakDays: existing?.streakDays ?? (verifStatus === "Verified" ? 5 : 0),
    problemsSolved: existing?.problemsSolved ?? (verifStatus === "Verified" ? 12 : 0),
    interviewsCompleted: existing?.interviewsCompleted ?? (verifStatus === "Verified" ? 2 : 0),
    avgInterviewScore: existing?.avgInterviewScore ?? (verifStatus === "Verified" ? 78 : 0),
    avgQuizScore: existing?.avgQuizScore ?? (verifStatus === "Verified" ? 80 : 0),
    bestAtsScore: existing?.bestAtsScore ?? (verifStatus === "Verified" ? 82 : 0),
    lastActive: existing?.lastActive || "Active recently",
  };
};

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
  syncFromSubmissions: (submissions: VerificationSubmission[]) => void;
  addStudent: (studentData: Partial<MasterStudent>) => MasterStudent;
  updateStudent: (id: string, updates: Partial<MasterStudent>) => void;
  deleteStudent: (id: string) => void;
  bulkDeleteStudents: (ids: string[]) => void;
  restoreStudent: (student: MasterStudent) => void;
  restoreStudents: (students: MasterStudent[]) => void;
  deactivateStudent: (id: string) => void;
  reactivateStudent: (id: string) => void;
  approveVerification: (id: string) => Promise<void>;
  rejectVerification: (id: string, category: string, notes: string) => Promise<void>;
  bulkApproveVerifications: (ids: string[]) => Promise<void>;
  bulkRejectVerifications: (ids: string[], category: string, notes: string) => Promise<void>;
  toggleBlockUser: (id: string) => void;
  addAuditLog: (entry: Omit<AdminAuditEntry, "id" | "timestamp">) => void;
  resetToDefault: () => void;
}

const AUDIT_STORAGE_KEY = "ai_interview_prep_admin_audit_logs";

const AdminStoreContext = createContext<AdminStoreContextType | undefined>(undefined);

export const AdminStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<MasterStudent[]>(() => {
    if (isMockMode()) {
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
    }
    // Real admin session: strictly start with empty list or real cached entries only (no seed mock rows)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (s: MasterStudent) =>
              !s.id?.startsWith("usr-student-") &&
              !s.userId?.startsWith("usr-student-") &&
              !s.id?.startsWith("demo-") &&
              !s.userId?.startsWith("demo-")
          );
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Automatically sync real verifications from backend for real admin sessions
  useEffect(() => {
    if (!isMockMode()) {
      verificationService
        .getAllSubmissions()
        .then((subs) => {
          if (Array.isArray(subs)) {
            syncFromSubmissions(subs);
          }
        })
        .catch((err) => {
          console.warn("[AdminStore] Could not fetch real submissions:", err);
        });
    }
  }, []);

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
    const sanitized = isMockMode()
      ? items
      : items.filter(
          (s) =>
            !s.id?.startsWith("usr-student-") &&
            !s.userId?.startsWith("usr-student-") &&
            !s.id?.startsWith("demo-") &&
            !s.userId?.startsWith("demo-")
        );
    setStudents(sanitized);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
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

  const syncFromSubmissions = (submissions: VerificationSubmission[]) => {
    if (isMockMode()) {
      setStudents((prev) => {
        const currentList = prev.length > 0 ? prev : SEED_STUDENTS;
        const updated = [...currentList];

        submissions.forEach((sub) => {
          const subEmail = sub.email?.trim().toLowerCase();
          const subUserId = sub.userId?.trim();
          const subVerifId = sub.verificationId?.trim();

          const matchIdx = updated.findIndex((s) => {
            const matchEmail = subEmail && s.email?.trim().toLowerCase() === subEmail;
            const matchUserId = subUserId && (s.userId === subUserId || s.id === subUserId);
            const matchVerifId = subVerifId && s.verificationId === subVerifId;
            return Boolean(matchEmail || matchUserId || matchVerifId);
          });

          if (matchIdx !== -1) {
            updated[matchIdx] = mapSubmissionToMasterStudent(sub, updated[matchIdx]);
          } else {
            updated.unshift(mapSubmissionToMasterStudent(sub));
          }
        });

        saveToStorage(updated);
        return updated;
      });
    } else {
      // Real admin session: map all submissions to MasterStudent list.
      // If submissions is empty, the list is empty (clean empty state).
      setStudents((prev) => {
        const prevMap = new Map<string, MasterStudent>();
        prev.forEach((s) => {
          if (s.email) prevMap.set(s.email.toLowerCase(), s);
          if (s.userId) prevMap.set(s.userId, s);
          if (s.id) prevMap.set(s.id, s);
          if (s.verificationId) prevMap.set(s.verificationId, s);
        });

        const newList = submissions.map((sub) => {
          const existing =
            (sub.email ? prevMap.get(sub.email.toLowerCase()) : undefined) ||
            (sub.userId ? prevMap.get(sub.userId) : undefined) ||
            (sub.verificationId ? prevMap.get(sub.verificationId) : undefined);
          return mapSubmissionToMasterStudent(sub, existing);
        });

        saveToStorage(newList);
        return newList;
      });
    }
  };

  const approveVerification = async (id: string) => {
    const student = students.find((s) => s.id === id || s.userId === id || s.verificationId === id);
    const targetVerificationId = student?.verificationId || student?.id || id;

    updateStudent(id, {
      verificationStatus: "Verified",
      status: "ACTIVE",
      rejectionCategory: undefined,
      rejectionNotes: undefined,
    });

    try {
      if (student?.verificationId) {
        await verificationService.reviewVerification(student.verificationId, "APPROVE");
      } else if (student?.userId || student?.email) {
        await verificationService.reviewVerificationByStudent(
          student.userId || student.id,
          student.email || "",
          "APPROVE"
        );
      } else {
        await verificationService.reviewVerification(targetVerificationId, "APPROVE");
      }
    } catch (e) {
      console.warn("Sync verification error on approve:", e);
    }
  };

  const rejectVerification = async (id: string, category: string, notes: string) => {
    const student = students.find((s) => s.id === id || s.userId === id || s.verificationId === id);
    const targetVerificationId = student?.verificationId || student?.id || id;

    updateStudent(id, {
      verificationStatus: "Rejected",
      status: "BLOCKED",
      rejectionCategory: category,
      rejectionNotes: notes,
    });

    try {
      if (student?.verificationId) {
        await verificationService.reviewVerification(student.verificationId, "REJECT", category, notes);
      } else if (student?.userId || student?.email) {
        await verificationService.reviewVerificationByStudent(
          student.userId || student.id,
          student.email || "",
          "REJECT",
          category,
          notes
        );
      } else {
        await verificationService.reviewVerification(targetVerificationId, "REJECT", category, notes);
      }
    } catch (e) {
      console.warn("Sync verification error on reject:", e);
    }
  };

  const bulkApproveVerifications = async (ids: string[]) => {
    const updatedList = students.map((s) => {
      if (ids.includes(s.id) || ids.includes(s.userId) || (s.verificationId && ids.includes(s.verificationId))) {
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

    for (const id of ids) {
      const s = students.find((item) => item.id === id || item.userId === id || item.verificationId === id);
      if (s?.verificationId) {
        await verificationService.reviewVerification(s.verificationId, "APPROVE").catch(console.warn);
      } else if (s?.userId || s?.email) {
        await verificationService.reviewVerificationByStudent(s.userId || s.id, s.email || "", "APPROVE").catch(console.warn);
      }
    }
  };

  const bulkRejectVerifications = async (ids: string[], category: string, notes: string) => {
    const updatedList = students.map((s) => {
      if (ids.includes(s.id) || ids.includes(s.userId) || (s.verificationId && ids.includes(s.verificationId))) {
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

    for (const id of ids) {
      const s = students.find((item) => item.id === id || item.userId === id || item.verificationId === id);
      if (s?.verificationId) {
        await verificationService.reviewVerification(s.verificationId, "REJECT", category, notes).catch(console.warn);
      } else if (s?.userId || s?.email) {
        await verificationService.reviewVerificationByStudent(s.userId || s.id, s.email || "", "REJECT", category, notes).catch(console.warn);
      }
    }
  };

  const toggleBlockUser = (id: string) => {
    const target = students.find((s) => s.id === id || s.userId === id);
    if (target) {
      const nextStatus = target.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      updateStudent(id, { status: nextStatus });
    }
  };

  const resetToDefault = () => {
    if (isMockMode()) {
      saveToStorage(SEED_STUDENTS);
    } else {
      verificationService
        .getAllSubmissions()
        .then((subs) => {
          syncFromSubmissions(subs);
        })
        .catch(() => {
          saveToStorage([]);
        });
    }
  };

  return (
    <AdminStoreContext.Provider
      value={{
        students,
        auditLogs,
        syncFromSubmissions,
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
