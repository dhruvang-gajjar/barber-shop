"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import { fetchConversations, fetchMessages } from "@/lib/api";
import { getPusherClient } from "@/lib/pusher";
import type { ConversationSummary, StoredMessage } from "@/types";

function ChatInbox() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone");

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(initialPhone);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [isPusherActive, setIsPusherActive] = useState<boolean>(false);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Keep a ref to selectedPhone to avoid reconnecting Pusher channel on every switch
  const selectedPhoneRef = useRef<string | null>(selectedPhone);
  useEffect(() => {
    selectedPhoneRef.current = selectedPhone;
  }, [selectedPhone]);

  const hasLoadedInitialConversations = useRef(false);

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
  }, [initialPhone]);

  // When selected phone changes, fetch its initial message history once
  useEffect(() => {
    if (selectedPhone) {
      loadMessages(selectedPhone, true);
    } else {
      setMessages([]);
    }
  }, [selectedPhone, loadMessages]);

  // Pusher Real-time WebSocket Subscription
  useEffect(() => {
    const pusher = getPusherClient();

    if (!pusher) {
      setIsPusherActive(false);
      return;
    }

    setIsPusherActive(true);
    const channel = pusher.subscribe("whatsapp-inbox");

    // 1. Instant New Message Event (< 50ms delivery)
    channel.bind(
      "new-message",
      (data: { message: StoredMessage; phone_number: string }) => {
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
      }
    );

    // 2. Instant Delivery Status Update
    channel.bind(
      "status-update",
      (data: { message_id: string; status: any }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.message_id ? { ...m, status: data.status } : m
          )
        );
      }
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const selectedConversation = conversations.find(
    (c) => c.phone_number === selectedPhone
  );

  const handleStartNewChat = (phone: string) => {
    setSelectedPhone(phone);
    loadMessages(phone, true);
  };

  return (
    <div className="h-[calc(100vh-65px)] w-full flex flex-col overflow-hidden bg-[#121214]">
      {/* Main Inbox Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Conversation List */}
        <ConversationList
          conversations={conversations}
          selectedPhone={selectedPhone}
          onSelectConversation={(phone) => setSelectedPhone(phone)}
          onStartNewChat={handleStartNewChat}
          isLoading={isLoadingConversations}
          onRefresh={() => loadConversations(true, true)}
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
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-barber-muted">Loading chat...</div>}>
      <ChatInbox />
    </Suspense>
  );
}
