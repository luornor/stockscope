"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { Market } from "@/lib/api-types";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartPanel } from "@/components/dashboard/ChartPanel";
import { Movers } from "@/components/dashboard/Movers";
import { PricePanel } from "@/components/dashboard/PricePanel";
import { NewsList } from "@/components/dashboard/NewsList";
import { useQuotes } from "@/hooks/useQuotes";
import { useIntraday } from "@/hooks/useIntraday";
import { useMovers } from "@/hooks/useMovers";
import { useNews } from "@/hooks/useNews";
import { SymbolPicker } from "@/components/dashboard/SymbolPicker";
import { WatchlistButton } from "@/components/dashboard/WatchlistButton";
import { Watchlist } from "@/components/dashboard/Watchlist";
import WatchlistView from "@/components/dashboard/Watchlistview";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [market, setMarket] = useState<Market>("international");
  const [section, setSection] = useState<
    "overview" | "news" | "watchlist" | "charts"
  >("overview");

  const defaultByMarket: Record<Market, string> = {
    international: "AAPL",
    ghana: "MTNGH",
  };
  const [symbol, setSymbol] = useState<string>(defaultByMarket[market]);

  useEffect(() => {
    setSymbol(defaultByMarket[market]);
  }, [market]);

  const { quotes } = useQuotes(market);
  const picked = useMemo(
    () =>
      quotes.find((q) => q.symbol === symbol) || {
        symbol,
        name: symbol,
        price: 0,
        change: 0,
        volume: 0,
      },
    [quotes, symbol]
  );

  const { series, isLoading: iLoading } = useIntraday(symbol, market);
  const { movers } = useMovers(market, 6);
  const { news } = useNews(
    market,
    market === "international" ? symbol : undefined
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(34,211,238,0.15),transparent),radial-gradient(1000px_600px_at_-10%_0%,rgba(168,85,247,0.10),transparent)] bg-slate-950 text-slate-100">
      <Header onMenu={() => setSidebarOpen(!sidebarOpen)} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:grid md:grid-cols-[18rem_1fr] md:gap-6">
        <Sidebar
          open={sidebarOpen}
          setMarket={setMarket}
          market={market}
          onSelectSection={setSection}
        />

        <main className="mt-6 md:mt-10 w-full">
          {/* === OVERVIEW === */}
          {section === "overview" && (
            <>
              {/* Top controls */}
              <div
                key={`top-${market}`}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start"
              >
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm text-slate-400">Selected</div>
                      <div className="text-xl font-semibold text-slate-100">
                        {picked.symbol}{" "}
                        <span className="text-slate-400 text-sm font-normal">
                          • {picked.name}
                        </span>
                      </div>
                    </div>
                    <WatchlistButton
                      symbol={picked.symbol}
                      name={picked.name}
                      market={market}
                    />
                  </div>
                  <ChartPanel symbol={picked.symbol} data={series} />
                  {iLoading && (
                    <div className="mt-2 text-xs text-slate-500">
                      Loading chart…
                    </div>
                  )}
                </div>

                <div>
                  <SymbolPicker
                    market={market}
                    value={symbol}
                    onChange={setSymbol}
                  />
                </div>
              </div>

              {/* Hero Row */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                  title="Portfolio Value"
                  value={market === "international" ? "$38,420" : "₵147,830"}
                  delta={1.82}
                />
                <StatCard
                  title="Daily P/L"
                  value={market === "international" ? "+$612" : "+₵1,940"}
                  delta={1.61}
                  subtle
                />
                <StatCard
                  title="Exposure"
                  value={
                    market === "international" ? "65% Tech" : "40% Banking"
                  }
                  subtle
                />
                <StatCard title="Risk" value="Moderate" subtle />
              </div>

              {/* Secondary Row */}
              <div
                key={`lower-${market}`}
                className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                <div className="space-y-4">
                  {movers.length || quotes.length ? (
                    <Movers data={movers.length ? movers : quotes} />
                  ) : (
                    <div className="rounded-2xl border border-white/10 p-4 bg-white/5 text-sm text-slate-400">
                      No movers right now for this market.
                    </div>
                  )}

                  <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                    <div className="text-sm text-slate-300">Market Status</div>
                    <div className="mt-2 text-xs text-slate-500">
                      Live data auto-refreshes.
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  {quotes.length ? (
                    <PricePanel market={market} quotes={quotes} />
                  ) : (
                    <div className="rounded-2xl border border-white/10 p-4 bg-white/5 text-sm text-slate-400">
                      No quotes available for this market.
                    </div>
                  )}

                  {news.length ? (
                    <NewsList
                      items={news.map((n) => ({
                        id: n.id,
                        source: n.source,
                        title: n.title,
                        time: n.time,
                      }))}
                    />
                  ) : (
                    <div className="rounded-2xl border border-white/10 p-4 bg-white/5 text-sm text-slate-400">
                      No recent headlines for this market.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* === NEWS ONLY VIEW === */}
          {section === "news" && (
            <div className="mt-6 space-y-4">
              <div className="text-slate-100 font-medium">Latest News</div>
              {news.length ? (
                <NewsList
                  items={news.map((n) => ({
                    id: n.id,
                    source: n.source,
                    title: n.title,
                    time: n.time,
                  }))}
                />
              ) : (
                <div className="rounded-2xl border border-white/10 p-4 bg-white/5 text-sm text-slate-400">
                  No recent headlines for this market.
                </div>
              )}
            </div>
          )}

          {/* === WATCHLIST VIEW (uses available quotes for now) === */}
          {section === "watchlist" && (
            <div className="mt-6">
              <WatchlistView />
            </div>
          )}

          {/* === CHARTS VIEW (per-market) === */}
          {section === "charts" && (
            <>
              {/* Header */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Charts</div>
                  <div className="text-xl font-semibold text-slate-100">
                    {market === "international" ? "International" : "Ghana"} •{" "}
                    {symbol}
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {market.toUpperCase()}
                </div>
              </div>

              {/* Chart + Picker */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <ChartPanel symbol={symbol} data={series} />
                  {iLoading && (
                    <div className="mt-2 text-xs text-slate-500">
                      Loading chart…
                    </div>
                  )}
                  {market === "ghana" && (
                    <div className="mt-3 text-[11px] text-slate-500">
                      Ghana intraday currently shows a same-day line (live vs
                      prev close).
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm text-slate-300 mb-2">Pick symbol</div>
                  <SymbolPicker
                    market={market}
                    value={symbol}
                    onChange={setSymbol}
                  />
                  <div className="mt-4 text-xs text-slate-500">
                    Tip: Switch markets from the sidebar.
                  </div>
                </div>
              </div>

              {/* Context cards */}
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-slate-300 mb-2">Prices</div>
                  {quotes.length ? (
                    <PricePanel market={market} quotes={quotes} />
                  ) : (
                    <div className="text-xs text-slate-500">
                      No quotes available for this market.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="py-8 text-center text-xs text-slate-500">
            Live backend • © Stock-Scope
          </div>
        </main>
      </div>
    </div>
  );
}
