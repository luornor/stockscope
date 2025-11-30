"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";
import type { Market } from "@/lib/api-types";

export type SymbolRow = { symbol: string; name: string };
export function useSymbols(market: Market) {
  const key = `/api/symbols?market=${market}`;
  const { data, error, isLoading, mutate } = useSWR<SymbolRow[]>(key, apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60_000,
  });
  return { symbols: data ?? [], error, isLoading, refresh: mutate };
}
