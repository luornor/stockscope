// src/components/dashboard/WatchlistView.tsx
"use client";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { Quote } from "@/lib/api-types";

export default function WatchlistView() {
  const { list, isLoading } = useWatchlist();

  if (isLoading) {
    return <div className="rounded-2xl border border-white/10 p-4 bg-white/5 text-sm text-slate-400">Loading watchlist…</div>;
  }
  if (!list.length) {
    return <div className="rounded-2xl border border-white/10 p-4 bg-white/5 text-sm text-slate-400">Nothing here yet. Pick a symbol and press “Watch”.</div>;
  }

  // Your Watchlist component expects Quote[]
  const asQuotes: Quote[] = list.map(it => ({
    symbol: it.symbol,
    name: it.name,
    price: Number(it.price ?? 0),
    change: Number(it.change ?? 0),
    volume: Number(it.volume ?? 0),
  }));

  return <Watchlist data={asQuotes} />;
}
