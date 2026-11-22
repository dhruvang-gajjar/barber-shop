"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import NextAuthProvider from "@/components/NextAuthProvider";
import Navbar from "@/components/Navbar";
import ServiceWorkerCleaner from "@/components/ServiceWorkerCleaner";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <NextAuthProvider>
      <AuthProvider>
        <ServiceWorkerCleaner />
        {isLoginPage ? (
          <div className="min-h-screen w-full bg-barber-dark text-barber-text">{children}</div>
        ) : (
          <div className="min-h-screen w-full flex flex-col bg-barber-dark text-barber-text">
            <Suspense fallback={<div className="h-14 bg-barber-card border-b border-barber-border" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 pb-10">{children}</main>
          </div>
        )}
      </AuthProvider>
    </NextAuthProvider>
  );
}
