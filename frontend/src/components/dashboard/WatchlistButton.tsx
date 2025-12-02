"use client";
import React, { useMemo } from "react";
import { Plus, X } from "lucide-react";
import type { Market } from "@/lib/api-types";
import { useWatchlist } from "@/hooks/useWatchlist";

export function WatchlistButton({
  symbol,
  name,
  market,
}: {
  symbol: string;
  name: string;
  market: Market;
}) {
  const { list, add, remove } = useWatchlist();
  const inList = useMemo(
    () => list.some((i) => i.symbol === symbol && i.market === market),
    [list, symbol, market]
  );

  return inList ? (
    <button
      onClick={() => remove(symbol, market)}
      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
    >
      <X className="size-3" /> Remove
    </button>
  ) : (
    <button
      onClick={() => add(symbol, name, market)}
      className="inline-flex items-center gap-1 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/20"
    >
      <Plus className="size-3" /> Watch
    </button>
  );
}
