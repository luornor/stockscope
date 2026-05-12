"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";
import { fetchGhanaIntraday } from "@/lib/kwayisi";

export type IntradayPoint = { t: string; price: number };

export function useIntraday(symbol: string, market: "ghana" | "international") {
  const params = new URLSearchParams({ symbol, market, period: "1d" });
  if (market === "international") params.set("interval", "5m");
  const key = `/api/quotes/intraday?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<IntradayPoint[]>(
    symbol ? key : null,
    async (path: string) => {
      const rows = await apiGet<IntradayPoint[]>(path).catch(() => []);
      if (market !== "ghana" || rows.length) return rows;
      return fetchGhanaIntraday(symbol);
    },
    {
      dedupingInterval: 30_000,
      refreshInterval: 60_000,
      revalidateOnFocus: false,
    }
  );
  return { series: data ?? [], error, isLoading, refresh: mutate };
}
