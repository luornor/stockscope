from __future__ import annotations
from typing import List, Dict
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import WatchlistItem
from .serializers import (
    QuoteSerializer,IntradayPointSerializer,NewsItemSerializer,
    SymbolSerializer, WatchlistItemSerializer, SectorSliceSerializer
)
from .symbols import get_symbols_for_market

from .providers import (
    YahooIntradayProvider, KwayisiGhanaIntradayProvider,get_provider_for_market,
    FinnhubNewsProvider, GhanaRssNewsProvider,SymbolsProvider
)
from django.views.decorators.cache import cache_page

# market/views.py# ...
@api_view(["GET"])
@permission_classes([AllowAny])
def quotes(request):
    market = request.query_params.get("market", "international").lower()
    if market not in ("international", "ghana"):
        return Response({"detail": "market must be 'international' or 'ghana'."}, status=400)

    items = get_symbols_for_market(market)
    provider = get_provider_for_market(market)
    data = provider.fetch_many(items, market)

    ser = QuoteSerializer(data=[q.__dict__ for q in data], many=True)
    ser.is_valid(raise_exception=True)
    return Response(ser.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def intraday(request):
    """
    GET /api/quotes/intraday?symbol=TSLA&market=international&period=1d&interval=5m
    For Ghana: only period=1d supported (synthesized from live+prev close).
    Returns: [{t, price}, ...]
    """
    symbol = (request.query_params.get("symbol") or "").strip().upper()
    market = (request.query_params.get("market") or "international").lower()
    period = (request.query_params.get("period") or "1d").lower()
    interval = (request.query_params.get("interval") or "5m").lower()

    if not symbol:
        return Response({"detail": "symbol is required"}, status=status.HTTP_400_BAD_REQUEST)
    if market not in ("international", "ghana"):
        return Response({"detail": "market must be 'international' or 'ghana'."}, status=400)

    if market == "ghana":
        if period != "1d":
            return Response({"detail": "Ghana intraday currently supports only period=1d."}, status=400)
        points = KwayisiGhanaIntradayProvider.fetch(symbol)
    else:
        points = YahooIntradayProvider.fetch(symbol, period, interval)

    ser = IntradayPointSerializer(data=points, many=True)
    ser.is_valid(raise_exception=True)
    return Response(ser.data)



@api_view(["GET"])
@permission_classes([AllowAny])
@cache_page(30)  # cache for 30s to be polite to free APIs
def news(request):
    """
    GET /api/news?market=ghana|international&limit=20
    Optional: &symbol=AAPL  (only for international; company news)
    Returns [{id, source, title, url, published_at}]
    """
    market = (request.query_params.get("market") or "international").lower()
    limit = int(request.query_params.get("limit") or 20)
    symbol = (request.query_params.get("symbol") or "").strip().upper()

    if market not in ("ghana", "international"):
        return Response({"detail": "market must be 'ghana' or 'international'."}, status=400)

    items: List[Dict] = []
    if market == "ghana":
        items = GhanaRssNewsProvider().fetch(limit=limit)
    else:
        fin = FinnhubNewsProvider()
        if symbol:
            items = fin.company(symbol, days=7, limit=limit)
        else:
            items = fin.general(limit=limit)

    ser = NewsItemSerializer(data=items, many=True)
    ser.is_valid(raise_exception=True)
    return Response(ser.data)


def _pct(price, change):
    try:
        prev = price - change
        return 0.0 if prev == 0 else (change / prev) * 100.0
    except Exception:
        return 0.0

@api_view(["GET"])
@permission_classes([AllowAny])
@cache_page(10)
def movers(request):
    """GET /api/movers?market=ghana|international&limit=8"""
    market = (request.query_params.get("market") or "international").lower()
    limit = int(request.query_params.get("limit") or 8)
    if market not in ("ghana","international"):
        return Response({"detail":"market must be 'ghana' or 'international'."}, status=400)

    items = get_symbols_for_market(market)
    provider = get_provider_for_market(market)
    quotes = provider.fetch_many(items, market)

    # sort by absolute % change
    ranked = sorted(quotes, key=lambda q: abs(_pct(q.price, q.change)), reverse=True)[:limit]
    ser = QuoteSerializer(data=[q.__dict__ for q in ranked], many=True)
    ser.is_valid(raise_exception=True)
    return Response(ser.data)


@api_view(["GET"])
@permission_classes([AllowAny])
@cache_page(300)
def symbols(request):
    """GET /api/symbols?market=ghana|international"""
    market = (request.query_params.get("market") or "international").lower()
    if market not in ("ghana","international"):
        return Response({"detail":"market must be 'ghana' or 'international'."}, status=400)
    data = SymbolsProvider.list(market)
    ser = SymbolSerializer(data=data, many=True)
    ser.is_valid(raise_exception=True)
    return Response(ser.data)


# GET list (join with live quotes)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def watchlist_list(request):
    items = list(WatchlistItem.objects.filter(user=request.user).order_by("-created_at")
                 .values("symbol","name","market","created_at"))
    # fetch quotes grouped by market for efficiency
    grouped = {"ghana": [], "international": []}
    name_map = {}
    for it in items:
        grouped[it["market"]].append({"symbol": it["symbol"], "name": it["name"]})
        name_map[(it["market"], it["symbol"])] = it["name"]

    enriched = []
    for market, symbols in grouped.items():
        if not symbols: continue
        provider = get_provider_for_market(market)
        quotes = provider.fetch_many(symbols, market)
        for q in quotes:
            enriched.append({
                "symbol": q.symbol,
                "name": name_map[(market, q.symbol)],
                "market": market,
                "created_at": None,  # omit or fill separately if you need per-item created_at
                "price": q.price,
                "change": q.change,
                "volume": q.volume,
            })

    # You can also return plain watchlist items if you prefer; UI expects quotes anyway.
    return Response(enriched)

# POST add {symbol, name, market}
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def watchlist_add(request):
    data = {
        "symbol": (request.data.get("symbol") or "").strip().upper(),
        "name": request.data.get("name") or "",
        "market": (request.data.get("market") or "").lower(),
    }
    ser = WatchlistItemSerializer(data=data)
    ser.is_valid(raise_exception=True)
    if data["market"] not in ("ghana","international"):
        return Response({"detail":"market must be 'ghana' or 'international'."}, status=400)
    obj, _ = WatchlistItem.objects.get_or_create(
        user=request.user, symbol=data["symbol"], market=data["market"],
        defaults={"name": data["name"]}
    )
    return Response({"ok": True})

# DELETE /api/watchlist/:symbol?market=...
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def watchlist_delete(request, symbol: str):
    market = (request.query_params.get("market") or "").lower()
    if market not in ("ghana","international"):
        return Response({"detail":"market must be 'ghana' or 'international'."}, status=400)
    WatchlistItem.objects.filter(user=request.user, symbol=symbol.upper(), market=market).delete()
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def portfolio_sectors(request):
    """
    GET /api/portfolio/sectors
    Returns [{name, value}] sum=100
    TODO: Replace with real user holdings aggregation.
    """
    demo = [
        {"name":"Tech","value":38.0},
        {"name":"Finance","value":22.0},
        {"name":"Energy","value":9.0},
        {"name":"Health","value":12.0},
        {"name":"Consumer","value":19.0},
        ]
    ser = SectorSliceSerializer(data=demo, many=True)
    ser.is_valid(raise_exception=True)
    return Response(ser.data)
