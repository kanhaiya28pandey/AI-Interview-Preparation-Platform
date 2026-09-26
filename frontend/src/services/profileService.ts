import { mockUserProfile, UserProfile } from "@/mocks/profileData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let currentProfile = { ...mockUserProfile };

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    if (USE_MOCKS) {
      await delay(250);
      return { ...currentProfile };
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (USE_MOCKS) {
      await delay(400);
      currentProfile = { ...currentProfile, ...updates };
      return { ...currentProfile };
    }
    throw new Error("Real backend endpoint not implemented");
  },
};
