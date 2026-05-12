from __future__ import annotations

import hashlib
import os
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

import requests
from django.conf import settings
from django.core.cache import cache
from requests.adapters import HTTPAdapter
from rest_framework.exceptions import APIException
from urllib3.util.retry import Retry

try:
    import feedparser
except ImportError:
    feedparser = None

try:
    import yfinance as yf
except ImportError:
    yf = None


DEFAULT_KWAYISI_GSE_BASE = "https://dev.kwayisi.org/apis/gse"


def _float_env(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


CONNECT_TIMEOUT = _float_env("UPSTREAM_CONNECT_TIMEOUT", 2.5)
READ_TIMEOUT = _float_env("UPSTREAM_READ_TIMEOUT", 5.0)
UPSTREAM_TIMEOUT = (CONNECT_TIMEOUT, READ_TIMEOUT)
QUOTE_CACHE_SECONDS = _int_env("QUOTE_CACHE_SECONDS", 30)
GHANA_LIVE_CACHE_SECONDS = _int_env("GHANA_LIVE_CACHE_SECONDS", 45)
GHANA_STALE_CACHE_SECONDS = _int_env("GHANA_STALE_CACHE_SECONDS", 6 * 60 * 60)
GHANA_SYMBOL_CACHE_SECONDS = _int_env("GHANA_SYMBOL_CACHE_SECONDS", 6 * 60 * 60)

ALPHA_KEY = getattr(settings, "ALPHA_VANTAGE_KEY", None) or os.getenv("ALPHA_VANTAGE_KEY")
FALLBACK = (getattr(settings, "PROVIDER_FALLBACK", None) or os.getenv("PROVIDER_FALLBACK") or "YAHOO").upper()
FINNHUB_KEY = getattr(settings, "FINNHUB_KEY", None) or os.getenv("FINNHUB_KEY")


_retry = Retry(
    total=1,
    connect=1,
    read=0,
    backoff_factor=0.2,
    status_forcelist=(429, 500, 502, 503, 504),
    allowed_methods=frozenset(["GET"]),
)
_session = requests.Session()
_session.headers.update({"User-Agent": "stock-scope/1.0"})
_adapter = HTTPAdapter(max_retries=_retry, pool_connections=10, pool_maxsize=10)
_session.mount("https://", _adapter)
_session.mount("http://", _adapter)


@dataclass
class Quote:
    symbol: str
    name: str
    price: float
    change: float
    volume: int


class ProviderError(Exception):
    pass


class UpstreamUnavailable(APIException):
    status_code = 503
    default_detail = "Market data provider temporarily unavailable. Please try again."
    default_code = "upstream_unavailable"


def _cache_get(key: str) -> Any:
    try:
        return cache.get(key)
    except Exception:
        return None


def _cache_set(key: str, value: Any, timeout: int) -> None:
    try:
        cache.set(key, value, timeout)
    except Exception:
        pass


def _request_json(url: str, params: Optional[Dict[str, Any]] = None) -> Any:
    response = _session.get(url, params=params, timeout=UPSTREAM_TIMEOUT)
    response.raise_for_status()
    return response.json()


def _quotes_to_rows(quotes: List[Quote]) -> List[Dict[str, Any]]:
    return [asdict(q) for q in quotes]


def _rows_to_quotes(rows: List[Dict[str, Any]]) -> List[Quote]:
    return [
        Quote(
            symbol=str(row.get("symbol") or ""),
            name=str(row.get("name") or ""),
            price=float(row.get("price") or 0.0),
            change=float(row.get("change") or 0.0),
            volume=int(row.get("volume") or 0),
        )
        for row in rows
    ]


def _items_cache_key(prefix: str, items: List[Dict[str, str]], market: str) -> str:
    payload = "|".join(
        f"{(it.get('symbol') or '').strip().upper()}:{it.get('name') or ''}" for it in items
    )
    digest = hashlib.md5(payload.encode("utf-8")).hexdigest()
    return f"{prefix}:{market}:{digest}"


def _number(value: Any, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return default


def _integer(value: Any, default: int = 0) -> int:
    try:
        return int(_number(value, float(default)))
    except (TypeError, ValueError):
        return default


class YahooProvider:
    def _probe_ticker(self, cand: str) -> Optional[Tuple[float, float, int]]:
        if yf is None:
            return None
        t = yf.Ticker(cand)
        price = prev_close = vol = None

        try:
            fi = getattr(t, "fast_info", None)
            if fi is not None:
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
            price = prev_close = vol = None

        if price is None or prev_close is None:
            try:
                inf = t.info or {}
            except Exception:
                inf = {}
            if price is None and inf.get("regularMarketPrice") is not None:
                price = _number(inf.get("regularMarketPrice"))
            if prev_close is None and inf.get("previousClose") is not None:
                prev_close = _number(inf.get("previousClose"))
            if vol is None:
                vol = _integer(inf.get("volume"))

        if price is None or prev_close is None:
            try:
                hist = t.history(period="5d", interval="1d", auto_adjust=False, actions=False)
                if hist is not None and not hist.empty and "Close" in hist:
                    closes = hist["Close"]
                    last_close = float(closes.iloc[-1])
                    prev = float(closes.iloc[-2]) if len(closes) >= 2 else last_close
                    price = price if price is not None else last_close
                    prev_close = prev_close if prev_close is not None else prev
                    if vol is None and "Volume" in hist:
                        vol = _integer(hist["Volume"].iloc[-1])
            except Exception:
                pass

        if price is None or prev_close is None:
            return None
        return float(price), float(prev_close), int(vol or 0)

    def fetch_many(self, items: List[Dict[str, str]], market: str) -> List[Quote]:
        cache_key = _items_cache_key("quotes:yahoo:v1", items, market)
        cached = _cache_get(cache_key)
        if cached is not None:
            return _rows_to_quotes(cached)

        results: List[Quote] = []
        for it in items:
            base = it["symbol"].strip().upper()
            candidates = [base]
            if market == "ghana":
                candidates = [f"{base}.GH", f"{base}.gh", base]

            picked_data = None
            for cand in candidates:
                picked_data = self._probe_ticker(cand)
                if picked_data is not None:
                    break

            if picked_data is None:
                results.append(
                    Quote(symbol=it["symbol"], name=it["name"], price=0.0, change=0.0, volume=0)
                )
                continue

            price, prev_close, vol = picked_data
            results.append(
                Quote(
                    symbol=it["symbol"],
                    name=it["name"],
                    price=round(price, 4),
                    change=round(price - prev_close, 4),
                    volume=vol,
                )
            )

        _cache_set(cache_key, _quotes_to_rows(results), QUOTE_CACHE_SECONDS)
        return results


class AlphaProvider:
    BASE = getattr(settings, "ALPHA_BASE_URL", None) or "https://www.alphavantage.co/query"

    def __init__(self, api_key: Optional[str]):
        if not api_key:
            raise ProviderError("Alpha Vantage key missing")
        self.key = api_key

    def _one(self, symbol: str, name: str) -> Quote:
        params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": self.key}
        data = _request_json(self.BASE, params=params).get("Global Quote", {})
        price = _number(data.get("05. price"))
        prev_close = _number(data.get("08. previous close"))
        vol = _integer(data.get("06. volume"))
        return Quote(symbol=symbol, name=name, price=price, change=price - prev_close, volume=vol)

    def fetch_many(self, items: List[Dict[str, str]], market: str) -> List[Quote]:
        cache_key = _items_cache_key("quotes:alpha:v1", items, market)
        cached = _cache_get(cache_key)
        if cached is not None:
            return _rows_to_quotes(cached)

        out = []
        for it in items:
            try:
                out.append(self._one(it["symbol"], it["name"]))
            except Exception:
                out.append(Quote(symbol=it["symbol"], name=it["name"], price=0.0, change=0.0, volume=0))

        _cache_set(cache_key, _quotes_to_rows(out), QUOTE_CACHE_SECONDS)
        return out


def get_provider() -> object:
    if FALLBACK == "ALPHA":
        try:
            return AlphaProvider(ALPHA_KEY)
        except ProviderError:
            return YahooProvider()
    return YahooProvider()


GHANA_DEFAULT_SYMBOLS = [
    {"symbol": "MTNGH", "name": "MTN Ghana"},
    {"symbol": "GCB", "name": "GCB Bank"},
    {"symbol": "CAL", "name": "CAL Bank"},
    {"symbol": "SIC", "name": "SIC Insurance"},
    {"symbol": "EGL", "name": "Enterprise Group"},
]
GHANA_NAME_OVERRIDES = {row["symbol"]: row["name"] for row in GHANA_DEFAULT_SYMBOLS}


def _kwayisi_base(base: Optional[str] = None) -> str:
    raw = base or getattr(settings, "KWAYISI_GSE_BASE", None) or os.getenv("KWAYISI_GSE_BASE")
    raw = (raw or DEFAULT_KWAYISI_GSE_BASE).strip()
    if not raw or raw.lower() in {"none", "null"}:
        raw = DEFAULT_KWAYISI_GSE_BASE
    if not raw.startswith(("http://", "https://")):
        raw = DEFAULT_KWAYISI_GSE_BASE
    return raw.rstrip("/")


def _kwayisi_cache_key(base: Optional[str], path: str) -> str:
    digest = hashlib.md5(_kwayisi_base(base).encode("utf-8")).hexdigest()[:10]
    clean_path = path.strip("/").replace("/", ":")
    return f"kwayisi:gse:{clean_path}:v2:{digest}"


def _kwayisi_json(path: str, base: Optional[str], ttl: int, stale_ttl: int) -> Any:
    cache_key = _kwayisi_cache_key(base, path)
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    url = f"{_kwayisi_base(base)}/{path.lstrip('/')}"
    try:
        data = _request_json(url) or []
    except Exception:
        stale = _cache_get(f"{cache_key}:stale")
        return stale if stale is not None else []

    _cache_set(cache_key, data, ttl)
    _cache_set(f"{cache_key}:stale", data, stale_ttl)
    return data


def _kwayisi_live_rows(base: Optional[str] = None) -> List[Dict[str, Any]]:
    data = _kwayisi_json(
        "live",
        base,
        GHANA_LIVE_CACHE_SECONDS,
        GHANA_STALE_CACHE_SECONDS,
    )
    return data if isinstance(data, list) else []


def _kwayisi_equity_rows(base: Optional[str] = None) -> List[Dict[str, Any]]:
    data = _kwayisi_json(
        "equities",
        base,
        GHANA_SYMBOL_CACHE_SECONDS,
        24 * 60 * 60,
    )
    return data if isinstance(data, list) else []


class KwayisiGSEProvider:
    def __init__(self, base: Optional[str] = None):
        self.base = _kwayisi_base(base)

    def fetch_many(self, items: List[Dict[str, str]], market: str) -> List[Quote]:
        payload = _kwayisi_live_rows(self.base)
        by_sym = {
            str(row.get("name") or row.get("symbol") or row.get("ticker") or "").strip().upper(): row
            for row in payload
            if isinstance(row, dict)
        }

        out: List[Quote] = []
        for it in items:
            sym = it["symbol"].strip().upper()
            row = by_sym.get(sym)
            if not row:
                out.append(Quote(symbol=sym, name=it["name"], price=0.0, change=0.0, volume=0))
                continue

            out.append(
                Quote(
                    symbol=sym,
                    name=it["name"],
                    price=_number(row.get("price")),
                    change=_number(row.get("change")),
                    volume=_integer(row.get("volume")),
                )
            )
        return out


def get_provider_for_market(market: str):
    market = (market or "").lower()
    if market == "ghana":
        ghana_provider = (
            getattr(settings, "PROVIDER_GHANA", None) or os.getenv("PROVIDER_GHANA") or "KWAYISI"
        ).upper()
        if ghana_provider == "YAHOO":
            return YahooProvider()
        if ghana_provider == "ALPHA":
            try:
                return AlphaProvider(ALPHA_KEY)
            except ProviderError:
                return KwayisiGSEProvider()
        return KwayisiGSEProvider()
    return get_provider()


class YahooIntradayProvider:
    _ALLOWED = {
        ("1d", "1m"),
        ("1d", "5m"),
        ("5d", "15m"),
        ("1mo", "1h"),
        ("3mo", "1d"),
    }

    @staticmethod
    def fetch(symbol: str, period: str, interval: str) -> List[Dict[str, Any]]:
        if (period, interval) not in YahooIntradayProvider._ALLOWED:
            if period == "1d" and interval in {"15m", "30m"}:
                interval = "5m"
            elif period == "5d" and interval in {"1m", "5m"}:
                interval = "15m"
            else:
                period, interval = "1d", "5m"

        cache_key = f"intraday:yahoo:v1:{symbol.upper()}:{period}:{interval}"
        cached = _cache_get(cache_key)
        if cached is not None:
            return cached

        points: List[Dict[str, Any]] = []
        if yf is None:
            return points
        try:
            hist = yf.Ticker(symbol).history(period=period, interval=interval, auto_adjust=False, actions=False)
        except Exception:
            return points

        if hist is not None and not hist.empty and "Close" in hist:
            for idx, row in hist.iterrows():
                ts = idx.tz_convert("UTC") if getattr(idx, "tzinfo", None) else idx.tz_localize("UTC")
                label = ts.strftime("%H:%M") if period in {"1d", "5d"} else ts.strftime("%Y-%m-%d")
                points.append({"t": label, "price": float(row["Close"])})

        _cache_set(cache_key, points, 60)
        return points


class KwayisiGhanaIntradayProvider:
    @staticmethod
    def fetch(symbol: str) -> List[Dict[str, Any]]:
        rows = _kwayisi_live_rows()
        row = next(
            (
                x
                for x in rows
                if isinstance(x, dict)
                and str(x.get("name") or x.get("symbol") or x.get("ticker") or "").upper() == symbol.upper()
            ),
            None,
        )
        if not row:
            return []

        price = _number(row.get("price"))
        change = _number(row.get("change"))
        prev_close = price - change
        now = datetime.now(timezone.utc)
        return [
            {"t": "09:00", "price": prev_close},
            {"t": now.strftime("%H:%M"), "price": price},
        ]


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


class FinnhubNewsProvider:
    BASE = "https://finnhub.io/api/v1"

    def __init__(self, api_key: Optional[str] = None):
        self.key = api_key or FINNHUB_KEY

    def _get(self, path: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.key:
            return []
        data = _request_json(f"{self.BASE}{path}", {**params, "token": self.key}) or []
        return [] if isinstance(data, dict) else data

    def general(self, limit: int = 20) -> List[Dict[str, Any]]:
        try:
            rows = self._get("/news", {"category": "general"})[:limit]
        except Exception:
            return []
        return [self._news_item(it) for it in rows]

    def company(self, symbol: str, days: int = 7, limit: int = 20) -> List[Dict[str, Any]]:
        to = datetime.now(timezone.utc).date()
        frm = to - timedelta(days=days)
        try:
            rows = self._get(
                "/company-news",
                {"symbol": symbol.upper(), "from": frm.isoformat(), "to": to.isoformat()},
            )[:limit]
        except Exception:
            return []
        return [self._news_item(it) for it in rows]

    @staticmethod
    def _news_item(it: Dict[str, Any]) -> Dict[str, Any]:
        ts = datetime.fromtimestamp(it.get("datetime", 0), tz=timezone.utc)
        nid = hashlib.md5((it.get("url") or it.get("headline", "")).encode("utf-8")).hexdigest()
        return {
            "id": nid,
            "source": it.get("source") or "Finnhub",
            "title": it.get("headline") or "",
            "url": it.get("url") or "",
            "published_at": ts,
        }


class RssNewsProvider:
    FEEDS: List[str] = []
    CACHE_PREFIX = "news:rss"

    def feeds(self, symbol: str = "") -> List[str]:
        return self.FEEDS

    def fetch(self, limit: int = 20, symbol: str = "") -> List[Dict[str, Any]]:
        cache_key = f"{self.CACHE_PREFIX}:v2:{symbol.upper() or 'general'}:{limit}"
        cached = _cache_get(cache_key)
        if cached is not None:
            return cached
        if feedparser is None:
            return []

        items: List[Dict[str, Any]] = []
        for url in self.feeds(symbol):
            try:
                response = _session.get(url, timeout=UPSTREAM_TIMEOUT)
                response.raise_for_status()
                feed = feedparser.parse(response.content)
                entries = getattr(feed, "entries", [])[: max(3, limit // 2)]
            except Exception:
                continue

            for entry in entries:
                title = getattr(entry, "title", "")
                link = getattr(entry, "link", "")
                if not title or not str(link).startswith(("http://", "https://")):
                    continue
                source = getattr(feed, "feed", {}).get("title", "RSS")
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    ts = datetime.fromtimestamp(time.mktime(entry.published_parsed), tz=timezone.utc)
                elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                    ts = datetime.fromtimestamp(time.mktime(entry.updated_parsed), tz=timezone.utc)
                else:
                    ts = datetime.now(timezone.utc)

                nid = hashlib.md5((link or title).encode("utf-8")).hexdigest()
                items.append(
                    {
                        "id": nid,
                        "source": source,
                        "title": title,
                        "url": link,
                        "published_at": ts,
                    }
                )

        items.sort(key=lambda x: x["published_at"], reverse=True)
        seen = set()
        out: List[Dict[str, Any]] = []
        for it in items:
            if it["id"] in seen:
                continue
            seen.add(it["id"])
            out.append(it)
            if len(out) >= limit:
                break

        _cache_set(cache_key, out, 5 * 60)
        return out


class InternationalRssNewsProvider(RssNewsProvider):
    CACHE_PREFIX = "news:international:rss"
    FEEDS = [
        "https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC&region=US&lang=en-US",
        "https://www.marketwatch.com/rss/topstories",
        "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    ]

    def feeds(self, symbol: str = "") -> List[str]:
        if symbol:
            return [
                f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol.upper()}&region=US&lang=en-US",
                *self.FEEDS,
            ]
        return self.FEEDS


class GhanaRssNewsProvider(RssNewsProvider):
    CACHE_PREFIX = "news:ghana:rss"
    FEEDS = [
        "https://www.graphic.com.gh/business-news.html?format=feed&type=rss",
        "https://www.ghanaweb.com/GhanaHomePage/business/rss/",
        "https://www.myjoyonline.com/business/feed/",
        "https://www.bog.gov.gh/category/news/feed/",
        "https://www.ghana-stock-exchange.com/feed/",
    ]


class SymbolsProvider:
    INTL = [
        {"symbol": "AAPL", "name": "Apple Inc."},
        {"symbol": "MSFT", "name": "Microsoft"},
        {"symbol": "NVDA", "name": "NVIDIA"},
        {"symbol": "TSLA", "name": "Tesla"},
        {"symbol": "AMZN", "name": "Amazon"},
    ]

    @classmethod
    def ghana(cls) -> List[Dict[str, str]]:
        rows = _kwayisi_equity_rows()
        out: List[Dict[str, str]] = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            symbol = str(row.get("symbol") or row.get("ticker") or row.get("name") or "").strip().upper()
            if not symbol:
                continue

            company = row.get("company") if isinstance(row.get("company"), dict) else {}
            display_name = (
                row.get("company_name")
                or company.get("name")
                or GHANA_NAME_OVERRIDES.get(symbol)
                or symbol
            )
            out.append({"symbol": symbol, "name": str(display_name)})

        return out or GHANA_DEFAULT_SYMBOLS

    @classmethod
    def list(cls, market: str) -> List[Dict[str, str]]:
        return cls.ghana() if market == "ghana" else cls.INTL
