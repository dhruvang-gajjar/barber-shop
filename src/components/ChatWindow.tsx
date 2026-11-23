"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  RotateCw,
  Play,
  Check,
  CheckCheck,
  AlertCircle,
  Sparkles,
  Bot,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import type { StoredMessage } from "@/types";
import { formatBubbleTime, formatPhoneNumber, cn } from "@/lib/utils";
import { sendHumanMessage, resumeBotSession } from "@/lib/api";

interface ChatWindowProps {
  phone: string | null;
  senderName?: string | null;
  messages: StoredMessage[];
  isLoading: boolean;
  onRefresh: () => void;
  onMessageSent: () => void;
  onBack?: () => void;
  className?: string;
}

const CANNED_RESPONSES = [
  "Hello! How can we help you at YP THE BARBER SHOP today?",
  "Your appointment is confirmed. See you soon!",
  "Please let us know which services you'd like to book.",
  "Thank you for visiting YP THE BARBER SHOP!",
];

export default function ChatWindow({
  phone,
  senderName,
  messages,
  isLoading,
  onRefresh,
  onMessageSent,
  onBack,
  className,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isResumingBot, setIsResumingBot] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change or chat is selected
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear states when switching contacts
  useEffect(() => {
    setInputText("");
    setSendError(null);
    setStatusMessage(null);
  }, [phone]);

  if (!phone) {
    return (
      <div className={cn("hidden md:flex flex-1 h-full flex-col items-center justify-center bg-[#F0F2F5] select-none p-6 text-center", className)}>
        <div className="w-20 h-20 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-4 shadow-inner">
          <MessageCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">WhatsApp Live Chat Inbox</h2>
        <p className="text-sm text-gray-500 max-w-md mt-2">
          Select a customer conversation from the left sidebar to view WhatsApp messages, send human advisor replies, or monitor lead conversations.
        </p>
      </div>
    );
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    setSendError(null);

    const res = await sendHumanMessage(phone, textToSend);

    if (res.success) {
      setInputText("");
      onMessageSent();
      setStatusMessage("Message sent");
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setSendError(res.error || "Failed to send message via WhatsApp API.");
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResumeBot = async () => {
    if (isResumingBot) return;
    setIsResumingBot(true);
    const res = await resumeBotSession(phone);
    if (res.success) {
      setStatusMessage("Automated bot replies resumed for this contact.");
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setSendError(res.error || "Failed to resume bot session.");
    }
    setIsResumingBot(false);
  };

  return (
    <div className={cn("flex-1 h-full flex flex-col bg-[#EFEAE2] overflow-hidden w-full", className)}>
      {/* Contact Header */}
      <div className="bg-[#F0F2F5] px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#E9EDEF] z-10 shadow-xs">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition flex-shrink-0"
              title="Back to conversations"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            {senderName
              ? senderName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : <User className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 truncate">
              <span className="truncate">{senderName || formatPhoneNumber(phone)}</span>
            </h3>
            <p className="text-xs text-gray-500 font-mono truncate">
              {formatPhoneNumber(phone)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
          {/* Resume Bot Button */}
          <button
            onClick={handleResumeBot}
            disabled={isResumingBot}
            title="Resume automated AI assistant flow"
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded-md text-xs font-medium shadow-2xs transition"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{isResumingBot ? "Resuming..." : "Resume Bot"}</span>
          </button>

          {/* Refresh Messages Button */}
          <button
            onClick={onRefresh}
            title="Refresh chat messages"
            className={cn(
              "p-1.5 sm:p-2 text-gray-600 hover:text-emerald-700 hover:bg-gray-200 rounded-full transition",
              isLoading && "animate-spin text-emerald-600"
            )}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Notice / Errors */}
      {statusMessage && (
        <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-xs transition animate-fade-in">
          {statusMessage}
        </div>
      )}
      {sendError && (
        <div className="bg-red-500 text-white text-xs py-1.5 px-4 flex items-center justify-between font-medium shadow-xs transition">
          <div className="flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{sendError}</span>
          </div>
          <button
            onClick={() => setSendError(null)}
            className="text-white hover:text-red-100 text-xs underline font-normal ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 wa-chat-bg">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-xs px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-xs text-gray-600 text-center max-w-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              No message history for this contact yet. Send a direct message below to start the conversation.
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOutbound = msg.direction === "outbound";

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] sm:max-w-[70%]",
                  isOutbound ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "px-3.5 py-2 rounded-lg shadow-xs text-sm text-gray-900 break-words relative",
                    isOutbound
                      ? "bg-[#D9FDD3] rounded-tr-none"
                      : "bg-white rounded-tl-none border border-black/5"
                  )}
                >
                  {/* Sender Name for Inbound */}
                  {!isOutbound && msg.sender_name && (
                    <p className="text-[11px] font-semibold text-emerald-800 mb-0.5">
                      {msg.sender_name}
                    </p>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap leading-relaxed select-text">
                    {msg.text || (
                      <span className="italic text-gray-500">[{msg.type} message]</span>
                    )}
                  </div>

                  {/* Metadata / Time / Status Footer */}
                  <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-gray-500 select-none">
                    <span>{formatBubbleTime(msg.timestamp)}</span>
                    {isOutbound && (
                      <span className="ml-1">
                        {msg.status === "sent" && <Check className="w-3 h-3 text-gray-400" />}
                        {msg.status === "delivered" && (
                          <CheckCheck className="w-3 h-3 text-gray-400" />
                        )}
                        {msg.status === "read" && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        )}
                        {msg.status === "failed" && (
                          <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                        {!["sent", "delivered", "read", "failed"].includes(msg.status) && (
                          <Check className="w-3 h-3 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Canned Responses Pills */}
      <div className="bg-[#F0F2F5] px-3 pt-2 pb-1 flex items-center space-x-2 overflow-x-auto no-scrollbar border-t border-[#E9EDEF]">
        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap pl-1">
          Quick replies:
        </span>
        {CANNED_RESPONSES.map((txt, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(txt)}
            className="text-xs bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap transition flex-shrink-0"
          >
            {txt.slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Message Composer */}
      <div className="bg-[#F0F2F5] p-3 flex items-end space-x-2">
        <textarea
          rows={1}
          placeholder="Type a message (Enter to send, Shift+Enter for new line)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className="flex-1 bg-white border border-gray-300 rounded-2xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none max-h-32 min-h-[42px]"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition shadow-sm flex-shrink-0",
            inputText.trim() && !isSending
              ? "bg-[#00A884] text-white hover:bg-[#008f6f]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          {isSending ? (
            <RotateCw className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
