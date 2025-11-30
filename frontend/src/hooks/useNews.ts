"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";
import { toRelative } from "@/lib/time";

type NewsItem = {
  id: string;
  source: string;
  title: string;
  url: string;
  published_at: string;
};
export type UiNews = {
  id: string;
  source: string;
  title: string;
  url: string;
  time: string;
};

export function useNews(market: "ghana" | "international", symbol?: string) {
  const qs = new URLSearchParams({ market, limit: "12" });
  if (symbol && market === "international") qs.set("symbol", symbol);
  const key = `/api/news?${qs.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<NewsItem[]>(key, apiGet, {
    refreshInterval: 60_000,
  });
  const items: UiNews[] = (data ?? []).map((n) => ({
    ...n,
    time: toRelative(n.published_at),
  }));
  return { news: items, error, isLoading, refresh: mutate };
}
