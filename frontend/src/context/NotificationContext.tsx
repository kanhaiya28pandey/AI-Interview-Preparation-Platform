import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { notificationService, AppNotification } from "@/services/notificationService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.userId) {
      setNotifications([]);
      return;
    }

    const isAdminUser = isAdmin();
    const list = await notificationService.list(user.userId, isAdminUser);
    setNotifications(list);

    if (!initialLoadDoneRef.current) {
      // Seed initial known IDs so we don't trigger toasts for historical notifications on page load
      list.forEach((n) => knownIdsRef.current.add(n.id));
      initialLoadDoneRef.current = true;
      return;
    }

    // Check for newly arrived unread notifications
    list.forEach((n) => {
      if (!knownIdsRef.current.has(n.id)) {
        knownIdsRef.current.add(n.id);

        if (!n.read) {
          const toastFn =
            n.priority === "success"
              ? toast.success
              : n.priority === "warning"
              ? toast.warning
              : n.priority === "danger"
              ? toast.error
              : toast.info;

          toastFn(n.title, {
            description: n.message,
            duration: 6000,
            action: n.link
              ? {
                  label: "View",
                  onClick: () => {
                    notificationService.markRead(user.userId, n.id);
                    navigate(n.link!);
                  },
                }
              : undefined,
          });
        }
      }
    });
  }, [user?.userId, isAdmin, navigate]);

  useEffect(() => {
    initialLoadDoneRef.current = false;
    knownIdsRef.current.clear();
    fetchNotifications();

    const unsubscribe = notificationService.subscribe(() => {
      fetchNotifications();
    });

    // Background polling every 30 seconds if tab is active
    const interval = setInterval(() => {
      if (!document.hidden && user?.userId) {
        fetchNotifications();
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user?.userId, fetchNotifications]);

  const markRead = async (id: string) => {
    if (!user?.userId) return;
    await notificationService.markRead(user.userId, id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    if (!user?.userId) return;
    await notificationService.markAllRead(user.userId, isAdmin());
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const remove = async (id: string) => {
    if (!user?.userId) return;
    await notificationService.remove(user.userId, id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = async () => {
    if (!user?.userId) return;
    await notificationService.clearAll(user.userId, isAdmin());
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        remove,
        clearAll,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
