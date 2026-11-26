"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import NextAuthProvider from "@/components/NextAuthProvider";
import Navbar from "@/components/Navbar";
import ServiceWorkerCleaner from "@/components/ServiceWorkerCleaner";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <NextAuthProvider>
      <AuthProvider>
        <NotificationProvider>
          <ServiceWorkerCleaner />
          {isLoginPage ? (
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-stone-50 to-amber-50/40 text-slate-900">
              {children}
            </div>
          ) : (
            <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-[#F8FAFC] to-[#F1F5F9] text-slate-900">
              <Suspense fallback={<div className="h-14 bg-white/80 border-b border-slate-200" />}>
                <Navbar />
              </Suspense>
              <main className="flex-1">{children}</main>
            </div>
          )}
        </NotificationProvider>
      </AuthProvider>
    </NextAuthProvider>
  );
}
