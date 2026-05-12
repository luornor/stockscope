// ============================
// src/lib/api-types.ts
// ============================
export type Market = "international" | "ghana";


export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}


export interface IntradayPoint { t: string; price: number }


export interface SectorSlice { name: string; value: number; [key: string]: unknown }


export interface NewsItem {
  id: string | number;
  source: string;
  title: string;
  url: string;
  published_at?: string;
  time?: string;
}
