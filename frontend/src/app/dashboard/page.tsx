// ============================
// src/app/dashboard/page.tsx
// ============================
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
import {
  ghStocks,
  intlStocks,
  intradaySeries,
  sectorHeatIntl,
  newsItems,
} from "@/lib/mock";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [market, setMarket] = useState<Market>("international");

  const quotes = market === "international" ? intlStocks : ghStocks;
  const symbol = market === "international" ? "AAPL" : "MTNGH";

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(34,211,238,0.15),transparent),radial-gradient(1000px_600px_at_-10%_0%,rgba(168,85,247,0.10),transparent)] bg-slate-950 text-slate-100">
      <Header onMenu={() => setSidebarOpen(!sidebarOpen)} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:flex gap-6">
        <Sidebar open={sidebarOpen} setMarket={setMarket} market={market} />
        <main className="flex-1 md:ml-0 mt-6 md:mt-10 w-full">
          {/* Hero Row */}
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
            <div className="lg:col-span-2">
              <ChartPanel symbol={symbol} data={intradaySeries} />
            </div>
            <div className="space-y-4">
              <Movers
                data={quotes}
                spark={intradaySeries.map((d) => ({ t: d.t, a: d.price }))}
              />
              <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                <div className="text-sm text-slate-300">Market Status</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full border border-emerald-400/30 text-emerald-300 bg-emerald-500/10">
                    {market === "international" ? "US: Open" : "GSE: Open"}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-slate-300">
                    UTC {new Date().toUTCString().slice(17, 22)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Row */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <PricePanel market={market} quotes={quotes} />
              <SectorSplit data={sectorHeatIntl} />
            </div>
            <div className="space-y-4">
              <Watchlist data={quotes} />
              <NewsList items={newsItems} />
            </div>
          </div>

          <div className="py-8 text-center text-xs text-slate-500">
            UI only • No live data • © Stock‑Scope
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================
