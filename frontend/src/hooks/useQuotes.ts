"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";
import type { Market, Quote } from "@/lib/api-types";
import { fetchGhanaQuotes } from "@/lib/kwayisi";

function hasPrices(quotes: Quote[]) {
  return quotes.some((quote) => Number(quote.price) > 0);
}

export function useQuotes(market: Market) {
  const key = `/api/quotes?market=${market}`;
  const { data, error, isLoading, mutate } = useSWR<Quote[]>(
    key,
    async (path: string) => {
      const rows = await apiGet<Quote[]>(path).catch(() => []);
      if (market !== "ghana" || hasPrices(rows)) return rows;
      return fetchGhanaQuotes();
    },
    {
      dedupingInterval: 15_000,
      refreshInterval: 30_000,
      revalidateOnFocus: false,
    }
  );
  return { quotes: data ?? [], error, isLoading, refresh: mutate };
}
