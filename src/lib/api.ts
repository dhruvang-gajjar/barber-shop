import type {
  StoredMessage,
  ConversationSummary,
  Lead,
  WhatsAppTemplate,
  BillingStats,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "../types";

const WORKER_URL =
  process.env.NEXT_PUBLIC_WORKER_URL || "https://meta-whatsapp-webhook.dhruvangg.workers.dev";

let inFlightConversations: Promise<ConversationSummary[]> | null = null;

/**
 * Fetches active conversation threads.
 * Automatically deduplicates simultaneous in-flight requests (e.g. React StrictMode mount).
 */
export async function fetchConversations(force = false): Promise<ConversationSummary[]> {
  if (inFlightConversations && !force) {
    return inFlightConversations;
  }

  inFlightConversations = (async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/conversations?limit=50`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.conversations || [];
    } catch (err) {
      console.error("fetchConversations error:", err);
      return [];
    } finally {
      setTimeout(() => {
        inFlightConversations = null;
      }, 500);
    }
  })();

  return inFlightConversations;
}

const inFlightMessages = new Map<string, Promise<StoredMessage[]>>();

/**
 * Fetches message history for a specific phone number or all recent messages.
 * Automatically deduplicates simultaneous in-flight requests.
 */
export async function fetchMessages(phone?: string, force = false): Promise<StoredMessage[]> {
  const key = phone || "__all__";
  if (inFlightMessages.has(key) && !force) {
    return inFlightMessages.get(key)!;
  }

  const promise = (async () => {
    try {
      const url = phone
        ? `${WORKER_URL}/api/messages?phone=${encodeURIComponent(phone)}&limit=100`
        : `${WORKER_URL}/api/messages?limit=100`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      // Sort chronologically ascending for chat view
      const msgs: StoredMessage[] = data.messages || [];
      return msgs.sort((a, b) => a.timestamp - b.timestamp);
    } catch (err) {
      console.error("fetchMessages error:", err);
      return [];
    } finally {
      setTimeout(() => {
        inFlightMessages.delete(key);
      }, 500);
    }
  })();

  inFlightMessages.set(key, promise);
  return promise;
}

/**
 * Sends a human message to a customer.
 */
export async function sendHumanMessage(
  to: string,
  text: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/send-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, text }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("sendHumanMessage error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Resumes automated bot replies for a contact after human advisor completes conversation.
 */
export async function resumeBotSession(
  phone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/sessions/${encodeURIComponent(phone)}/resume`, {
      method: "POST",
    });
    return await res.json();
  } catch (err: any) {
    console.error("resumeBotSession error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches captured Sarthi InvestMart leads.
 */
export async function fetchLeads(
  status?: string,
  service?: string
): Promise<Lead[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (service) params.set("service", service);

    const res = await fetch(`${WORKER_URL}/api/leads?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.leads || [];
  } catch (err) {
    console.error("fetchLeads error:", err);
    return [];
  }
}

/**
 * Updates a lead's status (new, contacted, qualified, closed).
 */
export async function updateLead(
  id: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (err: any) {
    console.error("updateLead error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Checks backend health status.
 */
export async function checkBackendHealth(): Promise<{ status: string; environment?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/health`, { cache: "no-store" });
    if (!res.ok) return { status: "offline" };
    return await res.json();
  } catch {
    return { status: "offline" };
  }
}

/**
 * Fetches WhatsApp message usage metrics and conversation-based billing status.
 */
export async function fetchBillingStats(): Promise<BillingStats | null> {
  try {
    const res = await fetch(`${WORKER_URL}/api/billing-stats`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.stats || null;
  } catch (err) {
    console.error("fetchBillingStats error:", err);
    return null;
  }
}

/**
 * Fetches official conversation analytics directly from Meta Graph API.
 */
export async function fetchMetaAnalytics(): Promise<any> {
  try {
    const res = await fetch(`${WORKER_URL}/api/meta-analytics`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("fetchMetaAnalytics error:", err);
    return null;
  }
}

// ==========================================
// Authentication & Multi-User Client APIs
// ==========================================

export async function apiLogin(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const res = await fetch(`${WORKER_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("apiLogin error:", err);
    return { success: false, error: err.message || "Failed to connect to authentication service." };
  }
}

export async function apiRegister(req: RegisterRequest): Promise<AuthResponse> {
  try {
    const res = await fetch(`${WORKER_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("apiRegister error:", err);
    return { success: false, error: err.message || "Registration failed." };
  }
}

export async function apiGetMe(token: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function apiUpdateProfile(
  token: string,
  updates: UpdateProfileRequest
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("apiUpdateProfile error:", err);
    return { success: false, error: err.message || "Profile update failed." };
  }
}

export async function apiGetUsers(token: string): Promise<{ success: boolean; users?: User[]; error?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("apiGetUsers error:", err);
    return { success: false, error: err.message };
  }
}

import type { SalonCategory, SalonService, SalonQueueResponse } from "../types";

/**
 * Fetches salon appointments for a specific date (defaults to today).
 */
export async function fetchSalonAppointments(date?: string): Promise<SalonQueueResponse> {
  try {
    const url = date
      ? `${WORKER_URL}/api/salon/appointments?date=${encodeURIComponent(date)}`
      : `${WORKER_URL}/api/salon/appointments`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchSalonAppointments error:", err);
    return {
      success: false,
      date: date || "",
      counts: { pending: 0, completed: 0, total: 0 },
      pending: [],
      completed: [],
    };
  }
}

/**
 * Fetches salon service catalog and categories.
 */
export async function fetchSalonServices(): Promise<{
  success: boolean;
  categories: SalonCategory[];
  services: SalonService[];
}> {
  try {
    const res = await fetch(`${WORKER_URL}/api/salon/services`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchSalonServices error:", err);
    return { success: false, categories: [], services: [] };
  }
}

/**
 * Creates a walk-in / direct booking appointment.
 */
export async function createSalonAppointment(data: {
  customer_name: string;
  phone_number: string;
  date: string;
  time: string;
  services: string[];
  amount?: string;
  notes?: string;
}): Promise<{ success: boolean; appointment?: Lead; error?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/salon/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    console.error("createSalonAppointment error:", err);
    return { success: false, error: err.message || "Failed to create appointment" };
  }
}

/**
 * Updates an appointment (services list, price amount, completion status, notes).
 */
export async function updateSalonAppointment(
  id: string,
  data: {
    status?: string;
    services?: string[];
    amount?: string;
    notes?: string;
    time?: string;
    date?: string;
  }
): Promise<{ success: boolean; appointment?: Lead; error?: string }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/salon/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    console.error("updateSalonAppointment error:", err);
    return { success: false, error: err.message || "Failed to update appointment" };
  }
}
