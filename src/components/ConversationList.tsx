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
import { useBusiness } from "@/context/BusinessContext";

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
  const { activeBusiness } = useBusiness();
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

  const handleStartChatSubmit = (e: React.FormEvent) => {
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
    <div
      className={cn(
        "w-full md:w-80 lg:w-96 h-full flex flex-col bg-white border-r border-slate-200 select-none flex-shrink-0 shadow-xs",
        className
      )}
    >
      {/* Header bar */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-2 min-w-0">
          <h2 className="font-bold text-slate-900 text-base flex-shrink-0">Chats</h2>
          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-slate-200 flex-shrink-0">
            {conversations.length}
          </span>
          <div className="min-w-0">
            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full font-medium truncate block max-w-[120px]">
              {activeBusiness.name}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowNewChatModal(true)}
            title="Start new chat with phone number"
            className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            title="Refresh conversations"
            className={cn(
              "p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition",
              isLoading && "animate-spin text-amber-600"
            )}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Configured WhatsApp Numbers Indicator */}
      {activeBusiness.whatsappNumbers && activeBusiness.whatsappNumbers.length > 0 && (
        <div className="px-3.5 py-1.5 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between text-[11px] text-amber-900">
          <span className="text-[10px] text-slate-500 font-medium">Isolated WhatsApp:</span>
          <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
            {activeBusiness.whatsappNumbers.map((num) => (
              <span
                key={num}
                className="px-1.5 py-0.2 bg-white border border-amber-200 rounded text-[10px] font-mono font-medium text-amber-800"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-2.5 bg-white border-b border-slate-100">
        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, number, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoading && conversations.length === 0 ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-11 h-11 bg-slate-100 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-50 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? (
              <>
                <p className="text-sm font-medium text-slate-700">No results found</p>
                <p className="text-xs text-slate-400 mt-1">
                  No conversation matches &quot;{searchQuery}&quot;
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-200/60 shadow-xs">
                  <User className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">No chats yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Inbound customer WhatsApp messages will appear here live.
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-4 px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
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
                  "flex items-center px-3.5 py-3 cursor-pointer transition select-none hover:bg-slate-50/80",
                  isSelected && "bg-gradient-to-r from-amber-50/80 via-white to-white border-l-4 border-l-amber-600 shadow-2xs"
                )}
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                  {initials ? initials : <User className="w-5 h-5" />}
                </div>

                {/* Details */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-xs font-semibold text-slate-900 truncate">
                      {c.sender_name || formatPhoneNumber(c.phone_number)}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                      {formatConversationTime(c.last_timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-slate-500 truncate mr-2">
                      {c.last_direction === "outbound" && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500 mr-1 flex-shrink-0" />
                      )}
                      <span className="truncate">{c.last_message || "No messages"}</span>
                    </div>

                    {c.unread_count > 0 && (
                      <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Start Direct WhatsApp Chat</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatError("");
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartChatSubmit}>
              <p className="text-xs text-slate-500 mb-3">
                Enter customer phone number with country code (e.g. 919876543210 for India).
              </p>

              {newChatError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {newChatError}
                </div>
              )}

              <input
                type="text"
                placeholder="e.g. 919876543210"
                value={newChatPhone}
                onChange={(e) => setNewChatPhone(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 mb-4"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatModal(false);
                    setNewChatError("");
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-xl shadow-xs transition"
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
