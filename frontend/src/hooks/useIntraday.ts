"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";

export type IntradayPoint = { t: string; price: number };

export function useIntraday(symbol: string, market: "ghana" | "international") {
  const params = new URLSearchParams({ symbol, market, period: "1d" });
  if (market === "international") params.set("interval", "5m");
  const key = `/api/quotes/intraday?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<IntradayPoint[]>(
    symbol ? key : null,
    apiGet
  );
  return { series: data ?? [], error, isLoading, refresh: mutate };
}
