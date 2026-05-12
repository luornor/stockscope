"use client";
import useSWR from "swr";
import { apiGet } from "@/lib/api";
import type { Market, NewsItem } from "@/lib/api-types";
import { toRelative } from "@/lib/time";

export type UiNews = NewsItem & {
  id: string;
  time: string;
};

function newsPath(market: Market, symbol?: string) {
  const qs = new URLSearchParams({ market, limit: "12" });
  if (symbol && market === "international") qs.set("symbol", symbol);
  return `/api/news?${qs.toString()}`;
}

function toUiNews(rows: NewsItem[]): UiNews[] {
  return rows
    .filter((n) => n.title && n.url)
    .map((n) => ({
      ...n,
      id: String(n.id),
      time: n.published_at ? toRelative(n.published_at) : "recently",
    }));
}

export function useNews(market: Market, symbol?: string) {
  const selectedSymbol = market === "international" ? symbol : undefined;
  const key = newsPath(market, selectedSymbol);

  const { data, error, isLoading, mutate } = useSWR<UiNews[]>(
    key,
    async () => {
      const primary = await apiGet<NewsItem[]>(key).catch(() => []);
      if (primary.length || !selectedSymbol) return toUiNews(primary);

      const general = await apiGet<NewsItem[]>(newsPath(market)).catch(
        () => []
      );
      return toUiNews(general);
    },
    {
      dedupingInterval: 60_000,
      refreshInterval: 5 * 60_000,
      revalidateOnFocus: false,
    }
  );

  return { news: data ?? [], error, isLoading, refresh: mutate };
}
