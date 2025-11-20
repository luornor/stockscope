"use client";
import React from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  Globe2,
  Castle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Wallet,
  Rocket,
  Newspaper,
  LayoutGrid,
  CandlestickChart as CandleIcon,
} from "lucide-react";

/**
 * Stock-Scope: Futuristic Stock Dashboard UI (no backend calls)
 * - Modern, responsive, dark-first design with neon accents
 * - Ghana + International markets toggle
 * - Built with Tailwind + Recharts + Framer Motion + Lucide icons
 * - All data below are mock placeholders; wire to your API later
 */

// --- Mock Data -------------------------------------------------------------
const ghStocks = [
  { symbol: "MTNGH", name: "MTN Ghana", price: 1.48, change: 0.03, volume: 210340 },
  { symbol: "GCB", name: "GCB Bank", price: 4.12, change: -0.06, volume: 51203 },
  { symbol: "CAL", name: "CAL Bank", price: 0.62, change: 0.01, volume: 90731 },
  { symbol: "SIC", name: "SIC Insurance", price: 0.36, change: 0.00, volume: 10345 },
  { symbol: "EGL", name: "Enterprise Grp.", price: 3.25, change: 0.05, volume: 15670 },
];

const intlStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 226.34, change: 2.14, volume: 52120340 },
  { symbol: "MSFT", name: "Microsoft", price: 418.01, change: -1.22, volume: 31203450 },
  { symbol: "NVDA", name: "NVIDIA", price: 124.56, change: 3.09, volume: 21033440 },
  { symbol: "TSLA", name: "Tesla", price: 246.87, change: -4.12, volume: 48210321 },
  { symbol: "AMZN", name: "Amazon", price: 178.90, change: 1.45, volume: 39123450 },
];

const intradaySeries = Array.from({ length: 24 }).map((_, i) => ({
  t: `${i}:00`,
  aapl: 220 + Math.sin(i / 3) * 3 + i * 0.1,
  mtngh: 1.35 + Math.sin(i / 4) * 0.02 + i * 0.002,
}));

const sectorHeatIntl = [
  { name: "Tech", value: 38 },
  { name: "Health", value: 12 },
  { name: "Energy", value: 9 },
  { name: "Finance", value: 18 },
  { name: "Consumer", value: 23 },
];

const newsItems = [
  { id: 1, source: "Bloomwire", title: "Markets edge higher on AI optimism", time: "12m" },
  { id: 2, source: "Accra Ledger", title: "GSE weekly review: MTNGH leads volumes", time: "1h" },
  { id: 3, source: "FinTimes", title: "Energy stocks dip as oil retreats", time: "2h" },
  { id: 4, source: "TechPulse", title: "Chipmakers rally on data center demand", time: "3h" },
];

// --- Utility ---------------------------------------------------------------
function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function pctColor(n: number) {
  return n >= 0 ? "text-emerald-400" : "text-rose-400";
}

function pctBadge(n: number) {
  const Icon = n >= 0 ? ArrowUpRight : ArrowDownRight;
  const bg = n >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400";
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs", bg)}>
      <Icon className="size-3" /> {n.toFixed(2)}%
    </span>
  );
}

// --- Components ------------------------------------------------------------
function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 bg-slate-900/80 border-b border-white/5">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center gap-3">
        <button onClick={onMenu} className="md:hidden p-2 rounded-xl hover:bg-white/5">
          <Menu className="size-5 text-slate-200" />
        </button>
        <div className="flex items-center gap-2">
          <Rocket className="size-5 text-cyan-400" />
          <span className="font-semibold tracking-tight text-slate-100">Stock‑Scope</span>
          <span className="text-[10px] uppercase tracking-widest text-cyan-400/70 border border-cyan-400/30 rounded px-1.5 py-[1px] ml-2">alpha UI</span>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2">
          <div className="group hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus-within:ring-2 ring-cyan-500/40">
            <Search className="size-4 text-slate-400" />
            <input placeholder="Search tickers, news…" className="bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-500 w-64" />
          </div>
          <button className="p-2 rounded-xl hover:bg-white/5"><Bell className="size-5 text-slate-300"/></button>
          <button className="p-2 rounded-xl hover:bg-white/5"><Settings className="size-5 text-slate-300"/></button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500" />
        </div>
      </div>
    </div>
  );
}

function Sidebar({ open, setMarket, market }: { open: boolean; setMarket: (m: Market) => void; market: Market }) {
  const links = [
    { label: "Overview", icon: LayoutGrid },
    { label: "Charts", icon: CandleIcon },
    { label: "News", icon: Newspaper },
    { label: "Wallet", icon: Wallet },
  ];
  return (
    <motion.aside
      initial={false}
      animate={{ x: open ? 0 : -280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed md:static z-40 left-0 top-12 md:top-0 h-[calc(100dvh-48px)] md:h-screen w-72 md:w-72 bg-slate-950/60 backdrop-blur border-r border-white/5"
    >
      <div className="p-4">
        <div className="text-xs text-slate-400 mb-2">Markets</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMarket("international")}
            className={cx(
              "flex items-center gap-2 rounded-2xl px-3 py-2 border text-sm",
              market === "international"
                ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 hover:border-white/20 text-slate-300"
            )}
          >
            <Globe2 className="size-4"/> International
          </button>
          <button
            onClick={() => setMarket("ghana")}
            className={cx(
              "flex items-center gap-2 rounded-2xl px-3 py-2 border text-sm",
              market === "ghana"
                ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-300"
                : "border-white/10 hover:border-white/20 text-slate-300"
            )}
          >
            <Castle className="size-4"/> Ghana
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-400 mb-2">Shortcuts</div>
        <div className="space-y-1">
          {links.map((l) => (
            <button key={l.label} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5">
              <l.icon className="size-4 text-slate-300"/> <span className="text-slate-200 text-sm">{l.label}</span>
              <ChevronRight className="ml-auto size-4 text-slate-500"/>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10">
          <div className="text-slate-300 text-sm">Your Plan</div>
          <div className="text-slate-100 font-semibold mt-1">Analyst</div>
          <div className="text-slate-400 text-xs mt-2">Unlock real‑time quotes & advanced screeners.</div>
          <button className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/30">
            <Plus className="size-4"/> Upgrade
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function StatCard({ title, value, delta, subtle }: { title: string; value: string; delta?: number; subtle?: boolean }) {
  return (
    <div className={cx(
      "rounded-2xl border p-4 md:p-5",
      subtle ? "border-white/10 bg-white/5" : "border-white/10 bg-gradient-to-br from-white/5 to-white/0"
    )}>
      <div className="text-xs text-slate-400">{title}</div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl md:text-3xl font-semibold text-slate-100">{value}</div>
        {typeof delta === "number" && pctBadge(delta)}
      </div>
    </div>
  );
}

function Watchlist({ data }: { data: typeof intlStocks }) {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="font-medium text-slate-100">Watchlist</div>
        <button className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">Manage</button>
      </div>
      <div className="divide-y divide-white/5">
        {data.map((s) => (
          <div key={s.symbol} className="px-4 py-3 grid grid-cols-12 items-center gap-2 hover:bg-white/5">
            <div className="col-span-4 md:col-span-3">
              <div className="font-medium text-slate-100">{s.symbol}</div>
              <div className="text-xs text-slate-400">{s.name}</div>
            </div>
            <div className="col-span-4 md:col-span-3 text-slate-200">{s.price.toFixed(2)}</div>
            <div className={cx("col-span-4 md:col-span-3 font-medium", pctColor((s.change / s.price) * 100))}>
              {pctBadge((s.change / (s.price - s.change)) * 100)}
            </div>
            <div className="hidden md:block md:col-span-3 text-right text-slate-400 text-xs">Vol {Intl.NumberFormat().format(s.volume)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmallSpark({ dataKey, data }: { dataKey: string; data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="t" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
        <Area type="monotone" dataKey={dataKey} stroke="#22d3ee" fillOpacity={1} fill={`url(#g-${dataKey})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Movers({ data }: { data: typeof intlStocks }) {
  const sorted = useMemo(() => [...data].sort((a, b) => Math.abs((b.change / b.price)) - Math.abs((a.change / a.price))), [data]);
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-white/5">
        <TrendingUp className="size-4 text-emerald-400"/>
        <div className="font-medium text-slate-100">Top Movers</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
        {sorted.slice(0, 4).map((s) => {
          const pct = (s.change / (s.price - s.change)) * 100;
          const up = pct >= 0;
          const Icon = up ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={s.symbol} className="rounded-xl border border-white/10 p-3 bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-medium">{s.symbol}</div>
                  <div className="text-xs text-slate-400">{s.name}</div>
                </div>
                <div className={cx("inline-flex items-center gap-1 text-sm font-semibold", up ? "text-emerald-400" : "text-rose-400")}> <Icon className="size-4"/> {pct.toFixed(2)}%</div>
              </div>
              <div className="mt-2 h-14">
                <SmallSpark dataKey={"aapl"} data={intradaySeries} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectorSplit({ data }: { data: { name: string; value: number }[] }) {
  const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#34d399", "#f59e0b"];
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
        <LayoutGrid className="size-4 text-cyan-300"/> <div className="font-medium text-slate-100">Sector Allocation</div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {data.map((entry, index) => (
                  <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="text-slate-300">{s.name}</div>
              <div className="text-slate-100 font-medium">{s.value}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewsList() {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-white/5">
        <Newspaper className="size-4 text-fuchsia-300"/> <div className="font-medium text-slate-100">Latest News</div>
      </div>
      <div className="divide-y divide-white/5">
        {newsItems.map((n) => (
          <a key={n.id} className="block px-4 py-3 hover:bg-white/5 group cursor-pointer">
            <div className="text-slate-200 group-hover:text-white">{n.title}</div>
            <div className="text-xs text-slate-500 mt-1">{n.source} • {n.time} ago</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function PricePanel({ market }: { market: Market }) {
  const active = market === "international" ? intlStocks : ghStocks;
  const label = market === "international" ? "International" : "Ghana";
  const accent = market === "international" ? "from-cyan-500/20" : "from-fuchsia-500/20";
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className={cx("px-4 py-3 border-b border-white/10 bg-gradient-to-r to-transparent", accent)}>
        <div className="flex items-center gap-2">
          <div className="font-medium text-slate-100">{label} Prices</div>
          <span className="text-[10px] px-2 py-[2px] rounded-full border border-white/10 text-slate-400">mock</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
        {active.map((s) => (
          <div key={s.symbol} className="rounded-xl border border-white/10 p-3 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-medium">{s.symbol}</div>
                <div className="text-xs text-slate-400">{s.name}</div>
              </div>
              <div className="text-slate-100 font-semibold">{s.price.toFixed(2)}</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 items-center">
              <div className="text-xs text-slate-400">Change</div>
              <div className="text-right">{pctBadge((s.change / (s.price - s.change)) * 100)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main ------------------------------------------------------------------
type Market = "international" | "ghana";

export default function StockDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [market, setMarket] = useState<Market>("international");

  const aapl = intradaySeries.map(d => ({ t: d.t, price: d.aapl }));
  const mtngh = intradaySeries.map(d => ({ t: d.t, price: d.mtngh }));

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(34,211,238,0.15),transparent),radial-gradient(1000px_600px_at_-10%_0%,rgba(168,85,247,0.10),transparent)] bg-slate-950 text-slate-100">
      <TopBar onMenu={() => setSidebarOpen(!sidebarOpen)} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:flex gap-6">
        <Sidebar open={sidebarOpen} setMarket={setMarket} market={market} />

        <main className="flex-1 md:ml-0 mt-6 md:mt-10 w-full">
          {/* Hero Row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard title="Portfolio Value" value={market === "international" ? "$38,420" : "₵147,830"} delta={1.82} />
            <StatCard title="Daily P/L" value={market === "international" ? "+$612" : "+₵1,940"} delta={1.61} subtle />
            <StatCard title="Exposure" value={market === "international" ? "65% Tech" : "40% Banking"} subtle />
            <StatCard title="Risk" value="Moderate" subtle />
          </div>

          {/* Charts Row */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CandleIcon className="size-4 text-cyan-300"/>
                  <div className="font-medium">{market === "international" ? "AAPL" : "MTNGH"} • Intraday</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">1D</button>
                  <button className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">1W</button>
                  <button className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">1M</button>
                </div>
              </div>
              <div className="h-72 md:h-96 p-2 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={market === "international" ? aapl : mtngh} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2.2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <Movers data={market === "international" ? intlStocks : ghStocks} />
              <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                <div className="text-sm text-slate-300">Market Status</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full border border-emerald-400/30 text-emerald-300 bg-emerald-500/10">{market === "international" ? "US: Open" : "GSE: Open"}</span>
                  <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-slate-300">UTC {new Date().toUTCString().slice(17, 22)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Row */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <PricePanel market={market} />
              <SectorSplit data={sectorHeatIntl} />
            </div>
            <div className="space-y-4">
              <Watchlist data={market === "international" ? intlStocks : ghStocks} />
              <NewsList />
            </div>
          </div>

          {/* Footer */}
          <div className="py-8 text-center text-xs text-slate-500">UI only • No live data • © Stock‑Scope</div>
        </main>
      </div>
    </div>
  );
}
