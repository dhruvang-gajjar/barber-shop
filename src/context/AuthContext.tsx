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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

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
        if (storedToken === "demo_admin_token") {
          setUser({
            id: "master_admin",
            name: "Master Barber Admin",
            email: "admin@barberlounge.com",
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
    localStorage.setItem(TOKEN_KEY, "demo_admin_token");
    setToken("demo_admin_token");
    setUser({
      id: "master_admin",
      name: "Master Barber Admin",
      email: "admin@barberlounge.com",
      role: "admin",
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    });
    router.replace("/");
  }, [router]);

  const login = useCallback(async (credentials: LoginRequest) => {
    // If demo credentials match
    if (
      credentials.email === "admin@barberlounge.com" &&
      (credentials.password === "admin123" || credentials.password === "barber2026")
    ) {
      await loginWithDemoAdmin();
      return { success: true };
    }

    const res = await apiLogin(credentials);
    if (res.success && res.token && res.user) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      router.replace("/");
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  }, [router, loginWithDemoAdmin]);

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
