import {
  VerificationSubmission,
  VerificationStatus,
  INITIAL_MOCK_VERIFICATIONS,
} from "@/mocks/verifications";
import { profileService } from "@/services/profileService";
import { notificationService } from "@/services/notificationService";
import api from "@/lib/api";
import { isMockMode } from "@/lib/dataMode";

const STORAGE_KEY = "ai_interview_prep_verifications";
const ADMIN_STUDENTS_KEY = "admin_master_students";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface VerificationRequestLog {
  url: string;
  method: string;
  status: number | string;
  timestamp: string;
  details?: string;
}

let lastVerificationRequestLog: VerificationRequestLog | null = null;

export const getLastVerificationRequest = (): VerificationRequestLog | null => {
  return lastVerificationRequestLog;
};

export const setLastVerificationRequest = (log: VerificationRequestLog) => {
  lastVerificationRequestLog = log;
};

/**
 * Idempotent normalization and deduplication of stored verification records.
 * Auto-heals existing stuck records and synchronizes caches.
 */
export const normalizeVerifications = (): VerificationSubmission[] => {
  let list: VerificationSubmission[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      list = JSON.parse(raw);
    } else {
      list = [...INITIAL_MOCK_VERIFICATIONS];
    }
  } catch (e) {
    console.error("Failed to parse stored verifications during normalization:", e);
    list = [...INITIAL_MOCK_VERIFICATIONS];
  }

  // Check admin store for any students already approved by admin
  const adminVerifiedSet = new Set<string>();
  const adminRejectedMap = new Map<string, { category?: string; notes?: string }>();
  try {
    const rawAdmin = localStorage.getItem(ADMIN_STUDENTS_KEY);
    if (rawAdmin) {
      const parsedAdmin = JSON.parse(rawAdmin);
      if (Array.isArray(parsedAdmin)) {
        parsedAdmin.forEach((st) => {
          if (st.verificationStatus === "Verified") {
            if (st.userId) adminVerifiedSet.add(st.userId.toLowerCase());
            if (st.id) adminVerifiedSet.add(st.id.toLowerCase());
            if (st.email) adminVerifiedSet.add(st.email.toLowerCase());
          } else if (st.verificationStatus === "Rejected") {
            const data = { category: st.rejectionCategory, notes: st.rejectionNotes };
            if (st.userId) adminRejectedMap.set(st.userId.toLowerCase(), data);
            if (st.id) adminRejectedMap.set(st.id.toLowerCase(), data);
            if (st.email) adminRejectedMap.set(st.email.toLowerCase(), data);
          }
        });
      }
    }
  } catch {
    // ignore
  }

  // Group by student key (userId or lowercased email)
  const groups = new Map<string, VerificationSubmission[]>();
  list.forEach((item) => {
    const key = (item.userId || item.email || "").trim().toLowerCase();
    if (!key) return;
    const existing = groups.get(key) || [];
    existing.push(item);
    groups.set(key, existing);
  });

  const deduped: VerificationSubmission[] = [];
  let changed = false;

  groups.forEach((group, key) => {
    // Sort all records in group by timestamp descending (newest first)
    const sorted = [...group].sort((a, b) => {
      const timeA = new Date(a.reviewedAt || a.submittedAt).getTime();
      const timeB = new Date(b.reviewedAt || b.submittedAt).getTime();
      return timeB - timeA;
    });

    const newest = sorted[0];
    const verifiedRecord = sorted.find((r) => r.status === "Verified");
    const isApprovedInAdmin =
      adminVerifiedSet.has(key) ||
      (newest.userId && adminVerifiedSet.has(newest.userId.toLowerCase())) ||
      (newest.email && adminVerifiedSet.has(newest.email.toLowerCase()));

    let finalRecord: VerificationSubmission;

    if (verifiedRecord || isApprovedInAdmin) {
      const approvedTime = verifiedRecord?.reviewedAt
        ? new Date(verifiedRecord.reviewedAt).getTime()
        : verifiedRecord?.submittedAt
        ? new Date(verifiedRecord.submittedAt).getTime()
        : 0;

      const newestSubmitTime = new Date(newest.submittedAt).getTime();

      // Only keep Pending if it was submitted strictly after the approval timestamp
      if (newest.status === "Pending Verification" && approvedTime > 0 && newestSubmitTime > approvedTime) {
        finalRecord = newest;
      } else {
        finalRecord = {
          ...(verifiedRecord || newest),
          status: "Verified",
          reviewedAt: (verifiedRecord && verifiedRecord.reviewedAt) || newest.reviewedAt || new Date().toISOString(),
        };
        if (newest.status !== "Verified") changed = true;
      }
    } else {
      finalRecord = newest;
    }

    if (group.length > 1) {
      changed = true;
    }

    deduped.push(finalRecord);

    // Auto-heal profile and auth caches for this student
    if (finalRecord.userId) {
      profileService.updateProfileForUser(finalRecord.userId, {
        verificationStatus: finalRecord.status,
        verificationReason: finalRecord.rejectionNotes,
        verificationId: finalRecord.verificationId,
      }).catch(() => {});
    }
  });

  if (changed || deduped.length !== list.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
  }

  return deduped;
};

// Run normalization on module initialization
if (typeof window !== "undefined") {
  try {
    normalizeVerifications();
  } catch (e) {
    console.error("Initial normalizeVerifications error:", e);
  }
}

const getStoredSubmissions = (): VerificationSubmission[] => {
  return normalizeVerifications();
};

const saveSubmissions = (items: VerificationSubmission[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const verificationService = {
  /**
   * Single source of truth for mock mode status resolution
   */
  resolveStatus(
    userId?: string,
    email?: string
  ): { status: VerificationStatus; submission?: VerificationSubmission } {
    if (!userId && !email) {
      return { status: "Unverified" };
    }

    // Demo accounts and admins remain verified by default
    if (
      userId === "demo-usr-student-01" ||
      userId === "demo-usr-admin-01" ||
      userId === "usr-student-01" ||
      email?.includes("demo") ||
      email?.includes("admin")
    ) {
      const demoSub = INITIAL_MOCK_VERIFICATIONS.find((v) => v.userId === "usr-student-01");
      return {
        status: "Verified",
        submission: demoSub || {
          verificationId: "VER-DEMO-001",
          userId: userId || "demo-usr-student-01",
          studentName: "Demo Verified Student",
          email: email || "demo@srmist.edu.in",
          collegeName: "SRM Institute of Science and Technology",
          rollNumber: "RA2111003010452",
          courseBranch: "B.Tech CSE",
          yearSemester: "Year 4 / Semester 7",
          idCardFrontUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
          submittedAt: new Date().toISOString(),
          status: "Verified",
        },
      };
    }

    const submissions = getStoredSubmissions();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUserId = userId?.trim();

    // Match by userId first, then email (case-insensitive, trimmed)
    const matches = submissions.filter((s) => {
      const matchUserId = normalizedUserId && s.userId === normalizedUserId;
      const matchEmail = normalizedEmail && s.email.trim().toLowerCase() === normalizedEmail;
      return Boolean(matchUserId || matchEmail);
    });

    if (import.meta.env.DEV) {
      console.debug("[verificationService] resolveStatus matches for", { userId, email }, matches);
    }

    if (matches.length > 0) {
      // Pick latest submission by reviewedAt or submittedAt
      const sorted = [...matches].sort((a, b) => {
        const timeA = new Date(a.reviewedAt || a.submittedAt).getTime();
        const timeB = new Date(b.reviewedAt || b.submittedAt).getTime();
        return timeB - timeA;
      });
      const latest = sorted[0];

      // Auto-heal profile cache if needed
      if (normalizedUserId) {
        profileService.updateProfileForUser(normalizedUserId, {
          verificationStatus: latest.status,
          verificationReason: latest.rejectionNotes,
          verificationId: latest.verificationId,
        }).catch(() => {});
      }

      return { status: latest.status, submission: latest };
    }

    // Check if approved in admin master students list
    try {
      const rawAdmin = localStorage.getItem(ADMIN_STUDENTS_KEY);
      if (rawAdmin) {
        const parsedAdmin = JSON.parse(rawAdmin);
        if (Array.isArray(parsedAdmin)) {
          const adminMatch = parsedAdmin.find((st) => {
            const matchUserId = normalizedUserId && (st.userId === normalizedUserId || st.id === normalizedUserId);
            const matchEmail = normalizedEmail && st.email?.trim().toLowerCase() === normalizedEmail;
            return Boolean(matchUserId || matchEmail);
          });
          if (adminMatch && adminMatch.verificationStatus === "Verified") {
            const verifiedSub: VerificationSubmission = {
              verificationId: "VER-ADMIN-SYNC",
              userId: normalizedUserId || adminMatch.userId || adminMatch.id,
              studentName: adminMatch.name || "Student",
              email: normalizedEmail || adminMatch.email,
              collegeName: adminMatch.college || "SRM Institute of Science and Technology",
              rollNumber: adminMatch.rollNumber || "REG-001",
              courseBranch: `${adminMatch.course || "B.Tech"} ${adminMatch.branch || ""}`.trim(),
              yearSemester: adminMatch.yearSemester || "Year 1",
              idCardFrontUrl: adminMatch.idCardFrontUrl || "",
              submittedAt: adminMatch.registeredAt || new Date().toISOString(),
              reviewedAt: new Date().toISOString(),
              status: "Verified",
            };

            // Save this healed submission
            saveSubmissions([verifiedSub, ...submissions]);

            if (normalizedUserId) {
              profileService.updateProfileForUser(normalizedUserId, {
                verificationStatus: "Verified",
              }).catch(() => {});
            }

            return {
              status: "Verified",
              submission: verifiedSub,
            };
          }
        }
      }
    } catch {
      // ignore
    }

    // Default unverified
    // Frontend gating is for UX only. The backend must also reject API calls from unverified users.
    return { status: "Unverified" };
  },

  async getVerificationStatus(
    userId?: string,
    email?: string
  ): Promise<{ status: VerificationStatus; submission?: VerificationSubmission }> {
    if (isMockMode()) {
      await delay(50);
      const res = this.resolveStatus(userId, email);
      lastVerificationRequestLog = {
        url: "/api/v1/verification/status (MOCK)",
        method: "GET",
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
        details: `Status: ${res.status}`,
      };
      return res;
    }

    try {
      const res = await api.get("/api/v1/verification/status", {
        params: {
          userId: userId || undefined,
          email: email || undefined,
        },
      });

      const backendStatus = (res.data?.status || "Unverified") as VerificationStatus;
      const backendSub = res.data?.submission as VerificationSubmission | undefined;

      lastVerificationRequestLog = {
        url: `/api/v1/verification/status?userId=${userId || ""}&email=${email || ""}`,
        method: "GET",
        status: res.status || 200,
        timestamp: new Date().toLocaleTimeString(),
        details: `Status: ${backendStatus}`,
      };

      return {
        status: backendStatus,
        submission: backendSub,
      };
    } catch (err: any) {
      const statusCode = err?.response?.status || "Network Error";
      const errorMsg = err?.response?.data?.message || err?.message || "Cannot reach server";

      lastVerificationRequestLog = {
        url: `/api/v1/verification/status?userId=${userId || ""}&email=${email || ""}`,
        method: "GET",
        status: statusCode,
        timestamp: new Date().toLocaleTimeString(),
        details: `Error: ${errorMsg}`,
      };

      console.warn("[verificationService] getVerificationStatus API error:", err);
      // Real backend mode: strictly Unverified if not found / error
      return { status: "Unverified" };
    }
  },

  async submitVerification(
    data: Omit<VerificationSubmission, "verificationId" | "submittedAt" | "status">
  ): Promise<VerificationSubmission> {
    if (isMockMode()) {
      await delay(250);
      const submissions = getStoredSubmissions();

      const newRefId = `VER-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newSubmission: VerificationSubmission = {
        ...data,
        verificationId: newRefId,
        submittedAt: new Date().toISOString(),
        status: "Pending Verification",
      };

      // Replace ALL previous records for the same userId or email so only one record exists per student
      const normalizedEmail = data.email.trim().toLowerCase();
      const normalizedUserId = data.userId.trim();

      const updated = [
        newSubmission,
        ...submissions.filter((s) => {
          const matchUserId = normalizedUserId && s.userId === normalizedUserId;
          const matchEmail = normalizedEmail && s.email.trim().toLowerCase() === normalizedEmail;
          return !matchUserId && !matchEmail;
        }),
      ];

      saveSubmissions(updated);

      // Sync status to the student's own profile data (never admin's profile)
      try {
        await profileService.updateProfileForUser(data.userId, {
          verificationStatus: "Pending Verification",
          verificationId: newRefId,
        });
      } catch (e) {
        console.warn("Could not sync profile verification status:", e);
      }

      // Notify listening components across the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("verification-updated", {
            detail: { userId: data.userId, status: "Pending Verification" },
          })
        );
      }

      // Notify student and admin inbox
      try {
        await notificationService.notifyUser(data.userId, {
          audience: "STUDENT",
          type: "verification",
          title: "Verification Submitted",
          message: "Verification submitted - under review.",
          link: "/verify-identity",
          priority: "info",
        });

        await notificationService.notifyAdmins({
          type: "verification",
          title: "New Verification Submission",
          message: `${data.studentName || "Student"} (${data.email || data.collegeName}) submitted identity verification.`,
          link: "/admin/verifications",
          priority: "warning",
        });
      } catch (e) {
        console.warn("Could not dispatch verification submit notifications:", e);
      }

      lastVerificationRequestLog = {
        url: "/api/v1/verification/submit (MOCK)",
        method: "POST",
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
        details: `Created Ref: ${newRefId}`,
      };

      return newSubmission;
    }

    // Backend submission: POST /api/v1/verification/submit (singular)
    const payload = {
      userId: data.userId,
      studentName: data.studentName,
      email: data.email,
      collegeName: data.collegeName,
      rollNumber: data.rollNumber,
      courseBranch: data.courseBranch,
      yearSemester: data.yearSemester,
      idCardFrontUrl: data.idCardFrontUrl,
      idCardBackUrl: data.idCardBackUrl,
      selfieUrl: data.selfieUrl,
    };

    try {
      const res = await api.post("/api/v1/verification/submit", payload);

      lastVerificationRequestLog = {
        url: "/api/v1/verification/submit",
        method: "POST",
        status: res.status || 200,
        timestamp: new Date().toLocaleTimeString(),
        details: `Submitted successfully (Ref: ${res.data?.verificationId || "OK"})`,
      };

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("verification-updated", {
            detail: { userId: data.userId, status: res.data?.status || "Pending Verification" },
          })
        );
      }

      return res.data;
    } catch (err: any) {
      lastVerificationRequestLog = {
        url: "/api/v1/verification/submit",
        method: "POST",
        status: err?.response?.status || "Network Error",
        timestamp: new Date().toLocaleTimeString(),
        details: `Error: ${err?.response?.data?.message || err?.message || "Failed"}`,
      };
      throw err;
    }
  },

  async getAllSubmissions(): Promise<VerificationSubmission[]> {
    if (isMockMode()) {
      await delay(100);
      const list = getStoredSubmissions();
      lastVerificationRequestLog = {
        url: "/api/v1/admin/verifications (MOCK)",
        method: "GET",
        status: 200,
        timestamp: new Date().toLocaleTimeString(),
        details: `Count: ${list.length}`,
      };
      return list;
    }

    try {
      const res = await api.get("/api/v1/admin/verifications");
      lastVerificationRequestLog = {
        url: "/api/v1/admin/verifications",
        method: "GET",
        status: res.status || 200,
        timestamp: new Date().toLocaleTimeString(),
        details: `Count: ${Array.isArray(res.data) ? res.data.length : 0}`,
      };
      return res.data;
    } catch (err: any) {
      lastVerificationRequestLog = {
        url: "/api/v1/admin/verifications",
        method: "GET",
        status: err?.response?.status || "Network Error",
        timestamp: new Date().toLocaleTimeString(),
        details: `Error: ${err?.response?.data?.message || err?.message || "Failed"}`,
      };
      throw err;
    }
  },

  async reviewVerification(
    verificationId: string,
    action: "APPROVE" | "REJECT",
    rejectionCategory?: string,
    rejectionNotes?: string
  ): Promise<VerificationSubmission> {
    if (isMockMode()) {
      await delay(200);
      const submissions = getStoredSubmissions();
      const targetIndex = submissions.findIndex((s) => s.verificationId === verificationId);

      if (targetIndex === -1) {
        throw new Error(`Verification request ${verificationId} not found`);
      }

      const current = submissions[targetIndex];
      const newStatus: VerificationStatus = action === "APPROVE" ? "Verified" : "Rejected";

      const updatedItem: VerificationSubmission = {
        ...current,
        status: newStatus,
        reviewedAt: new Date().toISOString(),
        ...(action === "REJECT"
          ? {
              rejectionCategory: rejectionCategory || "Details don't match ID card",
              rejectionNotes: rejectionNotes || "Please submit a clear, valid college ID card.",
            }
          : {
              rejectionCategory: undefined,
              rejectionNotes: undefined,
            }),
      };

      // Update target and ensure no other duplicate records for this student remain
      const normalizedUserId = current.userId?.trim();
      const normalizedEmail = current.email?.trim().toLowerCase();

      const updatedList = submissions.filter((s) => {
        if (s.verificationId === verificationId) return false;
        const isSameStudent =
          (normalizedUserId && s.userId === normalizedUserId) ||
          (normalizedEmail && s.email.trim().toLowerCase() === normalizedEmail);
        return !isSameStudent;
      });

      updatedList.unshift(updatedItem);
      saveSubmissions(updatedList);

      // Update target student's own data by userId (NEVER touch admin's profile)
      try {
        await profileService.updateProfileForUser(current.userId, {
          verificationStatus: newStatus,
          verificationReason: updatedItem.rejectionNotes,
        });
      } catch (e) {
        console.warn("Profile sync error on review:", e);
      }

      // If active auth user matches reviewed student, update auth cache as well
      try {
        const storedUserRaw = localStorage.getItem("ai_interview_prep_user");
        if (storedUserRaw) {
          const authUser = JSON.parse(storedUserRaw);
          if (authUser?.userId === current.userId || (normalizedEmail && authUser?.email?.toLowerCase() === normalizedEmail)) {
            localStorage.setItem(
              "ai_interview_prep_user",
              JSON.stringify({ ...authUser, verificationStatus: newStatus })
            );
          }
        }
      } catch {
        // ignore
      }

      // Notify student
      try {
        if (action === "APPROVE") {
          await notificationService.notifyUser(current.userId, {
            audience: "STUDENT",
            type: "verification",
            title: "Identity Verified",
            message: "Your identity is verified - all features unlocked.",
            link: "/dashboard",
            priority: "success",
          });
        } else {
          await notificationService.notifyUser(current.userId, {
            audience: "STUDENT",
            type: "verification",
            title: "Verification Rejected",
            message: updatedItem.rejectionNotes
              ? `Verification rejected: ${updatedItem.rejectionNotes}`
              : "Verification rejected. Please re-upload a valid college ID.",
            link: "/verify-identity",
            priority: "danger",
          });
        }
      } catch (e) {
        console.warn("Could not dispatch review notification:", e);
      }

      // Notify all tabs / components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("verification-updated", {
            detail: { userId: current.userId, status: newStatus },
          })
        );
      }

      return updatedItem;
    }

    // Backend review call: POST /api/v1/admin/verifications/{verificationId}/review
    const res = await api.post(`/api/v1/admin/verifications/${verificationId}/review`, {
      action,
      rejectionCategory: action === "REJECT" ? (rejectionCategory || "Details don't match ID card") : undefined,
      rejectionNotes: action === "REJECT" ? (rejectionNotes || "Please submit a clear, valid college ID card.") : undefined,
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("verification-updated", {
          detail: { userId: res.data?.userId, status: res.data?.status },
        })
      );
    }

    return res.data;
  },

  async reviewVerificationByStudent(
    userId: string,
    email: string,
    action: "APPROVE" | "REJECT",
    rejectionCategory?: string,
    rejectionNotes?: string
  ): Promise<VerificationSubmission> {
    if (isMockMode()) {
      await delay(100);
      const submissions = getStoredSubmissions();
      const normalizedUserId = userId.trim();
      const normalizedEmail = email.trim().toLowerCase();

      const existing = submissions.find(
        (s) =>
          (normalizedUserId && s.userId === normalizedUserId) ||
          (normalizedEmail && s.email.trim().toLowerCase() === normalizedEmail)
      );

      const newStatus: VerificationStatus = action === "APPROVE" ? "Verified" : "Rejected";
      const updatedItem: VerificationSubmission = existing
        ? {
            ...existing,
            status: newStatus,
            reviewedAt: new Date().toISOString(),
            ...(action === "REJECT"
              ? {
                  rejectionCategory: rejectionCategory || "Details don't match ID card",
                  rejectionNotes: rejectionNotes || "Please submit a clear, valid college ID card.",
                }
              : {
                  rejectionCategory: undefined,
                  rejectionNotes: undefined,
                }),
          }
        : {
            verificationId: `VER-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            userId,
            studentName: "Student User",
            email,
            collegeName: "SRM Institute of Science and Technology",
            rollNumber: "REG-001",
            courseBranch: "B.Tech CSE",
            yearSemester: "Year 1",
            idCardFrontUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
            submittedAt: new Date().toISOString(),
            reviewedAt: new Date().toISOString(),
            status: newStatus,
            ...(action === "REJECT"
              ? {
                  rejectionCategory: rejectionCategory || "Details don't match ID card",
                  rejectionNotes: rejectionNotes || "Please submit a clear, valid college ID card.",
                }
              : {}),
          };

      const updatedList = submissions.filter((s) => {
        const isSame =
          (normalizedUserId && s.userId === normalizedUserId) ||
          (normalizedEmail && s.email.trim().toLowerCase() === normalizedEmail);
        return !isSame;
      });

      updatedList.unshift(updatedItem);
      saveSubmissions(updatedList);

      // Update student profile
      try {
        await profileService.updateProfileForUser(userId, {
          verificationStatus: newStatus,
          verificationReason: updatedItem.rejectionNotes,
        });
      } catch (e) {
        console.warn("Profile sync error on review:", e);
      }

      // If active auth user matches reviewed student, update auth cache as well
      try {
        const storedUserRaw = localStorage.getItem("ai_interview_prep_user");
        if (storedUserRaw) {
          const authUser = JSON.parse(storedUserRaw);
          if (authUser?.userId === userId || (normalizedEmail && authUser?.email?.toLowerCase() === normalizedEmail)) {
            localStorage.setItem(
              "ai_interview_prep_user",
              JSON.stringify({ ...authUser, verificationStatus: newStatus })
            );
          }
        }
      } catch {
        // ignore
      }

      // Notify student
      try {
        if (action === "APPROVE") {
          await notificationService.notifyUser(userId, {
            audience: "STUDENT",
            type: "verification",
            title: "Identity Verified",
            message: "Your identity is verified - all features unlocked.",
            link: "/dashboard",
            priority: "success",
          });
        } else {
          await notificationService.notifyUser(userId, {
            audience: "STUDENT",
            type: "verification",
            title: "Verification Rejected",
            message: updatedItem.rejectionNotes
              ? `Verification rejected: ${updatedItem.rejectionNotes}`
              : "Verification rejected. Please re-upload a valid college ID.",
            link: "/verify-identity",
            priority: "danger",
          });
        }
      } catch (e) {
        console.warn("Could not dispatch review notification:", e);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("verification-updated", {
            detail: { userId, status: newStatus },
          })
        );
      }

      return updatedItem;
    }

    // In backend mode, locate verification by student ID/email and call reviewVerification
    const allSubs = await this.getAllSubmissions();
    const normalizedUserId = userId?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    const matched = allSubs.find(
      (s) =>
        (normalizedUserId && (s.userId === normalizedUserId || s.verificationId === normalizedUserId)) ||
        (normalizedEmail && s.email?.trim().toLowerCase() === normalizedEmail)
    );

    if (matched && matched.verificationId) {
      return this.reviewVerification(matched.verificationId, action, rejectionCategory, rejectionNotes);
    }

    // Fallback if userId was directly the verificationId
    return this.reviewVerification(userId, action, rejectionCategory, rejectionNotes);
  },
};
