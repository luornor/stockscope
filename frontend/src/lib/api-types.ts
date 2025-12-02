// ============================
// src/lib/api-types.ts
// ============================
export type Market = 'international' | 'ghana';


export interface Quote {
symbol: string;
name: string;
price: number; // last trade
change: number; // absolute change from previous close
volume: number; // latest volume
}


export interface IntradayPoint { t: string; price: number }


export interface SectorSlice { name: string; value: number; [key: string]: unknown }


export interface NewsItem { id: string | number; source: string; title: string; time: string }
