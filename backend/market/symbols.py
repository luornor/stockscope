from __future__ import annotations

INTERNATIONAL_DEFAULT = [
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft"},
    {"symbol": "NVDA", "name": "NVIDIA"},
    {"symbol": "TSLA", "name": "Tesla"},
    {"symbol": "AMZN", "name": "Amazon"},
]

# Ghana: We’ll try Yahoo suffix discovery ⇒ MTNGH.GH, GCB.GH, etc.
GHANA_DEFAULT = [
    {"symbol": "MTNGH", "name": "MTN Ghana"},
    {"symbol": "GCB",   "name": "GCB Bank"},
    {"symbol": "CAL",   "name": "CAL Bank"},
    {"symbol": "SIC",   "name": "SIC Insurance"},
    {"symbol": "EGL",   "name": "Enterprise Group"},
]

def get_symbols_for_market(market: str):
    if market == "ghana":
        return GHANA_DEFAULT
    return INTERNATIONAL_DEFAULT
