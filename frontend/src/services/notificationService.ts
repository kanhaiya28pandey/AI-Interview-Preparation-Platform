import { getScopedItem, setScopedItem } from "@/lib/userScope";
import api from "@/lib/api";

export type NotificationType =
  | "verification"
  | "interview"
  | "coding"
  | "quiz"
  | "resume"
  | "placement"
  | "streak"
  | "profile"
  | "content"
  | "support"
  | "system";

export type NotificationPriority = "info" | "success" | "warning" | "danger";

export interface AppNotification {
  id: string;
  userId: string; // recipient userId, or "admin_inbox" or "student_broadcast"
  audience: "STUDENT" | "ADMIN" | "ALL";
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO
  read: boolean;
  link?: string; // Route to navigate on click
  priority?: NotificationPriority;
  meta?: Record<string, unknown>;
}

const STORAGE_KEY = "notifications";
const ADMIN_INBOX_ID = "admin_inbox";
const BROADCAST_INBOX_ID = "student_broadcast";
const MAX_NOTIFICATIONS = 50;

const DEMO_STUDENT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-demo-1",
    userId: "demo-usr-student-01",
    audience: "STUDENT",
    type: "interview",
    title: "Mock Interview Scored",
    message: "Senior Frontend Engineer mock interview rating: 89/100.",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    link: "/mock-interview",
    priority: "success",
  },
  {
    id: "notif-demo-2",
    userId: "demo-usr-student-01",
    audience: "STUDENT",
    type: "placement",
    title: "Placement Drive Alert",
    message: "Amazon SDE Benchmark test schedule is now active in Coding Arena.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    link: "/coding",
    priority: "info",
  },
  {
    id: "notif-demo-3",
    userId: "demo-usr-student-01",
    audience: "STUDENT",
    type: "streak",
    title: "Daily Practice Streak",
    message: "12 days in a row! You're in the top 5% daily momentum on campus.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
    link: "/dashboard",
    priority: "warning",
  },
];

const DEMO_ADMIN_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-demo-admin-1",
    userId: ADMIN_INBOX_ID,
    audience: "ADMIN",
    type: "verification",
    title: "New Verification Submission",
    message: "College ID verification pending review for 2 registered students.",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    read: false,
    link: "/admin/verifications",
    priority: "warning",
  },
  {
    id: "notif-demo-admin-2",
    userId: ADMIN_INBOX_ID,
    audience: "ADMIN",
    type: "system",
    title: "Platform Health Operational",
    message: "AI evaluation models and coding sandbox runners are active.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    read: true,
    link: "/admin",
    priority: "info",
  },
];

type SubscriptionCallback = () => void;
const subscribers = new Set<SubscriptionCallback>();

const notifySubscribers = () => {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error("Error in notification subscriber callback:", err);
    }
  });
};

// Global cross-tab listener
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key || e.key.includes("notifications")) {
      notifySubscribers();
    }
  });

  window.addEventListener("notifications-updated", () => {
    notifySubscribers();
  });
}

export const notificationService = {
  /**
   * List notifications for a given user.
   * If user is an admin, merges their personal notifications with the shared admin inbox.
   * If user is a student, merges their personal notifications with student broadcast notifications.
   */
  async list(userId: string, isAdminUser = false): Promise<AppNotification[]> {
    const isDemoStudent = userId === "demo-usr-student-01";
    const isDemoAdmin = userId === "demo-usr-admin-01";

    const defaultPersonal = isDemoStudent ? DEMO_STUDENT_NOTIFICATIONS : [];
    const personal = getScopedItem<AppNotification[]>(userId, STORAGE_KEY, defaultPersonal);

    let combined: AppNotification[] = [...personal];

    if (isAdminUser) {
      const defaultAdmin = isDemoAdmin ? DEMO_ADMIN_NOTIFICATIONS : [];
      const adminInbox = getScopedItem<AppNotification[]>(ADMIN_INBOX_ID, STORAGE_KEY, defaultAdmin);
      
      const seenIds = new Set(combined.map((n) => n.id));
      adminInbox.forEach((item) => {
        if (!seenIds.has(item.id)) {
          combined.push(item);
          seenIds.add(item.id);
        }
      });
    } else {
      // Student broadcast inbox
      const broadcastInbox = getScopedItem<AppNotification[]>(BROADCAST_INBOX_ID, STORAGE_KEY, []);
      const seenIds = new Set(combined.map((n) => n.id));
      broadcastInbox.forEach((item) => {
        if (!seenIds.has(item.id)) {
          combined.push(item);
          seenIds.add(item.id);
        }
      });
    }

    // Backend-ready: attempt to fetch remote notifications if real non-demo token exists
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("ai_interview_prep_token") : null;
      if (token && !token.includes("demo-")) {
        const res = await api.get<AppNotification[]>("/api/v1/notifications", { timeout: 3000 });
        if (Array.isArray(res.data) && res.data.length > 0) {
          const idMap = new Map<string, AppNotification>();
          combined.forEach((n) => idMap.set(n.id, n));
          res.data.forEach((remote) => idMap.set(remote.id, remote));
          combined = Array.from(idMap.values());
        }
      }
    } catch {
      // Silently fall back to local storage
    }

    // Sort newest first
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Add a notification for a specific recipient or inbox.
   * Automatically de-duplicates rapid repeats within 60s and caps at 50 items.
   */
  async add(
    notification: Omit<AppNotification, "id" | "createdAt" | "read"> &
      Partial<Pick<AppNotification, "id" | "createdAt" | "read">>
  ): Promise<AppNotification | null> {
    const targetUserId = notification.userId || "guest_user";
    const existing = getScopedItem<AppNotification[]>(targetUserId, STORAGE_KEY, []);

    const now = new Date();
    const createdAt = notification.createdAt || now.toISOString();
    const nowMs = now.getTime();

    // Deduplication check: same type and title within 60s
    const isDuplicate = existing.some((item) => {
      if (item.type !== notification.type || item.title !== notification.title) {
        return false;
      }
      const itemTime = new Date(item.createdAt).getTime();
      return Math.abs(nowMs - itemTime) < 60000;
    });

    if (isDuplicate) {
      return null;
    }

    const newNotification: AppNotification = {
      ...notification,
      id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: targetUserId,
      createdAt,
      read: notification.read ?? false,
    };

    const updated = [newNotification, ...existing].slice(0, MAX_NOTIFICATIONS);
    setScopedItem(targetUserId, STORAGE_KEY, updated);

    // Broadcast change
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("notifications-updated", {
          detail: { userId: targetUserId, notification: newNotification },
        })
      );
    }
    notifySubscribers();

    return newNotification;
  },

  /**
   * Convenience method to notify a specific user
   */
  async notifyUser(
    userId: string,
    notification: Omit<AppNotification, "id" | "createdAt" | "read" | "userId">
  ): Promise<AppNotification | null> {
    if (!userId) return null;
    return this.add({
      ...notification,
      userId,
    });
  },

  /**
   * Convenience method to broadcast a notification to all admins
   */
  async notifyAdmins(
    notification: Omit<AppNotification, "id" | "createdAt" | "read" | "userId" | "audience">
  ): Promise<AppNotification | null> {
    return this.add({
      ...notification,
      userId: ADMIN_INBOX_ID,
      audience: "ADMIN",
    });
  },

  /**
   * Convenience method to broadcast a notification to all students
   */
  async notifyAllStudents(
    notification: Omit<AppNotification, "id" | "createdAt" | "read" | "userId" | "audience">
  ): Promise<AppNotification | null> {
    return this.add({
      ...notification,
      userId: BROADCAST_INBOX_ID,
      audience: "STUDENT",
    });
  },

  /**
   * Mark a single notification as read
   */
  async markRead(userId: string, id: string): Promise<void> {
    const updateInScope = (scopeId: string) => {
      const items = getScopedItem<AppNotification[]>(scopeId, STORAGE_KEY, []);
      let changed = false;
      const updated = items.map((item) => {
        if (item.id === id && !item.read) {
          changed = true;
          return { ...item, read: true };
        }
        return item;
      });
      if (changed) {
        setScopedItem(scopeId, STORAGE_KEY, updated);
      }
      return changed;
    };

    updateInScope(userId);
    updateInScope(ADMIN_INBOX_ID);
    updateInScope(BROADCAST_INBOX_ID);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("ai_interview_prep_token") : null;
      if (token && !token.includes("demo-")) {
        await api.patch(`/api/v1/notifications/${id}/read`, {}, { timeout: 2000 });
      }
    } catch {
      // ignore
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    }
    notifySubscribers();
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllRead(userId: string, isAdminUser = false): Promise<void> {
    const markScope = (scopeId: string) => {
      const items = getScopedItem<AppNotification[]>(scopeId, STORAGE_KEY, []);
      const updated = items.map((item) => ({ ...item, read: true }));
      setScopedItem(scopeId, STORAGE_KEY, updated);
    };

    markScope(userId);
    if (isAdminUser) {
      markScope(ADMIN_INBOX_ID);
    } else {
      markScope(BROADCAST_INBOX_ID);
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("ai_interview_prep_token") : null;
      if (token && !token.includes("demo-")) {
        await api.post("/api/v1/notifications/read-all", {}, { timeout: 2000 });
      }
    } catch {
      // ignore
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    }
    notifySubscribers();
  },

  /**
   * Delete a single notification
   */
  async remove(userId: string, id: string): Promise<void> {
    const removeFromScope = (scopeId: string) => {
      const items = getScopedItem<AppNotification[]>(scopeId, STORAGE_KEY, []);
      const updated = items.filter((item) => item.id !== id);
      setScopedItem(scopeId, STORAGE_KEY, updated);
    };

    removeFromScope(userId);
    removeFromScope(ADMIN_INBOX_ID);
    removeFromScope(BROADCAST_INBOX_ID);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    }
    notifySubscribers();
  },

  /**
   * Clear all notifications for a user
   */
  async clearAll(userId: string, isAdminUser = false): Promise<void> {
    setScopedItem(userId, STORAGE_KEY, []);
    if (isAdminUser) {
      setScopedItem(ADMIN_INBOX_ID, STORAGE_KEY, []);
    } else {
      setScopedItem(BROADCAST_INBOX_ID, STORAGE_KEY, []);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    }
    notifySubscribers();
  },

  /**
   * Subscribe to notification updates
   */
  subscribe(callback: SubscriptionCallback): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },
};
