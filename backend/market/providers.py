from __future__ import annotations
from django.conf import settings
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple

import yfinance as yf
import requests,os, time, hashlib,feedparser
from datetime import datetime, timedelta, timezone


ALPHA_KEY = os.getenv("ALPHA_VANTAGE_KEY")
FALLBACK = os.getenv("PROVIDER_FALLBACK", "YAHOO").upper()


@dataclass
class Quote:
    symbol: str
    name: str
    price: float
    change: float  # absolute change
    volume: int

class YahooProvider:
    def _probe_ticker(self, cand: str) -> Optional[Tuple[float, float, int]]:
        """
        Try to get (price, prev_close, volume) for one Yahoo symbol candidate.
        Be VERY defensive: fast_info → info → history. Return None if no data.
        """
        t = yf.Ticker(cand)

        # 1) fast_info (can raise internally)
        price = prev_close = vol = None
        try:
            fi = getattr(t, "fast_info", None)
            if fi is not None:
                # Access inside try: some properties trigger scrapers with missing keys
                try:
                    price = getattr(fi, "last_price", None)
                except Exception:
                    price = None
                try:
                    prev_close = getattr(fi, "previous_close", None)
                except Exception:
                    prev_close = None
                try:
                    vol = getattr(fi, "last_volume", None)
                except Exception:
                    vol = None
        except Exception:
            # Ignore fast_info errors entirely
            price = prev_close = vol = None

        # 2) legacy info dict fallback if needed
        if price is None or prev_close is None:
            try:
                inf = t.info or {}
            except Exception:
                inf = {}
            if price is None:
                p = inf.get("regularMarketPrice")
                if p is not None:
                    price = float(p)
            if prev_close is None:
                pc = inf.get("previousClose")
                if pc is not None:
                    prev_close = float(pc)
            if vol is None:
                v = inf.get("volume")
                vol = int(v or 0)

        # 3) history fallback (robust for many symbols)
        if price is None or prev_close is None:
            try:
                hist = t.history(period="5d", interval="1d", auto_adjust=False, actions=False)
                if not hist.empty and "Close" in hist:
                    closes = hist["Close"]
                    last_close = float(closes.iloc[-1])
                    prev = float(closes.iloc[-2]) if len(closes) >= 2 else last_close
                    price = price if price is not None else last_close
                    prev_close = prev_close if prev_close is not None else prev
                    if vol is None and "Volume" in hist:
                        try:
                            vol = int(hist["Volume"].iloc[-1])
                        except Exception:
                            vol = 0
            except Exception:
                pass

        # Final check
        if price is None or prev_close is None:
            return None
        return (float(price), float(prev_close), int(vol or 0))

    def fetch_many(self, items: List[Dict[str, str]], market: str) -> List[Quote]:
        results: List[Quote] = []

        for it in items:
            base = it["symbol"].strip().upper()
            # Ghana often lives under “.GH”, but availability varies per symbol
            candidates = [base]
            if market == "ghana":
                candidates = [f"{base}.GH", f"{base}.gh", base]

            picked_data = None
            for cand in candidates:
                data = self._probe_ticker(cand)
                if data is not None:
                    picked_data = data
                    break

            if picked_data is None:
                # Graceful fallback — keeps API stable, no 500
                results.append(Quote(
                    symbol=it["symbol"],
                    name=it["name"],
                    price=0.0,
                    change=0.0,
                    volume=0,
                ))
            else:
                price, prev_close, vol = picked_data
                change = price - prev_close
                results.append(Quote(
                    symbol=it["symbol"],
                    name=it["name"],
                    price=round(price, 4),
                    change=round(change, 4),
                    volume=vol,
                ))

        return results

class ProviderError(Exception):
    pass
# ---------- Alpha Vantage (optional) ----------
class AlphaProvider:
    """
    Uses GLOBAL_QUOTE for each symbol (free but rate-limited).
    """
    BASE = settings.ALPHA_BASE_URL

    def __init__(self, api_key: Optional[str]):
        if not api_key:
            raise ProviderError("Alpha Vantage key missing")
        self.key = api_key

    def _one(self, symbol: str, name: str) -> Quote:
        params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": self.key}
        r = requests.get(self.BASE, params=params, timeout=12)
        r.raise_for_status()
        data = r.json().get("Global Quote", {})
        price = float(data.get("05. price", 0.0))
        prev_close = float(data.get("08. previous close", 0.0))
        vol = int(data.get("06. volume", 0) or 0)
        change = price - prev_close
        return Quote(symbol=symbol, name=name, price=price, change=change, volume=vol)

    def fetch_many(self, items: List[Dict[str, str]], market: str) -> List[Quote]:
        out = []
        for it in items:
            try:
                out.append(self._one(it["symbol"], it["name"]))
            except Exception:
                # Fall back gracefully
                out.append(Quote(symbol=it["symbol"], name=it["name"], price=0.0, change=0.0, volume=0))
        return out

# ---------- Factory ----------
def get_provider() -> object:
    if FALLBACK == "ALPHA":
        try:
            return AlphaProvider(ALPHA_KEY)
        except ProviderError:
            return YahooProvider()
    return YahooProvider()

# market/providers.py
class KwayisiGSEProvider:
    def __init__(self, base: Optional[str] = None):
        raw = base or os.getenv("KWAYISI_GSE_BASE")
        # treat bad values as unset
        if not raw or raw.strip().lower() in {"none", "null"}:
            raw = "https://dev.kwayisi.org/apis/gse"
        self.base = raw.rstrip("/")

    def fetch_many(self, items: List[Dict[str, str]], market: str) -> List[Quote]:
        url = f"{self.base}/live"
        try:
            r = requests.get(url, timeout=12)
            r.raise_for_status()
            payload = r.json() or []
        except Exception:
            # graceful fallback: return zeros for all requested items
            payload = []
        by_sym = {row.get("name", "").strip().upper(): row for row in payload}
        out: List[Quote] = []
        for it in items:
            sym = it["symbol"].strip().upper()
            row = by_sym.get(sym)
            if not row:
                out.append(Quote(symbol=sym, name=it["name"], price=0.0, change=0.0, volume=0))
            else:
                price = float(row.get("price") or 0.0)
                change = float(row.get("change") or 0.0)
                vol = int(row.get("volume") or 0)
                out.append(Quote(symbol=sym, name=it["name"], price=price, change=change, volume=vol))
        return out

    
    
# market/providers.py (add a selector that knows the market)
def get_provider_for_market(market: str):
    market = (market or "").lower()
    if market == "ghana":
        # default to Kwayisi for Ghana
        return KwayisiGSEProvider()
    # international: keep your existing preference (Yahoo/Alpha)
    return get_provider()  # your existing global factory for intl


# --- Intraday providers ------------------------------------------------------

KWAYISI_BASE = os.getenv("KWAYISI_GSE_BASE", "https://dev.kwayisi.org/apis/gse").rstrip("/")

class YahooIntradayProvider:
    """
    International intraday using yfinance.history(period=..., interval=...)
    """
    # supported combos we allow
    _ALLOWED = {
        ("1d", "1m"), ("1d", "5m"), ("5d", "15m"),
        ("1mo", "1h"), ("3mo", "1d")
    }

    @staticmethod
    def fetch(symbol: str, period: str, interval: str) -> List[Dict]:
        if (period, interval) not in YahooIntradayProvider._ALLOWED:
            # normalize: map unsupported to closest allowed combo
            if period == "1d" and interval in {"15m", "30m"}:
                interval = "5m"
            elif period == "5d" and interval in {"1m", "5m"}:
                interval = "15m"
            else:
                period, interval = "1d", "5m"
        t = yf.Ticker(symbol)
        hist = t.history(period=period, interval=interval, auto_adjust=False, actions=False)
        points: List[Dict] = []
        if hist is not None and not hist.empty and "Close" in hist:
            for idx, row in hist.iterrows():
                # idx is pandas Timestamp
                ts = idx.tz_convert("UTC") if getattr(idx, "tzinfo", None) else idx.tz_localize("UTC")
                label = ts.strftime("%H:%M") if period in {"1d", "5d"} else ts.strftime("%Y-%m-%d")
                points.append({"t": label, "price": float(row["Close"])})
        return points


class KwayisiGhanaIntradayProvider:
    """
    Kwayisi public API exposes live quotes but no intraday series.
    We synthesize a same-day mini-series from (prev_close, current_price).
    For longer ranges we currently don’t support (return 400 upstream).
    """
    @staticmethod
    def fetch(symbol: str) -> List[Dict]:
        # GET /live -> array of rows {name, price, change, volume}
        url = f"{KWAYISI_BASE}/live"
        try:
            r = requests.get(url, timeout=12)
            r.raise_for_status()
            data = r.json() or []
        except Exception:
            # graceful empty
            return []

        row = next((x for x in data if x.get("name", "").upper() == symbol.upper()), None)
        if not row:
            return []

        price = float(row.get("price") or 0.0)
        change = float(row.get("change") or 0.0)
        prev_close = price - change

        now = datetime.now(timezone.utc)
        # fake a simple day path: open(prev_close) -> current(price)
        return [
            {"t": "09:00", "price": prev_close},   # market open approximation
            {"t": now.strftime("%H:%M"), "price": price},
        ]




FINNHUB_KEY = os.getenv("FINNHUB_KEY")

def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()

class FinnhubNewsProvider:
    """
    International news via Finnhub.
    - General news: GET /news?category=general
    - Company news: GET /company-news?symbol=...&from=...&to=...
    Free tier is limited (60/min). We keep it lean and cache at the view layer.
    """
    BASE = "https://finnhub.io/api/v1"

    def __init__(self, api_key: Optional[str] = None):
        self.key = api_key or FINNHUB_KEY

    def _get(self, path: str, params: Dict) -> List[Dict]:
        if not self.key:
            return []
        params = {**params, "token": self.key}
        r = requests.get(f"{self.BASE}{path}", params=params, timeout=12)
        r.raise_for_status()
        data = r.json() or []
        if isinstance(data, dict):  # Finnhub sometimes returns dict on error
            return []
        return data

    def general(self, limit: int = 20) -> List[Dict]:
        rows = self._get("/news", {"category": "general"})[:limit]
        out = []
        for it in rows:
            # it: {headline, source, url, datetime,...}
            ts = datetime.fromtimestamp(it.get("datetime", 0), tz=timezone.utc)
            nid = hashlib.md5((it.get("url") or it.get("headline","")).encode()).hexdigest()
            out.append({
                "id": nid,
                "source": it.get("source") or "Finnhub",
                "title": it.get("headline") or "",
                "url": it.get("url") or "",
                "published_at": ts,
            })
        return out

    def company(self, symbol: str, days: int = 7, limit: int = 20) -> List[Dict]:
        to = datetime.now(timezone.utc).date()
        frm = to - timedelta(days=days)
        rows = self._get("/company-news", {"symbol": symbol.upper(), "from": frm.isoformat(), "to": to.isoformat()})[:limit]
        out = []
        for it in rows:
            ts = datetime.fromtimestamp(it.get("datetime", 0), tz=timezone.utc)
            nid = hashlib.md5((it.get("url") or it.get("headline","")).encode()).hexdigest()
            out.append({
                "id": nid,
                "source": it.get("source") or "Finnhub",
                "title": it.get("headline") or "",
                "url": it.get("url") or "",
                "published_at": ts,
            })
        return out


class GhanaRssNewsProvider:
    """
    Ghana market/business news via RSS (free, no keys).
    Add/remove feeds as needed.
    """
    FEEDS = [
        # Business sections from reputable Ghana outlets:
        "https://www.graphic.com.gh/business-news.html?format=feed&type=rss",
        "https://www.ghanaweb.com/GhanaHomePage/business/rss/",
        "https://www.myjoyonline.com/business/feed/",
        "https://www.bog.gov.gh/category/news/feed/",          # Bank of Ghana
        "https://www.ghana-stock-exchange.com/feed/",          # GSE site (if RSS is enabled; safe to include)
    ]

    def fetch(self, limit: int = 20) -> List[Dict]:
        items: List[Dict] = []
        for url in self.FEEDS:
            try:
                feed = feedparser.parse(url)
                for e in feed.entries[:max(3, limit // 2)]:  # take a few from each to diversify
                    title = getattr(e, "title", "")
                    link = getattr(e, "link", "")
                    source = feed.feed.get("title", "RSS")
                    # publish date handling
                    if hasattr(e, "published_parsed") and e.published_parsed:
                        ts = datetime.fromtimestamp(time.mktime(e.published_parsed), tz=timezone.utc)
                    elif hasattr(e, "updated_parsed") and e.updated_parsed:
                        ts = datetime.fromtimestamp(time.mktime(e.updated_parsed), tz=timezone.utc)
                    else:
                        ts = datetime.now(timezone.utc)

                    nid = hashlib.md5(link.encode()).hexdigest() if link else hashlib.md5(title.encode()).hexdigest()
                    items.append({
                        "id": nid,
                        "source": source,
                        "title": title,
                        "url": link,
                        "published_at": ts,
                    })
            # Never break the endpoint because one feed is down
            except Exception:
                continue

        # Sort by date desc, dedupe by id
        items.sort(key=lambda x: x["published_at"], reverse=True)
        seen = set()
        out: List[Dict] = []
        for it in items:
            if it["id"] in seen:
                continue
            seen.add(it["id"])
            out.append(it)
            if len(out) >= limit:
                break
        return out



class SymbolsProvider:
    """Lists symbols for a market. Ghana via Kwayisi; international is curated."""
    INTL = [
        {"symbol":"AAPL","name":"Apple Inc."},
        {"symbol":"MSFT","name":"Microsoft"},
        {"symbol":"NVDA","name":"NVIDIA"},
        {"symbol":"TSLA","name":"Tesla"},
        {"symbol":"AMZN","name":"Amazon"},
    ]
    @staticmethod
    def ghana():
        try:
            r = requests.get(f"{KWAYISI_BASE}/equities", timeout=12)
            r.raise_for_status()
            data = r.json() or []
            # Kwayisi returns array of dicts; normalise minimally
            out = []
            for row in data:
                sym = (row.get("name") or row.get("symbol") or "").strip().upper()
                nm  = (row.get("fullname") or row.get("company") or sym)
                if sym:
                    out.append({"symbol": sym, "name": nm})
            return out
        except Exception:
            # fallback to a tiny starter set
            return [
                {"symbol":"MTNGH","name":"MTN Ghana"},
                {"symbol":"GCB","name":"GCB Bank"},
                {"symbol":"CAL","name":"CAL Bank"},
                {"symbol":"SIC","name":"SIC Insurance"},
                {"symbol":"EGL","name":"Enterprise Group"},
            ]

    @classmethod
    def list(cls, market: str):
        return cls.ghana() if market == "ghana" else cls.INTL
