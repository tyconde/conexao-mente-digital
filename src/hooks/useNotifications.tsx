
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export interface Notification {
  id: number;
  type: "appointment_request" | "appointment_approved" | "appointment_rejected" | "message";
  title: string;
  message: string;
  appointmentId?: number;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  createdAt: string;
  read: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const loadNotifications = () => {
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      const allNotifications = JSON.parse(savedNotifications);
      const userNotifications = allNotifications.filter(
        (notification: Notification) => Number(notification.toUserId) === Number(user?.id)
      );
      setNotifications(userNotifications);
    }
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    const savedNotifications = localStorage.getItem("notifications");
    const allNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];
    allNotifications.push(newNotification);
    localStorage.setItem("notifications", JSON.stringify(allNotifications));
    
    if (Number(notification.toUserId) === Number(user?.id)) {
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const markAsRead = (notificationId: number) => {
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      const allNotifications = JSON.parse(savedNotifications);
      const updatedNotifications = allNotifications.map((notif: Notification) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
      loadNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const clearAllNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    const filtered = allNotifications.filter((n: Notification) => n.toUserId !== user?.id);
    localStorage.setItem("notifications", JSON.stringify(filtered));
    setNotifications([]);
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAllNotifications,
  };
};
