"use client";
import React, { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartPanel } from "@/components/dashboard/ChartPanel";
import { Movers } from "@/components/dashboard/Movers";
import { PricePanel } from "@/components/dashboard/PricePanel";
import { SectorSplit } from "@/components/dashboard/SectorSplit";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { NewsList } from "@/components/dashboard/NewsList";
import type { Market } from "@/lib/api-types";
import { useQuotes } from "@/hooks/useQuotes";
import { useIntraday } from "@/hooks/useIntraday";
import { useMovers } from "@/hooks/useMovers";
import { useNews } from "@/hooks/useNews";
import { sectorHeatIntl } from "@/lib/mock";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [market, setMarket] = useState<Market>("international");

  const symbol = market === "international" ? "AAPL" : "MTNGH"; // you can make this selectable later

  const { quotes, isLoading: qLoading } = useQuotes(market);
  const { series, isLoading: iLoading } = useIntraday(symbol, market);
  const { movers, isLoading: mLoading } = useMovers(market, 6);
  const { news, isLoading: nLoading } = useNews(
    market,
    market === "international" ? symbol : undefined
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(34,211,238,0.15),transparent),radial-gradient(1000px_600px_at_-10%_0%,rgba(168,85,247,0.10),transparent)] bg-slate-950 text-slate-100">
      <Header onMenu={() => setSidebarOpen(!sidebarOpen)} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 flex gap-6 items-start">
        <div className="w-72 flex-shrink-0">
          <Sidebar open={sidebarOpen} setMarket={setMarket} market={market} />
        </div>
        {/* allow main to shrink so inner grid/columns measure correctly */}
        <main className="flex-1 mt-6 md:mt-10 w-full min-w-0">
          {/* Hero Row (static demo values for now) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
              value={market === "international" ? "65% Tech" : "40% Banking"}
              subtle
            />
            <StatCard title="Risk" value="Moderate" subtle />
          </div>

          {/* Charts Row */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* ensure chart column can have constrained height for correct measurement */}
            <div className="lg:col-span-2 min-h-0">
              <ChartPanel symbol={symbol} data={series} />
              {iLoading && (
                <div className="mt-2 text-xs text-slate-500">
                  Loading chart…
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Movers
                data={movers.length ? movers : quotes}
                spark={series.map((d) => ({ t: d.t, a: d.price }))}
              />
              <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                <div className="text-sm text-slate-300">Market Status</div>
                <div className="mt-2 text-xs text-slate-500">
                  Live data auto-refreshes.
                </div>
              </div>
            </div>
          </div>

          {/* Lower Row */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <PricePanel market={market} quotes={quotes} />
              {/* keep demo sectors until portfolio model is wired */}
              <SectorSplit data={sectorHeatIntl} />
            </div>
            <div className="space-y-4">
              <Watchlist data={quotes} />
              <NewsList
                items={news.map((n) => ({
                  id: n.id,
                  source: n.source,
                  title: n.title,
                  time: n.time,
                }))}
              />
            </div>
          </div>

          <div className="py-8 text-center text-xs text-slate-500">
            Live backend • © Stock‑Scope
          </div>
        </main>
      </div>
    </div>
  );
}
