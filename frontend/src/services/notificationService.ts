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
  | "system"
  | "contest";

export type NotificationPriority = "info" | "success" | "warning" | "danger";

export interface AppNotification {
  id: string;
  userId: string; // recipient userId, or "admin_inbox" or "student_broadcast"
  audience: "STUDENT" | "ADMIN" | "ALL" | "USER" | "STUDENT_BROADCAST";
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO
  read: boolean;
  link?: string; // Route to navigate on click
  priority?: NotificationPriority;
  meta?: Record<string, unknown>;
}

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

const getStorageKey = (userId: string, isAdminUser: boolean) =>
  `ai_prep_notifs_${isAdminUser ? "admin" : (userId || "student")}`;

let eventSource: EventSource | null = null;
let currentStreamUser = "";

const connectSseStream = (userId: string, isAdminUser: boolean) => {
  if (typeof window === "undefined" || !window.EventSource) return;

  const streamKey = `${userId}_${isAdminUser}`;
  if (eventSource && currentStreamUser === streamKey) {
    return;
  }

  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  currentStreamUser = streamKey;
  const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || "";
  const url = `${baseUrl}/api/v1/notifications/stream?userId=${encodeURIComponent(userId)}&role=${isAdminUser ? "ADMIN" : "STUDENT"}`;

  try {
    const es = new EventSource(url);
    eventSource = es;

    es.addEventListener("NOTIFICATION", () => {
      try {
        notifySubscribers();
      } catch (err) {
        console.warn("Error handling SSE notification event:", err);
      }
    });

    es.onerror = () => {
      // Reconnect silently handled by browser EventSource
    };
  } catch (err) {
    console.warn("Could not initiate Notification EventSource stream:", err);
  }
};

export const notificationService = {
  /**
   * Connect real-time SSE stream for the active user session
   */
  startStream(userId: string, isAdminUser: boolean) {
    connectSseStream(userId, isAdminUser);
  },

  /**
   * List notifications for a given user from the real backend API
   */
  async list(userId: string, isAdminUser = false): Promise<AppNotification[]> {
    connectSseStream(userId, isAdminUser);

    try {
      const res = await api.get<AppNotification[]>(
        `/api/v1/notifications?userId=${encodeURIComponent(userId)}&role=${isAdminUser ? "ADMIN" : "STUDENT"}`
      );
      if (Array.isArray(res.data)) {
        const formatted = res.data.map((item) => ({
          ...item,
          priority: item.priority || "info",
        }));
        try {
          localStorage.setItem(getStorageKey(userId, isAdminUser), JSON.stringify(formatted));
        } catch {}
        return formatted;
      }
    } catch (err) {
      console.warn("Failed to fetch notifications from backend:", err);
    }

    try {
      const raw = localStorage.getItem(getStorageKey(userId, isAdminUser));
      if (raw) return JSON.parse(raw);
    } catch {}

    return [];
  },

  /**
   * Add / create a notification
   */
  async add(
    notification: Omit<AppNotification, "id" | "createdAt" | "read"> &
      Partial<Pick<AppNotification, "id" | "createdAt" | "read">>
  ): Promise<AppNotification | null> {
    const prepared = {
      ...notification,
      audience:
        notification.userId === "admin_inbox"
          ? "ADMIN"
          : notification.userId === "student_broadcast"
          ? "STUDENT_BROADCAST"
          : notification.audience || "USER",
    };

    try {
      const res = await api.post<AppNotification>("/api/v1/notifications", prepared);
      if (res.data) {
        notifySubscribers();
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to save notification to backend:", err);
    }

    // Local fallback for offline mode
    const fallbackItem: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...prepared,
    };

    try {
      const isAdminTarget = prepared.userId === "admin_inbox" || prepared.audience === "ADMIN";
      const key = getStorageKey(prepared.userId, isAdminTarget);
      const existing: AppNotification[] = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([fallbackItem, ...existing]));
      notifySubscribers();
    } catch {}

    return fallbackItem;
  },

  /**
   * Convenience method to notify a specific user
   */
  async notifyUser(
    userId: string,
    notification: Omit<AppNotification, "id" | "createdAt" | "read" | "userId" | "audience"> & {
      audience?: AppNotification["audience"];
    }
  ): Promise<AppNotification | null> {
    if (!userId) return null;
    return this.add({
      ...notification,
      userId,
      audience: notification.audience || "USER",
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
      userId: "admin_inbox",
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
      userId: "student_broadcast",
      audience: "STUDENT_BROADCAST",
    });
  },

  /**
   * Mark a single notification as read
   */
  async markRead(userId: string, id: string): Promise<void> {
    try {
      await api.patch(`/api/v1/notifications/${encodeURIComponent(id)}/read`);
    } catch (err) {
      console.warn("Failed to mark notification as read on backend:", err);
    }
    notifySubscribers();
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllRead(userId: string, isAdminUser = false): Promise<void> {
    try {
      await api.post(`/api/v1/notifications/read-all?userId=${encodeURIComponent(userId)}&role=${isAdminUser ? "ADMIN" : "STUDENT"}`);
    } catch (err) {
      console.warn("Failed to mark all notifications as read on backend:", err);
    }
    notifySubscribers();
  },

  /**
   * Delete a single notification
   */
  async remove(userId: string, id: string): Promise<void> {
    try {
      await api.delete(`/api/v1/notifications/${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn("Failed to delete notification on backend:", err);
    }
    notifySubscribers();
  },

  /**
   * Clear all notifications for a user
   */
  async clearAll(userId: string, isAdminUser = false): Promise<void> {
    try {
      await api.delete(`/api/v1/notifications/clear-all?userId=${encodeURIComponent(userId)}&role=${isAdminUser ? "ADMIN" : "STUDENT"}`);
    } catch (err) {
      console.warn("Failed to clear all notifications on backend:", err);
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
