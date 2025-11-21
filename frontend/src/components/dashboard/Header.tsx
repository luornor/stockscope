"use client";
import React from 'react';
import { Menu, Rocket, Search, Bell, Settings } from 'lucide-react';
// --- Components ------------------------------------------------------------
export function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 bg-slate-900/80 border-b border-white/5">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center gap-3">
        <button onClick={onMenu} className="md:hidden p-2 rounded-xl hover:bg-white/5">
          <Menu className="size-5 text-slate-200" />
        </button>
        <div className="flex items-center gap-2">
          <Rocket className="size-5 text-cyan-400" />
          <span className="font-semibold tracking-tight text-slate-100">Stock‑Scope</span>
          <span className="text-[10px] uppercase tracking-widest text-cyan-400/70 border border-cyan-400/30 rounded px-1.5 py-[1px] ml-2">alpha UI</span>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2">
          <div className="group hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus-within:ring-2 ring-cyan-500/40">
            <Search className="size-4 text-slate-400" />
            <input placeholder="Search tickers, news…" className="bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-500 w-64" />
          </div>
          <button className="p-2 rounded-xl hover:bg-white/5"><Bell className="size-5 text-slate-300"/></button>
          <button className="p-2 rounded-xl hover:bg-white/5"><Settings className="size-5 text-slate-300"/></button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500" />
        </div>
      </div>
    </div>
  );
}