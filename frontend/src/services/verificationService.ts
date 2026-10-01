import {
  VerificationSubmission,
  VerificationStatus,
  INITIAL_MOCK_VERIFICATIONS,
} from "@/mocks/verifications";
import { profileService } from "@/services/profileService";

const STORAGE_KEY = "ai_interview_prep_verifications";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getStoredSubmissions = (): VerificationSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse stored verifications:", e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_VERIFICATIONS));
  return INITIAL_MOCK_VERIFICATIONS;
};

const saveSubmissions = (items: VerificationSubmission[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const verificationService = {
  async getVerificationStatus(
    userId: string,
    email?: string
  ): Promise<{ status: VerificationStatus; submission?: VerificationSubmission }> {
    await delay(100);

    // Demo accounts and admins remain verified by default
    if (userId === "demo-usr-student-01" || userId === "demo-usr-admin-01" || email?.includes("demo") || email?.includes("admin")) {
      const demoSub = INITIAL_MOCK_VERIFICATIONS.find((v) => v.userId === "usr-student-01");
      return {
        status: "Verified",
        submission: demoSub || {
          verificationId: "VER-DEMO-001",
          userId,
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
    const match = submissions.find(
      (s) => s.userId === userId || (email && s.email.toLowerCase() === email.toLowerCase())
    );

    if (match) {
      return { status: match.status, submission: match };
    }

    // Check stored user verification status from backend auth
    try {
      const storedUserRaw = localStorage.getItem("ai_interview_prep_user");
      if (storedUserRaw) {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed.verificationStatus && parsed.verificationStatus === "Verified") {
          return { status: "Verified" };
        }
      }
    } catch {
      // ignore
    }

    // Default authenticated students to Verified so full platform tracks and arena are accessible
    return { status: "Verified" };
  },

  async submitVerification(
    data: Omit<VerificationSubmission, "verificationId" | "submittedAt" | "status">
  ): Promise<VerificationSubmission> {
    if (USE_MOCKS) {
      await delay(400);
      const submissions = getStoredSubmissions();
      
      const newRefId = `VER-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newSubmission: VerificationSubmission = {
        ...data,
        verificationId: newRefId,
        submittedAt: new Date().toISOString(),
        status: "Pending Verification",
      };

      // Filter out previous submissions for this user/email if resubmitting
      const updated = [
        newSubmission,
        ...submissions.filter(
          (s) => s.userId !== data.userId && s.email.toLowerCase() !== data.email.toLowerCase()
        ),
      ];

      saveSubmissions(updated);

      // Sync status to local profile
      try {
        await profileService.updateProfile({
          verificationStatus: "Pending Verification",
          verificationId: newRefId,
        });
      } catch (e) {
        console.warn("Could not sync profile verification status:", e);
      }

      return newSubmission;
    }
    throw new Error("Real backend verification submission endpoint not implemented");
  },

  async getAllSubmissions(): Promise<VerificationSubmission[]> {
    if (USE_MOCKS) {
      await delay(200);
      return getStoredSubmissions();
    }
    throw new Error("Real backend verifications list endpoint not implemented");
  },

  async reviewVerification(
    verificationId: string,
    action: "APPROVE" | "REJECT",
    rejectionCategory?: string,
    rejectionNotes?: string
  ): Promise<VerificationSubmission> {
    if (USE_MOCKS) {
      await delay(350);
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

      submissions[targetIndex] = updatedItem;
      saveSubmissions(submissions);

      // Sync profile status if current user matches
      try {
        await profileService.updateProfile({
          verificationStatus: newStatus,
          verificationReason: updatedItem.rejectionNotes,
        });
      } catch (e) {
        console.warn("Profile sync error on review:", e);
      }

      return updatedItem;
    }
    throw new Error("Real backend verification review endpoint not implemented");
  },

  async deleteRejectedVerification(verificationId: string): Promise<void> {
    if (USE_MOCKS) {
      await delay(250);
      const submissions = getStoredSubmissions();
      const target = submissions.find(
        (s) => s.verificationId === verificationId || s.userId === verificationId
      );

      if (!target) {
        throw new Error(`Verification record ${verificationId} not found`);
      }

      if (target.status !== "Rejected") {
        throw new Error(`Cannot delete verification with status '${target.status}'. Only REJECTED profiles can be deleted.`);
      }

      const filtered = submissions.filter(
        (s) => s.verificationId !== verificationId && s.userId !== verificationId
      );
      saveSubmissions(filtered);
      return;
    }
    const response = await fetch(`/api/v1/admin/verifications/${verificationId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Failed to delete rejected verification" }));
      throw new Error(err.message || "Failed to delete rejected verification");
    }
  },

  async deleteBulkRejectedVerifications(verificationIds: string[]): Promise<number> {
    if (USE_MOCKS) {
      await delay(350);
      let deleted = 0;
      for (const id of verificationIds) {
        await this.deleteRejectedVerification(id);
        deleted++;
      }
      return deleted;
    }
    const response = await fetch(`/api/v1/admin/verifications/rejected`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verificationIds),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Failed to bulk delete rejected verifications" }));
      throw new Error(err.message || "Failed to bulk delete rejected verifications");
    }
    const resData = await response.json();
    return resData.count || verificationIds.length;
  },
};
