"use client";

import { useState } from "react";
import {
  Search,
  RotateCw,
  Plus,
  User,
  Check,
  CheckCheck,
  X,
  PhoneCall,
} from "lucide-react";
import type { ConversationSummary } from "@/types";
import { formatConversationTime, formatPhoneNumber, cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedPhone: string | null;
  onSelectConversation: (phone: string) => void;
  onStartNewChat: (phone: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
}

export default function ConversationList({
  conversations,
  selectedPhone,
  onSelectConversation,
  onStartNewChat,
  isLoading,
  onRefresh,
  className,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatError, setNewChatError] = useState("");

  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = c.sender_name?.toLowerCase().includes(query);
    const phoneMatch = c.phone_number?.includes(query);
    const messageMatch = c.last_message?.toLowerCase().includes(query);
    return nameMatch || phoneMatch || messageMatch;
  });

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newChatPhone.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 8) {
      setNewChatError("Please enter a valid phone number with country code (e.g. 919876543210)");
      return;
    }
    setNewChatError("");
    setShowNewChatModal(false);
    setNewChatPhone("");
    onStartNewChat(cleaned);
  };

  return (
    <div className={cn("w-full md:w-80 lg:w-96 h-full flex flex-col bg-white border-r border-[#E9EDEF] select-none flex-shrink-0", className)}>
      {/* Header bar */}
      <div className="bg-[#F0F2F5] px-4 py-3 flex items-center justify-between border-b border-[#E9EDEF]">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-gray-800 text-lg">Chats</h2>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {conversations.length}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowNewChatModal(true)}
            title="Start new chat with phone number"
            className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-gray-200 rounded-full transition"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={onRefresh}
            title="Refresh conversations"
            className={cn(
              "p-2 text-gray-600 hover:text-emerald-700 hover:bg-gray-200 rounded-full transition",
              isLoading && "animate-spin text-emerald-600"
            )}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 bg-white border-b border-[#E9EDEF]">
        <div className="relative flex items-center bg-[#F0F2F5] rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/30">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, number, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {isLoading && conversations.length === 0 ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? (
              <>
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs text-gray-400 mt-1">
                  No conversation matches &quot;{searchQuery}&quot;
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No chats yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Inbound customer WhatsApp messages will appear here live.
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-4 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Start First Chat
                </button>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((c) => {
            const isSelected = selectedPhone === c.phone_number;
            const initials = c.sender_name
              ? c.sender_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : null;

            return (
              <div
                key={c.phone_number}
                onClick={() => onSelectConversation(c.phone_number)}
                className={cn(
                  "flex items-center px-3.5 py-3 cursor-pointer transition hover:bg-[#F5F6F6] select-none",
                  isSelected && "bg-[#EBECEE] hover:bg-[#EBECEE]"
                )}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm">
                  {initials ? initials : <User className="w-6 h-6" />}
                </div>

                {/* Details */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {c.sender_name || formatPhoneNumber(c.phone_number)}
                    </h3>
                    <span className="text-[11px] text-gray-400 font-normal whitespace-nowrap ml-2">
                      {formatConversationTime(c.last_timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500 truncate mr-2">
                      {c.last_direction === "outbound" && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500 mr-1 flex-shrink-0" />
                      )}
                      <span className="truncate">{c.last_message || "No messages"}</span>
                    </div>

                    {c.unread_count > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {c.unread_count}
                      </span>
                    )}
                  </div>

                  {c.sender_name && (
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {formatPhoneNumber(c.phone_number)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-gray-800">New WhatsApp Chat</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Recipient Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 919876543210"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Include country code without &apos;+&apos; (e.g. 91 for India).
                </p>
                {newChatError && (
                  <p className="text-xs text-red-500 mt-1.5">{newChatError}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Open Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
