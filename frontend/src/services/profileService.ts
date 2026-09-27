import { mockUserProfile, UserProfile, calculateProfileCompletion } from "@/mocks/profileData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const STORAGE_KEY = "ai_interview_prep_profile";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getStoredProfile = (): UserProfile => {
  let activeUser: { userId?: string; name?: string; email?: string; role?: string } | null = null;
  try {
    const storedUserRaw = localStorage.getItem("ai_interview_prep_user");
    if (storedUserRaw) {
      activeUser = JSON.parse(storedUserRaw);
    }
  } catch (e) {
    console.error("Failed to parse stored auth user:", e);
  }

  const userId = activeUser?.userId || mockUserProfile.userId;
  const userKey = `${STORAGE_KEY}_${userId}`;

  try {
    const raw = localStorage.getItem(userKey);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      if (activeUser?.name) parsed.name = activeUser.name;
      if (activeUser?.email) parsed.email = activeUser.email;
      if (activeUser?.role) parsed.role = activeUser.role;
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse stored profile:", e);
  }

  // Create profile tied to active user
  const initialProfile: UserProfile = {
    ...mockUserProfile,
    userId: userId,
    name: activeUser?.name || mockUserProfile.name,
    email: activeUser?.email || mockUserProfile.email,
    role: activeUser?.role || mockUserProfile.role,
  };

  localStorage.setItem(userKey, JSON.stringify(initialProfile));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));
  return initialProfile;
};

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    if (USE_MOCKS) {
      await delay(200);
      return getStoredProfile();
    }
    throw new Error("Real backend endpoint /api/v1/profile not implemented");
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (USE_MOCKS) {
      await delay(300);
      const current = getStoredProfile();
      const updatedProfile: UserProfile = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Ensure flat skills list is synced if skillsList updated
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      return updatedProfile;
    }
    throw new Error("Real backend endpoint not implemented");
  },

  getCompletionPercentage(profile: Partial<UserProfile>): number {
    return calculateProfileCompletion(profile);
  },
};
