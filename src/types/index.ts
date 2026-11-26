export interface StoredMessage {
  id: string;
  from_number: string;
  to_number: string;
  sender_name?: string | null;
  text?: string | null;
  type: string;
  direction: "inbound" | "outbound";
  status: "received" | "sent" | "delivered" | "read" | "failed";
  timestamp: number;
  metadata_json?: string | null;
}

export interface ConversationSummary {
  phone_number: string;
  sender_name: string;
  last_message: string;
  last_timestamp: number;
  last_direction: "inbound" | "outbound";
  unread_count: number;
  business_number?: string;
}

export interface Lead {
  id: string;
  customer_name?: string;
  phone_number: string;
  service: string;
  sub_service?: string;
  amount?: string;
  goal?: string;
  time_horizon?: string;
  existing_customer?: boolean;
  callback_time?: string;
  summary?: string;
  status: "new" | "contacted" | "qualified" | "closed" | "completed" | string;
  created_at: number;
}

export interface WhatsAppTemplate {
  name: string;
  status: string;
  category: string;
  language: string;
  id: string;
}

export interface BillingStats {
  total_messages: number;
  free_messages: number;
  chargeable_messages: number;
  inbound_messages: number;
  outbound_messages: number;
  outbound_templates: number;
  free_conversations_used: number;
  free_conversations_limit: number;
  free_conversations_remaining: number;
  chargeable_conversations: number;
  estimated_cost_inr: string;
  currency: string;
  month: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "advisor" | "manager";
  phone?: string | null;
  avatar_url?: string | null;
  created_at: number;
  updated_at: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "advisor" | "manager";
  phone?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface SalonCategory {
  id: string;
  title: string;
}

export interface SalonService {
  id: string;
  categoryId: string;
  title: string;
  price: number;
  durationMinutes: number;
  description: string;
}

export interface SalonQueueResponse {
  success: boolean;
  date: string;
  counts: {
    pending: number;
    completed: number;
    total: number;
  };
  pending: Lead[];
  completed: Lead[];
}

export interface BusinessTenant {
  id: string;
  name: string;
  tagline: string;
  phone: string;
  whatsappNumbers: string[];
  assignedEmail?: string;
  assignedPassword?: string;
  wabaId?: string;
  address?: string;
  city?: string;
  initials?: string;
  isCustom?: boolean;
}
