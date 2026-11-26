"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Bell, BellOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { unreadCount, permission, requestPermission, isSupported } = useNotification();

  const isQueue = pathname === "/";
  const isChat = pathname === "/chat";

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 select-none shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <Link href="/" className="flex items-center group">
            <span className="font-bold tracking-wider text-sm sm:text-base bg-gradient-to-r from-slate-900 via-stone-800 to-amber-700 bg-clip-text text-transparent uppercase font-mono group-hover:opacity-90 transition">
              THE BARBER SHOP
            </span>
          </Link>

          <nav className="flex items-center space-x-1.5">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isQueue
                  ? "bg-gradient-to-r from-slate-900 to-zinc-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Queue
            </Link>

            <Link
              href="/chat"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center ${
                isChat
                  ? "bg-gradient-to-r from-slate-900 to-zinc-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>Chat</span>
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Right: Notification Toggle & Logout */}
        <div className="flex items-center space-x-2">
          {/* Notification Permission Button */}
          {isSupported && (
            <>
              {permission === "granted" ? (
                <button
                  type="button"
                  title="Desktop push notifications enabled"
                  className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition relative"
                >
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={requestPermission}
                  title="Click to enable desktop push notifications for new messages"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200 rounded-lg transition"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Enable Alerts</span>
                </button>
              )}
            </>
          )}

          {/* Logout Icon Button */}
          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
