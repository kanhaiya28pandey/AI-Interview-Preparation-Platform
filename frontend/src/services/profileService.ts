import api from "@/lib/api";
import { mockUserProfile, UserProfile, calculateProfileCompletion, createEmptyProfile } from "@/mocks/profileData";
import { notificationService } from "./notificationService";
import { isDemoUser } from "@/lib/userScope";

const STORAGE_KEY = "ai_interview_prep_profile";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const sanitizeRealUserProfile = (profile: UserProfile, activeUser?: any): UserProfile => {
  const isDemo = isDemoUser(profile.userId);
  if (isDemo) return profile;

  const sanitized: UserProfile = {
    ...profile,
  };

  // 1. Avatar: if not a custom user-uploaded avatar or if it's the mock photo, reset to empty
  if (!sanitized.isCustomAvatar || sanitized.avatar?.includes("photo-1534528741775-53994a69daeb") || sanitized.avatar?.includes("default")) {
    sanitized.avatar = "";
    sanitized.isCustomAvatar = false;
  }

  // 2. Headline & Bio defaults
  if (
    sanitized.headline === "Aspiring Software Engineer" ||
    sanitized.headline === "Aspiring Full Stack Engineer | MCA / B.Tech CS Student"
  ) {
    sanitized.headline = "";
  }
  if (
    sanitized.bio?.includes("Dedicated computer science student passionate about building scalable") ||
    sanitized.bio?.includes("Passionate Computer Science student specializing in React")
  ) {
    sanitized.bio = "";
  }

  // 3. Resume URL default
  if (sanitized.resumeUrl === "Resume_Kanhaiya_Pandey.pdf") {
    sanitized.resumeUrl = "";
  }

  // 4. Default Stats: reset fake scores if user hasn't completed real challenges
  if (sanitized.stats) {
    const hasRealActivity =
      (sanitized.stats.codingProblemsSolved || 0) > 0 ||
      (sanitized.stats.mockInterviewsCompleted || 0) > 0 ||
      (sanitized.stats.quizzesCompleted || 0) > 0;

    if (!hasRealActivity) {
      sanitized.stats = {
        totalPracticeSessions: 0,
        codingProblemsSolved: 0,
        mockInterviewsCompleted: 0,
        quizzesCompleted: 0,
        overallRating: 0,
        currentStreak: 0,
        totalXP: 0,
      };
    }
  }

  // 5. If education or skills match sample fingerprint exactly, reset to empty
  if (
    sanitized.educationEntries &&
    sanitized.educationEntries.length === 1 &&
    sanitized.educationEntries[0].institution === "SRM Institute of Science and Technology" &&
    sanitized.educationEntries[0].grade === "8.85 / 10 CGPA" &&
    activeUser?.college !== "SRM Institute of Science and Technology"
  ) {
    sanitized.educationEntries = [];
  }

  if (
    sanitized.schoolEducation?.percentage10th === "94.2%" &&
    sanitized.schoolEducation?.percentage12th === "92.8%"
  ) {
    sanitized.schoolEducation = {
      board10th: "",
      school10th: "",
      year10th: "",
      percentage10th: "",
      board12th: "",
      school12th: "",
      year12th: "",
      percentage12th: "",
    };
  }

  return sanitized;
};

export const migrateSampleDataForRealUsers = (
  userId: string,
  activeUser?: { userId?: string; name?: string; email?: string; role?: string; college?: string; phone?: string; verificationStatus?: any; verificationId?: string } | null
): UserProfile | null => {
  if (!userId) return null;
  if (isDemoUser(userId)) return null;

  // Clear legacy global un-scoped key
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  const migrationKey = `data_migration_v3_${userId}`;
  const alreadyMigrated = localStorage.getItem(migrationKey) === "true";
  const userKey = `${STORAGE_KEY}_${userId}`;

  try {
    const raw = localStorage.getItem(userKey);
    if (!raw) {
      const cleanProfile = createEmptyProfile({
        userId,
        name: activeUser?.name || "Student User",
        email: activeUser?.email || "",
        role: activeUser?.role || "STUDENT",
        college: activeUser?.college || "",
        phone: activeUser?.phone || "",
        verificationStatus: activeUser?.verificationStatus || "Unverified",
        verificationId: activeUser?.verificationId,
      });
      localStorage.setItem(userKey, JSON.stringify(cleanProfile));
      localStorage.setItem(migrationKey, "true");
      return cleanProfile;
    }

    const parsed: UserProfile = JSON.parse(raw);
    const sanitized = sanitizeRealUserProfile(parsed, activeUser);

    if (!alreadyMigrated || JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
      localStorage.setItem(userKey, JSON.stringify(sanitized));
      localStorage.setItem(migrationKey, "true");
      return sanitized;
    }
  } catch (e) {
    console.error("Failed to run migrateSampleDataForRealUsers:", e);
  }

  localStorage.setItem(migrationKey, "true");
  return null;
};

const getStoredProfile = (): UserProfile => {
  let activeUser: { userId?: string; name?: string; email?: string; role?: string; college?: string; phone?: string; verificationStatus?: any; verificationId?: string } | null = null;
  try {
    const storedUserRaw = localStorage.getItem("ai_interview_prep_user");
    if (storedUserRaw) {
      activeUser = JSON.parse(storedUserRaw);
    }
  } catch (e) {
    console.error("Failed to parse stored auth user:", e);
  }

  const isDemo = isDemoUser(activeUser?.userId);
  const userId = activeUser?.userId || (isDemo ? mockUserProfile.userId : "guest_user");
  const userKey = `${STORAGE_KEY}_${userId}`;

  // If real user, run migration
  if (!isDemo && userId !== "guest_user") {
    const migrated = migrateSampleDataForRealUsers(userId, activeUser);
    if (migrated) return migrated;
  }

  try {
    const raw = localStorage.getItem(userKey);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      if (isDemo) return parsed;
      const sanitized = sanitizeRealUserProfile(parsed, activeUser);
      if (activeUser?.name) sanitized.name = activeUser.name;
      if (activeUser?.email) sanitized.email = activeUser.email;
      if (activeUser?.role) sanitized.role = activeUser.role;
      return sanitized;
    }
  } catch (e) {
    console.error("Failed to parse stored profile:", e);
  }

  // Only demo accounts use mockUserProfile fallback; real users start empty
  const initialProfile: UserProfile = isDemo
    ? {
        ...mockUserProfile,
        userId: userId,
        name: activeUser?.name || mockUserProfile.name,
        email: activeUser?.email || mockUserProfile.email,
        role: activeUser?.role || mockUserProfile.role,
      }
    : createEmptyProfile(activeUser);

  localStorage.setItem(userKey, JSON.stringify(initialProfile));
  return initialProfile;
};

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const token = localStorage.getItem("ai_interview_prep_token");
      if (token && !token.includes("demo-")) {
        const response = await api.get<UserProfile>("/api/v1/profile");
        if (response.data && response.data.name) {
          const sanitized = sanitizeRealUserProfile(response.data);
          // Cache to per-user key
          if (sanitized.userId) {
            localStorage.setItem(`${STORAGE_KEY}_${sanitized.userId}`, JSON.stringify(sanitized));
          }
          return sanitized;
        }
      }
    } catch (err) {
      console.warn("Could not load backend profile, falling back to local dataset:", err);
    }
    await delay(100);
    return getStoredProfile();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = getStoredProfile();
    const updatedProfile: UserProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.skillsList) {
      updatedProfile.skills = updates.skillsList.map((s) => s.name);
    }

    const activeUserRaw = localStorage.getItem("ai_interview_prep_user");
    let userId = current.userId;
    if (activeUserRaw) {
      try {
        const activeUser = JSON.parse(activeUserRaw);
        if (activeUser?.userId) userId = activeUser.userId;
        if (updates.name || updates.email) {
          const updatedAuth = {
            ...activeUser,
            ...(updates.name ? { name: updates.name } : {}),
            ...(updates.email ? { email: updates.email } : {}),
          };
          localStorage.setItem("ai_interview_prep_user", JSON.stringify(updatedAuth));
        }
      } catch (e) {
        console.error("Failed to parse active user during updateProfile:", e);
      }
    }

    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updatedProfile));

    // Check completion milestones (50%, 80%, 100%)
    try {
      const prevPct = calculateProfileCompletion(current);
      const newPct = calculateProfileCompletion(updatedProfile);
      const milestones = [50, 80, 100];
      for (const m of milestones) {
        if (prevPct < m && newPct >= m && userId) {
          notificationService.notifyUser(userId, {
            audience: "STUDENT",
            type: "profile",
            title: `Profile Milestone: ${m}% Complete`,
            message: `Your profile is now ${newPct}% complete. Great progress!`,
            link: "/profile",
            priority: m === 100 ? "success" : "info",
          }).catch(() => {});
        }
      }
    } catch {
      // ignore
    }

    try {
      const token = localStorage.getItem("ai_interview_prep_token");
      if (token && !token.includes("demo-")) {
        await api.put("/api/v1/profile", updatedProfile);
      }
    } catch (err) {
      console.warn("Could not sync profile update with backend:", err);
    }

    return updatedProfile;
  },

  async updateProfileForUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const userKey = `${STORAGE_KEY}_${userId}`;
    let profile: UserProfile;
    try {
      const raw = localStorage.getItem(userKey);
      if (raw) {
        profile = JSON.parse(raw);
      } else {
        profile = createEmptyProfile({ userId });
      }
    } catch {
      profile = createEmptyProfile({ userId });
    }

    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.skillsList) {
      updatedProfile.skills = updates.skillsList.map((s) => s.name);
    }

    localStorage.setItem(userKey, JSON.stringify(updatedProfile));

    // If active logged-in user matches this student, also keep their session verification status in sync
    try {
      const activeUserRaw = localStorage.getItem("ai_interview_prep_user");
      if (activeUserRaw) {
        const activeUser = JSON.parse(activeUserRaw);
        if (activeUser?.userId === userId) {
          const updatedAuth = {
            ...activeUser,
            ...(updates.verificationStatus ? { verificationStatus: updates.verificationStatus } : {}),
          };
          localStorage.setItem("ai_interview_prep_user", JSON.stringify(updatedAuth));
        }
      }
    } catch {
      // ignore
    }

    return updatedProfile;
  },

  getCompletionPercentage(profile: Partial<UserProfile>): number {
    return calculateProfileCompletion(profile);
  },
};
