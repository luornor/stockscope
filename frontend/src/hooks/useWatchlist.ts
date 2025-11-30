"use client";
import useSWR from "swr";
import { apiGet, apiPost } from "@/lib/api";

type WatchlistRow = {
  symbol: string;
  name: string;
  market: "ghana" | "international";
  price: number;
  change: number;
  volume: number;
};

export function useWatchlist() {
  const key = "/api/watchlist";
  const { data, error, isLoading, mutate } = useSWR<WatchlistRow[]>(
    key,
    apiGet
  );

  async function add(
    symbol: string,
    name: string,
    market: "ghana" | "international"
  ) {
    await apiPost("/api/watchlist/add", { symbol, name, market });
    mutate();
  }
  async function remove(symbol: string, market: "ghana" | "international") {
    const qs = new URLSearchParams({ market });
    await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
      }/api/watchlist/${symbol}?${qs.toString()}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    mutate();
  }

  return { list: data ?? [], error, isLoading, add, remove, refresh: mutate };
}
