"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPusherClient } from "@/lib/pusher";
import { fetchConversations } from "@/lib/api";
import { playNotificationSound } from "@/lib/audio";
import type { StoredMessage } from "@/types";

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  isSupported: boolean;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  permission: "default",
  requestPermission: async () => "default",
  isSupported: false,
  refreshUnreadCount: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // Check browser Notification support & initial permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Update Title Bar with unread message count
  useEffect(() => {
    if (typeof document === "undefined") return;
    const baseTitle = "THE BARBER SHOP";
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [unreadCount]);

  // Fetch initial unread count from API
  const refreshUnreadCount = useCallback(async () => {
    try {
      const convs = await fetchConversations(true);
      const total = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setUnreadCount(total);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied" as NotificationPermission;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === "granted") {
        new Notification("Notifications Enabled", {
          body: "You will receive real-time alerts when clients message on WhatsApp.",
          icon: "/favicon.ico",
        });
      }
      return res;
    } catch (err) {
      console.error("Failed to request notification permission:", err);
      return "denied" as NotificationPermission;
    }
  }, []);

  // Subscribe to Pusher globally for real-time notifications & badge counts
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe("whatsapp-inbox");

    const handleNewMessage = (data: { message: StoredMessage; phone_number: string }) => {
      const { message, phone_number } = data;

      // Only alert on inbound messages from clients
      if (message.direction === "inbound") {
        // Increment unread count in title bar
        setUnreadCount((prev) => prev + 1);

        // Play pleasant audio chime
        playNotificationSound();

        // Trigger browser push notification if permitted
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          const sender = message.sender_name || phone_number;
          const bodyText = message.text || `[${message.type || "New message"}]`;

          try {
            const n = new Notification(`New message from ${sender}`, {
              body: bodyText,
              icon: "/favicon.ico",
              tag: `wa-${phone_number}`,
            });

            n.onclick = () => {
              window.focus();
              router.push(`/chat?phone=${encodeURIComponent(phone_number)}`);
            };
          } catch (e) {
            console.warn("Desktop notification trigger failed:", e);
          }
        }
      }
    };

    channel.bind("new-message", handleNewMessage);

    return () => {
      channel.unbind("new-message", handleNewMessage);
    };
  }, [router]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        permission,
        requestPermission,
        isSupported,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
