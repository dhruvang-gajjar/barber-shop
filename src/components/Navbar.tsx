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
  ChevronDown,
  Check,
  Building2,
  Plus,
  ShieldCheck,
  Smartphone,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useBusiness } from "@/context/BusinessContext";
import ClientSetupModal from "@/components/ClientSetupModal";

export default function Navbar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { unreadCount, permission, requestPermission, isSupported } = useNotification();
  const {
    activeBusiness,
    businesses,
    setActiveBusinessId,
    canSwitchBusiness,
    isMasterAdmin,
  } = useBusiness();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [showClientSetupModal, setShowClientSetupModal] = useState(false);

  const isQueue = pathname === "/";
  const isChat = pathname === "/chat";

  return (
    <>
      {/* ================================================================= */}
      {/* DESKTOP APP DRAWER / SIDEBAR (md and above)                      */}
      {/* ================================================================= */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-[1px_0_4px_rgba(0,0,0,0.03)] z-30 select-none flex-shrink-0">
        {/* Brand / Multi-Business Switcher Header */}
        <div className="relative border-b border-slate-100">
          <button
            type="button"
            onClick={() => canSwitchBusiness && setShowBizDropdown(!showBizDropdown)}
            className={`w-full text-left p-4 flex items-center justify-between transition ${
              canSwitchBusiness ? "hover:bg-slate-50/80 cursor-pointer" : "cursor-default"
            }`}
            title={canSwitchBusiness ? "Switch Business Dashboard" : activeBusiness.name}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {activeBusiness.initials || "BS"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1">
                  <h1 className="font-bold tracking-wider text-xs sm:text-sm bg-gradient-to-r from-slate-900 via-stone-800 to-amber-700 bg-clip-text text-transparent uppercase font-mono truncate">
                    {activeBusiness.name}
                  </h1>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide truncate">
                  {activeBusiness.city ? `${activeBusiness.city} • ` : ""}{activeBusiness.tagline}
                </p>
              </div>
            </div>

            {canSwitchBusiness && (
              <ChevronDown
                className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-1 transition-transform ${
                  showBizDropdown ? "rotate-180 text-amber-600" : ""
                }`}
              />
            )}
          </button>

          {/* Business Dropdown Menu (For Multi-tenant Switching) */}
          {showBizDropdown && canSwitchBusiness && (
            <div className="absolute top-full left-2 right-2 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-fade-in">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Select Business</span>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  {businesses.length} Active
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                {businesses.map((biz) => {
                  const isSelected = biz.id === activeBusiness.id;
                  return (
                    <button
                      key={biz.id}
                      type="button"
                      onClick={() => {
                        setActiveBusinessId(biz.id);
                        setShowBizDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        isSelected
                          ? "bg-amber-50/80 text-amber-950 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {biz.initials || "B"}
                        </div>
                        <div className="truncate">
                          <p className="truncate text-xs">{biz.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{biz.city || "Salon"}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Add New Business Action */}
              {isMasterAdmin && (
                <div className="pt-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBizDropdown(false);
                      setShowClientSetupModal(true);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Setup Clients & WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          )}
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

          {/* Master Admin Client & WhatsApp Setup */}
          {isMasterAdmin && (
            <button
              type="button"
              onClick={() => setShowClientSetupModal(true)}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-amber-900 hover:bg-amber-50/80 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Client Setup & Numbers</span>
            </button>
          )}

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
              <p className="text-[10px] text-slate-400 truncate">{user?.email || "Manager"}</p>
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

          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-xs font-bold font-mono">
              {activeBusiness.initials || "BS"}
            </div>
            <span className="font-bold tracking-wider text-xs uppercase font-mono text-slate-900 truncate max-w-[140px]">
              {activeBusiness.name}
            </span>
          </div>
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
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                  {activeBusiness.initials || "BS"}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-xs font-mono uppercase text-slate-900 truncate">
                    {activeBusiness.name}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{activeBusiness.tagline}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition flex-shrink-0"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Business Switcher Selector */}
            {canSwitchBusiness && (
              <div className="p-3 border-b border-slate-100 bg-slate-50/60">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Active Business Tenant
                </label>
                <select
                  value={activeBusiness.id}
                  onChange={(e) => {
                    setActiveBusinessId(e.target.value);
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city || "Main"})
                    </option>
                  ))}
                </select>
              </div>
            )}

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

              {isMasterAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setShowClientSetupModal(true);
                  }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-amber-900 hover:bg-amber-50/80 transition cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span>Client Setup & Numbers</span>
                </button>
              )}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "BA"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {user?.name || "Barber Admin"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || "Manager"}</p>
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

      {/* Client Management & WhatsApp Numbers Setup Modal */}
      <ClientSetupModal
        isOpen={showClientSetupModal}
        onClose={() => setShowClientSetupModal(false)}
      />
    </>
  );
}
