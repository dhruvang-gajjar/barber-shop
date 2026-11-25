"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isQueue = pathname === "/";
  const isChat = pathname === "/chat";

  return (
    <header className="bg-barber-card border-b border-barber-border sticky top-0 z-30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
            <span className="font-semibold tracking-wider text-sm sm:text-base text-white uppercase font-mono">
              THE BARBER SHOP
            </span>
          </Link>

          <nav className="flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                isQueue
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              Queue
            </Link>

            <Link
              href="/chat"
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                isChat
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              Chat
            </Link>
          </nav>
        </div>

        {/* Right: Logout Icon Button */}
        <div className="flex items-center">
          <button
            onClick={logout}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 rounded-md transition cursor-pointer"
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
