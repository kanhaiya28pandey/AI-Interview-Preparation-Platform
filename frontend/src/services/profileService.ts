import api from "@/lib/api";
import { mockUserProfile, createEmptyProfile, UserProfile, calculateProfileCompletion } from "@/mocks/profileData";

const STORAGE_KEY = "ai_interview_prep_profile";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getStoredProfile = (): UserProfile => {
  let activeUser: { userId?: string; name?: string; email?: string; role?: string } | null = null;
  let isDemoSession = false;

  try {
    const storedUserRaw = localStorage.getItem("ai_interview_prep_user");
    isDemoSession = localStorage.getItem("ai_interview_prep_demo") === "true";
    if (storedUserRaw) {
      activeUser = JSON.parse(storedUserRaw);
    }
  } catch (e) {
    console.error("Failed to parse stored auth user:", e);
  }

  const userId = activeUser?.userId || "anonymous-usr";
  const isDemoUser = isDemoSession || userId.startsWith("demo-usr-");
  const userKey = `${STORAGE_KEY}_${userId}`;

  try {
    const raw = localStorage.getItem(userKey);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      if (activeUser?.name) parsed.name = activeUser.name;
      if (activeUser?.email) parsed.email = activeUser.email;
      if (activeUser?.role) parsed.role = activeUser.role;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse stored profile:", e);
  }

  // Create initial profile for user
  let initialProfile: UserProfile;
  if (isDemoUser) {
    initialProfile = {
      ...mockUserProfile,
      userId: userId,
      name: activeUser?.name || mockUserProfile.name,
      email: activeUser?.email || mockUserProfile.email,
      role: activeUser?.role || mockUserProfile.role,
    };
  } else {
    initialProfile = createEmptyProfile({
      userId: userId,
      name: activeUser?.name || "User",
      email: activeUser?.email || "",
      role: activeUser?.role || "STUDENT",
    });
  }

  localStorage.setItem(userKey, JSON.stringify(initialProfile));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));
  return initialProfile;
};

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const token = localStorage.getItem("ai_interview_prep_token");
      if (token && !token.includes("demo-")) {
        const response = await api.get<UserProfile>("/api/v1/profile");
        if (response.data && response.data.name) {
          return response.data;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));

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

  getCompletionPercentage(profile: Partial<UserProfile>): number {
    return calculateProfileCompletion(profile);
  },
};
