"use client";
import React, { useMemo, useState } from "react";
import { useSymbols } from "@/hooks/useSymbols";
import type { Market } from "@/lib/api-types";
import { Search } from "lucide-react";

export function SymbolPicker({
  market,
  value,
  onChange,
}: {
  market: Market;
  value: string;
  onChange: (sym: string) => void;
}) {
  const { symbols, isLoading } = useSymbols(market);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const qq = q.trim().toUpperCase();
    const base = symbols;
    if (!qq) return base.slice(0, 30);
    return base
      .filter((s) => s.symbol.includes(qq) || s.name.toUpperCase().includes(qq))
      .slice(0, 30);
  }, [q, symbols]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <Search className="size-4 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={isLoading ? "Loading symbols…" : "Search symbol or name"}
          className="bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-500 flex-1"
        />
      </div>
      <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-white/10 divide-y divide-white/5">
        {list.map((s) => (
          <button
            key={s.symbol}
            onClick={() => onChange(s.symbol)}
            className={`w-full text-left px-3 py-2 hover:bg-white/5 ${
              value === s.symbol ? "bg-white/10" : ""
            }`}
          >
            <div className="text-slate-100 text-sm">{s.symbol}</div>
            <div className="text-xs text-slate-500">{s.name}</div>
          </button>
        ))}
        {list.length === 0 && (
          <div className="px-3 py-4 text-sm text-slate-500">No matches</div>
        )}
      </div>
    </div>
  );
}
