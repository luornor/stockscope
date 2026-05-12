import type { Quote } from "@/lib/api-types";
import type { IntradayPoint } from "@/hooks/useIntraday";
import type { SymbolRow } from "@/hooks/useSymbols";

const KWAYISI_GSE_BASE =
  process.env.NEXT_PUBLIC_KWAYISI_GSE_BASE ?? "https://dev.kwayisi.org/apis/gse";

const GHANA_NAMES: Record<string, string> = {
  MTNGH: "MTN Ghana",
  GCB: "GCB Bank",
  CAL: "CAL Bank",
  SIC: "SIC Insurance",
  EGL: "Enterprise Group",
  ACCESS: "Access Bank Ghana",
  ADB: "Agricultural Development Bank",
  EGH: "Ecobank Ghana",
  ETI: "Ecobank Transnational Inc.",
  GOIL: "GOIL PLC",
  TOTAL: "TotalEnergies Marketing Ghana",
};

type KwayisiLiveRow = {
  name?: string;
  price?: number | string;
  change?: number | string;
  volume?: number | string;
};

type KwayisiEquityRow = {
  name?: string;
  price?: number | string;
};

function numberValue(value: unknown) {
  const n = Number(String(value ?? "0").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function displayName(symbol: string) {
  return GHANA_NAMES[symbol] ?? symbol;
}

async function fetchKwayisi<T>(path: string): Promise<T[]> {
  const response = await fetch(`${KWAYISI_GSE_BASE.replace(/\/+$/, "")}/${path}`, {
    cache: "no-store",
  });
  if (!response.ok) return [];

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchGhanaQuotes(): Promise<Quote[]> {
  const rows = await fetchKwayisi<KwayisiLiveRow>("live");
  return rows
    .map((row) => {
      const symbol = String(row.name ?? "").trim().toUpperCase();
      if (!symbol) return null;

      return {
        symbol,
        name: displayName(symbol),
        price: numberValue(row.price),
        change: numberValue(row.change),
        volume: Math.trunc(numberValue(row.volume)),
      };
    })
    .filter((row): row is Quote => Boolean(row));
}

export async function fetchGhanaSymbols(): Promise<SymbolRow[]> {
  const rows = await fetchKwayisi<KwayisiEquityRow>("equities");
  return rows
    .map((row) => {
      const symbol = String(row.name ?? "").trim().toUpperCase();
      if (!symbol) return null;
      return { symbol, name: displayName(symbol) };
    })
    .filter((row): row is SymbolRow => Boolean(row));
}

export async function fetchGhanaIntraday(symbol: string): Promise<IntradayPoint[]> {
  const rows = await fetchGhanaQuotes();
  const quote = rows.find((row) => row.symbol === symbol.toUpperCase());
  if (!quote || quote.price <= 0) return [];

  const previous = quote.price - quote.change;
  return [
    { t: "Prev", price: previous > 0 ? previous : quote.price },
    { t: "Now", price: quote.price },
  ];
}
