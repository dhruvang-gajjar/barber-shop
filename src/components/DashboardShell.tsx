"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { BusinessProvider } from "@/context/BusinessContext";
import { NotificationProvider } from "@/context/NotificationContext";
import NextAuthProvider from "@/components/NextAuthProvider";
import Navbar from "@/components/Navbar";
import ServiceWorkerCleaner from "@/components/ServiceWorkerCleaner";

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const { user, isLoading } = useAuth();

  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-stone-50 to-amber-50/40 text-slate-900">
        {children}
      </div>
    );
  }

  // Prevent flicker: Never render dashboard UI or child pages while unauthenticated or loading
  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50/30 text-slate-900">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold text-lg animate-pulse">
            BS
          </div>
          <div className="w-5 h-5 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-slate-50 via-[#F8FAFC] to-[#F1F5F9] text-slate-900">
      <Suspense fallback={<div className="w-64 bg-white/80 border-r border-slate-200 hidden md:block" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <AuthProvider>
        <BusinessProvider>
          <NotificationProvider>
            <ServiceWorkerCleaner />
            <ShellContent>{children}</ShellContent>
          </NotificationProvider>
        </BusinessProvider>
      </AuthProvider>
    </NextAuthProvider>
  );
}
