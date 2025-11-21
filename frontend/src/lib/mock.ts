import { Quote, IntradayPoint, SectorSlice, NewsItem } from './api-types';

// --- Mock Data -------------------------------------------------------------
export const ghStocks: Quote[] = [
  { symbol: "MTNGH", name: "MTN Ghana", price: 1.48, change: 0.03, volume: 210340 },
  { symbol: "GCB", name: "GCB Bank", price: 4.12, change: -0.06, volume: 51203 },
  { symbol: "CAL", name: "CAL Bank", price: 0.62, change: 0.01, volume: 90731 },
  { symbol: "SIC", name: "SIC Insurance", price: 0.36, change: 0.00, volume: 10345 },
  { symbol: "EGL", name: "Enterprise Grp.", price: 3.25, change: 0.05, volume: 15670 },
];

export const intlStocks: Quote[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 226.34, change: 2.14, volume: 52120340 },
  { symbol: "MSFT", name: "Microsoft", price: 418.01, change: -1.22, volume: 31203450 },
  { symbol: "NVDA", name: "NVIDIA", price: 124.56, change: 3.09, volume: 21033440 },
  { symbol: "TSLA", name: "Tesla", price: 246.87, change: -4.12, volume: 48210321 },
  { symbol: "AMZN", name: "Amazon", price: 178.90, change: 1.45, volume: 39123450 },
];

export const intradaySeries: IntradayPoint[] = Array.from({ length: 24 }).map((_, i) => ({
  t: `${i}:00`,
  price: 220 + Math.sin(i / 3) * 3 + i * 0.1,
}));

export const sectorHeatIntl: SectorSlice[] = [
  { name: "Tech", value: 38 },
  { name: "Health", value: 12 },
  { name: "Energy", value: 9 },
  { name: "Finance", value: 18 },
  { name: "Consumer", value: 23 },
];

export const newsItems: NewsItem[] = [
  { id: 1, source: "Bloomwire", title: "Markets edge higher on AI optimism", time: "12m" },
  { id: 2, source: "Accra Ledger", title: "GSE weekly review: MTNGH leads volumes", time: "1h" },
  { id: 3, source: "FinTimes", title: "Energy stocks dip as oil retreats", time: "2h" },
  { id: 4, source: "TechPulse", title: "Chipmakers rally on data center demand", time: "3h" },
];