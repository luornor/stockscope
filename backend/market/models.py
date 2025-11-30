from django.db import models
from django.conf import settings
from django.db.models import UniqueConstraint, Index
from django.db.models.functions import Lower

class WatchlistItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watchlist",
        db_index=True,
    )
    symbol = models.CharField(max_length=16)  # store UPPERCASE in code when saving
    name = models.CharField(max_length=128, blank=True, default="")
    market = models.CharField(
        max_length=32,
        choices=[("ghana", "ghana"), ("international", "international")],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            # case-insensitive uniqueness per user+market+symbol
            UniqueConstraint(
                Lower("symbol"), "user", "market",
                name="uniq_watchlist_user_market_symbol_ci",
            ),
        ]
        indexes = [
            Index(fields=["user", "market"]),
            Index(Lower("symbol"), name="watchlist_symbol_lower_idx"),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.market}:{self.symbol}"
