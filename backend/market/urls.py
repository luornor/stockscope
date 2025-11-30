# market/urls.py
from django import views
from django.urls import path
from .views import (portfolio_sectors, quotes, intraday, news, symbols, watchlist_delete,
                    watchlist_list, watchlist_add, watchlist_delete,
                    portfolio_sectors, movers)

urlpatterns = [
    path("quotes", quotes),  # /api/quotes?market=international
    path("quotes/intraday", intraday),  # /api/quotes/intraday?symbol=TSLA&market=international&period=1d&interval=5m
    path("news", news),
    
    path("movers", movers),
    path("symbols", symbols),

    path("watchlist", watchlist_list),
    path("watchlist/add", watchlist_add),
    path("watchlist/<str:symbol>", watchlist_delete),

    path("portfolio/sectors", portfolio_sectors),
]
