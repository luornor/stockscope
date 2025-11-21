"use client";
import React from "react";
import { motion } from 'framer-motion';
import { Globe2, Castle, LayoutGrid, Newspaper, Wallet, ChevronRight,CandlestickChart as CandleIcon} from 'lucide-react';
import type { Market } from '@/lib/api-types';


function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar({ open, setMarket, market }: { open: boolean; setMarket: (m: Market) => void; market: Market }) {  const links = [
    { label: "Overview", icon: LayoutGrid },
    { label: "Charts", icon: CandleIcon },
    { label: "News", icon: Newspaper },
    { label: "Wallet", icon: Wallet },
  ];
  return (
    <motion.aside
      initial={false}
      animate={{ x: open ? 0 : -280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed md:static z-40 left-0 top-12 md:top-0 h-[calc(100dvh-48px)] md:h-screen w-72 md:w-72 bg-slate-950/60 backdrop-blur border-r border-white/5"
    >
      <div className="p-4">
        <div className="text-xs text-slate-400 mb-2">Markets</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMarket("international")}
            className={cx(
              "flex items-center gap-2 rounded-2xl px-3 py-2 border text-sm",
              market === "international"
                ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 hover:border-white/20 text-slate-300"
            )}
          >
            <Globe2 className="size-4"/> International
          </button>
          <button
            onClick={() => setMarket("ghana")}
            className={cx(
              "flex items-center gap-2 rounded-2xl px-3 py-2 border text-sm",
              market === "ghana"
                ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-300"
                : "border-white/10 hover:border-white/20 text-slate-300"
            )}
          >
            <Castle className="size-4"/> Ghana
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-400 mb-2">Shortcuts</div>
        <div className="space-y-1">
          {links.map((l) => (
            <button key={l.label} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5">
              <l.icon className="size-4 text-slate-300"/> <span className="text-slate-200 text-sm">{l.label}</span>
              <ChevronRight className="ml-auto size-4 text-slate-500"/>
            </button>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}