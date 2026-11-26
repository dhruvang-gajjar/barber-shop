"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import type { BusinessTenant } from "@/types";

export const DEFAULT_BUSINESSES: BusinessTenant[] = [
  {
    id: "flagship",
    name: "THE BARBER SHOP",
    tagline: "Flagship Salon & Lounge (Demo)",
    phone: "+91 96014 75410",
    whatsappNumbers: ["9601475410"],
    assignedEmail: "demo@thebarbershop.com",
    assignedPassword: "DemoClient@2026",
    city: "Mumbai",
    initials: "BS",
  },
  {
    id: "royal-cuts",
    name: "Royal Cuts Lounge",
    tagline: "Premium Men's Grooming Club",
    phone: "+91 98220 11223",
    whatsappNumbers: ["123", "456"],
    assignedEmail: "royal@thebarbershop.com",
    assignedPassword: "Royal@2026",
    city: "Delhi",
    initials: "RC",
  },
  {
    id: "elite-grooming",
    name: "Elite Grooming Studio",
    tagline: "Executive Hair & Beard Spa",
    phone: "+91 99345 67890",
    whatsappNumbers: ["111"],
    assignedEmail: "elite@thebarbershop.com",
    assignedPassword: "Elite@2026",
    city: "Bengaluru",
    initials: "EG",
  },
  {
    id: "urban-fade",
    name: "Urban Fade Barbers",
    tagline: "Contemporary Fade & Styling",
    phone: "+91 97123 45678",
    whatsappNumbers: ["999", "998", "997"],
    assignedEmail: "urban@thebarbershop.com",
    assignedPassword: "Urban@2026",
    city: "Ahmedabad",
    initials: "UF",
  },
];

const STORAGE_KEY = "barber_active_business_id";
export const CUSTOM_BUSINESSES_KEY = "barber_custom_businesses";

interface BusinessContextType {
  activeBusiness: BusinessTenant;
  businesses: BusinessTenant[];
  setActiveBusinessId: (id: string) => void;
  registerBusiness: (business: Omit<BusinessTenant, "id">) => BusinessTenant;
  updateBusiness: (id: string, updates: Partial<BusinessTenant>) => void;
  deleteBusiness: (id: string) => void;
  addWhatsAppNumber: (businessId: string, number: string) => void;
  removeWhatsAppNumber: (businessId: string, number: string) => void;
  canSwitchBusiness: boolean;
  isMasterAdmin: boolean;
}

const BusinessContext = createContext<BusinessContextType>({
  activeBusiness: DEFAULT_BUSINESSES[0],
  businesses: DEFAULT_BUSINESSES,
  setActiveBusinessId: () => {},
  registerBusiness: () => DEFAULT_BUSINESSES[0],
  updateBusiness: () => {},
  deleteBusiness: () => {},
  addWhatsAppNumber: () => {},
  removeWhatsAppNumber: () => {},
  canSwitchBusiness: true,
  isMasterAdmin: true,
});

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState<BusinessTenant[]>(() => {
    if (typeof window === "undefined") return DEFAULT_BUSINESSES;
    try {
      const stored = localStorage.getItem(CUSTOM_BUSINESSES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored overrides with default businesses
        const defaultMap = new Map(DEFAULT_BUSINESSES.map((b) => [b.id, b]));
        parsed.forEach((p: BusinessTenant) => {
          defaultMap.set(p.id, p);
        });
        return Array.from(defaultMap.values());
      }
    } catch {
      // ignore
    }
    return DEFAULT_BUSINESSES;
  });

  const [activeBusinessId, setActiveBusinessIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlBiz = params.get("biz") || params.get("business");
      if (urlBiz) return urlBiz;

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    }
    return DEFAULT_BUSINESSES[0].id;
  });

  // Automatically lock/switch business based on logged in user's assigned business or URL param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlBiz = params.get("biz") || params.get("business");
      if (urlBiz) {
        setActiveBusinessIdState(urlBiz);
        return;
      }
    }

    if (!user) return;

    // Check if user email matches any tenant's assigned email
    const matchedTenant = businesses.find(
      (b) => b.assignedEmail && b.assignedEmail.toLowerCase() === user.email.toLowerCase()
    );
    if (matchedTenant) {
      setActiveBusinessIdState(matchedTenant.id);
      return;
    }

    if (user.email === "royal@thebarbershop.com") {
      setActiveBusinessIdState("royal-cuts");
    } else if (user.email === "elite@thebarbershop.com") {
      setActiveBusinessIdState("elite-grooming");
    } else if (user.email === "urban@thebarbershop.com") {
      setActiveBusinessIdState("urban-fade");
    } else if (user.email === "demo@thebarbershop.com") {
      setActiveBusinessIdState("flagship");
    }
  }, [user, businesses]);

  // Master admin check
  const isMasterAdmin =
    Boolean(user) &&
    (user?.email === "admin@thebarbershop.com" ||
      user?.email === "admin@barberlounge.com");

  // Master admin can switch between businesses; client accounts are locked to their own
  const canSwitchBusiness = isMasterAdmin || !user;

  const setActiveBusinessId = useCallback((id: string) => {
    setActiveBusinessIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const saveBusinessesToStorage = (updated: BusinessTenant[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CUSTOM_BUSINESSES_KEY, JSON.stringify(updated));
    }
  };

  const registerBusiness = useCallback(
    (newBiz: Omit<BusinessTenant, "id">): BusinessTenant => {
      const id =
        newBiz.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || `biz-${Date.now()}`;
      const initials = newBiz.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const created: BusinessTenant = {
        ...newBiz,
        id,
        initials: initials || "BIZ",
        isCustom: true,
        whatsappNumbers: newBiz.whatsappNumbers || [newBiz.phone.replace(/\D/g, "")].filter(Boolean),
      };

      setBusinesses((prev) => {
        const updated = [...prev, created];
        saveBusinessesToStorage(updated);
        return updated;
      });

      setActiveBusinessId(id);
      return created;
    },
    [setActiveBusinessId]
  );

  const updateBusiness = useCallback((id: string, updates: Partial<BusinessTenant>) => {
    setBusinesses((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveBusinessesToStorage(updated);
      return updated;
    });
  }, []);

  const deleteBusiness = useCallback((id: string) => {
    setBusinesses((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveBusinessesToStorage(updated);
      return updated;
    });
    setActiveBusinessId(DEFAULT_BUSINESSES[0].id);
  }, [setActiveBusinessId]);

  const addWhatsAppNumber = useCallback((businessId: string, number: string) => {
    const cleaned = number.replace(/\D/g, "");
    if (!cleaned) return;

    setBusinesses((prev) => {
      const updated = prev.map((b) => {
        if (b.id !== businessId) return b;
        const existing = b.whatsappNumbers || [];
        if (existing.includes(cleaned)) return b;
        return { ...b, whatsappNumbers: [...existing, cleaned] };
      });
      saveBusinessesToStorage(updated);
      return updated;
    });
  }, []);

  const removeWhatsAppNumber = useCallback((businessId: string, number: string) => {
    const cleaned = number.replace(/\D/g, "");
    setBusinesses((prev) => {
      const updated = prev.map((b) => {
        if (b.id !== businessId) return b;
        return {
          ...b,
          whatsappNumbers: (b.whatsappNumbers || []).filter((n) => n !== cleaned),
        };
      });
      saveBusinessesToStorage(updated);
      return updated;
    });
  }, []);

  const activeBusiness =
    businesses.find((b) => b.id === activeBusinessId) || DEFAULT_BUSINESSES[0];

  return (
    <BusinessContext.Provider
      value={{
        activeBusiness,
        businesses,
        setActiveBusinessId,
        registerBusiness,
        updateBusiness,
        deleteBusiness,
        addWhatsAppNumber,
        removeWhatsAppNumber,
        canSwitchBusiness,
        isMasterAdmin,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
