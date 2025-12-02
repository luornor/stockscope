"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";

type Market = "ghana" | "international";
type WatchlistRow = { symbol: string; name: string; market: Market; price: number; change: number; volume: number };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function useWatchlist() {
  const key = "/api/watchlist";
  const { data, error, isLoading, mutate } = useSWR<WatchlistRow[]>(key, apiGet);

  async function add(symbol: string, name: string, market: Market) {
    await mutate(async (prev) => {
      const optimistic = [...(prev ?? []), { symbol, name, market, price: 0, change: 0, volume: 0 }];
      // optimistic UI
      await fetch(`${API_BASE}/api/watchlist/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, name, market }),
      });
      return optimistic;
    }, { revalidate: true });
  }

  async function remove(symbol: string, market: Market) {
    await mutate(async (prev) => {
      const next = (prev ?? []).filter((r) => !(r.symbol === symbol && r.market === market));
      await fetch(`${API_BASE}/api/watchlist/${encodeURIComponent(symbol)}?market=${market}`, {
        method: "DELETE",
        credentials: "include",
      });
      return next;
    }, { revalidate: true });
  }

  return { list: data ?? [], error, isLoading, add, remove, refresh: mutate };
}
