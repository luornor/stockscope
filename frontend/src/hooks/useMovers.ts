"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";
import type { Market, Quote } from "@/lib/api-types";

export function useMovers(market: Market, limit = 8) {
  const key = `/api/movers?market=${market}&limit=${limit}`;
  const { data, error, isLoading, mutate } = useSWR<Quote[]>(key, apiGet, {
    refreshInterval: 20_000,
  });
  return { movers: data ?? [], error, isLoading, refresh: mutate };
}
