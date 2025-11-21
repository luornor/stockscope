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


export interface SectorSlice { name: string; value: number; [key: string]: any }


export interface NewsItem { id: string | number; source: string; title: string; time: string }


// Backend endpoints you’ll likely expose later:
// GET /api/quotes?market=ghana|international -> Quote[]
// GET /api/quotes/intraday?symbol=AAPL&interval=1m -> IntradayPoint[]
// GET /api/movers?market=ghana|international -> Quote[] (top movers)
// GET /api/watchlist -> Quote[] for current user
// GET /api/portfolio/sectors -> SectorSlice[]
// GET /api/news?market=ghana|international -> NewsItem[]