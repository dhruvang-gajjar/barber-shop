"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  Scissors,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function Navbar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { unreadCount, permission, requestPermission, isSupported } = useNotification();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const isQueue = pathname === "/";
  const isChat = pathname === "/chat";

  return (
    <>
      {/* ================================================================= */}
      {/* DESKTOP APP DRAWER / SIDEBAR (md and above)                      */}
      {/* ================================================================= */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-[1px_0_4px_rgba(0,0,0,0.03)] z-30 select-none flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Scissors className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold tracking-wider text-sm bg-gradient-to-r from-slate-900 via-stone-800 to-amber-700 bg-clip-text text-transparent uppercase font-mono truncate">
              THE BARBER SHOP
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Salon & Queue Hub
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <Link
            href="/"
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              isQueue
                ? "bg-gradient-to-r from-slate-900 to-zinc-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>Queue</span>
          </Link>

          <Link
            href="/chat"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              isChat
                ? "bg-gradient-to-r from-slate-900 to-zinc-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span>Chat</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Desktop Push Alerts Status & Prompt */}
          {isSupported && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              {permission === "granted" ? (
                <div className="px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-between text-emerald-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-[11px]">Alerts Active</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={requestPermission}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-slate-700 hover:text-amber-800 text-xs font-medium transition cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Enable Push Alerts</span>
                </button>
              )}
            </div>
          )}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "BA"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.name || "Barber Admin"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">Manager</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* MOBILE TOP BAR (screens < md)                                     */}
      {/* ================================================================= */}
      <header className="md:hidden bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-14 flex items-center justify-between px-4 sticky top-0 z-30 select-none shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold tracking-wider text-xs uppercase font-mono text-slate-900">
              THE BARBER SHOP
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Link
              href="/chat"
              className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold shadow-xs"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{unreadCount}</span>
            </Link>
          )}

          {isSupported && permission !== "granted" && (
            <button
              onClick={requestPermission}
              className="p-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg text-xs"
              title="Enable Alerts"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* MOBILE SLIDE-OUT APP DRAWER OVERLAY                                */}
      {/* ================================================================= */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 animate-fade-in">
            {/* Drawer Top */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-xs font-mono uppercase text-slate-900">
                    THE BARBER SHOP
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">Console</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Nav Links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <Link
                href="/"
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isQueue
                    ? "bg-gradient-to-r from-slate-900 to-zinc-800 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Queue</span>
              </Link>

              <Link
                href="/chat"
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isChat
                    ? "bg-gradient-to-r from-slate-900 to-zinc-800 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "BA"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {user?.name || "Barber Admin"}
                  </p>
                  <p className="text-[10px] text-slate-400">Manager</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  logout();
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
