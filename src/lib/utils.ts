import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes timestamp (handling seconds vs milliseconds) and returns Date object.
 */
export function parseTimestamp(ts: number | string | undefined | null): Date {
  if (!ts) return new Date();
  const num = typeof ts === "string" ? parseInt(ts, 10) : ts;
  // If timestamp is in seconds (e.g. 1727400000), multiply by 1000
  if (num < 10000000000) {
    return new Date(num * 1000);
  }
  return new Date(num);
}

/**
 * Formats a message timestamp for chat list items:
 * - If today: "14:25"
 * - If yesterday: "Yesterday"
 * - Older: "dd/MM/yyyy"
 */
export function formatConversationTime(ts: number | string): string {
  const date = parseTimestamp(ts);
  if (isNaN(date.getTime())) return "";

  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "dd/MM/yy");
}

/**
 * Formats a message timestamp inside chat bubbles: "11:42 AM"
 */
export function formatBubbleTime(ts: number | string): string {
  const date = parseTimestamp(ts);
  if (isNaN(date.getTime())) return "";
  return format(date, "h:mm a");
}

/**
 * Formats a timestamp into relative time ("5m ago", "2 hours ago")
 */
export function formatRelativeTime(ts: number | string): string {
  const date = parseTimestamp(ts);
  if (isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Formats phone number for display (+91 98765 43210 if 12-digit Indian number)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (phone.startsWith("+")) return phone;
  return `+${phone}`;
}
