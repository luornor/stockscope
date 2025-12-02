"use client";
import React from "react";
import { Menu, Rocket } from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type Me = { email: string; username: string };

export function Header({ onMenu }: { onMenu: () => void }) {
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/api/auth/me"),
    retry: false,
  });

  const initials =
    ((data?.username && data.username.trim()[0]) ||
      (data?.email && data.email.trim()[0]) ||
      "U").toUpperCase();

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 bg-slate-900/80 border-b border-white/5">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center gap-2">
        {/* Mobile menu */}
        <button
          onClick={onMenu}
          className="md:hidden p-2 rounded-xl hover:bg-white/5 flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="size-5 text-slate-200" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <Rocket className="size-5 text-cyan-400" />
          <span className="font-semibold tracking-tight text-slate-100">
            Stock-Scope
          </span>
        </div>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Dashboard icon (optional small) */}
          <Link
            href="/dashboard"
            className="p-2 rounded-xl hover:bg-white/5 flex-shrink-0"
            title="Dashboard"
          >
            <Rocket className="size-5 text-slate-300" />
          </Link>

          {/* Profile avatar (always visible, scaled down on mobile) */}
          <Link
            href="/profile"
            className="grid place-items-center h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-white text-lg md:text-xl font-semibold shadow-lg flex-shrink-0"
            title="Profile"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
