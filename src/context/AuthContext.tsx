"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import type { User, LoginRequest, RegisterRequest, UpdateProfileRequest } from "@/types";
import { apiLogin, apiRegister, apiGetMe, apiUpdateProfile } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  loginWithDemoAdmin: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: UpdateProfileRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => {},
  loginWithDemoAdmin: async () => {},
  register: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  logout: () => {},
});

const TOKEN_KEY = "barber_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return null;
    const storedEmail = localStorage.getItem("barber_auth_email");
    const storedName = localStorage.getItem("barber_auth_name");
    if (storedEmail) {
      return {
        id: storedToken.replace("demo_token_", "") || "user",
        name: storedName || "Barber User",
        email: storedEmail,
        role: "admin",
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      };
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(TOKEN_KEY);
    // If no token exists in localStorage, user is immediately unauthenticated
    if (!stored) return false;
    return false;
  });

  // Sync NextAuth Google session or Token authentication
  useEffect(() => {
    async function initAuth() {
      // 1. Check if NextAuth session is active (e.g. Google Login)
      if (nextAuthStatus === "authenticated" && nextAuthSession?.user) {
        const u = nextAuthSession.user;
        setUser({
          id: (u as any).id || "google_admin",
          name: u.name || "Barber Admin",
          email: u.email || "admin@barbershop.com",
          role: "admin",
          avatar_url: u.image || null,
          created_at: Math.floor(Date.now() / 1000),
          updated_at: Math.floor(Date.now() / 1000),
        });
        setIsLoading(false);
        return;
      }

      if (nextAuthStatus === "loading") {
        return;
      }

      // 2. Fall back to stored JWT or demo token
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        if (storedToken.startsWith("demo_token_") || storedToken === "demo_admin_token") {
          const storedEmail = localStorage.getItem("barber_auth_email") || "admin@thebarbershop.com";
          const storedName = localStorage.getItem("barber_auth_name") || "Barber Admin";

          setUser({
            id: storedToken.replace("demo_token_", "") || "master_admin",
            name: storedName,
            email: storedEmail,
            role: "admin",
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000),
          });
          setToken(storedToken);
          setIsLoading(false);
          return;
        }

        setToken(storedToken);
        const res = await apiGetMe(storedToken);
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    }

    initAuth();
  }, [nextAuthStatus, nextAuthSession]);

  // Route protection
  useEffect(() => {
    if (isLoading) return;
    const isAuthRoute = pathname === "/login";

    if (!user && !isAuthRoute) {
      router.replace("/login");
    } else if (user && isAuthRoute) {
      router.replace("/");
    }
  }, [user, isLoading, pathname, router]);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Google sign in error:", err);
    }
  }, []);

  const loginWithDemoAdmin = useCallback(async () => {
    localStorage.setItem(TOKEN_KEY, "demo_token_master_admin");
    localStorage.setItem("barber_auth_email", "admin@thebarbershop.com");
    localStorage.setItem("barber_auth_name", "Master Barber Admin");
    setToken("demo_token_master_admin");
    setUser({
      id: "master_admin",
      name: "Master Barber Admin",
      email: "admin@thebarbershop.com",
      role: "admin",
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    });
    router.replace("/");
  }, [router]);

  const login = useCallback(async (credentials: LoginRequest) => {
    // Configured Tenant & Demo Accounts (Requiring explicit email & password)
    const validDemos = [
      {
        email: "admin@thebarbershop.com",
        passwords: ["BarberAdmin@2026", "barber2026", "admin123"],
        user: {
          id: "master_admin",
          name: "Master Barber Admin",
          email: "admin@thebarbershop.com",
          role: "admin" as const,
        },
      },
      {
        email: "demo@thebarbershop.com",
        passwords: ["DemoClient@2026", "demo2026", "barber2026"],
        user: {
          id: "demo_evaluator",
          name: "Salon Demo Client",
          email: "demo@thebarbershop.com",
          role: "admin" as const,
        },
      },
      {
        email: "royal@thebarbershop.com",
        passwords: ["Royal@2026", "barber2026"],
        user: {
          id: "royal_owner",
          name: "Royal Cuts Manager",
          email: "royal@thebarbershop.com",
          role: "admin" as const,
        },
      },
      {
        email: "elite@thebarbershop.com",
        passwords: ["Elite@2026", "barber2026"],
        user: {
          id: "elite_owner",
          name: "Elite Grooming Manager",
          email: "elite@thebarbershop.com",
          role: "admin" as const,
        },
      },
      {
        email: "urban@thebarbershop.com",
        passwords: ["Urban@2026", "barber2026"],
        user: {
          id: "urban_owner",
          name: "Urban Fade Manager",
          email: "urban@thebarbershop.com",
          role: "admin" as const,
        },
      },
      {
        email: "admin@barberlounge.com",
        passwords: ["admin123", "barber2026"],
        user: {
          id: "master_admin",
          name: "Master Barber Admin",
          email: "admin@barberlounge.com",
          role: "admin" as const,
        },
      },
    ];

    const targetEmail = credentials.email.trim().toLowerCase();
    const matched = validDemos.find(
      (d) => d.email.toLowerCase() === targetEmail && d.passwords.includes(credentials.password)
    );

    if (matched) {
      const tokenId = `demo_token_${matched.user.id}`;
      localStorage.setItem(TOKEN_KEY, tokenId);
      localStorage.setItem("barber_auth_email", matched.user.email);
      localStorage.setItem("barber_auth_name", matched.user.name);
      setToken(tokenId);
      setUser({
        ...matched.user,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      });
      router.replace("/");
      return { success: true };
    }

    // Check dynamic registered clients created by Admin
    try {
      if (typeof window !== "undefined") {
        const storedCustom = localStorage.getItem("barber_custom_businesses");
        if (storedCustom) {
          const list = JSON.parse(storedCustom);
          const found = list.find(
            (c: any) =>
              c.assignedEmail &&
              c.assignedEmail.toLowerCase() === targetEmail &&
              c.assignedPassword === credentials.password
          );
          if (found) {
            const tokenId = `demo_token_${found.id}`;
            localStorage.setItem(TOKEN_KEY, tokenId);
            localStorage.setItem("barber_auth_email", found.assignedEmail);
            localStorage.setItem("barber_auth_name", found.name);
            localStorage.setItem("barber_active_business_id", found.id);
            setToken(tokenId);
            setUser({
              id: found.id,
              name: found.name,
              email: found.assignedEmail,
              role: "admin",
              created_at: Math.floor(Date.now() / 1000),
              updated_at: Math.floor(Date.now() / 1000),
            });
            router.replace("/");
            return { success: true };
          }
        }
      }
    } catch {
      // ignore
    }

    const res = await apiLogin(credentials);
    if (res.success && res.token && res.user) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem("barber_auth_email", res.user.email);
      localStorage.setItem("barber_auth_name", res.user.name);
      setToken(res.token);
      setUser(res.user);
      router.replace("/");
      return { success: true };
    }
    return {
      success: false,
      error: res.error || "Invalid email or password. Access requires authorized credentials.",
    };
  }, [router]);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiRegister(data);
    if (res.success && res.token && res.user) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      router.replace("/");
      return { success: true };
    }
    return { success: false, error: res.error || "Registration failed" };
  }, [router]);

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    if (!token) return { success: false, error: "Not authenticated" };

    const res = await apiUpdateProfile(token, updates);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || "Profile update failed" };
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    if (nextAuthSession) {
      signOut({ callbackUrl: "/login" });
    } else {
      router.replace("/login");
    }
  }, [router, nextAuthSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithGoogle,
        loginWithDemoAdmin,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
