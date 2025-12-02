// src/components/dashboard/WatchlistView.tsx
"use client";
import React, { useMemo } from "react";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { Quote } from "@/lib/api-types";

type Market = "ghana" | "international";

export default function WatchlistView() {
  const { list, isLoading, error, remove } = useWatchlist();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 p-4 bg-white/5 text-sm text-slate-400">
        Loading watchlist…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 p-4 bg-rose-500/5 text-sm text-rose-300">
        Couldn’t load your watchlist. Please refresh.
      </div>
    );
  }
  if (!list.length) {
    return (
      <div className="rounded-2xl border border-white/10 p-4 bg-white/5 text-sm text-slate-400">
        Nothing here yet. Pick a symbol and press “Watch”.
      </div>
    );
  }

  // Keep market so we can remove correctly
  const rows = useMemo(
    () =>
      list.map((it) => ({
        symbol: it.symbol,
        name: it.name,
        market: it.market as Market,
        price: Number(it.price ?? 0),
        change: Number(it.change ?? 0),
        volume: Number(it.volume ?? 0),
      })),
    [list]
  );

  return (
    <Watchlist
      data={rows}
      onRemove={(symbol, market) => {
        if (!market) return; // just in case
        remove(symbol, market);
      }}
    />
  );
}
