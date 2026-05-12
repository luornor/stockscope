"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";
import type { Market } from "@/lib/api-types";
import { fetchGhanaSymbols } from "@/lib/kwayisi";

export type SymbolRow = { symbol: string; name: string };
export function useSymbols(market: Market) {
  const key = `/api/symbols?market=${market}`;
  const { data, error, isLoading, mutate } = useSWR<SymbolRow[]>(
    key,
    async (path: string) => {
      const rows = await apiGet<SymbolRow[]>(path).catch(() => []);
      if (market !== "ghana" || rows.length) return rows;
      return fetchGhanaSymbols();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60_000,
    }
  );
  return { symbols: data ?? [], error, isLoading, refresh: mutate };
}
