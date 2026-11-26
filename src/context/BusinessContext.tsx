"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import type { BusinessTenant } from "@/types";

const DEFAULT_BUSINESSES: BusinessTenant[] = [
  {
    id: "flagship",
    name: "THE BARBER SHOP",
    tagline: "Flagship Salon & Lounge",
    phone: "+91 98765 43210",
    city: "Mumbai",
    initials: "BS",
  },
  {
    id: "royal-cuts",
    name: "Royal Cuts Lounge",
    tagline: "Premium Men's Grooming Club",
    phone: "+91 98220 11223",
    city: "Delhi",
    initials: "RC",
  },
  {
    id: "elite-grooming",
    name: "Elite Grooming Studio",
    tagline: "Executive Hair & Beard Spa",
    phone: "+91 99345 67890",
    city: "Bengaluru",
    initials: "EG",
  },
  {
    id: "urban-fade",
    name: "Urban Fade Barbers",
    tagline: "Contemporary Fade & Styling",
    phone: "+91 97123 45678",
    city: "Ahmedabad",
    initials: "UF",
  },
];

const STORAGE_KEY = "barber_active_business_id";
const CUSTOM_BUSINESSES_KEY = "barber_custom_businesses";

interface BusinessContextType {
  activeBusiness: BusinessTenant;
  businesses: BusinessTenant[];
  setActiveBusinessId: (id: string) => void;
  registerBusiness: (business: Omit<BusinessTenant, "id">) => BusinessTenant;
  canSwitchBusiness: boolean;
}

const BusinessContext = createContext<BusinessContextType>({
  activeBusiness: DEFAULT_BUSINESSES[0],
  businesses: DEFAULT_BUSINESSES,
  setActiveBusinessId: () => {},
  registerBusiness: () => DEFAULT_BUSINESSES[0],
  canSwitchBusiness: true,
});

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState<BusinessTenant[]>(() => {
    if (typeof window === "undefined") return DEFAULT_BUSINESSES;
    try {
      const stored = localStorage.getItem(CUSTOM_BUSINESSES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return [...DEFAULT_BUSINESSES, ...parsed];
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

    if (user.email === "royal@thebarbershop.com") {
      setActiveBusinessIdState("royal-cuts");
    } else if (user.email === "elite@thebarbershop.com") {
      setActiveBusinessIdState("elite-grooming");
    } else if (user.email === "urban@thebarbershop.com") {
      setActiveBusinessIdState("urban-fade");
    }
  }, [user]);

  // Master admin can switch between businesses; client accounts are locked to their own
  const canSwitchBusiness = !user || user.email === "admin@thebarbershop.com" || user.email === "admin@barberlounge.com" || user.email === "demo@thebarbershop.com";

  const setActiveBusinessId = useCallback((id: string) => {
    setActiveBusinessIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const registerBusiness = useCallback((newBiz: Omit<BusinessTenant, "id">): BusinessTenant => {
    const id = newBiz.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `biz-${Date.now()}`;
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
    };

    setBusinesses((prev) => {
      const updated = [...prev, created];
      if (typeof window !== "undefined") {
        const customOnly = updated.filter((b) => b.isCustom);
        localStorage.setItem(CUSTOM_BUSINESSES_KEY, JSON.stringify(customOnly));
      }
      return updated;
    });

    setActiveBusinessId(id);
    return created;
  }, [setActiveBusinessId]);

  const activeBusiness =
    businesses.find((b) => b.id === activeBusinessId) ||
    DEFAULT_BUSINESSES[0];

  return (
    <BusinessContext.Provider
      value={{
        activeBusiness,
        businesses,
        setActiveBusinessId,
        registerBusiness,
        canSwitchBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
