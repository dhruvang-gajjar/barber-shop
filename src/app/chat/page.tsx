"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import { fetchConversations, fetchMessages } from "@/lib/api";
import { getPusherClient } from "@/lib/pusher";
import { useNotification } from "@/context/NotificationContext";
import type { ConversationSummary, StoredMessage } from "@/types";

function ChatInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone");
  const { setUnreadCount } = useNotification();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(initialPhone);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [, setIsPusherActive] = useState<boolean>(false);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Keep a ref to selectedPhone to avoid reconnecting Pusher channel on every switch
  const selectedPhoneRef = useRef<string | null>(selectedPhone);
  useEffect(() => {
    selectedPhoneRef.current = selectedPhone;
  }, [selectedPhone]);

  const hasLoadedInitialConversations = useRef(false);

  // Sync total unread count with Notification Context whenever conversations change
  useEffect(() => {
    const total = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    setUnreadCount(total);
  }, [conversations, setUnreadCount]);

  // Load conversations list from Cloudflare D1
  const loadConversations = useCallback(async (showLoading = false, force = false) => {
    if (showLoading) setIsLoadingConversations(true);
    const list = await fetchConversations(force);
    setConversations(list);
    if (showLoading) setIsLoadingConversations(false);
  }, []);

  // Load messages for a specific phone number
  const loadMessages = useCallback(async (phone: string, showLoading = false, force = false) => {
    if (showLoading) setIsLoadingMessages(true);
    const msgs = await fetchMessages(phone, force);
    setMessages(msgs);
    if (showLoading) setIsLoadingMessages(false);
  }, []);

  // Initial load of conversation list (Only runs once on mount)
  useEffect(() => {
    if (hasLoadedInitialConversations.current) return;
    hasLoadedInitialConversations.current = true;
    loadConversations(true);
  }, [loadConversations]);

  // URL searchParams change handling
  useEffect(() => {
    if (initialPhone && initialPhone !== selectedPhone) {
      setSelectedPhone(initialPhone);
    }
  }, [initialPhone, selectedPhone]);

  // When selected phone changes, fetch its initial message history once
  useEffect(() => {
    if (selectedPhone) {
      loadMessages(selectedPhone, true);
    } else {
      setMessages([]);
    }
  }, [selectedPhone, loadMessages]);

  // Pusher Real-time WebSocket Subscription for Live Chat
  useEffect(() => {
    const pusher = getPusherClient();

    if (!pusher) {
      setIsPusherActive(false);
      return;
    }

    setIsPusherActive(true);
    const channel = pusher.subscribe("whatsapp-inbox");

    // 1. Instant New Message Event
    const handleNewMessage = (data: { message: StoredMessage; phone_number: string }) => {
      const newMsg = data.message;
      const phone = data.phone_number;

      if (selectedPhoneRef.current === phone) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c.phone_number === phone);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const currentItem = updated[existingIndex];
          updated[existingIndex] = {
            ...currentItem,
            last_message: newMsg.text || `[${newMsg.type}]`,
            last_timestamp: newMsg.timestamp,
            last_direction: newMsg.direction,
            unread_count:
              selectedPhoneRef.current === phone
                ? 0
                : (currentItem.unread_count || 0) + 1,
          };
          const item = updated.splice(existingIndex, 1)[0];
          return [item, ...updated];
        } else {
          const newConv: ConversationSummary = {
            phone_number: phone,
            sender_name: newMsg.sender_name || phone,
            last_message: newMsg.text || `[${newMsg.type}]`,
            last_timestamp: newMsg.timestamp,
            last_direction: newMsg.direction,
            unread_count: selectedPhoneRef.current === phone ? 0 : 1,
          };
          return [newConv, ...prev];
        }
      });
    };

    // 2. Instant Delivery Status Update
    const handleStatusUpdate = (data: { message_id: string; status: any }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.message_id ? { ...m, status: data.status } : m
        )
      );
    };

    channel.bind("new-message", handleNewMessage);
    channel.bind("status-update", handleStatusUpdate);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      channel.unbind("status-update", handleStatusUpdate);
    };
  }, []);

  const selectedConversation = conversations.find(
    (c) => c.phone_number === selectedPhone
  );

  const handleSelectConversation = (phone: string) => {
    setSelectedPhone(phone);
    // Mark as read locally
    setConversations((prev) =>
      prev.map((c) => (c.phone_number === phone ? { ...c, unread_count: 0 } : c))
    );
    const params = new URLSearchParams(searchParams.toString());
    params.set("phone", phone);
    router.replace(`/chat?${params.toString()}`);
  };

  const handleStartNewChat = (phone: string) => {
    setSelectedPhone(phone);
    const params = new URLSearchParams(searchParams.toString());
    params.set("phone", phone);
    router.replace(`/chat?${params.toString()}`);
    loadMessages(phone, true);
  };

  const handleBackToList = () => {
    setSelectedPhone(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("phone");
    const q = params.toString();
    router.replace(q ? `/chat?${q}` : "/chat");
  };

  return (
    <div className="h-[calc(100dvh-56px)] md:h-screen w-full flex flex-col overflow-hidden bg-slate-100">
      {/* Main Inbox Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Conversation List */}
        <ConversationList
          conversations={conversations}
          selectedPhone={selectedPhone}
          onSelectConversation={handleSelectConversation}
          onStartNewChat={handleStartNewChat}
          isLoading={isLoadingConversations}
          onRefresh={() => loadConversations(true, true)}
          className={selectedPhone ? "hidden md:flex" : "flex"}
        />

        {/* Main Chat Panel */}
        <ChatWindow
          phone={selectedPhone}
          senderName={selectedConversation?.sender_name}
          messages={messages}
          isLoading={isLoadingMessages}
          onRefresh={() => selectedPhone && loadMessages(selectedPhone, true, true)}
          onMessageSent={() => {
            if (selectedPhone) loadMessages(selectedPhone, false, true);
            loadConversations(false, true);
          }}
          onBack={handleBackToList}
          className={selectedPhone ? "flex" : "hidden md:flex"}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading chat...</div>}>
      <ChatInbox />
    </Suspense>
  );
}
