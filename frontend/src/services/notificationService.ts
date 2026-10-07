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
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const url = `${baseUrl}/api/v1/notifications/stream?userId=${encodeURIComponent(userId)}&role=${isAdminUser ? "ADMIN" : "STUDENT"}`;

  try {
    const es = new EventSource(url);
    eventSource = es;

    es.addEventListener("NOTIFICATION", (e) => {
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
        return res.data.map((item) => ({
          ...item,
          priority: item.priority || "info",
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch notifications from backend:", err);
    }

    return [];
  },

  /**
   * Add / create a notification
   */
  async add(
    notification: Omit<AppNotification, "id" | "createdAt" | "read"> &
      Partial<Pick<AppNotification, "id" | "createdAt" | "read">>
  ): Promise<AppNotification | null> {
    try {
      const res = await api.post<AppNotification>("/api/v1/notifications", notification);
      if (res.data) {
        notifySubscribers();
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to save notification to backend:", err);
    }
    return null;
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
      audience: "STUDENT",
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
